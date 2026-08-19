import React, { useState } from 'react';
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
}

export default function SuperAdminDashboard({
  config,
  stats,
  auditLogs,
  onUpdateConfig,
  view = 'dashboard',
  applications = []
}: SuperAdminDashboardProps) {
  const [editingConfig, setEditingConfig] = useState<PlatformConfig>({ ...config });
  const [savedMessage, setSavedMessage] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(editingConfig);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2000);
  };

  const currentStatsItems = [
    { label: 'Total Volume under Management', value: `$${stats.totalVolume.toLocaleString()}`, change: '+14% mom', icon: Database },
    { label: 'Active Enrolled Customers', value: stats.activeCustomers.toString(), change: '+8 this week', icon: Users },
    { label: 'Outstanding Portfolio', value: `$${stats.outstandingBalanceValue.toLocaleString()}`, change: '-5% repayments', icon: FileCheck2 },
    { label: 'Gross Yields (APR)', value: `$${stats.interestEarned.toLocaleString()}`, change: '+18% yoy', icon: TrendingUp },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200 font-sans">
      
      {/* Title */}
      <div>
        <h2 className="text-[32px] md:text-[36px] font-sans font-extrabold text-[var(--text-primary)] tracking-tight">Super Admin Hub</h2>
        <p className="text-[14.5px] text-[var(--text-secondary)] font-medium mt-0.5">Global ledger controls, parameters and auto-underwriting engines config.</p>
      </div>

      {/* Stats Cards metrics — shown only in dashboard view */}
      {view === 'dashboard' && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-none">
        {currentStatsItems.map((st, i) => {
          const Icon = st.icon;
          return (
            <div key={i} className={`stagger-${i + 1} premium-card-dark rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group`}>
              <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: 'var(--accent-muted)' }}
              />
              <div className="flex justify-between items-start mb-4 relative z-10">
                <span className="text-[11px] font-bold uppercase tracking-wider max-w-[140px] leading-tight"
                  style={{ color: 'var(--card-dark-text)' }}
                >{st.label}</span>
                <div className="p-2.5 rounded-xl" style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--accent)' }}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="relative z-10">
                <span className="text-[24px] font-extrabold font-mono block leading-none tracking-tight"
                  style={{ color: 'var(--card-dark-text-bright)' }}
                >{st.value}</span>
                <span className="text-[11px] font-bold block mt-1.5 flex items-center gap-1"
                  style={{ color: 'var(--accent)' }}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" /> {st.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>}

      {view === 'dashboard' && (
        <div className="space-y-6">
          {/* Row 2: Graph + System Info (KYC and Quick status) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Recharts Area Chart (Spans 8) */}
            <div className="lg:col-span-8 bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl p-6 space-y-4">
              <div>
                <h3 className="text-[17px] font-sans font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[var(--accent)]" /> Platform Growth & Portfolio Trend
                </h3>
                <p className="text-[12px] text-[var(--text-secondary)]">Overview of total volume under management and outstanding portfolio balance (USD).</p>
              </div>
              
              <div className="h-[260px] w-full text-[12px] font-mono select-none">
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
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" vertical={false} />
                    <XAxis dataKey="month" stroke="var(--text-secondary)" tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--text-secondary)" tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--surface-card)', 
                        borderColor: 'var(--border-primary)',
                        borderRadius: '12px',
                        color: 'var(--text-primary)'
                      }} 
                      itemStyle={{ color: 'var(--text-primary)' }}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Area type="monotone" name="Total Volume" dataKey="volume" stroke="var(--accent)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVolume)" />
                    <Area type="monotone" name="Outstanding Portfolio" dataKey="portfolio" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPortfolio)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right: Quick Action & System Health Info (Spans 4) */}
            <div className="lg:col-span-4 bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl p-6 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <h3 className="text-[17px] font-sans font-bold text-[var(--text-primary)]">
                  ⚙️ System Core Health
                </h3>
                
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between text-[13px] border-b border-[var(--border-primary)] pb-2.5">
                    <span className="text-[var(--text-secondary)] font-medium">Automatic Sweep Schedule</span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-green-500/10 text-green-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> Active ({config.reminder_time || '07:00'})
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[13px] border-b border-[var(--border-primary)] pb-2.5">
                    <span className="text-[var(--text-secondary)] font-medium">Telegram Bot Status</span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-green-500/10 text-green-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> Live & Linked
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[13px] border-b border-[var(--border-primary)] pb-2.5">
                    <span className="text-[var(--text-secondary)] font-medium">Video KYC Enforcement</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${config.kycRequired ? 'bg-purple-500/10 text-purple-400' : 'bg-gray-500/10 text-gray-400'}`}>
                      {config.kycRequired ? 'Mandatory' : 'Optional'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-[var(--text-secondary)] font-medium">Auto-Approve Limit</span>
                    <span className="font-mono font-bold text-[var(--text-primary)]">
                      ${config.autoApproveLimit.toLocaleString()} USD
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-[var(--border-primary)] pt-4 space-y-2 select-none">
                <span className="text-[11px] uppercase tracking-wider font-bold text-[var(--text-tertiary)] block mb-2">Shortcuts & Diagnostics</span>
                <div className="grid grid-cols-2 gap-2 text-[12px] font-bold text-center">
                  <a href="#reminders" className="py-2.5 rounded-lg border border-[var(--border-primary)] hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition">
                    🔔 Reminders
                  </a>
                  <a href="#broadcast" className="py-2.5 rounded-lg border border-[var(--border-primary)] hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition">
                    📢 Broadcast
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Pending applications + Audit logs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Pending Applications List */}
            <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl p-6 space-y-4">
              <div>
                <h3 className="text-[17px] font-sans font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[var(--accent)]" /> Loan Origination Review
                </h3>
                <p className="text-[12px] text-[var(--text-secondary)]">New and review applications awaiting admin or officer verdict.</p>
              </div>

              <div className="divide-y divide-[var(--border-primary)] text-[13px] max-h-[260px] overflow-y-auto pr-1">
                {applications.filter((app: any) => app.status === 'New' || app.status === 'Review').length === 0 ? (
                  <p className="text-[var(--text-tertiary)] text-[13px] py-10 text-center bg-[var(--surface-secondary)]/10 rounded-xl">No pending applications found.</p>
                ) : (
                  applications.filter((app: any) => app.status === 'New' || app.status === 'Review').slice(0, 4).map((app: any) => (
                    <div key={app.id} className="py-3.5 flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-[var(--text-primary)]">{app.applicantName}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-[var(--surface-tertiary)] text-[var(--text-secondary)]">#{app.id.startsWith('#') ? app.id.substring(1) : app.id}</span>
                        </div>
                        <span className="text-[11px] text-[var(--text-tertiary)] mt-0.5 block">{app.type} · Applied {new Date(app.date).toLocaleDateString()}</span>
                      </div>
                      <div className="text-right space-y-1">
                        <span className="font-mono font-bold text-[var(--text-primary)] block">${app.amount.toLocaleString()}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                          app.urgency === 'Urgent' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
                        }`}>
                          {app.urgency}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right: Audit Logs */}
            <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl p-6 space-y-4">
              <div>
                <h3 className="text-[17px] font-sans font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[var(--accent)]" /> Core Security Audit Trail
                </h3>
                <p className="text-[12px] text-[var(--text-secondary)]">Recent operational changes and administrative actions ledger.</p>
              </div>

              <div className="divide-y divide-[var(--border-primary)] text-[12.5px] max-h-[260px] overflow-y-auto pr-1">
                {auditLogs.length === 0 ? (
                  <p className="text-[var(--text-tertiary)] text-[13px] py-10 text-center bg-[var(--surface-secondary)]/10 rounded-xl">No logs recorded yet.</p>
                ) : (
                  auditLogs.slice(0, 4).map((log) => (
                    <div key={log.id} className="py-3.5 space-y-1">
                      <span className="text-[var(--text-primary)] font-bold block leading-tight">{log.details}</span>
                      <div className="flex items-center justify-between text-[11px] text-[var(--text-tertiary)]">
                        <span className="font-semibold text-[var(--text-secondary)]">{log.userEmail}</span>
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {view === 'settings' && <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Form panel configuring parameters (Spans 7) */}
        <form onSubmit={handleSave} className="lg:col-span-7 bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl p-6 sm:p-8 space-y-6">
          <h3 className="text-[18px] font-sans font-bold text-[var(--text-primary)] border-b pb-2 flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-[var(--text-primary)]" /> System Parameters Adjustments
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[13px] font-bold text-[var(--text-primary)] mb-1.5">Base System interest Rate (APR %)</label>
              <input
                type="number"
                step="0.05"
                value={editingConfig.baseInterestRate}
                onChange={(e) => setEditingConfig((p) => ({ ...p, baseInterestRate: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-[var(--surface-secondary)] border border-[var(--border-primary)] p-3 rounded-lg text-[14px] font-mono focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[var(--text-primary)] mb-1.5">Auto-Underwrite Limit (USD)</label>
              <input
                type="number"
                step="500"
                value={editingConfig.autoApproveLimit}
                onChange={(e) => setEditingConfig((p) => ({ ...p, autoApproveLimit: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-[var(--surface-secondary)] border border-[var(--border-primary)] p-3 rounded-lg text-[14px] font-mono focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[13px] font-bold text-[var(--text-primary)] mb-1.5">System Maximum Credit Limit (USD)</label>
              <input
                type="number"
                step="50000"
                value={editingConfig.maxLoanAmount}
                onChange={(e) => setEditingConfig((p) => ({ ...p, maxLoanAmount: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-[var(--surface-secondary)] border border-[var(--border-primary)] p-3 rounded-lg text-[14px] font-mono focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[var(--text-primary)] mb-1.5">Enforce KYC Compliance Video Calls</label>
              <div className="flex items-center gap-2.5 mt-2 select-none">
                <input
                  type="checkbox"
                  id="kycToggle"
                  checked={editingConfig.kycRequired}
                  onChange={(e) => setEditingConfig((p) => ({ ...p, kycRequired: e.target.checked }))}
                  className="w-5 h-5 text-[var(--accent)] focus:ring-[var(--accent)] border-[var(--border-primary)] rounded"
                />
                <label htmlFor="kycToggle" className="text-[13.5px] font-semibold text-[var(--text-primary)]">Active & Mandatory</label>
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--border-primary)] pt-5 space-y-4">
            <h4 className="text-[14px] font-extrabold text-[var(--text-primary)] flex items-center gap-1.5">
              🤖 Telegram Bot Admin Controls
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[13px] font-bold text-[var(--text-primary)] mb-1.5">Telegram Admin Chat ID</label>
                <input
                  type="text"
                  value={editingConfig.telegram_admin_id || ''}
                  onChange={(e) => setEditingConfig((p) => ({ ...p, telegram_admin_id: e.target.value }))}
                  placeholder="e.g. 182736452"
                  className="w-full bg-[var(--surface-secondary)] border border-[var(--border-primary)] p-3 rounded-lg text-[14px] font-mono focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[var(--text-primary)] mb-1.5">Reminder Summary Reports</label>
                <div className="flex items-center gap-2.5 mt-3 select-none">
                  <input
                    type="checkbox"
                    id="adminReportsToggle"
                    checked={editingConfig.enable_admin_reports !== false}
                    onChange={(e) => setEditingConfig((p) => ({ ...p, enable_admin_reports: e.target.checked }))}
                    className="w-5 h-5 text-[var(--accent)] focus:ring-[var(--accent)] border-[var(--border-primary)] rounded"
                  />
                  <label htmlFor="adminReportsToggle" className="text-[13.5px] font-semibold text-[var(--text-primary)]">Send Sweep Reports to Admin</label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-[var(--border-primary)]">
            <div>
              {savedMessage && (
                <span className="font-bold text-[13px] flex items-center gap-1 animate-pulse" style={{color: 'var(--success-text)'}}>
                  <ShieldCheck className="w-4 h-4" /> Parameters saved successfully!
                </span>
              )}
            </div>
            
            <button
              type="submit"
              className="px-6 py-3 premium-btn-primary text-white rounded-lg text-[13.5px] font-bold cursor-pointer"
            >
              Apply System Parameters
            </button>
          </div>
        </form>

        {/* Audit logging trail panel (Spans 5) */}
        <div className="lg:col-span-5 bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl p-6 shadow-xs space-y-5">
          <h3 className="text-[16px] font-extrabold text-[var(--text-primary)] border-b pb-2 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[var(--text-primary)]" /> Core Audit Logs Trails
          </h3>

          <div className="divide-y divide-[var(--border-primary)] space-y-1.5 text-[13.5px] max-h-[320px] overflow-y-auto pr-1">
            {auditLogs.length === 0 ? (
              <p className="text-[var(--text-tertiary)] text-[13px] py-4 text-center">No audit logs yet.</p>
            ) : auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex justify-between items-start gap-4">
                <div>
                  <span className="text-[var(--text-primary)] font-extrabold block">{log.details}</span>
                  <span className="text-[11px] text-[var(--text-tertiary)] mt-0.5 block">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded font-bold shrink-0 self-start"
                  style={{backgroundColor: 'var(--surface-tertiary)', color: 'var(--text-secondary)'}}>
                  {log.userEmail}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>}
    </div>
  );
}
