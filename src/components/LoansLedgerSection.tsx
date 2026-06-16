import React from 'react';
import { Landmark, Download } from 'lucide-react';
import { LoanApplication } from '../types';
import { downloadCSV } from '../utils';
import { useCurrency } from '../context/CurrencyContext';
import Heading from './Heading';
import EmptyState from './EmptyState';
import StatusBadge from './StatusBadge';
import Pagination from './Pagination';

interface Props { applications: LoanApplication[]; loanPage: number; setLoanPage: (p: number) => void; userEmail?: string; }

export default function LoansLedgerSection({ applications, loanPage, setLoanPage, userEmail }: Props) {
  const { formatCurrency } = useCurrency();
  const filtered = applications.filter(a => a.applicantEmail === (userEmail || ''));
  if (filtered.length === 0) return (
    <div className="animate-content-enter">
      <Heading>Loans Ledger</Heading>
      <EmptyState icon={Landmark} title="No loan applications yet" description="Apply for your first loan to get started with Nexus Finance." />
    </div>
  );
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((loanPage - 1) * itemsPerPage, loanPage * itemsPerPage);
  return (
    <div className="animate-content-enter">
      <div className="flex items-center justify-between mb-2">
        <Heading>Loans Ledger</Heading>
        <button onClick={() => downloadCSV(filtered, 'loans_ledger.csv')} className="flex items-center gap-1.5 text-[12px] font-bold text-[var(--text-secondary)] bg-[var(--surface-secondary)] border border-[var(--border-primary)] rounded-xl px-3 py-2 hover:bg-[var(--surface-card)] transition-colors cursor-pointer">
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
            {paginated.map((app) => (
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
        <Pagination currentPage={loanPage} totalPages={totalPages} totalItems={filtered.length} itemsPerPage={itemsPerPage} onPageChange={setLoanPage} />
      </div>
    </div>
  );
}
