import React, { useState, useEffect } from 'react';
import { Send, Megaphone, Users, RefreshCw, Eye, MessageSquare, AlertTriangle, User } from 'lucide-react';
import { apiFetch } from '../api';
import { showToast } from './Toast';
import Modal from './Modal';
import { SkeletonTable } from './Skeleton';
import Pagination from './Pagination';

interface BroadcastRecord {
  id: number;
  message: string;
  channel: 'telegram' | 'in_app' | 'both';
  target: string;
  sent_count: number;
  failed_count: number;
  created_at: string;
  sender?: {
    name: string;
    email: string;
  };
}

export default function BroadcastView() {
  const [broadcasts, setBroadcasts] = useState<BroadcastRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);

  // Form states
  const [message, setMessage] = useState('');
  const [channel, setChannel] = useState<'telegram' | 'in_app' | 'both'>('both');
  const [target, setTarget] = useState('all');
  const [sending, setSending] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchBroadcasts = async () => {
    try {
      const data = await apiFetch('/broadcasts');
      setBroadcasts(data);
    } catch {
      showToast('Failed to load broadcast history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const handleSendClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      return showToast('Please enter a message to broadcast', 'error');
    }
    setShowConfirm(true);
  };

  const handleConfirmSend = async () => {
    setSending(true);
    try {
      await apiFetch('/broadcasts', {
        method: 'POST',
        body: JSON.stringify({ message, channel, target })
      });
      showToast('Broadcast sent successfully!', 'success');
      setMessage('');
      setShowConfirm(false);
      await fetchBroadcasts();
    } catch (e: any) {
      showToast(e.message || 'Failed to dispatch broadcast alert', 'error');
    } finally {
      setSending(false);
    }
  };

  const formatTarget = (t: string) => {
    if (t === 'all') return 'All Users';
    if (t === 'linked') return 'Telegram Linked';
    if (t.startsWith('role:')) {
      const role = t.split(':')[1];
      return `${role.charAt(0).toUpperCase() + role.slice(1)}s`;
    }
    return t;
  };

  if (loading) return <div className="animate-in fade-in duration-200"><SkeletonTable rows={6} /></div>;

  const totalPages = Math.ceil(broadcasts.length / itemsPerPage) || 1;
  const paginatedBroadcasts = broadcasts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-[28px] font-extrabold text-[var(--text-primary)]">Broadcast Desk</h2>
        <p className="text-[13.5px] text-[var(--text-secondary)]">Send real-time alerts and bulk messages to platform users.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Compose Form */}
        <form onSubmit={handleSendClick} className="lg:col-span-5 bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl p-6 space-y-5">
          <h3 className="text-[18px] font-sans font-bold text-[var(--text-primary)] border-b pb-2 flex items-center gap-2 select-none">
            <Megaphone className="w-5 h-5 text-[var(--text-primary)]" /> Compose Broadcast
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-[12.5px] font-bold text-[var(--text-primary)] mb-1">Target Audience</label>
              <select
                value={target}
                onChange={e => setTarget(e.target.value)}
                className="w-full bg-[var(--surface-secondary)] border border-[var(--border-primary)] p-3 rounded-lg text-[14px] focus:outline-none focus:border-[var(--accent)]"
              >
                <option value="all">All Registered Users</option>
                <option value="linked">Telegram Linked Users Only</option>
                <option value="role:customer">Customers Only</option>
                <option value="role:loan-officer">Loan Officers Only</option>
              </select>
            </div>

            <div>
              <label className="block text-[12.5px] font-bold text-[var(--text-primary)] mb-1">Alert Channel</label>
              <select
                value={channel}
                onChange={e => setChannel(e.target.value as any)}
                className="w-full bg-[var(--surface-secondary)] border border-[var(--border-primary)] p-3 rounded-lg text-[14px] focus:outline-none focus:border-[var(--accent)]"
              >
                <option value="both">Telegram & In-App Alerts</option>
                <option value="telegram">Telegram Direct Messages Only</option>
                <option value="in_app">In-App Notification Feed Only</option>
              </select>
            </div>

            <div>
              <label className="block text-[12.5px] font-bold text-[var(--text-primary)] mb-1">Message Body</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={6}
                placeholder="Type your message here... (Markdown supported for Telegram)"
                className="w-full bg-[var(--surface-secondary)] border border-[var(--border-primary)] p-3 rounded-lg text-[13.5px] font-mono focus:outline-none focus:border-[var(--accent)]"
              />
            </div>

            {/* Character warning helper */}
            <div className="flex justify-between items-center text-[11px] text-[var(--text-tertiary)]">
              <span>{message.length} characters</span>
              <span>Use standard markdown formatting for links and bolding</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 premium-btn-primary rounded-lg text-[13.5px] font-bold flex items-center justify-center gap-2 cursor-pointer transition select-none"
          >
            <Send className="w-4 h-4" /> Dispatch Broadcast Alert
          </button>
        </form>

        {/* History Ledger Table */}
        <div className="lg:col-span-7 bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-2 select-none">
            <h3 className="text-[16px] font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[var(--text-primary)]" /> Broadcast Logs & History
            </h3>
            <button
              onClick={fetchBroadcasts}
              className="p-1.5 rounded-lg border border-[var(--border-primary)] hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] transition cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className="w-4.5 h-4.5" />
            </button>
          </div>

          <div className="divide-y divide-[var(--border-primary)] space-y-1 text-[13.5px] max-h-[460px] overflow-y-auto pr-1">
            {broadcasts.length === 0 ? (
              <p className="text-[var(--text-tertiary)] text-[13px] py-8 text-center bg-[var(--surface-secondary)]/10 rounded-xl">No broadcast history found.</p>
            ) : (
              paginatedBroadcasts.map((b) => (
                <div key={b.id} className="py-4 space-y-2">
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-[var(--text-primary)] font-extrabold block whitespace-pre-wrap flex-1">{b.message}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded font-bold shrink-0 bg-[var(--surface-tertiary)] text-[var(--text-secondary)] select-none">
                      {formatTarget(b.target)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[var(--text-tertiary)] select-none">
                    <div className="flex items-center gap-3">
                      <span>Via: <strong className="uppercase text-[10px]">{b.channel}</strong></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--border-primary)]"></span>
                      <span className="text-emerald-500 font-bold">✓ {b.sent_count} sent</span>
                      {b.failed_count > 0 && (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--border-primary)]"></span>
                          <span className="text-rose-400 font-bold">✗ {b.failed_count} failed</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-[var(--text-secondary)]">By {b.sender?.name || 'Admin'}</span>
                      <span className="text-gray-500">({new Date(b.created_at).toLocaleString()})</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="pt-2 border-t border-[var(--border-primary)]">
              <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={broadcasts.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
            </div>
          )}
        </div>

      </div>

      {/* Confirmation Dialog Modal */}
      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)}>
        <div className="space-y-4 p-2 max-w-md font-sans">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 shrink-0 select-none">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-[18px] font-extrabold text-[var(--text-primary)]">Confirm Broadcast Dispatch</h3>
              <p className="text-[13.5px] text-[var(--text-secondary)] mt-1">
                You are about to broadcast this alert to all users matching the selection criteria. This operation cannot be undone.
              </p>
            </div>
          </div>

          <div className="bg-[var(--surface-secondary)] border border-[var(--border-primary)] p-4 rounded-xl space-y-2 select-none">
            <div className="flex justify-between text-[13px]">
              <span className="text-[var(--text-secondary)]">Target:</span>
              <strong className="text-[var(--text-primary)] font-extrabold uppercase">{formatTarget(target)}</strong>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-[var(--text-secondary)]">Channels:</span>
              <strong className="text-[var(--text-primary)] font-extrabold uppercase">{channel}</strong>
            </div>
            <div className="border-t border-[var(--border-primary)] pt-2 mt-2">
              <span className="text-[11px] uppercase tracking-wider font-bold text-[var(--text-tertiary)] block mb-1">Message Sample</span>
              <div className="bg-[var(--surface-card)] p-3 rounded-lg text-[13.5px] font-mono text-[var(--text-primary)] border border-[var(--border-primary)] max-h-32 overflow-y-auto">
                {message}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              onClick={() => setShowConfirm(false)}
              className="px-4 py-2 border border-[var(--border-primary)] hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] font-bold text-[13.5px] rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmSend}
              disabled={sending}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[13.5px] rounded-lg cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {sending ? 'Sending...' : 'Confirm & Dispatch'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
