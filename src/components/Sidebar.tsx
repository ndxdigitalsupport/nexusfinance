import React from 'react';
import { PlusCircle, LayoutDashboard, Landmark, Wallet, History, CheckSquare, Settings, Users, HelpCircle, LogOut, User, ChevronRight, ClipboardList } from 'lucide-react';
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
    : [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }, { id: 'loans', label: 'Loans Ledger', icon: Landmark }, { id: 'wallets', label: 'Wallets', icon: Wallet }, { id: 'transactions', label: 'History Logs', icon: History }];

  const bottomItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'support', label: 'Support', icon: HelpCircle },
  ];

  return (
    <nav role="navigation" aria-label="Main navigation"
      className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 py-0 z-40 transition-colors duration-200"
      style={{ backgroundColor: s('sidebar-bg') }}
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
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 cursor-pointer group"
              style={{
                backgroundColor: isActive ? s('sidebar-active-bg') : 'transparent',
                color: isActive ? s('sidebar-text-active') : s('sidebar-text'),
              }}
              onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = 'var(--sidebar-active-bg)'; e.currentTarget.style.color = 'var(--sidebar-text-hover)'; }}}
              onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--sidebar-text)'; }}}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                style={{
                  backgroundColor: isActive ? s('sidebar-icon-active-bg') : s('sidebar-icon-bg'),
                  color: isActive ? s('sidebar-icon-active-text') : s('sidebar-icon-text'),
                }}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5" style={{ color: s('sidebar-text-muted') }} />}
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
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 cursor-pointer group"
              style={{
                backgroundColor: isActive ? s('sidebar-active-bg') : 'transparent',
                color: isActive ? s('sidebar-text-active') : s('sidebar-text'),
              }}
              onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = 'var(--sidebar-active-bg)'; e.currentTarget.style.color = 'var(--sidebar-text-hover)'; }}}
              onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--sidebar-text)'; }}}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
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
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 cursor-pointer group"
          style={{ color: 'rgba(239, 68, 68, 0.6)' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#ef4444'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgba(239, 68, 68, 0.6)'; }}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
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
