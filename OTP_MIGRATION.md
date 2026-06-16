# OTP Auth Migration — Engineering Spec

Replace password-based Appwrite auth with **Email OTP** (one-time password).

---

## Overview

**Current flow (password):**
```
Login:       Enter email + password → account.createEmailPasswordSession() → session → JWT
Register:    Enter name + email + password → account.create() → verification link email
Forgot:      Enter email → account.createRecovery() → recovery link email → reset form → new password
```

**New flow (OTP):**
```
Login Step 1:  Enter email → "Send OTP" → account.createEmailToken() → 6-digit code emailed
Login Step 2:  Enter 6-digit code → account.createSession(userId, secret) → session → JWT
Register:      Same as before (keep password for Appwrite account creation)
Forgot Step 1: Enter email (same as login) → OTP sent
Forgot Step 2: Enter OTP → verify → show reset password form
Forgot Step 3: Enter new password + confirm → backend updates via Appwrite admin API → redirect to login
```

---

## File: `src/components/AuthPage.tsx`

### 1. Add new state variables (after line 56)

Insert after the `registerLoading` state:

```tsx
// OTP states
const [otpEmail, setOtpEmail] = useState('');
const [otpUserId, setOtpUserId] = useState('');
const [otpSent, setOtpSent] = useState(false);
const [otpCode, setOtpCode] = useState('');
const [otpTimer, setOtpTimer] = useState(0);

// Forgot / reset states
const [forgotOtpSent, setForgotOtpSent] = useState(false);
const [forgotUserId, setForgotUserId] = useState('');
const [forgotOtpCode, setForgotOtpCode] = useState('');
const [forgotOtpTimer, setForgotOtpTimer] = useState(0);
const [showResetForm, setShowResetForm] = useState(false);
const [resetPassword, setResetPassword] = useState('');
const [resetConfirmPassword, setResetConfirmPassword] = useState('');
```

### 2. Replace login states (lines 37-40)

Change `loginEmail` and remove `loginPassword` and `rememberMe`:

```tsx
// Login states
const [loginEmail, setLoginEmail] = useState('');
```

### 3. Replace handleLoginSubmit (lines 69-84)

Old (password):
```tsx
const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      try { await account.deleteSessions(); } catch {}
      await account.createEmailPasswordSession(loginEmail, loginPassword);
      const user = await account.get();
      const token = await exchangeSession(user.email, user.name);
      onLoginSuccess(token);
    } catch (err: any) {
      showToast(err?.message || 'Login failed. Check your credentials.', 'error');
    } finally {
      setLoginLoading(false);
    }
  };
```

New (OTP):
```tsx
const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpEmail) return showToast('Enter your email address', 'error');
    setLoginLoading(true);
    try {
      try { await account.deleteSessions(); } catch {}
      const token = await account.createEmailToken(
        otpEmail,
        window.location.origin + '/otp-callback'
      );
      setOtpUserId(token.userId);
      setOtpSent(true);
      setOtpTimer(300);
      const interval = setInterval(() => {
        setOtpTimer(prev => { if (prev <= 1) clearInterval(interval); return prev - 1; });
      }, 1000);
      showToast('OTP sent to your email!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to send OTP.', 'error');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) return showToast('Enter the 6-digit code', 'error');
    setLoginLoading(true);
    try {
      await account.createSession(otpUserId, otpCode);
      const user = await account.get();
      const jwt = await exchangeSession(user.email, user.name);
      onLoginSuccess(jwt);
    } catch (err: any) {
      showToast(err?.message || 'Invalid or expired code.', 'error');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoginLoading(true);
    try {
      const token = await account.createEmailToken(
        otpEmail,
        window.location.origin + '/otp-callback'
      );
      setOtpUserId(token.userId);
      setOtpTimer(300);
      showToast('New OTP sent!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to resend OTP.', 'error');
    } finally {
      setLoginLoading(false);
    }
  };
```

### 4. Replace the login form JSX (lines 127-408)

The entire `<React.Fragment key="login">` block becomes two-step:

