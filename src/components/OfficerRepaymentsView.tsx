import React, { useState, useEffect } from 'react';
import { 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Send, 
  Clock, 
  Calendar,
  DollarSign, 
  ChevronLeft, 
  ChevronRight, 
  ShieldAlert, 
  Download, 
  Printer, 
  FileText, 
  Phone,
  Sparkles,
  Zap,
  CheckCircle,
  Flame,
  AlertCircle
} from 'lucide-react';
import { LoanApplication } from '../types';
import { apiFetch } from '../api';
import { showToast } from './Toast';
import KhmerContractPrint from './KhmerContractPrint';
import { useCurrency } from '../context/CurrencyContext';

interface OfficerRepaymentsViewProps {
  loans: LoanApplication[];
  onRefresh: () => void;
  onViewSchedule: (loan: LoanApplication) => void;
}

interface DelinquentDetails {
  loanId: string;
  applicantName: string;
  applicantEmail: string;
  phone: string | null;
  telegramLinked: boolean;
  telegramChatId: string | null;
  loanAmount: number;
  loanType: string;
  monthlyPayment: number;
  overdueInstallmentsCount: number;
  daysOverdue: number;
  oldestDueDate: string;
  penaltyFee: number;
  totalDue: number;
  riskLevel: 'mild' | 'medium' | 'severe';
  gracePeriodDays: number;
  latePenaltyDaily: number;
}

