import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TOKEN) {
  console.log('  🤖 Telegram bot disabled — TELEGRAM_BOT_TOKEN not set');
  process.exit(0);
}

const API = process.env.VITE_API_URL || 'http://localhost:3001/api';
const ADMIN_ID = parseInt(process.env.TELEGRAM_ADMIN_ID || '0', 10);

const bot = new TelegramBot(TOKEN, { polling: true });

let apiToken: string | null = null;

async function loginAsAdmin() {
  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@nexus.com', password: 'password123' }),
    });
    const data = await res.json();
    apiToken = data.token;
  } catch {}
}

async function apiGet(path: string) {
  if (!apiToken) await loginAsAdmin();
  try {
    const res = await fetch(`${API}${path}`, {
      headers: { Authorization: `Bearer ${apiToken}` },
    });
    return await res.json();
  } catch {
    return null;
  }
}

function formatDate(ts: string) {
  return new Date(ts).toLocaleString();
}

bot.onText(/\/start/, async (msg) => {
  if (msg.from?.id !== ADMIN_ID) return;
  bot.sendMessage(msg.chat.id,
`🤖 *Nexus Finance Bot*

Commands:
/stats — Platform statistics
/loans — Recent loan applications
/users — User list
/notifications — Latest notifications
/help — This message`,
    { parse_mode: 'Markdown' }
  );
});

bot.onText(/\/help/, async (msg) => {
  if (msg.from?.id !== ADMIN_ID) return;
  bot.sendMessage(msg.chat.id,
`*Commands:*
/stats — Total volume, active customers, outstanding balance, interest earned
/loans — Last 10 loan applications with status
/users — All registered users and their roles
/notifications — Latest 5 notifications`,
    { parse_mode: 'Markdown' }
  );
});

bot.onText(/\/stats/, async (msg) => {
  if (msg.from?.id !== ADMIN_ID) return;
  const data = await apiGet('/stats');
  if (!data) return bot.sendMessage(msg.chat.id, '❌ Failed to fetch stats.');
  bot.sendMessage(msg.chat.id,
`📊 *Platform Statistics*

• Total Volume: *$${data.totalVolume?.toLocaleString() || 0}*
• Active Customers: *${data.activeCustomers || 0}*
• Outstanding: *$${data.outstandingBalanceValue?.toLocaleString() || 0}*
• Interest Earned: *$${data.interestEarned?.toLocaleString() || 0}*`,
    { parse_mode: 'Markdown' }
  );
});

bot.onText(/\/loans/, async (msg) => {
  if (msg.from?.id !== ADMIN_ID) return;
  const loans = await apiGet('/loans');
  if (!loans || loans.length === 0) return bot.sendMessage(msg.chat.id, '❌ No loans found.');
  const lines = loans.slice(0, 10).map((l: any) =>
    `  • ${l.id} — ${l.applicantName} — *${l.status}* — $${l.amount?.toLocaleString()}`
  );
  bot.sendMessage(msg.chat.id,
`📋 *Recent Loans (${loans.length} total)*

${lines.join('\n')}`,
    { parse_mode: 'Markdown' }
  );
});

bot.onText(/\/users/, async (msg) => {
  if (msg.from?.id !== ADMIN_ID) return;
  const users = await apiGet('/users');
  if (!users || users.length === 0) return bot.sendMessage(msg.chat.id, '❌ No users found.');
  const lines = users.map((u: any) => `  • ${u.name} — *${u.role}* — ${u.email}`);
  bot.sendMessage(msg.chat.id,
`👥 *Users (${users.length})*

${lines.join('\n')}`,
    { parse_mode: 'Markdown' }
  );
});

bot.onText(/\/notifications/, async (msg) => {
  if (msg.from?.id !== ADMIN_ID) return;
  const notifs = await apiGet('/notifications');
  if (!notifs || notifs.length === 0) return bot.sendMessage(msg.chat.id, '❌ No notifications.');
  const lines = notifs.slice(0, 5).map((n: any) =>
    `  ${n.unread ? '🟢' : '⚪'} ${n.text}`
  );
  bot.sendMessage(msg.chat.id,
`🔔 *Recent Notifications*

${lines.join('\n')}`,
    { parse_mode: 'Markdown' }
  );
});

loginAsAdmin();

export default bot;
