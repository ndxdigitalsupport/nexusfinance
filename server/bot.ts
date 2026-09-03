import TelegramBot from 'node-telegram-bot-api';
import { db } from './db.js';
import { sendOtpEmail } from './brevo.js';
import { createOtpForUserByPhone, verifyOtpForUserByPhone } from './otp.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!TOKEN) {
  console.log('  🤖 Telegram bot disabled — TELEGRAM_BOT_TOKEN not set');
}

const SITE_URL = 'https://nexusfinancefintech.vercel.app';
const ADMIN_ID = parseInt(process.env.TELEGRAM_ADMIN_ID || '0', 10);

export let notifyUserCallback: ((userId: number, text: string) => void) | null = null;
export function setNotifyUserCallback(cb: (userId: number, text: string) => void) {
  notifyUserCallback = cb;
}

// Pending account-link verification codes (keyed by Telegram chat id)
const linkCodes = new Map<number, { email: string; code: string; expiresAt: number }>();
const LINK_CODE_TTL_MS = 10 * 60 * 1000;

// ── Monthly installment helpers ──────────────────────────────

// Same amortization formula used by the loan calculator (APR 5.4%)
function monthlyPaymentFor(amount: number, durationMonths: number, annualRate = 0.054): number {
  if (durationMonths <= 0) return amount;
  const r = annualRate / 12;
  const n = durationMonths;
  if (r === 0) return amount / n;
  return (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function installmentDates(dateStr: string, durationMonths: number): Date[] {
  const dates: Date[] = [];
  const start = new Date(dateStr);
  for (let m = 1; m <= durationMonths; m++) {
    const d = new Date(start);
    d.setMonth(d.getMonth() + m);
    dates.push(d);
  }
  return dates;
}

// Bot instance — null if token not set (commands won't register)
const bot = TOKEN && process.env.DISABLE_TELEGRAM_POLLING !== 'true' && !process.env.VERCEL
  ? new TelegramBot(TOKEN, { polling: true })
  : null;

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

function renderTemplate(template: string, vars: Record<string, string>): string {
  let rendered = template;
  for (const [key, val] of Object.entries(vars)) {
    rendered = rendered.replace(new RegExp(`{${key}}`, 'g'), val);
  }
  return rendered;
}

// ── PAYMENT REMINDER LOGIC (exported for cron) ─────────────────

async function sendPaymentReminders(botInstance: TelegramBot | null, reportChatId?: number) {
  const activeBot = botInstance !== undefined ? botInstance : bot;

  // 1. Fetch active settings rules
  const { data: settings, error: settingsError } = await db
    .from('nexus_reminder_settings')
    .select('*')
    .eq('is_active', true);

  if (settingsError) {
    console.error('Failed to load reminder settings:', settingsError);
    if (reportChatId && activeBot) {
      await activeBot.sendMessage(reportChatId, `❌ *Error checking reminders*: Failed to load settings.`);
    }
    return;
  }

  // 2. Fetch active/disbursed loans
  const { data: loans, error: loansError } = await db
    .from('nexus_loans')
    .select('id, applicantEmail, applicantName, amount, date, durationMonths')
    .in('status', ['approved', 'Approved', 'active', 'Active', 'disbursed', 'Disbursed']);

  if (loansError) {
    console.error('Failed to load loans:', loansError);
    if (reportChatId && activeBot) {
      await activeBot.sendMessage(reportChatId, `❌ *Error checking reminders*: Failed to load loans.`);
    }
    return;
  }

  if (!loans || loans.length === 0) {
    if (reportChatId && activeBot) {
      await activeBot.sendMessage(reportChatId, '📋 *Reminder check complete:* No active loans found.');
    }
    return;
  }

  // Fetch config for grace period and late penalty calculations
  const { data: config } = await db.from('nexus_config').select('*').eq('id', 1).maybeSingle();
  const gracePeriod = config?.grace_period_days !== undefined ? Number(config.grace_period_days) : 3;
  const latePenaltyDaily = config?.late_penalty_daily !== undefined ? Number(config.late_penalty_daily) : 0;

  let remindersSent = 0;
  let usersNotified = 0;

  for (const loan of loans) {
    const amount = Number(loan.amount) || 0;
    const duration = Number(loan.durationMonths) || 1;
    const monthly = monthlyPaymentFor(amount, duration);
    const installments = installmentDates(loan.date, duration);

    // Fetch user details (internal id and telegram chat id)
    const { data: user } = await db
      .from('nexus_users')
      .select('id, telegram_chat_id')
      .eq('email', loan.applicantEmail)
      .maybeSingle();

    if (!user) continue;

    // Track if we sent an overdue notification for this loan during this sweep
    // to avoid sending multiple overdue alerts if multiple installments are overdue.
    let overdueAlertSentForLoan = false;
    let userNotifiedForThisLoan = false;

    for (const due of installments) {
      const days = daysUntil(due.toISOString());

      // Find matching settings rules
      for (const setting of settings || []) {
        let isMatch = false;

        if (setting.days_before > 0 && days === setting.days_before) {
          isMatch = true;
        } else if (setting.days_before === 0 && days === 0) {
          isMatch = true;
        } else if (setting.days_before < 0 && days < 0) {
          // Overdue rule (represented by negative days_before, e.g. -1)
          // Only send if we haven't sent an overdue alert for this loan in this sweep
          if (!overdueAlertSentForLoan) {
            isMatch = true;
            overdueAlertSentForLoan = true;
          }
        }

        if (!isMatch) continue;

        // Calculate late penalty fee
        const overdueDays = Math.max(0, -days);
        const penaltyDays = Math.max(0, overdueDays - gracePeriod);
        const penaltyFee = penaltyDays * latePenaltyDaily;
        const totalDue = monthly + penaltyFee;

        // Render message
        const cleanLoanId = String(loan.id).startsWith('#') ? String(loan.id).substring(1) : String(loan.id);
        const vars = {
          loan_id: cleanLoanId,
          amount: `$${monthly.toFixed(0)}`,
          due_date: formatDate(due.toISOString()),
          days_remaining: String(days),
          days_overdue: String(Math.abs(days)),
          customer_name: loan.applicantName,
          penalty_fee: `$${penaltyFee.toFixed(0)}`,
          total_due: `$${totalDue.toFixed(0)}`,
          grace_period: String(gracePeriod)
        };

        const renderedMessage = renderTemplate(setting.message_template, vars);

        // Send channels
        let sentTelegram = false;
        let sentInApp = false;

        const channel = setting.channel || 'both';

        // 1. Telegram
        if ((channel === 'telegram' || channel === 'both') && user.telegram_chat_id) {
          try {
            if (activeBot) {
              await activeBot.sendMessage(user.telegram_chat_id, renderedMessage, {
                parse_mode: 'Markdown',
                reply_markup: { inline_keyboard: [[siteButton]] }
              });
              sentTelegram = true;
            }
          } catch (err) {
            console.error(`Failed to send Telegram reminder to ${loan.applicantEmail}:`, err);
          }
        }

        // 2. In-App Notification
        if (channel === 'in_app' || channel === 'both') {
          try {
            if (notifyUserCallback) {
              notifyUserCallback(user.id, renderedMessage);
              sentInApp = true;
            }
          } catch (err) {
            console.error(`Failed to send In-App reminder to ${loan.applicantEmail}:`, err);
          }
        }

        let status = 'failed';
        let errorMessage = null;

        if (sentTelegram || sentInApp) {
          status = 'success';
          remindersSent++;
          if (!userNotifiedForThisLoan) {
            usersNotified++;
            userNotifiedForThisLoan = true;
          }
        } else {
          if ((channel === 'telegram' || channel === 'both') && !user.telegram_chat_id) {
            errorMessage = 'Telegram account not linked.';
          } else {
            errorMessage = 'Channel dispatch failed or unavailable.';
          }
        }

        try {
          await db.from('nexus_reminder_logs').insert({
            loan_id: loan.id,
            customer_name: loan.applicantName,
            rule_name: setting.name,
            message: renderedMessage,
            channel: channel,
            status: status,
            error_message: errorMessage
          });
        } catch (logErr) {
          console.error('Failed to write nexus_reminder_logs:', logErr);
        }
      }
    }
  }

  let enableReports = true;
  let targetChatId = reportChatId;

  try {
    const { data: config } = await db.from('nexus_config').select('telegram_admin_id, enable_admin_reports').eq('id', 1).single();
    if (config) {
      enableReports = config.enable_admin_reports !== false;
      if (config.telegram_admin_id) {
        targetChatId = parseInt(config.telegram_admin_id, 10);
      }
    }
  } catch (err) {
    console.warn('Failed to load admin report settings from nexus_config:', err);
  }

  if (enableReports && targetChatId && activeBot) {
    await activeBot.sendMessage(targetChatId,
      `✅ *Reminder check complete!*\n\n📨 Reminders sent: *${remindersSent}*\n👥 Users notified: *${usersNotified}*`,
      { parse_mode: 'Markdown' }
    );
  }
}

// ── Instant payment confirmation (called from PayWay callback) ──

async function sendPaymentConfirmation(chatId: string, data: { loanId: string | number; amount: number; tranId: string }) {
  if (!bot) return;
  try {
    const cleanId = String(data.loanId).startsWith('#') ? String(data.loanId).substring(1) : String(data.loanId);
    await bot.sendMessage(chatId,
      `✅ *Payment Confirmed!*\n\nLoan #${cleanId} — $${data.amount.toLocaleString()}\nTransaction: \`${data.tranId}\`\n\nThank you for your payment!`,
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
  // Pending phone-sharing linkage (chatId → dbUserId string)
  const pendingLinkages = new Map<number, string>();

  // Pending password change OTP codes (chatId → { email, phone, expiresAt, verified })
  const pendingPasswordOtp = new Map<number, { email: string; phone: string; expiresAt: number; verified: boolean }>();
  const PASSWORD_OTP_TTL_MS = 10 * 60 * 1000;

  // Pending phone change OTP codes (chatId → { userId: string, newPhone: string, expiresAt: number })
  const pendingPhoneChangeOtp = new Map<number, { userId: string; newPhone: string; expiresAt: number }>();
  const PHONE_CHANGE_OTP_TTL_MS = 10 * 60 * 1000;

  // ── /start ────────────────────────────────────────────────────

  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;
    const text = msg.text || '';
    
    // Check if start command has a parameter (e.g. /start 12 or /start changepassword)
    const matchStart = text.match(/\/start\s+(\d+)/);
    const matchStartStr = text.match(/\/start\s+(\w+)/);
    const startParam = matchStart ? matchStart[1] : null;
    const startStr = matchStartStr ? matchStartStr[1] : null;

    // Handle /start phonechange_{userId}_{phone}
    const matchPhoneChange = text.match(/\/start\s+phonechange_(\d+)_(.+)/);
    if (matchPhoneChange) {
      const targetUserId = matchPhoneChange[1];
      const newPhone = decodeURIComponent(matchPhoneChange[2]);

      // Validate phone format
      if (!/^\+\d{9,15}$/.test(newPhone)) {
        return bot.sendMessage(chatId, '❌ Invalid phone number format. Expected + followed by 9-15 digits.');
      }

      // Check if this Telegram account is linked to the user
      const user = await getLinkedUser(chatId);
      if (!user || user.id.toString() !== targetUserId) {
        return bot.sendMessage(chatId,
          '⚠️ This Telegram account is not linked to the requested NexusFinance account.\n\nUse `/link <email>` to connect first.',
          { parse_mode: 'Markdown' }
        );
      }

      // Check if phone is already used by another account
      const { data: existing } = await db.from('nexus_users').select('id').eq('phone', newPhone).neq('id', targetUserId).single();
      if (existing) {
        return bot.sendMessage(chatId, '❌ This phone number is already linked to another account. Please choose a different number.');
      }

      // Send OTP to new phone
      const { success, telegramSent, smsSent } = await createOtpForUserByPhone(newPhone);
      if (!success) {
        return bot.sendMessage(chatId, `❌ Failed to send OTP. ${!telegramSent ? 'Telegram failed. ' : ''}${!smsSent ? 'SMS failed.' : ''} Please try again.`);
      }

      pendingPhoneChangeOtp.set(chatId, {
        userId: targetUserId,
        newPhone,
        expiresAt: Date.now() + PHONE_CHANGE_OTP_TTL_MS,
      });

      return bot.sendMessage(chatId,
        `📱 *Phone Number Change*\n\nA 6-digit OTP has been sent to the new number: ${newPhone}\n\n*Reply with the code* here to verify and update your phone number.\n\nCode expires in 10 minutes.`,
        { parse_mode: 'Markdown' }
      );
    }

    // Handle /start changepassword — redirect to /changepassword flow
    if (startStr === 'changepassword') {
      // Trigger the same logic as /changepassword
      const user = await getLinkedUser(chatId);
      if (!user) {
        return bot.sendMessage(chatId,
          '⚠️ Your Telegram is not linked to any NexusFinance account.\n\nUse `/link <email>` to connect first.',
          { parse_mode: 'Markdown' }
        );
      }
      const { data: fullUser } = await db
        .from('nexus_users')
        .select('phone')
        .eq('id', user.id)
        .single();
      const phone = fullUser?.phone;
      if (!phone) {
        return bot.sendMessage(chatId, '❌ No phone number found on your account. Please update your profile on the website first.');
      }
      const { success, telegramSent, smsSent } = await createOtpForUserByPhone(phone);
      if (!success) {
        return bot.sendMessage(chatId, `❌ Failed to send OTP. ${!telegramSent ? 'Telegram failed. ' : ''}${!smsSent ? 'SMS failed.' : ''} Please try again.`);
      }
      pendingPasswordOtp.set(chatId, {
        email: user.email,
        phone: phone,
        expiresAt: Date.now() + PASSWORD_OTP_TTL_MS,
        verified: false,
      });
      return bot.sendMessage(chatId,
        `🔐 *Password Change*\n\nA 6-digit OTP has been sent to your Telegram and SMS.\n\n*Reply with the code* here to verify your identity.\n\nCode expires in 10 minutes.`,
        { parse_mode: 'Markdown' }
      );
    }

    if (startParam) {
      pendingLinkages.set(chatId, startParam);
      return bot.sendMessage(chatId,
`🤖 *NexusFinance Account Link*

Welcome to NexusFinance! Click the button below to share your phone number and activate your website account:`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{
                text: '📱 Share Phone Number to Link',
                web_app: {
                  url: `${SITE_URL}/tg-share-phone`
                }
              }]
            ]
          }
        }
      );
    }

    if (userId === ADMIN_ID) {
      const user = await getLinkedUser(chatId);
      if (!user) {
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
/help — This message

💡 *Note*: To link this Telegram to a website customer account, click the button below.`,
          {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{
                  text: '📱 Share Phone Number to Link',
                  web_app: {
                    url: 'https://nexusfinancefintech.vercel.app/tg-share-phone'
                  }
                }]
              ]
            }
          }
        );
      }
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
/changepassword — Change password via Telegram OTP
/unlink — Disconnect your Telegram account
/help — This message`,
        customerMenu()
      );
    }

    bot.sendMessage(chatId,
`🤖 *Welcome to NexusFinance!*

Your Telegram account is not linked yet.

To link your account, share your phone number using the button below, or use the email link command:
1. Type: /link <your registered email>
2. A code is emailed to you
3. Type: /confirm <code>

Example: \`/link john@example.com\``,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{
              text: '📱 Share Phone Number to Link',
              web_app: {
                url: 'https://nexusfinancefintech.vercel.app/tg-share-phone'
              }
            }]
          ]
        }
      }
    );
  });

  // ── /help ─────────────────────────────────────────────────────

  bot.onText(/\/help/, async (msg) => {
    const chatId = msg.chat.id;
    if (msg.from?.id === ADMIN_ID) {
      const user = await getLinkedUser(chatId);
      if (!user) {
        return bot.sendMessage(chatId,
`*Admin Commands:*
/stats — Platform statistics
/loans — Recent loan applications
/users — User list
/notifications — Latest notifications
/broadcast — Send message to all linked users
/send <email> — Send message to a specific user
/reminder-check — Manually trigger payment reminders

💡 *Note*: To link this Telegram to a website customer account, click the button below.`,
          {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{
                  text: '📱 Share Phone Number to Link',
                  web_app: {
                    url: 'https://nexusfinancefintech.vercel.app/tg-share-phone'
                  }
                }]
              ]
            }
          }
        );
      }
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
/changepassword — Change password via Telegram OTP
/unlink — Disconnect your Telegram account
/help — This message`,
        customerMenu()
      );
    }

    bot.sendMessage(chatId,
`*Commands:*
/link <email> — Link your Telegram to your NexusFinance account
/confirm <code> — Complete linking with the emailed code
/help — This message

