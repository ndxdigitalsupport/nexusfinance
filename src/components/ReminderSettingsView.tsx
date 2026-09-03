import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  Trash2, 
  Edit, 
  RefreshCw, 
  HelpCircle, 
  Clock, 
  ShieldAlert, 
  Send, 
  DollarSign, 
  ShieldCheck, 
  Sparkles,
  AlertTriangle,
  FileCheck2
} from 'lucide-react';
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

interface DelinquentLoan {
  loanId: string;
  applicantName: string;
  applicantEmail: string;
  phone: string | null;
  telegramLinked: boolean;
  telegramChatId: string | null;
  loanAmount: number;
  loanType: string;
  monthlyPayment: number;
  overdueInstallmentsCount: number;
  daysOverdue: number;
  oldestDueDate: string;
  penaltyFee: number;
  totalDue: number;
  riskLevel: 'mild' | 'medium' | 'severe';
  gracePeriodDays: number;
  latePenaltyDaily: number;
}

export default function ReminderSettingsView() {
  const { t, formatCurrency } = useCurrency();
  const [settings, setSettings] = useState<ReminderSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'rules' | 'delinquent'>('rules');

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

  // Policy Settings
  const [reminderTime, setReminderTime] = useState('00:00');
  const [gracePeriodDays, setGracePeriodDays] = useState(3);
  const [latePenaltyDaily, setLatePenaltyDaily] = useState(1);
  const [savingPolicy, setSavingPolicy] = useState(false);
  const debounceTimerRef = React.useRef<any>(null);

  // Delinquent Accounts
  const [delinquentLoans, setDelinquentLoans] = useState<DelinquentLoan[]>([]);
  const [delinquentSummary, setDelinquentSummary] = useState<any>(null);
  const [loadingDelinquent, setLoadingDelinquent] = useState(false);
  const [nudgingLoanId, setNudgingLoanId] = useState<string | null>(null);
  const [delinquentPage, setDelinquentPage] = useState(1);
  const delinquentPerPage = 8;

  // Logs
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
      if (config) {
        if (config.reminder_time) setReminderTime(config.reminder_time);
        if (config.grace_period_days !== undefined) setGracePeriodDays(Number(config.grace_period_days));
        if (config.late_penalty_daily !== undefined) setLatePenaltyDaily(Number(config.late_penalty_daily));
      }
    } catch {}
  };

  const triggerSavePolicy = async (updates: Record<string, any>) => {
    setSavingPolicy(true);
    try {
      await apiFetch('/config', {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      showToast('Collection policy updated', 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to update collection policy', 'error');
    } finally {
      setSavingPolicy(false);
    }
  };

  const handlePolicyChange = (field: 'reminder_time' | 'grace_period_days' | 'late_penalty_daily', val: any) => {
    if (field === 'reminder_time') setReminderTime(val);
    if (field === 'grace_period_days') setGracePeriodDays(Number(val));
    if (field === 'late_penalty_daily') setLatePenaltyDaily(Number(val));

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      triggerSavePolicy({ [field]: val });
    }, 1500);
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

  const fetchOverdueLoans = async () => {
    setLoadingDelinquent(true);
    try {
      const data = await apiFetch('/loans/overdue');
      setDelinquentLoans(data.delinquentLoans || []);
      setDelinquentSummary(data.summary || null);
    } catch {
      // silently handle
    } finally {
      setLoadingDelinquent(false);
    }
  };

  const handleNudge = async (loanId: string) => {
    setNudgingLoanId(loanId);
    try {
      const res = await apiFetch(`/loans/${encodeURIComponent(loanId)}/nudge`, {
        method: 'POST',
        body: JSON.stringify({ channel: 'both' })
      });
      showToast(res.message || `Nudge sent for loan ${loanId}`, 'success');
      fetchOverdueLoans();
    } catch (e: any) {
      showToast(e.message || 'Failed to send nudge', 'error');
    } finally {
      setNudgingLoanId(null);
    }
  };

  const handleLoadStandardPresets = async () => {
    if (!window.confirm('This will load the 3 standard microfinance collection rules (Pre-Due, Due Date, and Overdue Notice). Proceed?')) return;
    try {
      const presets = [
        {
          name: 'Stage 1: Pre-Due Reminder (3 Days Before)',
          days_before: 3,
          channel: 'both',
          is_active: true,
          message_template: '📅 *Upcoming Payment Reminder* — NexusFinance\n\nDear {customer_name},\nYour monthly installment of *{amount}* for Loan #{loan_id} is due on *{due_date}* ({days_remaining} days remaining).\n\nPlease prepare your payment to maintain a good credit record.'
        },
        {
          name: 'Stage 2: Due Date Notice (Today)',
          days_before: 0,
          channel: 'both',
          is_active: true,
          message_template: '🔔 *Payment Due Today* — NexusFinance\n\nDear {customer_name},\nYour installment of *{amount}* for Loan #{loan_id} is *due today* ({due_date}).\n\nPlease scan your KHQR to complete your payment before midnight to avoid late penalty fees.'
        },
        {
          name: 'Stage 3: Overdue Escalation Notice',
          days_before: -1,
          channel: 'both',
          is_active: true,
          message_template: '⚠️ *URGENT OVERDUE NOTICE* — NexusFinance\n\nDear {customer_name},\nYour payment for Loan #{loan_id} is *{days_overdue} days overdue*.\n\n• Base Installment: *{amount}*\n• Accrued Late Penalty: *{penalty_fee}*\n• *Total Due: {total_due}*\n\nPlease settle your payment immediately to avoid further legal escalation.'
        }
      ];

      for (const p of presets) {
        await apiFetch('/reminder-settings', {
          method: 'POST',
          body: JSON.stringify(p)
        });
      }

      showToast('Standard 3-tier microfinance rules loaded!', 'success');
      fetchSettings();
    } catch (e: any) {
      showToast(e.message || 'Failed to load standard preset rules', 'error');
    }
  };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const data = await apiFetch('/reminder-logs');
      setLogs(data || []);
    } catch {
      // silently handle
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    fetchSettings();
    fetchLogs();
    fetchOverdueLoans();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setName('');
    setDaysBefore(3);
    setMessageTemplate('📅 *Payment Reminder* — NexusFinance\n\nDear {customer_name},\nYour loan repayment of *{amount}* for #{loan_id} is due on *{due_date}* ({days_remaining} days remaining).\n\nThank you for choosing NexusFinance.');
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
      showToast('Reminder rule deleted');
      fetchSettings();
    } catch (e: any) {
      showToast(e.message || 'Failed to delete rule', 'error');
    }
  };

  const handleToggleActive = async (s: ReminderSetting) => {
    const newVal = !s.is_active;
    setSettings(prev => prev.map(item => item.id === s.id ? { ...item, is_active: newVal } : item));
    try {
      await apiFetch(`/reminder-settings/${s.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
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
          method: 'PATCH',
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
      customer_name: 'Somchai V.',
      penalty_fee: '$4.00',
      total_due: '$1,254',
      grace_period: String(gracePeriodDays)
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

  const totalDelinquentPages = Math.ceil(delinquentLoans.length / delinquentPerPage) || 1;
  const paginatedDelinquent = delinquentLoans.slice((delinquentPage - 1) * delinquentPerPage, delinquentPage * delinquentPerPage);

  const totalLogsPages = Math.ceil(logs.length / logsPerPage) || 1;
  const paginatedLogs = logs.slice((logsPage - 1) * logsPerPage, logsPage * logsPerPage);

  const getChannelText = (ch: string) => {
    if (ch === 'telegram') return t('telegram_only');
    if (ch === 'in_app') return t('in_app_only');
    return t('telegram_in_app');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-[28px] font-black text-[var(--text-primary)] font-sans tracking-tight">
              {t('custom_reminders')}
            </h2>
          </div>
          <p className="text-[13.5px] text-[var(--text-secondary)] mt-0.5">{t('custom_reminders_desc')}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { fetchSettings(); fetchLogs(); }}
            className="p-2.5 rounded-xl border border-[var(--border-primary)] hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] transition cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-[var(--accent)] hover:brightness-105 text-[#0F171C] text-[13px] font-bold px-4 py-2.5 rounded-xl transition-all duration-200 shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> {t('create_reminder_rule')}
          </button>
        </div>
      </div>

      <div className="space-y-6">
          {/* Unified Collection & Late Penalty Policy Matrix Card */}
          <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-primary)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-[var(--text-primary)]">{t('collection_policy')}</h4>
                  <p className="text-[11.5px] text-[var(--text-secondary)]">Automated sweep timing, grace period buffer, and daily penalty calculation.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {savingPolicy && <span className="text-[11.5px] font-bold text-emerald-500 animate-pulse">{t('saving')}</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Daily Sweep Time */}
              <div className="bg-[var(--surface-secondary)]/50 border border-[var(--border-primary)] rounded-xl p-3.5 space-y-1">
                <label className="text-[12px] font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[var(--accent)]" /> {t('trigger_time_label')}
                </label>
                <p className="text-[10.5px] text-[var(--text-tertiary)] leading-tight">{t('sweep_schedule_desc')}</p>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => handlePolicyChange('reminder_time', e.target.value)}
                  className="w-full bg-[var(--surface-card)] border border-[var(--border-primary)] px-3 py-1.5 rounded-lg text-[13.5px] font-mono focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)] mt-1.5 font-bold"
                />
              </div>

              {/* Grace Period */}
              <div className="bg-[var(--surface-secondary)]/50 border border-[var(--border-primary)] rounded-xl p-3.5 space-y-1">
                <label className="text-[12px] font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> {t('grace_period')}
                </label>
                <p className="text-[10.5px] text-[var(--text-tertiary)] leading-tight">{t('grace_period_desc')}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={gracePeriodDays}
                    onChange={(e) => handlePolicyChange('grace_period_days', e.target.value)}
                    className="w-full bg-[var(--surface-card)] border border-[var(--border-primary)] px-3 py-1.5 rounded-lg text-[13.5px] font-mono focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)] font-bold"
                  />
                  <span className="text-[12px] font-bold text-[var(--text-secondary)] whitespace-nowrap">Days</span>
                </div>
              </div>

              {/* Daily Late Penalty Fee */}
              <div className="bg-[var(--surface-secondary)]/50 border border-[var(--border-primary)] rounded-xl p-3.5 space-y-1">
                <label className="text-[12px] font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-amber-500" /> {t('late_penalty_daily')}
                </label>
                <p className="text-[10.5px] text-[var(--text-tertiary)] leading-tight">{t('late_penalty_daily_desc')}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={latePenaltyDaily}
                    onChange={(e) => handlePolicyChange('late_penalty_daily', e.target.value)}
                    className="w-full bg-[var(--surface-card)] border border-[var(--border-primary)] px-3 py-1.5 rounded-lg text-[13.5px] font-mono focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)] font-bold"
                  />
                  <span className="text-[12px] font-bold text-[var(--text-secondary)] whitespace-nowrap">/ day</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Reminder Rules Table */}
          <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-[var(--border-primary)] flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--accent)]" /> {t('automated_sweep_schedule')} ({settings.length})
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-[13.5px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-primary)] bg-[var(--surface-secondary)]/50 select-none">
                    <th className="px-6 py-3.5 font-bold text-[var(--text-primary)]">{t('rule_name_header')}</th>
                    <th className="px-6 py-3.5 font-bold text-[var(--text-primary)] text-center">{t('days_relative_to_due')}</th>
                    <th className="px-6 py-3.5 font-bold text-[var(--text-primary)]">{t('delivery_channels')}</th>
                    <th className="px-6 py-3.5 font-bold text-[var(--text-primary)] text-center">{t('active_status_header')}</th>
                    <th className="px-6 py-3.5 font-bold text-[var(--text-primary)] text-right">{t('actions_header')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-primary)]">
                  {paginatedSettings.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-secondary)]">
                        <div className="max-w-sm mx-auto space-y-3">
                          <p className="text-[13px]">{t('no_reminder_rules')}</p>
                          <button
                            onClick={handleLoadStandardPresets}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent)] text-[#0F171C] text-[12.5px] font-bold shadow-xs cursor-pointer"
                          >
                            <Sparkles className="w-4 h-4" /> Load 3 Standard Microfinance Rules
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedSettings.map((s) => (
                      <tr key={s.id} className="hover:bg-[var(--surface-secondary)]/30 transition">
                        <td className="px-6 py-4">
                          <span className="font-bold text-[var(--text-primary)] block">{s.name}</span>
                          <span className="text-[11.5px] text-[var(--text-tertiary)] font-mono block mt-0.5">{getTemplateExcerpt(s.message_template)}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-mono font-bold ${
                            s.days_before > 0 ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                            s.days_before === 0 ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                            'bg-red-500/10 text-red-500 border border-red-500/20'
                          }`}>
                            {s.days_before > 0 ? `${s.days_before} ${t('days_label')} before` :
                             s.days_before === 0 ? 'Due Date' :
                             `${Math.abs(s.days_before)} ${t('days_overdue_label')}`}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[12px] font-bold text-[var(--text-secondary)]">{getChannelText(s.channel)}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleToggleActive(s)}
                            className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition ${
                              s.is_active ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                            }`}
                          >
                            {s.is_active ? '● Active' : '○ Inactive'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(s)}
                              className="p-1.5 rounded-lg border border-[var(--border-primary)] hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(s.id)}
                              className="p-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 text-red-400 transition cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="p-4 border-t border-[var(--border-primary)]">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={settings.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>

          {/* Dispatch Logs */}
          <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-[var(--border-primary)] flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-[var(--text-primary)] flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-500" /> Dispatch History Logs ({logs.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[13px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-primary)] bg-[var(--surface-secondary)]/50 select-none">
                    <th className="px-6 py-3 font-bold text-[var(--text-primary)]">Timestamp</th>
                    <th className="px-6 py-3 font-bold text-[var(--text-primary)]">Customer / Loan</th>
                    <th className="px-6 py-3 font-bold text-[var(--text-primary)]">Rule</th>
                    <th className="px-6 py-3 font-bold text-[var(--text-primary)] text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-primary)]">
                  {paginatedLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-[var(--text-secondary)]">No dispatch logs recorded yet.</td>
                    </tr>
                  ) : (
                    paginatedLogs.map((l) => (
                      <tr key={l.id} className="hover:bg-[var(--surface-secondary)]/30 transition">
                        <td className="px-6 py-3 font-mono text-[11.5px] text-[var(--text-tertiary)]">
                          {new Date(l.created_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-3">
                          <span className="font-bold text-[var(--text-primary)]">{l.customer_name}</span>
                          <span className="text-[11px] font-mono text-[var(--text-tertiary)] block">Loan #{l.loan_id}</span>
                        </td>
                        <td className="px-6 py-3 font-medium text-[var(--text-secondary)]">{l.rule_name}</td>
                        <td className="px-6 py-3 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                            l.status === 'success' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-500'
                          }`}>
                            {l.status === 'success' ? '✓ Sent' : '✗ Failed'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalLogsPages > 1 && (
              <div className="p-4 border-t border-[var(--border-primary)]">
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
        </div>

      {/* CREATE / EDIT MODAL */}
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
                  <span className="text-[10.5px] text-[var(--accent)] flex items-center gap-0.5 cursor-help" title="Placeholders list: {loan_id}, {amount}, {due_date}, {days_remaining}, {days_overdue}, {customer_name}, {penalty_fee}, {total_due}">
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
                    { token: '{amount}', desc: 'Monthly Payment' },
                    { token: '{due_date}', desc: 'Due Date' },
                    { token: '{days_remaining}', desc: 'Days Left' },
                    { token: '{days_overdue}', desc: 'Days Late' },
                    { token: '{customer_name}', desc: 'Client Name' },
                    { token: '{penalty_fee}', desc: 'Late Penalty' },
                    { token: '{total_due}', desc: 'Total Owed' }
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

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                  className="w-4.5 h-4.5 text-[var(--accent)] focus:ring-[var(--accent)] border-[var(--border-primary)] rounded cursor-pointer"
                />
                <label htmlFor="isActiveToggle" className="text-[13px] font-bold text-[var(--text-primary)] cursor-pointer">
                  {t('enable_rule_immediately')}
                </label>
              </div>
            </div>

            {/* Right Column: Live Mockup Preview */}
            <div className="md:col-span-5 bg-[var(--surface-secondary)]/60 border border-[var(--border-primary)] rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border-primary)] pb-3">
                <span className="text-[12px] font-bold text-[var(--text-primary)] uppercase tracking-wider">Live Mockup Preview</span>
                <div className="flex bg-[var(--surface-card)] rounded-lg p-0.5 border border-[var(--border-primary)] text-[11px]">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('telegram')}
                    className={`px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${previewMode === 'telegram' ? 'bg-[var(--accent)] text-[#0F171C]' : 'text-[var(--text-secondary)]'}`}
                  >
                    Telegram
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('in_app')}
                    className={`px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${previewMode === 'in_app' ? 'bg-[var(--accent)] text-[#0F171C]' : 'text-[var(--text-secondary)]'}`}
                  >
                    In-App
                  </button>
                </div>
              </div>

              {previewMode === 'telegram' ? (
                <div className="bg-[#17212B] rounded-xl p-4 text-white text-[13px] space-y-3 font-sans shadow-lg border border-slate-700/50">
                  <div className="flex items-center gap-2 border-b border-slate-700/60 pb-2">
                    <div className="w-7 h-7 rounded-full bg-[var(--accent)] text-[#0F171C] font-black flex items-center justify-center text-[11px]">
                      NF
                    </div>
                    <div>
                      <span className="font-bold text-[12px] block leading-none">NexusFinance Bot</span>
                      <span className="text-[10px] text-slate-400">bot</span>
                    </div>
                  </div>
                  <div
                    className="leading-relaxed whitespace-pre-wrap text-[12.5px] text-slate-100"
                    dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(renderPreview(messageTemplate)) }}
                  />
                  <div className="pt-2">
                    <div className="w-full bg-[#2B5278] text-white py-2 rounded-lg text-center font-bold text-[12px] cursor-pointer shadow-xs">
                      📱 Open NexusFinance & Pay KHQR
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-xl p-4 text-[13px] space-y-2 shadow-xs">
                  <div className="flex items-center gap-2 text-[var(--accent)]">
                    <Clock className="w-4 h-4" />
                    <span className="font-bold text-[12px]">In-App Alert</span>
                  </div>
                  <p className="text-[var(--text-primary)] text-[12.5px] leading-relaxed">
                    {renderPreview(messageTemplate).replace(/[\*_`]/g, '')}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-primary)]">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-5 py-2.5 rounded-xl border border-[var(--border-primary)] text-[13.5px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-[var(--accent)] text-[#0F171C] text-[13.5px] font-bold hover:brightness-105 transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingId ? 'Update Rule' : 'Create Rule'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
