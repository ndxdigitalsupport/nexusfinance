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
import { updateUserPassword, createAppwriteUser } from './appwrite.js';
import { sendSMS } from './sms.js';
import { verifyKHQR, decodeKHQR, generateDeeplink } from './khqr.js';
import { generateKHQR, checkTransaction } from './bakong.js';
import { sendEmail, emailTemplates } from './email.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs';
import cookieParser from 'cookie-parser';

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

function logAudit(action: string, details: string, user: any) {
  db.from('nexus_audit_logs').insert({ action, details, userId: user.id, userEmail: user.email }).then(null, (err) => console.error('logAudit failed:', err));
}

let notifyUser = function(userId: number, text: string) {
  const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  db.from('nexus_notifications').insert({ userId, text, time }).then(null, (err) => console.error('notifyUser failed:', err));
};

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

// ── AUTH ROUTES ────────────────────────────────────────────

function generateToken(user: { id: number; email: string; name: string; role: string; }) {
  return jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
}

// Login with email + password (bcrypt verified against database)
app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
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

    const token = generateToken({ id: dbUser.id, email: dbUser.email, name: dbUser.name, role: dbUser.role });
    logAudit('login', `User ${dbUser.email} logged in`, { id: dbUser.id, email: dbUser.email, name: dbUser.name, role: dbUser.role });
    res.json({ token, user: { id: dbUser.id, name: dbUser.name, email: dbUser.email, role: dbUser.role } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Session exchange for users authenticated via Appwrite (legacy) or Google OAuth
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

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  const { data: user } = await db.from('nexus_users').select('id, name, email, role, phone').eq('id', req.user.id).maybeSingle();
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json(user);
});

app.patch('/api/auth/profile', authMiddleware, async (req, res) => {
  const { name, email, phone } = req.body;
  const updates: any = {};
  if (name !== undefined) updates.name = name;
  if (email !== undefined) updates.email = email;
  if (phone !== undefined) updates.phone = phone;
  if (email) {
    const { data: existing } = await db.from('nexus_users').select('id').eq('email', email).neq('id', req.user.id).single();
    if (existing) return res.status(400).json({ error: 'Email already in use.' });
  }
  const { data: updated } = await db.from('nexus_users').update(updates).eq('id', req.user.id).select('id, name, email, role, phone').single();
  if (!updated) return res.status(404).json({ error: 'User not found.' });
  res.json({ user: updated });
});

// ── FORGOT PASSWORD ──────────────────────────────────────

