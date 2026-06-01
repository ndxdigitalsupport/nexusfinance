import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Save, RefreshCw, CheckCircle2 } from 'lucide-react';
import { showToast } from './Toast';
import { SkeletonCard } from './Skeleton';

import { API } from '../api';

interface ProfilePageProps {
  token: string;
}

export default function ProfilePage({ token }: ProfilePageProps) {
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
    fetch(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
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
      const res = await fetch(`${API}/auth/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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
      const res = await fetch(`${API}/auth/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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
      <h2 className="text-[28px] font-extrabold text-[#0f171c]">Profile</h2>

      {/* Personal Info */}
      <div className="bg-white border border-[#c4c7ca] rounded-2xl p-8">
        <h3 className="text-[15px] font-bold text-[#0f171c] mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-[#44474a]" /> Personal Information
        </h3>
        <form onSubmit={handleProfileSave} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[11.5px] font-bold text-slate-500 uppercase tracking-wider ml-1">Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <User className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-[14px] font-medium focus:outline-none focus:border-[#5CF2D0] focus:ring-4 focus:ring-[#5CF2D0]/10 text-slate-800 transition-all"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11.5px] font-bold text-slate-500 uppercase tracking-wider ml-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Mail className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-[14px] font-medium focus:outline-none focus:border-[#5CF2D0] focus:ring-4 focus:ring-[#5CF2D0]/10 text-slate-800 transition-all"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11.5px] font-bold text-slate-500 uppercase tracking-wider ml-1">Phone</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Phone className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-[14px] font-medium focus:outline-none focus:border-[#5CF2D0] focus:ring-4 focus:ring-[#5CF2D0]/10 text-slate-800 transition-all"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={profileLoading}
            className="bg-[#0F171C] hover:bg-slate-800 text-white text-[13px] font-bold px-6 py-3 rounded-xl transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {profileLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {profileLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white border border-[#c4c7ca] rounded-2xl p-8">
        <h3 className="text-[15px] font-bold text-[#0f171c] mb-6 flex items-center gap-2">
          <Lock className="w-5 h-5 text-[#44474a]" /> Change Password
        </h3>
        <form onSubmit={handlePasswordSave} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[11.5px] font-bold text-slate-500 uppercase tracking-wider ml-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[14px] font-medium focus:outline-none focus:border-[#5CF2D0] focus:ring-4 focus:ring-[#5CF2D0]/10 text-slate-800 transition-all"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11.5px] font-bold text-slate-500 uppercase tracking-wider ml-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[14px] font-medium focus:outline-none focus:border-[#5CF2D0] focus:ring-4 focus:ring-[#5CF2D0]/10 text-slate-800 transition-all"
              required
              minLength={6}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11.5px] font-bold text-slate-500 uppercase tracking-wider ml-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[14px] font-medium focus:outline-none focus:border-[#5CF2D0] focus:ring-4 focus:ring-[#5CF2D0]/10 text-slate-800 transition-all"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={passwordLoading}
            className="bg-[#0F171C] hover:bg-slate-800 text-white text-[13px] font-bold px-6 py-3 rounded-xl transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {passwordLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {passwordLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
