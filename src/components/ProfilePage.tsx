import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Save, RefreshCw, Shield, UserCheck, MessageCircle, CheckCircle2, Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { showToast } from './Toast';
import { SkeletonCard } from './Skeleton';
import { apiFetch } from '../api';
import { useCurrency } from '../context/CurrencyContext';

interface ProfilePageProps {
  token: string;
  user?: { name: string; role: string } | null;
  onProfileUpdate?: (updated: { name: string; email: string; phone?: string }) => void;
}

export default function ProfilePage({ token, user, onProfileUpdate }: ProfilePageProps) {
  const { t } = useCurrency();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [originalPhone, setOriginalPhone] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showEmail, setShowEmail] = useState(false);

  // Phone change verification state
  const [showPhoneVerify, setShowPhoneVerify] = useState(false);
  const [phoneChanging, setPhoneChanging] = useState(false);
  const [phoneChangeDeepLink, setPhoneChangeDeepLink] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);

  // Account deletion state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteStep, setDeleteStep] = useState(0);

  useEffect(() => {
    Promise.all([
      apiFetch('/auth/me'),
      apiFetch('/config'),
    ]).then(([meData, configData]) => {
      setName(meData.name || '');
      const userEmail = (meData.email && !meData.email.endsWith('@nexus.local')) ? meData.email : '';
      setEmail(userEmail);
      setPhone(meData.phone || '');
      setOriginalPhone(meData.phone || '');
      setShowEmail(configData?.emailVerificationRequired !== false);
    }).catch(() => showToast('Failed to load profile', 'error'))
      .finally(() => setFetching(false));
  }, [token]);

  // Poll for phone change completion
  useEffect(() => {
    if (!phoneChanging || phoneVerified) return;

    const interval = setInterval(async () => {
      try {
        const data = await apiFetch('/auth/phone-change-status');
        if (data.phone && data.phone !== originalPhone) {
          setPhone(data.phone);
          setOriginalPhone(data.phone);
          setPhoneVerified(true);
          setPhoneChanging(false);
          setShowPhoneVerify(false);
          showToast('Phone number updated successfully!');
          onProfileUpdate?.({ name, email, phone: data.phone });
        }
      } catch {
        // Silently retry
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [phoneChanging, phoneVerified, originalPhone, name, email, onProfileUpdate]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // If phone changed, show verification prompt instead of saving
    if (phone !== originalPhone) {
      setPhoneChanging(true);
      try {
        const data = await apiFetch('/auth/phone-change-request', {
          method: 'POST',
          body: JSON.stringify({ newPhone: phone }),
        });
        setPhoneChangeDeepLink(data.deepLink);
        setShowPhoneVerify(true);
      } catch (err: any) {
        setPhoneChanging(false);
        showToast(err?.message || 'Failed to request phone change', 'error');
      }
      return;
    }

    // Save name/email only
    setProfileLoading(true);
    try {
      const body: any = { name };
      if (showEmail) body.email = email;
      await apiFetch('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      onProfileUpdate?.({ name, email, phone });
      showToast('Profile updated successfully');
    } catch {
      showToast('Could not connect to server.', 'error');
    } finally {
      setProfileLoading(false);
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

  const getRoleLabel = (role: string) => {
    if (role === 'super-admin') return t('root_administrator');
    if (role === 'admin') return t('administrator');
    if (role === 'loan-officer') return t('operations_officer');
    return t('verified_client');
  };

  const handleDeleteAccount = async () => {
    if (deleteStep === 0) {
      setDeleteStep(1);
      return;
    }
    setDeleteLoading(true);
    try {
      await apiFetch('/auth/account', { method: 'DELETE' });
      showToast('Account deleted successfully. You will be logged out.');
      // Clear all storage and redirect
      localStorage.clear();
      window.location.href = '/';
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete account', 'error');
      setDeleteLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-300 max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-[28px] font-extrabold text-[var(--text-primary)]">{t('profile_settings')}</h2>
        <p className="text-[13px] text-[var(--text-secondary)] mt-1">{t('profile_settings_desc')}</p>
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
                  <UserCheck className="w-3 h-3" /> {t('active_status')}
                </span>
              </div>
            </div>

            {/* Detail list items */}
            <div className="p-8 pt-0 relative border-t border-[var(--border-primary)]/50 mt-auto space-y-4 text-left">
              {showEmail && (
                <div className="flex items-center gap-3 pt-6">
                  <div className="w-8 h-8 rounded-xl bg-[var(--surface-secondary)] flex items-center justify-center shrink-0 border border-[var(--border-secondary)]">
                    <Mail className="w-4 h-4 text-[var(--text-secondary)]" />
                  </div>
                  <div className="overflow-hidden w-full">
                    <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] block tracking-wider leading-none">{t('your_email_address')}</span>
                    <span className={`text-[13px] font-medium block truncate mt-0.5 ${(email && !email.endsWith('@nexus.local')) ? 'text-[var(--text-primary)] font-mono' : 'text-[var(--text-tertiary)] italic'}`} title={email || 'No email linked'}>
                      {(email && !email.endsWith('@nexus.local')) ? email : 'No email linked'}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 pt-6">
                <div className="w-8 h-8 rounded-xl bg-[var(--surface-secondary)] flex items-center justify-center shrink-0 border border-[var(--border-secondary)]">
                  <Phone className="w-4 h-4 text-[var(--text-secondary)]" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] block tracking-wider leading-none">{t('phone_contact')}</span>
                  <span className="text-[13px] text-[var(--text-primary)] font-medium block mt-0.5 font-mono">{phone || t('no_phone_set')}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[var(--surface-secondary)] flex items-center justify-center shrink-0 border border-[var(--border-secondary)]">
                  <Shield className="w-4 h-4 text-[var(--text-secondary)]" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] block tracking-wider leading-none">{t('access_clearance')}</span>
                  <span className="text-[13px] text-[var(--text-primary)] font-medium block mt-0.5 capitalize">{getRoleLabel(user?.role || 'customer')}</span>
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
                <User className="w-5 h-5 text-[var(--accent)]" /> {t('personal_information')}
              </h3>
              
              <form onSubmit={handleProfileSave} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider ml-1">{t('full_name')}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <User className="w-4 h-4 text-[var(--text-tertiary)]" />
                      </div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t('enter_your_name')}
                        className="premium-input w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border-primary)] focus:border-[var(--accent)] transition-all font-medium text-[13px] bg-[var(--surface-primary)]"
                      />
                    </div>
                  </div>

                  {showEmail && (
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider ml-1">{t('your_email_address')}</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                          <Mail className="w-4 h-4 text-[var(--text-tertiary)]" />
                        </div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={t('enter_your_email')}
                          className="premium-input w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border-primary)] focus:border-[var(--accent)] transition-all font-medium text-[13px] bg-[var(--surface-primary)]"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider ml-1">{t('phone_contact')}</label>
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
                  {showPhoneVerify ? (
                    <div className="flex flex-col items-end gap-3 w-full">
                      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 w-full">
                        <p className="text-[13px] text-amber-700 dark:text-amber-400 font-medium mb-3">
                          A verification is required to change your phone number. Click the button below to verify via Telegram.
                        </p>
                        <div className="flex gap-2">
                          <a
                            href={phoneChangeDeepLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="premium-btn-primary text-white text-[13px] font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] transition-all"
                          >
                            <MessageCircle className="w-4 h-4" /> Verify via Telegram
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              setShowPhoneVerify(false);
                              setPhoneChanging(false);
                              setPhone(originalPhone);
                            }}
                            className="text-[13px] font-medium px-4 py-2.5 rounded-xl border border-[var(--border-primary)] hover:bg-[var(--surface-secondary)] transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                      {phoneChanging && !phoneVerified && (
                        <div className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)]">
                          <Loader2 className="w-4 h-4 animate-spin" /> Waiting for Telegram verification...
                        </div>
                      )}
                    </div>
                  ) : phoneVerified ? (
                    <div className="flex items-center gap-2 text-[13px] text-emerald-600 font-medium">
                      <CheckCircle2 className="w-4 h-4" /> Phone number updated!
                    </div>
                  ) : (
                    <button
                      type="submit"
                      disabled={profileLoading}
                      className="premium-btn-primary text-white text-[13px] font-bold px-6 py-3 rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-2 bg-[var(--accent)] hover:opacity-90 active:scale-[0.98] transition-all"
                    >
                      {profileLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {profileLoading ? t('saving') : t('save_profile_changes')}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Change Security Password Panel (Full Width) */}
      <div className="premium-card rounded-3xl p-8 border border-[var(--border-primary)] shadow-sm hover:shadow-md transition-shadow">
        <h3 className="text-[16px] font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2.5">
          <Lock className="w-5 h-5 text-[var(--accent)]" /> {t('change_security_password')}
        </h3>

        <div className="p-6 rounded-2xl bg-[var(--surface-secondary)]/50 border border-[var(--border-primary)] space-y-4">
          <p className="text-[13px] text-[var(--text-secondary)] font-medium leading-relaxed">
            {t('change_password_desc')}
          </p>
          <div className="flex justify-start">
            <a
              href="https://t.me/nexusfinancefintech_bot?start=changepassword"
              target="_blank"
              rel="noopener noreferrer"
              className="premium-btn-primary text-white text-[13px] font-bold px-6 py-3 rounded-xl flex items-center gap-2 bg-[var(--accent)] hover:opacity-90 active:scale-[0.98] transition-all"
            >
              <MessageCircle className="w-4 h-4" /> {t('change_password_via_telegram')}
            </a>
          </div>
        </div>
      </div>

      {/* Row 3: Danger Zone - Account Deletion (Required by Apple App Store) */}
      {user?.role !== 'super-admin' && (
        <div className="rounded-3xl p-8 border border-red-500/20 bg-red-500/5 shadow-sm">
          <h3 className="text-[16px] font-bold text-red-600 mb-2 flex items-center gap-2.5">
            <Trash2 className="w-5 h-5" /> Delete Account
          </h3>
          <p className="text-[13px] text-[var(--text-secondary)] font-medium mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-[13px] font-bold px-5 py-2.5 rounded-xl border border-red-500/30 text-red-600 hover:bg-red-500/10 active:scale-[0.98] transition-all cursor-pointer"
            >
              Delete Account
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 space-y-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[13px] font-bold text-red-600">
                    {deleteStep === 0 ? 'Are you sure you want to delete your account?' : 'Type DELETE to confirm'}
                  </p>
                  <p className="text-[12px] text-[var(--text-secondary)] mt-1">
                    {deleteStep === 0
                      ? 'This will permanently remove all your data including loans, documents, and transaction history.'
                      : 'This is your last chance. All data will be permanently erased.'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {deleteStep === 0 ? (
                  <button
                    onClick={handleDeleteAccount}
                    className="text-[13px] font-bold px-5 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteLoading}
                    className="text-[13px] font-bold px-5 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    {deleteLoading ? 'Deleting...' : 'Delete My Account'}
                  </button>
                )}
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeleteStep(0); }}
                  className="text-[13px] font-medium px-4 py-2.5 rounded-xl border border-[var(--border-primary)] hover:bg-[var(--surface-secondary)] transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
