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
      colorVar: 'var(--accent)',
    },
    {
      id: 'loan-officer' as PortalType,
      title: 'LOAN OFFICER',
      description: 'Review applications & manage clients',
      icon: ShieldCheck,
      colorVar: 'var(--info)',
    },
    {
      id: 'super-admin' as PortalType,
      title: 'SUPER ADMIN',
      description: 'Global configurations & reports',
      icon: Landmark,
      colorVar: 'var(--warning)',
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
      <div className="w-full max-w-lg mx-auto rounded-2xl shadow-xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200"
        style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-primary)' }}
      >
        
        {/* Logo & Header */}
        <div className="text-center mb-5 stagger-1">
          <div className="mb-3 select-none transition-transform hover:scale-105 duration-200">
            <Logo size={90} showText={true} showTagline={true} variant="gradient" />
          </div>
          <h2 className="text-[20px] font-sans font-bold text-[var(--text-primary)] mb-1">Welcome to Nexusfinance</h2>
          <p className="text-[13px] text-[var(--text-secondary)]">Select your portal to continue</p>
        </div>

        {/* Portal Cards Group */}
        <div className="space-y-3 mb-6">
          {options.map((option, idx) => {
            const Icon = option.icon;
            const isSelected = selected === option.id;
            return (
              <div
                key={option.id}
                onClick={() => setSelected(option.id)}
                className={`stagger-${idx + 2} group flex items-center gap-3 p-3 border-2 rounded-xl transition-all duration-200 cursor-pointer select-none ${
                  isSelected
                    ? 'border-[var(--accent)] shadow-md'
                    : 'hover:border-[var(--text-tertiary)] hover:shadow-sm'
                }`}
                style={{
                  borderColor: isSelected ? option.colorVar : undefined,
                  backgroundColor: isSelected ? 'var(--surface-secondary)' : 'var(--surface-card)',
                }}
              >
                {/* Visual Icon Box */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all`}>
                  <Icon className="w-5 h-5" style={{ color: isSelected ? option.colorVar : 'var(--text-secondary)' }} />
                </div>
                
                {/* Metadatas */}
                <div className="flex-grow">
                  <h3 className="text-[13px] leading-tight font-bold text-[var(--text-primary)] tracking-wide uppercase">{option.title}</h3>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 font-medium">{option.description}</p>
                </div>

                {/* Status indicator */}
                <div className="flex items-center justify-center">
                  {isSelected ? (
                    <CheckCircle2 className="w-5 h-5" style={{ color: option.colorVar }} />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 group-hover:border-[var(--text-tertiary)] transition-colors"
                      style={{ borderColor: 'var(--border-primary)' }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <button
          onClick={handleContinue}
          className="stagger-5 w-full premium-btn-primary text-[14px] font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer select-none active:scale-95"
        >
          Continue
          <ArrowRight className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Legal Disclaimer */}
        <p className="stagger-6 text-center text-[11px] text-[var(--text-secondary)] font-medium leading-relaxed mt-4">
          By continuing, you agree to our{' '}
          <a href="#" className="font-semibold hover:underline" style={{ color: 'var(--accent)' }} onClick={(e) => e.preventDefault()}>
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="font-semibold hover:underline" style={{ color: 'var(--accent)' }} onClick={(e) => e.preventDefault()}>
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
