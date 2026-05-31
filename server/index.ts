// ============================================================
// NEXUSFINANCE BACKEND API — Supabase-backed Express server
// ============================================================

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import SentDm from '@sentdm/sentdm';
import { db } from './db.js';

dotenv.config();

const sentClient = new SentDm({
  apiKey: process.env.SENT_DM_API_KEY || '',
});

const otpStore = new Map<string, { code: string; expiresAt: number }>();

declare global {
  namespace Express {
    interface User {
      id: number; email: string; name: string; role: string;
    }
  }
}

const app = express();
const PORT = 3001;
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) { console.error('FATAL: JWT_SECRET environment variable is required.'); process.exit(1); }

const requiredEnv = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE'];
for (const key of requiredEnv) {
  if (!process.env[key]) { console.error(`FATAL: ${key} is not set in .env`); process.exit(1); }
}

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
app.use(cors({ origin: corsOrigin }));
app.use(express.json());
app.use(passport.initialize());

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { error: 'Too many attempts. Try again later.' } });
const otpLimiter = rateLimit({ windowMs: 5 * 60 * 1000, max: 5, message: { error: 'Too many OTP requests. Try again later.' } });

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: 'http://localhost:3001/api/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  const email = profile.emails?.[0]?.value || `${profile.id}@google.com`;
  const { data: existing } = await db.from('nexus_users').select('*').eq('email', email).single();
  if (existing) return done(null, existing);

  const { data: newUser } = await db.from('nexus_users').insert({
    name: profile.displayName || email.split('@')[0],
    email,
    password: '',
    role: 'customer',
  }).select().single();

  done(null, newUser);
}));

function asyncHandler(fn: (req: any, res: any, next: any) => Promise<any>) {
  return (req: any, res: any, next: any) => fn(req, res, next).catch((err: any) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  });
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

// ── AUTH ROUTES ─────────────────────────────────────────────

app.post('/api/auth/login', authLimiter, asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { data: user } = await db.from('nexus_users').select('*').eq('email', email).single();
  if (!user) return res.status(400).json({ error: 'User not found with that email.' });
  if (!bcrypt.compareSync(password, user.password)) return res.status(400).json({ error: 'Wrong password.' });

  const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

app.post('/api/auth/register', authLimiter, asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  const { data: existing } = await db.from('nexus_users').select('id').eq('email', email).single();
  if (existing) return res.status(400).json({ error: 'Email already registered.' });

  const { data: newUser } = await db.from('nexus_users').insert({
    name, email, password: bcrypt.hashSync(password, 10), role: 'customer', phone: phone || '',
  }).select().single();
  if (!newUser) return res.status(500).json({ error: 'Registration failed.' });

  const token = jwt.sign({ id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } });
});

app.post('/api/auth/forgot-password', asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });
  const { data: user } = await db.from('nexus_users').select('id').eq('email', email).single();
  if (!user) return res.status(404).json({ error: 'No account found with that email.' });
  console.log(`\n  🔑 Password reset requested for ${email}`);
  res.json({ message: 'Password reset link sent to your email.' });
});

app.post('/api/auth/send-otp', otpLimiter, (req, res) => {
  const { via, email, phone } = req.body;

  if (via === 'email') {
    if (!email) return res.status(400).json({ error: 'Email is required.' });
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(`email:${email}`, { code, expiresAt: Date.now() + 5 * 60 * 1000 });
    console.log(`\n  🔑 DEV OTP for ${email}: ${code}\n`);
    return res.json({ message: 'OTP sent to email.' });
  }

  if (!phone) return res.status(400).json({ error: 'Phone number is required.' });
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(`phone:${phone}`, { code, expiresAt: Date.now() + 5 * 60 * 1000 });

  if (!process.env.SENT_DM_API_KEY) {
    console.log(`\n  🔑 DEV OTP for ${phone}: ${code}\n`);
  } else {
    sentClient.messages.send({
      to: [phone],
      template: {
        id: process.env.SENT_OTP_TEMPLATE_ID || undefined,
        name: process.env.SENT_OTP_TEMPLATE || 'verification',
        parameters: { code },
      },
    }).catch(err => console.warn('⚠️ Sent DM send failed:', err.message));
  }
  res.json({ message: 'OTP sent successfully.' });
});