export default function OfficerRepaymentsView({ loans, onRefresh, onViewSchedule }: OfficerRepaymentsViewProps) {
  const { formatCurrency, isKhmer, t } = useCurrency();
  const [activeTab, setActiveTab] = useState<'all' | 'overdue' | 'ontime'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [nudgingLoanId, setNudgingLoanId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live Overdue API Data
  const [delinquentMap, setDelinquentMap] = useState<Record<string, DelinquentDetails>>({});
  const [summary, setSummary] = useState<any>(null);
  const [loadingDelinquent, setLoadingDelinquent] = useState(false);
  const [riskFilter, setRiskFilter] = useState<'all' | 'mild' | 'medium' | 'severe'>('all');

  const itemsPerPage = 8;

  // Silent automatic data fetcher & background poller
  const fetchDelinquentData = async (silent = false) => {
    if (!silent) setLoadingDelinquent(true);
    try {
      const data = await apiFetch('/loans/overdue');
      if (data && data.delinquentLoans) {
        const map: Record<string, DelinquentDetails> = {};
        data.delinquentLoans.forEach((dl: DelinquentDetails) => {
          const rawId = String(dl.loanId);
          const cleanId = rawId.replace(/^#/, '');
          map[rawId] = dl;
          map[cleanId] = dl;
          map[`#${cleanId}`] = dl;
        });
        setDelinquentMap(map);
        setSummary(data.summary || null);
      }
    } catch {
      // silently fallback
    } finally {
      if (!silent) setLoadingDelinquent(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchDelinquentData();

    // Automatic silent sync every 30 seconds
    const interval = setInterval(() => {
      onRefresh();
      fetchDelinquentData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Filter only approved/active loans
  const activeLoans = loans.filter(l => 
    ['approved', 'Approved', 'active', 'Active', 'disbursed', 'Disbursed'].includes(l.status)
  );

  // Search & tab filter logic
  const filteredLoans = activeLoans.filter(l => {
    const matchesSearch = 
      l.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.type || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    const isOverdue = l.repaymentStatus === 'Overdue';
    if (activeTab === 'overdue') {
      if (!isOverdue) return false;
      if (riskFilter !== 'all') {
        const d = delinquentMap[l.id];
        if (!d || d.riskLevel !== riskFilter) return false;
      }
      return true;
    }
    if (activeTab === 'ontime') return !isOverdue;
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLoans.length / itemsPerPage) || 1;
  const paginatedLoans = filteredLoans.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const startIdx = (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, filteredLoans.length);

  // 1-Click Send Nudge Action
  const handleSendNudge = async (loan: LoanApplication) => {
    const loanId = loan.id;
    setNudgingLoanId(loanId);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await apiFetch(`/loans/${encodeURIComponent(loanId)}/nudge`, {
        method: 'POST',
        body: JSON.stringify({ channel: 'both' })
      });

      if (res.error) {
        setErrorMessage(res.error || 'Failed to dispatch collection alert.');
      } else {
        const channelsSent = [];
        if (res.sentTelegram) channelsSent.push('Telegram');
        if (res.sentInApp) channelsSent.push('In-App Notification');
        const channelText = channelsSent.length > 0 ? ` (${channelsSent.join(' & ')})` : '';

        const msg = `⚡ Collection reminder successfully sent to ${loan.applicantName} for Loan ${loanId}${channelText}!`;
        setSuccessMessage(msg);
        showToast(msg, 'success');
        onRefresh();
        fetchDelinquentData(true);
        setTimeout(() => setSuccessMessage(null), 6000);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to connect to collection service.';
      setErrorMessage(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setNudgingLoanId(null);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString(undefined, { 
      month: 'short', 
      day: '2-digit', 
      year: 'numeric' 
    });
  };

  const exportToExcel = () => {
    const headers = isKhmer ? [
      'លេខកូដយោងឥណទាន',
      'ឈ្មោះអ្នកខ្ចី',
      'អ៊ីមែល',
      'ទឹកប្រាក់ឥណទាន',
      'ប្រភេទ',
      'ការបង់ប្រចាំខែ',
      'កាលបរិច្ឆេទបង់បន្ទាប់',
      'ស្ថានភាពសងប្រាក់'
    ] : [
      'Loan Reference ID',
      'Borrower Name',
      'Email',
      'Loan Amount',
      'Type',
      'Monthly Payment',
      'Next Payment Date',
      'Repayment Status'
    ];

    const rows = filteredLoans.map(l => [
      l.id,
      l.applicantName,
      l.applicantEmail,
      l.amount,
      l.type,
      (l.monthlyPayment || 0).toFixed(2),
      l.nextPaymentDate ? new Date(l.nextPaymentDate).toISOString().slice(0,10) : '',
      l.repaymentStatus || 'On Time'
    ]);

    const excelHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
      </head>
      <body>
        <table>
          <thead>
            <tr>${headers.map(h => `<th style="background-color: #0d9488; color: #fff; font-weight: bold; border: 1px solid #ccc;">${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${rows.map(r => `<tr>${r.map(c => `<td style="border: 1px solid #ccc;">${c}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    
    const blob = new Blob([excelHtml], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `NexusFinance_LoansReport_${new Date().toISOString().slice(0,10)}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const tableRows = filteredLoans.map(l => `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">${l.id}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${l.applicantName}</td>
        <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold; text-align: right;">$${(l.amount || 0).toLocaleString()}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${l.type}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">$${(l.monthlyPayment || 0).toLocaleString()}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${l.nextPaymentDate ? new Date(l.nextPaymentDate).toLocaleDateString() : 'N/A'}</td>
        <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold; color: ${l.repaymentStatus === 'Overdue' ? '#ef4444' : '#10b981'};">${l.repaymentStatus || 'On Time'}</td>
      </tr>
    `).join('');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>NexusFinance - Active Loans Report</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; color: #333; }
            h1 { color: #0d9488; margin-bottom: 5px; font-weight: 800; font-size: 24px; }
            p { font-size: 13px; color: #666; margin-top: 0; font-weight: 500; }
            table { width: 100%; border-collapse: collapse; margin-top: 25px; }
            th { background-color: #f4f6f8; border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
            td { font-size: 13px; border: 1px solid #eee; padding: 10px; }
            tr:nth-child(even) { background-color: #fafafa; }
            .footer { margin-top: 40px; font-size: 10px; color: #aaa; text-align: center; border-top: 1px solid #eee; padding-top: 15px; }
          </style>
        </head>
        <body>
          <h1>NexusFinance Active Loans Report</h1>
          <p>Generated on ${new Date().toLocaleDateString()} | Active Repayment Checklist</p>
          <table>
            <thead>
              <tr>
                <th>Reference ID</th>
                <th>Borrower</th>
                <th style="text-align: right;">Loan Amount</th>
                <th>Type</th>
                <th style="text-align: right;">Installment/Mo</th>
                <th>Next Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <div class="footer">
            NexusFinance System Report. Private & Confidential.
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const overdueLoansList = activeLoans.filter(l => l.repaymentStatus === 'Overdue');
  const overdueCount = overdueLoansList.length;
  const onTimeCount = activeLoans.filter(l => l.repaymentStatus === 'On Time').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      
      {/* Premium Hero Banner / Header (Clean, Auto-Synced) */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[var(--surface-card)] via-[var(--surface-secondary)] to-[var(--surface-card)] border border-[var(--border-primary)] p-6 sm:p-7 shadow-xs">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[var(--accent)]/10 to-transparent rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[var(--accent)]/15 text-[#0F171C] dark:text-[var(--accent)] border border-[var(--accent)]/30">
                <ShieldAlert className="w-3.5 h-3.5 text-[var(--accent)]" />
                Repayment & Collections Hub
              </span>
              {overdueCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-pulse">
                  {overdueCount} Overdue Follow-ups
                </span>
              )}
            </div>

            <h2 className="text-[26px] sm:text-[30px] font-black text-[var(--text-primary)] font-heading tracking-tight leading-tight">
              Repayments & Debt Recovery
            </h2>
            <p className="text-[13.5px] text-[var(--text-secondary)] font-normal leading-relaxed">
              Real-time installment monitoring, automated penalty ledger, and instant borrower collection nudges.
            </p>
          </div>

          {/* Clean Auto-Sync Live Indicator */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--surface-card)]/80 border border-[var(--border-primary)] backdrop-blur-md shadow-2xs select-none self-start sm:self-center">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[12px] font-bold text-[var(--text-secondary)] tracking-wide">
              Live Auto-Sync
            </span>
          </div>
        </div>
      </div>

      {/* Notifications Toast / Alert */}
      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl p-4 flex items-start gap-3 shadow-xs select-none backdrop-blur-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <span className="text-[13px] font-bold leading-normal">{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl p-4 flex items-start gap-3 shadow-xs select-none backdrop-blur-sm animate-in fade-in">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <span className="text-[13px] font-bold leading-normal">{errorMessage}</span>
        </div>
      )}

      {/* High-End Modernized Traffic-Light Aging Cards */}
      {activeTab === 'overdue' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          
          {/* Card 1: Mild */}
          <div 
            onClick={() => { setRiskFilter(riskFilter === 'mild' ? 'all' : 'mild'); setCurrentPage(1); }}
            className={`group relative overflow-hidden rounded-2xl p-5 cursor-pointer transition-all duration-200 border bg-[var(--surface-card)] ${
              riskFilter === 'mild' 
                ? 'border-amber-400 shadow-[0_8px_30px_rgb(251,191,36,0.15)] ring-2 ring-amber-400/25 scale-[1.015]' 
                : 'border-[var(--border-primary)] hover:border-amber-400/50 hover:shadow-md'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Clock className="w-3.5 h-3.5" />
                  {t('mild_risk')}
                </span>
                <div className="text-[32px] font-black font-mono text-[var(--text-primary)] mt-3 tracking-tight">
                  {summary?.mildCount || 0}
                  <span className="text-[14px] font-sans font-semibold text-[var(--text-tertiary)] ml-1.5">Loans</span>
                </div>
                <p className="text-[12px] text-[var(--text-secondary)] font-medium mt-1">
                  Automated reminders running
                </p>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-500/5 border border-amber-400/30 flex items-center justify-center text-amber-500 shadow-xs group-hover:scale-110 transition-transform">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>
            
            {/* Status bar underline */}
            <div className="w-full h-1 bg-amber-500/20 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full w-2/3" />
            </div>
          </div>

          {/* Card 2: Medium */}
          <div 
            onClick={() => { setRiskFilter(riskFilter === 'medium' ? 'all' : 'medium'); setCurrentPage(1); }}
            className={`group relative overflow-hidden rounded-2xl p-5 cursor-pointer transition-all duration-200 border bg-[var(--surface-card)] ${
              riskFilter === 'medium' 
                ? 'border-orange-400 shadow-[0_8px_30px_rgb(251,146,60,0.15)] ring-2 ring-orange-400/25 scale-[1.015]' 
                : 'border-[var(--border-primary)] hover:border-orange-400/50 hover:shadow-md'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                  <Flame className="w-3.5 h-3.5" />
                  {t('medium_risk')}
                </span>
                <div className="text-[32px] font-black font-mono text-[var(--text-primary)] mt-3 tracking-tight">
                  {summary?.mediumCount || 0}
                  <span className="text-[14px] font-sans font-semibold text-[var(--text-tertiary)] ml-1.5">Loans</span>
                </div>
                <p className="text-[12px] text-[var(--text-secondary)] font-medium mt-1">
                  Loan officer call required
                </p>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400/20 to-orange-500/5 border border-orange-400/30 flex items-center justify-center text-orange-500 shadow-xs group-hover:scale-110 transition-transform">
                <Phone className="w-5 h-5" />
              </div>
            </div>

            {/* Status bar underline */}
            <div className="w-full h-1 bg-orange-500/20 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-orange-400 rounded-full w-full" />
            </div>
          </div>

          {/* Card 3: Severe */}
          <div 
            onClick={() => { setRiskFilter(riskFilter === 'severe' ? 'all' : 'severe'); setCurrentPage(1); }}
            className={`group relative overflow-hidden rounded-2xl p-5 cursor-pointer transition-all duration-200 border bg-[var(--surface-card)] ${
              riskFilter === 'severe' 
                ? 'border-rose-500 shadow-[0_8px_30px_rgb(244,63,94,0.18)] ring-2 ring-rose-500/25 scale-[1.015]' 
                : 'border-[var(--border-primary)] hover:border-rose-500/50 hover:shadow-md'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  {t('severe_risk')}
                </span>
                <div className="text-[32px] font-black font-mono text-[var(--text-primary)] mt-3 tracking-tight">
                  {summary?.severeCount || 0}
                  <span className="text-[14px] font-sans font-semibold text-[var(--text-tertiary)] ml-1.5">Loans</span>
                </div>
                <p className="text-[12px] text-[var(--text-secondary)] font-medium mt-1">
                  Default notice & legal alert
                </p>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400/20 to-rose-500/5 border border-rose-400/30 flex items-center justify-center text-rose-500 shadow-xs group-hover:scale-110 transition-transform">
                <ShieldAlert className="w-6 h-6" />
              </div>
            </div>

            {/* Status bar underline */}
            <div className="w-full h-1 bg-rose-500/20 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full w-full" />
            </div>
          </div>

        </div>
      )}

      {/* Control Bar: Modern Pill Tabs, Search, & Export */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-[var(--surface-card)] border border-[var(--border-primary)] p-2.5 sm:p-3 rounded-2xl shadow-xs">
        
        {/* Rounded Pill Segmented Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[var(--surface-secondary)] rounded-xl select-none overflow-x-auto">
          <button
            onClick={() => { setActiveTab('all'); setRiskFilter('all'); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'all'
                ? 'bg-[var(--surface-card)] text-[var(--text-primary)] shadow-xs border border-[var(--border-primary)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span>All Active</span>
            <span className="px-1.5 py-0.2 rounded-md bg-[var(--border-primary)] text-[11px] font-mono text-[var(--text-secondary)]">
              {activeLoans.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('ontime'); setRiskFilter('all'); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'ontime'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-emerald-600 hover:bg-emerald-500/10'
            }`}
          >
            <span>On Track</span>
            <span className={`px-1.5 py-0.2 rounded-md text-[11px] font-mono ${
              activeTab === 'ontime' ? 'bg-emerald-700/50 text-white' : 'bg-emerald-500/10 text-emerald-600'
            }`}>
              {onTimeCount}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('overdue'); setRiskFilter('all'); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'overdue'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-rose-500 hover:bg-rose-500/10'
            }`}
          >
            <span>Overdue & Collections</span>
            {overdueCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-md text-[11px] font-mono font-black ${
                activeTab === 'overdue' ? 'bg-rose-700/50 text-white' : 'bg-rose-500 text-white'
              }`}>
                {overdueCount}
              </span>
            )}
          </button>
        </div>

        {/* Active Filter Indicator Badge */}
        {activeTab === 'overdue' && riskFilter !== 'all' && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[12px] font-bold text-amber-600 dark:text-amber-400">
            <span>Filtered by: <span className="uppercase">{riskFilter}</span> risk</span>
            <button
              onClick={() => { setRiskFilter('all'); setCurrentPage(1); }}
              className="text-xs text-rose-500 hover:underline cursor-pointer ml-1 font-extrabold"
            >
              ✕ Clear Filter
            </button>
          </div>
        )}

        {/* Search & Export Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Search borrower, ID..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full bg-[var(--surface-secondary)] border border-[var(--border-primary)] rounded-xl py-2 pl-9 pr-3 text-[13px] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10 transition placeholder:text-[var(--text-tertiary)]"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportToExcel}
              className="px-3 py-2 bg-[var(--surface-secondary)] border border-[var(--border-primary)] hover:border-emerald-500/40 text-[var(--text-secondary)] hover:text-emerald-600 rounded-xl font-bold text-[12.5px] transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              title="Download Excel Spreadsheet"
            >
              <Download className="w-3.5 h-3.5 text-emerald-500" />
              <span>Excel</span>
            </button>
            <button
              onClick={exportToPDF}
              className="px-3 py-2 bg-[var(--surface-secondary)] border border-[var(--border-primary)] hover:border-sky-500/40 text-[var(--text-secondary)] hover:text-sky-600 rounded-xl font-bold text-[12.5px] transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              title="Print PDF Summary"
            >
              <Printer className="w-3.5 h-3.5 text-sky-500" />
              <span>PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Ledger Card */}
      <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-[22px] shadow-xs overflow-hidden">
        
        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-primary)] bg-[var(--surface-secondary)]/60 text-[11px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider select-none">
                <th className="px-6 py-4">Customer & Contact</th>
                <th className="px-6 py-4">Reference</th>
                <th className="px-6 py-4 text-right">Repayment / Mo</th>
                <th className="px-6 py-4 text-center">Due / Schedule</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-primary)]/60 text-[13.5px]">
              {paginatedLoans.length > 0 ? (
                paginatedLoans.map((loan) => {
                  const isOverdue = loan.repaymentStatus === 'Overdue';
                  const monthly = loan.monthlyPayment || 0;
                  const overdueCount = loan.overdueCount || 0;
                  const delinquentInfo = delinquentMap[loan.id];
                  
                  return (
                    <tr 
                      key={loan.id}
                      className={`hover:bg-[var(--surface-secondary)]/40 transition-colors duration-150 ${
                        isOverdue ? 'bg-rose-500/[0.015]' : ''
                      }`}
                    >
                      {/* Customer & Phone */}
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[13.5px] font-black shrink-0 border ${
                            isOverdue 
                              ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' 
                              : 'bg-[var(--accent)]/15 text-[#0F171C] dark:text-[var(--accent)] border-[var(--accent)]/30'
                          }`}>
                            {loan.initials}
                          </div>
                          <div>
                            <span className="font-extrabold text-[var(--text-primary)] block leading-snug">
                              {loan.applicantName}
                            </span>
                            <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11.5px]">
                              <span className="text-[var(--text-tertiary)]">{loan.applicantEmail}</span>
                              {delinquentInfo?.phone && (
                                <a 
                                  href={`tel:${delinquentInfo.phone}`}
                                  className="inline-flex items-center gap-1 font-mono font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                                  title="Call Borrower"
                                >
                                  <Phone className="w-3 h-3 text-[var(--accent)]" />
                                  <span>{delinquentInfo.phone}</span>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Loan Reference ID & Type */}
                      <td className="px-6 py-4.5">
                        <span className="font-mono font-bold text-[var(--text-primary)] text-[13px] block">
                          #{loan.id.startsWith('#') ? loan.id.substring(1) : loan.id}
                        </span>
                        <span className="text-[11.5px] text-[var(--text-tertiary)] font-medium block mt-0.5">
                          {loan.type}
                        </span>
                      </td>

                      {/* Monthly Repayment & Penalty */}
                      <td className="px-6 py-4.5 text-right">
                        <span className="font-mono font-black text-[var(--text-primary)] text-[14.5px] block">
                          {formatCurrency(monthly)}
                        </span>
                        {isOverdue && delinquentInfo?.penaltyFee ? (
                          <span className="inline-block text-[11px] font-mono font-extrabold text-amber-500 bg-amber-500/10 px-1.5 py-0.2 rounded mt-0.5">
                            +{formatCurrency(delinquentInfo.penaltyFee)} late fee
                          </span>
                        ) : (
                          <span className="text-[11px] text-[var(--text-tertiary)] font-medium block mt-0.5">
                            of {formatCurrency(loan.amount)} total
                          </span>
                        )}
                      </td>

                      {/* Due Date & Overdue Days Tag */}
                      <td className="px-6 py-4.5 text-center">
                        <div className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--text-primary)]">
                          <Calendar className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                          <span>{formatDate(loan.nextPaymentDate || null)}</span>
                        </div>
                        {isOverdue && (
                          <div className="mt-1">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-extrabold ${
                              (delinquentInfo?.daysOverdue || 0) >= 30 ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30' :
                              (delinquentInfo?.daysOverdue || 0) >= 15 ? 'bg-orange-500/15 text-orange-500 border border-orange-500/30' :
                              'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                            }`}>
                              <AlertTriangle className="w-3 h-3" />
                              {delinquentInfo ? `${delinquentInfo.daysOverdue}d late` : `${overdueCount} overdue`}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Status Chip */}
                      <td className="px-6 py-4.5 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-extrabold uppercase tracking-wider ${
                          isOverdue 
                            ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' 
                            : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isOverdue ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                          {isOverdue ? 'Overdue' : 'On Track'}
                        </span>
                      </td>

                      {/* Actions: Centered */}
                      <td className="px-6 py-4.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onViewSchedule(loan)}
                            className="px-3 py-1.5 bg-[var(--surface-secondary)] hover:bg-[var(--surface-card)] border border-[var(--border-primary)] hover:border-[var(--accent)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition text-[12px] font-bold rounded-xl cursor-pointer flex items-center gap-1.5 shadow-xs"
                            title="View Installment Schedule"
                          >
                            <FileText className="w-3.5 h-3.5 text-[var(--accent)]" />
                            <span>Schedule</span>
                          </button>

                          {isOverdue && (
                            <button
                              onClick={() => handleSendNudge(loan)}
                              disabled={nudgingLoanId === loan.id}
                              className="inline-flex items-center gap-1.5 bg-[var(--accent)] hover:brightness-105 active:scale-97 text-[#0F171C] text-[12px] font-bold px-3.5 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
                              title="Dispatch instant collection notification via Telegram and In-App"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>{nudgingLoanId === loan.id ? 'Sending...' : 'Send Nudge'}</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-[var(--text-secondary)]">
                    <div className="max-w-xs mx-auto space-y-2">
                      <span className="text-[32px] block">
                        {riskFilter !== 'all' ? '🔍' : '✨'}
                      </span>
                      <span className="font-bold text-[15px] text-[var(--text-primary)] block">
                        {riskFilter !== 'all'
                          ? `No loans in ${riskFilter.toUpperCase()} risk bucket`
                          : 'No matching schedules'}
                      </span>
                      <p className="text-[12.5px] text-[var(--text-tertiary)]">
                        {riskFilter !== 'all' ? (
                          <button
                            onClick={() => { setRiskFilter('all'); setCurrentPage(1); }}
                            className="text-[var(--accent)] hover:underline font-bold cursor-pointer"
                          >
                            View all {overdueCount} overdue loan{overdueCount !== 1 ? 's' : ''}
                          </button>
                        ) : (
                          'Try adjusting your search criteria or switching tabs.'
                        )}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modern Pagination Footer */}
        {filteredLoans.length > 0 && (
          <div className="bg-[var(--surface-secondary)]/50 px-6 py-4 border-t border-[var(--border-primary)] flex flex-col sm:flex-row justify-between items-center gap-3 select-none">
            <span className="text-[12.5px] font-medium text-[var(--text-secondary)]">
              Showing <span className="font-bold text-[var(--text-primary)]">{startIdx}</span> to <span className="font-bold text-[var(--text-primary)]">{endIdx}</span> of <span className="font-bold text-[var(--text-primary)]">{filteredLoans.length}</span> loans
            </span>
            
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-xl border border-[var(--border-primary)] bg-[var(--surface-card)] text-[12.5px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>
              
              <span className="px-3 py-1.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-primary)] text-[12px] font-mono font-bold text-[var(--text-primary)] shadow-xs">
                {currentPage} / {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-xl border border-[var(--border-primary)] bg-[var(--surface-card)] text-[12.5px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