You can also link automatically by sharing your phone number using the button below.`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{
              text: '📱 Share Phone Number to Link',
              web_app: {
                url: 'https://nexusfinancefintech.vercel.app/tg-share-phone'
              }
            }]
          ]
        }
      }
    );
  });

  // ── /link <email> ────────────────────────────────────────────

  bot.onText(/\/link(?:\s+(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const email = match?.[1]?.trim()?.toLowerCase();

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

    const { data: user } = await db
      .from('nexus_users')
      .select('id, name, email, telegram_chat_id')
      .eq('email', email)
      .maybeSingle();

    if (!user) {
      return bot.sendMessage(chatId,
        '❌ No account found with that email.\n\nPlease check your email and try again.'
      );
    }

    if (user.telegram_chat_id) {
      return bot.sendMessage(chatId,
        '⚠️ This email is already linked to another Telegram account.\n\nPlease unlink from the other account first, or contact support.'
      );
    }

    // Generate + email a one-time verification code
    const code = String(crypto.randomInt(100000, 1000000));
    linkCodes.set(chatId, { email: user.email, code, expiresAt: Date.now() + LINK_CODE_TTL_MS });
    try {
      await sendOtpEmail(user.email, code);
    } catch (err) {
      console.error('Failed to email link code:', err);
      linkCodes.delete(chatId);
      return bot.sendMessage(chatId,
        '❌ Failed to send the verification code. Please try again later.'
      );
    }

    bot.sendMessage(chatId,
      `🔐 *Verify your account*\n\nI found the account for *${user.name}* (${user.email}).\n\nA 6-digit code was sent to that email. Reply with:\n\n/confirm <code>\n\nCode expires in 10 minutes.`,
      { parse_mode: 'Markdown' }
    );
  });

  // ── /confirm <code> — completes the account link ──────────────

  bot.onText(/\/confirm(?:\s+(\d+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const code = match?.[1]?.trim();

    if (!code) {
      return bot.sendMessage(chatId, '🔐 Enter the code you received by email.\n\nUsage: `/confirm 123456`', {
        parse_mode: 'Markdown',
      });
    }

    const pending = linkCodes.get(chatId);
    if (!pending) {
      return bot.sendMessage(chatId,
        '❌ No pending verification found.\n\nRun `/link <email>` first to request a code.',
        { parse_mode: 'Markdown' }
      );
    }
    if (Date.now() > pending.expiresAt) {
      linkCodes.delete(chatId);
      return bot.sendMessage(chatId, '❌ That code has expired.\n\nRun `/link <email>` again for a new code.');
    }
    if (code !== pending.code) {
      return bot.sendMessage(chatId, '❌ Incorrect code. Please check your email and try again.');
    }

    const { data: user } = await db
      .from('nexus_users')
      .select('id, name, email, telegram_chat_id')
      .eq('email', pending.email)
      .maybeSingle();

    if (!user) {
      linkCodes.delete(chatId);
      return bot.sendMessage(chatId, '❌ Account no longer found. Please try /link again.');
    }
    if (user.telegram_chat_id && user.telegram_chat_id !== String(chatId)) {
      linkCodes.delete(chatId);
      return bot.sendMessage(chatId,
        '⚠️ This email is already linked to another Telegram account.\n\nPlease unlink from the other account first.'
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

    linkCodes.delete(chatId);
    bot.sendMessage(chatId,
      `✅ *Account linked successfully!*\n\nWelcome, *${user.name}*! You'll now receive payment reminders and updates here.`,
      customerMenu()
    );
  });

  // ── /changepassword ────────────────────────────────────────────

  // Trigger password change via Telegram OTP
  bot.onText(/\/changepassword/, async (msg) => {
    const chatId = msg.chat.id;
    const user = await getLinkedUser(chatId);

    if (!user) {
      return bot.sendMessage(chatId,
        '⚠️ Your Telegram is not linked to any NexusFinance account.\n\nUse `/link <email>` to connect first.',
        { parse_mode: 'Markdown' }
      );
    }

    // Fetch phone from DB
    const { data: fullUser } = await db
      .from('nexus_users')
      .select('phone')
      .eq('id', user.id)
      .single();

    const phone = fullUser?.phone;
    if (!phone) {
      return bot.sendMessage(chatId, '❌ No phone number found on your account. Please update your profile on the website first.');
    }

    // Send OTP via Telegram (and SMS fallback)
    const { success, telegramSent, smsSent } = await createOtpForUserByPhone(phone);

    if (!success) {
      return bot.sendMessage(chatId, `❌ Failed to send OTP. ${!telegramSent ? 'Telegram failed. ' : ''}${!smsSent ? 'SMS failed.' : ''} Please try again.`);
    }

    // Store the pending OTP verification
    pendingPasswordOtp.set(chatId, {
      email: user.email,
      phone: phone,
      expiresAt: Date.now() + PASSWORD_OTP_TTL_MS,
      verified: false,
    });

    bot.sendMessage(chatId,
      `🔐 *Password Change*\n\nA 6-digit OTP has been sent to your Telegram and SMS.\n\n*Reply with the code* here to verify your identity.\n\nCode expires in 10 minutes.`,
      { parse_mode: 'Markdown' }
    );
  });

  // ── Handle OTP codes and new passwords from Telegram ───────────

  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text || '';

    // Ignore commands (messages starting with /)
    if (text?.startsWith('/')) return;

    // Check for phone change OTP pending
    const pendingPhone = pendingPhoneChangeOtp.get(chatId);
    if (pendingPhone) {
      // Check if code has expired
      if (Date.now() > pendingPhone.expiresAt) {
        pendingPhoneChangeOtp.delete(chatId);
        return bot.sendMessage(chatId, '❌ Code has expired. Please start the phone change process again from the website.');
      }

      // Expect a 6-digit OTP code
      const codeMatch = text.match(/^(\d{6})$/);
      if (!codeMatch) {
        return bot.sendMessage(chatId, '⚠️ Please enter the 6-digit OTP code sent to your new phone number.');
      }

      const { success, error } = await verifyOtpForUserByPhone(pendingPhone.newPhone, codeMatch[1]);

      if (!success) {
        // DON'T delete — let user retry
        return bot.sendMessage(chatId, `❌ ${error || 'Invalid code.'} Please try again.`, { parse_mode: 'Markdown' });
      }

      // OTP verified — update phone in DB
      const { error: updateError } = await db
        .from('nexus_users')
        .update({ phone: pendingPhone.newPhone })
        .eq('id', pendingPhone.userId);

      pendingPhoneChangeOtp.delete(chatId);

      if (updateError) {
        console.error('Phone update error:', updateError);
        return bot.sendMessage(chatId, '❌ Failed to update phone number. Please try again.');
      }

      return bot.sendMessage(chatId,
        `✅ *Phone Number Updated!*\n\nYour phone number has been changed to: ${pendingPhone.newPhone}\n\nYou can now use this number for OTP verification on the website.`,
        { parse_mode: 'Markdown' }
      );
    }

    // Check for password change OTP pending
    const pending = pendingPasswordOtp.get(chatId);
    if (!pending) return;

    // Check if code has expired
    if (Date.now() > pending.expiresAt) {
      pendingPasswordOtp.delete(chatId);
      return bot.sendMessage(chatId, '❌ Code has expired. Request a new one with /changepassword.');
    }

    // If not yet verified, expect a 6-digit OTP code
    if (!pending.verified) {
      const codeMatch = text.match(/^(\d{6})$/);
      if (!codeMatch) {
        return bot.sendMessage(chatId, '⚠️ Please enter the 6-digit OTP code sent to you.');
      }

      const { success, error } = await verifyOtpForUserByPhone(pending.phone, codeMatch[1]);

      if (!success) {
        // DON'T delete — let user retry
        return bot.sendMessage(chatId, `❌ ${error || 'Invalid code.'} Please try again.`, { parse_mode: 'Markdown' });
      }

      // OTP verified — mark as verified but keep the pending state
      pending.verified = true;
      return bot.sendMessage(chatId,
        `✅ *Identity Verified!*\n\nPlease type your new password (minimum 6 characters).`,
        { parse_mode: 'Markdown' }
      );
    }

    // If verified, expect a new password
    const newPassword = text.trim();
    if (newPassword.length < 6) {
      return bot.sendMessage(chatId, '⚠️ Password must be at least 6 characters. Please try again.');
    }

    // Hash and update password in DB
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const { error } = await db
      .from('nexus_users')
      .update({ password: hashedPassword })
      .eq('email', pending.email);

    // Clean up
    pendingPasswordOtp.delete(chatId);

    if (error) {
      console.error('Password update error:', error);
      return bot.sendMessage(chatId, '❌ Failed to update password. Please try again.');
    }

    return bot.sendMessage(chatId,
      `✅ *Password Updated Successfully!*\n\nYou can now log in to the website with your new password.`,
      { parse_mode: 'Markdown' }
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
      .select('id, amount, status, date, durationMonths, applicantName')
      .eq('applicantEmail', user.email)
      .in('status', ['approved', 'Approved', 'active', 'Active', 'disbursed', 'Disbursed'])
      .order('date', { ascending: false });

    if (!loans || loans.length === 0) {
      return bot.sendMessage(chatId,
        `📋 *Your Loans*\n\nNo active loans found for *${user.name}*.`,
        customerMenu()
      );
    }

    const lines = loans.map((l: any) => {
      const amount = Number(l.amount) || 0;
      const duration = Number(l.durationMonths) || 1;
      const monthly = monthlyPaymentFor(amount, duration);
      const installments = installmentDates(l.date, duration);

      let overdue = 0;
      let nextDue: Date | null = null;
      for (const d of installments) {
        const days = daysUntil(d.toISOString());
        if (days < 0) overdue++;
        else if (nextDue === null && days <= 7) nextDue = d;
      }
      if (!nextDue) nextDue = installments.find(d => daysUntil(d.toISOString()) >= 0) || installments[installments.length - 1];

      const daysText = overdue > 0
        ? `⚠️ *${overdue} overdue*`
        : `📅 Next due ${formatDate(nextDue.toISOString())}`;

      const cleanId = String(l.id).startsWith('#') ? String(l.id).substring(1) : String(l.id);
      return `  • Loan #${cleanId} — $${amount.toLocaleString()} — *${l.status}*\n    💰 $${monthly.toFixed(0)}/mo · ${daysText}`;
    });

    bot.sendMessage(chatId,
      `📋 *Your Loans (${loans.length} active)*\n\n${lines.join('\n\n')}`,
      customerMenu()
    );
  });

  // ── ADMIN: /broadcast ─────────────────────────────────────────

  bot.onText(/\/broadcast(?:\s+([\s\S]+))?/, async (msg, match) => {
    const { data: config } = await db.from('nexus_config').select('telegram_admin_id').eq('id', 1).single();
    const envAdminId = parseInt(process.env.TELEGRAM_ADMIN_ID || '0', 10);
    const dynamicAdminId = config && config.telegram_admin_id ? parseInt(config.telegram_admin_id, 10) : envAdminId;
    if (msg.from?.id !== dynamicAdminId) return;
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
    const { data: config } = await db.from('nexus_config').select('telegram_admin_id').eq('id', 1).single();
    const envAdminId = parseInt(process.env.TELEGRAM_ADMIN_ID || '0', 10);
    const dynamicAdminId = config && config.telegram_admin_id ? parseInt(config.telegram_admin_id, 10) : envAdminId;
    if (msg.from?.id !== dynamicAdminId) return;
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

  bot.on('contact', async (msg) => {
    const chatId = msg.chat.id;
    try {
      const contact = msg.contact;
      if (!contact) return;
      
      // Safety check: ensure contact belongs to the user who sent it
      if (contact.user_id !== msg.from?.id) {
        return bot.sendMessage(chatId, '❌ You can only link your own phone number.');
      }
      
      // Normalize phone number (remove +, spaces, leading zeros, keep only digits)
      const phoneDigits = contact.phone_number.replace(/\D/g, '');
      const finalPhone = '+' + phoneDigits;

      // Check if there is a pending linkage from /start parameter
      if (pendingLinkages.has(chatId)) {
        const dbUserId = pendingLinkages.get(chatId);
        pendingLinkages.delete(chatId);

        const numericId = parseInt(dbUserId || '', 10);
        if (isNaN(numericId)) {
          return bot.sendMessage(chatId, '❌ Invalid user registration session.');
        }

        const { data: dbUser, error: fetchErr } = await db.from('nexus_users').select('*').eq('id', numericId).maybeSingle();
        if (fetchErr || !dbUser) {
          console.error('Fetch pending user error:', fetchErr);
          return bot.sendMessage(chatId, `❌ Linkage session not found. Please register on the website first. (ID: ${dbUserId})`);
        }

        // Update user with phone and link chat ID, set otp_verified_at to mark fully verified!
        const emailPattern = `${phoneDigits}@nexus.local`;
        const { error: updateError } = await db
          .from('nexus_users')
          .update({
            phone: finalPhone,
            telegram_chat_id: String(chatId),
            otp_verified_at: new Date().toISOString(),
            email_verified: true,
            email: emailPattern
          })
          .eq('id', dbUser.id);

        if (updateError) {
          console.error('Linkage database update error:', updateError);
          return bot.sendMessage(chatId, `❌ Database link update error: ${updateError.message || 'Unknown constraint'}`);
        }

        return bot.sendMessage(chatId,
`✅ *Account Activated successfully!*

Your website profile is now linked with Telegram and verified:
• Phone Number: ${finalPhone}

You can now log in using your phone number and password on the website!`,
          {
            parse_mode: 'Markdown',
            reply_markup: {
              remove_keyboard: true
            }
          }
        );
      }
      
      const { data: users, error } = await db.from('nexus_users').select('id, name, email, phone, telegram_chat_id');
      if (error || !users) {
        return bot.sendMessage(chatId, '❌ Database error occurred. Please try again later.');
      }
      
      const matchingUser = users.find(u => {
        if (!u.phone) return false;
        const dbPhoneDigits = u.phone.replace(/\D/g, '');
        return phoneDigits.endsWith(dbPhoneDigits.slice(-8)) || dbPhoneDigits.endsWith(phoneDigits.slice(-8));
      });
      
      if (!matchingUser) {
        return bot.sendMessage(chatId, `❌ No NexusFinance account found with phone number: ${contact.phone_number}.\n\nPlease register with this phone number on the website first!`);
      }
      
      if (matchingUser.telegram_chat_id && matchingUser.telegram_chat_id !== String(chatId)) {
        return bot.sendMessage(chatId, '⚠️ This phone number is already linked to another Telegram account.');
      }
      
      // Generate a 6-digit numeric OTP code
      const otpCode = String(crypto.randomInt(100000, 1000000));
      const hashed = await bcrypt.hash(otpCode, 10);
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

      const { error: updateError } = await db
        .from('nexus_users')
        .update({
          telegram_chat_id: String(chatId),
          otp_code: hashed,
          otp_expires_at: expiresAt,
          otp_verified_at: null
        })
        .eq('id', matchingUser.id);
        
      if (updateError) {
        return bot.sendMessage(chatId, '❌ Failed to link Telegram account. Try again.');
      }
      
      bot.sendMessage(chatId, `✅ *Success!* Your Telegram account has been linked to *${matchingUser.name}* (${matchingUser.email}).\n\n🔐 *Your Account Verification Code:*\n\`${otpCode}\`\n\nPlease type this code on the website to complete your account registration. It expires in 5 minutes.`, {
        parse_mode: 'Markdown',
        reply_markup: { remove_keyboard: true }
      });
    } catch (err: any) {
      console.error('Contact sharing handler failed:', err);
      try {
        await bot.sendMessage(chatId, `❌ An unexpected linkage error occurred: ${err.message || err}`);
      } catch (sendErr) {
        console.error('Failed to notify chat of exception:', sendErr);
      }
    }
  });

  // ── Initialize admin session ──────────────────────────────────

  loginAsAdmin();

  console.log('  🤖 Telegram bot started');
}

export default bot;
export { sendPaymentReminders, sendPaymentConfirmation, bot };
