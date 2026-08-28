import React, { useState, useEffect } from 'react';
import { ClipboardList, Clock, Shield, Info, Calendar, Mail } from 'lucide-react';
import Pagination from './Pagination';
import { showToast } from './Toast';
import Modal from './Modal';
import { apiFetch } from '../api';
import { useCurrency } from '../context/CurrencyContext';

export default function AuditLogView() {
  const { t } = useCurrency();
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
      'loan-approved': t('loan_approved'), 
      'loan-rejected': t('loan_rejected'), 
      'loan-held': t('loan_held'),
      'role-changed': t('role_changed'), 
      'config-updated': t('config_updated'),
      'reminder-setting-created': t('reminder_created'), 
      'reminder-setting-updated': t('reminder_updated'),
      'reminder-setting-deleted': t('reminder_deleted'), 
      'broadcast-sent': t('broadcast_sent'),
      'webhook-registered': t('webhook_registered'), 
      'password-reset-link': t('reset_link_sent'),
      'document-uploaded': t('document_uploaded'), 
      'payment-approved': t('payment_approved'),
      'otp-sent': t('otp_sent'), 
      'otp-verified': t('otp_verified'), 
      'login': t('user_login')
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
          <h2 className="text-[28px] font-extrabold text-[var(--text-primary)]">{t('audit_log')}</h2>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1">{t('audit_log_desc')}</p>
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
                  <th className="px-6 py-4">{t('action_header')}</th>
                  <th className="px-6 py-4">{t('details_header')}</th>
                  <th className="px-6 py-4">{t('by_header')}</th>
                  <th className="px-6 py-4">{t('time_header')}</th>
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
                className="px-4 py-2 text-[13px] font-bold bg-[var(--surface-secondary)] text-[var(--text-primary)] rounded-xl border border-[var(--border-primary)] hover:bg-[var(--surface-tertiary)] transition-colors cursor-pointer bg-[var(--surface-secondary)]"
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

      const formatVal = (item: any, formatter: (val: any) => string) => {
        if (item === undefined || item === null) return '';
        if (typeof item === 'object' && 'from' in item && 'to' in item) {
          if (item.from === item.to) return formatter(item.to);
          return `${formatter(item.from)} ➔ ${formatter(item.to)}`;
        }
        return formatter(item);
      };

      if (configObj.baseInterestRate !== undefined) {
        const valStr = formatVal(configObj.baseInterestRate, (v) => `${v}%`);
        if (valStr) parts.push(`APR: ${valStr}`);
      }
      if (configObj.autoApproveLimit !== undefined) {
        const valStr = formatVal(configObj.autoApproveLimit, (v) => `$${Number(v).toLocaleString()}`);
        if (valStr) parts.push(`Auto-Approve Limit: ${valStr}`);
      }
      if (configObj.kycRequired !== undefined) {
        const valStr = formatVal(configObj.kycRequired, (v) => v ? 'Mandatory' : 'Optional');
        if (valStr) parts.push(`KYC: ${valStr}`);
      }
      if (configObj.emailVerificationRequired !== undefined) {
        const valStr = formatVal(configObj.emailVerificationRequired, (v) => v ? 'Enabled' : 'Disabled');
        if (valStr) parts.push(`Email Verification: ${valStr}`);
      }
      if (configObj.reminder_time !== undefined) {
        const valStr = formatVal(configObj.reminder_time, (v) => String(v));
        if (valStr) parts.push(`Sweep Time: ${valStr}`);
      }
      if (configObj.telegram_admin_id !== undefined) {
        const valStr = formatVal(configObj.telegram_admin_id, (v) => v ? String(v) : 'None');
        if (valStr) parts.push(`Telegram Admin: ${valStr}`);
      }
      if (configObj.enable_admin_reports !== undefined) {
        const valStr = formatVal(configObj.enable_admin_reports, (v) => v ? 'On' : 'Off');
        if (valStr) parts.push(`Reports: ${valStr}`);
      }
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

      const renderVal = (propKey: string, formatter: (val: any) => string | React.ReactNode) => {
        const item = configObj[propKey];
        if (item === undefined) return null;
        if (item && typeof item === 'object' && 'from' in item && 'to' in item) {
          if (item.from === item.to) return <span className="font-mono text-[var(--text-primary)] font-extrabold">{formatter(item.to)}</span>;
          return (
            <span className="flex items-center gap-1.5 font-mono">
              <span className="text-[var(--text-tertiary)] line-through">{formatter(item.from)}</span>
              <span className="text-[var(--text-tertiary)] text-[10px]">➔</span>
              <span className="text-[var(--accent)] font-extrabold">{formatter(item.to)}</span>
            </span>
          );
        }
        return <span className="font-mono text-[var(--text-primary)] font-extrabold">{formatter(item)}</span>;
      };

      return (
        <div className="space-y-3">
          <p className="text-[13px] text-[var(--text-secondary)] font-medium">The system configuration parameters were updated with the following values:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border-primary)]">
            {configObj.baseInterestRate !== undefined && (
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] block tracking-wider">Interest Rate (APR)</span>
                {renderVal('baseInterestRate', (v) => `${v}%`)}
              </div>
            )}
            {configObj.autoApproveLimit !== undefined && (
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] block tracking-wider">Auto-Approve Limit</span>
                {renderVal('autoApproveLimit', (v) => `$${Number(v).toLocaleString()}`)}
              </div>
            )}
            {configObj.maxLoanAmount !== undefined && (
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] block tracking-wider">Max Loan Amount</span>
                {renderVal('maxLoanAmount', (v) => `$${Number(v).toLocaleString()}`)}
              </div>
            )}
            {configObj.kycRequired !== undefined && (
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] block tracking-wider">Video KYC Requirement</span>
                {renderVal('kycRequired', (v) => v ? 'Mandatory' : 'Optional')}
              </div>
            )}
            {configObj.emailVerificationRequired !== undefined && (
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] block tracking-wider">Email Verification</span>
                {renderVal('emailVerificationRequired', (v) => v ? 'Enabled' : 'Disabled')}
              </div>
            )}
            {configObj.reminder_time !== undefined && (
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] block tracking-wider">Sweep Schedule Time</span>
                {renderVal('reminder_time', (v) => String(v))}
              </div>
            )}
            {configObj.telegram_admin_id !== undefined && (
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] block tracking-wider">Telegram Admin ID</span>
                {renderVal('telegram_admin_id', (v) => v ? String(v) : 'None')}
              </div>
            )}
            {configObj.enable_admin_reports !== undefined && (
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] block tracking-wider">Admin Status Reports</span>
                {renderVal('enable_admin_reports', (v) => v ? 'Enabled' : 'Disabled')}
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

        const renderVal = (propKey: string, formatter: (val: any) => string | React.ReactNode) => {
          const item = configObj[propKey];
          if (item === undefined) return null;
          if (item && typeof item === 'object' && 'from' in item && 'to' in item) {
            if (item.from === item.to) return <span className="font-mono text-[var(--text-primary)] font-bold">{formatter(item.to)}</span>;
            return (
              <span className="flex items-center gap-1.5 font-mono">
                <span className="text-[var(--text-tertiary)] line-through">{formatter(item.from)}</span>
                <span className="text-[var(--text-tertiary)] text-[10px]">➔</span>
                <span className="text-[var(--accent)] font-bold">{formatter(item.to)}</span>
              </span>
            );
          }
          return <span className="font-mono text-[var(--text-primary)] font-bold">{formatter(item)}</span>;
        };

        return (
          <div className="space-y-3">
            <p className="text-[13px] text-[var(--text-secondary)] font-medium">A repayment notification reminder was updated:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border-primary)]">
              {configObj.name !== undefined && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] block tracking-wider">Reminder Name</span>
                  {renderVal('name', (v) => String(v))}
                </div>
              )}
              {configObj.days_before !== undefined && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] block tracking-wider">Days Before Due Date</span>
                  {renderVal('days_before', (v) => `${v} days`)}
                </div>
              )}
              {configObj.message_template !== undefined && (
                <div className="md:col-span-2">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] block tracking-wider">Message Template</span>
                  <div className="mt-1.5 p-3 bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl font-mono text-[13px] text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">
                    {renderVal('message_template', (v) => String(v))}
                  </div>
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
      <ClipboardList className="w-5 h-5 text-[var(--accent)] shrink-0 mt-0.5" />
      <p className="text-[13.5px] text-[var(--text-primary)] font-bold leading-relaxed">{details}</p>
    </div>
  );
}
