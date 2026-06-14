import React, { useState } from 'react';
import { CheckSquare, Square, Check, X, Pause } from 'lucide-react';
import { LoanApplication } from '../types';
import { API } from '../api';
import Heading from './Heading';
import EmptyState from './EmptyState';

interface LoanManagementProps {
  applications: LoanApplication[];
  onRefresh: () => void;
}

export default function LoanManagement({ applications, onRefresh }: LoanManagementProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [processing, setProcessing] = useState(false);

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === applications.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(applications.map(a => a.id)));
    }
  };

  const batchAction = async (action: 'approve' | 'reject' | 'hold') => {
    setProcessing(true);
    const token = localStorage.getItem('nexus_token');
    for (const id of selected) {
      try {
        await fetch(`${API}/loans/${id}/${action}`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
      } catch {}
    }
    setSelected(new Set());
    setProcessing(false);
    onRefresh();
  };

  const statusColor = (s: string) => {
    switch (s) {
      case 'Approved': return 'var(--success-text)';
      case 'Rejected': return 'var(--error-text)';
      case 'Hold': return 'var(--warning-text)';
      default: return 'var(--info-text)';
    }
  };
  const statusBg = (s: string) => {
    switch (s) {
      case 'Approved': return 'var(--success-bg)';
      case 'Rejected': return 'var(--error-bg)';
      case 'Hold': return 'var(--warning-bg)';
      default: return 'var(--info-bg)';
    }
  };

  return (
    <div className="animate-content-enter">
      <Heading>Loan Management</Heading>
      <p className="text-[13px] text-[var(--text-secondary)] mt-1 mb-6">Batch approve, reject, or hold loan applications.</p>

      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-[var(--surface-secondary)] border border-[var(--border-primary)] rounded-xl">
          <span className="text-[13px] font-bold text-[var(--text-primary)]">{selected.size} selected</span>
          <button onClick={() => batchAction('approve')} disabled={processing} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-600 text-[12px] font-bold rounded-lg hover:bg-emerald-500/30 transition-colors cursor-pointer disabled:opacity-50">
            <Check className="w-3.5 h-3.5" /> Approve
          </button>
          <button onClick={() => batchAction('reject')} disabled={processing} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 text-red-600 text-[12px] font-bold rounded-lg hover:bg-red-500/30 transition-colors cursor-pointer disabled:opacity-50">
            <X className="w-3.5 h-3.5" /> Reject
          </button>
          <button onClick={() => batchAction('hold')} disabled={processing} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 text-amber-600 text-[12px] font-bold rounded-lg hover:bg-amber-500/30 transition-colors cursor-pointer disabled:opacity-50">
            <Pause className="w-3.5 h-3.5" /> Hold
          </button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-[12px] text-[var(--text-secondary)] hover:underline cursor-pointer">Clear</button>
        </div>
      )}

      <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl overflow-x-auto">
        {applications.length === 0 ? (
          <EmptyState icon={CheckSquare} title="No loan applications" description="Applications will appear here once customers apply." />
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--surface-secondary)] text-[11px] uppercase tracking-wider text-[var(--text-secondary)] font-bold sticky top-0">
                <th className="px-4 py-3.5 w-10">
                  <button onClick={toggleAll} className="cursor-pointer">
                    {selected.size === applications.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  </button>
                </th>
                <th className="px-4 py-3.5">ID</th>
                <th className="px-4 py-3.5">Applicant</th>
                <th className="px-4 py-3.5">Amount</th>
                <th className="px-4 py-3.5">Type</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-primary)]">
              {applications.map((app) => (
                <tr key={app.id} className={`text-[14px] font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]/70 transition-colors ${selected.has(app.id) ? 'bg-[var(--accent)]/5' : ''}`}>
                  <td className="px-4 py-3.5">
                    <button onClick={() => toggle(app.id)} className="cursor-pointer">
                      {selected.has(app.id) ? <CheckSquare className="w-4 h-4 text-[var(--accent)]" /> : <Square className="w-4 h-4 text-[var(--text-tertiary)]" />}
                    </button>
                  </td>
                  <td className="px-4 py-3.5 text-[var(--text-secondary)]">{app.id}</td>
                  <td className="px-4 py-3.5">{app.applicantName}</td>
                  <td className="px-4 py-3.5">${app.amount.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-[var(--text-secondary)]">{app.type}</td>
                  <td className="px-4 py-3.5">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold" style={{ backgroundColor: statusBg(app.status), color: statusColor(app.status) }}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-[var(--text-secondary)]">{app.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
