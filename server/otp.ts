import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from './db.js';
import { sendOtpEmail } from './brevo.js';
import { sendSMS } from './sms.js';

const OTP_LENGTH = 6;
const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_VERIFIED_WINDOW_MS = 15 * 60 * 1000;

export function generateOtp(): string {
  return crypto.randomInt(0, 1000000).toString().padStart(OTP_LENGTH, '0');
}

export async function createOtpForUser(email: string) {
  const { data: user } = await db.from('nexus_users').select('id, email').eq('email', email).maybeSingle();
  if (!user) return { success: false, error: 'No account found with this email.' };

  const otp = generateOtp();
  const hashed = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS).toISOString();

  await db.from('nexus_users')
    .update({ otp_code: hashed, otp_expires_at: expiresAt, otp_verified_at: null })
    .eq('id', user.id);

  const sent = await sendOtpEmail(email, otp);
  if (!sent.success) {
    await db.from('nexus_users').update({ otp_code: null, otp_expires_at: null }).eq('id', user.id);
    return { success: false, error: 'Failed to send the verification email.' };
  }
  return { success: true };
}

export async function verifyOtpForUser(email: string, code: string) {
  const { data: user } = await db.from('nexus_users')
    .select('id, email, otp_code, otp_expires_at')
    .eq('email', email)
    .maybeSingle();

  if (!user || !user.otp_code) {
    return { success: false, error: 'Invalid or expired code.' };
  }
  if (new Date(user.otp_expires_at).getTime() < Date.now()) {
    return { success: false, error: 'Code has expired. Request a new one.' };
  }

  const matches = await bcrypt.compare(code, user.otp_code);
  if (!matches) {
    return { success: false, error: 'Invalid or expired code.' };
  }

  await db.from('nexus_users')
    .update({ otp_code: null, otp_expires_at: null, otp_verified_at: new Date().toISOString() })
    .eq('id', user.id);

  return { success: true };
}

export async function requireOtpVerified(email: string): Promise<boolean> {
  const { data: user } = await db.from('nexus_users')
    .select('otp_verified_at')
    .eq('email', email)
    .maybeSingle();

  if (!user?.otp_verified_at) return false;
  return Date.now() - new Date(user.otp_verified_at).getTime() < OTP_VERIFIED_WINDOW_MS;
}

export async function clearOtpVerified(email: string) {
  await db.from('nexus_users').update({ otp_verified_at: null }).eq('email', email);
}

// ── Phone-based OTP functions (parallel to email OTP) ──────────────

async function withTimeout<T>(promise: Promise<T>, ms = 2500): Promise<T> {
  return Promise.race([promise, new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))]);
}

export async function createOtpForUserByPhone(phone: string) {
  const { data: user } = await db.from('nexus_users').select('id, phone, telegram_chat_id').eq('phone', phone).maybeSingle();
  if (!user) return { success: false, error: 'No account found with this phone number.' };

  const otp = generateOtp();
  const hashed = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS).toISOString();

  await db.from('nexus_users')
    .update({ otp_code: hashed, otp_expires_at: expiresAt, otp_verified_at: null })
    .eq('id', user.id);

  // Send via Telegram bot (if linked) + SMS (always)
  let telegramSent = false;
  let smsSent = false;

  if (user.telegram_chat_id) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (token) {
      try {
        const TelegramBot = (await import('node-telegram-bot-api')).default;
        const tempBot = new TelegramBot(token, { polling: false });
        await withTimeout(tempBot.sendMessage(user.telegram_chat_id, `🔐 *NexusFinance Verification Code*\n\nYour code is: *${otp}*\n\nDo not share this code with anyone. It expires in 10 minutes.`, { parse_mode: 'Markdown' }), 2500);
        telegramSent = true;
      } catch (err) {
        console.error('Failed to send Telegram OTP:', err);
      }
    }
  }

  try {
    const { data: config } = await db.from('nexus_config').select('*').eq('id', 1).single();
    await withTimeout(sendSMS(phone, `Your NexusFinance verification code is: ${otp}. It expires in 10 minutes.`, config), 2500);
    smsSent = true;
  } catch (err) {
    console.error('Failed to send SMS OTP:', err);
  }

  if (!telegramSent && !smsSent) {
    await db.from('nexus_users').update({ otp_code: null, otp_expires_at: null }).eq('id', user.id);
    return { success: false, error: 'Failed to send verification code. Please try again.' };
  }

  return { success: true, telegramSent, smsSent };
}

export async function verifyOtpForUserByPhone(phone: string, code: string) {
  const { data: user } = await db.from('nexus_users')
    .select('id, phone, otp_code, otp_expires_at')
    .eq('phone', phone)
    .maybeSingle();

  if (!user || !user.otp_code) {
    return { success: false, error: 'Invalid or expired code.' };
  }
  if (new Date(user.otp_expires_at).getTime() < Date.now()) {
    return { success: false, error: 'Code has expired. Request a new one.' };
  }

  const matches = await bcrypt.compare(code, user.otp_code);
  if (!matches) {
    return { success: false, error: 'Invalid or expired code.' };
  }

  await db.from('nexus_users')
    .update({ email_verified: true, otp_code: null, otp_expires_at: null, otp_verified_at: new Date().toISOString() })
    .eq('id', user.id);

  return { success: true };
}

export async function requireOtpVerifiedByPhone(phone: string): Promise<boolean> {
  const { data: user } = await db.from('nexus_users')
    .select('otp_verified_at')
    .eq('phone', phone)
    .maybeSingle();

  if (!user?.otp_verified_at) return false;
  return Date.now() - new Date(user.otp_verified_at).getTime() < OTP_VERIFIED_WINDOW_MS;
}

export async function clearOtpVerifiedByPhone(phone: string) {
  await db.from('nexus_users').update({ otp_verified_at: null }).eq('phone', phone);
}
