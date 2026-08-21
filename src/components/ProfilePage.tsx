import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Save, RefreshCw, CheckCircle2, Shield, UserCheck } from 'lucide-react';
import { showToast } from './Toast';
import { SkeletonCard } from './Skeleton';

import { apiFetch } from '../api';
import { API } from '../api';

interface ProfilePageProps {
  token: string;
  user?: { name: string; role: string } | null;
  onProfileUpdate?: (updated: { name: string; email: string; phone?: string }) => void;
}

export default function ProfilePage({ token, user, onProfileUpdate }: ProfilePageProps) {
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
      onProfileUpdate?.({ name, email, phone });
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
      const res = await fetch(`${API}/auth/send-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP.');
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
      const res = await fetch(`${API}/auth/verify-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: passwordOtpCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid or expired code.');
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

  if (fetching) {
    return (
      <div className="animate-in fade-in duration-200 max-w-6xl mx-auto space-y-8">
        <div className="h-10 w-48 bg-[var(--surface-secondary)] rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1"><SkeletonCard lines={4} /></div>
          <div className="lg:col-span-2 space-y-8"><SkeletonCard lines={3} /><SkeletonCard lines={3} /></div>
        </div>
      </div>
    );
  }

  const userInitials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U';

  return (
    <div className="animate-in fade-in duration-300 max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-[28px] font-extrabold text-[var(--text-primary)]">Profile Settings</h2>
        <p className="text-[13px] text-[var(--text-secondary)] mt-1">Manage your identity, settings, credentials, and verification channels.</p>
      </div>

      {/* Row 1: Profile Card (1/3) & Personal Information (2/3) - Equal Heights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {/* Left Column: Visual Profile Card */}
        <div className="lg:col-span-1 h-full flex flex-col">
          <div className="premium-card rounded-3xl overflow-hidden relative border border-[var(--border-primary)] transition-all duration-300 hover:shadow-2xl hover:border-[var(--accent)] group h-full flex flex-col justify-between">
            {/* Visual background details */}
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-[var(--accent)] to-[#3B82F6] opacity-15" />
            <div className="absolute top-16 right-4 w-24 h-24 rounded-full bg-[var(--accent)]/10 blur-2xl group-hover:bg-[var(--accent)]/20 transition-all duration-500" />
            
            <div className="p-8 relative pt-12 flex flex-col items-center text-center flex-grow justify-center">
              {/* Profile Image Initials with Glowing Pulse Ring */}
              <div className="relative mb-5 shrink-0 group-hover:scale-105 transition-transform duration-300">
                <div className="absolute inset-0 rounded-full bg-[var(--accent)]/20 blur-md scale-110 group-hover:scale-125 transition-transform duration-300" />
                <div className="w-24 h-24 rounded-full bg-[var(--surface-secondary)] border-4 border-[var(--surface-card)] flex items-center justify-center text-[36px] font-extrabold shadow-inner relative z-10 font-sans"
                  style={{ color: 'var(--accent)' }}
                >
                  {userInitials}
                </div>
              </div>

              <h3 className="text-[20px] font-extrabold text-[var(--text-primary)] leading-tight">{name}</h3>
              
              <div className="flex items-center gap-1.5 mt-2.5">
                <span className="premium-badge px-3.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[var(--accent-muted)] border border-[var(--accent)]/20"
                  style={{ color: 'var(--accent)' }}
                >
                  {user?.role || 'customer'}
                </span>
                <span className="premium-badge px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center gap-1">
                  <UserCheck className="w-3 h-3" /> Active
                </span>
              </div>
            </div>

            {/* Detail list items */}
            <div className="p-8 pt-0 relative border-t border-[var(--border-primary)]/50 mt-auto space-y-4 text-left">
              <div className="flex items-center gap-3 pt-6">
                <div className="w-8 h-8 rounded-xl bg-[var(--surface-secondary)] flex items-center justify-center shrink-0 border border-[var(--border-secondary)]">
                  <Mail className="w-4 h-4 text-[var(--text-secondary)]" />
                </div>
                <div className="overflow-hidden w-full">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] block tracking-wider leading-none">Email Address</span>
                  <span className="text-[13px] text-[var(--text-primary)] font-medium block truncate font-mono mt-0.5" title={email}>{email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[var(--surface-secondary)] flex items-center justify-center shrink-0 border border-[var(--border-secondary)]">
                  <Phone className="w-4 h-4 text-[var(--text-secondary)]" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] block tracking-wider leading-none">Phone Contact</span>
                  <span className="text-[13px] text-[var(--text-primary)] font-medium block mt-0.5 font-mono">{phone || 'No phone set'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[var(--surface-secondary)] flex items-center justify-center shrink-0 border border-[var(--border-secondary)]">
                  <Shield className="w-4 h-4 text-[var(--text-secondary)]" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] block tracking-wider leading-none">Access Clearance</span>
                  <span className="text-[13px] text-[var(--text-primary)] font-medium block mt-0.5 capitalize">{user?.role === 'super-admin' ? 'Root Administrator' : user?.role === 'loan-officer' ? 'Operations Officer' : 'Verified Client'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Personal Information Form */}
        <div className="lg:col-span-2 h-full flex flex-col">
          <div className="premium-card rounded-3xl p-8 border border-[var(--border-primary)] shadow-sm hover:shadow-md transition-shadow h-full flex flex-col justify-between">
            <div>
              <h3 className="text-[16px] font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2.5">
                <User className="w-5 h-5 text-[var(--accent)]" /> Personal Information
              </h3>
              
              <form onSubmit={handleProfileSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider ml-1">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <User className="w-4 h-4 text-[var(--text-tertiary)]" />
                      </div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        className="premium-input w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border-primary)] focus:border-[var(--accent)] transition-all font-medium text-[13px] bg-[var(--surface-primary)]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider ml-1">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <Mail className="w-4 h-4 text-[var(--text-tertiary)]" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="premium-input w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border-primary)] focus:border-[var(--accent)] transition-all font-medium text-[13px] bg-[var(--surface-primary)]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider ml-1">Phone Contact</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <Phone className="w-4 h-4 text-[var(--text-tertiary)]" />
                      </div>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter your phone number (e.g. +85581968581)"
                        className="premium-input w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border-primary)] focus:border-[var(--accent)] transition-all font-medium text-[13px] bg-[var(--surface-primary)]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2 mt-6">
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="premium-btn-primary text-white text-[13px] font-bold px-6 py-3 rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-2 bg-[var(--accent)] hover:opacity-90 active:scale-[0.98] transition-all"
                  >
                    {profileLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {profileLoading ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Change Security Password Panel (Full Width) */}
      <div className="premium-card rounded-3xl p-8 border border-[var(--border-primary)] shadow-sm hover:shadow-md transition-shadow">
        <h3 className="text-[16px] font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2.5">
          <Lock className="w-5 h-5 text-[var(--accent)]" /> Change Security Password
        </h3>

            {!passwordOtpVerified ? (
              <div className="p-6 rounded-2xl bg-[var(--surface-secondary)]/50 border border-[var(--border-primary)] space-y-4">
                {!passwordOtpSent ? (
                  /* Step 1: Send OTP UI */
                  <div className="space-y-4">
                    <p className="text-[13px] text-[var(--text-secondary)] font-medium leading-relaxed">
                      To modify your account password, we must first verify your email address (<strong>{email}</strong>). We will send a secure 6-digit one-time password (OTP) verification code.
                    </p>
                    <div className="flex justify-start">
                      <button
                        type="button"
                        onClick={handleSendPasswordOtp}
                        disabled={passwordLoading}
                        className="premium-btn-primary text-white text-[13px] font-bold px-6 py-3 rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-2 bg-[var(--accent)] hover:opacity-90 active:scale-[0.98] transition-all"
                      >
                        {passwordLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                        {passwordLoading ? 'Sending Verification...' : 'Send OTP to Email'}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Step 2: Enter OTP Code UI */
                  <form onSubmit={handleVerifyPasswordOtp} className="space-y-5">
                    <p className="text-[13px] text-[var(--text-secondary)] font-semibold text-center">
                      Verification code sent to <strong>{email}</strong>
                    </p>
                    <div className="max-w-xs mx-auto">
                      <input
                        type="text"
                        maxLength={6}
                        value={passwordOtpCode}
                        onChange={(e) => setPasswordOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        className="w-full text-center text-[26px] tracking-[10px] font-mono premium-input rounded-xl px-4 py-3 border border-[var(--border-primary)] bg-[var(--surface-primary)] focus:border-[var(--accent)] font-bold placeholder:tracking-normal placeholder:font-sans placeholder:text-gray-400 focus:ring-2 focus:ring-[var(--accent)]/10"
                        required
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={passwordLoading || passwordOtpCode.length < 6}
                      className="premium-btn-primary text-white text-[13px] font-bold px-6 py-3 rounded-xl cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 w-full max-w-xs mx-auto bg-[var(--accent)] hover:opacity-90 active:scale-[0.98] transition-all"
                    >
                      {passwordLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      {passwordLoading ? 'Verifying Code...' : 'Verify Code'}
                    </button>
                    
                    <div className="flex justify-between items-center text-[12px] max-w-xs mx-auto pt-2">
                      <button type="button" onClick={handleSendPasswordOtp} disabled={passwordOtpTimer > 0}
                        className="text-[var(--text-secondary)] font-bold hover:text-[var(--text-primary)] cursor-pointer disabled:opacity-40"
                      >
                        Resend code {passwordOtpTimer > 0 && `(${Math.floor(passwordOtpTimer / 60)}:${String(passwordOtpTimer % 60).padStart(2, '0')})`}
                      </button>
                      <button type="button" onClick={() => { setPasswordOtpSent(false); setPasswordOtpCode(''); }}
                        className="text-[var(--text-secondary)] font-bold hover:text-[var(--text-primary)] cursor-pointer"
                      >
                        Choose another email
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              /* Step 3: Set New Password Form */
              <form onSubmit={handlePasswordSave} className="space-y-6">
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[13px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> Identity Verified successfully. You can now set your new password.
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider ml-1">New Security Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <Lock className="w-4 h-4 text-[var(--text-tertiary)]" />
                      </div>
                      <input 
                        type="password" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        placeholder="••••••••"
                        className="premium-input w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border-primary)] focus:border-[var(--accent)] font-medium text-[13px] bg-[var(--surface-primary)]" 
                        required 
                        minLength={6} 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider ml-1">Confirm Security Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <Lock className="w-4 h-4 text-[var(--text-tertiary)]" />
                      </div>
                      <input 
                        type="password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        placeholder="••••••••"
                        className="premium-input w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border-primary)] focus:border-[var(--accent)] font-medium text-[13px] bg-[var(--surface-primary)]" 
                        required 
                        minLength={6} 
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    type="submit" 
                    disabled={passwordLoading} 
                    className="premium-btn-primary text-white text-[13px] font-bold px-6 py-3 rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-2 bg-[var(--accent)] hover:opacity-90 active:scale-[0.98] transition-all"
                  >
                    {passwordLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {passwordLoading ? 'Updating Password...' : 'Save New Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      );
    }
