// ============================================================
// NEXUSFINANCE BACKEND API — Supabase-backed Express server
// ============================================================

import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { db } from './db.js';
import { updateUserPassword } from './appwrite.js';

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

app.set('trust proxy', 1);
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
app.use(cors({ origin: corsOrigin }));
app.use(express.json());

function logAudit(action: string, details: string, user: any) {
  db.from('nexus_audit_logs').insert({ action, details, userId: user.id, userEmail: user.email }).then(null, () => {});
}

function notifyUser(userId: number, text: string) {
  const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  db.from('nexus_notifications').insert({ userId, text, time }).then(null, () => {});
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

// ── AUTH ROUTES (Appwrite-backed) ──────────────────────────

app.post('/api/auth/session', async (req, res) => {
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

    const token = jwt.sign({ id: dbUser!.id, email: dbUser!.email, name: dbUser!.name, role: dbUser!.role }, JWT_SECRET, { expiresIn: '24h' });
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

  res.status(201).json(newLoan);
});

app.patch('/api/loans/:id/approve', authMiddleware, async (req, res) => {
  const { data: loan } = await db.from('nexus_loans').select('*').eq('id', req.params.id).single();
  if (!loan) return res.status(404).json({ error: 'Loan not found.' });

  await db.from('nexus_loans').update({ status: 'Approved', assignedTo: req.user.id }).eq('id', req.params.id);
  logAudit('loan-approved', `Loan ${loan.id} (${loan.type}) for ${loan.applicantName} approved`, req.user);

  const { data: applicantUser } = await db.from('nexus_users').select('id').eq('email', loan.applicantEmail).single();
  await db.from('nexus_transactions').insert({
    id: 'tx_fst' + Date.now().toString().slice(-6),
    title: 'Loan Disbursement',
    date: new Date().toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' }),
    amount: loan.amount,
    type: 'Loan Disbursement',
    userId: applicantUser?.id || 1,
  });
  if (applicantUser) notifyUser(applicantUser.id, `Your loan ${loan.id} has been approved — $${loan.amount.toLocaleString()} disbursed.`);

  res.json({ ...loan, status: 'Approved', assignedTo: req.user.id });
});

app.patch('/api/loans/:id/reject', authMiddleware, async (req, res) => {
  const { data: loan } = await db.from('nexus_loans').select('*').eq('id', req.params.id).single();
  if (!loan) return res.status(404).json({ error: 'Loan not found.' });
  await db.from('nexus_loans').update({ status: 'Rejected' }).eq('id', req.params.id);
  logAudit('loan-rejected', `Loan ${loan.id} (${loan.type}) for ${loan.applicantName} rejected`, req.user);
  const { data: applicantUser } = await db.from('nexus_users').select('id').eq('email', loan.applicantEmail).single();
  if (applicantUser) notifyUser(applicantUser.id, `Your loan ${loan.id} application has been rejected.`);
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

// ── AUDIT LOG ROUTES (Super Admin) ─────────────────────────

app.get('/api/audit/logs', authMiddleware, async (req, res) => {
  if (req.user.role !== 'super-admin') return res.status(403).json({ error: 'Admins only.' });
  const { data: logs } = await db.from('nexus_audit_logs').select('*').order('id', { ascending: false }).limit(100);
  res.json(logs || []);
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

const errors: any[] = [];
app.post('/api/health-error', (req, res) => {
  errors.push({ ...req.body, time: Date.now() });
  res.json({ ok: true });
});
app.get('/api/health-error', (req, res) => {
  res.json(errors.slice(-20));
});

// ── PRODUCTION: serve frontend build ─────────────────────────

if (process.env.NODE_ENV === 'production') {
  const appwriteConfig = JSON.stringify({
    endpoint: process.env.APPWRITE_ENDPOINT,
    projectId: process.env.APPWRITE_PROJECT_ID,
  });
  const distDir = path.join(process.cwd(), 'dist');
  app.use(express.static(distDir));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
    } else {
      const indexPath = path.join(distDir, 'index.html');
      if (require('fs').existsSync(indexPath)) {
        let html = require('fs').readFileSync(indexPath, 'utf-8');
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
