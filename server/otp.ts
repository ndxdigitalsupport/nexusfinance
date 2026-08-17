import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from './db.js';
import { sendOtpEmail } from './brevo.js';

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
