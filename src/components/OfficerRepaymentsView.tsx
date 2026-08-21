import React, { useState } from 'react';
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
  ShieldAlert
} from 'lucide-react';
import { LoanApplication } from '../types';
import { apiFetch } from '../api';

interface OfficerRepaymentsViewProps {
  loans: LoanApplication[];
  onRefresh: () => void;
}

export default function OfficerRepaymentsView({ loans, onRefresh }: OfficerRepaymentsViewProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'overdue' | 'ontime'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [chasingId, setChasingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Custom Chase Message Modal State
  const [customizingLoan, setCustomizingLoan] = useState<LoanApplication | null>(null);
  const [customMessageText, setCustomMessageText] = useState('');
  
  const itemsPerPage = 5;

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

    // tab filter
    const status = l.repaymentStatus || 'On Time';
    if (activeTab === 'overdue') return status === 'Overdue';
    if (activeTab === 'ontime') return status === 'On Time';
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

  const openCustomChaseModal = (loan: LoanApplication) => {
    const monthly = loan.monthlyPayment || 0;
    const defaultText = `⚠️ *URGENT PAYMENT REMINDER* ⚠️\n\nDear *${loan.applicantName}*,\n\nOur records show that your monthly installment of *$${monthly.toFixed(2)}* is currently overdue for Loan *${loan.id}*.\n\nPlease log in to the portal and settle your outstanding payment immediately.\n\n🔗 [Pay Outstanding Balance](https://nexusfinancefintech.vercel.app/)`;
    
    setCustomizingLoan(loan);
    setCustomMessageText(defaultText);
  };

  const submitCustomChase = async () => {
    if (!customizingLoan) return;
    const loanId = customizingLoan.id;
    
    setChasingId(loanId);
    setSuccessMessage(null);
    setErrorMessage(null);
    setCustomizingLoan(null); // Close modal
    
    try {
      const res = await apiFetch(`/loans/${encodeURIComponent(loanId)}/chase`, {
        method: 'POST',
        body: JSON.stringify({ message: customMessageText })
      });
      
      if (res.error) {
        setErrorMessage(res.error || 'Failed to dispatch payment chase notifications.');
      } else {
        setSuccessMessage(`⚡ Custom chase notification sent successfully for Loan ${loanId}! Telegram, Email, and SMS alerts dispatched.`);
        onRefresh();
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to connect to backend.');
    } finally {
      setChasingId(null);
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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/10 text-rose-500 uppercase tracking-wider">
          Repayment Control
        </span>
        <h2 className="text-[28px] font-extrabold text-[var(--text-primary)] tracking-tight mt-1">Repayments Checklist</h2>
        <p className="text-[13px] text-[var(--text-secondary)] font-medium mt-0.5">
          Monitor approved active loans and trigger payment alerts for overdue accounts.
        </p>
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

      {/* Controls Bar: Search & Tabs */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        
        {/* Tab switchers */}
        <div className="bg-[var(--surface-secondary)] p-1 rounded-xl border border-[var(--border-primary)] flex gap-1 select-none flex-1 max-w-md">
          <button
            onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
            className={`flex-1 text-center py-2 text-[12.5px] font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[var(--surface-card)] text-[var(--text-primary)] shadow-sm border border-[var(--border-primary)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            All Active ({activeLoans.length})
          </button>
          <button
            onClick={() => { setActiveTab('overdue'); setCurrentPage(1); }}
            className={`flex-1 text-center py-2 text-[12.5px] font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'overdue'
                ? 'bg-rose-500 text-white shadow-sm border border-rose-600'
                : 'text-rose-500 hover:bg-rose-500/5'
            }`}
          >
            Overdue ({activeLoans.filter(l => l.repaymentStatus === 'Overdue').length})
          </button>
          <button
            onClick={() => { setActiveTab('ontime'); setCurrentPage(1); }}
            className={`flex-1 text-center py-2 text-[12.5px] font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'ontime'
                ? 'bg-[var(--surface-card)] text-[var(--text-primary)] shadow-sm border border-[var(--border-primary)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            On Time ({activeLoans.filter(l => l.repaymentStatus === 'On Time').length})
          </button>
        </div>

        {/* Local Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Search active accounts..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-xl py-2.5 pl-10 pr-4 text-[13px] leading-tight focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10 transition shadow-sm placeholder:text-[var(--text-tertiary)]"
          />
        </div>
      </div>

      {/* Repayments Grid/Table Card */}
      <div className="bg-[var(--surface-card)] rounded-2xl border border-[var(--border-primary)] shadow-xs overflow-hidden">
        
        {/* Table Headers */}
        <div className="hidden sm:grid grid-cols-12 bg-[var(--surface-secondary)] px-6 py-4 border-b border-[var(--border-primary)]">
          <div className="col-span-4 text-[11px] text-[var(--text-secondary)] uppercase tracking-wider font-extrabold">Customer / Reference</div>
          <div className="col-span-2 text-[11px] text-[var(--text-secondary)] uppercase tracking-wider font-extrabold text-right">Repayment/Mo</div>
          <div className="col-span-3 text-[11px] text-[var(--text-secondary)] uppercase tracking-wider font-extrabold text-center">Next Payment</div>
          <div className="col-span-1.5 text-[11px] text-[var(--text-secondary)] uppercase tracking-wider font-extrabold text-center">Status</div>
          <div className="col-span-1.5 text-[11px] text-[var(--text-secondary)] uppercase tracking-wider font-extrabold text-right">Action</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-[var(--border-secondary)] select-none">
          {paginatedLoans.length > 0 ? (
            paginatedLoans.map((loan) => {
              const isOverdue = loan.repaymentStatus === 'Overdue';
              const monthly = loan.monthlyPayment || 0;
              const overdueCount = loan.overdueCount || 0;
              
              return (
                <div 
                  key={loan.id}
                  className={`flex flex-col sm:grid sm:grid-cols-12 px-6 py-5 gap-3 sm:gap-0 items-start sm:items-center hover:bg-[var(--surface-secondary)]/20 transition ${
                    isOverdue ? 'bg-rose-500/[0.01]' : ''
                  }`}
                >
                  
                  {/* Customer / Reference */}
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[var(--accent)]/10 to-[var(--accent)]/5 text-[var(--accent)] flex items-center justify-center text-[14px] font-extrabold shadow-sm shrink-0">
                      {loan.initials}
                    </div>
                    <div>
                      <div className="text-[14.5px] text-[var(--text-primary)] font-bold">{loan.applicantName}</div>
                      <div className="text-[11.5px] text-[var(--text-secondary)] font-medium mt-0.5">
                        ID: {loan.id} <span className="text-[var(--text-tertiary)]">•</span> {loan.type}
                      </div>
                    </div>
                  </div>

                  {/* Repayment per Month */}
                  <div className="col-span-2 text-left sm:text-right ml-13 sm:ml-0">
                    <div className="text-[14.5px] text-[var(--text-primary)] font-bold">
                      ${monthly.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[11.5px] text-[var(--text-tertiary)] font-semibold mt-0.5">
                      of ${loan.amount.toLocaleString()} total
                    </div>
                  </div>

                  {/* Next Payment Date */}
                  <div className="col-span-3 text-left sm:text-center ml-13 sm:ml-0">
                    <div className="text-[14px] text-[var(--text-primary)] font-semibold flex items-center justify-start sm:justify-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[var(--text-tertiary)]" />
                      {formatDate(loan.nextPaymentDate || null)}
                    </div>
                    {isOverdue && (
                      <span className="text-[11px] text-rose-500 font-extrabold block mt-0.5">
                        ⚠️ {overdueCount} payment{overdueCount > 1 ? 's' : ''} overdue
                      </span>
                    )}
                  </div>

                  {/* Status chip */}
                  <div className="col-span-1.5 text-left sm:text-center ml-13 sm:ml-0">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      isOverdue 
                        ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' 
                        : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                    }`}>
                      {isOverdue ? 'Overdue' : 'On Time'}
                    </span>
                  </div>

                  {/* Action Button */}
                  <div className="col-span-1.5 text-left sm:text-right ml-13 sm:ml-0 w-full sm:w-auto">
                    {isOverdue ? (
                      <button
                        onClick={() => openCustomChaseModal(loan)}
                        disabled={chasingId === loan.id}
                        className="premium-btn-primary py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 text-[12px] font-bold text-white shadow-sm hover:brightness-105 active:scale-97 disabled:opacity-50 cursor-pointer w-full sm:w-auto"
                      >
                        <Send className="w-3.5 h-3.5" />
                        {chasingId === loan.id ? 'Sending...' : 'Chase'}
                      </button>
                    ) : (
                      <span className="text-[12px] text-[var(--text-tertiary)] font-bold uppercase tracking-wider pr-3">
                        On Track
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

      {/* Customize Chase Alert Modal */}
      {customizingLoan && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-255 select-none">
          <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-[var(--border-primary)] bg-[var(--surface-secondary)]/30">
              <h3 className="text-[17px] font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                <span>⚡</span> Customize Chase Message
              </h3>
              <p className="text-[12px] text-[var(--text-secondary)] font-medium mt-1">
                Customize the emergency alert below. This will be sent instantly via Telegram, Email, and SMS.
              </p>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider">
                  Target Customer
                </label>
                <div className="p-3 bg-[var(--surface-secondary)] rounded-xl border border-[var(--border-primary)] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center text-[12px] font-extrabold">
                    {customizingLoan.initials}
                  </div>
                  <div>
                    <div className="text-[13px] text-[var(--text-primary)] font-bold">{customizingLoan.applicantName}</div>
                    <div className="text-[11px] text-[var(--text-secondary)] font-medium">Email: {customizingLoan.applicantEmail}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider">
                  Message Content (Markdown formatting supported)
                </label>
                <textarea
                  value={customMessageText}
                  onChange={(e) => setCustomMessageText(e.target.value)}
                  className="w-full h-44 bg-[var(--surface-secondary)]/50 border border-[var(--border-primary)] rounded-xl p-3.5 text-[13px] leading-relaxed font-mono focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10 transition resize-none text-[var(--text-primary)]"
                  placeholder="Type your custom notice..."
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[var(--border-primary)] bg-[var(--surface-secondary)]/30 flex justify-end gap-3">
              <button
                onClick={() => setCustomizingLoan(null)}
                className="py-2.5 px-4 text-[12.5px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer"
              >
                Cancel
              </button>
              
              <button
                onClick={submitCustomChase}
                className="premium-btn-primary py-2.5 px-5 rounded-xl flex items-center gap-2 text-[12.5px] font-bold text-white shadow-md hover:brightness-105 active:scale-97 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Send Reminder
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
