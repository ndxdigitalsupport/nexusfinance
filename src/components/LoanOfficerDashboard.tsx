import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  ChevronRight, 
  ChevronLeft, 
  Video, 
  BellRing, 
  UserCheck2,
  FileClock,
  ClockAlert,
  Inbox,
  AlertTriangle,
  Award,
  Sparkles,
  Search,
  CheckCircle2
} from 'lucide-react';
import { LoanApplication, Task } from '../types';

interface LoanOfficerDashboardProps {
  applications: LoanApplication[];
  tasks: Task[];
  searchTerm: string;
  onOpenDetails: (app: LoanApplication) => void;
  onJoinMeeting: (task: Task) => void;
}

export default function LoanOfficerDashboard({
  applications,
  tasks,
  searchTerm,
  onOpenDetails,
  onJoinMeeting
}: LoanOfficerDashboardProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'urgent' | 'assigned'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Dynamically compute Statistics based on state!
  const assignedCount = applications.filter(app => app.assignedToMe).length;
  const pendingCount = applications.filter(app => app.status === 'New' || app.status === 'Review').length;
  const urgentCount = applications.filter(app => app.urgency === 'Urgent' && (app.status === 'New' || app.status === 'Review')).length;

  // Filter List based on Search & Tabs
  const filteredApps = applications.filter((app) => {
    const matchesSearch = 
      app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.type.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'urgent') return app.urgency === 'Urgent';
    if (activeTab === 'assigned') return app.assignedToMe;
    return true; // "all"
  });

  // Pagination resolver
  const totalPages = Math.ceil(filteredApps.length / itemsPerPage) || 1;
  const paginatedApps = filteredApps.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const startIdx = (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, filteredApps.length);

  // Status Chart calculations
  const chartStats = {
    new: applications.filter(app => app.status === 'New').length,
    review: applications.filter(app => app.status === 'Review').length,
    final: applications.filter(app => app.status === 'Final' || app.status === 'Approved').length,
    hold: applications.filter(app => app.status === 'Hold').length,
  };

  // Find next task
  const nextVideoTask = tasks.find(t => t.title.toLowerCase().includes('verification') && !t.completed) || tasks[0];



  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Page Title & Heading */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[var(--accent)]/10 text-[var(--accent)] uppercase tracking-wider">
              Corporate Workspace
            </span>
          </div>
          <h2 className="text-[28px] font-extrabold text-[var(--text-primary)] tracking-tight mt-1">Pending Applications</h2>
          <p className="text-[13px] text-[var(--text-secondary)] font-medium mt-0.5">Manage and review your assigned loan requests.</p>
        </div>
      </div>

      {/* Grid Layout Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (Spans 8 grids) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Stats Cards Row - 3 Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Stat Card 1: Pending Queue */}
            <div className="bg-[var(--surface-card)] rounded-2xl p-5 border border-[var(--border-primary)] shadow-xs hover:shadow-md transition duration-200 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--accent)]/5 rounded-bl-full transition-transform duration-300 group-hover:scale-110" />
              <div className="flex justify-between items-start mb-3 relative z-10">
                <div className="p-2 bg-[var(--accent)]/10 rounded-xl text-[var(--accent)]">
                  <Inbox className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-extrabold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">Active</span>
              </div>
              <div className="relative z-10">
                <span className="text-[11px] uppercase tracking-wider font-extrabold text-[var(--text-tertiary)] block">Pending Queue</span>
                <span className="text-[32px] font-extrabold text-[var(--text-primary)] leading-none tracking-tight block mt-1">
                  {pendingCount.toString().padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Stat Card 2: Assigned to Me */}
            <div className="premium-card-dark rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group shadow-md">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-bl-full transition-transform duration-300 group-hover:scale-110" />
              <div className="flex justify-between items-start mb-3 relative z-10">
                <div className="p-2 bg-white/10 rounded-xl text-[var(--card-dark-text-bright)]">
                  <UserCheck2 className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-extrabold text-[var(--accent)] bg-[var(--accent)]/20 px-2 py-0.5 rounded-full">Direct</span>
              </div>
              <div className="relative z-10">
                <span className="text-[11px] uppercase tracking-wider font-extrabold text-[var(--card-dark-text)] block">Assigned to Me</span>
                <span className="text-[32px] font-extrabold text-[var(--card-dark-text-bright)] leading-none tracking-tight block mt-1">
                  {assignedCount}
                </span>
              </div>
            </div>

            {/* Stat Card 3: Urgent Cases */}
            <div className="bg-[var(--surface-card)] rounded-2xl p-5 border border-[var(--border-primary)] shadow-xs hover:shadow-md transition duration-200 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-full transition-transform duration-300 group-hover:scale-110" />
              <div className="flex justify-between items-start mb-3 relative z-10">
                <div className="p-2 bg-rose-500/10 rounded-xl text-rose-500">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                {urgentCount > 0 ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse mt-2 mr-1" />
                ) : (
                  <span className="text-[11px] font-extrabold text-[var(--text-tertiary)] bg-[var(--surface-secondary)] px-2 py-0.5 rounded-full">Clear</span>
                )}
              </div>
              <div className="relative z-10">
                <span className="text-[11px] uppercase tracking-wider font-extrabold text-[var(--text-tertiary)] block">Urgent Action</span>
                <span className="text-[32px] font-extrabold text-rose-500 leading-none tracking-tight block mt-1">
                  {urgentCount.toString().padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>

          {/* Filtering Tab Container */}
          <div className="bg-[var(--surface-secondary)] p-1 rounded-xl border border-[var(--border-primary)] flex gap-1 select-none">
            <button
              onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
              className={`flex-1 text-center py-2 text-[13px] font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[var(--surface-card)] text-[var(--text-primary)] shadow-sm border border-[var(--border-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              All Applications ({applications.length})
            </button>
            
            <button
              onClick={() => { setActiveTab('urgent'); setCurrentPage(1); }}
              className={`flex-1 text-center py-2 text-[13px] font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'urgent'
                  ? 'bg-[var(--surface-card)] text-[var(--text-primary)] shadow-sm border border-[var(--border-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Urgent ({applications.filter(a => a.urgency === 'Urgent').length})
            </button>
            
            <button
              onClick={() => { setActiveTab('assigned'); setCurrentPage(1); }}
              className={`flex-1 text-center py-2 text-[13px] font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'assigned'
                  ? 'bg-[var(--surface-card)] text-[var(--text-primary)] shadow-sm border border-[var(--border-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Assigned to me ({applications.filter(a => a.assignedToMe).length})
            </button>
          </div>

          {/* Application Registry Table Panel */}
          <div className="bg-[var(--surface-card)] rounded-2xl border border-[var(--border-primary)] shadow-xs overflow-hidden">
            
            {/* Table headers */}
            <div className="hidden sm:grid grid-cols-12 bg-[var(--surface-secondary)] px-6 py-4 border-b border-[var(--border-primary)]">
              <div className="col-span-8 text-[11px] text-[var(--text-secondary)] uppercase tracking-wider font-extrabold">Applicant / Reference</div>
              <div className="col-span-4 text-[11px] text-[var(--text-secondary)] uppercase tracking-wider font-extrabold text-right">Loan Value</div>
            </div>

            {/* List collection */}
            <div className="divide-y divide-[var(--border-secondary)] select-none">
              {paginatedApps.length > 0 ? (
                paginatedApps.map((app) => {
                  const isUrgent = app.urgency === 'Urgent' && (app.status === 'New' || app.status === 'Review');
                  const score = app.creditScore || 700;
                  return (
                    <div
                      key={app.id}
                      onClick={() => onOpenDetails(app)}
                      className={`flex flex-col sm:grid sm:grid-cols-12 px-6 py-5 gap-3 sm:gap-0 items-start sm:items-center hover:bg-[var(--surface-secondary)]/30 transition cursor-pointer border-l-4 ${
                        isUrgent ? 'border-rose-500 bg-rose-500/[0.02] hover:bg-rose-500/[0.04]' : 'border-transparent hover:border-[var(--accent)]'
                      } group`}
                    >
                      {/* Name / Sub-references */}
                      <div className="sm:col-span-8 flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[var(--accent)]/15 to-[var(--accent)]/5 text-[var(--accent)] flex items-center justify-center text-[15px] font-extrabold shadow-sm shrink-0 transition-transform duration-200 group-hover:scale-105">
                          {app.initials}
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center flex-wrap gap-2">
                            <span className="text-[15.5px] text-[var(--text-primary)] font-bold group-hover:text-[var(--accent)] transition-colors">{app.applicantName}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-[12px] text-[var(--text-secondary)] font-medium">
                            <span className="font-semibold">ID: {app.id}</span>
                            <span className="text-[var(--text-tertiary)]">•</span>
                            {isUrgent && (
                              <span className="text-rose-500 font-extrabold uppercase text-[9px] tracking-wider bg-rose-500/10 px-1.5 py-0.5 rounded">
                                Urgent
                              </span>
                            )}
                            {app.status === 'Approved' && (
                              <span className="text-emerald-500 font-extrabold uppercase text-[9px] tracking-wider bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                Approved
                              </span>
                            )}
                            {app.status === 'Rejected' && (
                              <span className="text-rose-500 font-extrabold uppercase text-[9px] tracking-wider bg-rose-500/10 px-1.5 py-0.5 rounded">
                                Rejected
                              </span>
                            )}
                            {app.status === 'Review' && (
                              <span className="text-amber-500 font-extrabold uppercase text-[9px] tracking-wider bg-amber-500/10 px-1.5 py-0.5 rounded">
                                In Review
                              </span>
                            )}
                            {app.status === 'New' && (
                              <span className="text-blue-500 font-extrabold uppercase text-[9px] tracking-wider bg-blue-500/10 px-1.5 py-0.5 rounded">
                                New Application
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Loan values / descriptions */}
                      <div className="sm:col-span-4 text-left sm:text-right ml-15 sm:ml-0">
                        <div className="text-[17px] text-[var(--text-primary)] font-extrabold tracking-tight">
                          ${app.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[12px] text-[var(--text-tertiary)] font-bold mt-0.5 uppercase tracking-wider">{app.type}</div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-12 text-center text-[var(--text-secondary)] font-medium">
                  No matching files registered under selection categories.
                </div>
              )}
            </div>

            {/* Pagination Controls HUD */}
            {filteredApps.length > 0 && (
              <div className="bg-[var(--surface-secondary)]/40 px-6 py-4 border-t border-[var(--border-primary)] flex justify-between items-center select-none">
                <span className="text-[12.5px] font-semibold text-[var(--text-secondary)]">
                  Showing {startIdx}-{endIdx} of {filteredApps.length} applications
                </span>
                
                <div className="flex items-center gap-3">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-primary)] rounded-lg transition disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                  </button>
                  
                  <span className="text-[12.5px] font-bold text-[var(--text-primary)] tracking-wide">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-primary)] rounded-lg transition disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar Column (Spans 4 grids) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Visual Status Chart Card */}
          <div className="bg-[var(--surface-card)] rounded-2xl p-6 border border-[var(--border-primary)] shadow-xs select-none">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-[16px] font-extrabold text-[var(--text-primary)] tracking-tight">Applications by Status</h3>
            </div>

            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={[
                { name: 'New', value: chartStats.new, fill: 'var(--accent-muted)' },
                { name: 'Review', value: chartStats.review, fill: 'var(--accent)' },
                { name: 'Final', value: chartStats.final, fill: 'var(--accent)' },
                { name: 'Hold', value: chartStats.hold, fill: 'var(--warning-text)' },
              ]} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--surface-elevated)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                  }}
                  formatter={(val: number) => [`${val} applications`, 'Count']}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>

            <div className="flex justify-between items-center text-[10.5px] font-bold pt-3 border-t border-[var(--border-primary)] text-[var(--text-tertiary)] uppercase tracking-wider">
              <span>Total recorded: {applications.length} applications</span>
            </div>
          </div>

          {/* Compliance Tasks Checklist Card */}
          <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl p-5 shadow-xs relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full rounded-r bg-[var(--accent)]" />
            
            <div className="relative z-10 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-[16px] font-extrabold text-[var(--text-primary)] tracking-tight">Pending Tasks</h3>
                  <p className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mt-0.5">Compliance checklist</p>
                </div>
                <div className="p-1.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
                  <BellRing className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-3">
                {tasks && tasks.filter(t => !t.completed).slice(0, 3).map((task) => (
                  <div key={task.id} className="p-3.5 bg-[var(--surface-secondary)] border border-[var(--border-primary)]/80 rounded-xl hover:border-[var(--text-primary)] transition-all flex items-start gap-3">
                    <div className="w-5 h-5 rounded-md border border-[var(--border-primary)] flex items-center justify-center shrink-0 mt-0.5 bg-[var(--surface-primary)] select-none">
                      <span className="w-2.5 h-2.5 rounded-sm bg-[var(--accent)] opacity-40" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <h4 className="text-[13px] font-bold text-[var(--text-primary)] leading-tight">{task.title}</h4>
                      <p className="text-[11.5px] text-[var(--text-secondary)] font-medium">Applicant: <span className="font-bold text-[var(--text-primary)]">{task.applicant}</span></p>
                      <p className="text-[11px] text-[var(--text-tertiary)] font-bold uppercase tracking-wider mt-0.5">{task.regarding}</p>
                    </div>
                  </div>
                ))}
                {(!tasks || tasks.filter(t => !t.completed).length === 0) && (
                  <div className="p-6 text-center text-[12px] text-[var(--text-secondary)] font-medium">
                    🎉 All compliance tasks completed!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
