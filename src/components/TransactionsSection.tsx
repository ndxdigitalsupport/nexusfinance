import React from 'react';
import { History, Download } from 'lucide-react';
import { Transaction } from '../types';
import { downloadCSV } from '../utils';
import { useCurrency } from '../context/CurrencyContext';
import Heading from './Heading';
import EmptyState from './EmptyState';
import Pagination from './Pagination';

interface Props { transactions: Transaction[]; txPage: number; setTxPage: (p: number) => void; }

export default function TransactionsSection({ transactions, txPage, setTxPage }: Props) {
  const { formatCurrency } = useCurrency();
  if (transactions.length === 0) return (
    <div className="animate-content-enter">
      <Heading>History Logs</Heading>
      <EmptyState icon={History} title="No transactions yet" description="Your financial activity will appear here once you make a transaction." />
    </div>
  );
  const itemsPerPage = 10;
  const totalPages = Math.ceil(transactions.length / itemsPerPage) || 1;
  const paginated = transactions.slice((txPage - 1) * itemsPerPage, txPage * itemsPerPage);
  return (
    <div className="animate-content-enter">
      <div className="flex items-center justify-between mb-2">
        <Heading>History Logs</Heading>
        <button onClick={() => downloadCSV(transactions, 'transaction_history.csv')} className="flex items-center gap-1.5 text-[12px] font-bold text-[var(--text-secondary)] bg-[var(--surface-secondary)] border border-[var(--border-primary)] rounded-xl px-3 py-2 hover:bg-[var(--surface-card)] transition-colors cursor-pointer">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>
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
            {paginated.map((tx) => (
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
        <Pagination currentPage={txPage} totalPages={totalPages} totalItems={transactions.length} itemsPerPage={itemsPerPage} onPageChange={setTxPage} />
      </div>
    </div>
  );
}
