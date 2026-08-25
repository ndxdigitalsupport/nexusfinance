import React from 'react';
import { Landmark, Download, History } from 'lucide-react';
import { LoanApplication, Transaction } from '../types';
import { downloadCSV } from '../utils';
import { useCurrency } from '../context/CurrencyContext';
import Heading from './Heading';
import EmptyState from './EmptyState';
import StatusBadge from './StatusBadge';
import Pagination from './Pagination';

interface Props {
  applications: LoanApplication[];
  loanPage: number;
  setLoanPage: (p: number) => void;
  userEmail?: string;
  transactions: Transaction[];
  txPage: number;
  setTxPage: (p: number) => void;
}

export default function LoansLedgerSection({ applications, loanPage, setLoanPage, userEmail, transactions, txPage, setTxPage }: Props) {
  const { formatCurrency } = useCurrency();
  const filtered = applications.filter(a => a.applicantEmail === (userEmail || ''));

  const txPerPage = 10;
  const txTotalPages = Math.ceil(transactions.length / txPerPage) || 1;
  const txPaginated = transactions.slice((txPage - 1) * txPerPage, txPage * txPerPage);

  if (filtered.length === 0 && transactions.length === 0) return (
    <div className="animate-content-enter">
      <Heading>Loans</Heading>
      <EmptyState icon={Landmark} title="No loan activity yet" description="Apply for your first loan to get started with Nexus Finance." />
    </div>
  );

  const loanItemsPerPage = 5;
  const loanTotalPages = Math.ceil(filtered.length / loanItemsPerPage) || 1;
  const loanPaginated = filtered.slice((loanPage - 1) * loanItemsPerPage, loanPage * loanItemsPerPage);

  return (
    <div className="animate-content-enter space-y-8">
      {/* Loan Applications Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Heading>Loans</Heading>
          <button onClick={() => downloadCSV(filtered, 'my_loans.csv')} className="flex items-center gap-1.5 text-[12px] font-bold text-[var(--text-secondary)] bg-[var(--surface-secondary)] border border-[var(--border-primary)] rounded-xl px-3 py-2 hover:bg-[var(--surface-card)] transition-colors cursor-pointer">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
        <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--surface-secondary)] text-[11px] uppercase tracking-wider text-[var(--text-secondary)] font-bold sticky top-0">
                <th className="px-5 py-3.5">ID</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-primary)]">
              {loanPaginated.map((app) => (
                <tr key={app.id} className="text-[14px] font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]/70 transition-colors bg-[var(--surface-card)]">
                  <td className="px-5 py-3.5">{app.id}</td>
                  <td className="px-5 py-3.5">{formatCurrency(app.amount)}</td>
                  <td className="px-5 py-3.5 text-[var(--text-secondary)]">{app.type}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge variant={app.status === 'Approved' ? 'success' : app.status === 'Rejected' ? 'error' : app.status === 'Hold' ? 'warning' : 'info'} label={app.status} />
                  </td>
                  <td className="px-5 py-3.5 text-[var(--text-secondary)]">{app.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination currentPage={loanPage} totalPages={loanTotalPages} totalItems={filtered.length} itemsPerPage={loanItemsPerPage} onPageChange={setLoanPage} />
        </div>
      </div>

      {/* Transaction History Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[var(--text-secondary)]" />
            <h3 className="text-[18px] font-extrabold text-[var(--text-primary)] tracking-tight">Transaction History</h3>
          </div>
          <button onClick={() => downloadCSV(transactions, 'transaction_history.csv')} className="flex items-center gap-1.5 text-[12px] font-bold text-[var(--text-secondary)] bg-[var(--surface-secondary)] border border-[var(--border-primary)] rounded-xl px-3 py-2 hover:bg-[var(--surface-card)] transition-colors cursor-pointer">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
        {transactions.length === 0 ? (
          <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl p-8 text-center">
            <History className="w-8 h-8 text-[var(--text-tertiary)] mx-auto mb-3" />
            <p className="text-[14px] text-[var(--text-secondary)]">No transactions yet. Your financial activity will appear here.</p>
          </div>
        ) : (
          <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[var(--surface-secondary)] text-[11px] uppercase tracking-wider text-[var(--text-secondary)] font-bold sticky top-0">
                  <th className="px-5 py-3.5">Title</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-primary)]">
                {txPaginated.map((tx) => (
                  <tr key={tx.id} className="text-[14px] font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]/70 transition-colors bg-[var(--surface-card)]">
                    <td className="px-5 py-3.5">{tx.title}</td>
                    <td className="px-5 py-3.5 text-[var(--text-secondary)]">{tx.date}</td>
                    <td className="px-5 py-3.5 font-mono" style={{color: tx.amount > 0 ? 'var(--success-text)' : 'var(--error-text)'}}>
                      {tx.amount > 0 ? '+' : '-'}{formatCurrency(Math.abs(tx.amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination currentPage={txPage} totalPages={txTotalPages} totalItems={transactions.length} itemsPerPage={txPerPage} onPageChange={setTxPage} />
          </div>
        )}
      </div>
    </div>
  );
}
