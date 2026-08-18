import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Edit, Save, Bell, RefreshCw, X, Eye, HelpCircle } from 'lucide-react';
import { apiFetch } from '../api';
import { showToast } from './Toast';
import Modal from './Modal';
import { SkeletonTable } from './Skeleton';
import Pagination from './Pagination';

interface ReminderSetting {
  id: number;
  name: string;
  days_before: number;
  message_template: string;
  is_active: boolean;
  channel: 'telegram' | 'in_app' | 'both';
  created_at: string;
  updated_at: string;
}

export default function ReminderSettingsView() {
  const [settings, setSettings] = useState<ReminderSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [daysBefore, setDaysBefore] = useState(0);
  const [messageTemplate, setMessageTemplate] = useState('');
  const [channel, setChannel] = useState<'telegram' | 'in_app' | 'both'>('both');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [previewMode, setPreviewMode] = useState<'telegram' | 'in_app'>('telegram');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const insertVariable = (variable: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);

    const newValue = before + variable + after;
    setMessageTemplate(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + variable.length;
    }, 0);
  };

  const fetchSettings = async () => {
    try {
      const data = await apiFetch('/reminder-settings');
      setSettings(data);
    } catch {
      showToast('Failed to load reminder settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setName('');
    setDaysBefore(3);
    setMessageTemplate(`⏰ *Payment Reminder*

Loan #{loan_id} — {amount} installment
📅 Due: {due_date}
⏳ *{days_remaining} days remaining*

Please make your payment on time to avoid late fees.`);
    setChannel('both');
    setIsActive(true);
    setShowModal(true);
  };

  const openEditModal = (setting: ReminderSetting) => {
    setEditingId(setting.id);
    setName(setting.name);
    setDaysBefore(setting.days_before);
    setMessageTemplate(setting.message_template);
    setChannel(setting.channel);
    setIsActive(setting.is_active);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !messageTemplate.trim()) {
      return showToast('Name and template are required', 'error');
    }
    setSubmitting(true);
    try {
      const body = {
        name,
        days_before: Number(daysBefore),
        message_template: messageTemplate,
        channel,
        is_active: isActive,
      };

      if (editingId) {
        await apiFetch(`/reminder-settings/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        });
        showToast('Reminder rule updated successfully');
      } else {
        await apiFetch('/reminder-settings', {
          method: 'POST',
          body: JSON.stringify(body),
        });
        showToast('Reminder rule created successfully');
      }
      setShowModal(false);
      await fetchSettings();
    } catch (e: any) {
      showToast(e.message || 'Failed to save reminder rule', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this reminder rule?')) return;
    try {
      await apiFetch(`/reminder-settings/${id}`, { method: 'DELETE' });
      showToast('Reminder rule deleted');
      await fetchSettings();
    } catch (e: any) {
      showToast(e.message || 'Failed to delete reminder rule', 'error');
    }
  };

  const toggleSettingActive = async (setting: ReminderSetting) => {
    try {
      await apiFetch(`/reminder-settings/${setting.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: !setting.is_active }),
      });
      showToast(`${setting.name} has been ${!setting.is_active ? 'enabled' : 'disabled'}`);
      await fetchSettings();
    } catch (e: any) {
      showToast(e.message || 'Failed to update rule status', 'error');
    }
  };

  // Preview renderer helper
  const renderPreview = (template: string) => {
    const vars = {
      loan_id: '77281',
      amount: '$1,250',
      due_date: 'Aug 21, 2026',
      days_remaining: '3',
      days_overdue: '5',
      customer_name: 'Somchai V.'
    };
    let preview = template;
    Object.entries(vars).forEach(([key, val]) => {
      preview = preview.replace(new RegExp(`{${key}}`, 'g'), val);
    });
    return preview;
  };

  const parseMarkdownToHtml = (markdown: string) => {
    if (!markdown) return '';
    let html = markdown
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="font-mono bg-[var(--surface-secondary)] text-[var(--accent)] px-1 py-0.5 rounded">$1</code>');
    return html.split('\n').join('<br />');
  };

  if (loading) return <div className="animate-in fade-in duration-200"><SkeletonTable rows={6} /></div>;

  const totalPages = Math.ceil(settings.length / itemsPerPage) || 1;
  const paginatedSettings = settings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[28px] font-extrabold text-[var(--text-primary)]">Custom Reminders</h2>
          <p className="text-[13.5px] text-[var(--text-secondary)]">Configure scheduled push alerts and notifications for active loans.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchSettings}
            className="p-2.5 rounded-lg border border-[var(--border-primary)] hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] transition cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-[var(--sidebar-bg)] hover:brightness-110 text-white text-[13px] font-bold px-4 py-2.5 rounded-lg transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> Create Reminder Rule
          </button>
        </div>
      </div>

      <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-[13.5px] text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-primary)] bg-[var(--surface-secondary)]/50 select-none">
                <th className="px-6 py-4 font-bold text-[var(--text-primary)]">Rule Name</th>
                <th className="px-6 py-4 font-bold text-[var(--text-primary)] text-center">Days Relative to Due</th>
                <th className="px-6 py-4 font-bold text-[var(--text-primary)]">Delivery Channels</th>
                <th className="px-6 py-4 font-bold text-[var(--text-primary)] text-center">Active Status</th>
                <th className="px-6 py-4 font-bold text-[var(--text-primary)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-primary)]">
              {paginatedSettings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-tertiary)] bg-[var(--surface-card)]">
                    No reminder rules configured yet. Click "Create Reminder Rule" to get started.
                  </td>
                </tr>
              ) : (
                paginatedSettings.map((setting) => (
                  <tr key={setting.id} className="hover:bg-[var(--surface-secondary)]/20 transition-colors">
                    <td className="px-6 py-4.5">
                      <span className="font-extrabold text-[var(--text-primary)] block">{setting.name}</span>
                      <span className="text-[11px] text-[var(--text-tertiary)] block truncate max-w-xs mt-0.5">{setting.message_template}</span>
                    </td>
                    <td className="px-6 py-4.5 text-center font-mono font-bold">
                      {setting.days_before > 0 ? (
                        <span className="text-emerald-500">+{setting.days_before} days</span>
                      ) : setting.days_before === 0 ? (
                        <span className="text-amber-500">Due Date</span>
                      ) : (
                        <span className="text-rose-500">{Math.abs(setting.days_before)} days overdue</span>
                      )}
                    </td>
                    <td className="px-6 py-4.5">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-[var(--surface-secondary)] text-[var(--text-secondary)] border border-[var(--border-primary)]">
                        {setting.channel === 'both' ? 'Telegram & In-App' : setting.channel === 'telegram' ? 'Telegram' : 'In-App Only'}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-center">
                      <button
                        onClick={() => toggleSettingActive(setting)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold cursor-pointer transition ${setting.is_active ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-[var(--surface-secondary)] text-[var(--text-tertiary)] border border-[var(--border-primary)]'}`}
                      >
                        <span className={`w-2 h-2 rounded-full ${setting.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></span>
                        {setting.is_active ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="px-6 py-4.5 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(setting)}
                        className="p-1.5 rounded-lg border border-[var(--border-primary)] hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer"
                        title="Edit Rule"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(setting.id)}
                        className="p-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 text-red-400 transition cursor-pointer"
                        title="Delete Rule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="p-4 border-t border-[var(--border-primary)] bg-[var(--surface-card)]">
            <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={settings.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} maxWidth="max-w-4xl">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 font-sans space-y-6">
          <div className="flex justify-between items-start border-b border-[var(--border-primary)] pb-4">
            <div>
              <h3 className="text-[22px] font-extrabold text-[var(--text-primary)]">
                {editingId ? 'Edit Reminder Rule' : 'Create Reminder Rule'}
              </h3>
              <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">Customize trigger conditions and notification templates dynamically.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left Column: Inputs */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <label className="block text-[12.5px] font-bold text-[var(--text-primary)] mb-1.5">Rule Name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. 3 Days Payment Warning"
                  className="w-full bg-[var(--surface-secondary)] border border-[var(--border-primary)] p-3 rounded-lg text-[14px] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12.5px] font-bold text-[var(--text-primary)] mb-1.5">Trigger (Days before due)</label>
                  <input
                    type="number"
                    value={daysBefore}
                    onChange={e => setDaysBefore(Number(e.target.value))}
                    placeholder="e.g. 3, 0 or -1"
                    className="w-full bg-[var(--surface-secondary)] border border-[var(--border-primary)] p-3 rounded-lg text-[14px] font-mono focus:outline-none focus:border-[var(--accent)]"
                  />
                  <span className="text-[10.5px] text-[var(--text-tertiary)] block mt-1">
                    0 for due date, negative numbers for overdue.
                  </span>
                </div>

                <div>
                  <label className="block text-[12.5px] font-bold text-[var(--text-primary)] mb-1.5">Delivery Channel</label>
                  <select
                    value={channel}
                    onChange={e => setChannel(e.target.value as any)}
                    className="w-full bg-[var(--surface-secondary)] border border-[var(--border-primary)] p-3 rounded-lg text-[14px] focus:outline-none focus:border-[var(--accent)]"
                  >
                    <option value="both">Telegram & In-App</option>
                    <option value="telegram">Telegram Only</option>
                    <option value="in_app">In-App Notification Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12.5px] font-bold text-[var(--text-primary)] mb-1.5 flex justify-between">
                  <span>Message Template</span>
                  <span className="text-[10.5px] text-[var(--accent)] flex items-center gap-0.5 cursor-help" title="Placeholders list: {loan_id}, {amount}, {due_date}, {days_remaining}, {days_overdue}, {customer_name}">
                    <HelpCircle className="w-3.5 h-3.5" /> Template Variables Helper
                  </span>
                </label>
                <textarea
                  ref={textareaRef}
                  value={messageTemplate}
                  onChange={e => setMessageTemplate(e.target.value)}
                  rows={5}
                  placeholder="Compose template here..."
                  className="w-full bg-[var(--surface-secondary)] border border-[var(--border-primary)] p-3 rounded-lg text-[13.5px] font-mono focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              {/* Clickable Variable badged list */}
              <div>
                <span className="block text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2 select-none">Click to Insert Variables</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { token: '{loan_id}', desc: 'Loan ID' },
                    { token: '{amount}', desc: 'Payment Amount' },
                    { token: '{due_date}', desc: 'Due Date' },
                    { token: '{days_remaining}', desc: 'Days Remaining' },
                    { token: '{days_overdue}', desc: 'Days Overdue' },
                    { token: '{customer_name}', desc: 'Client Name' }
                  ].map(v => (
                    <button
                      key={v.token}
                      type="button"
                      onClick={() => insertVariable(v.token)}
                      className="px-2.5 py-1.5 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border-primary)] hover:border-[var(--accent)] hover:bg-[var(--accent-muted)] text-[12px] font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition flex flex-col items-center"
                    >
                      <span className="font-extrabold text-[var(--accent)]">{v.token}</span>
                      <span className="text-[9px] text-[var(--text-tertiary)] mt-0.5 font-sans font-medium">{v.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 select-none pt-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                  className="w-4.5 h-4.5 text-[var(--accent)] focus:ring-[var(--accent)] border-[var(--border-primary)] rounded cursor-pointer"
                />
                <label htmlFor="is_active" className="text-[13px] font-bold text-[var(--text-primary)] cursor-pointer">
                  Enable this reminder rule immediately
                </label>
              </div>
            </div>

            {/* Right Column: Premium Live Preview */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex justify-between items-center border-b border-[var(--border-primary)] pb-2 select-none">
                <span className="text-[12.5px] font-bold text-[var(--text-primary)] uppercase tracking-wider">Live Preview</span>
                <div className="flex bg-[var(--surface-secondary)] border border-[var(--border-primary)] p-0.5 rounded-lg">
                  {['telegram', 'in_app'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPreviewMode(mode as any)}
                      className={`px-3 py-1 text-[11px] font-bold rounded-md capitalize cursor-pointer transition ${previewMode === mode ? 'bg-[var(--surface-card)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}`}
                    >
                      {mode.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {previewMode === 'telegram' ? (
                /* Telegram Chat Bubble Preview */
                <div className="rounded-xl overflow-hidden border border-[#2b3a4a] bg-[#17212b] p-4 flex flex-col justify-end min-h-[300px] font-sans relative">
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[#7f8c9a] text-[10px] bg-black/20 px-2 py-0.5 rounded-full uppercase tracking-wider select-none">
                    Today
                  </div>
                  
                  <div className="flex items-end gap-2.5">
                    {/* Bot Avatar */}
                    <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-[#011B2A] font-extrabold text-[12px] select-none shrink-0">
                      NF
                    </div>
                    
                    {/* Chat Bubble */}
                    <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-[#182533] border border-[#203040] p-3 text-[13px] text-[#f5f5f5] space-y-1 relative shadow-sm">
                      <span className="text-[12px] font-bold text-[var(--accent)] block leading-none select-none">NexusFinance Bot</span>
                      <div 
                        className="whitespace-pre-wrap break-words leading-relaxed text-[#e5edee] font-sans text-[13px]"
                        dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(renderPreview(messageTemplate)) }}
                      />
                      
                      <div className="pt-2">
                        <span className="w-full bg-[#24374d] hover:bg-[#2b425c] border border-[#3b5473] text-[var(--accent)] font-bold py-2 rounded-lg text-center flex items-center justify-center gap-1.5 cursor-default select-none pointer-events-none transition block">
                          🚀 Open NexusFinance
                        </span>
                      </div>

                      <div className="text-right text-[9px] text-[#7f8c9a] mt-1 select-none leading-none">
                        15:32 PM ✓✓
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* In-App Notification preview */
                <div className="rounded-xl border border-[var(--border-primary)] bg-[var(--surface-secondary)]/30 p-4 min-h-[300px] flex flex-col justify-start">
                  <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block mb-3 select-none">In-App Notification Banner</span>
                  
                  <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] p-4 rounded-xl shadow-xs flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center shrink-0 select-none">
                      <Bell className="w-4.5 h-4.5" />
                    </div>
                    
                    <div className="space-y-1 flex-1">
                      <div className="flex justify-between items-baseline select-none">
                        <span className="text-[12.5px] font-extrabold text-[var(--text-primary)]">System Alert</span>
                        <span className="text-[10px] text-[var(--text-tertiary)] font-medium">Just now</span>
                      </div>
                      <div 
                        className="text-[13px] text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed font-sans"
                        dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(renderPreview(messageTemplate)) }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-[var(--border-primary)]">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-5 py-2.5 rounded-lg border border-[var(--border-primary)] hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] font-bold text-[13.5px] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-lg bg-[var(--accent)] hover:brightness-110 text-[var(--text-primary)] font-bold text-[13.5px] cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Rule'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