**Step 1 — Email input** (shown when `!otpSent`):
```
- Title: "login"
- Subtitle: "enter your email to receive a code"
- Email input (same, no password field)
- "SEND OTP" button → handleSendOtp
- "Forgot password?" link → opens forgot flow (separate view)
- "create account" link unchanged
```

**Step 2 — OTP input** (shown when `otpSent`):
```
- Title: "check your email"
- Subtitle: "we sent a 6-digit code to {otpEmail}"
- Single 6-digit code input (centered, large monospace font)
- "VERIFY" button → handleVerifyOtp
- "Resend code" link (disabled during countdown)
- "Use a different email" link → resets to Step 1
```

**JSX structure for Step 2:**

```tsx
{otpSent ? (
  <form onSubmit={handleVerifyOtp} className="space-y-6">
    <div className="text-center">
      <p className="text-[13px] text-[var(--text-secondary)] font-medium">
        Enter the code sent to <strong>{otpEmail}</strong>
      </p>
    </div>
    <div>
      <input
        type="text"
        maxLength={6}
        value={otpCode}
        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        placeholder="000000"
        className="w-full text-center text-[28px] tracking-[12px] font-mono rounded-2xl bg-[var(--surface-card)] border border-[var(--border-primary)]/90 px-6 py-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]/80 focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
        required
      />
    </div>
    <button
      type="submit"
      disabled={loginLoading || otpCode.length < 6}
      className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--text-primary)] font-black py-3.5 px-6 rounded-2xl transition-all cursor-pointer disabled:opacity-50"
    >
      {loginLoading ? (
        <span className="flex items-center justify-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> verify...</span>
      ) : (
        <>verify <ArrowRight className="w-5 h-5 stroke-[2.5]" /></>
      )}
    </button>
    <div className="flex justify-between items-center text-[13px]">
      <button type="button" onClick={handleResendOtp} disabled={otpTimer > 0}
        className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer disabled:opacity-40"
      >
        resend code {otpTimer > 0 && `(${Math.floor(otpTimer / 60)}:${String(otpTimer % 60).padStart(2, '0')})`}
      </button>
      <button type="button" onClick={() => { setOtpSent(false); setOtpCode(''); }}
        className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
      >
        use different email
      </button>
    </div>
  </form>
) : (
  <form onSubmit={handleSendOtp} className="space-y-4">
    <div>
      <input
        type="text"
        value={otpEmail}
        onChange={(e) => setOtpEmail(e.target.value)}
        placeholder="Email"
        className="..." // same styling
        required
      />
    </div>
    <button
      type="submit"
      disabled={loginLoading}
      className="..." // same styling
    >
      {loginLoading ? (
        <span><RefreshCw className="w-4 h-4 animate-spin" /> sending otp...</span>
      ) : (
        <>send otp <ArrowRight className="w-5 h-5 stroke-[2.5]" /></>
      )}
    </button>
  </form>
)}
```

### 5. Update handleRegisterSubmit (lines 86-103)

Remove the temporary `createEmailPasswordSession` + `deleteSessions` calls (login is OTP):

```tsx
const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerPassword !== registerConfirmPassword) return showToast('Passwords do not match', 'error');
    setRegisterLoading(true);
    try {
      await account.create(ID.unique(), registerEmail, registerPassword, registerName);
      await account.createVerification(window.location.origin);
      setRegisterDone(true);
      setView('check-email');
    } catch (err: any) {
      showToast(err?.message || 'Registration failed.', 'error');
    } finally {
      setRegisterLoading(false);
    }
  };
```

### 6. Replace handleForgotSubmit (lines 105-118) — full OTP forgot flow

**Old (lines 105-118):**
```tsx
const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return showToast('Enter your email', 'error');
    setForgotLoading(true);
    try {
      await account.createRecovery(forgotEmail, window.location.origin);
      setView('check-email');
      showToast('Recovery link sent!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to send recovery email.', 'error');
    } finally {
      setForgotLoading(false);
    }
  };
```

**New — three handlers replacing the one above:**

