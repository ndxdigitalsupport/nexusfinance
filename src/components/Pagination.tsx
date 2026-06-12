import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }: PaginationProps) {
  const [gotoValue, setGotoValue] = useState('');
  if (totalPages <= 1) return null;
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);
  const handleGoto = (e: React.FormEvent) => {
    e.preventDefault();
    const page = parseInt(gotoValue, 10);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
      setGotoValue('');
    }
  };
  return (
    <div className="flex items-center justify-between px-6 py-3 border-t border-[var(--border-primary)] bg-[var(--surface-card)] rounded-b-2xl">
      <span className="text-[12px] text-[var(--text-tertiary)] font-medium">Showing {start}-{end} of {totalItems}</span>
      <div className="flex items-center gap-2">
        <form onSubmit={handleGoto} className="flex items-center gap-1.5 mr-1">
          <input
            type="number" min={1} max={totalPages} value={gotoValue}
            onChange={(e) => setGotoValue(e.target.value)}
            placeholder={`1-${totalPages}`}
            className="w-14 px-2 py-1 text-[11px] font-medium rounded-lg border text-center outline-none"
            style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
          />
        </form>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-[12px] font-bold text-[var(--text-primary)] px-2">Page {currentPage} of {totalPages}</span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