app.post('/api/auth/forgot-password', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const { data: dbUser } = await db.from('nexus_users').select('id, name, email').eq('email', email).maybeSingle();
    if (dbUser) {
      const tmpl = emailTemplates.passwordReset(dbUser.name, dbUser.email);
      await sendEmail(dbUser.email, tmpl.subject, tmpl.html);
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
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'https://nexusfinance-5okf.onrender.com/api/auth/google/callback';
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

    // Find or create user in database
    let { data: dbUser } = await db.from('nexus_users').select('*').eq('email', googleUser.email).maybeSingle();
    if (!dbUser) {
      const { data: newUser } = await db.from('nexus_users').insert({
        name: googleUser.name || googleUser.email.split('@')[0],
        email: googleUser.email,
        role: 'customer',
      phone: '',
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
  const result = await sendSMS(to, text);
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
  res.json(loans || []);
});

app.post('/api/loans', authMiddleware, async (req, res) => {
  const { applicantName, applicantEmail, initials, amount, type, purpose, creditScore, monthlyIncome, durationMonths } = req.body;
  const loanId = '#77' + Math.floor(1000 + Math.random() * 9000);

  const { data: newLoan } = await db.from('nexus_loans').insert({
    id: loanId,
    applicantName: applicantName || req.user.name,
    applicantEmail: applicantEmail || req.user.email,
    initials: initials || req.user.name.split(' ').map(n => n[0]).join('').toUpperCase(),
    amount: amount || 2500,
    type: type || 'Personal',
    status: 'New',
    urgency: 'Normal',
    assignedTo: null,
    date: new Date().toISOString().split('T')[0],
    purpose: purpose || 'Not specified',
    creditScore: creditScore || 700,
    monthlyIncome: monthlyIncome || 4000,
    durationMonths: durationMonths || 24,
  }).select().single();

  const taskTypes = ['KYC Verification Call', 'Credit Score Audit', 'Collateral Registry Verification'];
  const { data: existingTasks } = await db.from('nexus_tasks').select('id');
  await db.from('nexus_tasks').insert({
    id: 't' + Date.now().toString().slice(-6),
    title: taskTypes[(existingTasks?.length || 0) % taskTypes.length],
    applicant: newLoan.applicantName,
    regarding: `${newLoan.type} Loan ${newLoan.id}`,
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    completed: false,
  });

  dispatchWebhook('loan.created', { loanId: newLoan.id, applicant: newLoan.applicantName, amount: newLoan.amount, type: newLoan.type });
  res.status(201).json(newLoan);
});

app.patch('/api/loans/:id/approve', authMiddleware, async (req, res) => {
  const { data: loan } = await db.from('nexus_loans').select('*').eq('id', req.params.id).single();
  if (!loan) return res.status(404).json({ error: 'Loan not found.' });

  await db.from('nexus_loans').update({ status: 'Approved', assignedTo: req.user.id }).eq('id', req.params.id);
  logAudit('loan-approved', `Loan ${loan.id} (${loan.type}) for ${loan.applicantName} approved`, req.user);

  const { data: applicantUser } = await db.from('nexus_users').select('id, name, email').eq('email', loan.applicantEmail).single();
  await db.from('nexus_transactions').insert({
    id: 'tx_fst' + Date.now().toString().slice(-6),
    title: 'Loan Disbursement',
    date: new Date().toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' }),
    amount: loan.amount,
    type: 'Loan Disbursement',
    userId: applicantUser?.id || 1,
  });
  if (applicantUser) {
    notifyUser(applicantUser.id, `Your loan ${loan.id} has been approved — $${loan.amount.toLocaleString()} disbursed.`);
    const tmpl = emailTemplates.loanApproved(applicantUser.name, loan.id, loan.amount);
    await sendEmail(applicantUser.email, tmpl.subject, tmpl.html);
  }
  dispatchWebhook('loan.approved', { loanId: loan.id, applicant: loan.applicantName, amount: loan.amount, type: loan.type });
  res.json({ ...loan, status: 'Approved', assignedTo: req.user.id });
});

app.patch('/api/loans/:id/reject', authMiddleware, async (req, res) => {
  const { data: loan } = await db.from('nexus_loans').select('*').eq('id', req.params.id).single();
  if (!loan) return res.status(404).json({ error: 'Loan not found.' });
  await db.from('nexus_loans').update({ status: 'Rejected' }).eq('id', req.params.id);
  logAudit('loan-rejected', `Loan ${loan.id} (${loan.type}) for ${loan.applicantName} rejected`, req.user);
  const { data: applicantUser } = await db.from('nexus_users').select('id, name, email').eq('email', loan.applicantEmail).single();
  if (applicantUser) {
    notifyUser(applicantUser.id, `Your loan ${loan.id} application has been rejected.`);
    const tmpl = emailTemplates.loanRejected(applicantUser.name, loan.id);
    await sendEmail(applicantUser.email, tmpl.subject, tmpl.html);
  }
  dispatchWebhook('loan.rejected', { loanId: loan.id, applicant: loan.applicantName, type: loan.type });
  res.json({ ...loan, status: 'Rejected' });
});

app.patch('/api/loans/:id/hold', authMiddleware, async (req, res) => {
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

app.get('/api/tasks', authMiddleware, async (req, res) => {
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
  const { data: users } = await db.from('nexus_users').select('id, name, email, role');
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
  await sendEmail(user.email, tmpl.subject, tmpl.html);
  res.json({ id: user.id, ...req.body });
});

app.patch('/api/users/:id/reset-password', authMiddleware, async (req, res) => {
  if (req.user.role !== 'super-admin') return res.status(403).json({ error: 'Admins only.' });
  const { password } = req.body;
  if (!password || password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  const { data: user } = await db.from('nexus_users').select('id, name, email').eq('id', parseInt(req.params.id)).single();
  if (!user) return res.status(404).json({ error: 'User not found.' });
  try { await updateUserPassword(user.email, password); } catch (e) { console.error('Failed to update Appwrite password:', e); }
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
  logAudit('config-updated', `Platform config updated: ${JSON.stringify(req.body)}`, req.user);
  await db.from('nexus_config').update(req.body).eq('id', 1);
  const { data: config } = await db.from('nexus_config').select('*').eq('id', 1).single();
  res.json(config);
});

// ── STATS ROUTES ────────────────────────────────────────────

app.get('/api/stats', authMiddleware, async (req, res) => {
  const { data: allDisbursements } = await db.from('nexus_transactions').select('amount').eq('type', 'Loan Disbursement');
  const { data: allRepayments } = await db.from('nexus_transactions').select('amount').eq('type', 'Repayment');
  const { count: activeCustomers } = await db.from('nexus_users').select('*', { count: 'exact', head: true }).eq('role', 'customer');

  const totalDisbursed = (allDisbursements || []).reduce((s: number, t: any) => s + Math.abs(t.amount), 0);
  const totalRepaid = (allRepayments || []).reduce((s: number, t: any) => s + Math.abs(t.amount), 0);
  const totalVolume = totalDisbursed + totalRepaid;
  const outstandingBalanceValue = totalDisbursed - totalRepaid;
  const interestEarned = outstandingBalanceValue * 0.054;

  res.json({ totalVolume, activeCustomers: activeCustomers || 0, outstandingBalanceValue, interestEarned });
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

// ── AUDIT LOG ROUTES (Super Admin) ─────────────────────────

app.get('/api/audit/logs', authMiddleware, async (req, res) => {
  if (req.user.role !== 'super-admin') return res.json([]);
  const { data: logs } = await db.from('nexus_audit_logs').select('*').order('id', { ascending: false }).limit(100);
  res.json(logs || []);
});

// ── REGISTER ROUTE ────────────────────────────────────────

// Register — creates user in Appwrite only (not in Supabase yet).
// After user verifies email via Appwrite, they call /api/auth/complete-registration
app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
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
    }).select('id, name, email, role').single();
    if (!newUser) return res.status(500).json({ error: 'Failed to create account.' });

    // Try to create in Appwrite for email verification (best-effort, don't block)
    try {
      await createAppwriteUser(email, password, name);
    } catch (awErr) {
      console.warn('Appwrite create skipped:', awErr);
    }

    logAudit('register', `User ${email} registered`, { id: newUser.id, email: newUser.email, name: newUser.name, role: 'customer' });
    res.status(201).json({ user: newUser, message: 'Account created! You can now sign in.' });
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
  await sendEmail(user.email, tmpl.subject, tmpl.html);

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

// ── PRODUCTION: serve frontend build ─────────────────────────

if (process.env.NODE_ENV === 'production') {
  const appwriteConfig = JSON.stringify({
    endpoint: process.env.APPWRITE_ENDPOINT,
    projectId: process.env.APPWRITE_PROJECT_ID,
  });
  const distDir = path.join(process.cwd(), 'dist');

  // ── SPA catch-all ────────────────────────────────────────────
  app.use(express.static(distDir));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
    } else {
      const indexPath = path.join(distDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        let html = fs.readFileSync(indexPath, 'utf-8');
        html = html.replace('</head>', `<script>window.__APPWRITE__=${appwriteConfig}</script></head>`);
        res.type('html').send(html);
      } else {
        res.status(404).send('Not found');
      }
    }
  });
}

// ── 404 catch-all ────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// ── START THE SERVER ────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n  🚀 NexusFinance API is running!`);
  console.log(`  📍 http://localhost:${PORT}`);
  console.log(`  \n  👤 Demo accounts:`);
  console.log(`     customer@nexus.com  / password123  → Customer portal`);
  console.log(`     officer@nexus.com   / password123  → Loan Officer`);
  console.log(`     admin@nexus.com     / password123  → Super Admin\n`);
});