app.post('/api/auth/verify-otp', (req, res) => {
  const { via, email, phone, code } = req.body;

  if (via === 'email') {
    if (!email || !code) return res.status(400).json({ error: 'Email and code are required.' });
    const key = `email:${email}`;
    const stored = otpStore.get(key);
    if (!stored) return res.status(400).json({ error: 'No OTP found. Request a new one.' });
    if (Date.now() > stored.expiresAt) { otpStore.delete(key); return res.status(400).json({ error: 'OTP expired. Request a new one.' }); }
    if (stored.code !== code) return res.status(400).json({ error: 'Invalid verification code.' });
    otpStore.delete(key);
    return res.json({ message: 'Email verified successfully.' });
  }

  if (!phone || !code) return res.status(400).json({ error: 'Phone and code are required.' });
  const key = `phone:${phone}`;
  const stored = otpStore.get(key);
  if (!stored) return res.status(400).json({ error: 'No OTP found. Request a new one.' });
  if (Date.now() > stored.expiresAt) { otpStore.delete(key); return res.status(400).json({ error: 'OTP expired. Request a new one.' }); }
  if (stored.code !== code) return res.status(400).json({ error: 'Invalid verification code.' });
  otpStore.delete(key);
  res.json({ message: 'Phone verified successfully.' });
});

app.get('/api/auth/me', authMiddleware, asyncHandler(async (req, res) => {
  const { data: user } = await db.from('nexus_users').select('id, name, email, role, phone').eq('id', req.user.id).single();
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json(user);
});

app.patch('/api/auth/profile', authMiddleware, asyncHandler(async (req, res) => {
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

  const token = jwt.sign({ id: updated.id, email: updated.email, name: updated.name, role: updated.role }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ user: updated, token });
});

app.patch('/api/auth/password', authMiddleware, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Current and new password are required.' });
  if (newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters.' });

  const { data: user } = await db.from('nexus_users').select('password').eq('id', req.user.id).single();
  if (!user) return res.status(404).json({ error: 'User not found.' });
  if (!bcrypt.compareSync(currentPassword, user.password)) return res.status(400).json({ error: 'Current password is incorrect.' });

  const hashed = bcrypt.hashSync(newPassword, 10);
  await db.from('nexus_users').update({ password: hashed }).eq('id', req.user.id);
  res.json({ message: 'Password updated successfully.' });
});

app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/api/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: 'http://localhost:3000' }),
  (req, res) => {
    const user = req.user as any;
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.redirect(`http://localhost:3000?google_token=${token}`);
  }
);

// ── LOAN ROUTES ─────────────────────────────────────────────

