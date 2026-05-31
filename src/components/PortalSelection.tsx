import React, { useState } from 'react';
import { Landmark, User, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { PortalType } from '../types';
import Logo from './Logo';

interface PortalSelectionProps {
  onSelectPortal: (portal: PortalType) => void;
  userRole: string;
}

export default function PortalSelection({ onSelectPortal, userRole }: PortalSelectionProps) {
  const allOptions = [
    {
      id: 'customer' as PortalType,
      title: 'CUSTOMER',
      description: 'Access your loans, wallet & history',
      icon: User,
      color: 'text-[#5CF2D0] bg-[#5CF2D0]/10',
    },
    {
      id: 'loan-officer' as PortalType,
      title: 'LOAN OFFICER',
      description: 'Review applications & manage clients',
      icon: ShieldCheck,
      color: 'text-blue-500 bg-blue-500/10',
    },
    {
      id: 'super-admin' as PortalType,
      title: 'SUPER ADMIN',
      description: 'Global configurations & reports',
      icon: Landmark,
      color: 'text-purple-500 bg-purple-500/10',
    },
  ];

  const options = allOptions.filter(o => {
    if (userRole === 'super-admin') return true;
    if (userRole === 'loan-officer') return o.id === 'loan-officer';
    return o.id === 'customer';
  });

  const [selected, setSelected] = useState<PortalType>(options[0]?.id || 'customer');

  const handleContinue = () => {
    onSelectPortal(selected);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative z-10 font-sans">
      <div className="w-full max-w-lg mx-auto bg-white rounded-2xl shadow-xl shadow-[#0F171C]/5 border border-[#c4c7ca]/50 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Logo & Header */}
        <div className="text-center mb-5">
          <div className="mb-3 select-none transition-transform hover:scale-105 duration-200">
            <Logo size={90} showText={true} showTagline={true} variant="gradient" />
          </div>
          <h2 className="text-[20px] font-sans font-bold text-[#181c1e] mb-1">Welcome to Nexusfinance</h2>
          <p className="text-[13px] text-[#44474a]">Select your portal to continue</p>
        </div>

        {/* Portal Cards Group */}
        <div className="space-y-3 mb-6">
          {options.map((option) => {
            const Icon = option.icon;
            const isSelected = selected === option.id;
            return (
              <div
                key={option.id}
                onClick={() => setSelected(option.id)}
                className={`group flex items-center gap-3 p-3 border-2 rounded-xl transition-all duration-200 cursor-pointer select-none ${
                  isSelected
                    ? 'border-[#5CF2D0] bg-[#f1f4f6]/80 shadow-md shadow-[#5CF2D0]/10'
                    : 'border-[#c4c7ca] bg-white hover:border-[#74777b] hover:shadow-sm'
                }`}
              >
                {/* Visual Icon Box */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                  isSelected ? 'bg-[#5CF2D0]/20 text-[#0F171C]' : 'bg-[#f1f4f6] text-[#44474a]'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                
                {/* Metadatas */}
                <div className="flex-grow">
                  <h3 className="text-[13px] leading-tight font-bold text-[#181c1e] tracking-wide uppercase">{option.title}</h3>
                  <p className="text-[11px] text-[#44474a] mt-0.5 font-medium">{option.description}</p>
                </div>

                {/* Status indicator */}
                <div className="flex items-center justify-center">
                  {isSelected ? (
                    <CheckCircle2 className="w-5 h-5 text-[#0F171C] fill-[#5CF2D0]" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-[#c4c7ca] group-hover:border-[#74777b] transition-colors" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <button
          onClick={handleContinue}
          className="w-full text-[14px] font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer select-none text-[#0F171C] bg-gradient-to-r from-[#5CF2D0] to-[#41ddbc] hover:brightness-105 shadow-md shadow-[#5CF2D0]/20 hover:shadow-lg hover:shadow-[#5CF2D0]/30 active:scale-98"
        >
          Continue
          <ArrowRight className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Legal Disclaimer */}
        <p className="text-center text-[11px] text-[#44474a] font-medium leading-relaxed mt-4">
          By continuing, you agree to our{' '}
          <a href="#" className="font-semibold text-[#0F171C] hover:underline" onClick={(e) => e.preventDefault()}>
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="font-semibold text-[#0F171C] hover:underline" onClick={(e) => e.preventDefault()}>
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
