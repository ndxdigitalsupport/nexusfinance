import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Edit, Bell, RefreshCw, HelpCircle, Clock } from 'lucide-react';
import { apiFetch } from '../api';
import { showToast } from './Toast';
import Modal from './Modal';
import { SkeletonTable } from './Skeleton';
import Pagination from './Pagination';
import { useCurrency } from '../context/CurrencyContext';

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

interface ReminderLog {
  id: number;
  loan_id: string;
  customer_name: string;
  rule_name: string;
  message: string;
  channel: string;
  status: 'success' | 'failed';
  error_message: string | null;
  created_at: string;
}

export default function ReminderSettingsView() {
  const { t } = useCurrency();
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

  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const selectRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsSelectOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [reminderTime, setReminderTime] = useState('07:00');
  const [savingTime, setSavingTime] = useState(false);
  const debounceTimerRef = React.useRef<any>(null);
  const lastSavedTimeRef = React.useRef<string>('07:00');
  const [logs, setLogs] = useState<ReminderLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logsPage, setLogsPage] = useState(1);
  const logsPerPage = 10;

  const insertVariable = (variable: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const newText = text.substring(0, start) + `{${variable}}` + text.substring(end);
    setMessageTemplate(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variable.length + 2, start + variable.length + 2);
    }, 0);
  };

  const fetchConfig = async () => {
    try {
      const config = await apiFetch('/config');
      if (config && config.reminder_time) {
        setReminderTime(config.reminder_time);
        lastSavedTimeRef.current = config.reminder_time;
      }
    } catch {}
  };

  const triggerSaveTime = async (valToSave: string) => {
    if (!valToSave || valToSave === lastSavedTimeRef.current) return;
    setSavingTime(true);
    try {
      await apiFetch('/config', {
        method: 'PATCH',
        body: JSON.stringify({ reminder_time: valToSave }),
      });
      lastSavedTimeRef.current = valToSave;
      showToast('Daily reminder sweep time updated', 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to update sweep time', 'error');
    } finally {
      setSavingTime(false);
    }
  };

  const handleTimeChange = (newVal: string) => {
    setReminderTime(newVal);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    // Give user 1.5 seconds after typing digits to finish inputting before auto-saving
    debounceTimerRef.current = setTimeout(() => {
      triggerSaveTime(newVal);
    }, 1500);
  };

  const handleTimeBlur = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    triggerSaveTime(reminderTime);
  };

  const fetchSettings = async () => {
    try {
      const data = await apiFetch('/reminder-settings');
      setSettings(data || []);
    } catch {
      showToast('Failed to load reminder settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const data = await apiFetch('/reminder-logs');
      setLogs(data || []);
    } catch {
      showToast('Failed to load reminder execution logs', 'error');
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchConfig();
    fetchLogs();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setName('');
    setDaysBefore(1);
    setMessageTemplate('Dear {customer_name}, this is a friendly reminder that your payment of {amount} for Loan #{loan_id} is due on {due_date}. ({days_remaining} days remaining). Thank you!');
    setChannel('both');
    setIsActive(true);
    setShowModal(true);
  };

  const openEditModal = (s: ReminderSetting) => {
    setEditingId(s.id);
    setName(s.name);
    setDaysBefore(s.days_before);
    setMessageTemplate(s.message_template);
    setChannel(s.channel);
    setIsActive(s.is_active);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this reminder rule?')) return;
    try {
      await apiFetch(`/reminder-settings/${id}`, { method: 'DELETE' });
      showToast('Reminder rule deleted successfully');
      fetchSettings();
    } catch (e: any) {
      showToast(e.message || 'Failed to delete reminder setting', 'error');
    }
  };

  const toggleSettingActive = async (s: ReminderSetting) => {
    const newVal = !s.is_active;
    setSettings(prev => prev.map(item => item.id === s.id ? { ...item, is_active: newVal } : item));
    try {
      await apiFetch(`/reminder-settings/${s.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: s.name,
          days_before: s.days_before,
          message_template: s.message_template,
          channel: s.channel,
          is_active: newVal
        })
      });
      showToast(`Reminder rule ${newVal ? 'activated' : 'disabled'}`, 'success');
      fetchSettings();
    } catch (e: any) {
      showToast(e.message || 'Failed to toggle active status', 'error');
      fetchSettings();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return showToast('Rule name is required', 'error');
    if (!messageTemplate.trim()) return showToast('Message template is required', 'error');

    setSubmitting(true);
    try {
      const payload = { name, days_before: daysBefore, message_template: messageTemplate, channel, is_active: isActive };
      if (editingId) {
        await apiFetch(`/reminder-settings/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        showToast('Reminder rule updated successfully');
      } else {
        await apiFetch('/reminder-settings', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        showToast('Reminder rule created successfully');
      }
      setShowModal(false);
      fetchSettings();
    } catch (e: any) {
      showToast(e.message || 'Failed to save reminder rule', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const renderPreview = (template: string) => {
    const days = daysBefore;
    const today = new Date();
    const mockDueDate = new Date();
    mockDueDate.setDate(today.getDate() + days);
    const formattedDueDate = mockDueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const vars = {
      loan_id: '77281',
      amount: '$1,250',
      due_date: formattedDueDate,
      days_remaining: String(Math.max(0, days)),
      days_overdue: String(Math.max(0, -days)),
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

  const getTemplateExcerpt = (template: string) => {
    if (!template) return '';
    const text = template.replace(/[\*_`]/g, '').replace(/\s+/g, ' ').trim();
    return text.length > 55 ? text.substring(0, 55) + '...' : text;
  };

  if (loading) return <div className="animate-in fade-in duration-200"><SkeletonTable rows={6} /></div>;

  const totalPages = Math.ceil(settings.length / itemsPerPage) || 1;
  const paginatedSettings = settings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalLogsPages = Math.ceil(logs.length / logsPerPage) || 1;
  const paginatedLogs = logs.slice((logsPage - 1) * logsPerPage, logsPage * logsPerPage);

  const getChannelText = (ch: string) => {
    if (ch === 'telegram') return t('telegram_only');
    if (ch === 'in_app') return t('in_app_only');
    return t('telegram_in_app');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[28px] font-extrabold text-[var(--text-primary)]">{t('custom_reminders')}</h2>
          <p className="text-[13.5px] text-[var(--text-secondary)]">{t('custom_reminders_desc')}</p>
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
            className="flex items-center gap-2 bg-[var(--accent)] hover:brightness-105 text-[#0F171C] text-[13.5px] font-bold px-4.5 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-[var(--accent)]/10 cursor-pointer"
          >
            <PlusCircle className="w-4.5 h-4.5" /> {t('create_reminder_rule')}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl p-4.5">
        <div className="flex items-center gap-2.5">
          <Clock className="w-5 h-5 text-[var(--accent)]" />
          <div>
            <h4 className="text-[13.5px] font-bold text-[var(--text-primary)]">{t('automated_sweep_schedule')}</h4>
            <p className="text-[12px] text-[var(--text-secondary)]">{t('sweep_schedule_desc')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-[13px] font-bold text-[var(--text-primary)]">{t('trigger_time_label')}</label>
          <input
            type="time"
            value={reminderTime}
            onChange={(e) => handleTimeChange(e.target.value)}
            onBlur={handleTimeBlur}
            className="bg-[var(--surface-secondary)] border border-[var(--border-primary)] px-3 py-1.5 rounded-lg text-[13.5px] font-mono focus:outline-none focus:border-[var(--accent)] transition-all cursor-pointer text-[var(--text-primary)]"
          />
          {savingTime && <span className="text-[12px] text-[var(--text-secondary)] animate-pulse">{t('saving')}</span>}
        </div>
      </div>

      <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-[13.5px] text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-primary)] bg-[var(--surface-secondary)]/50 select-none">
                <th className="px-6 py-4 font-bold text-[var(--text-primary)]">{t('rule_name_header')}</th>
                <th className="px-6 py-4 font-bold text-[var(--text-primary)] text-center">{t('days_relative_to_due')}</th>
                <th className="px-6 py-4 font-bold text-[var(--text-primary)]">{t('delivery_channels')}</th>
                <th className="px-6 py-4 font-bold text-[var(--text-primary)] text-center">{t('active_status_header')}</th>
                <th className="px-6 py-4 font-bold text-[var(--text-primary)] text-right">{t('actions_header')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-primary)]">
              {paginatedSettings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-tertiary)] bg-[var(--surface-card)]">
                    {t('no_reminder_rules')}
                  </td>
                </tr>
              ) : (
                paginatedSettings.map((setting) => (
                  <tr key={setting.id} className="hover:bg-[var(--surface-secondary)]/20 transition-colors">
                    <td className="px-6 py-4.5">
                      <span className="font-extrabold text-[var(--text-primary)] block">{setting.name}</span>
                      <span className="text-[11px] text-[var(--text-tertiary)] block mt-0.5">{getTemplateExcerpt(setting.message_template)}</span>
                    </td>
                    <td className="px-6 py-4.5 text-center font-mono text-[12.5px] font-bold">
                      {setting.days_before > 0 ? (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          +{setting.days_before} {t('days_label')}
                        </span>
                      ) : setting.days_before === 0 ? (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          {t('due_date')}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20">
                          {Math.abs(setting.days_before)} {t('days_overdue_label')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4.5">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${
                        setting.channel === 'telegram' ? 'bg-[#0088cc]/10 text-[#0088cc] border-[#0088cc]/20' :
                        setting.channel === 'in_app' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                        'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20'
                      }`}>
                        {getChannelText(setting.channel)}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-center">
                      <button
                        onClick={() => toggleSettingActive(setting)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold cursor-pointer transition ${setting.is_active ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-[var(--surface-secondary)] text-[var(--text-tertiary)] border border-[var(--border-primary)]'}`}
                      >
                        <span className={`w-2 h-2 rounded-full ${setting.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></span>
                        {setting.is_active ? t('active_status') : t('disabled_status')}
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

      <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl overflow-hidden shadow-xs space-y-4 p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-[var(--border-primary)] pb-4">
          <div>
            <h3 className="text-[18px] font-sans font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Bell className="w-5 h-5 text-[var(--accent)]" /> {t('sent_reminders_history') || 'Sent Reminders History'}
            </h3>
            <p className="text-[13px] text-[var(--text-secondary)]">Live log of automated relative payment notifications dispatched to customers.</p>
          </div>
          <button
            onClick={fetchLogs}
            disabled={loadingLogs}
            className="p-2 rounded-lg border border-[var(--border-primary)] hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] transition cursor-pointer bg-[var(--surface-secondary)]"
            title="Refresh logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[var(--text-secondary)] ${loadingLogs ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[13.5px] text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-primary)] bg-[var(--surface-secondary)]/50 select-none">
                <th className="px-6 py-4 font-bold text-[var(--text-primary)]">{t('time_header')}</th>
                <th className="px-6 py-4 font-bold text-[var(--text-primary)]">{t('customer_role')}</th>
                <th className="px-6 py-4 font-bold text-[var(--text-primary)]">Loan ID</th>
                <th className="px-6 py-4 font-bold text-[var(--text-primary)]">Rule Match</th>
                <th className="px-6 py-4 font-bold text-[var(--text-primary)] text-center">{t('delivery_channels')}</th>
                <th className="px-6 py-4 font-bold text-[var(--text-primary)] text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-[var(--text-tertiary)] py-8 font-medium">
                    No reminder logs recorded yet. Daily sweeps will generate histories.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((l) => (
                  <tr key={l.id} className="border-b border-[var(--border-primary)] hover:bg-[var(--surface-secondary)]/20 transition-all">
                    <td className="px-6 py-4 font-mono text-[var(--text-secondary)]">
                      {new Date(l.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true
                      })}
                    </td>
                    <td className="px-6 py-4 font-bold text-[var(--text-primary)]">{l.customer_name}</td>
                    <td className="px-6 py-4 font-mono text-[var(--text-secondary)]">#{l.loan_id.startsWith('#') ? l.loan_id.substring(1) : l.loan_id}</td>
                    <td className="px-6 py-4 font-medium text-[var(--text-primary)]">{l.rule_name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11.5px] font-bold block w-fit mx-auto ${
                        l.channel === 'telegram' ? 'bg-[#229ED9]/10 text-[#229ED9]' :
                        l.channel === 'in_app' ? 'bg-[#F59E0B]/10 text-[#F59E0B]' :
                        'bg-[#10B981]/10 text-[#10B981]'
                      }`}>
                        {l.channel === 'telegram' ? 'TELEGRAM' : l.channel === 'in_app' ? 'IN-APP' : 'TELEGRAM & IN-APP'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {l.status === 'success' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11.5px] font-bold bg-green-500/10 text-green-400">
                          ✓ Sent Successfully
                        </span>
                      ) : (
                        <span 
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11.5px] font-bold bg-red-500/10 text-red-400 cursor-help"
                          title={l.error_message || 'Unknown error'}
                        >
                          ✗ Failed
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalLogsPages > 1 && (
          <div className="p-4 border-t border-[var(--border-primary)] bg-[var(--surface-card)]">
            <Pagination
              currentPage={logsPage}
              totalPages={totalLogsPages}
              totalItems={logs.length}
              itemsPerPage={logsPerPage}
              onPageChange={setLogsPage}
            />
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} maxWidth="max-w-4xl">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 font-sans space-y-6">
          <div className="flex justify-between items-start border-b border-[var(--border-primary)] pb-4">
            <div>
              <h3 className="text-[22px] font-extrabold text-[var(--text-primary)]">
                {editingId ? t('edit_reminder_rule') : t('create_reminder_rule')}
              </h3>
              <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">Customize trigger conditions and notification templates dynamically.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left Column: Inputs */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <label className="block text-[12.5px] font-bold text-[var(--text-primary)] mb-1.5">{t('rule_name_header')}</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. 3 Days Payment Warning"
                  className="w-full bg-[var(--surface-secondary)] border border-[var(--border-primary)] p-3 rounded-lg text-[14px] focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12.5px] font-bold text-[var(--text-primary)] mb-1.5">{t('trigger_days_before')}</label>
                  <input
                    type="number"
                    value={daysBefore}
                    onChange={e => setDaysBefore(Number(e.target.value))}
                    placeholder="e.g. 3, 0 or -1"
                    className="w-full bg-[var(--surface-secondary)] border border-[var(--border-primary)] p-3 rounded-lg text-[14px] font-mono focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)]"
                  />
                  <span className="text-[10.5px] text-[var(--text-tertiary)] block mt-1">
                    0 for due date, negative numbers for overdue.
                  </span>
                </div>

                <div className="relative" ref={selectRef}>
                  <label className="block text-[12.5px] font-bold text-[var(--text-primary)] mb-1.5 select-none">{t('delivery_channels')}</label>
                  <button
                    type="button"
                    onClick={() => setIsSelectOpen(!isSelectOpen)}
                    className="w-full flex items-center justify-between bg-[var(--surface-secondary)] border border-[var(--border-primary)] hover:border-[var(--accent)] p-3 rounded-xl text-[14px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition cursor-pointer select-none"
                  >
                    <span>
                      {getChannelText(channel)}
                    </span>
                    <svg className={`w-4 h-4 text-[var(--text-secondary)] transition-transform duration-200 ${isSelectOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </button>

                  {isSelectOpen && (
                    <div className="absolute left-0 w-full mt-1.5 bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-xl shadow-xl z-50 overflow-hidden backdrop-blur-md animate-in fade-in duration-100 slide-in-from-top-2">
                      {[
                        { value: 'both', label: t('telegram_in_app') },
                        { value: 'telegram', label: t('telegram_only') },
                        { value: 'in_app', label: t('in_app_only') }
                      ].map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setChannel(opt.value as any);
                            setIsSelectOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 text-[13.5px] transition flex items-center justify-between cursor-pointer ${channel === opt.value ? 'bg-[var(--accent)]/10 text-[var(--accent)] font-bold' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]'}`}
                        >
                          <span>{opt.label}</span>
                          {channel === opt.value && (
                            <svg className="w-4 h-4 text-[var(--accent)]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[12.5px] font-bold text-[var(--text-primary)] mb-1.5 flex justify-between">
                  <span>{t('message_template_label')}</span>
                  <span className="text-[10.5px] text-[var(--accent)] flex items-center gap-0.5 cursor-help" title="Placeholders list: {loan_id}, {amount}, {due_date}, {days_remaining}, {days_overdue}, {customer_name}">
                    <HelpCircle className="w-3.5 h-3.5" /> {t('template_vars_helper')}
                  </span>
                </label>
                <textarea
                  ref={textareaRef}
                  value={messageTemplate}
                  onChange={e => setMessageTemplate(e.target.value)}
                  rows={5}
                  placeholder="Compose template here..."
                  className="w-full bg-[var(--surface-secondary)] border border-[var(--border-primary)] p-3 rounded-lg text-[13.5px] font-mono focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)]"
                />
              </div>

              {/* Clickable Variable badged list */}
              <div>
                <span className="block text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2 select-none">{t('click_insert_vars')}</span>
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
                  {t('enable_rule_immediately')}
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
                <div className="rounded-xl overflow-hidden border border-[#203040] bg-[#0e1621] flex flex-col min-h-[340px] font-sans">
                  {/* Telegram Top Bar */}
                  <div className="bg-[#17212b] px-4 py-2.5 flex items-center gap-3 border-b border-[#101921] select-none shrink-0">
                    <svg className="w-5 h-5 text-[#5288c1] cursor-pointer" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13.5px] font-bold text-white leading-tight">NexusFinance Bot</div>
                      <div className="text-[11px] text-[#5288c1] leading-none">bot</div>
                    </div>
                    <svg className="w-5 h-5 text-[#6c7883]" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
                  </div>

                  {/* Chat message thread area */}
                  <div className="flex-1 bg-[#0e1621] p-4 flex flex-col justify-end relative select-none">
                    
                    <div className="flex items-end gap-2.5">
                      {/* Telegram Bot Avatar */}
                      <div className="w-8 h-8 rounded-full bg-[#5288c1] flex items-center justify-center text-white font-extrabold text-[12px] shrink-0">
                        NF
                      </div>
                      
                      {/* Chat Bubble */}
                      <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-[#182533] border border-[#203040] p-3 text-[13px] text-[#f5f5f5] space-y-1 relative shadow-sm">
                        <div 
                          className="whitespace-pre-wrap break-words leading-relaxed text-[#e5edee] font-sans text-[13px]"
                          dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(renderPreview(messageTemplate)) }}
                        />
                        
                        <div className="pt-2">
                          <span className="w-full bg-[#24374d] hover:bg-[#2b425c] border border-[#3b5473] text-[#5288c1] font-bold py-2 rounded-lg text-center flex items-center justify-center gap-1.5 select-none pointer-events-none transition block text-[12px]">
                            🚀 Open NexusFinance
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* In-App Notification preview */
                <div className="rounded-xl border border-[var(--border-primary)] bg-[var(--surface-secondary)]/30 p-4 min-h-[340px] flex flex-col justify-start">
                  <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block mb-3 select-none">In-App Notification Banner</span>
                  
                  <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] p-4 rounded-xl shadow-md flex items-start gap-3 hover:scale-[1.02] transition duration-150 relative">
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
              className="px-5 py-2.5 rounded-lg border border-[var(--border-primary)] hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] font-bold text-[13.5px] cursor-pointer bg-[var(--surface-secondary)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-lg bg-[var(--accent)] hover:brightness-110 text-[var(--text-primary)] font-bold text-[13.5px] cursor-pointer disabled:opacity-50"
            >
              {submitting ? t('saving') : t('save_selection')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
