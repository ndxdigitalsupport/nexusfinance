import React from 'react';

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyState?: React.ReactNode;
  onRowClick?: (item: T) => void;
}

export default function Table<T extends { id: string | number }>({ columns, data, loading, emptyState, onRowClick }: TableProps<T>) {
  if (loading) {
    return (
      <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl overflow-hidden">
        <div className="p-12 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-[var(--surface-tertiary)] rounded w-1/3 mx-auto" />
            <div className="h-4 bg-[var(--surface-tertiary)] rounded w-1/2 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return (
      <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl overflow-hidden">
        {emptyState}
      </div>
    );
  }

  return (
    <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-[var(--surface-secondary)] text-[11px] uppercase tracking-wider text-[var(--text-secondary)] font-bold sticky top-0">
            {columns.map((col) => (
              <th key={col.key} className={`px-5 py-3.5 ${col.headerClassName || ''}`}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-primary)]">
          {data.map((item) => (
            <tr
              key={item.id}
              onClick={() => onRowClick?.(item)}
              className={`text-[14px] font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]/70 transition-colors bg-[var(--surface-card)] ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {columns.map((col) => (
                <td key={col.key} className={`px-5 py-3.5 ${col.className || ''}`}>
                  {col.render ? col.render(item) : (item as any)[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