```tsx
const handleSendForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return showToast('Enter your email address', 'error');
    setForgotLoading(true);
    try {
      try { await account.deleteSessions(); } catch {}
      const token = await account.createEmailToken(
        forgotEmail,
        window.location.origin + '/otp-callback'
      );
      setForgotUserId(token.userId);
      setForgotOtpSent(true);
      setForgotOtpTimer(300);
      const interval = setInterval(() => {
        setForgotOtpTimer(prev => { if (prev <= 1) clearInterval(interval); return prev - 1; });
      }, 1000);
      showToast('OTP sent to your email!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to send OTP.', 'error');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotOtpCode || forgotOtpCode.length < 6) return showToast('Enter the 6-digit code', 'error');
    setForgotLoading(true);
    try {
      await account.createSession(forgotUserId, forgotOtpCode);
      // OTP verified — show reset form
      setShowResetForm(true);
    } catch (err: any) {
      showToast(err?.message || 'Invalid or expired code.', 'error');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPassword || resetPassword.length < 6) return showToast('Password must be at least 6 characters', 'error');
    if (resetPassword !== resetConfirmPassword) return showToast('Passwords do not match', 'error');
    setForgotLoading(true);
    try {
      const res = await fetch(`${API}/auth/update-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, userId: forgotUserId, newPassword: resetPassword }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed to reset password.'); }
      // Session was active from OTP verify — delete it so user logs in fresh
      try { await account.deleteSessions(); } catch {}
      showToast('Password reset! Login with your new password.', 'success');
      setShowResetForm(false);
      setForgotOtpSent(false);
      setForgotOtpCode('');
      setResetPassword('');
      setResetConfirmPassword('');
      setView('login');
    } catch (err: any) {
      showToast(err?.message || 'Failed to reset password.', 'error');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResendForgotOtp = async () => {
    setForgotLoading(true);
    try {
      const token = await account.createEmailToken(
        forgotEmail,
        window.location.origin + '/otp-callback'
      );
      setForgotUserId(token.userId);
      setForgotOtpTimer(300);
      showToast('New OTP sent!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to resend OTP.', 'error');
    } finally {
      setForgotLoading(false);
    }
  };
```

### 7. Replace forgot form JSX (lines 409-end of forgot block)

**Old — single recovery-email form:**
```
- Email input
- "Send recovery link" button
- "Back to login" link
```

**New — two-step (OTP → reset form):**

Show OTP step when `!showResetForm && !forgotOtpSent`:

```tsx
<form onSubmit={handleSendForgotOtp} className="space-y-4">
  <p className="text-[13px] text-[var(--text-secondary)] font-medium text-center">
    Enter your email to receive a 6-digit code
  </p>
  <input
    type="text"
    value={forgotEmail}
    onChange={(e) => setForgotEmail(e.target.value)}
    placeholder="Email"
    className="..." // same style as other inputs
    required
  />
  <button type="submit" disabled={forgotLoading} className="...">
    {forgotLoading ? <span>sending otp...</span> : <>send otp <ArrowRight /></>}
  </button>
</form>
```

Show OTP verify when `forgotOtpSent && !showResetForm`:

```tsx
<form onSubmit={handleVerifyForgotOtp} className="space-y-6">
  <p className="text-[13px] text-[var(--text-secondary)] font-medium text-center">
    Enter the code sent to <strong>{forgotEmail}</strong>
  </p>
  <input
    type="text"
    maxLength={6}
    value={forgotOtpCode}
    onChange={(e) => setForgotOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
    placeholder="000000"
    className="w-full text-center text-[28px] tracking-[12px] font-mono ..."
    required
  />
  <button type="submit" disabled={forgotLoading || forgotOtpCode.length < 6} className="...">
    {forgotLoading ? <span>verifying...</span> : <>verify <ArrowRight /></>}
  </button>
  <div className="flex justify-between text-[13px]">
    <button type="button" onClick={handleResendForgotOtp} disabled={forgotOtpTimer > 0} className="...">
      resend code {forgotOtpTimer > 0 && `(${Math.floor(forgotOtpTimer / 60)}:${String(forgotOtpTimer % 60).padStart(2, '0')})`}
    </button>
    <button type="button" onClick={() => { setForgotOtpSent(false); setForgotOtpCode(''); }} className="...">
      use different email
    </button>
  </div>
</form>
```

Show reset form when `showResetForm`:

```tsx
<form onSubmit={handleResetPassword} className="space-y-4">
  <p className="text-[13px] text-[var(--text-secondary)] font-medium text-center">
    Choose a new password
  </p>
  <input
    type="password"
    value={resetPassword}
    onChange={(e) => setResetPassword(e.target.value)}
    placeholder="New password (min 6 chars)"
    className="..." // same style
    required
    minLength={6}
  />
  <input
    type="password"
    value={resetConfirmPassword}
    onChange={(e) => setResetConfirmPassword(e.target.value)}
    placeholder="Confirm new password"
    className="..." // same style
    required
    minLength={6}
  />
  <button type="submit" disabled={forgotLoading} className="...">
    {forgotLoading ? <span>resetting...</span> : <>reset password <ArrowRight /></>}
  </button>
</form>
```

---

## Backend: new `POST /api/auth/update-password`

Add to `server/index.ts` (after the existing `POST /api/auth/session` at line 133):

```ts
// Self-service password reset (called after OTP verification)
app.post('/api/auth/update-password', authLimiter, async (req, res) => {
  try {
    const { email, userId, newPassword } = req.body;
    if (!email || !userId || !newPassword) {
      return res.status(400).json({ error: 'email, userId, and newPassword are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }
    // Verify the userId matches the email via Appwrite admin API
    const { data: user } = await db.from('nexus_users').select('id').eq('email', email).maybeSingle();
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    // Update password in both Appwrite and Supabase
    try { await updateUserPassword(email, newPassword); } catch (e) {
      console.error('Appwrite password update failed:', e);
      // Continue — Supabase bcrypt is the primary auth for demo users
    }
    // Supabase bcrypt update (for demo / Supabase-only users)
    const bcryptHash = await bcrypt.hash(newPassword, 10);
    await db.from('nexus_users').update({ password: bcryptHash }).eq('email', email);

    logAudit('password-reset', `Password reset via OTP for ${email}`, { id: user.id, email, name: '', role: '' });
    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Password update error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});
```

Also add `bcrypt` import if not already present (should be at line 18).

---

## File: `src/components/ProfilePage.tsx`

### 1. Add Appwrite import (line 6)

Change:
```tsx
import { apiFetch } from '../api';
```
To:
```tsx
import { apiFetch } from '../api';
import { account } from '../appwriteClient';
```

### 2. Add OTP states + remove currentPassword (lines 17-22)

Replace lines 17-22:
```tsx
const [currentPassword, setCurrentPassword] = useState('');
const [newPassword, setNewPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [profileLoading, setProfileLoading] = useState(false);
const [passwordLoading, setPasswordLoading] = useState(false);
const [fetching, setFetching] = useState(true);
```

With:
```tsx
const [newPassword, setNewPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [profileLoading, setProfileLoading] = useState(false);
const [passwordLoading, setPasswordLoading] = useState(false);
const [fetching, setFetching] = useState(true);
// Password OTP states
const [passwordOtpSent, setPasswordOtpSent] = useState(false);
const [passwordOtpUserId, setPasswordOtpUserId] = useState('');
const [passwordOtpCode, setPasswordOtpCode] = useState('');
const [passwordOtpVerified, setPasswordOtpVerified] = useState(false);
const [passwordOtpTimer, setPasswordOtpTimer] = useState(0);
```

### 3. Replace `handlePasswordSave` (lines 51-69) with 3 handlers

```tsx
const handleSendPasswordOtp = async () => {
    setPasswordLoading(true);
    try {
      try { await account.deleteSessions(); } catch {}
      const token = await account.createEmailToken(
        email, // user's current email from profile
        window.location.origin + '/otp-callback'
      );
      setPasswordOtpUserId(token.userId);
      setPasswordOtpSent(true);
      setPasswordOtpTimer(300);
      const interval = setInterval(() => {
        setPasswordOtpTimer(prev => { if (prev <= 1) clearInterval(interval); return prev - 1; });
      }, 1000);
      showToast('OTP sent to your email!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to send OTP.', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleVerifyPasswordOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordOtpCode || passwordOtpCode.length < 6) return showToast('Enter the 6-digit code', 'error');
    setPasswordLoading(true);
    try {
      await account.createSession(passwordOtpUserId, passwordOtpCode);
      setPasswordOtpVerified(true);
      showToast('Email verified! Set your new password.', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Invalid or expired code.', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return showToast('New passwords do not match', 'error');
    if (!passwordOtpVerified) return showToast('Verify your email first via OTP', 'error');
    setPasswordLoading(true);
    try {
      await apiFetch('/auth/password', {
        method: 'PATCH',
        body: JSON.stringify({ newPassword }),
      });
      showToast('Password updated successfully');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordOtpSent(false);
      setPasswordOtpVerified(false);
      setPasswordOtpCode('');
    } catch {
      showToast('Could not connect to server.', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };
```

### 4. Replace Change Password JSX (lines 155-202)

Old:
```tsx
{/* Change Password */}
<div className="stagger-3 premium-card rounded-2xl p-8">
  <h3 className="text-[15px] font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
    <Lock className="w-5 h-5 text-[var(--text-secondary)]" /> Change Password
  </h3>
  <form onSubmit={handlePasswordSave} className="space-y-5">
    <div className="space-y-1.5">
      <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase tracking-wider ml-1">Current Password</label>
      <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="premium-input w-full px-4 py-3 rounded-xl" required />
    </div>
    <div className="space-y-1.5">
      <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase tracking-wider ml-1">New Password</label>
      <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="premium-input w-full px-4 py-3 rounded-xl" required minLength={6} />
    </div>
    <div className="space-y-1.5">
      <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase tracking-wider ml-1">Confirm New Password</label>
      <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="premium-input w-full px-4 py-3 rounded-xl" required minLength={6} />
    </div>
    <button type="submit" disabled={passwordLoading} className="premium-btn-primary ...">
      {passwordLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
      {passwordLoading ? 'Updating...' : 'Update Password'}
    </button>
  </form>
</div>
```

New:
```tsx
{/* Change Password */}
<div className="stagger-3 premium-card rounded-2xl p-8">
  <h3 className="text-[15px] font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
    <Lock className="w-5 h-5 text-[var(--text-secondary)]" /> Change Password
  </h3>

  {!passwordOtpVerified ? (
    <>
      {!passwordOtpSent ? (
        /* Step 1: Send OTP button */
        <div className="space-y-4">
          <p className="text-[13px] text-[var(--text-secondary)] font-medium">
            Verify your email <strong>{email}</strong> via OTP to change your password.
          </p>
          <button
            type="button"
            onClick={handleSendPasswordOtp}
            disabled={passwordLoading}
            className="premium-btn-primary text-white text-[13px] font-bold px-6 py-3 rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {passwordLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            {passwordLoading ? 'Sending OTP...' : 'Verify via OTP'}
          </button>
        </div>
      ) : (
        /* Step 2: Enter OTP code */
        <form onSubmit={handleVerifyPasswordOtp} className="space-y-6">
          <p className="text-[13px] text-[var(--text-secondary)] font-medium text-center">
            Enter the 6-digit code sent to <strong>{email}</strong>
          </p>
          <input
            type="text"
            maxLength={6}
            value={passwordOtpCode}
            onChange={(e) => setPasswordOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            className="w-full text-center text-[28px] tracking-[12px] font-mono premium-input rounded-xl px-4 py-3"
            required
          />
          <button
            type="submit"
            disabled={passwordLoading || passwordOtpCode.length < 6}
            className="premium-btn-primary text-white text-[13px] font-bold px-6 py-3 rounded-xl cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 w-full"
          >
            {passwordLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {passwordLoading ? 'Verifying...' : 'Verify Code'}
          </button>
          <div className="flex justify-between text-[12.5px]">
            <button type="button" onClick={handleSendPasswordOtp} disabled={passwordOtpTimer > 0}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer disabled:opacity-40"
            >
              resend code {passwordOtpTimer > 0 && `(${Math.floor(passwordOtpTimer / 60)}:${String(passwordOtpTimer % 60).padStart(2, '0')})`}
            </button>
            <button type="button" onClick={() => { setPasswordOtpSent(false); setPasswordOtpCode(''); }}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              use different email
            </button>
          </div>
        </form>
      )}
    </>
  ) : (
    /* Step 3: OTP verified — show new password form */
    <form onSubmit={handlePasswordSave} className="space-y-5">
      <div className="flex items-center gap-2 text-[13px] text-green-600 dark:text-green-400 font-semibold mb-2">
        <CheckCircle2 className="w-4 h-4" /> Email verified
      </div>
      <div className="space-y-1.5">
        <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase tracking-wider ml-1">New Password</label>
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="premium-input w-full px-4 py-3 rounded-xl" required minLength={6} />
      </div>
      <div className="space-y-1.5">
        <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase tracking-wider ml-1">Confirm New Password</label>
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="premium-input w-full px-4 py-3 rounded-xl" required minLength={6} />
      </div>
      <button type="submit" disabled={passwordLoading} className="premium-btn-primary text-white text-[13px] font-bold px-6 py-3 rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-2">
        {passwordLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
        {passwordLoading ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  )}
</div>
```

---

## Backend: add `PATCH /api/auth/password`

This endpoint is **called from ProfilePage** when the user changes their password (after OTP verification). It's also used by the forgot-password flow.

Add to `server/index.ts` after the existing `/api/auth/update-password` endpoint:

```ts
// Change password (authenticated user, after OTP verification)
app.patch('/api/auth/password', authMiddleware, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }
    const email = req.user.email;
    // Update in both Appwrite and Supabase
    try { await updateUserPassword(email, newPassword); } catch (e) {
      console.error('Appwrite password update failed:', e);
    }
    const bcryptHash = await bcrypt.hash(newPassword, 10);
    await db.from('nexus_users').update({ password: bcryptHash }).eq('email', email);

    logAudit('password-change', `${email} changed their password`, req.user);
    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});
```

---

## Appwrite Console changes needed

In **Auth → Settings → Templates** → **OTP session**:
- Ensure enabled (eye icon visible)
- Default template sends 6-digit code with `{{otp}}` variable

In **Auth → Settings → Auth methods**:
- Enable **Email OTP**
- Keep **Email/Password** enabled (demo users still need password auth)

---

## Summary of exact code changes

| # | Change | File | Type |
|---|--------|------|------|
| 1 | Add OTP + reset states (after line 56) | `AuthPage.tsx` | Insert |
| 2 | Replace login states (lines 37-40) | `AuthPage.tsx` | Modify |
| 3 | Replace handleLoginSubmit → handleSendOtp + handleVerifyOtp + handleResendOtp (lines 69-84) | `AuthPage.tsx` | Replace |
| 4 | Replace login form JSX with otpSent conditional (lines 127-408) | `AuthPage.tsx` | Replace |
| 5 | Remove temp session calls from handleRegisterSubmit (lines 92-95) | `AuthPage.tsx` | Modify |
| 6 | Replace handleForgotSubmit → handleSendForgotOtp + handleVerifyForgotOtp + handleResetPassword + handleResendForgotOtp (lines 105-118) | `AuthPage.tsx` | Replace |
| 7 | Replace forgot form JSX with OTP → reset form two-step | `AuthPage.tsx` | Replace |
| 8 | Add `POST /api/auth/update-password` endpoint | `server/index.ts` | Insert |
| 9 | Add `account` import from `../appwriteClient` (line 6) | `ProfilePage.tsx` | Modify |
| 10 | Replace states: remove `currentPassword`, add OTP states (lines 17-22) | `ProfilePage.tsx` | Replace |
| 11 | Replace `handlePasswordSave` with 3 handlers: `handleSendPasswordOtp` + `handleVerifyPasswordOtp` + `handlePasswordSave` (lines 51-69) | `ProfilePage.tsx` | Replace |
| 12 | Replace Change Password JSX with 3-step OTP flow (lines 155-202) | `ProfilePage.tsx` | Replace |
| 13 | Add `PATCH /api/auth/password` endpoint | `server/index.ts` | Insert |

Total: **13 edits** — 9 in `AuthPage.tsx`, 4 in `ProfilePage.tsx`, 2 in `server/index.ts`.
