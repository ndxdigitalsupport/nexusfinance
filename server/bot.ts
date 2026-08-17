import TelegramBot from 'node-telegram-bot-api';
import { db } from './db.js';
import dotenv from 'dotenv';

dotenv.config();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!TOKEN) {
  console.log('  🤖 Telegram bot disabled — TELEGRAM_BOT_TOKEN not set');
}

const SITE_URL = process.env.SITE_URL || 'https://nexusfinancefintech.vercel.app';
const ADMIN_ID = parseInt(process.env.TELEGRAM_ADMIN_ID || '0', 10);

// Bot instance — null if token not set (commands won't register)
const bot = TOKEN ? new TelegramBot(TOKEN, { polling: true }) : null;

// ── Shared keyboards ──────────────────────────────────────────

const siteButton: TelegramBot.InlineKeyboardButton = { text: '🚀 Open NexusFinance', web_app: { url: SITE_URL } };

function adminMenu(): TelegramBot.SendMessageOptions {
  return {
    parse_mode: 'Markdown',
    reply_markup: { inline_keyboard: [[siteButton]] },
  };
}

function customerMenu(): TelegramBot.SendMessageOptions {
  return {
    parse_mode: 'Markdown',
    reply_markup: { inline_keyboard: [[siteButton]] },
  };
}

// ── Helpers ────────────────────────────────────────────────────

async function getLinkedUser(chatId: number) {
  const { data } = await db
    .from('nexus_users')
    .select('id, name, email, role')
    .eq('telegram_chat_id', String(chatId))
    .single();
  return data;
}

async function getAllLinkedUsers() {
  const { data } = await db
    .from('nexus_users')
    .select('id, name, email, telegram_chat_id')
    .not('telegram_chat_id', 'is', null);
  return data || [];
}

function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

// ── PAYMENT REMINDER LOGIC (exported for cron) ─────────────────

async function sendPaymentReminders(botInstance: TelegramBot | null, reportChatId?: number) {
  const { data: loans } = await db
    .from('nexus_loans')
    .select('id, applicantEmail, applicantName, amount, date, durationMonths, monthlyPayment')
    .in('status', ['approved', 'active', 'disbursed']);

  if (!loans || loans.length === 0) {
    if (reportChatId && botInstance) await botInstance.sendMessage(reportChatId, '📋 No active loans found.');
    return;
  }

  let remindersSent = 0;
  let usersNotified = 0;

  for (const loan of loans) {
    const dueDate = new Date(loan.date);
    dueDate.setMonth(dueDate.getMonth() + loan.durationMonths);
    const days = daysUntil(dueDate.toISOString());

    if (days > 7) continue;

    const { data: user } = await db
      .from('nexus_users')
      .select('telegram_chat_id')
      .eq('email', loan.applicantEmail)
      .not('telegram_chat_id', 'is', null)
      .single();

    if (!user?.telegram_chat_id) continue;

    let message: string;
    if (days < 0) {
      message = `🚨 *OVERDUE PAYMENT*\n\nLoan #${loan.id} — $${loan.amount?.toLocaleString()}\nDue date: ${formatDate(dueDate.toISOString())}\n⚠️ *${Math.abs(days)} days overdue*\n\nPlease make your payment as soon as possible.`;
    } else if (days === 0) {
      message = `🔴 *PAYMENT DUE TODAY*\n\nLoan #${loan.id} — $${loan.amount?.toLocaleString()}\nYour payment is due today. Please pay now to avoid late fees.`;
    } else {
      message = `⏰ *Payment Reminder*\n\nLoan #${loan.id} — $${loan.amount?.toLocaleString()}\n📅 Due: ${formatDate(dueDate.toISOString())}\n⏳ *${days} days remaining*\n\nYou can pay via the NexusFinance app.`;
    }

    try {
      if (botInstance) {
        await botInstance.sendMessage(user.telegram_chat_id, message, {
          parse_mode: 'Markdown',
          reply_markup: { inline_keyboard: [[siteButton]] },
        });
      }
      remindersSent++;
      usersNotified++;
    } catch (e) {
      console.error(`Failed to send reminder to ${loan.applicantEmail}:`, e);
    }
  }

  if (reportChatId && botInstance) {
    await botInstance.sendMessage(reportChatId,
      `✅ *Reminder check complete!*\n\n📨 Reminders sent: *${remindersSent}*\n👥 Users notified: *${usersNotified}*`,
      { parse_mode: 'Markdown' }
    );
  }
}

// ── Instant payment confirmation (called from PayWay callback) ──

