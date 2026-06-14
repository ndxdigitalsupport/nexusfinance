import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Save, RefreshCw, CheckCircle2 } from 'lucide-react';
import { showToast } from './Toast';
import { SkeletonCard } from './Skeleton';

import { API } from '../api';

async function authFetch(path: string, token: string, options?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(options?.headers || {}) },
  });
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_portal');
    localStorage.removeItem('nexus_active_menu');
    window.location.reload();
    throw new Error('Session expired');
  }
  return res;
}

interface ProfilePageProps {
  token: string;
  user?: { name: string; role: string } | null;
}

export default function ProfilePage({ token, user }: ProfilePageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    authFetch('/auth/me', token)
      .then((r) => r.json())
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
      const res = await authFetch('/auth/profile', token, {
        method: 'PATCH',
        body: JSON.stringify({ name, email, phone }),
      });
      const data = await res.json();
      if (!res.ok) return showToast(data.error || 'Failed to update profile', 'error');
      showToast('Profile updated successfully');
    } catch {
      showToast('Could not connect to server.', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return showToast('New passwords do not match', 'error');
    setPasswordLoading(true);
    try {
      const res = await authFetch('/auth/password', token, {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) return showToast(data.error || 'Failed to update password', 'error');
      showToast('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      showToast('Could not connect to server.', 'error');
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
        <form onSubmit={handlePasswordSave} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase tracking-wider ml-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="premium-input w-full px-4 py-3 rounded-xl"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase tracking-wider ml-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="premium-input w-full px-4 py-3 rounded-xl"
              required
              minLength={6}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase tracking-wider ml-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="premium-input w-full px-4 py-3 rounded-xl"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={passwordLoading}
            className="premium-btn-primary text-white text-[13px] font-bold px-6 py-3 rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {passwordLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {passwordLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
