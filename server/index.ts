// ============================================================
// NEXUSFINANCE BACKEND API — Supabase-backed Express server
// ============================================================

import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { db } from './db.js';
import { createOtpForUser, verifyOtpForUser, requireOtpVerified, clearOtpVerified } from './otp.js';
import { sendSMS } from './sms.js';
import { verifyKHQR, decodeKHQR, generateDeeplink } from './khqr.js';
import { generateKHQR, checkTransaction } from './bakong.js';
import * as payway from './payway.js';
import { sendEmail, emailTemplates } from './email.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import bot, { setNotifyUserCallback } from './bot.js';
import cron from 'node-cron';
import TelegramBot from 'node-telegram-bot-api';

dotenv.config();

declare global {
  namespace Express {
    interface Request {
      user?: { id: number; email: string; name: string; role: string };
    }
  }
}

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) { console.error('FATAL: JWT_SECRET environment variable is required.'); process.exit(1); }

const requiredEnv = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE'];
for (const key of requiredEnv) {
  if (!process.env[key]) { console.error(`FATAL: ${key} is not set in .env`); process.exit(1); }
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Try again later.' },
});

app.set('trust proxy', 1);
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(cookieParser());
app.use(express.json());

// Prevent caching on API routes by CDNs and edge networks
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

function logAudit(action: string, details: string, user: any) {
  db.from('nexus_audit_logs').insert({ action, details, userId: user.id, userEmail: user.email }).then(null, (err) => console.error('logAudit failed:', err));
}

let notifyUser = function(userId: number, text: string) {
  const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  db.from('nexus_notifications').insert({ userId, text, time }).then(null, (err) => console.error('notifyUser failed:', err));
};

