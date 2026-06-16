import React, { useState, useEffect } from 'react';
import { Webhook, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { apiFetch } from '../api';
import Heading from './Heading';
import EmptyState from './EmptyState';

const AVAILABLE_EVENTS = [
  { value: 'loan.created', label: 'Loan Created' },
  { value: 'loan.approved', label: 'Loan Approved' },
  { value: 'loan.rejected', label: 'Loan Rejected' },
  { value: 'user.registered', label: 'User Registered' },
];

interface WebhookReg {
  id: number;
  url: string;
  events: string[];
  active: boolean;
  createdAt: string;
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookReg[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [url, setUrl] = useState('');
  const [events, setEvents] = useState<string[]>(['loan.created']);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const load = async () => {
    const data = await apiFetch('/webhooks').catch(() => []);
    setWebhooks(data);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!url || !events.length) return;
    setMessage(null);
    try {
      await apiFetch('/webhooks/register', {
        method: 'POST',
        body: JSON.stringify({ url, events }),
      });
      setUrl(''); setEvents(['loan.created']); setShowForm(false);
      setMessage({ text: 'Webhook registered successfully.' });
      load();
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to register webhook.', error: true });
    }
  };

  const handleDelete = async (id: number) => {
    await apiFetch(`/webhooks/${id}`, { method: 'DELETE' }).catch(() => {});
    load();
  };

  return (
    <div className="animate-content-enter">
      <Heading>Webhooks</Heading>
      <p className="text-[13px] text-[var(--text-secondary)] mt-1 mb-6">Register webhook URLs to receive real-time events from the platform.</p>

      {message && (
        <div className={`flex items-center gap-2 mb-4 p-3 rounded-xl text-[13px] font-semibold ${message.error ? 'bg-[var(--error-bg)] text-[var(--error-text)]' : 'bg-emerald-500/10 text-emerald-600'}`}>
          {message.error ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle className="w-4 h-4 shrink-0" />}
          {message.text}
        </div>
      )}

      <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] text-[var(--text-primary)] font-bold text-[13px] rounded-xl cursor-pointer hover:brightness-110 transition-all mb-6">
        <Plus className="w-4 h-4" /> {showForm ? 'Cancel' : 'New Webhook'}
      </button>

      {showForm && (
        <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl p-6 mb-6 space-y-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] block mb-1.5">Webhook URL</label>
            <input value={url} onChange={e => setUrl(e.target.value)} placeholder="Enter your webhook URL" className="w-full bg-[var(--surface-secondary)] border border-[var(--border-primary)] rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:border-[var(--accent)]" />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] block mb-1.5">Events</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_EVENTS.map(ev => (
                <button key={ev.value} onClick={() => setEvents(prev => prev.includes(ev.value) ? prev.filter(e => e !== ev.value) : [...prev, ev.value])} className={`px-3 py-1.5 text-[12px] font-bold rounded-lg border transition-colors cursor-pointer ${events.includes(ev.value) ? 'bg-[var(--accent)]/20 border-[var(--accent)] text-[var(--accent)]' : 'border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-[var(--text-tertiary)]'}`}>
                  {ev.label}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleAdd} className="px-4 py-2.5 bg-[var(--accent)] text-[var(--text-primary)] font-bold text-[13px] rounded-xl cursor-pointer hover:brightness-110 transition-all">Register Webhook</button>
        </div>
      )}

      <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl overflow-x-auto">
        {webhooks.length === 0 ? (
          <EmptyState icon={Webhook} title="No webhooks registered" description="Register a webhook URL above to receive events." />
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--surface-secondary)] text-[11px] uppercase tracking-wider text-[var(--text-secondary)] font-bold sticky top-0">
                <th className="px-5 py-3.5">URL</th>
                <th className="px-5 py-3.5">Events</th>
                <th className="px-5 py-3.5">Created</th>
                <th className="px-5 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-primary)]">
              {webhooks.map(wh => (
                <tr key={wh.id} className="text-[14px] font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]/70 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-[13px] max-w-[300px] truncate">{wh.url}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {wh.events.map(ev => (
                        <span key={ev} className="px-2 py-0.5 text-[10px] font-bold bg-[var(--info-bg)] text-[var(--info-text)] rounded-md">{ev}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[var(--text-secondary)]">{new Date(wh.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button onClick={() => handleDelete(wh.id)} className="p-1.5 text-[var(--error-text)] hover:bg-[var(--error-bg)] rounded-lg transition-colors cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
