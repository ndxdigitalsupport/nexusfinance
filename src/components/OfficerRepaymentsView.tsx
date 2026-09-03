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
  X,
  Phone,
  RefreshCw,
  Sparkles
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

  // Live Overdue API Data (for accurate late penalty and aging days)
  const [delinquentMap, setDelinquentMap] = useState<Record<string, DelinquentDetails>>({});
  const [summary, setSummary] = useState<any>(null);
  const [loadingDelinquent, setLoadingDelinquent] = useState(false);
  const [riskFilter, setRiskFilter] = useState<'all' | 'mild' | 'medium' | 'severe'>('all');

  const itemsPerPage = 6;

  const fetchDelinquentData = async () => {
    setLoadingDelinquent(true);
    try {
      const data = await apiFetch('/loans/overdue');
      if (data && data.delinquentLoans) {
        const map: Record<string, DelinquentDetails> = {};
        data.delinquentLoans.forEach((dl: DelinquentDetails) => {
          map[dl.loanId] = dl;
        });
        setDelinquentMap(map);
        setSummary(data.summary || null);
      }
    } catch {
      // silently fallback
    } finally {
      setLoadingDelinquent(false);
    }
  };

  useEffect(() => {
    fetchDelinquentData();
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
        fetchDelinquentData();
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

    const csvContent = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');
    const excelHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Active Repayments</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
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

  const overdueCount = activeLoans.filter(l => l.repaymentStatus === 'Overdue').length;
  const onTimeCount = activeLoans.filter(l => l.repaymentStatus === 'On Time').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/10 text-rose-500 uppercase tracking-wider">
            Repayment & Collection Control
          </span>
          <h2 className="text-[28px] font-extrabold text-[var(--text-primary)] tracking-tight mt-1">
            Repayments & Debt Collections
          </h2>
          <p className="text-[13px] text-[var(--text-secondary)] font-medium mt-0.5">
            Unified installment monitoring, real-time late penalty calculations, and instant borrower collection nudges.
          </p>
        </div>

        <button
          onClick={() => { onRefresh(); fetchDelinquentData(); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border-primary)] hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer self-start sm:self-auto font-bold text-[13px]"
        >
          <RefreshCw className={`w-4 h-4 ${loadingDelinquent ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Notifications Toast */}
      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl p-4 flex items-start gap-3 shadow-sm select-none">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <span className="text-[13px] font-bold leading-normal">{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl p-4 flex items-start gap-3 shadow-sm select-none">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <span className="text-[13px] font-bold leading-normal">{errorMessage}</span>
        </div>
      )}

      {/* When viewing Overdue & Collections: Show Traffic-Light Aging Cards */}
      {activeTab === 'overdue' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in duration-200">
          <div 
            onClick={() => { setRiskFilter(riskFilter === 'mild' ? 'all' : 'mild'); setCurrentPage(1); }}
            className={`bg-[var(--surface-card)] border rounded-2xl p-4 shadow-xs flex items-center justify-between cursor-pointer transition ${
              riskFilter === 'mild' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-amber-500/30 hover:border-amber-500/60'
            }`}
          >
            <div>
              <span className="text-[11px] font-extrabold text-amber-500 uppercase tracking-wider block">
                {t('mild_risk')}
              </span>
              <span className="text-[24px] font-black font-mono text-[var(--text-primary)] mt-0.5 block">
                {summary?.mildCount || 0} Loans
              </span>
              <span className="text-[11px] text-[var(--text-secondary)] mt-0.5 block">Automated reminders running</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-[18px]">
              🟡
            </div>
          </div>

          <div 
            onClick={() => { setRiskFilter(riskFilter === 'medium' ? 'all' : 'medium'); setCurrentPage(1); }}
            className={`bg-[var(--surface-card)] border rounded-2xl p-4 shadow-xs flex items-center justify-between cursor-pointer transition ${
              riskFilter === 'medium' ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-orange-500/30 hover:border-orange-500/60'
            }`}
          >
            <div>
              <span className="text-[11px] font-extrabold text-orange-500 uppercase tracking-wider block">
                {t('medium_risk')}
              </span>
              <span className="text-[24px] font-black font-mono text-[var(--text-primary)] mt-0.5 block">
                {summary?.mediumCount || 0} Loans
              </span>
              <span className="text-[11px] text-[var(--text-secondary)] mt-0.5 block">Call required</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold text-[18px]">
              🟠
            </div>
          </div>

          <div 
            onClick={() => { setRiskFilter(riskFilter === 'severe' ? 'all' : 'severe'); setCurrentPage(1); }}
            className={`bg-[var(--surface-card)] border rounded-2xl p-4 shadow-xs flex items-center justify-between cursor-pointer transition ${
              riskFilter === 'severe' ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-rose-500/30 hover:border-rose-500/60'
            }`}
          >
            <div>
              <span className="text-[11px] font-extrabold text-rose-500 uppercase tracking-wider block">
                {t('severe_risk')}
              </span>
              <span className="text-[24px] font-black font-mono text-[var(--text-primary)] mt-0.5 block">
                {summary?.severeCount || 0} Loans
              </span>
              <span className="text-[11px] text-[var(--text-secondary)] mt-0.5 block">Default / Legal escalation</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold text-[18px]">
              🔴
            </div>
          </div>
        </div>
      )}

      {/* Controls Bar: Search & Tabs */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        
        {/* Tab switchers */}
        <div className="bg-[var(--surface-secondary)] p-1 rounded-xl border border-[var(--border-primary)] flex gap-1 select-none flex-1 max-w-lg">
          <button
            onClick={() => { setActiveTab('all'); setRiskFilter('all'); setCurrentPage(1); }}
            className={`flex-1 text-center py-2 text-[12.5px] font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[var(--surface-card)] text-[var(--text-primary)] shadow-sm border border-[var(--border-primary)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            All Active ({activeLoans.length})
          </button>

          <button
            onClick={() => { setActiveTab('ontime'); setRiskFilter('all'); setCurrentPage(1); }}
            className={`flex-1 text-center py-2 text-[12.5px] font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'ontime'
                ? 'bg-emerald-500 text-white shadow-sm border border-emerald-600'
                : 'text-emerald-600 hover:bg-emerald-500/10'
            }`}
          >
            On Track ({onTimeCount})
          </button>

          <button
            onClick={() => { setActiveTab('overdue'); setCurrentPage(1); }}
            className={`flex-1 text-center py-2 text-[12.5px] font-bold rounded-lg transition-all cursor-pointer relative ${
              activeTab === 'overdue'
                ? 'bg-rose-500 text-white shadow-sm border border-rose-600'
                : 'text-rose-500 hover:bg-rose-500/10'
            }`}
          >
            Overdue & Collections ({overdueCount})
          </button>
        </div>

        {/* Search & Export Group */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Local Search input */}
          <div className="relative w-full md:w-64">
            <Search className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Search active accounts..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-xl py-2.5 pl-10 pr-4 text-[13px] leading-tight focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10 transition shadow-sm placeholder:text-[var(--text-tertiary)]"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportToExcel}
              className="px-3 py-2 bg-[var(--surface-secondary)] border border-[var(--border-primary)] hover:border-[var(--accent)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xl font-bold text-[12.5px] transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              title="Download Excel Spreadsheet"
            >
              <Download className="w-4 h-4 text-emerald-500" />
              <span>Excel</span>
            </button>
            <button
              onClick={exportToPDF}
              className="px-3 py-2 bg-[var(--surface-secondary)] border border-[var(--border-primary)] hover:border-[var(--accent)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xl font-bold text-[12.5px] transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              title="Print PDF Summary"
            >
              <Printer className="w-4 h-4 text-sky-500" />
              <span>PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Repayments / Collection Ledger Container */}
      <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl shadow-xs overflow-hidden">
        
        {/* Table Head */}
        <div className="hidden sm:grid grid-cols-12 px-6 py-4 border-b border-[var(--border-primary)] bg-[var(--surface-secondary)]/40 font-bold select-none text-[11px] text-[var(--text-secondary)] uppercase tracking-wider">
          <div className="col-span-3">Customer / Reference</div>
          <div className="col-span-2 text-right">Repayment / Mo</div>
          <div className="col-span-2 text-center">Next Payment / Due</div>
          <div className="col-span-2 text-center">Status</div>
          <div className="col-span-3 text-center">Actions</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-[var(--border-secondary)] select-none">
          {paginatedLoans.length > 0 ? (
            paginatedLoans.map((loan) => {
              const isOverdue = loan.repaymentStatus === 'Overdue';
              const monthly = loan.monthlyPayment || 0;
              const overdueCount = loan.overdueCount || 0;
              const delinquentInfo = delinquentMap[loan.id];
              
              return (
                <div 
                  key={loan.id}
                  className={`flex flex-col sm:grid sm:grid-cols-12 px-6 py-5 gap-3 sm:gap-0 items-start sm:items-center hover:bg-[var(--surface-secondary)]/20 transition ${
                    isOverdue ? 'bg-rose-500/[0.02]' : ''
                  }`}
                >
                  
                  {/* Customer / Reference */}
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[var(--accent)]/10 to-[var(--accent)]/5 text-[var(--accent)] flex items-center justify-center text-[14px] font-extrabold shadow-sm shrink-0">
                      {loan.initials}
                    </div>
                    <div>
                      <div className="text-[14.5px] text-[var(--text-primary)] font-bold">{loan.applicantName}</div>
                      <div className="text-[11.5px] text-[var(--text-secondary)] font-medium mt-0.5">
                        ID: {loan.id} <span className="text-[var(--text-tertiary)]">•</span> {loan.type}
                      </div>
                      {delinquentInfo?.phone && (
                        <a 
                          href={`tel:${delinquentInfo.phone}`}
                          className="inline-flex items-center gap-1 text-[11px] text-[var(--text-tertiary)] hover:text-[var(--accent)] font-mono mt-0.5"
                        >
                          <Phone className="w-3 h-3" /> {delinquentInfo.phone}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Repayment per Month */}
                  <div className="col-span-2 text-left sm:text-right ml-13 sm:ml-0">
                    <div className="text-[14.5px] text-[var(--text-primary)] font-bold font-mono">
                      {formatCurrency(monthly)}
                    </div>
                    {isOverdue && delinquentInfo?.penaltyFee ? (
                      <div className="text-[11px] text-amber-500 font-bold mt-0.5">
                        +{formatCurrency(delinquentInfo.penaltyFee)} late fee
                      </div>
                    ) : (
                      <div className="text-[11.5px] text-[var(--text-tertiary)] font-semibold mt-0.5">
                        of {formatCurrency(loan.amount)} total
                      </div>
                    )}
                  </div>

                  {/* Next Payment Date / Days Late */}
                  <div className="col-span-2 text-left sm:text-center ml-13 sm:ml-0">
                    <div className="text-[13.5px] text-[var(--text-primary)] font-semibold flex items-center justify-start sm:justify-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[var(--text-tertiary)]" />
                      {formatDate(loan.nextPaymentDate || null)}
                    </div>
                    {isOverdue && (
                      <div className="mt-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-mono font-extrabold ${
                          (delinquentInfo?.daysOverdue || 0) >= 30 ? 'bg-rose-500/10 text-rose-500' :
                          (delinquentInfo?.daysOverdue || 0) >= 15 ? 'bg-orange-500/10 text-orange-500' :
                          'bg-amber-500/10 text-amber-500'
                        }`}>
                          <AlertTriangle className="w-3 h-3" />
                          {delinquentInfo ? `${delinquentInfo.daysOverdue}d late` : `${overdueCount} overdue`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Status chip */}
                  <div className="col-span-2 text-left sm:text-center ml-13 sm:ml-0 flex justify-start sm:justify-center items-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold uppercase tracking-wider ${
                      isOverdue 
                        ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' 
                        : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                    }`}>
                      {isOverdue ? 'Overdue' : 'On Track'}
                    </span>
                  </div>

                  {/* Action Buttons: Schedule + 1-Click Send Nudge */}
                  <div className="col-span-3 flex flex-row gap-2 justify-start sm:justify-center items-center ml-13 sm:ml-0 w-full">
                    <button
                      onClick={() => onViewSchedule(loan)}
                      className="px-2.5 py-1.5 bg-[var(--surface-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] hover:bg-[var(--surface-card)] transition text-[12px] font-bold rounded-lg cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                      title="View Repayment Schedule"
                    >
                      <Printer className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span>Schedule</span>
                    </button>

                    {isOverdue ? (
                      <button
                        onClick={() => handleSendNudge(loan)}
                        disabled={nudgingLoanId === loan.id}
                        className="inline-flex items-center gap-1.5 bg-[var(--accent)] hover:brightness-105 text-[#0F171C] text-[12px] font-bold px-3 py-1.5 rounded-lg transition shadow-xs cursor-pointer disabled:opacity-50"
                        title="Send Instant Collection Nudge via Telegram and In-App"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{nudgingLoanId === loan.id ? 'Sending...' : 'Send Nudge'}</span>
                      </button>
                    ) : (
                      <span className="text-[11.5px] text-emerald-600 font-bold uppercase tracking-wider px-2 py-1 rounded bg-emerald-500/5">
                        Good Standing
                      </span>
                    )}
                  </div>

                </div>
              );
            })
          ) : (
            <div className="p-12 text-center text-[var(--text-secondary)] font-medium">
              No active repayment schedules found under this category.
            </div>
          )}
        </div>

        {/* Pagination HUD */}
        {filteredLoans.length > 0 && (
          <div className="bg-[var(--surface-secondary)]/40 px-6 py-4 border-t border-[var(--border-primary)] flex justify-between items-center select-none">
            <span className="text-[12.5px] font-semibold text-[var(--text-secondary)]">
              Showing {startIdx}-{endIdx} of {filteredLoans.length} schedules
            </span>
            
            <div className="flex items-center gap-3">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-primary)] rounded-lg transition disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
              </button>
              
              <span className="text-[12.5px] font-bold text-[var(--text-primary)] tracking-wide">
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-primary)] rounded-lg transition disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
              >
                <ChevronRight className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
