# OTP Auth Migration — Plan

Replace password-based Appwrite auth with **Email OTP** (one-time password sent via Appwrite's built-in email).

## What Changes

### 1. AuthPage.tsx — Login

**Current** (password):
```
1. Enter email + password
2. account.createEmailPasswordSession(email, password)
3. exchangeSession → JWT
```

**New** (OTP):
```
1. Enter email only → click "Send OTP"
2. account.createEmailToken(email, 'https://.../otp-callback')
   → Appwrite sends 6-digit code to email
3. User enters 6-digit code
4. account.createSession(userId, secret) → creates session
5. account.get() → get user info
6. exchangeSession → JWT
```

Login view split into two steps:
- **Step 1**: Email input + "Send OTP" button
- **Step 2**: 6-digit input + "Verify" button (appears after OTP sent)

### 2. AuthPage.tsx — Register

**Current**: Creates account with `account.create(ID.unique(), email, password, name)`, then verification link

**New**: Creates account with `account.create(ID.unique(), email, password, name)` (keep same), but login uses OTP not password

### 3. AuthPage.tsx — Forgot Password

**Current**: `account.createRecovery(email, url)` — sends reset link

**New**: Keep same — password resets are separate from login

### 4. Remove unused fields

- Remove `loginPassword` state
- Remove `registerPassword`, `registerConfirmPassword` states (still needed for Appwrite's `account.create()` but can auto-generate)
- Actually: Appwrite's `account.create()` still requires a password. We can generate a random one and discard it.

### 5. AuthPage.tsx — New states

Add:
- `otpEmail: string` — email for OTP
- `otpUserId: string` — returned from createEmailToken
- `otpSent: boolean` — show OTP input step
- `otpCode: string` — 6-digit code input
- `otpTimer: number` — countdown for resend

### 6. AuthPage.tsx — Register flow (password handling)

Appwrite still needs a password for `account.create()`. Options:
- **A**: Auto-generate a random password, user never sees it
- **B**: Keep the password fields but login is OTP-only (password only for Appwrite recovery)

Option B is simpler — user still enters a password on register (for Appwrite's account creation + recovery), but login is OTP-only.

### 7. Appwrite Console — Auth Settings

- Enable **Email OTP** auth method (keep Email/Password disabled or both)
- The **OTP email template** is already there by default (shown in the UI)

### 8. Files to modify

| File | Changes |
|------|---------|
| `src/components/AuthPage.tsx` | Rewrite login flow to split into email → OTP → verify. Add OTP states, handlers. |
| `src/components/AuthPage.tsx` | Register: keep password fields (for Appwrite), use same verification link flow |
| `src/components/AuthPage.tsx` | Forgot: no change needed |

### 9. Files NOT modified

| File | Reason |
|------|--------|
| `server/index.ts` | Session exchange and login endpoints unchanged |
| `server/appwrite.ts` | Admin API calls unchanged |
| `src/appwriteClient.ts` | SDk client unchanged |

## Flow Diagram

```
REGISTER:
  Enter name, email, password → account.create() → send verification link
  → check email → click link → auto-verified

LOGIN:
  Enter email → click "Send OTP" → account.createEmailToken()
  → check email for 6-digit code → enter code → account.createSession()
  → exchangeSession() → JWT → logged in

FORGOT PASSWORD:
  Enter email → account.createRecovery() → check email for reset link
```

## Appwrite API Methods Used

| Method | Current | New |
|--------|---------|-----|
| `account.create()` | Register | Register (same) |
| `account.createEmailPasswordSession()` | Login | REMOVED |
| `account.createEmailToken()` | — | Login step 1 (NEW) |
| `account.createSession()` | — | Login step 2 (NEW) |
| `account.createVerification()` | Register verify | Register verify (same) |
| `account.updateVerification()` | Verify callback | Verify callback (same) |
| `account.createRecovery()` | Forgot password | Forgot password (same) |
| `account.deleteSessions()` | Login cleanup | Login cleanup (same) |
| `account.get()` | Get user after login | Get user after login (same) |
| `exchangeSession()` | Backend JWT exchange | Backend JWT exchange (same) |
