import React, { useState, useEffect } from 'react';
import { 
  Settings2, 
  Activity, 
  ShieldCheck, 
  ArrowUpRight,
  Database,
  Users,
  FileCheck2,
  TrendingUp,
  FileText
} from 'lucide-react';
import { PlatformConfig, PlatformStats } from '../types';
import Modal from './Modal';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useCurrency } from '../context/CurrencyContext';

interface AuditLog {
  id: number; action: string; details: string; userEmail: string; timestamp: string;
}

interface SuperAdminDashboardProps {
  config: PlatformConfig;
  stats: PlatformStats;
  auditLogs: AuditLog[];
  onUpdateConfig: (newConfig: PlatformConfig) => void;
  view?: 'dashboard' | 'settings';
  applications?: any[];
  setActiveMenu?: (menu: string) => void;
}

export default function SuperAdminDashboard({
  config,
  stats,
  auditLogs,
  onUpdateConfig,
  view = 'dashboard',
  applications = [],
  setActiveMenu
}: SuperAdminDashboardProps) {
  const [editingConfig, setEditingConfig] = useState<PlatformConfig>({ ...config });
  const [savedMessage, setSavedMessage] = useState(false);
  const [selectedStat, setSelectedStat] = useState<'volume' | 'customers' | 'outstanding' | 'yields' | null>(null);
  const { t, formatCurrency, formatCurrencyShort } = useCurrency();

  useEffect(() => {
    setEditingConfig({ ...config });
  }, [config]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(editingConfig);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2000);
  };

  const currentStatsItems = [
    { id: 'volume', label: t('total_volume'), value: formatCurrency(stats.totalVolume), change: '+14% mom', icon: Database },
    { id: 'customers', label: t('active_customers'), value: stats.activeCustomers.toString(), change: '+8 this week', icon: Users },
    { id: 'outstanding', label: t('outstanding_portfolio'), value: formatCurrency(stats.outstandingBalanceValue), change: '-5% repayments', icon: FileCheck2 },
    { id: 'yields', label: t('gross_yields'), value: formatCurrency(stats.interestEarned), change: '+18% yoy', icon: TrendingUp },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200 font-sans">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-[28px] md:text-[34px] font-black text-[var(--text-primary)] tracking-tight font-sans">
              {t('super_admin_hub')}
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 select-none">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Production
            </span>
          </div>
          <p className="text-[13.5px] text-[var(--text-secondary)] font-medium mt-1">
            {t('super_admin_desc')}
          </p>
        </div>
      </div>

      {/* Stats Cards metrics — shown only in dashboard view */}
      {view === 'dashboard' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-none">
          {currentStatsItems.map((st, i) => {
            const Icon = st.icon;
            return (
              <div
                key={i}
                onClick={() => setSelectedStat(st.id as any)}
                className={`stagger-${i + 1} bg-[var(--surface-card)] border border-[var(--border-primary)]/90 hover:border-[var(--accent)]/80 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group cursor-pointer shadow-xs hover:shadow-lg hover:shadow-black/5 hover:-translate-y-1 transition-all duration-300`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[12px] font-extrabold text-[var(--text-secondary)] tracking-wider uppercase">
                    {st.label}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border-primary)]/80 flex items-center justify-center text-[var(--accent)] group-hover:scale-105 group-hover:bg-[var(--accent)]/10 transition-all duration-300 shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[26px] font-black font-mono block leading-tight text-[var(--text-primary)] tracking-tight">
                    {st.value}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                      {st.change}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === 'dashboard' && (
        <div className="space-y-6">
          {/* Row 2: Graph + System Info */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Recharts Area Chart (Spans 8) */}
            <div className="lg:col-span-8 bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-[16px] font-sans font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <Activity className="w-4.5 h-4.5 text-[var(--accent)]" /> {t('portfolio_trend')}
                  </h3>
                  <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">{t('portfolio_trend_desc')}</p>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold bg-[var(--surface-secondary)] p-1 rounded-xl border border-[var(--border-primary)] select-none">
                  <span className="px-2.5 py-1 bg-[var(--surface-card)] rounded-lg text-[var(--text-primary)] shadow-xs">6M Trend</span>
                  <span className="px-2.5 py-1 text-[var(--text-secondary)]">1Y</span>
                  <span className="px-2.5 py-1 text-[var(--text-secondary)]">All</span>
                </div>
              </div>
              
              <div className="h-[270px] w-full text-[12px] font-mono select-none pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={[
                      { month: 'Jan', volume: 4000, portfolio: 2400 },
                      { month: 'Feb', volume: 5000, portfolio: 3100 },
                      { month: 'Mar', volume: 6500, portfolio: 4500 },
                      { month: 'Apr', volume: 8000, portfolio: 5600 },
                      { month: 'May', volume: 9500, portfolio: 6800 },
                      { month: 'Jun', volume: 11000, portfolio: 8200 },
                      { month: 'Jul', volume: 12000, portfolio: 8900 },
                      { month: 'Aug', volume: stats.totalVolume || 12775, portfolio: stats.outstandingBalanceValue || 9025 }
                    ]}
                    margin={{ top: 10, right: 10, left: 15, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" vertical={false} />
                    <XAxis dataKey="month" stroke="var(--text-secondary)" tickLine={false} axisLine={false} dy={8} />
                    <YAxis stroke="var(--text-secondary)" tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrencyShort(v)} dx={-8} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--surface-card)', 
                        borderColor: 'var(--border-primary)',
                        borderRadius: '16px',
                        color: 'var(--text-primary)',
                        boxShadow: '0 12px 24px -4px rgba(0, 0, 0, 0.25)',
                        padding: '12px'
                      }} 
                      itemStyle={{ color: 'var(--text-primary)', padding: '2px 0' }}
                      labelStyle={{ fontWeight: 'bold', marginBottom: '4px', color: 'var(--text-secondary)' }}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Area type="monotone" name={t('total_volume')} dataKey="volume" stroke="var(--accent)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVolume)" activeDot={{ r: 6, stroke: 'var(--surface-card)', strokeWidth: 2 }} />
                    <Area type="monotone" name={t('outstanding_portfolio')} dataKey="portfolio" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPortfolio)" activeDot={{ r: 6, stroke: 'var(--surface-card)', strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right: Quick Action & System Health Info (Spans 4) */}
            <div className="lg:col-span-4 bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl p-6 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border-primary)] pb-3">
                  <h3 className="text-[16px] font-sans font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
                    <span>{t('system_health')}</span>
                  </h3>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Online
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[13px] border-b border-[var(--border-primary)]/70 pb-2.5">
                    <span className="text-[var(--text-secondary)] font-medium">{t('sweep_schedule')}</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {t('active')} ({config.reminder_time || '00:00'})
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[13px] border-b border-[var(--border-primary)]/70 pb-2.5">
                    <span className="text-[var(--text-secondary)] font-medium">{t('bot_status')}</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/10 text-sky-600 border border-sky-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                      {t('live_linked')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[13px] border-b border-[var(--border-primary)]/70 pb-2.5">
                    <span className="text-[var(--text-secondary)] font-medium">Underwriting Policy</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      100% Officer Review
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-[var(--text-secondary)] font-medium">Email Verification</span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${config.emailVerificationRequired !== false ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'}`}>
                      {config.emailVerificationRequired !== false ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-[var(--border-primary)] pt-4 space-y-2 select-none">
                <span className="text-[11px] uppercase tracking-wider font-extrabold text-[var(--text-tertiary)] block mb-2">
                  {t('shortcuts')}
                </span>
                <div className="grid grid-cols-2 gap-2 text-[12px] font-bold text-center">
                  <button
                    onClick={() => setActiveMenu && setActiveMenu('reminders')}
                    className="py-2.5 px-3 rounded-xl border border-[var(--border-primary)] hover:border-[var(--accent)] hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>🔔</span> {t('reminders')}
                  </button>
                  <button
                    onClick={() => setActiveMenu && setActiveMenu('broadcast')}
                    className="py-2.5 px-3 rounded-xl border border-[var(--border-primary)] hover:border-[var(--accent)] hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>📢</span> {t('broadcast')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Pending applications + Audit logs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Recent Applications List */}
            <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border-primary)] pb-3">
                <div>
                  <h3 className="text-[16px] font-sans font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <FileText className="w-4.5 h-4.5 text-[var(--accent)]" /> {t('loan_review')}
                  </h3>
                  <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">Recent customer applications awaiting officer action.</p>
                </div>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-[var(--surface-secondary)] text-[var(--text-secondary)]">
                  {applications.length} Total
                </span>
              </div>

              <div className="divide-y divide-[var(--border-primary)] text-[13px] max-h-[280px] overflow-y-auto pr-1">
                {applications.length === 0 ? (
                  <p className="text-[var(--text-tertiary)] text-[13px] py-10 text-center bg-[var(--surface-secondary)]/30 rounded-xl">{t('no_applications')}</p>
                ) : (
                  applications.slice(0, 5).map((app: any) => (
                    <div key={app.id} className="py-3.5 flex justify-between items-center hover:bg-[var(--surface-secondary)]/30 px-2 rounded-xl transition">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/20 text-emerald-700 font-extrabold flex items-center justify-center text-[12.5px] shrink-0 border border-emerald-500/20">
                          {app.initials || app.applicantName?.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[var(--text-primary)]">{app.applicantName}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-[var(--surface-tertiary)] text-[var(--text-secondary)]">#{app.id.startsWith('#') ? app.id.substring(1) : app.id}</span>
                          </div>
                          <span className="text-[11px] text-[var(--text-tertiary)] mt-0.5 block">{app.type} · {new Date(app.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <span className="font-mono font-black text-[var(--text-primary)] block text-[13.5px]">{formatCurrency(app.amount)}</span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                          app.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                          app.status === 'Rejected' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                          app.status === 'Hold' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' :
                          'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right: Audit Logs */}
            <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border-primary)] pb-3">
                <div>
                  <h3 className="text-[16px] font-sans font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" /> {t('audit_trail')}
                  </h3>
                  <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">{t('audit_trail_desc')}</p>
                </div>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-[var(--surface-secondary)] text-[var(--text-secondary)]">
                  Live Log
                </span>
              </div>

              <div className="divide-y divide-[var(--border-primary)] text-[12.5px] max-h-[280px] overflow-y-auto pr-1">
                {auditLogs.length === 0 ? (
                  <p className="text-[var(--text-tertiary)] text-[13px] py-10 text-center bg-[var(--surface-secondary)]/30 rounded-xl">{t('no_logs')}</p>
                ) : (
                  auditLogs.slice(0, 4).map((log) => (
                    <div key={log.id} className="py-3 space-y-1 hover:bg-[var(--surface-secondary)]/30 px-2 rounded-xl transition">
                      <span className="text-[var(--text-primary)] font-bold block leading-snug">{formatAuditDetails(log.details)}</span>
                      <div className="flex items-center justify-between text-[11px] text-[var(--text-tertiary)] pt-0.5">
                        <span className="font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">{log.userEmail}</span>
                        <span className="font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {view === 'settings' && <div className="space-y-6">
        
        {/* Form panel configuring parameters */}
        <form onSubmit={handleSave} className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl p-6 sm:p-8 space-y-6">
          <h3 className="text-[18px] font-sans font-bold text-[var(--text-primary)] border-b pb-2 flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-[var(--text-primary)]" /> {t('system_parameters_adjustments')}
          </h3>



          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[13px] font-bold text-[var(--text-primary)] mb-1">{t('annual_interest_rate')}</label>
              <p className="text-[11px] text-[var(--text-secondary)] mb-2 leading-tight">{t('annual_interest_rate_desc')}</p>
              <input
                type="number"
                step="0.05"
                value={editingConfig.baseInterestRate}
                onChange={(e) => setEditingConfig((p) => ({ ...p, baseInterestRate: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-[var(--surface-secondary)] border border-[var(--border-primary)] p-3 rounded-lg text-[14px] font-mono focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all text-[var(--text-primary)]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[var(--text-primary)] mb-1">{t('maximum_loan_limit')}</label>
              <p className="text-[11px] text-[var(--text-secondary)] mb-2 leading-tight">{t('maximum_loan_limit_desc')}</p>
              <input
                type="number"
                step="50000"
                value={editingConfig.maxLoanAmount}
                onChange={(e) => setEditingConfig((p) => ({ ...p, maxLoanAmount: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-[var(--surface-secondary)] border border-[var(--border-primary)] p-3 rounded-lg text-[14px] font-mono focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all text-[var(--text-primary)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[13px] font-bold text-[var(--text-primary)] mb-1">{t('require_email_verification')}</label>
              <p className="text-[11px] text-[var(--text-secondary)] mb-2 leading-tight">{t('require_email_verification_desc')}</p>
              <div className="flex items-center gap-2.5 mt-3.5 select-none">
                <input
                  type="checkbox"
                  id="emailVerificationToggle"
                  checked={editingConfig.emailVerificationRequired !== false}
                  onChange={(e) => setEditingConfig((p) => ({ ...p, emailVerificationRequired: e.target.checked }))}
                  className="w-5 h-5 text-[var(--accent)] focus:ring-[var(--accent)] border-[var(--border-primary)] rounded"
                />
                <label htmlFor="emailVerificationToggle" className="text-[13.5px] font-semibold text-[var(--text-primary)]">{t('active_enabled')}</label>
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--border-primary)] pt-5 space-y-4">
            <h4 className="text-[14px] font-extrabold text-[var(--text-primary)] flex items-center gap-1.5">
              🤖 {t('telegram_bot_admin_controls')}
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[13px] font-bold text-[var(--text-primary)] mb-1.5">{t('telegram_admin_chat_id')}</label>
                <input
                  type="text"
                  value={editingConfig.telegram_admin_id || ''}
                  onChange={(e) => setEditingConfig((p) => ({ ...p, telegram_admin_id: e.target.value }))}
                  placeholder="e.g. 182736452"
                  className="w-full bg-[var(--surface-secondary)] border border-[var(--border-primary)] p-3 rounded-lg text-[14px] font-mono focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[var(--text-primary)] mb-1.5">{t('reminder_summary_reports')}</label>
                <div className="flex items-center gap-2.5 mt-3 select-none">
                  <input
                    type="checkbox"
                    id="adminReportsToggle"
                    checked={editingConfig.enable_admin_reports !== false}
                    onChange={(e) => setEditingConfig((p) => ({ ...p, enable_admin_reports: e.target.checked }))}
                    className="w-5 h-5 text-[var(--accent)] focus:ring-[var(--accent)] border-[var(--border-primary)] rounded"
                  />
                  <label htmlFor="adminReportsToggle" className="text-[13.5px] font-semibold text-[var(--text-primary)]">{t('send_sweep_reports')}</label>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--border-primary)] pt-5 space-y-4">
            <h4 className="text-[14px] font-extrabold text-[var(--text-primary)] flex items-center gap-1.5">
              💬 {t('brevo_sms_gateway')}
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[13px] font-bold text-[var(--text-primary)] mb-1.5">{t('brevo_api_key')}</label>
                <input
                  type="password"
                  value={editingConfig.brevo_api_key || ''}
                  onChange={(e) => setEditingConfig((p) => ({ ...p, brevo_api_key: e.target.value }))}
                  placeholder="xkeysib-..."
                  className="w-full bg-[var(--surface-secondary)] border border-[var(--border-primary)] p-3 rounded-lg text-[14px] font-mono focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)] bg-[var(--surface-secondary)]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-[var(--text-primary)] mb-1.5">{t('brevo_sender_name')}</label>
                <input
                  type="text"
                  value={editingConfig.brevo_sender_name || ''}
                  onChange={(e) => setEditingConfig((p) => ({ ...p, brevo_sender_name: e.target.value }))}
                  placeholder="e.g. NexusFinance (max 11 chars)"
                  className="w-full bg-[var(--surface-secondary)] border border-[var(--border-primary)] p-3 rounded-lg text-[14px] font-mono focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)] bg-[var(--surface-secondary)]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-[var(--border-primary)]">
            <div>
              {savedMessage && (
                <span className="font-bold text-[13px] flex items-center gap-1 animate-pulse" style={{color: 'var(--success-text)'}}>
                  <ShieldCheck className="w-4 h-4" /> {t('parameters_saved')}
                </span>
              )}
            </div>
            
            <button
              type="submit"
              className="px-6 py-3 premium-btn-primary text-white rounded-lg text-[13.5px] font-bold cursor-pointer"
            >
              {t('apply_system_parameters')}
            </button>
          </div>
        </form>

      </div>}

      {/* Stats Detail Modals */}
      {selectedStat !== null && (
        <Modal
          isOpen={selectedStat !== null}
          onClose={() => setSelectedStat(null)}
          maxWidth="max-w-3xl"
        >
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-[var(--border-primary)]">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">
                {selectedStat === 'volume'
                  ? 'Total Cash Disbursed'
                  : selectedStat === 'customers'
                  ? 'Active Customers Directory'
                  : selectedStat === 'outstanding'
                  ? 'Total Owed by Customers'
                  : 'Projected Interest (1 Year)'}
              </h3>
            </div>

            <div className="space-y-4">
              <p className="text-[13px] text-[var(--text-secondary)]">
                {selectedStat === 'volume'
                  ? 'History of all disbursed loans contributing to total cash outlays.'
                  : selectedStat === 'customers'
                  ? 'Directory of registered customer profiles active on the platform.'
                  : selectedStat === 'outstanding'
                  ? 'Current active principal debt balances owed by platform customers.'
                  : 'Annualized projected gross interest yield generated by current outstanding balances.'}
              </p>

              <div className="overflow-x-auto max-h-[400px] overflow-y-auto border border-[var(--border-primary)] rounded-2xl custom-scrollbar">
                <table className="w-full text-left border-collapse text-[13px]">
                  <thead className="bg-[var(--surface-secondary)] sticky top-0 z-10 text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] border-b border-[var(--border-primary)]">
                    {selectedStat === 'volume' && (
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">ID</th>
                        <th className="px-4 py-3">Customer</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                      </tr>
                    )}
                    {selectedStat === 'customers' && (
                      <tr>
                        <th className="px-4 py-3">ID</th>
                        <th className="px-4 py-3">Name</th>
                        {config.emailVerificationRequired !== false && <th className="px-4 py-3">Email</th>}
                        <th className="px-4 py-3">Phone</th>
                      </tr>
                    )}
                    {selectedStat === 'outstanding' && (
                      <tr>
                        <th className="px-4 py-3">Customer</th>
                        {config.emailVerificationRequired !== false && <th className="px-4 py-3">Email</th>}
                        <th className="px-4 py-3">Phone</th>
                        <th className="px-4 py-3 text-right">Outstanding Balance</th>
                      </tr>
                    )}
                    {selectedStat === 'yields' && (
                      <tr>
                        <th className="px-4 py-3">Customer</th>
                        <th className="px-4 py-3 text-right">Balance</th>
                        <th className="px-4 py-3 text-center">APR</th>
                        <th className="px-4 py-3 text-right">Projected Yield</th>
                      </tr>
                    )}
                  </thead>
                  <tbody className="divide-y divide-[var(--border-secondary)] text-[var(--text-primary)]">
                    {selectedStat === 'volume' && (
                      (!stats.volumeTransactions || stats.volumeTransactions.length === 0) ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-[var(--text-tertiary)]">No disbursements found.</td>
                        </tr>
                      ) : stats.volumeTransactions.map((tx: any) => (
                        <tr key={tx.id} className="hover:bg-[var(--surface-secondary)]/50 transition-colors">
                          <td className="px-4 py-3 font-mono">{tx.date}</td>
                          <td className="px-4 py-3 font-mono text-[var(--text-tertiary)]">{tx.id}</td>
                          <td className="px-4 py-3">
                            <span className="font-bold block">{tx.userName}</span>
                            <span className="text-[11px] text-[var(--text-tertiary)] block">{tx.userPhone || tx.userEmail}</span>
                          </td>
                          <td className="px-4 py-3 text-right font-extrabold font-mono text-emerald-600">
                            +{formatCurrency(Math.abs(tx.amount))}
                          </td>
                        </tr>
                      ))
                    )}

                    {selectedStat === 'customers' && (
                      (!stats.customerList || stats.customerList.length === 0) ? (
                        <tr>
                          <td colSpan={config.emailVerificationRequired !== false ? 4 : 3} className="px-4 py-8 text-center text-[var(--text-tertiary)]">No customers found.</td>
                        </tr>
                      ) : stats.customerList.map((c: any) => (
                        <tr key={c.id} className="hover:bg-[var(--surface-secondary)]/50 transition-colors">
                          <td className="px-4 py-3 font-mono text-[var(--text-tertiary)]">{c.id}</td>
                          <td className="px-4 py-3 font-bold">{c.name}</td>
                          {config.emailVerificationRequired !== false && <td className="px-4 py-3 font-mono text-[var(--text-tertiary)]">{c.email}</td>}
                          <td className="px-4 py-3 font-mono">{c.phone || '-'}</td>
                        </tr>
                      ))
                    )}

                    {selectedStat === 'outstanding' && (
                      (!stats.outstandingCustomers || stats.outstandingCustomers.length === 0) ? (
                        <tr>
                          <td colSpan={config.emailVerificationRequired !== false ? 4 : 3} className="px-4 py-8 text-center text-[var(--text-tertiary)]">No outstanding balances.</td>
                        </tr>
                      ) : stats.outstandingCustomers.map((c: any, index: number) => (
                        <tr key={index} className="hover:bg-[var(--surface-secondary)]/50 transition-colors">
                          <td className="px-4 py-3 font-bold">{c.name}</td>
                          {config.emailVerificationRequired !== false && <td className="px-4 py-3 font-mono text-[var(--text-tertiary)]">{c.email}</td>}
                          <td className="px-4 py-3 font-mono">{c.phone || '-'}</td>
                          <td className="px-4 py-3 text-right font-extrabold font-mono text-[var(--text-primary)]">
                            {formatCurrency(c.balance)}
                          </td>
                        </tr>
                      ))
                    )}

                    {selectedStat === 'yields' && (
                      (!stats.yieldCustomers || stats.yieldCustomers.length === 0) ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-[var(--text-tertiary)]">No yields active.</td>
                        </tr>
                      ) : stats.yieldCustomers.map((c: any, index: number) => (
                        <tr key={index} className="hover:bg-[var(--surface-secondary)]/50 transition-colors">
                          <td className="px-4 py-3 font-bold">{c.name}</td>
                          <td className="px-4 py-3 text-right font-mono text-[var(--text-secondary)]">
                            {formatCurrency(c.balance)}
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-[var(--accent)]">
                            {c.rate}%
                          </td>
                          <td className="px-4 py-3 text-right font-extrabold font-mono text-emerald-600">
                            {formatCurrency(c.annualYield)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-2 border-t border-[var(--border-primary)]">
                <button
                  onClick={() => setSelectedStat(null)}
                  className="px-4 py-2 text-[13px] font-bold bg-[var(--surface-secondary)] text-[var(--text-primary)] rounded-xl border border-[var(--border-primary)] hover:bg-[var(--surface-tertiary)] transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
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