async function notifyAdminOfNewLoan(loan: any) {
  try {
    const { data: config } = await db.from('nexus_config').select('telegram_admin_id').eq('id', 1).single();
    if (config && config.telegram_admin_id && bot) {
      const adminChatId = parseInt(config.telegram_admin_id, 10);
      if (adminChatId) {
        const isApproved = loan.status === 'Approved' || loan.status === 'approved';
        const statusText = isApproved ? '🟢 Auto-Approved & Disbursed' : '⏳ Pending Underwriting Review';
        
        const message = `🔔 *New Loan Application Received!*\n\n` +
          `• *Applicant*: ${loan.applicantName}\n` +
          `• *Loan ID*: ${loan.id}\n` +
          `• *Amount*: $${Number(loan.amount).toLocaleString()}\n` +
          `• *Loan Type*: ${loan.type}\n` +
          `• *Purpose*: ${loan.purpose || 'Not specified'}\n` +
          `• *Credit Score*: ${loan.creditScore || 'N/A'}\n` +
          `• *Status*: *${statusText}*\n\n` +
          `Please review the application on the platform dashboard.`;
        
        await bot.sendMessage(adminChatId, message, {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [[{ text: '🚀 View Applications', web_app: { url: 'https://nexusfinancefintech.vercel.app' } }]]
          }
        });
      }
    }
  } catch (err) {
    console.error('Failed to notify admin of new loan via Telegram:', err);
  }

  try {
    const { data: staff } = await db.from('nexus_users').select('name, email').in('role', ['super-admin', 'loan-officer']);
    if (staff && staff.length > 0) {
      const isApproved = loan.status === 'Approved' || loan.status === 'approved';
      const statusText = isApproved ? 'Auto-Approved & Disbursed' : 'Pending Underwriting Review';

      const emailPromises = staff.map(member => {
        const subject = `[NexusFinance] New Loan Application: ${loan.id}`;
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #0d9488; margin: 0;">NexusFinance</h2>
              <p style="color: #666666; margin: 5px 0 0 0; font-size: 14px;">Smart Lending Platform Notification</p>
            </div>
            
            <div style="padding: 20px; background-color: #f9f9f9; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="margin-top: 0; color: #111827;">New Loan Application Received</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666666; font-weight: bold; width: 40%;">Applicant Name:</td>
                  <td style="padding: 8px 0; color: #111827; font-weight: bold;">${loan.applicantName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666666; font-weight: bold;">Loan ID:</td>
                  <td style="padding: 8px 0; color: #111827; font-family: monospace;">${loan.id}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666666; font-weight: bold;">Requested Amount:</td>
                  <td style="padding: 8px 0; color: #0d9488; font-weight: bold;">$${Number(loan.amount).toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666666; font-weight: bold;">Loan Type:</td>
                  <td style="padding: 8px 0; color: #111827;">${loan.type}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666666; font-weight: bold;">Purpose:</td>
                  <td style="padding: 8px 0; color: #111827;">${loan.purpose || 'Not specified'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666666; font-weight: bold;">Credit Score:</td>
                  <td style="padding: 8px 0; color: #111827;">${loan.creditScore || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666666; font-weight: bold;">Status:</td>
                  <td style="padding: 8px 0; color: ${isApproved ? '#10b981' : '#f59e0b'}; font-weight: bold;">${statusText}</td>
                </tr>
              </table>
            </div>
            
            <div style="text-align: center;">
              <a href="https://nexusfinancefintech.vercel.app" style="display: inline-block; padding: 12px 24px; background-color: #0d9488; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold;">Review Application</a>
            </div>
          </div>
        `;
        return sendEmail(member.email, subject, html).catch(() => null);
      });
      return Promise.all(emailPromises);
    }
  } catch (err) {
    console.error('Failed to send new loan email notifications:', err);
  }
}

let reminderCronTask: any = null;

export function scheduleReminderCron(timeStr: string) {
  const [hourStr, minStr] = (timeStr || '07:00').split(':');
  const hour = parseInt(hourStr, 10) || 0;
  const minute = parseInt(minStr, 10) || 0;

  if (reminderCronTask) {
    reminderCronTask.stop();
  }

  const cronPattern = `${minute} ${hour} * * *`;
  reminderCronTask = cron.schedule(cronPattern, async () => {
    console.log(`  📬 Running daily payment reminders (Scheduled at ${timeStr} Cambodia time)...`);
    try {
      const { sendPaymentReminders } = await import('./bot.js');
      const ADMIN_ID = parseInt(process.env.TELEGRAM_ADMIN_ID || '0', 10);
      if (ADMIN_ID) {
        await sendPaymentReminders(undefined, ADMIN_ID);
      } else {
        await sendPaymentReminders(undefined);
      }
    } catch (e) {
      console.error('  ❌ Payment reminder cron failed:', e);
    }
  }, { timezone: 'Asia/Phnom_Penh' });

  console.log(`  ⏰ Daily payment reminder cron scheduled (${timeStr} Cambodia time)`);
}

function authMiddleware(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided. Login first.' });
  }
  try {
    req.user = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    next();
  } catch {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
}

// Role guard — must run AFTER authMiddleware
function requireRole(...roles: string[]) {
  return (req: any, res: any, next: any) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
}

function normalizeEmail(raw: string): string {
  return String(raw || '').trim().toLowerCase();
}

// ── AUTH ROUTES ────────────────────────────────────────────

function generateToken(user: { id: number; email: string; name: string; role: string; }) {
  return jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
}

// Login with email + password (bcrypt verified against database)
app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const { data: dbUser } = await db.from('nexus_users').select('*').eq('email', email).maybeSingle();
    if (!dbUser) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isValid = await bcrypt.compare(password, dbUser.password || '');
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (dbUser.email_verified === false) {
      return res.status(403).json({
        error: 'Email not verified. A verification code has been sent to your email.',
        code: 'EMAIL_NOT_VERIFIED',
      });
    }

    const token = generateToken({ id: dbUser.id, email: dbUser.email, name: dbUser.name, role: dbUser.role });
    logAudit('login', `User ${dbUser.email} logged in`, { id: dbUser.id, email: dbUser.email, name: dbUser.name, role: dbUser.role });
    res.json({ token, user: { id: dbUser.id, name: dbUser.name, email: dbUser.email, role: dbUser.role } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Session exchange for users authenticated via an external provider (e.g. Google OAuth)
app.post('/api/auth/session', authLimiter, async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    let { data: dbUser } = await db.from('nexus_users').select('*').eq('email', email).maybeSingle();
    if (!dbUser) {
      const { data: newUser } = await db.from('nexus_users').insert({
        name: name || email.split('@')[0],
        email, role: 'customer', phone: '',
      }).select().single();
      dbUser = newUser;
    }

    const token = generateToken({ id: dbUser!.id, email: dbUser!.email, name: dbUser!.name, role: dbUser!.role });
    res.json({ token, user: { id: dbUser!.id, name: dbUser!.name, email: dbUser!.email, role: dbUser!.role } });
  } catch (err) {
    console.error('Session exchange error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Send a verification code to the user's email (register, forgot password, password change)
app.post('/api/auth/send-otp', authLimiter, async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const { data: user } = await db.from('nexus_users').select('id, name, email').eq('email', email).maybeSingle();
    if (!user) return res.status(404).json({ error: 'No account found with this email.' });

    const result = await createOtpForUser(email);
    if (!result.success) return res.status(500).json({ error: result.error || 'Failed to send the verification code.' });

    logAudit('otp-sent', `Verification code sent to ${email}`, { id: user.id, email: user.email, name: user.name, role: '' });
    res.json({ message: 'Verification code sent to your email.' });
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Verify the code sent to the user's email
app.post('/api/auth/verify-otp', authLimiter, async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { code } = req.body;
    if (!email || !code) return res.status(400).json({ error: 'Email and code are required.' });

    const result = await verifyOtpForUser(email, String(code).trim());
    if (!result.success) return res.status(400).json({ error: result.error || 'Invalid or expired code.' });

    // Mark the email as verified — unlocks login for newly registered accounts
    await db.from('nexus_users').update({ email_verified: true }).eq('email', email);

    const { data: user } = await db.from('nexus_users').select('id, name, email, role').eq('email', email).maybeSingle();
    if (user) logAudit('otp-verified', `Code verified for ${email}`, { id: user.id, email: user.email, name: user.name, role: user.role });
    res.json({ message: 'Code verified successfully.' });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Self-service password reset (called after OTP verification on forgot password)
app.post('/api/auth/update-password', authLimiter, async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'email and newPassword are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }
    const { data: user } = await db.from('nexus_users').select('id').eq('email', email).maybeSingle();
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const verified = await requireOtpVerified(email);
    if (!verified) return res.status(403).json({ error: 'Email not verified. Request a new code and verify first.' });

    const bcryptHash = await bcrypt.hash(newPassword, 10);
    await db.from('nexus_users').update({ password: bcryptHash }).eq('email', email);
    await clearOtpVerified(email);
    logAudit('password-reset', `Password reset via OTP for ${email}`, { id: user.id, email, name: '', role: '' });
    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Password update error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Change password (authenticated user, after OTP verification on profile page)
app.patch('/api/auth/password', authMiddleware, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }
    const email = req.user.email;

    const verified = await requireOtpVerified(email);
    if (!verified) return res.status(403).json({ error: 'Email not verified. Request a new code and verify first.' });

    const bcryptHash = await bcrypt.hash(newPassword, 10);
    await db.from('nexus_users').update({ password: bcryptHash }).eq('email', email);
    await clearOtpVerified(email);
    logAudit('password-change', `${email} changed their password`, req.user);
    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  const { data: user } = await db.from('nexus_users').select('id, name, email, role, phone').eq('id', req.user.id).maybeSingle();
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json(user);
});

app.patch('/api/auth/profile', authMiddleware, async (req, res) => {
  const { name, email, phone } = req.body;
  const updates: any = {};
  if (name !== undefined) updates.name = name;
  if (email !== undefined) updates.email = normalizeEmail(email);
  if (phone !== undefined) updates.phone = phone;
  if (updates.email) {
    const { data: existing } = await db.from('nexus_users').select('id').eq('email', updates.email).neq('id', req.user.id).single();
    if (existing) return res.status(400).json({ error: 'Email already in use.' });
  }
  const { data: updated } = await db.from('nexus_users').update(updates).eq('id', req.user.id).select('id, name, email, role, phone').single();
  if (!updated) return res.status(404).json({ error: 'User not found.' });
  res.json({ user: updated });
});

// ── FORGOT PASSWORD ──────────────────────────────────────

app.post('/api/auth/forgot-password', authLimiter, async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const { data: dbUser } = await db.from('nexus_users').select('id, name, email').eq('email', email).maybeSingle();
    if (dbUser) {
      const tmpl = emailTemplates.passwordReset(dbUser.name, dbUser.email);
      sendEmail(dbUser.email, tmpl.subject, tmpl.html).catch((err) => console.error('Failed to send forgot password email:', err));
      logAudit('password-reset-request', `Reset email sent to ${email}`, { id: dbUser.id, email: dbUser.email, name: '', role: 'customer' });
    }

    res.json({ message: 'If an account exists with this email, a password reset link has been sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ── GOOGLE OAUTH ROUTES ──────────────────────────────────────

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'https://nexusfinance-lof3.onrender.com/api/auth/google/callback';
const FRONTEND_URL = process.env.CORS_ORIGIN || 'https://nexusfinancefintech.vercel.app';

// Step 1: Redirect user to Google consent screen
app.get('/api/auth/google', (req, res) => {
  if (!GOOGLE_CLIENT_ID) return res.status(500).json({ error: 'Google OAuth not configured.' });

  const state = crypto.randomBytes(16).toString('hex');
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_CALLBACK_URL,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
    state,
  });

  // Store state in a cookie for CSRF protection (simple approach)
  res.cookie('google_oauth_state', state, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 60000 });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

// Step 2: Handle Google callback
app.get('/api/auth/google/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    const savedState = req.cookies?.google_oauth_state;

    // Basic state validation
    if (state && savedState && state !== savedState) {
      return res.redirect(`${FRONTEND_URL}?error=invalid_state`);
    }

    if (!code) return res.redirect(`${FRONTEND_URL}?error=no_code`);

    // Exchange authorization code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code as string,
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
        redirect_uri: GOOGLE_CALLBACK_URL,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokens.access_token) return res.redirect(`${FRONTEND_URL}?error=token_exchange_failed`);

    // Fetch user info from Google
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const googleUser = await userRes.json();

    if (!googleUser.email) return res.redirect(`${FRONTEND_URL}?error=no_email`);

    const gEmail = normalizeEmail(googleUser.email);

    // Find or create user in database
    let { data: dbUser } = await db.from('nexus_users').select('*').eq('email', gEmail).maybeSingle();
    if (!dbUser) {
      const { data: newUser } = await db.from('nexus_users').insert({
        name: googleUser.name || gEmail.split('@')[0],
        email: gEmail,
        role: 'customer',
      phone: '',
      email_verified: true,
      }).select().single();
      dbUser = newUser;
    }

    // Generate JWT
    const token = jwt.sign(
      { id: dbUser!.id, email: dbUser!.email, name: dbUser!.name, role: dbUser!.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Redirect back to frontend with token
    res.redirect(`${FRONTEND_URL}?google_token=${token}`);
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    res.redirect(`${FRONTEND_URL}?error=oauth_failed`);
  }
});

// ── SMS ROUTES ───────────────────────────────────────────────

app.post('/api/sms/send', authMiddleware, async (req, res) => {
  const { to, text } = req.body;
  if (!to || !text) return res.status(400).json({ error: 'Phone number and text are required.' });
  const { data: config } = await db.from('nexus_config').select('*').eq('id', 1).single();
  const result = await sendSMS(to, text, config);
  if (result.success) {
    await logAudit('sms_sent', `SMS sent to ${to}`, req.user);
    res.json(result);
  } else {
    res.status(500).json(result);
  }
});

// ── LOAN ROUTES ─────────────────────────────────────────────

app.get('/api/loans', authMiddleware, async (req, res) => {
  let query = db.from('nexus_loans').select('*');
  if (req.user.role === 'customer') {
    query = query.eq('applicantEmail', req.user.email);
  }
  const { data: loans } = await query.order('date', { ascending: false });

  // Calculate dynamic repayment metrics for active/approved loans
  const loansWithRepayments = await Promise.all((loans || []).map(async (loan) => {
    const isApproved = ['approved', 'Approved', 'active', 'Active', 'disbursed', 'Disbursed'].includes(loan.status);
    if (!isApproved) return loan;

    const amount = Number(loan.amount) || 0;
    const duration = Number(loan.durationMonths) || 1;
    const monthly = calculateMonthlyPayment(amount, duration);
    
    // installment dates
    const start = new Date(loan.date);
    const installments: Date[] = [];
    for (let m = 1; m <= duration; m++) {
      const d = new Date(start);
      d.setMonth(d.getMonth() + m);
      installments.push(d);
    }

    // calculate due status
    let overdueCount = 0;
    let nextDue: Date | null = null;
    for (const d of installments) {
      // Calculate days until
      const diffTime = d.getTime() - new Date().getTime();
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (days < 0) {
        overdueCount++;
      } else if (nextDue === null && days <= 7) {
        nextDue = d;
      }
    }
    if (!nextDue) {
      const diffTimes = installments.map(d => d.getTime() - new Date().getTime());
      const futureIdx = diffTimes.findIndex(t => t >= 0);
      nextDue = futureIdx >= 0 ? installments[futureIdx] : installments[installments.length - 1];
    }

    return {
      ...loan,
      monthlyPayment: monthly,
      overdueCount,
      nextPaymentDate: nextDue ? nextDue.toISOString() : null,
      repaymentStatus: overdueCount > 0 ? 'Overdue' : 'On Time'
    };
  }));

  res.json(loansWithRepayments);
});

app.post('/api/loans', authMiddleware, async (req, res) => {
  const { applicantName, applicantEmail, initials, amount, type, purpose, creditScore, monthlyIncome, durationMonths } = req.body;
  const loanId = '#77' + Math.floor(1000 + Math.random() * 9000);

  const { data: config } = await db.from('nexus_config').select('*').eq('id', 1).single();
  const kycRequired = config ? config.kycRequired : true;
  const autoApproveLimit = config ? config.autoApproveLimit : 5000;
  const maxLoanAmount = config ? config.maxLoanAmount : 500000;

  const loanAmount = amount || 2500;
  if (loanAmount > maxLoanAmount) {
    return res.status(400).json({ error: `Requested loan amount exceeds platform limit of $${maxLoanAmount.toLocaleString()}` });
  }

  const score = creditScore || 700;
  const shouldAutoApprove = loanAmount <= autoApproveLimit && score >= 700 && !kycRequired;
  const initialStatus = shouldAutoApprove ? 'Approved' : 'New';

  const { data: newLoan } = await db.from('nexus_loans').insert({
    id: loanId,
    applicantName: applicantName || req.user.name,
    applicantEmail: applicantEmail || req.user.email,
    initials: initials || req.user.name.split(' ').map(n => n[0]).join('').toUpperCase(),
    amount: loanAmount,
    type: type || 'Personal',
    status: initialStatus,
    urgency: 'Normal',
    assignedTo: shouldAutoApprove ? req.user.id : null,
    date: new Date().toISOString().split('T')[0],
    purpose: purpose || 'Not specified',
    creditScore: score,
    monthlyIncome: monthlyIncome || 4000,
    durationMonths: durationMonths || 24,
  }).select().single();

  if (shouldAutoApprove) {
    logAudit('loan-approved', `Loan ${newLoan.id} (${newLoan.type}) for ${newLoan.applicantName} auto-approved`, req.user);
    const { data: applicantUser } = await db.from('nexus_users').select('id, name, email').eq('email', newLoan.applicantEmail).single();
    if (applicantUser) {
      await db.from('nexus_transactions').insert({
        id: 'tx_fst' + Date.now().toString().slice(-6),
        title: 'Loan Disbursement',
        date: new Date().toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' }),
        amount: newLoan.amount,
        type: 'Loan Disbursement',
        userId: applicantUser.id,
      });
      notifyUser(applicantUser.id, `Your loan ${newLoan.id} has been auto-approved — $${newLoan.amount.toLocaleString()} disbursed.`);
      const tmpl = emailTemplates.loanApproved(applicantUser.name, newLoan.id, newLoan.amount);
      sendEmail(applicantUser.email, tmpl.subject, tmpl.html).catch(() => null);
    }
    dispatchWebhook('loan.created', { loanId: newLoan.id, applicant: newLoan.applicantName, amount: newLoan.amount, type: newLoan.type });
    dispatchWebhook('loan.approved', { loanId: newLoan.id, applicant: newLoan.applicantName, amount: newLoan.amount, type: newLoan.type });
  } else {
    const taskTypes = ['KYC Verification Call', 'Credit Score Audit', 'Collateral Registry Verification'];
    const allowedTasks = kycRequired 
      ? taskTypes 
      : taskTypes.filter(t => t !== 'KYC Verification Call');
    
    const { data: existingTasks } = await db.from('nexus_tasks').select('id');
    await db.from('nexus_tasks').insert({
      id: 't' + Date.now().toString().slice(-6),
      title: allowedTasks[(existingTasks?.length || 0) % allowedTasks.length],
      applicant: newLoan.applicantName,
      regarding: `${newLoan.type} Loan ${newLoan.id}`,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      completed: false,
    });
    dispatchWebhook('loan.created', { loanId: newLoan.id, applicant: newLoan.applicantName, amount: newLoan.amount, type: newLoan.type });
  }

  notifyAdminOfNewLoan(newLoan).catch((err) => console.error('Failed to notify admin of new loan:', err));
  res.status(201).json(newLoan);
});

app.patch('/api/loans/:id/approve', authMiddleware, requireRole('loan-officer', 'super-admin'), async (req, res) => {
  const { data: loan } = await db.from('nexus_loans').select('*').eq('id', req.params.id).single();
  if (!loan) return res.status(404).json({ error: 'Loan not found.' });

  await db.from('nexus_loans').update({ status: 'Approved', assignedTo: req.user.id }).eq('id', req.params.id);
  logAudit('loan-approved', `Loan ${loan.id} (${loan.type}) for ${loan.applicantName} approved`, req.user);

  const { data: applicantUser } = await db.from('nexus_users').select('id, name, email').eq('email', loan.applicantEmail).single();
  if (applicantUser) {
    await db.from('nexus_transactions').insert({
      id: 'tx_fst' + Date.now().toString().slice(-6),
      title: 'Loan Disbursement',
      date: new Date().toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' }),
      amount: loan.amount,
      type: 'Loan Disbursement',
      userId: applicantUser.id,
    });
    notifyUser(applicantUser.id, `Your loan ${loan.id} has been approved — $${loan.amount.toLocaleString()} disbursed.`);
    const tmpl = emailTemplates.loanApproved(applicantUser.name, loan.id, loan.amount);
    sendEmail(applicantUser.email, tmpl.subject, tmpl.html).catch((err) => console.error('Failed to send approval email:', err));
  }
  dispatchWebhook('loan.approved', { loanId: loan.id, applicant: loan.applicantName, amount: loan.amount, type: loan.type });
  res.json({ ...loan, status: 'Approved', assignedTo: req.user.id });
});

app.patch('/api/loans/:id/reject', authMiddleware, requireRole('loan-officer', 'super-admin'), async (req, res) => {
  const { data: loan } = await db.from('nexus_loans').select('*').eq('id', req.params.id).single();
  if (!loan) return res.status(404).json({ error: 'Loan not found.' });
  await db.from('nexus_loans').update({ status: 'Rejected' }).eq('id', req.params.id);
  logAudit('loan-rejected', `Loan ${loan.id} (${loan.type}) for ${loan.applicantName} rejected`, req.user);
  const { data: applicantUser } = await db.from('nexus_users').select('id, name, email').eq('email', loan.applicantEmail).single();
  if (applicantUser) {
    notifyUser(applicantUser.id, `Your loan ${loan.id} application has been rejected.`);
    const tmpl = emailTemplates.loanRejected(applicantUser.name, loan.id);
    sendEmail(applicantUser.email, tmpl.subject, tmpl.html).catch((err) => console.error('Failed to send rejection email:', err));
  }
  dispatchWebhook('loan.rejected', { loanId: loan.id, applicant: loan.applicantName, type: loan.type });
  res.json({ ...loan, status: 'Rejected' });
});

app.patch('/api/loans/:id/hold', authMiddleware, requireRole('loan-officer', 'super-admin'), async (req, res) => {
  const { data: loan } = await db.from('nexus_loans').select('*').eq('id', req.params.id).single();
  if (!loan) return res.status(404).json({ error: 'Loan not found.' });
  await db.from('nexus_loans').update({ status: 'Hold' }).eq('id', req.params.id);
  logAudit('loan-held', `Loan ${loan.id} (${loan.type}) for ${loan.applicantName} put on hold`, req.user);
  res.json({ ...loan, status: 'Hold' });
});

// ── TRANSACTION ROUTES ──────────────────────────────────────

app.get('/api/transactions', authMiddleware, async (req, res) => {
  const { data: txs } = await db.from('nexus_transactions').select('*').eq('userId', req.user.id).order('id', { ascending: false });
  res.json(txs || []);
});

app.post('/api/transactions/repay', authMiddleware, async (req, res) => {
  const { amount } = req.body;
  const newTx = {
    id: 'tx_pyp' + Date.now().toString().slice(-6),
    title: 'Repayment',
    date: new Date().toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' }),
    amount: -Math.abs(amount),
    type: 'Repayment',
    userId: req.user.id,
  };
  const { data: tx } = await db.from('nexus_transactions').insert(newTx).select().single();
  res.status(201).json(tx);
});

app.post('/api/transactions/disburse', authMiddleware, async (req, res) => {
  const { amount } = req.body;
  const newTx = {
    id: 'tx_fst' + Date.now().toString().slice(-6),
    title: 'Loan Disbursement',
    date: new Date().toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' }),
    amount: Math.abs(amount),
    type: 'Loan Disbursement',
    userId: req.user.id,
  };
  const { data: tx } = await db.from('nexus_transactions').insert(newTx).select().single();
  res.status(201).json(tx);
});

// ── TASK ROUTES ─────────────────────────────────────────────

app.get('/api/tasks', authMiddleware, requireRole('loan-officer', 'super-admin'), async (req, res) => {
  const { data: tasks } = await db.from('nexus_tasks').select('*');
  res.json(tasks || []);
});

app.patch('/api/tasks/:id/complete', authMiddleware, async (req, res) => {
  const { data: task } = await db.from('nexus_tasks').select('*').eq('id', req.params.id).single();
  if (!task) return res.status(404).json({ error: 'Task not found.' });

  await db.from('nexus_tasks').update({ completed: true }).eq('id', req.params.id);

  if (task.regarding) {
    const loanId = task.regarding.split(' ').pop();
    if (loanId?.startsWith('#')) {
      const { data: loan } = await db.from('nexus_loans').select('status').eq('id', loanId).single();
      if (loan && loan.status === 'New') {
        await db.from('nexus_loans').update({ status: 'Review' }).eq('id', loanId);
      }
    }
  }

  res.json({ ...task, completed: true });
});

// ── USER MANAGEMENT (Super Admin) ──────────────────────────

app.get('/api/users', authMiddleware, async (req, res) => {
  if (req.user.role !== 'super-admin') return res.status(403).json({ error: 'Admins only.' });
  const { data: users } = await db.from('nexus_users').select('id, name, email, role, phone, telegram_chat_id');
  res.json(users || []);
});

app.patch('/api/users/:id/role', authMiddleware, async (req, res) => {
  if (req.user.role !== 'super-admin') return res.status(403).json({ error: 'Admins only.' });
  const allowedRoles = ['customer', 'loan-officer', 'super-admin'];
  if (!allowedRoles.includes(req.body.role)) return res.status(400).json({ error: 'Invalid role.' });
  const { data: user } = await db.from('nexus_users').select('id, name, email').eq('id', parseInt(req.params.id)).single();
  if (!user) return res.status(404).json({ error: 'User not found.' });
  await db.from('nexus_users').update({ role: req.body.role }).eq('id', user.id);
  logAudit('role-changed', `${user.name} (${user.email}) role changed to ${req.body.role}`, req.user);
  notifyUser(user.id, `Your role has been updated to ${req.body.role.replace('-', ' ')}.`);
  const tmpl = emailTemplates.roleChanged(user.name, req.body.role);
  sendEmail(user.email, tmpl.subject, tmpl.html).catch((err) => console.error('Failed to send role changed email:', err));
  res.json({ id: user.id, ...req.body });
});

app.patch('/api/users/:id/reset-password', authMiddleware, async (req, res) => {
  if (req.user.role !== 'super-admin') return res.status(403).json({ error: 'Admins only.' });
  const { password } = req.body;
  if (!password || password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  const { data: user } = await db.from('nexus_users').select('id, name, email').eq('id', parseInt(req.params.id)).single();
  if (!user) return res.status(404).json({ error: 'User not found.' });
  const bcryptHash = await bcrypt.hash(password, 10);
  await db.from('nexus_users').update({ password: bcryptHash }).eq('id', user.id);
  logAudit('password-reset', `${user.name} (${user.email}) password reset by admin`, req.user);
  notifyUser(user.id, 'Your password has been reset by an administrator.');
  res.json({ message: 'Password reset successfully.' });
});

// ── CONFIG ROUTES (Super Admin) ─────────────────────────────

app.get('/api/config', authMiddleware, async (req, res) => {
  const { data: config } = await db.from('nexus_config').select('*').eq('id', 1).single();
  res.json(config || {});
});

app.patch('/api/config', authMiddleware, async (req, res) => {
  if (req.user.role !== 'super-admin') return res.status(403).json({ error: 'Admins only.' });
  
  const { data: currentConfig } = await db.from('nexus_config').select('*').eq('id', 1).single();
  const updatePayload: any = {};
  for (const key of Object.keys(req.body)) {
    if (currentConfig && key in currentConfig) {
      updatePayload[key] = req.body[key];
    }
  }

  const { error } = await db.from('nexus_config').update(updatePayload).eq('id', 1);
  if (error) {
    console.error('Error updating config:', error);
    return res.status(500).json({ error: error.message });
  }

  const changeDetails: any = {};
  for (const key of Object.keys(updatePayload)) {
    changeDetails[key] = {
      from: currentConfig ? currentConfig[key] : null,
      to: updatePayload[key]
    };
  }

  logAudit('config-updated', `Platform config updated: ${JSON.stringify(changeDetails)}`, req.user);
  const { data: config } = await db.from('nexus_config').select('*').eq('id', 1).single();
  if (config && config.reminder_time) {
    scheduleReminderCron(config.reminder_time);
  }
  res.json(config || {});
});

// ── REMINDER SETTINGS & BROADCASTS ROUTES (Super Admin & Loan Officers) ──

app.get('/api/reminder-settings', authMiddleware, async (req, res) => {
  const { data: settings } = await db
    .from('nexus_reminder_settings')
    .select('*')
    .order('days_before', { ascending: false });
  res.json(settings || []);
});

app.post('/api/reminder-settings', authMiddleware, requireRole('super-admin'), async (req, res) => {
  const { name, days_before, message_template, channel, is_active } = req.body;
  if (!name || message_template === undefined) {
    return res.status(400).json({ error: 'name and message_template are required.' });
  }
  const { data, error } = await db
    .from('nexus_reminder_settings')
    .insert({
      name,
      days_before: parseInt(days_before) || 0,
      message_template,
      channel: channel || 'both',
      is_active: is_active !== false
    })
    .select('*')
    .single();

  if (error) return res.status(500).json({ error: error.message });
  logAudit('reminder-setting-created', `Created reminder: ${name} (${days_before} days)`, req.user);
  res.status(201).json(data);
});

app.patch('/api/reminder-settings/:id', authMiddleware, requireRole('loan-officer', 'super-admin'), async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, days_before, message_template, channel, is_active } = req.body;

  const { data: currentReminder } = await db.from('nexus_reminder_settings').select('*').eq('id', id).single();

  const updateData: Record<string, any> = {};
  if (name !== undefined) updateData.name = name;
  if (days_before !== undefined) updateData.days_before = parseInt(days_before) || 0;
  if (message_template !== undefined) updateData.message_template = message_template;
  if (channel !== undefined) updateData.channel = channel;
  if (is_active !== undefined) updateData.is_active = is_active;
  updateData.updated_at = new Date().toISOString();

  const { data, error } = await db
    .from('nexus_reminder_settings')
    .update(updateData)
    .eq('id', id)
    .select('*')
    .single();

  if (error) return res.status(500).json({ error: error.message });

  const changeDetails: any = {};
  for (const key of Object.keys(updateData)) {
    if (key === 'updated_at') continue;
    changeDetails[key] = {
      from: currentReminder ? currentReminder[key] : null,
      to: updateData[key]
    };
  }

  logAudit('reminder-setting-updated', `Updated reminder ID ${id}: ${JSON.stringify(changeDetails)}`, req.user);
  res.json(data);
});

app.delete('/api/reminder-settings/:id', authMiddleware, requireRole('super-admin'), async (req, res) => {
  const id = parseInt(req.params.id);
  const { error } = await db.from('nexus_reminder_settings').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  logAudit('reminder-setting-deleted', `Deleted reminder ID ${id}`, req.user);
  res.json({ ok: true });
});

app.get('/api/test-reminders', authMiddleware, requireRole('super-admin'), async (req, res) => {
  console.log('  📬 Manual trigger of payment reminders sweep requested by:', req.user.email);
  try {
    const { sendPaymentReminders } = await import('./bot.js');
    await sendPaymentReminders(undefined);
    res.json({ success: true, message: 'Payment reminder sweep executed successfully.' });
  } catch (e: any) {
    console.error('  ❌ Manual trigger failed:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get('/api/reminder-logs', authMiddleware, async (req, res) => {
  const { data: logs } = await db
    .from('nexus_reminder_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  res.json(logs || []);
});

app.get('/api/broadcasts', authMiddleware, requireRole('loan-officer', 'super-admin'), async (req, res) => {
  const { data: broadcasts } = await db
    .from('nexus_broadcasts')
    .select('*, sender:sent_by(name, email)')
    .order('id', { ascending: false });
  res.json(broadcasts || []);
});

app.post('/api/broadcasts', authMiddleware, requireRole('loan-officer', 'super-admin'), async (req, res) => {
  const { message, channel, target } = req.body;
  if (!message) return res.status(400).json({ error: 'message is required.' });

  const activeChannel = channel || 'both';
  const activeTarget = target || 'all';

  // 1. Fetch matching users
  let query = db.from('nexus_users').select('id, name, email, role, telegram_chat_id');
  if (activeTarget === 'linked') {
    query = query.not('telegram_chat_id', 'is', null);
  } else if (activeTarget.startsWith('role:')) {
    const roleName = activeTarget.split(':')[1];
    query = query.eq('role', roleName);
  } else if (activeTarget.startsWith('user:')) {
    const userId = Number(activeTarget.split(':')[1]);
    query = query.eq('id', userId);
  }
  const { data: targetUsers, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  let sentCount = 0;
  let failedCount = 0;

  const { default: botInstance } = await import('./bot.js');

  for (const user of targetUsers || []) {
    let success = false;

    // Send Telegram
    if ((activeChannel === 'telegram' || activeChannel === 'both') && user.telegram_chat_id) {
      try {
        if (botInstance) {
          await botInstance.sendMessage(user.telegram_chat_id, message, { parse_mode: 'Markdown' });
          success = true;
        }
      } catch (err) {
        console.error(`Broadcast Telegram send failed for user ${user.email}:`, err);
      }
    }

    // Send In-App
    if (activeChannel === 'in_app' || activeChannel === 'both') {
      try {
        notifyUser(user.id, message);
        success = true;
      } catch (err) {
        console.error(`Broadcast In-App send failed for user ${user.email}:`, err);
      }
    }

    if (success) sentCount++;
    else failedCount++;
  }

  // 2. Save broadcast record
  const { data: record, error: insertError } = await db
    .from('nexus_broadcasts')
    .insert({
      message,
      channel: activeChannel,
      target: activeTarget,
      sent_by: req.user.id,
      sent_count: sentCount,
      failed_count: failedCount
    })
    .select('*, sender:sent_by(name, email)')
    .single();

  if (insertError) return res.status(500).json({ error: insertError.message });
  logAudit('broadcast-sent', `Broadcast sent to ${activeTarget} via ${activeChannel} (Success: ${sentCount}, Fail: ${failedCount})`, req.user);
  res.status(201).json(record);
});

// ── STATS ROUTES ────────────────────────────────────────────

app.get('/api/stats', authMiddleware, requireRole('loan-officer', 'super-admin'), async (req, res) => {
  // Fetch transactions and join with users to get name/email
  const { data: txs } = await db
    .from('nexus_transactions')
    .select('id, title, date, amount, type, userId, nexus_users(name, email)')
    .order('id', { ascending: false });

  // Fetch all customers
  const { data: customers } = await db
    .from('nexus_users')
    .select('id, name, email, phone')
    .eq('role', 'customer')
    .order('name', { ascending: true });

  const { data: config } = await db.from('nexus_config').select('baseInterestRate').eq('id', 1).single();
  const rate = config ? Number(config.baseInterestRate) : 5.4;
  const rateMultiplier = rate / 100;

  // Process disbursements and repayments
  const volumeTransactions: any[] = [];
  const customerBalances: Record<number, { name: string; email: string; balance: number }> = {};

  let totalDisbursed = 0;
  let totalRepaid = 0;

  for (const t of txs || []) {
    const amountVal = Math.abs(Number(t.amount));
    const u = (t as any).nexus_users || { name: 'Unknown', email: '' };

    if (t.type === 'Loan Disbursement' || t.type === 'Repayment') {
      // Dynamically initialize user balance if not already present
      if (!customerBalances[t.userId]) {
        customerBalances[t.userId] = { name: u.name, email: u.email, balance: 0 };
      }

      if (t.type === 'Loan Disbursement') {
        volumeTransactions.push({
          id: t.id,
          title: t.title,
          date: t.date,
          amount: Number(t.amount),
          type: t.type,
          userName: u.name,
          userEmail: u.email
        });
        totalDisbursed += amountVal;
        customerBalances[t.userId].balance += amountVal;
      } else {
        totalRepaid += amountVal;
        customerBalances[t.userId].balance -= amountVal;
      }
    }
  }

  const totalVolume = totalDisbursed;
  const outstandingBalanceValue = totalDisbursed - totalRepaid;
  const interestEarned = outstandingBalanceValue * rateMultiplier;

  // Outstanding customers (balance > 0)
  const outstandingCustomers = Object.values(customerBalances)
    .filter(c => c.balance > 0.01)
    .map(c => ({
      name: c.name,
      email: c.email,
      balance: c.balance
    }));

  // Yield customers
  const yieldCustomers = outstandingCustomers.map(c => ({
    name: c.name,
    email: c.email,
    balance: c.balance,
    rate: rate,
    annualYield: c.balance * rateMultiplier
  }));

  res.json({
    totalVolume,
    activeCustomers: customers?.length || 0,
    outstandingBalanceValue,
    interestEarned,
    volumeTransactions,
    customerList: customers || [],
    outstandingCustomers,
    yieldCustomers
  });
});

// ── NOTIFICATION ROUTES ────────────────────────────────────

app.get('/api/notifications', authMiddleware, async (req, res) => {
  const { data: notifs } = await db.from('nexus_notifications').select('*').eq('userId', req.user.id).order('id', { ascending: false }).limit(20);
  res.json(notifs || []);
});

app.patch('/api/notifications/:id/read', authMiddleware, async (req, res) => {
  await db.from('nexus_notifications').update({ unread: false }).eq('id', parseInt(req.params.id)).eq('userId', req.user.id);
  res.json({ ok: true });
});

// ── WEBHOOK SYSTEM ──────────────────────────────────────────

interface WebhookRegistration {
  id: number;
  userId: number;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  createdAt: string;
}

let webhookIdCounter = 1;
// In production, store webhooks in nexus_webhooks table in Supabase.
// For simplicity, use in-memory storage that resets on server restart.
const webhooks: WebhookRegistration[] = [];

function generateWebhookSecret(): string {
  return crypto.randomBytes(24).toString('hex');
}

app.post('/api/webhooks/register', authMiddleware, async (req, res) => {
  const { url, events } = req.body;
  if (!url || !events?.length) return res.status(400).json({ error: 'url and events are required.' });
  const webhook: WebhookRegistration = {
    id: webhookIdCounter++,
    userId: req.user.id,
    url,
    events,
    secret: generateWebhookSecret(),
    active: true,
    createdAt: new Date().toISOString(),
  };
  webhooks.push(webhook);
  logAudit('webhook-registered', `Webhook registered for events: ${events.join(', ')} at ${url}`, req.user);
  res.status(201).json(webhook);
});

app.get('/api/webhooks', authMiddleware, async (req, res) => {
  const userWebhooks = webhooks.filter(w => w.userId === req.user.id || req.user.role === 'super-admin');
  res.json(userWebhooks.map(w => ({ ...w, secret: undefined })));
});

app.delete('/api/webhooks/:id', authMiddleware, async (req, res) => {
  const idx = webhooks.findIndex(w => w.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Webhook not found.' });
  if (webhooks[idx].userId !== req.user.id && req.user.role !== 'super-admin') {
    return res.status(403).json({ error: 'Access denied.' });
  }
  webhooks.splice(idx, 1);
  res.json({ message: 'Webhook deleted.' });
});

// Dispatch webhook events
async function dispatchWebhook(event: string, payload: Record<string, any>) {
  const targets = webhooks.filter(w => w.active && w.events.includes(event));
  for (const wh of targets) {
    const body = JSON.stringify({ event, timestamp: new Date().toISOString(), payload });
    const signature = crypto.createHmac('sha256', wh.secret).update(body).digest('hex');
    fetch(wh.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Nexus-Signature': signature, 'X-Nexus-Event': event },
      body,
    }).catch(() => {}); // fire-and-forget
  }
}

// ── SSE (Server-Sent Events) for real-time notifications ──

const sseClients = new Map<number, Set<any>>();

app.get('/api/notifications/stream', (req, res) => {
  const token = (req.query.token as string) || req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided.' });
  let user: any;
  try { user = jwt.verify(token, JWT_SECRET); } catch { return res.status(403).json({ error: 'Invalid or expired token.' }); }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.write('data: {"type":"connected"}\n\n');

  if (!sseClients.has(user.id)) sseClients.set(user.id, new Set());
  sseClients.get(user.id)!.add(res);

  const keepAlive = setInterval(() => res.write(': keepalive\n\n'), 30000);

  req.on('close', () => {
    clearInterval(keepAlive);
    sseClients.get(user.id)?.delete(res);
    if (sseClients.get(user.id)?.size === 0) sseClients.delete(user.id);
  });
});

// Notify SSE clients in real time
function notifyUserRealtime(userId: number, text: string) {
  const clients = sseClients.get(userId);
  if (clients) {
    const data = JSON.stringify({ type: 'notification', text, time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) });
    for (const client of clients) {
      client.write(`data: ${data}\n\n`);
    }
  }
}

// Patch notifyUser to push via SSE in addition to DB
const _origNotifyUser = notifyUser;
notifyUser = (userId: number, text: string) => {
  _origNotifyUser(userId, text);
  notifyUserRealtime(userId, text);
};
setNotifyUserCallback(notifyUser);

app.get('/api/diag', async (req, res) => {
  const { data: config } = await db.from('nexus_config').select('*').eq('id', 1).single();
  res.json({
    supabaseUrl: process.env.SUPABASE_URL,
    localTime: new Date().toISOString(),
    configRecord: config || null
  });
});

// ── AUDIT LOG ROUTES (Super Admin) ─────────────────────────

app.get('/api/audit/logs', authMiddleware, async (req, res) => {
  if (req.user.role !== 'super-admin') return res.json([]);
  const { data: logs } = await db.from('nexus_audit_logs').select('*').order('id', { ascending: false }).limit(100);
  res.json(logs || []);
});

// ── REGISTER ROUTE ────────────────────────────────────────

// Register — creates the user in Supabase with bcrypt-hashed password
// (email verification via /api/auth/send-otp + /api/auth/verify-otp)
app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const { name, password, phone } = req.body;
    const email = normalizeEmail(req.body.email);
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const { data: existing } = await db.from('nexus_users').select('id').eq('email', email).maybeSingle();
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const { data: newUser } = await db.from('nexus_users').insert({
      name, email, password: hashedPassword, role: 'customer', phone: phone || '',
      email_verified: false,
    }).select('id, name, email, role').single();
    if (!newUser) return res.status(500).json({ error: 'Failed to create account.' });

    res.status(201).json({ user: newUser });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ── SEND PASSWORD RESET LINK (stub — logs to console) ──────

app.post('/api/users/:id/send-reset-link', authMiddleware, async (req, res) => {
  if (req.user.role !== 'super-admin') return res.status(403).json({ error: 'Admins only.' });
  const { data: user } = await db.from('nexus_users').select('id, name, email').eq('id', parseInt(req.params.id)).single();
  if (!user) return res.status(404).json({ error: 'User not found.' });

  const tmpl = emailTemplates.passwordReset(user.name, user.email);
  await sendEmail(user.email, tmpl.subject, tmpl.html).catch((err) => console.error('Failed to send password reset email:', err));

  logAudit('password-reset-link', `Reset link sent to ${user.email}`, req.user);
  notifyUser(user.id, 'A password reset link has been sent to your email.');
  res.json({ message: 'Reset link sent successfully.' });
});

// ── DOCUMENT UPLOAD (KYC) ──────────────────────────────────

app.post('/api/documents/upload', authMiddleware, async (req, res) => {
  const { fileName, fileType, fileData, docCategory } = req.body;
  if (!fileName || !fileType || !fileData) {
    return res.status(400).json({ error: 'fileName, fileType, and fileData are required.' });
  }
  const { data: doc } = await db.from('nexus_documents').insert({
    userId: req.user.id,
    userEmail: req.user.email,
    fileName,
    fileType,
    fileData,
    docCategory: docCategory || 'other',
    uploadedAt: new Date().toISOString(),
  }).select().single();
  logAudit('document-uploaded', `${fileName} (${docCategory}) uploaded by ${req.user.email}`, req.user);
  res.status(201).json(doc);
});

app.get('/api/documents', authMiddleware, async (req, res) => {
  const { data: docs } = await db.from('nexus_documents').select('id, fileName, fileType, docCategory, uploadedAt, userEmail').eq('userId', req.user.id).order('id', { ascending: false });
  res.json(docs || []);
});

app.delete('/api/documents/:id', authMiddleware, async (req, res) => {
  const { data: doc } = await db.from('nexus_documents').select('userId').eq('id', parseInt(req.params.id)).single();
  if (!doc) return res.status(404).json({ error: 'Document not found.' });
  if (doc.userId !== req.user.id && req.user.role !== 'super-admin') {
    return res.status(403).json({ error: 'Access denied.' });
  }
  await db.from('nexus_documents').delete().eq('id', parseInt(req.params.id));
  res.json({ message: 'Document deleted.' });
});

app.get('/api/documents/:id/view', authMiddleware, async (req, res) => {
  const { data: doc } = await db.from('nexus_documents').select('*').eq('id', parseInt(req.params.id)).single();
  if (!doc) return res.status(404).json({ error: 'Document not found.' });
  if (doc.userId !== req.user.id && req.user.role !== 'super-admin') {
    return res.status(403).json({ error: 'Access denied.' });
  }
  const buf = Buffer.from(doc.fileData, 'base64');
  res.set('Content-Type', doc.fileType);
  res.set('Content-Disposition', `inline; filename="${doc.fileName}"`);
  res.send(buf);
});

// ── SUPPORT ROUTES ─────────────────────────────────────────

app.post('/api/support/message', authMiddleware, (req, res) => {
  const { name, email, message } = req.body;
  console.log(`\n  📧 Support message from ${name} (${email}):`);
  console.log(`  └─ ${message}`);
  res.json({ message: 'Message sent successfully. We will get back to you shortly.' });
});

// ── Global error handler ────────────────────────────────────

app.use((err: any, req: any, res: any, next: any) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

// ── HEALTH CHECK ─────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// ── KHQR Routes (available in all environments) ────────────
app.get('/api/khqr/generate', async (req, res) => {
  try {
    const { bakongAccountId, merchantName, merchantCity, currency, amount, countryCode, storeLabel, phone, email } = req.query;
    if (!bakongAccountId || !merchantName) {
      return res.status(400).json({ error: 'bakongAccountId and merchantName are required' });
    }
    const result = await generateKHQR({
      bakongAccountId: bakongAccountId as string,
      merchantName: merchantName as string,
      merchantCity: (merchantCity as string) || 'Phnom Penh',
      currency: (currency as '840' | '116') || '840',
      amount: amount ? parseFloat(amount as string) : undefined,
      storeLabel: storeLabel as string,
      phone: phone as string,
      email: email as string,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate KHQR' });
  }
});

app.get('/api/khqr/verify', (req, res) => {
  try {
    const { qr } = req.query;
    if (!qr) return res.status(400).json({ error: 'qr parameter is required' });
    const result = verifyKHQR(qr as string);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to verify KHQR' });
  }
});

app.get('/api/khqr/decode', (req, res) => {
  try {
    const { qr } = req.query;
    if (!qr) return res.status(400).json({ error: 'qr parameter is required' });
    const result = decodeKHQR(qr as string);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to decode KHQR' });
  }
});

app.get('/api/khqr/deeplink', (req, res) => {
  try {
    const { qr } = req.query;
    if (!qr) return res.status(400).json({ error: 'qr parameter is required' });
    const result = generateDeeplink(qr as string);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate deeplink' });
  }
});

app.get('/api/khqr/check-transaction', (req, res) => {
  try {
    const { referenceId } = req.query;
    if (!referenceId) return res.status(400).json({ error: 'referenceId is required' });
    const result = checkTransaction(referenceId as string);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to check transaction' });
  }
});

// ── PayWay QR Code Routes (persisted in Supabase) ──────────

// Record an approved payment: update the payway row, write to the ledger,
// notify the user via app + Telegram.
async function recordPaidPayment(tranId: string, apv?: string) {
  const { data: stored } = await db.from('nexus_payway_transactions').select('*').eq('tran_id', tranId).maybeSingle();
  if (!stored) {
    console.error(`recordPaidPayment: transaction ${tranId} not found`);
    return;
  }
  if (stored.status === 'APPROVED') return; // already recorded — no double-entry

  await db.from('nexus_payway_transactions')
    .update({ status: 'APPROVED', apv: apv || stored.apv, paid_at: new Date().toISOString() })
    .eq('tran_id', tranId);

  const amount = Number(stored.amount) || 0;

  if (stored.email) {
    const { data: user } = await db.from('nexus_users').select('id, name, telegram_chat_id').eq('email', stored.email).maybeSingle();
    if (user) {
      await db.from('nexus_transactions').insert({
        id: 'tx_pw' + Date.now().toString().slice(-6),
        title: 'Repayment',
        date: new Date().toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' }),
        amount: -Math.abs(amount),
        type: 'Repayment',
        userId: user.id,
      });
      notifyUser(user.id, `Payment of $${amount.toLocaleString()} received. Thank you!`);
      if (user.telegram_chat_id) {
        try {
          const { sendPaymentConfirmation } = await import('./bot.js');
          await sendPaymentConfirmation(user.telegram_chat_id, {
            loanId: stored.loan_id || '',
            amount,
            tranId,
          });
        } catch (e) {
          console.error('Telegram payment confirmation failed:', e);
        }
      }
    }
  }

  logAudit('payment-approved', `PayWay payment ${tranId} approved ($${amount.toLocaleString()} ${stored.currency})`,
    { id: stored.user_id || 0, email: stored.email || '', name: '', role: '' });
  console.log(`PayWay payment recorded: ${tranId} → APPROVED ($${amount})`);
}

app.post('/api/payway/generate-qr', async (req, res) => {
  try {
    const { amount, currency, email, loanId } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'amount is required and must be > 0' });
    }

    const frontendUrl = process.env.CORS_ORIGIN || 'https://nexusfinancefintech.vercel.app';
    const result = payway.buildPurchaseRequest({
      amount,
      currency: currency || 'USD',
      email: email || '',
      items: [{ name: `Loan Repayment - ${loanId || 'N/A'}`, quantity: 1, price: amount }],
    }, frontendUrl);

    const userEmail = email ? normalizeEmail(email) : null;
    let userId: number | null = null;
    if (userEmail) {
      const { data: u } = await db.from('nexus_users').select('id').eq('email', userEmail).maybeSingle();
      userId = u?.id ?? null;
    }

    try {
      await db.from('nexus_payway_transactions').insert({
        tran_id: result.tranId,
        email: userEmail,
        amount,
        currency: currency || 'USD',
        status: 'PENDING',
        loan_id: loanId ? String(loanId) : null,
        user_id: userId,
      }).select().single();
    } catch (err) {
      console.error('PayWay insert failed:', err);
    }

    res.json(result);
  } catch (err: any) {
    console.error('PayWay generateQR error:', err.message || err);
    res.status(500).json({ error: err.message || 'Failed to create payment' });
  }
});

app.post('/api/payway/verify-payment', async (req, res) => {
  try {
    const { tranId } = req.body;
    if (!tranId) return res.status(400).json({ error: 'tranId is required' });
    const result = await payway.checkTransaction(tranId);

    if (result.status === 'APPROVED') {
      await recordPaidPayment(tranId, result.apv);
    }

    res.json(result);
  } catch (err: any) {
    console.error('PayWay verify error:', err.message || err);
    res.status(500).json({ error: err.message || 'Failed to verify payment' });
  }
});

app.post('/api/payway/callback', async (req, res) => {
  try {
    const signature = req.headers['x-payway-hmac-sha512'] as string || '';
    const body = JSON.stringify(req.body);

    const isValid = payway.verifyWebhook(body, signature);
    if (!isValid) {
      console.warn('PayWay callback: invalid signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { tran_id, apv, status } = req.body;
    if (status === '0') {
      await recordPaidPayment(tran_id, apv);
    } else {
      await db.from('nexus_payway_transactions')
        .update({ status: 'DECLINED', apv })
        .eq('tran_id', tran_id)
        .then(null, (err) => console.error('PayWay decline update failed:', err));
      console.log(`PayWay callback: ${tran_id} → DECLINED`);
    }

    res.json({ success: true });
  } catch (err: any) {
    console.error('PayWay callback error:', err.message || err);
    res.status(500).json({ error: 'Callback processing failed' });
  }
});

// ── Purchase API (hosted checkout redirect) ─────────────────
app.post('/api/payway/purchase', async (req, res) => {
  try {
    const { amount, currency, email, loanId, firstname, lastname, phone } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'amount is required and must be > 0' });
    }

    const frontendUrl = process.env.CORS_ORIGIN || 'https://nexusfinancefintech.vercel.app';
    const result = payway.buildPurchaseRequest({
      amount,
      currency: currency || 'USD',
      email: email || '',
      firstname: firstname || '',
      lastname: lastname || '',
      phone: phone || '',
      loanId: loanId || '',
      items: [{ name: `Loan Repayment - ${loanId || 'N/A'}`, quantity: 1, price: amount }],
    }, frontendUrl);

    const userEmail = email ? normalizeEmail(email) : null;
    let userId: number | null = null;
    if (userEmail) {
      const { data: u } = await db.from('nexus_users').select('id').eq('email', userEmail).maybeSingle();
      userId = u?.id ?? null;
    }

    try {
      await db.from('nexus_payway_transactions').insert({
        tran_id: result.tranId,
        email: userEmail,
        amount,
        currency: currency || 'USD',
        status: 'PENDING',
        loan_id: loanId ? String(loanId) : null,
        user_id: userId,
      }).select().single();
    } catch (err) {
      console.error('PayWay purchase insert failed:', err);
    }

    res.json(result);
  } catch (err: any) {
    console.error('PayWay purchase error:', err.message || err);
    res.status(500).json({ error: err.message || 'Failed to create purchase' });
  }
});

app.get('/api/payway/return', async (req, res) => {
  try {
    const tranId = req.query.tran_id as string;
    const signature = req.query.hash as string || '';
    const frontendUrl = process.env.CORS_ORIGIN || 'https://nexusfinancefintech.vercel.app';

    if (tranId && signature) {
      const { data: stored } = await db.from('nexus_payway_transactions').select('*').eq('tran_id', tranId).maybeSingle();
      if (stored && stored.status !== 'APPROVED') {
        try {
          const result = await payway.checkTransaction(tranId);
          if (result.status === 'APPROVED') {
            await recordPaidPayment(tranId, result.apv);
          }
        } catch (err) {
          console.error('PayWay return verify failed:', err);
        }
      }
    }

    res.redirect(`${frontendUrl}/payment/success${tranId ? '?tran_id=' + encodeURIComponent(tranId) : ''}`);
  } catch (err: any) {
    const frontendUrl = process.env.CORS_ORIGIN || 'https://nexusfinancefintech.vercel.app';
    res.redirect(`${frontendUrl}/payment/success`);
  }
});

app.get('/api/payway/cancel', (req, res) => {
  const frontendUrl = process.env.CORS_ORIGIN || 'https://nexusfinancefintech.vercel.app';
  res.redirect(`${frontendUrl}/payment/cancel`);
});

// ── Simulate Payment (sandbox testing only) ────────────────
app.post('/api/payway/simulate-payment', async (req, res) => {
  try {
    const { tranId } = req.body;
    if (!tranId) return res.status(400).json({ error: 'tranId is required' });
    const { data: stored } = await db.from('nexus_payway_transactions').select('*').eq('tran_id', tranId).maybeSingle();
    if (!stored) return res.status(404).json({ error: 'Transaction not found' });

    const apv = Math.floor(100000 + Math.random() * 900000).toString();
    await recordPaidPayment(tranId, apv);
    console.log(`Simulated payment: ${tranId} → APPROVED`);

    res.json({ success: true, status: 'APPROVED', apv });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Simulation failed' });
  }
});

app.get('/api/payway/transactions', async (req, res) => {
  try {
    const { data: txs } = await db.from('nexus_payway_transactions')
      .select('tran_id, email, amount, currency, status, apv, loan_id, created_at, paid_at')
      .order('id', { ascending: false })
      .limit(50);
    res.json(txs || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to load transactions' });
  }
});

// ── PRODUCTION: serve frontend build ─────────────────────────

if (process.env.NODE_ENV === 'production') {
  const distDir = path.join(process.cwd(), 'dist');

  // ── SPA catch-all ────────────────────────────────────────────
  app.use(express.static(distDir));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
    } else {
      const indexPath = path.join(distDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.type('html').send(fs.readFileSync(indexPath, 'utf-8'));
      } else {
        res.status(404).send('Not found');
      }
    }
  });
}

// Amortization math helpers for Repayment Schedule calculations
function calculateMonthlyPayment(amount: number, durationMonths: number, annualRate = 0.054): number {
  if (durationMonths <= 0) return amount;
  const r = annualRate / 12;
  const n = durationMonths;
  if (r === 0) return amount / n;
  return (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function formatMessageToHtml(msg: string): string {
  return msg
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
}

app.post('/api/loans/:id/chase', authMiddleware, requireRole('loan-officer', 'super-admin'), async (req, res) => {
  const { id } = req.params;
  const cleanId = id.startsWith('#') ? id : '#' + id;
  const { data: loan } = await db.from('nexus_loans').select('*').eq('id', cleanId).maybeSingle();
  
  if (!loan) {
    return res.status(404).json({ error: 'Loan application not found.' });
  }

  // Fetch target customer
  const { data: user } = await db.from('nexus_users').select('*').eq('email', loan.applicantEmail).maybeSingle();
  if (!user) {
    return res.status(404).json({ error: 'Applicant customer account not found.' });
  }

  const amount = Number(loan.amount) || 0;
  const duration = Number(loan.durationMonths) || 1;
  const monthly = calculateMonthlyPayment(amount, duration);

  const { message: customMessage } = req.body;
  const message = customMessage || `⚠️ *URGENT PAYMENT REMINDER* ⚠️\n\nDear *${loan.applicantName}*,\n\nOur records show that your monthly installment of *$${monthly.toFixed(2)}* is currently overdue for Loan *#${loan.id}*.\n\nPlease log in to the portal and settle your outstanding payment immediately.\n\n🔗 [Pay Outstanding Balance](https://nexusfinancefintech.vercel.app/)`;

  let sentTelegram = false;
  let sentSMS = false;
  let sentEmail = false;

  // 1. Telegram
  if (user.telegram_chat_id && bot) {
    try {
      await bot.sendMessage(user.telegram_chat_id, message, { parse_mode: 'Markdown' });
      sentTelegram = true;
    } catch (e) {
      console.error('Failed to send Telegram chase notice:', e);
    }
  }

  // 2. Email
  try {
    const subject = `🚨 OVERDUE NOTICE: Loan Payment Outstanding - Loan #${loan.id}`;
    const htmlContent = formatMessageToHtml(message);
    await sendEmail(loan.applicantEmail, subject, `
      <div style="font-family: sans-serif; padding: 20px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #ef4444; margin-top: 0;">🚨 Urgent: Payment Overdue Notice</h2>
        <p style="line-height: 1.6; font-size: 14px;">${htmlContent}</p>
        <div style="margin: 25px 0;">
          <a href="https://nexusfinancefintech.vercel.app/" style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Make Payment Now</a>
        </div>
        <p style="color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 25px;">NexusFinance Fintech Inc. Cambodia</p>
      </div>
    `);
    sentEmail = true;
  } catch (e) {
    console.error('Failed to send Email chase notice:', e);
  }

  // 3. SMS
  try {
    if (user.phone) {
      const plainText = message.replace(/\*(.*?)\*/g, '$1');
      await sendSMS(user.phone, plainText);
      sentSMS = true;
    }
  } catch (e) {
    console.error('Failed to send SMS chase notice:', e);
  }

  await logAudit('payment_chase', `Sent payment chase reminder (Telegram: ${sentTelegram}, Email: ${sentEmail}, SMS: ${sentSMS}) to customer ${loan.applicantEmail}`, req.user);

  res.json({ success: true, message: 'Chase reminder notifications dispatched successfully.' });
});

// ── 404 catch-all ────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// ── START THE SERVER ────────────────────────────────────────

async function seedDemoUsers() {
  const demoUsers = [
    { email: 'customer@nexus.com', name: 'Demo Customer', role: 'customer' },
    { email: 'officer@nexus.com', name: 'Demo Officer', role: 'loan-officer' },
    { email: 'admin@nexus.com', name: 'Admin', role: 'super-admin' },
  ];
  for (const u of demoUsers) {
    const { data: existing } = await db.from('nexus_users').select('id').eq('email', u.email).maybeSingle();
    if (!existing) {
      const passwordHash = await bcrypt.hash('password123', 10);
      await db.from('nexus_users').insert({ ...u, password: passwordHash, phone: '', email_verified: true });
      console.log(`  👤 Seeded demo account: ${u.email}`);
    }
  }
}

app.listen(PORT, async () => {
  console.log(`\n  🚀 NexusFinance API is running!`);
  console.log(`  📍 http://localhost:${PORT}`);
  try {
    await seedDemoUsers();
  } catch (e) {
    console.error('  ⚠️ Demo user seeding failed:', e);
  }
  console.log(`  \n  👤 Demo accounts:`);
  console.log(`     customer@nexus.com  / password123  → Customer portal`);
  console.log(`     officer@nexus.com   / password123  → Loan Officer`);
  console.log(`     admin@nexus.com     / password123  → Super Admin\n`);

  // ── Dynamic daily payment reminders cron startup ──
  let reminderTime = '07:00';
  try {
    const { data: config } = await db.from('nexus_config').select('reminder_time').eq('id', 1).single();
    if (config && config.reminder_time) {
      reminderTime = config.reminder_time;
    }
  } catch (err) {
    console.warn('  ⚠️ Could not load reminder_time from nexus_config, defaulting to 07:00');
  }
  scheduleReminderCron(reminderTime);
});
