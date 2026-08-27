import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Save, RefreshCw, Shield, UserCheck, MessageCircle } from 'lucide-react';
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
  const [profileLoading, setProfileLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

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
                  <span className="text-[13px] text-[var(--text-primary)] font-medium block mt-0.5 capitalize">{user?.role === 'super-admin' ? 'Root Administrator' : user?.role === 'admin' ? 'Administrator' : user?.role === 'loan-officer' ? 'Operations Officer' : 'Verified Client'}</span>
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

            <div className="p-6 rounded-2xl bg-[var(--surface-secondary)]/50 border border-[var(--border-primary)] space-y-4">
              <p className="text-[13px] text-[var(--text-secondary)] font-medium leading-relaxed">
                To modify your account password, you will be redirected to our Telegram bot where you can securely verify your identity and set a new password.
              </p>
              <div className="flex justify-start">
                <a
                  href="https://t.me/nexusfinancefintech_bot?start=changepassword"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="premium-btn-primary text-white text-[13px] font-bold px-6 py-3 rounded-xl flex items-center gap-2 bg-[var(--accent)] hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  <MessageCircle className="w-4 h-4" /> Change Password via Telegram
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }
