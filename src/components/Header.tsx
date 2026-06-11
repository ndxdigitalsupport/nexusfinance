import React, { useState, useEffect } from 'react';
import { Search, Bell, Menu, X, User, LogOut, Layers, Sun, Moon } from 'lucide-react';
import { PortalType } from '../types';
import { API } from '../api';

async function apiFetch(path: string, options?: RequestInit) {
  const token = localStorage.getItem('nexus_token');
  const res = await fetch(`${API}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options?.headers || {}) } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

interface HeaderProps {
  currentPortal: PortalType;
  searchTermInvoice: string;
  setSearchTermInvoice: (val: string) => void;
  onNotificationsClick?: () => void;
  onPortalSwitchClick?: () => void;
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
  userName?: string;
  userRole?: string;
  onProfileClick?: () => void;
  onLogout?: () => void;
}

export default function Header({
  currentPortal,
  searchTermInvoice,
  setSearchTermInvoice,
  onNotificationsClick,
  onPortalSwitchClick,
  onMobileMenuToggle,
  isMobileMenuOpen = false,
  userName,
  userRole,
  onProfileClick,
  onLogout,
}: HeaderProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [connected, setConnected] = useState(false);
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
  };

  useEffect(() => {
    fetch(`${API}/config`, { signal: AbortSignal.timeout(3000) })
      .then(() => setConnected(true))
      .catch(() => setConnected(false));
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('nexus_token')) return;
    apiFetch('/notifications').then(setNotifications).catch(() => {});
    const interval = setInterval(() => {
      apiFetch('/notifications').then(setNotifications).catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleMarkRead = async (id: number) => {
    await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' }).catch(() => {});
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const handleNotificationClick = () => {
    setShowNotificationsDropdown(!showNotificationsDropdown);
  };

  const roleLabel = userRole === 'super-admin' ? 'Super Admin' : userRole === 'loan-officer' ? 'Loan Officer' : 'Customer';

  return (
    <header className="flex justify-between items-center px-4 md:px-10 h-16 w-full sticky top-0 z-30 bg-white border-b border-[var(--border-primary)]">
      {/* Mobile Menu Trigger & Logo */}
      <div className="flex items-center gap-3 md:hidden">
        <button 
          onClick={onMobileMenuToggle}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
          className="p-1 rounded-md text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] focus:outline-none cursor-pointer"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <div className="flex items-center gap-2 select-none">
          <h1 className="font-sans text-[17px] tracking-tight flex items-center">
            <span className="text-[var(--text-primary)] font-black">Nexus</span>
            <span className="text-[var(--text-primary)] font-light">finance</span>
          </h1>
        </div>
      </div>

      {/* Desktop Search field */}
      <div className="hidden md:flex items-center flex-1 gap-4">
        {currentPortal === 'loan-officer' && (
          <div className="relative w-80">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              value={searchTermInvoice}
              onChange={(e) => setSearchTermInvoice(e.target.value)}
              className="w-full bg-white border border-[var(--border-primary)] rounded-xl py-2.5 pl-10 pr-20 text-[14px] leading-tight focus:outline-none focus:border-[#5CF2D0] focus:ring-2 focus:ring-[#5CF2D0]/20 transition-all duration-150 shadow-sm placeholder:text-[var(--text-tertiary)]"
              placeholder="Search applicants, loans..."
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {searchTermInvoice && (
                <button onClick={() => setSearchTermInvoice('')} className="p-0.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd className="hidden sm:inline-flex text-[10px] font-bold text-[var(--text-tertiary)] bg-[var(--surface-secondary)] border border-[var(--border-primary)] px-1.5 py-0.5 rounded leading-none">⌘K</kbd>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2 text-[12px] font-semibold">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-red-400'}`} />
          <span className="text-[var(--text-tertiary)]">{connected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      {/* Action Tray */}
      <div className="flex items-center gap-2 relative ml-auto">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-2 text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] rounded-full transition-colors cursor-pointer"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={handleNotificationClick}
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
            aria-expanded={showNotificationsDropdown}
            aria-haspopup="true"
            className="p-2 text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] rounded-full transition-colors cursor-pointer relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] text-[10px] font-bold bg-red-600 text-white rounded-full flex items-center justify-center px-1 border-2 border-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotificationsDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[var(--border-primary)] rounded-xl shadow-lg py-2 z-50 animate-dropdown-enter">
              <div className="px-4 py-2 border-b border-[var(--border-primary)] flex justify-between items-center bg-[var(--surface-secondary)] rounded-t-xl">
                <span className="font-bold text-[14px] text-[var(--text-primary)]">Notifications</span>
                {unreadCount > 0 && <span className="text-[11px] text-[var(--text-primary)] bg-[#5CF2D0] font-bold px-2 py-0.5 rounded-full">{unreadCount} new</span>}
              </div>
              <div className="divide-y divide-[#e0e3e5] max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-[var(--text-tertiary)] text-[13px]">No notifications yet</div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => { if (notif.unread) handleMarkRead(notif.id); }}
                      className={`p-3 text-[13px] hover:bg-[var(--surface-secondary)] transition-colors cursor-pointer ${notif.unread ? 'bg-blue-50/50' : ''}`}
                    >
                      <p className={`text-[var(--text-primary)] ${notif.unread ? 'font-semibold' : ''}`}>{notif.text}</p>
                      <span className="text-[10px] text-[var(--text-tertiary)] mt-1 block">{notif.time}</span>
                    </div>
                  ))
                )}
              </div>
              <div className="p-2 text-center text-[12px] bg-[var(--surface-secondary)]/50 border-t border-[var(--border-primary)] rounded-b-xl">
                <button onClick={() => setShowNotificationsDropdown(false)} className="text-gray-600 font-bold hover:underline cursor-pointer">Close</button>
              </div>
            </div>
          )}
        </div>

        {/* User Info + Avatar */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-label="User menu"
            aria-expanded={showUserMenu}
            aria-haspopup="true"
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="hidden md:block text-right">
              <p className="text-[13px] font-bold text-[var(--text-primary)] leading-tight">{userName || 'User'}</p>
              <p className="text-[11px] font-semibold text-[var(--text-tertiary)] leading-tight">{roleLabel}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#bfc8ce] overflow-hidden border-2 border-[var(--border-primary)] hover:border-[var(--accent)] transition-colors flex items-center justify-center">
              <User className="w-5 h-5 text-[var(--text-secondary)]" />
            </div>
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-white border border-[var(--border-primary)] rounded-xl shadow-lg py-1 z-50 animate-dropdown-enter">
                <button
                  onClick={() => { setShowUserMenu(false); if (onProfileClick) onProfileClick(); }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-[13px] font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] cursor-pointer"
                >
                  <User className="w-4 h-4 text-[var(--text-secondary)]" /> Profile
                </button>
                {userRole !== 'customer' && (
                  <button
                    onClick={() => { setShowUserMenu(false); if (onPortalSwitchClick) onPortalSwitchClick(); }}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-[13px] font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] cursor-pointer"
                  >
                    <Layers className="w-4 h-4 text-[var(--text-secondary)]" /> Switch Portal
                  </button>
                )}
                <hr className="border-[var(--border-primary)] my-1" />
                <button
                  onClick={() => { setShowUserMenu(false); if (onLogout) onLogout(); }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-[13px] font-semibold text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
