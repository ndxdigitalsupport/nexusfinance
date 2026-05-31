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
    <nav role="navigation" aria-label="Main navigation" className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-[#0F171C] py-0 z-40">
      <div className="px-6 py-6 flex items-center gap-3.5 border-b border-white/5">
        <Logo size={38} variant="light" />
        <div>
          <h1 className="text-[17px] tracking-tight leading-tight flex items-center">
            <span className="text-white font-extrabold">Nexus</span>
            <span className="text-white/60 font-light">finance</span>
          </h1>
          <p className="text-[10px] font-bold text-[#5CF2D0] uppercase tracking-wider mt-0.5">
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
        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-3 pb-2 pt-1">Menu</p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.id;
          return (
            <button key={item.id} onClick={() => setActiveMenu(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 cursor-pointer group ${
                isActive ? 'bg-white/10 text-white shadow-sm' : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                isActive ? 'bg-[#5CF2D0] text-[#0F171C]' : 'bg-white/5 text-white/40 group-hover:bg-white/10 group-hover:text-white/70'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/40" />}
            </button>
          );
        })}
      </div>

      <div className="px-3 py-3 border-t border-white/5 space-y-0.5">
        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-3 pb-1">Account</p>
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.id;
          return (
            <button key={item.id} onClick={() => setActiveMenu(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 cursor-pointer group ${
                isActive ? 'bg-white/10 text-white shadow-sm' : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 text-white/40 group-hover:bg-white/10 group-hover:text-white/70 transition-all duration-200">
                <Icon className="w-4 h-4" />
              </div>
              {item.label}
            </button>
          );
        })}
        <button onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 cursor-pointer text-red-400/60 hover:text-red-400 hover:bg-red-500/10 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 text-red-400/60 group-hover:bg-red-500/20 group-hover:text-red-400 transition-all duration-200">
            <LogOut className="w-4 h-4" />
          </div>
          Logout
        </button>
      </div>
    </nav>
  );
}
