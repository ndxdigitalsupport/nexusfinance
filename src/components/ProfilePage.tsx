import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Save, RefreshCw, CheckCircle2 } from 'lucide-react';
import { showToast } from './Toast';
import { SkeletonCard } from './Skeleton';

import { apiFetch } from '../api';
import { account } from '../appwriteClient';
import { API } from '../api';

interface ProfilePageProps {
  token: string;
  user?: { name: string; role: string } | null;
}

export default function ProfilePage({ token, user }: ProfilePageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
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

  useEffect(() => {
    apiFetch('/auth/me')
      .then((data) => {
        setName(data.name || '');
        setEmail(data.email || '');
        setPhone(data.phone || '');
      })
      .catch(() => showToast('Failed to load profile', 'error'))
      .finally(() => setFetching(false));
  }, [token]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await apiFetch('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify({ name, email, phone }),
      });
      showToast('Profile updated successfully');
    } catch {
      showToast('Could not connect to server.', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSendPasswordOtp = async () => {
    setPasswordLoading(true);
    try {
      try { await account.deleteSessions(); } catch {}
      const token = await account.createEmailToken(email, window.location.origin + '/otp-callback');
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
      const res = await fetch(`${API}/auth/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ newPassword }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed to update password.'); }
      showToast('Password updated successfully');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordOtpSent(false);
      setPasswordOtpVerified(false);
      setPasswordOtpCode('');
    } catch (err: any) {
      showToast(err?.message || 'Could not update password.', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (fetching) return <div className="animate-in fade-in duration-200 max-w-2xl space-y-8"><SkeletonCard lines={3} /><SkeletonCard lines={2} /></div>;

  return (
    <div className="animate-in fade-in duration-200 max-w-2xl space-y-8">
      <h2 className="text-[28px] font-extrabold text-[var(--text-primary)]">Profile</h2>

      {/* Personal Info */}
      <div className="stagger-1 premium-card rounded-2xl p-8">
        <h3 className="text-[15px] font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-[var(--text-secondary)]" /> Personal Information
        </h3>
        <form onSubmit={handleProfileSave} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase tracking-wider ml-1">Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <User className="w-4 h-4 text-[var(--text-tertiary)]" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="premium-input w-full pl-10 pr-4 py-3 rounded-xl"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase tracking-wider ml-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Mail className="w-4 h-4 text-[var(--text-tertiary)]" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="premium-input w-full pl-10 pr-4 py-3 rounded-xl"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase tracking-wider ml-1">Phone</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Phone className="w-4 h-4 text-[var(--text-tertiary)]" />
              </div>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="premium-input w-full pl-10 pr-4 py-3 rounded-xl"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={profileLoading}
            className="premium-btn-primary text-white text-[13px] font-bold px-6 py-3 rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {profileLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {profileLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Avatar Section */}
      <div className="stagger-2 premium-card-dark rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-[32px] font-extrabold shadow-lg select-none shrink-0"
          style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--accent)' }}
        >
          {name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <div className="text-center sm:text-left">
          <div className="text-[20px] font-extrabold" style={{ color: 'var(--card-dark-text-bright)' }}>{name}</div>
          <div className="text-[14px] font-medium mt-1" style={{ color: 'var(--card-dark-text)' }}>{email}</div>
          <div className="text-[13px] font-medium mt-0.5" style={{ color: 'var(--card-dark-text)' }}>{phone || 'No phone number set'}</div>
          <span className="premium-badge inline-block mt-3 px-3 py-1 text-[11px] font-bold uppercase tracking-wider"
            style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--accent)', border: '1px solid var(--accent-muted)' }}
          >
            {user?.role || 'customer'}
          </span>
        </div>
      </div>

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
                    Resend code {passwordOtpTimer > 0 && `(${Math.floor(passwordOtpTimer / 60)}:${String(passwordOtpTimer % 60).padStart(2, '0')})`}
                  </button>
                  <button type="button" onClick={() => { setPasswordOtpSent(false); setPasswordOtpCode(''); }}
                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    Use different email
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
    </div>
  );
}