async function sendPaymentConfirmation(chatId: string, data: { loanId: number; amount: number; tranId: string }) {
  if (!bot) return;
  try {
    await bot.sendMessage(chatId,
      `✅ *Payment Confirmed!*\n\nLoan #${data.loanId} — $${data.amount.toLocaleString()}\nTransaction: \`${data.tranId}\`\n\nThank you for your payment!`,
      {
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: [[siteButton]] },
      }
    );
  } catch (e) {
    console.error('Failed to send payment confirmation:', e);
  }
}

// ── Register commands (only if bot is active) ──────────────────

if (bot) {
  // ── /start ────────────────────────────────────────────────────

  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;

    if (userId === ADMIN_ID) {
      return bot.sendMessage(chatId,
`🤖 *NexusFinance Admin Bot*

Commands:
/stats — Platform statistics
/loans — Recent loan applications
/users — User list
/notifications — Latest notifications
/broadcast — Send message to all linked users
/send <email> — Send message to a specific user
/reminder-check — Manually trigger payment reminders
/help — This message`,
        adminMenu()
      );
    }

    const user = await getLinkedUser(chatId);
    if (user) {
      return bot.sendMessage(chatId,
`👋 Welcome back, *${user.name}*!

Commands:
/status — Check your loans & upcoming payments
/unlink — Disconnect your Telegram account
/help — This message`,
        customerMenu()
      );
    }

    bot.sendMessage(chatId,
`🤖 *Welcome to NexusFinance!*

Your Telegram account is not linked yet.

To link your account, type:
/link <your registered email>

Example: \`/link john@example.com\``,
      customerMenu()
    );
  });

  // ── /help ─────────────────────────────────────────────────────

  bot.onText(/\/help/, async (msg) => {
    const chatId = msg.chat.id;
    if (msg.from?.id === ADMIN_ID) {
      return bot.sendMessage(chatId,
`*Admin Commands:*
/stats — Platform statistics
/loans — Recent loan applications
/users — User list
/notifications — Latest notifications
/broadcast — Send message to all linked users
/send <email> — Send message to a specific user
/reminder-check — Manually trigger payment reminders`,
        adminMenu()
      );
    }

    const user = await getLinkedUser(chatId);
    if (user) {
      return bot.sendMessage(chatId,
`*Commands:*
/status — Check your loans & upcoming payments
/unlink — Disconnect your Telegram account
/help — This message`,
        customerMenu()
      );
    }

    bot.sendMessage(chatId,
`*Commands:*
/link <email> — Link your Telegram to your NexusFinance account
/help — This message`,
      customerMenu()
    );
  });

  // ── /link <email> ────────────────────────────────────────────

  bot.onText(/\/link(?:\s+(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const email = match?.[1]?.trim();

    if (!email) {
      return bot.sendMessage(chatId,
        '📧 Please provide your registered email.\n\nUsage: `/link your@email.com`',
        { parse_mode: 'Markdown' }
      );
    }

    if (!email.includes('@')) {
      return bot.sendMessage(chatId, '❌ That doesn\'t look like a valid email address.');
    }

    const existing = await getLinkedUser(chatId);
    if (existing) {
      return bot.sendMessage(chatId,
        `⚠️ This Telegram is already linked to *${existing.name}* (${existing.email}).\n\nUse /unlink first if you want to switch.`,
        { parse_mode: 'Markdown' }
      );
    }

    const { data: user, error } = await db
      .from('nexus_users')
      .select('id, name, email, telegram_chat_id')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !user) {
      return bot.sendMessage(chatId,
        '❌ No account found with that email.\n\nPlease check your email and try again.'
      );
    }

    if (user.telegram_chat_id) {
      return bot.sendMessage(chatId,
        '⚠️ This email is already linked to another Telegram account.\n\nPlease unlink from the other account first, or contact support.'
      );
    }

    const { error: updateError } = await db
      .from('nexus_users')
      .update({ telegram_chat_id: String(chatId) })
      .eq('id', user.id);

    if (updateError) {
      console.error('Link error:', updateError);
      return bot.sendMessage(chatId, '❌ Failed to link account. Please try again later.');
    }

    bot.sendMessage(chatId,
      `✅ *Account linked successfully!*\n\nWelcome, *${user.name}*! You'll now receive payment reminders and updates here.`,
      customerMenu()
    );
  });

  // ── /unlink ───────────────────────────────────────────────────

  bot.onText(/\/unlink/, async (msg) => {
    const chatId = msg.chat.id;
    const user = await getLinkedUser(chatId);

    if (!user) {
      return bot.sendMessage(chatId, '⚠️ Your Telegram is not linked to any account.');
    }

    const { error } = await db
      .from('nexus_users')
      .update({ telegram_chat_id: null })
      .eq('id', user.id);

    if (error) {
      console.error('Unlink error:', error);
      return bot.sendMessage(chatId, '❌ Failed to unlink. Please try again later.');
    }

    bot.sendMessage(chatId, `✅ Account *${user.email}* has been unlinked from this Telegram.`, {
      parse_mode: 'Markdown',
    });
  });

  // ── /status (customer) ────────────────────────────────────────

  bot.onText(/\/status/, async (msg) => {
    const chatId = msg.chat.id;
    const user = await getLinkedUser(chatId);

    if (!user) {
      return bot.sendMessage(chatId,
        '⚠️ Your Telegram is not linked.\n\nUse `/link <email>` to connect your account.',
        { parse_mode: 'Markdown' }
      );
    }

    const { data: loans } = await db
      .from('nexus_loans')
      .select('id, amount, status, date, durationMonths, monthlyPayment, applicantName')
      .eq('applicantEmail', user.email)
      .in('status', ['approved', 'active', 'disbursed'])
      .order('date', { ascending: false });

    if (!loans || loans.length === 0) {
      return bot.sendMessage(chatId,
        `📋 *Your Loans*\n\nNo active loans found for *${user.name}*.`,
        customerMenu()
      );
    }

    const lines = loans.map((l: any) => {
      const dueDate = new Date(l.date);
      dueDate.setMonth(dueDate.getMonth() + l.durationMonths);
      const days = daysUntil(dueDate.toISOString());
      const dueStr = formatDate(dueDate.toISOString());
      const daysText = days < 0
        ? `⚠️ *OVERDUE* by ${Math.abs(days)} days`
        : days === 0
          ? '🔴 *DUE TODAY*'
          : days <= 7
            ? `⏰ Due in *${days}* days`
            : `📅 Due ${dueStr}`;

      return `  • Loan #${l.id} — $${l.amount?.toLocaleString()} — *${l.status}*\n    ${daysText}`;
    });

    bot.sendMessage(chatId,
      `📋 *Your Loans (${loans.length} active)*\n\n${lines.join('\n\n')}`,
      customerMenu()
    );
  });

  // ── ADMIN: /broadcast ─────────────────────────────────────────

  bot.onText(/\/broadcast(?:\s+([\s\S]+))?/, async (msg, match) => {
    if (msg.from?.id !== ADMIN_ID) return;
    const chatId = msg.chat.id;
    const text = match?.[1]?.trim();

    if (!text) {
      return bot.sendMessage(chatId,
        '📢 Please provide a message to broadcast.\n\nUsage: `/broadcast Your message here`',
        { parse_mode: 'Markdown' }
      );
    }

    const users = await getAllLinkedUsers();
    if (users.length === 0) {
      return bot.sendMessage(chatId, '⚠️ No linked users found. Nobody to broadcast to.');
    }

    let sent = 0;
    let failed = 0;

    for (const user of users) {
      try {
        await bot.sendMessage(user.telegram_chat_id,
          `📢 *NexusFinance Update*\n\n${text}`,
          { parse_mode: 'Markdown' }
        );
        sent++;
      } catch (e) {
        failed++;
      }
    }

    bot.sendMessage(chatId,
      `✅ Broadcast complete!\n\n📨 Sent: *${sent}*\n❌ Failed: *${failed}*\n👥 Total linked users: *${users.length}*`,
      { parse_mode: 'Markdown' }
    );
  });

  // ── ADMIN: /send <email> <message> ───────────────────────────

  bot.onText(/\/send\s+(\S+)\s+([\s\S]+)/, async (msg, match) => {
    if (msg.from?.id !== ADMIN_ID) return;
    const chatId = msg.chat.id;
    const email = match?.[1]?.trim();
    const text = match?.[2]?.trim();

    if (!email || !text) {
      return bot.sendMessage(chatId,
        'Usage: `/send user@email.com Your message here`',
        { parse_mode: 'Markdown' }
      );
    }

    const { data: user } = await db
      .from('nexus_users')
      .select('name, telegram_chat_id')
      .eq('email', email.toLowerCase())
      .single();

    if (!user || !user.telegram_chat_id) {
      return bot.sendMessage(chatId, `❌ No linked Telegram account found for *${email}*`, {
        parse_mode: 'Markdown',
      });
    }

    try {
      await bot.sendMessage(user.telegram_chat_id,
        `📩 *Message from NexusFinance Admin*\n\n${text}`,
        { parse_mode: 'Markdown' }
      );
      bot.sendMessage(chatId, `✅ Message sent to *${user.name}* (${email})`, {
        parse_mode: 'Markdown',
      });
    } catch (e) {
      bot.sendMessage(chatId, `❌ Failed to send message to *${email}*`, {
        parse_mode: 'Markdown',
      });
    }
  });

  // ── ADMIN: /reminder-check ────────────────────────────────────

  bot.onText(/\/reminder-check/, async (msg) => {
    if (msg.from?.id !== ADMIN_ID) return;
    const chatId = msg.chat.id;
    await sendPaymentReminders(bot, chatId);
  });

  // ── ADMIN: /stats, /loans, /users, /notifications ────────────

  // Bot runs in the same process as the API server — always call localhost
  const API = `http://localhost:${process.env.PORT || 3001}/api`;
  let apiToken: string | null = null;
  let apiTokenExpiry = 0;

  async function loginAsAdmin() {
    try {
      const loginRes = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@nexus.com', password: 'password123' }),
      });
      if (!loginRes.ok) {
        console.error('Bot admin login failed:', loginRes.status, loginRes.statusText);
        return;
      }
      const data = await loginRes.json();
      if (data.token) {
        apiToken = data.token;
        apiTokenExpiry = Date.now() + 6 * 60 * 60 * 1000; // JWT typically 24h, re-login every 6h
      }
    } catch (e) {
      console.error('Bot admin login failed:', e);
      setTimeout(() => { apiToken = null; loginAsAdmin(); }, 5000);
    }
  }

  async function ensureApiToken() {
    if (!apiToken || Date.now() > apiTokenExpiry) await loginAsAdmin();
  }

  async function apiGet(path: string) {
    await ensureApiToken();
    if (!apiToken) return null;
    try {
      const res = await fetch(`${API}${path}`, {
        headers: { Authorization: `Bearer ${apiToken}` },
      });
      return await res.json();
    } catch {
      return null;
    }
  }

  bot.onText(/\/stats/, async (msg) => {
    if (msg.from?.id !== ADMIN_ID) return;
    const data = await apiGet('/stats');
    if (!data) return bot.sendMessage(msg.chat.id, '❌ Failed to fetch stats.', adminMenu());
    bot.sendMessage(msg.chat.id,
`📊 *Platform Statistics*

• Total Volume: *$${data.totalVolume?.toLocaleString() || 0}*
• Active Customers: *${data.activeCustomers || 0}*
• Outstanding: *$${data.outstandingBalanceValue?.toLocaleString() || 0}*
• Interest Earned: *$${data.interestEarned?.toLocaleString() || 0}*`,
      adminMenu()
    );
  });

  bot.onText(/\/loans/, async (msg) => {
    if (msg.from?.id !== ADMIN_ID) return;
    const loans = await apiGet('/loans');
    if (!loans || loans.length === 0) return bot.sendMessage(msg.chat.id, '❌ No loans found.', adminMenu());
    const lines = loans.slice(0, 10).map((l: any) =>
      `  • #${l.id} — ${l.applicantName} — *${l.status}* — $${l.amount?.toLocaleString()}`
    );
    bot.sendMessage(msg.chat.id,
`📋 *Recent Loans (${loans.length} total)*

${lines.join('\n')}`,
      adminMenu()
    );
  });

  bot.onText(/\/users/, async (msg) => {
    if (msg.from?.id !== ADMIN_ID) return;
    const users = await apiGet('/users');
    if (!users || users.length === 0) return bot.sendMessage(msg.chat.id, '❌ No users found.', adminMenu());
    const lines = users.map((u: any) => {
      const linked = u.telegram_chat_id ? ' 📱' : '';
      return `  • ${u.name} — *${u.role}* — ${u.email}${linked}`;
    });
    bot.sendMessage(msg.chat.id,
`👥 *Users (${users.length})*

${lines.join('\n')}`,
      adminMenu()
    );
  });

  bot.onText(/\/notifications/, async (msg) => {
    if (msg.from?.id !== ADMIN_ID) return;
    const notifs = await apiGet('/notifications');
    if (!notifs || notifs.length === 0) return bot.sendMessage(msg.chat.id, '❌ No notifications.', adminMenu());
    const lines = notifs.slice(0, 5).map((n: any) =>
      `  ${n.unread ? '🟢' : '⚪'} ${n.text}`
    );
    bot.sendMessage(msg.chat.id,
`🔔 *Recent Notifications*

${lines.join('\n')}`,
      adminMenu()
    );
  });

  // ── Initialize admin session ──────────────────────────────────

  loginAsAdmin();

  console.log('  🤖 Telegram bot started');
}

export default bot;
export { sendPaymentReminders, sendPaymentConfirmation };
