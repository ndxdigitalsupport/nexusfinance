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
  language: 'en' | 'kh';
  setLanguage: (lang: 'en' | 'kh') => void;
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
  'menu': { en: 'Menu', kh: 'ម៉ឺនុយ' },
  'account': { en: 'Account', kh: 'គណនី' },
  'profile': { en: 'Profile', kh: 'ប្រវត្តិរូប' },
  'support': { en: 'Support', kh: 'ការគាំទ្រ' },
  'repayments_checklist': { en: 'Repayments Checklist', kh: 'បញ្ជីផ្ទៀងផ្ទាត់ការសងប្រាក់' },
  'loans': { en: 'Loans', kh: 'ឥណទាន' },
  'khqr_payment': { en: 'KHQR Payment', kh: 'ការទូទាត់តាម KHQR' },
  'reports': { en: 'Reports', kh: 'របាយការណ៍' },
  'reports_menu': { en: 'Reports Menu', kh: 'ម៉ឺនុយរបាយការណ៍' },
  'report_outstanding': { en: 'Outstanding Report', kh: 'របាយការណ៍សមតុល្យជំពាក់' },
  'report_payments': { en: 'Payments Report', kh: 'របាយការណ៍ការសងប្រាក់' },
  'report_late': { en: 'Loan Late Report', kh: 'របាយការណ៍ឥណទានយឺតយ៉ាវ' },
  'report_paid_off': { en: 'Paid Off Report', kh: 'របាយការណ៍ឥណទានរួចរាល់' },

  // Loan Officer Dashboard / Pending queue translation keys
  'corporate_workspace': { en: 'Corporate Workspace', kh: 'កន្លែងធ្វើការរួម' },
  'pending_applications': { en: 'Pending Applications', kh: 'ពាក្យស្នើសុំរង់ចាំការអនុម័ត' },
  'pending_applications_desc': { en: 'Manage and review your assigned loan requests.', kh: 'គ្រប់គ្រង និងពិនិត្យមើលសំណើកម្ចីដែលបានបែងចែកមកលោកអ្នក។' },
  'applications_by_status': { en: 'Applications by Status', kh: 'ពាក្យស្នើសុំតាមស្ថានភាព' },
  'total_recorded_label': { en: 'Total Recorded', kh: 'កត់ត្រាសរុប' },
  'applications_label': { en: 'Applications', kh: 'ពាក្យស្នើសុំ' },
  'pending_queue': { en: 'Pending Queue', kh: 'ជួររង់ចាំ' },
  'assigned_to_me': { en: 'Assigned to Me', kh: 'បែងចែកមកខ្ញុំ' },
  'urgent_action': { en: 'Urgent Action', kh: 'សកម្មភាពបន្ទាន់' },
  'all_applications': { en: 'All Applications', kh: 'ពាក្យស្នើសុំទាំងអស់' },
  'urgent': { en: 'Urgent', kh: 'បន្ទាន់' },
  'assigned_to_me_tab': { en: 'Assigned to me', kh: 'បែងចែកមកខ្ញុំ' },
  'applicant_reference': { en: 'Applicant / Reference', kh: 'អ្នកស្នើសុំ / លេខយោង' },
  'loan_value': { en: 'Loan Value', kh: 'ទំហំឥណទាន' },
  
  // Dashboard Titles & Descriptions
  'super_admin_hub': { en: 'Super Admin Hub', kh: 'មជ្ឈមណ្ឌលអភិបាលជាន់ខ្ពស់' },
  'super_admin_desc': { en: 'Global ledger controls, parameters and auto-underwriting engines config.', kh: 'ការគ្រប់គ្រងសៀវភៅបញ្ជីសកល ដែនកំណត់ និងការកំណត់ម៉ាស៊ីនអនុម័តស្វ័យប្រវត្ត។' },
  
  // Stats Cards
  'total_volume': { en: 'Total Cash Disbursed', kh: 'ទឹកប្រាក់បានបើកផ្តល់សរុប' },
  'active_customers': { en: 'Active Customers', kh: 'អតិថិជនសកម្ម' },
  'outstanding_portfolio': { en: 'Total Owed by Customers', kh: 'ទឹកប្រាក់អតិថិជនជំពាក់សរុប' },
  'gross_yields': { en: 'Projected Interest (1 Year)', kh: 'ការប្រាក់រំពឹងទុក (១ ឆ្នាំ)' },
  
  // Stats Descriptions
  'volume_desc': { en: 'Total value of all disbursed loans', kh: 'តម្លៃដើមសរុបនៃកម្ចីទាំងអស់ដែលបានបើកផ្តល់' },
  'outstanding_desc': { en: 'Total unpaid principal customer owes (Debt)', kh: 'ប្រាក់ដើមសរុបដែលអតិថិជនមិនទាន់សង (បំណុល)' },
  'yields_desc': { en: 'Projected annual interest return (What we earn)', kh: 'ផលចំណេញការប្រាក់ប្រចាំឆ្នាំប៉ាន់ស្មាន (ប្រាក់រកបាន)' },
  
  // Layout headers & widgets
  'portfolio_trend': { en: 'Platform Growth & Portfolio Trend', kh: 'កំណើនវេទិកា និងនិន្នាការផលប័ត្រឥណទាន' },
  'portfolio_trend_desc': { en: 'Overview of total cash disbursed and active outstanding balance (USD).', kh: 'ទិដ្ឋភាពទូទៅនៃទឹកប្រាក់បើកផ្តល់សរុប និងប្រាក់ដែលអតិថិជនជំពាក់សរុប (ដុល្លារ)។' },
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
  const [language, setLanguageState] = useState<'en' | 'kh'>(() => {
    const saved = localStorage.getItem('nexus_language');
    if (saved) return saved as 'en' | 'kh';
    const oldCurrency = localStorage.getItem('nexus_currency');
    return oldCurrency === 'KHR' ? 'kh' : 'en';
  });

  const setLanguage = useCallback((lang: 'en' | 'kh') => {
    localStorage.setItem('nexus_language', lang);
    localStorage.setItem('nexus_currency', lang === 'kh' ? 'KHR' : 'USD');
    setLanguageState(lang);
    window.dispatchEvent(new StorageEvent('storage', { key: 'nexus_currency', newValue: lang === 'kh' ? 'KHR' : 'USD' }));
  }, []);

  const isKhmer = language === 'kh';
  const currency: CurrencyCode = 'USD';

  const setCurrency = useCallback((c: CurrencyCode) => {
    setLanguage(c === 'KHR' ? 'kh' : 'en');
  }, [setLanguage]);

  const formatCurrency = useCallback((amount: number) => {
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, []);

  const formatCurrencyShort = useCallback((amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount.toFixed(0)}`;
  }, []);

  const t = useCallback((key: string) => {
    const entry = translations[key];
    if (!entry) return key;
    return isKhmer ? entry.kh : entry.en;
  }, [isKhmer]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency, formatCurrencyShort, exchangeRate: EXCHANGE_RATE_KHR, t, isKhmer, language, setLanguage }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
