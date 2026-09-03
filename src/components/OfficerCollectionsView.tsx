import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Send, 
  Phone, 
  AlertTriangle, 
  RefreshCw, 
  Search, 
  DollarSign, 
  Calendar,
  MessageSquare,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { apiFetch } from '../api';
import { showToast } from './Toast';
import { SkeletonTable } from './Skeleton';
import Pagination from './Pagination';
import { useCurrency } from '../context/CurrencyContext';

interface DelinquentLoan {
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

interface DelinquentSummary {
  totalOverdueLoans: number;
  totalOverduePrincipal: number;
  totalPenaltiesAccrued: number;
  totalRecoverable: number;
  mildCount: number;
  mediumCount: number;
  severeCount: number;
}

export default function OfficerCollectionsView() {
  const { t, formatCurrency } = useCurrency();
  const [delinquentLoans, setDelinquentLoans] = useState<DelinquentLoan[]>([]);
  const [summary, setSummary] = useState<DelinquentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [nudgingLoanId, setNudgingLoanId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'mild' | 'medium' | 'severe'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchOverdueLoans = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/loans/overdue');
      setDelinquentLoans(data.delinquentLoans || []);
      setSummary(data.summary || null);
    } catch (err: any) {
      showToast(err.message || 'Failed to load delinquent loans queue', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverdueLoans();
  }, []);

  const handleNudge = async (loanId: string) => {
    setNudgingLoanId(loanId);
    try {
      const res = await apiFetch(`/loans/${encodeURIComponent(loanId)}/nudge`, {
        method: 'POST',
        body: JSON.stringify({ channel: 'both' })
      });
      showToast(res.message || `Collection nudge sent for loan ${loanId}`, 'success');
      fetchOverdueLoans();
    } catch (e: any) {
      showToast(e.message || 'Failed to send nudge', 'error');
    } finally {
      setNudgingLoanId(null);
    }
  };

  const filteredLoans = delinquentLoans.filter(l => {
    const matchesSearch = 
      l.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.applicantEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.loanId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.phone && l.phone.includes(searchTerm));

    if (!matchesSearch) return false;
    if (activeFilter !== 'all' && l.riskLevel !== activeFilter) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredLoans.length / itemsPerPage) || 1;
  const paginatedLoans = filteredLoans.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-[24px] font-black text-[var(--text-primary)] font-sans tracking-tight">
                {t('collections')} & Overdue Debt Recovery
              </h2>
              <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">
                Live action queue of delinquent accounts, overdue installment tracking, and on-demand borrower follow-up.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchOverdueLoans}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-primary)] hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer self-start sm:self-auto shadow-xs font-bold text-[13px]"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Traffic Light Aging Buckets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div 
          onClick={() => { setActiveFilter(activeFilter === 'mild' ? 'all' : 'mild'); setCurrentPage(1); }}
          className={`bg-[var(--surface-card)] border rounded-2xl p-5 shadow-xs flex items-center justify-between cursor-pointer transition ${
            activeFilter === 'mild' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-amber-500/30 hover:border-amber-500/60'
          }`}
        >
          <div>
            <span className="text-[11.5px] font-extrabold text-amber-500 uppercase tracking-wider block">
              {t('mild_risk')}
            </span>
            <span className="text-[28px] font-black font-mono text-[var(--text-primary)] mt-1 block">
              {summary?.mildCount || 0} Loans
            </span>
            <span className="text-[11px] text-[var(--text-secondary)] mt-0.5 block">Automated nudges dispatched</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-[20px]">
            🟡
          </div>
        </div>

        <div 
          onClick={() => { setActiveFilter(activeFilter === 'medium' ? 'all' : 'medium'); setCurrentPage(1); }}
          className={`bg-[var(--surface-card)] border rounded-2xl p-5 shadow-xs flex items-center justify-between cursor-pointer transition ${
            activeFilter === 'medium' ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-orange-500/30 hover:border-orange-500/60'
          }`}
        >
          <div>
            <span className="text-[11.5px] font-extrabold text-orange-500 uppercase tracking-wider block">
              {t('medium_risk')}
            </span>
            <span className="text-[28px] font-black font-mono text-[var(--text-primary)] mt-1 block">
              {summary?.mediumCount || 0} Loans
            </span>
            <span className="text-[11px] text-[var(--text-secondary)] mt-0.5 block">Loan officer call required</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold text-[20px]">
            🟠
          </div>
        </div>

        <div 
          onClick={() => { setActiveFilter(activeFilter === 'severe' ? 'all' : 'severe'); setCurrentPage(1); }}
          className={`bg-[var(--surface-card)] border rounded-2xl p-5 shadow-xs flex items-center justify-between cursor-pointer transition ${
            activeFilter === 'severe' ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-rose-500/30 hover:border-rose-500/60'
          }`}
        >
          <div>
            <span className="text-[11.5px] font-extrabold text-rose-500 uppercase tracking-wider block">
              {t('severe_risk')}
            </span>
            <span className="text-[28px] font-black font-mono text-[var(--text-primary)] mt-1 block">
              {summary?.severeCount || 0} Loans
            </span>
            <span className="text-[11px] text-[var(--text-secondary)] mt-0.5 block">Default / Legal escalation</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold text-[20px]">
            🔴
          </div>
        </div>
      </div>

      {/* Main Delinquent Loans Table Card */}
      <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl overflow-hidden shadow-xs">
        {/* Table Filters Header */}
        <div className="p-4 border-b border-[var(--border-primary)] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                placeholder="Search borrower, loan ID, phone..."
                className="w-full pl-9 pr-4 py-2 bg-[var(--surface-secondary)] border border-[var(--border-primary)] rounded-xl text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>

            {activeFilter !== 'all' && (
              <button
                onClick={() => setActiveFilter('all')}
                className="text-[12px] font-bold text-[var(--accent)] hover:underline cursor-pointer whitespace-nowrap"
              >
                Clear Filter ({activeFilter})
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto text-[12px] text-[var(--text-secondary)] font-medium">
            <span>Total Recoverable: </span>
            <span className="font-mono font-bold text-rose-500 text-[14px]">
              {formatCurrency(summary?.totalRecoverable || 0)}
            </span>
            <span className="text-[11px] text-[var(--text-tertiary)]">
              (Includes {formatCurrency(summary?.totalPenaltiesAccrued || 0)} penalty)
            </span>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-[13.5px] text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-primary)] bg-[var(--surface-secondary)]/50 select-none">
                <th className="px-6 py-3.5 font-bold text-[var(--text-primary)]">Borrower & Contact</th>
                <th className="px-6 py-3.5 font-bold text-[var(--text-primary)]">Reference</th>
                <th className="px-6 py-3.5 font-bold text-[var(--text-primary)] text-center">Days Overdue</th>
                <th className="px-6 py-3.5 font-bold text-[var(--text-primary)] text-right">Base Installment</th>
                <th className="px-6 py-3.5 font-bold text-[var(--text-primary)] text-right">Late Penalty</th>
                <th className="px-6 py-3.5 font-bold text-[var(--text-primary)] text-right">Total Owed</th>
                <th className="px-6 py-3.5 font-bold text-[var(--text-primary)] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-primary)]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8">
                    <SkeletonTable rows={5} />
                  </td>
                </tr>
              ) : paginatedLoans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center text-emerald-600">
                    <div className="max-w-sm mx-auto space-y-2">
                      <span className="text-[32px] block">🎉</span>
                      <span className="font-bold block text-[16px]">Zero Delinquent Loans!</span>
                      <p className="text-[12.5px] text-[var(--text-secondary)]">
                        {searchTerm ? 'No loans match your search criteria.' : 'All borrower installments are currently up to date.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedLoans.map((l) => (
                  <tr key={l.loanId} className="hover:bg-[var(--surface-secondary)]/30 transition">
                    <td className="px-6 py-4">
                      <span className="font-bold text-[var(--text-primary)] block">{l.applicantName}</span>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-[var(--text-tertiary)]">
                        <span>{l.applicantEmail}</span>
                        {l.phone && (
                          <a 
                            href={`tel:${l.phone}`}
                            className="inline-flex items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--accent)] font-mono font-medium"
                          >
                            <Phone className="w-3 h-3" /> {l.phone}
                          </a>
                        )}
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          l.telegramLinked ? 'bg-sky-500/10 text-sky-600' : 'bg-gray-500/10 text-gray-500'
                        }`}>
                          {l.telegramLinked ? 'Telegram Linked' : 'No Telegram'}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-[var(--text-primary)]">
                        #{l.loanId.startsWith('#') ? l.loanId.substring(1) : l.loanId}
                      </span>
                      <span className="text-[11px] text-[var(--text-tertiary)] block">{l.loanType}</span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11.5px] font-mono font-extrabold ${
                        l.riskLevel === 'severe' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                        l.riskLevel === 'medium' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                        'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}>
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {l.daysOverdue} Days Late
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right font-mono font-bold text-[var(--text-primary)]">
                      {formatCurrency(l.monthlyPayment * l.overdueInstallmentsCount)}
                    </td>

                    <td className="px-6 py-4 text-right font-mono font-bold text-amber-500">
                      +{formatCurrency(l.penaltyFee)}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <span className="font-mono font-black text-rose-500 text-[14.5px] block">
                        {formatCurrency(l.totalDue)}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleNudge(l.loanId)}
                        disabled={nudgingLoanId === l.loanId}
                        className="inline-flex items-center gap-1.5 bg-[var(--accent)] hover:brightness-105 text-[#0F171C] text-[12px] font-bold px-3.5 py-1.5 rounded-lg transition shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        {nudgingLoanId === l.loanId ? t('nudging') : t('nudge_btn')}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[var(--border-primary)]">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredLoans.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
