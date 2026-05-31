import React, { useState } from 'react';
import { 
  Settings2, 
  Activity, 
  ShieldCheck, 
  ArrowUpRight,
  Database,
  Users,
  FileCheck2,
  TrendingUp
} from 'lucide-react';
import { PlatformConfig, PlatformStats } from '../types';

interface SuperAdminDashboardProps {
  config: PlatformConfig;
  stats: PlatformStats;
  onUpdateConfig: (newConfig: PlatformConfig) => void;
  view?: 'dashboard' | 'settings';
}

export default function SuperAdminDashboard({
  config,
  stats,
  onUpdateConfig,
  view = 'dashboard'
}: SuperAdminDashboardProps) {
  const [editingConfig, setEditingConfig] = useState<PlatformConfig>({ ...config });
  const [logs, setLogs] = useState([
    { id: 1, action: 'Auto-Underwrite rules applied to SVM81', time: '10 mins ago', admin: 'AI Engine' },
    { id: 2, action: 'Interest Matrix adjusted from 5.2% to 5.4%', time: '1 hr ago', admin: 'Admin System' },
    { id: 3, action: 'Platform collateral audit checks completed', time: '12 hrs ago', admin: 'Compliance bot' },
  ]);
  const [savedMessage, setSavedMessage] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(editingConfig);
    setLogs((prev) => [
      { id: Date.now(), action: `Configuration variables updated systemwide. APR: ${editingConfig.baseInterestRate}%`, time: 'Just now', admin: 'You' },
      ...prev,
    ]);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2000);
  };

  const currentStatsItems = [
    { label: 'Total Volume under Management', value: `$${stats.totalVolume.toLocaleString()}`, change: '+14% mom', icon: Database, bg: 'bg-emerald-50 text-emerald-600' },
    { label: 'Active Enrolled Customers', value: stats.activeCustomers.toString(), change: '+8 this week', icon: Users, bg: 'bg-indigo-50 text-indigo-600' },
    { label: 'Total Outstanding Portfolio', value: `$${stats.outstandingBalanceValue.toLocaleString()}`, change: '-5% repayments', icon: FileCheck2, bg: 'bg-blue-50 text-blue-600' },
    { label: 'Gross Yields Generated (APR)', value: `$${stats.interestEarned.toLocaleString()}`, change: '+18% yoy', icon: TrendingUp, bg: 'bg-teal-50 text-[#006b59]' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200 font-sans">
      
      {/* Title */}
      <div>
        <h2 className="text-[32px] md:text-[36px] font-sans font-extrabold text-[#0E171C] tracking-tight">Super Admin Hub</h2>
        <p className="text-[14.5px] text-[#44474a] font-medium mt-0.5">Global ledger controls, parameters and auto-underwriting engines config.</p>
      </div>

      {/* Stats Cards metrics — shown only in dashboard view */}
      {view === 'dashboard' && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-none">
        {currentStatsItems.map((st, i) => {
          const Icon = st.icon;
          return (
            <div key={i} className="bg-white border border-[#c4c7ca] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[12px] font-bold text-[#44474a] uppercase tracking-wider max-w-[150px] leading-tight">{st.label}</span>
                <div className={`p-2.5 rounded-xl ${st.bg}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <span className="text-[26px] font-extrabold text-[#0F171C] font-mono block leading-none">{st.value}</span>
                <span className="text-[11px] text-slate-500 font-bold block mt-1.5 flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" /> {st.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>}

      {view === 'settings' && <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Form panel configuring parameters (Spans 7) */}
        <form onSubmit={handleSave} className="lg:col-span-7 bg-white border border-[#c4c7ca] rounded-2xl p-6 sm:p-8 space-y-6">
          <h3 className="text-[18px] font-sans font-bold text-[#0F171C] border-b pb-2 flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-[#006b59]" /> System Parameters Adjustments
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[13px] font-bold text-[#0F171C] mb-1.5">Base System interest Rate (APR %)</label>
              <input
                type="number"
                step="0.05"
                value={editingConfig.baseInterestRate}
                onChange={(e) => setEditingConfig((p) => ({ ...p, baseInterestRate: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-white border border-[#c4c7ca] p-3 rounded-lg text-[14px] font-mono focus:outline-none focus:border-[#5CF2D0]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[#0F171C] mb-1.5">Auto-Underwrite Limit (USD)</label>
              <input
                type="number"
                step="500"
                value={editingConfig.autoApproveLimit}
                onChange={(e) => setEditingConfig((p) => ({ ...p, autoApproveLimit: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-white border border-[#c4c7ca] p-3 rounded-lg text-[14px] font-mono focus:outline-none focus:border-[#5CF2D0]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[13px] font-bold text-[#0F171C] mb-1.5">System Maximum Credit Limit (USD)</label>
              <input
                type="number"
                step="50000"
                value={editingConfig.maxLoanAmount}
                onChange={(e) => setEditingConfig((p) => ({ ...p, maxLoanAmount: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-white border border-[#c4c7ca] p-3 rounded-lg text-[14px] font-mono focus:outline-none focus:border-[#5CF2D0]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[#0F171C] mb-1.5">Enforce KYC Compliance Video Calls</label>
              <div className="flex items-center gap-2.5 mt-2 select-none">
                <input
                  type="checkbox"
                  id="kycToggle"
                  checked={editingConfig.kycRequired}
                  onChange={(e) => setEditingConfig((p) => ({ ...p, kycRequired: e.target.checked }))}
                  className="w-5 h-5 text-[#006b59] focus:ring-[#5CF2D0] border-[#c4c7ca] rounded"
                />
                <label htmlFor="kycToggle" className="text-[13.5px] font-semibold text-[#181c1e]">Active & Mandatory</label>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            <div>
              {savedMessage && (
                <span className="text-emerald-700 font-bold text-[13px] flex items-center gap-1 animate-pulse">
                  <ShieldCheck className="w-4 h-4" /> Parameters saved successfully!
                </span>
              )}
            </div>
            
            <button
              type="submit"
              className="px-6 py-3 bg-[#0F171C] text-white hover:bg-slate-800 transition duration-150 rounded-lg text-[13.5px] font-bold cursor-pointer"
            >
              Apply System Parameters
            </button>
          </div>
        </form>

        {/* Audit logging trail panel (Spans 5) */}
        <div className="lg:col-span-5 bg-white border border-[#c4c7ca] rounded-2xl p-6 shadow-xs space-y-5">
          <h3 className="text-[16px] font-extrabold text-[#0F171C] border-b pb-2 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#006b59]" /> Core Audit Logs Trails
          </h3>

          <div className="divide-y divide-gray-100 space-y-1.5 text-[13.5px]">
            {logs.map((log) => (
              <div key={log.id} className="py-3 flex justify-between items-start gap-4">
                <div>
                  <span className="text-[#181c1e] font-extrabold block">{log.action}</span>
                  <span className="text-[11px] text-[#74777b] mt-0.5 block">{log.time}</span>
                </div>
                <span className="text-[11px] px-2 py-0.5 bg-gray-100 rounded text-slate-600 font-bold shrink-0 self-start">
                  {log.admin}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>}
    </div>
  );
}
