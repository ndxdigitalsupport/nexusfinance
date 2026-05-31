import React, { useState, useEffect } from 'react';
import { Search, Bell, Settings, Layers, Menu, X, User, LogOut, RefreshCw, CheckCircle2 } from 'lucide-react';
import { PortalType } from '../types';

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
  const [showNotificationBadge, setShowNotificationBadge] = useState(true);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    fetch('http://localhost:3001/api/config', { signal: AbortSignal.timeout(3000) })
      .then(() => setConnected(true))
      .catch(() => setConnected(false));
  }, []);

  const mockNotifications = [
    { id: 1, text: 'New SME Loan applied by SV (#77281)', time: '5 mins ago', unread: true },
    { id: 2, text: 'Urgent review required: Nguyen Khanh (#77295)', time: '1 hr ago', unread: true },
    { id: 3, text: 'Verification meeting scheduled at 14:00 PM', time: '2 hrs ago', unread: false },
  ];

  const handleNotificationClick = () => {
    setShowNotificationsDropdown(!showNotificationsDropdown);
    setShowNotificationBadge(false);
    if (onNotificationsClick) onNotificationsClick();
  };

  const roleLabel = userRole === 'super-admin' ? 'Super Admin' : userRole === 'loan-officer' ? 'Loan Officer' : 'Customer';

  return (
    <header className="flex justify-between items-center px-4 md:px-10 h-16 w-full sticky top-0 z-30 bg-white border-b border-[#c4c7ca]">
      {/* Mobile Menu Trigger & Logo */}
      <div className="flex items-center gap-3 md:hidden">
        <button 
          onClick={onMobileMenuToggle}
          className="p-1 rounded-md text-[#44474a] hover:bg-[#ebeef0] focus:outline-none cursor-pointer"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <div className="flex items-center gap-2 select-none">
          <h1 className="font-sans text-[17px] tracking-tight flex items-center">
            <span className="text-[#0F171C] font-black">Nexus</span>
            <span className="text-[#0F171C] font-light">finance</span>
          </h1>
        </div>
      </div>

      {/* Desktop Search field */}
      <div className="hidden md:flex items-center flex-1 gap-4">
        {currentPortal === 'loan-officer' && (
          <div className="relative w-80">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#44474a]" />
            <input
              type="text"
              value={searchTermInvoice}
              onChange={(e) => setSearchTermInvoice(e.target.value)}
              className="w-full bg-white border border-[#c4c7ca] rounded-full py-2 pl-10 pr-4 text-[14px] leading-tight focus:outline-none focus:border-[#0F171C] focus:ring-1 focus:ring-[#0F171C] transition-all duration-150 shadow-sm placeholder:text-[#74777b]"
              placeholder="Search applicants, loans..."
            />
          </div>
        )}
        <div className="flex items-center gap-2 text-[12px] font-semibold">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-red-400'}`} />
          <span className="text-[#74777b]">{connected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      {/* Action Tray */}
      <div className="flex items-center gap-4 relative ml-auto">
        {/* Portal Quick Switch */}
        <button
          onClick={onPortalSwitchClick}
          className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 bg-[#f1f4f6] text-[13px] text-[#0F171C] border border-[#c4c7ca] rounded-full hover:bg-[#e5e9eb] tracking-wide font-semibold cursor-pointer"
        >
          <Layers className="w-4 h-4" />
          Switch View
        </button>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={handleNotificationClick}
            className="p-2 text-[#44474a] hover:bg-[#f1f4f6] rounded-full transition-colors cursor-pointer relative"
          >
            <Bell className="w-5 h-5" />
            {showNotificationBadge && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-white"></span>
            )}
          </button>

          {showNotificationsDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#c4c7ca] rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-[#e0e3e5] flex justify-between items-center bg-[#f1f4f6] rounded-t-xl">
                <span className="font-bold text-[14px] text-[#0F171C]">Notifications</span>
                <span className="text-[11px] text-[#0F171C] bg-[#5CF2D0] font-sans font-bold px-2 py-0.5 rounded-full">New</span>
              </div>
              <div className="divide-y divide-[#e0e3e5] max-h-64 overflow-y-auto">
                {mockNotifications.map((notif) => (
                  <div key={notif.id} className={`p-3 text-[13px] hover:bg-[#f1f4f6] transition-colors cursor-pointer ${notif.unread ? 'bg-blue-50/50' : ''}`}>
                    <p className={`text-[#181c1e] ${notif.unread ? 'font-semibold' : ''}`}>{notif.text}</p>
                    <span className="text-[10px] text-[#74777b] mt-1 block">{notif.time}</span>
                  </div>
                ))}
              </div>
              <div className="p-2 text-center text-[12px] bg-[#f1f4f6]/50 border-t border-[#e0e3e5] rounded-b-xl">
                <button onClick={() => setShowNotificationsDropdown(false)} className="text-gray-600 font-bold hover:underline cursor-pointer">Close</button>
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <button 
          onClick={onPortalSwitchClick}
          className="p-2 text-[#44474a] hover:bg-[#f1f4f6] rounded-full transition-colors hidden md:block cursor-pointer"
          title="Switch Portal"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* User Info + Avatar */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="hidden md:block text-right">
              <p className="text-[13px] font-bold text-[#0F171C] leading-tight">{userName || 'User'}</p>
              <p className="text-[11px] font-semibold text-[#74777b] leading-tight">{roleLabel}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#bfc8ce] overflow-hidden border-2 border-[#e5e9eb] hover:border-[#5CF2D0] transition-colors flex items-center justify-center">
              <User className="w-5 h-5 text-[#44474a]" />
            </div>
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-white border border-[#c4c7ca] rounded-xl shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <button
                  onClick={() => { setShowUserMenu(false); if (onProfileClick) onProfileClick(); }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-[13px] font-semibold text-[#0F171C] hover:bg-[#f1f4f6] cursor-pointer"
                >
                  <User className="w-4 h-4 text-[#44474a]" /> Profile
                </button>
                <button
                  onClick={() => { setShowUserMenu(false); if (onPortalSwitchClick) onPortalSwitchClick(); }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-[13px] font-semibold text-[#0F171C] hover:bg-[#f1f4f6] cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-[#44474a]" /> Switch Portal
                </button>
                <hr className="border-[#e0e3e5] my-1" />
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
