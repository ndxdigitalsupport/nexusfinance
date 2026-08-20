import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CurrencyCode, EXCHANGE_RATE_KHR } from '../types';

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  formatCurrency: (amount: number) => string;
  formatCurrencyShort: (amount: number) => string;
  exchangeRate: number;
  t: (key: string) => string;
  isKhmer: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const translations: Record<string, { en: string; kh: string }> = {
  // Sidebar & Navigation
  'dashboard': { en: 'Dashboard', kh: 'ផ្ទាំងគ្រប់គ្រង' },
  'users': { en: 'Users', kh: 'អ្នកប្រើប្រាស់' },
  'reminders': { en: 'Reminders', kh: 'ការរំលឹកបំណុល' },
  'broadcast': { en: 'Broadcast', kh: 'ការផ្សព្វផ្សាយ' },
  'audit': { en: 'Audit Log', kh: 'កំណត់ត្រាសវនកម្ម' },
  'settings': { en: 'Settings', kh: 'ការកំណត់' },
  'logout': { en: 'Logout', kh: 'ចាកចេញ' },
  
  // Dashboard Titles & Descriptions
  'super_admin_hub': { en: 'Super Admin Hub', kh: 'មជ្ឈមណ្ឌលអភិបាលជាន់ខ្ពស់' },
  'super_admin_desc': { en: 'Global ledger controls, parameters and auto-underwriting engines config.', kh: 'ការគ្រប់គ្រងសៀវភៅបញ្ជីសកល ដែនកំណត់ និងការកំណត់ម៉ាស៊ីនអនុម័តស្វ័យប្រវត្ត។' },
  
  // Stats Cards
  'total_volume': { en: 'Total Volume under Management', kh: 'ទំហំដើមទុនសរុបដែលគ្រប់គ្រង' },
  'active_customers': { en: 'Active Enrolled Customers', kh: 'អតិថិជនសកម្មដែលបានចុះឈ្មោះ' },
  'outstanding_portfolio': { en: 'Outstanding Portfolio', kh: 'ផលប័ត្រឥណទានមិនទាន់ទូទាត់' },
  'gross_yields': { en: 'Gross Yields (APR)', kh: 'ផលចំណេញការប្រាក់សរុប (APR)' },
  
  // Stats Descriptions
  'volume_desc': { en: 'Total value of all disbursed loans', kh: 'តម្លៃដើមសរុបនៃកម្ចីទាំងអស់ដែលបានបើកផ្តល់' },
  'outstanding_desc': { en: 'Total unpaid principal customer owes (Debt)', kh: 'ប្រាក់ដើមសរុបដែលអតិថិជនមិនទាន់សង (បំណុល)' },
  'yields_desc': { en: 'Projected annual interest return (What we earn)', kh: 'ផលចំណេញការប្រាក់ប្រចាំឆ្នាំប៉ាន់ស្មាន (ប្រាក់រកបាន)' },
  
  // Layout headers & widgets
  'portfolio_trend': { en: 'Platform Growth & Portfolio Trend', kh: 'កំណើនវេទិកា និងនិន្នាការផលប័ត្រឥណទាន' },
  'portfolio_trend_desc': { en: 'Overview of total volume under management and outstanding portfolio balance (USD).', kh: 'ទិដ្ឋភាពទូទៅនៃដើមទុនសរុបដែលគ្រប់គ្រង និងតុល្យភាពផលប័ត្រ بقایا (ដុល្លារ)។' },
  'system_health': { en: 'System Core Health', kh: 'សុខភាពស្នូលប្រព័ន្ធ' },
  'sweep_schedule': { en: 'Automatic Sweep Schedule', kh: 'កាលវិភាគត្រួតពិនិត្យស្វ័យប្រវត្តិ' },
  'bot_status': { en: 'Telegram Bot Status', kh: 'ស្ថានភាពតេឡេក្រាមបូត' },
  'kyc_enforcement': { en: 'Video KYC Enforcement', kh: 'ការអនុវត្តវីដេអូ KYC' },
  'auto_approve': { en: 'Auto-Approve Limit', kh: 'ដែនកំណត់អនុម័តស្វ័យប្រវត្តិ' },
  'shortcuts': { en: 'Shortcuts & Diagnostics', kh: 'ផ្លូវកាត់ និងការវិភាគប្រព័ន្ធ' },
  
  // Review & Audit lists
  'loan_review': { en: 'Loan Origination Review', kh: 'ការពិនិត្យពាក្យសុំឥណទានថ្មី' },
  'loan_review_desc': { en: 'New and review applications awaiting admin or officer verdict.', kh: 'ពាក្យស្នើសុំថ្មី និងកំពុងពិនិត្យដែលរង់ចាំការសម្រេចចិត្តពីអភិបាលឬមន្ត្រីឥណទាន។' },
  'audit_trail': { en: 'Core Security Audit Trail', kh: 'កំណត់ត្រាសវនកម្មសុវត្ថិភាពស្នូល' },
  'audit_trail_desc': { en: 'Recent operational changes and administrative actions ledger.', kh: 'កំណត់ត្រាសកម្មភាពអភិបាលកិច្ច និងការផ្លាស់ប្តូរប្រតិបត្តិការថ្មីៗ។' },
  
  // Alert/Badge Statuses
  'active': { en: 'Active', kh: 'សកម្ម' },
  'live_linked': { en: 'Live & Linked', kh: 'ដំណើរការ និងតភ្ជាប់' },
  'mandatory': { en: 'Mandatory', kh: 'កាតព្វកិច្ច' },
  'optional': { en: 'Optional', kh: 'មិនបង្ខំ' },
  'no_logs': { en: 'No logs recorded yet.', kh: 'មិនទាន់មានកំណត់ត្រាប្រតិបត្តិការនៅឡើយទេ។' },
  'no_applications': { en: 'No pending applications found.', kh: 'រកមិនឃើញពាក្យស្នើសុំដែលរង់ចាំការអនុម័តទេ។' },
};

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem('nexus_currency');
    return (saved as CurrencyCode) || 'USD';
  });

  const setCurrency = useCallback((c: CurrencyCode) => {
    localStorage.setItem('nexus_currency', c);
    setCurrencyState(c);
    window.dispatchEvent(new StorageEvent('storage', { key: 'nexus_currency', newValue: c }));
  }, []);

  const formatCurrency = useCallback((amount: number) => {
    if (currency === 'KHR') {
      const khr = Math.round(amount * EXCHANGE_RATE_KHR);
      return `៛${khr.toLocaleString()}`;
    }
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [currency]);

  const formatCurrencyShort = useCallback((amount: number) => {
    if (currency === 'KHR') {
      const khr = Math.round(amount * EXCHANGE_RATE_KHR);
      if (khr >= 1000000) return `៛${(khr / 1000000).toFixed(1)}M`;
      if (khr >= 1000) return `៛${(khr / 1000).toFixed(0)}K`;
      return `៛${khr}`;
    }
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount.toFixed(0)}`;
  }, [currency]);

  const isKhmer = currency === 'KHR';

  const t = useCallback((key: string) => {
    const entry = translations[key];
    if (!entry) return key;
    return isKhmer ? entry.kh : entry.en;
  }, [currency, isKhmer]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency, formatCurrencyShort, exchangeRate: EXCHANGE_RATE_KHR, t, isKhmer }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
