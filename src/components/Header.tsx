import React, { useState } from 'react';
import { Search, Bell, Settings, Layers, Menu, X } from 'lucide-react';
import { PortalType } from '../types';
import Logo from './Logo';

interface HeaderProps {
  currentPortal: PortalType;
  searchTermInvoice: string;
  setSearchTermInvoice: (val: string) => void;
  onNotificationsClick?: () => void;
  onPortalSwitchClick?: () => void;
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export default function Header({
  currentPortal,
  searchTermInvoice,
  setSearchTermInvoice,
  onNotificationsClick,
  onPortalSwitchClick,
  onMobileMenuToggle,
  isMobileMenuOpen = false
}: HeaderProps) {
  const [showNotificationBadge, setShowNotificationBadge] = useState(true);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

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

  return (
    <header className="flex justify-between items-center px-6 md:px-10 h-16 w-full sticky top-0 z-30 bg-white border-b border-[#c4c7ca]">
      {/* Mobile Menu Trigger & Logo */}
      <div className="flex items-center gap-3 md:hidden">
        <button 
          onClick={onMobileMenuToggle}
          className="p-1 rounded-md text-[#44474a] hover:bg-[#ebeef0] focus:outline-none"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <div className="flex items-center gap-2 select-none">
          <Logo size={32} variant="gradient" />
          <h1 className="font-sans text-[17px] tracking-tight flex items-center">
            <span className="text-[#0F171C] font-black">Nexus</span>
            <span className="text-[#0F171C] font-light">finance</span>
          </h1>
        </div>
      </div>

      {/* Desktop Search field */}
      <div className="hidden md:flex items-center flex-1">
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
      </div>

      {/* Action Tray */}
      <div className="flex items-center gap-4 relative">
        {/* Portal Quick Switch indicator */}
        <button
          onClick={onPortalSwitchClick}
          className="hidden lg:flex items-center gap-1 px-3.5 py-1.5 bg-[#f1f4f6] text-[13px] text-[#0F171C] border border-[#c4c7ca] rounded-full hover:bg-[#e5e9eb] tracking-wide font-semibold cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-[#5CF2D0] animate-pulse"></span>
          Switch View
        </button>

        {/* Notifications and Badging */}
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

          {/* Notifications Dropdown Bubble */}
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
                <button 
                  onClick={() => setShowNotificationsDropdown(false)}
                  className="text-gray-600 font-bold hover:underline"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Global Configuration trigger */}
        <button 
          onClick={onPortalSwitchClick}
          className="p-2 text-[#44474a] hover:bg-[#f1f4f6] rounded-full transition-colors hidden md:block cursor-pointer"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* Dynamic User Profile indicator */}
        <div 
          onClick={onPortalSwitchClick}
          className="w-9 h-9 rounded-full bg-[#bfc8ce] overflow-hidden border-2 border-[#e5e9eb] cursor-pointer ml-2 hover:border-[#5CF2D0] transition-colors"
        >
          <img 
            alt="User profile" 
            className="w-full h-full object-cover" 
            referrerPolicy="no-referrer"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBeLUMbzkGxqqewZraIaRRpttDQDLphanU72k_ePwtVBHk40BLN0qyzUW4DLFCjKe7bYZUHi0mCQUnzdP7bSLPfuj5yrkjqeQRXq3YOGaYqps0IJMIPF1Z0OzM8vWkTKB5hmMbgRUGUuRf2sp7Zz4L25VcJQ1Vvd-KCX3CzRp3-9rxwcYDcqRqoYDYKQKyGaaPi9u45NtS_J1dN6y9Rl8MyensO4J8PHlmU49Zh30Wj1PZdfYRINTiYbfENrNICXkS51_Y2gT2GVNM"
          />
        </div>
      </div>
    </header>
  );
}
