import React from 'react';
import { PlusCircle, LayoutDashboard, Landmark, Wallet, History, CheckSquare, Settings, Users, HelpCircle, LogOut, User, ChevronRight, ClipboardList, QrCode } from 'lucide-react';
import { PortalType } from '../types';
import Logo from './Logo';

interface SidebarProps {
  currentPortal: PortalType;
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  onApplyForLoan: () => void;
  onLogout: () => void;
}

const s = (name: string) => `var(--${name})`;

export default function Sidebar({ currentPortal, activeMenu, setActiveMenu, onApplyForLoan, onLogout }: SidebarProps) {
  const menuItems = currentPortal === 'loan-officer'
    ? [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }, { id: 'tasks', label: 'Compliance Tasks', icon: CheckSquare }]
    : currentPortal === 'super-admin'
    ? [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }, { id: 'users', label: 'Users', icon: Users }, { id: 'audit', label: 'Audit Log', icon: ClipboardList }, { id: 'settings', label: 'Settings', icon: Settings }]
    : [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }, { id: 'loans', label: 'Loans Ledger', icon: Landmark }, { id: 'wallets', label: 'Wallets', icon: Wallet }, { id: 'khqr', label: 'KHQR Payment', icon: QrCode }, { id: 'transactions', label: 'History Logs', icon: History }];

  const bottomItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'support', label: 'Support', icon: HelpCircle },
  ];

  return (
    <nav role="navigation" aria-label="Main navigation"
      className="hidden md:flex flex-col h-[calc(100vh-32px)] w-64 fixed left-4 top-4 rounded-[24px] z-40 transition-all duration-300 shadow-2xl backdrop-blur-xl border overflow-hidden"
      style={{ backgroundColor: s('sidebar-bg'), borderColor: s('sidebar-border') }}
    >
      <div className="px-6 py-6 flex items-center gap-3.5 border-b transition-colors duration-200"
        style={{ borderColor: s('sidebar-border') }}
      >
        <Logo size={38} variant="light" />
        <div>
          <h1 className="text-[17px] tracking-tight leading-tight flex items-center"
            style={{ color: s('sidebar-header-text') }}
          >
            <span className="font-extrabold">Nexus</span>
            <span className="font-light" style={{ color: s('sidebar-header-muted') }}>finance</span>
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5"
            style={{ color: s('sidebar-header-sub') }}
          >
            {currentPortal === 'loan-officer' ? 'Corporate Portal' : currentPortal === 'super-admin' ? 'Super Admin' : 'Client Hub'}
          </p>
        </div>
      </div>

      {currentPortal === 'customer' && (
        <div className="px-4 pt-4 pb-3">
          <button onClick={onApplyForLoan} id="sidebar-apply-loan-btn"
            className="w-full bg-gradient-to-r from-[#5CF2D0] to-[#41ddbc] hover:brightness-105 text-[#0F171C] font-bold text-[14px] py-3 rounded-xl transition-all duration-200 shadow-lg shadow-[#5CF2D0]/20 flex items-center justify-center gap-2 cursor-pointer">
            <PlusCircle className="w-4.5 h-4.5" /> Apply for Loan
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        <p className="text-[10px] font-bold uppercase tracking-widest px-3 pb-2 pt-1"
          style={{ color: s('sidebar-text-muted') }}
        >Menu</p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.id;
          return (
            <button key={item.id} onClick={() => setActiveMenu(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 cursor-pointer group relative hover:bg-[var(--sidebar-active-bg)] hover:text-[var(--sidebar-text-hover)]"
              style={{
                backgroundColor: isActive ? s('sidebar-active-bg') : 'transparent',
                color: isActive ? s('sidebar-text-active') : s('sidebar-text'),
              }}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full animate-slide-in-left-bar"
                  style={{ backgroundColor: s('sidebar-icon-active-bg') }}
                />
              )}
              <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:bg-[var(--sidebar-icon-bg)] group-hover:text-[var(--sidebar-icon-text)]"
                style={{
                  backgroundColor: isActive ? s('sidebar-icon-active-bg') : s('sidebar-icon-bg'),
                  color: isActive ? s('sidebar-icon-active-text') : s('sidebar-icon-text'),
                }}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 animate-scale-in" style={{ color: s('sidebar-text-muted') }} />}
            </button>
          );
        })}
      </div>

      <div className="px-3 py-3 border-t space-y-0.5 transition-colors duration-200"
        style={{ borderColor: s('sidebar-border') }}
      >
        <p className="text-[10px] font-bold uppercase tracking-widest px-3 pb-1"
          style={{ color: s('sidebar-text-muted') }}
        >Account</p>
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.id;
          return (
            <button key={item.id} onClick={() => setActiveMenu(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 cursor-pointer group relative hover:bg-[var(--sidebar-active-bg)] hover:text-[var(--sidebar-text-hover)]"
              style={{
                backgroundColor: isActive ? s('sidebar-active-bg') : 'transparent',
                color: isActive ? s('sidebar-text-active') : s('sidebar-text'),
              }}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full animate-slide-in-left-bar"
                  style={{ backgroundColor: s('sidebar-icon-active-bg') }}
                />
              )}
              <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:bg-[var(--sidebar-icon-bg)] group-hover:text-[var(--sidebar-icon-text)]"
                style={{
                  backgroundColor: isActive ? s('sidebar-icon-active-bg') : s('sidebar-icon-bg'),
                  color: isActive ? s('sidebar-icon-active-text') : s('sidebar-icon-text'),
                }}
              >
                <Icon className="w-4 h-4" />
              </div>
              {item.label}
            </button>
          );
        })}
        <button onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 cursor-pointer group hover:bg-red-500/10 hover:text-red-400"
          style={{ color: 'rgba(239, 68, 68, 0.6)' }}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:bg-red-500/10 group-hover:text-red-400"
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'rgba(239, 68, 68, 0.6)' }}
          >
            <LogOut className="w-4 h-4" />
          </div>
          Logout
        </button>
      </div>
    </nav>
  );
}