app.get('/api/loans', authMiddleware, asyncHandler(async (req, res) => {
  let query = db.from('nexus_loans').select('*');
  if (req.user.role === 'customer') {
    query = query.eq('applicantEmail', req.user.email);
  }
  const { data: loans } = await query.order('date', { ascending: false });
  res.json(loans || []);
});

app.post('/api/loans', authMiddleware, asyncHandler(async (req, res) => {
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

  res.status(201).json(newLoan);
});

app.patch('/api/loans/:id/approve', authMiddleware, asyncHandler(async (req, res) => {
  const { data: loan } = await db.from('nexus_loans').select('*').eq('id', req.params.id).single();
  if (!loan) return res.status(404).json({ error: 'Loan not found.' });

  await db.from('nexus_loans').update({ status: 'Approved', assignedTo: req.user.id }).eq('id', req.params.id);

  const { data: applicantUser } = await db.from('nexus_users').select('id').eq('email', loan.applicantEmail).single();
  await db.from('nexus_transactions').insert({
    id: 'tx_fst' + Date.now().toString().slice(-6),
    title: 'Loan Disbursement',
    date: new Date().toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' }),
    amount: loan.amount,
    type: 'Loan Disbursement',
    userId: applicantUser?.id || 1,
  });

  res.json({ ...loan, status: 'Approved', assignedTo: req.user.id });
});

app.patch('/api/loans/:id/reject', authMiddleware, asyncHandler(async (req, res) => {
  const { data: loan } = await db.from('nexus_loans').select('id').eq('id', req.params.id).single();
  if (!loan) return res.status(404).json({ error: 'Loan not found.' });
  await db.from('nexus_loans').update({ status: 'Rejected' }).eq('id', req.params.id);
  res.json({ ...loan, status: 'Rejected' });
});

app.patch('/api/loans/:id/hold', authMiddleware, asyncHandler(async (req, res) => {
  const { data: loan } = await db.from('nexus_loans').select('id').eq('id', req.params.id).single();
  if (!loan) return res.status(404).json({ error: 'Loan not found.' });
  await db.from('nexus_loans').update({ status: 'Hold' }).eq('id', req.params.id);
  res.json({ ...loan, status: 'Hold' });
});

// ── TRANSACTION ROUTES ──────────────────────────────────────

app.get('/api/transactions', authMiddleware, asyncHandler(async (req, res) => {
  const { data: txs } = await db.from('nexus_transactions').select('*').eq('userId', req.user.id).order('id', { ascending: false });
  res.json(txs || []);
});

app.post('/api/transactions/repay', authMiddleware, asyncHandler(async (req, res) => {
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

app.post('/api/transactions/disburse', authMiddleware, asyncHandler(async (req, res) => {
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

app.get('/api/tasks', authMiddleware, asyncHandler(async (req, res) => {
  const { data: tasks } = await db.from('nexus_tasks').select('*');
  res.json(tasks || []);
});

app.patch('/api/tasks/:id/complete', authMiddleware, asyncHandler(async (req, res) => {
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

app.get('/api/users', authMiddleware, asyncHandler(async (req, res) => {
  if (req.user.role !== 'super-admin') return res.status(403).json({ error: 'Admins only.' });
  const { data: users } = await db.from('nexus_users').select('id, name, email, role');
  res.json(users || []);
});

app.patch('/api/users/:id/role', authMiddleware, asyncHandler(async (req, res) => {
  if (req.user.role !== 'super-admin') return res.status(403).json({ error: 'Admins only.' });
  const allowedRoles = ['customer', 'loan-officer', 'super-admin'];
  if (!allowedRoles.includes(req.body.role)) return res.status(400).json({ error: 'Invalid role.' });
  const { data: user } = await db.from('nexus_users').select('id').eq('id', parseInt(req.params.id)).single();
  if (!user) return res.status(404).json({ error: 'User not found.' });
  await db.from('nexus_users').update({ role: req.body.role }).eq('id', user.id);
  res.json({ id: user.id, ...req.body });
});

// ── CONFIG ROUTES (Super Admin) ─────────────────────────────

app.get('/api/config', authMiddleware, asyncHandler(async (req, res) => {
  const { data: config } = await db.from('nexus_config').select('*').eq('id', 1).single();
  res.json(config || {});
});

app.patch('/api/config', authMiddleware, asyncHandler(async (req, res) => {
  if (req.user.role !== 'super-admin') return res.status(403).json({ error: 'Admins only.' });
  await db.from('nexus_config').update(req.body).eq('id', 1);
  const { data: config } = await db.from('nexus_config').select('*').eq('id', 1).single();
  res.json(config);
});

// ── STATS ROUTES ────────────────────────────────────────────

app.get('/api/stats', authMiddleware, asyncHandler(async (req, res) => {
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

// ── SUPPORT ROUTES ─────────────────────────────────────────

app.post('/api/support/message', authMiddleware, (req, res) => {
  const { name, email, message } = req.body;
  console.log(`\n  📧 Support message from ${name} (${email}):`);
  console.log(`  └─ ${message}`);
  res.json({ message: 'Message sent successfully. We will get back to you shortly.' });
});

// ── 404 catch-all ────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// ── Global error handler ────────────────────────────────────

app.use((err: any, req: any, res: any, next: any) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
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
