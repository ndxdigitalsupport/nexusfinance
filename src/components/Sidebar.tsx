import React from 'react';
import { 
  PlusCircle, 
  LayoutDashboard, 
  Landmark, 
  Wallet, 
  History, 
  CheckSquare, 
  Settings, 
  Users, 
  HelpCircle, 
  LogOut,
  User
} from 'lucide-react';
import { PortalType } from '../types';
import Logo from './Logo';

interface SidebarProps {
  currentPortal: PortalType;
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  onApplyForLoan: () => void;
  onLogout: () => void;
}

export default function Sidebar({
  currentPortal,
  activeMenu,
  setActiveMenu,
  onApplyForLoan,
  onLogout
}: SidebarProps) {
  
  const menuItems = currentPortal === 'loan-officer'
    ? [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'tasks', label: 'Compliance Tasks', icon: CheckSquare },
      ]
    : currentPortal === 'super-admin'
    ? [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'settings', label: 'Settings', icon: Settings },
      ]
    : // customer
      [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'loans', label: 'Loans Ledger', icon: Landmark },
        { id: 'wallets', label: 'Wallets', icon: Wallet },
        { id: 'transactions', label: 'History Logs', icon: History },
      ];

  return (
    <nav className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-[#ebeef0] border-r border-[#c4c7ca] py-4 z-40">
      {/* Brand & Logo */}
      <div className="px-6 py-4 flex items-center gap-3.5 mb-6 select-none">
        <Logo size={42} variant="gradient" />
        <div>
          <h1 className="font-sans text-[18.5px] tracking-tight leading-tight flex items-center">
            <span className="text-[#0E171C] font-extrabold">Nexus</span>
            <span className="text-[#181c1e] font-light">finance</span>
          </h1>
          <p className="text-[10px] font-bold text-[#44474a] uppercase tracking-wider mt-0.5">
            {currentPortal === 'loan-officer' ? 'Corporate Portal' : currentPortal === 'super-admin' ? 'Super Admin' : 'Client Hub'}
          </p>
        </div>
      </div>

      {/* Primary Action Button */}
      {currentPortal === 'customer' && (
        <div className="px-4 mb-6">
          <button 
            onClick={onApplyForLoan}
            id="sidebar-apply-loan-btn"
            className="w-full bg-[#5CF2D0] hover:bg-[#41ddbc] text-[#0F171C] font-semibold text-[14px] py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md cursor-pointer"
          >
            <PlusCircle className="w-4.5 h-4.5" />
            Apply for Loan
          </button>
        </div>
      )}

      {/* Menu Links */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 mx-2 rounded-lg font-semibold text-[14px] transition-all duration-150 cursor-pointer ${
                isActive 
                  ? 'bg-[#0F171C] text-white shadow-sm' 
                  : 'text-[#44474a] hover:bg-[#e0e3e5] hover:text-[#181c1e]'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#5CF2D0]' : 'text-[#44474a]'}`} />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Footer Profile / Support / Logout */}
      <div className="mt-auto flex flex-col gap-1 pt-4 border-t border-[#c4c7ca] mx-4">
        <button
          onClick={() => setActiveMenu('profile')}
          className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-[14px] transition-all duration-150 cursor-pointer ${
            activeMenu === 'profile' 
              ? 'bg-[#0F171C] text-white shadow-sm' 
              : 'text-[#44474a] hover:bg-[#e0e3e5]'
          }`}
        >
          <User className="w-5 h-5 text-[#44474a]" />
          Profile
        </button>
        <button
          onClick={() => setActiveMenu('support')}
          className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-[14px] transition-all duration-150 cursor-pointer ${
            activeMenu === 'support' 
              ? 'bg-[#0F171C] text-white shadow-sm' 
              : 'text-[#44474a] hover:bg-[#e0e3e5]'
          }`}
        >
          <HelpCircle className="w-5 h-5 text-[#44474a]" />
          Support
        </button>
        <button
          onClick={onLogout}
          className="w-full text-left flex items-center gap-3 px-4 py-3 text-[#44474a] hover:bg-red-50 hover:text-red-600 rounded-lg font-semibold text-[14px] transition-all duration-150 cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </nav>
  );
}
