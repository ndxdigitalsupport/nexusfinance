import React, { useState, useEffect } from 'react';
import { ClipboardList, Clock, User, Shield, Info, FileText, Calendar, Mail } from 'lucide-react';
import Pagination from './Pagination';
import { showToast } from './Toast';
import Modal from './Modal';

import { apiFetch } from '../api';

export default function AuditLogView() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const itemsPerPage = 15;

  const fetchLogs = async () => {
    try { setLogs(await apiFetch('/audit/logs')); }
    catch { showToast('Failed to load audit logs', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLogs(); }, []);

  const totalPages = Math.ceil(logs.length / itemsPerPage) || 1;
  const paginated = logs.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const actionLabel = (action: string) => {
    const map: Record<string, string> = {
      'loan-approved': 'Loan Approved', 'loan-rejected': 'Loan Rejected', 'loan-held': 'Loan Held',
      'role-changed': 'Role Changed', 'config-updated': 'Config Updated',
      'reminder-setting-created': 'Reminder Created', 'reminder-setting-updated': 'Reminder Updated',
      'reminder-setting-deleted': 'Reminder Deleted', 'broadcast-sent': 'Broadcast Sent',
      'webhook-registered': 'Webhook Registered', 'password-reset-link': 'Reset Link Sent',
      'document-uploaded': 'Document Uploaded', 'payment-approved': 'Payment Approved',
      'otp-sent': 'OTP Sent', 'otp-verified': 'OTP Verified', 'login': 'User Login'
    };
    return map[action] || action;
  };

  const actionColor = (action: string) => {
    if (action.includes('approved') || action.includes('verified')) return 'bg-emerald-500/10 text-emerald-600';
    if (action.includes('rejected') || action.includes('deleted')) return 'bg-red-500/10 text-red-600';
    if (action.includes('held')) return 'bg-amber-500/10 text-amber-600';
    if (action.includes('role') || action.includes('config') || action.includes('webhook')) return 'bg-blue-500/10 text-blue-600';
    if (action.includes('broadcast') || action.includes('sent') || action.includes('reminder') || action.includes('link')) return 'bg-indigo-500/10 text-indigo-600';
    return 'bg-gray-500/10 text-gray-600';
  };

  if (loading) return <div className="p-12 text-center text-[var(--text-secondary)] font-medium">Loading audit logs...</div>;

  return (
    <div className="animate-in fade-in duration-200">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-[28px] font-extrabold text-[var(--text-primary)]">Audit Log</h2>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1">Real-time ledger audit trail of platform events, configuration changes, and actions.</p>
        </div>
      </div>

      <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl overflow-hidden shadow-sm">
        {logs.length === 0 ? (
          <div className="p-16 text-center">
            <ClipboardList className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <p className="text-[var(--text-secondary)] font-semibold text-[15px]">No audit logs yet</p>
            <p className="text-[var(--text-tertiary)] text-[13px] mt-1">Actions like loan approvals and role changes will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--surface-secondary)] text-[11px] uppercase tracking-wider text-[var(--text-secondary)] font-bold border-b border-[var(--border-primary)]">
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Details</th>
                  <th className="px-6 py-4">By</th>
                  <th className="px-6 py-4">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-secondary)]">
                {paginated.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="text-[13px] font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]/50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${actionColor(log.action)}`}>
                        {actionLabel(log.action)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[var(--text-secondary)] text-[13px] font-medium max-w-md truncate">
                      {formatAuditDetails(log.details)}
                    </td>
                    <td className="px-6 py-4 text-[var(--text-secondary)] font-mono whitespace-nowrap">{log.userEmail}</td>
                    <td className="px-6 py-4 text-[var(--text-tertiary)] text-[12px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString(undefined, { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} totalItems={logs.length} itemsPerPage={itemsPerPage} onPageChange={setPage} />

      {/* Audit Log Detail Modal */}
      {selectedLog && (
        <Modal
          isOpen={selectedLog !== null}
          onClose={() => setSelectedLog(null)}
          maxWidth="max-w-2xl"
        >
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-[var(--border-primary)]">
              <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-[var(--accent)]" /> Audit Log Entry
              </h3>
            </div>

            <div className="space-y-6">
              {/* Event Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border-primary)] flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--surface-primary)] flex items-center justify-center shrink-0 border border-[var(--border-secondary)]">
                    <Shield className="w-4 h-4 text-[var(--text-secondary)]" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] block tracking-wider leading-none">Event Action</span>
                    <span className={`px-2 py-0.5 mt-1.5 inline-block rounded-full text-[9px] font-extrabold uppercase tracking-wider ${actionColor(selectedLog.action)}`}>
                      {actionLabel(selectedLog.action)}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border-primary)] flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--surface-primary)] flex items-center justify-center shrink-0 border border-[var(--border-secondary)]">
                    <Calendar className="w-4 h-4 text-[var(--text-secondary)]" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] block tracking-wider leading-none">Timestamp</span>
                    <span className="text-[13px] text-[var(--text-primary)] font-bold mt-1.5 block font-mono">
                      {new Date(selectedLog.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'medium' })}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border-primary)] flex items-start gap-3 sm:col-span-2">
                  <div className="w-8 h-8 rounded-lg bg-[var(--surface-primary)] flex items-center justify-center shrink-0 border border-[var(--border-secondary)]">
                    <Mail className="w-4 h-4 text-[var(--text-secondary)]" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] block tracking-wider leading-none">Triggered By</span>
                    <span className="text-[13px] text-[var(--text-primary)] font-bold mt-1.5 block font-mono">
                      {selectedLog.userEmail} {selectedLog.userId && `(User ID: ${selectedLog.userId})`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detailed Description Block */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider ml-1 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-[var(--accent)]" /> Detailed Description
                </span>
                {parseAuditExplanation(selectedLog)}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[var(--border-primary)]">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 text-[13px] font-bold bg-[var(--surface-secondary)] text-[var(--text-primary)] rounded-xl border border-[var(--border-primary)] hover:bg-[var(--surface-tertiary)] transition-colors cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function formatAuditDetails(details: string): string {
  if (details.startsWith('Platform config updated:')) {
    try {
      const jsonStr = details.replace('Platform config updated:', '').trim();
      const configObj = JSON.parse(jsonStr);
      const parts: string[] = [];
      if (configObj.baseInterestRate !== undefined) parts.push(`APR: ${configObj.baseInterestRate}%`);
      if (configObj.autoApproveLimit !== undefined) parts.push(`Auto-Approve Limit: $${configObj.autoApproveLimit.toLocaleString()}`);
      if (configObj.kycRequired !== undefined) parts.push(`KYC: ${configObj.kycRequired ? 'Mandatory' : 'Optional'}`);
      if (configObj.reminder_time !== undefined) parts.push(`Sweep Time: ${configObj.reminder_time}`);
      if (configObj.telegram_admin_id !== undefined) parts.push(`Telegram Admin: ${configObj.telegram_admin_id || 'None'}`);
      if (configObj.enable_admin_reports !== undefined) parts.push(`Reports: ${configObj.enable_admin_reports ? 'On' : 'Off'}`);
      return `Updated Platform Config (${parts.join(', ')})`;
    } catch {
      return details;
    }
  }
  return details;
}

function parseAuditExplanation(log: any) {
  const { action, details } = log;
  
  if (action === 'config-updated' || details.startsWith('Platform config updated:')) {
    try {
      const jsonStr = details.replace('Platform config updated:', '').trim();
      const configObj = JSON.parse(jsonStr);
      return (
        <div className="space-y-3">
          <p className="text-[13px] text-[var(--text-secondary)] font-medium">The system configuration parameters were updated with the following values:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border-primary)]">
            {configObj.baseInterestRate !== undefined && (
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] block tracking-wider">Interest Rate (APR)</span>
                <span className="text-[14px] text-[var(--accent)] font-extrabold font-mono">{configObj.baseInterestRate}%</span>
              </div>
            )}
            {configObj.autoApproveLimit !== undefined && (
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] block tracking-wider">Auto-Approve Limit</span>
                <span className="text-[14px] text-[var(--text-primary)] font-extrabold font-mono">${configObj.autoApproveLimit.toLocaleString()}</span>
              </div>
            )}
            {configObj.maxLoanAmount !== undefined && (
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] block tracking-wider">Max Loan Amount</span>
                <span className="text-[14px] text-[var(--text-primary)] font-extrabold font-mono">${configObj.maxLoanAmount.toLocaleString()}</span>
              </div>
            )}
            {configObj.kycRequired !== undefined && (
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] block tracking-wider">Video KYC Requirement</span>
                <span className={`text-[13px] font-bold ${configObj.kycRequired ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {configObj.kycRequired ? 'Mandatory' : 'Optional'}
                </span>
              </div>
            )}
            {configObj.reminder_time !== undefined && (
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] block tracking-wider">Sweep Schedule Time</span>
                <span className="text-[13px] text-[var(--text-primary)] font-bold font-mono">{configObj.reminder_time}</span>
              </div>
            )}
            {configObj.telegram_admin_id !== undefined && (
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] block tracking-wider">Telegram Admin ID</span>
                <span className="text-[13px] text-[var(--text-primary)] font-bold font-mono">{configObj.telegram_admin_id || 'None'}</span>
              </div>
            )}
            {configObj.enable_admin_reports !== undefined && (
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] block tracking-wider">Admin Status Reports</span>
                <span className="text-[13px] text-[var(--text-primary)] font-bold">{configObj.enable_admin_reports ? 'Enabled' : 'Disabled'}</span>
              </div>
            )}
          </div>
        </div>
      );
    } catch {
      return <p className="text-[13px] text-[var(--text-secondary)] font-medium leading-relaxed">{details}</p>;
    }
  }

  if (action === 'reminder-setting-updated' || details.includes('Updated reminder ID')) {
    try {
      const match = details.match(/Updated reminder ID \d+:\s*(.*)/);
      if (match) {
        const configObj = JSON.parse(match[1]);
        return (
          <div className="space-y-3">
            <p className="text-[13px] text-[var(--text-secondary)] font-medium">A repayment notification reminder was updated:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border-primary)]">
              {configObj.name !== undefined && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] block tracking-wider">Reminder Name</span>
                  <span className="text-[13px] text-[var(--text-primary)] font-bold">{configObj.name}</span>
                </div>
              )}
              {configObj.days_before !== undefined && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] block tracking-wider">Days Before Due Date</span>
                  <span className="text-[14px] text-[var(--text-primary)] font-extrabold font-mono">{configObj.days_before} days</span>
                </div>
              )}
              {configObj.message_template !== undefined && (
                <div className="md:col-span-2">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] block tracking-wider">Message Template</span>
                  <span className="text-[13px] text-[var(--text-secondary)] font-medium mt-1.5 block leading-relaxed p-3 bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl font-mono">
                    {configObj.message_template}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      }
    } catch {}
  }

  if (action === 'reminder-setting-created' || details.includes('Created reminder:')) {
    try {
      const match = details.match(/Created reminder:\s*(.*)/);
      if (match) {
        return (
          <div className="space-y-3">
            <p className="text-[13px] text-[var(--text-secondary)] font-medium">A new repayment notification reminder was created:</p>
            <div className="p-4 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border-primary)]">
              <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] block tracking-wider">Reminder Info</span>
              <span className="text-[13.5px] text-[var(--text-primary)] font-bold mt-1 block">{match[1]}</span>
            </div>
          </div>
        );
      }
    } catch {}
  }

  // Fallback for normal text details
  return (
    <div className="p-4 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border-primary)] flex items-start gap-2.5">
      <FileText className="w-5 h-5 text-[var(--accent)] shrink-0 mt-0.5" />
      <p className="text-[13.5px] text-[var(--text-primary)] font-bold leading-relaxed">{details}</p>
    </div>
  );
}
