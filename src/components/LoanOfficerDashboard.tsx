import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  ChevronRight, 
  ChevronLeft, 
  MoreVertical, 
  Video, 
  BellRing, 
  UserCheck2,
  FileClock,
  ClockAlert
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
    // Search matching
    const matchesSearch = 
      app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.type.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // Tab matching
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

  const chartMaxVal = Math.max(chartStats.new, chartStats.review, chartStats.final, chartStats.hold, 1);

  // Find next task
  const nextVideoTask = tasks.find(t => t.title.toLowerCase().includes('verification') && !t.completed) || tasks[0];

  return (
    <div className="space-y-8">
      
      {/* Page Title & Heading */}
      <div>
        <h2 className="text-[32px] md:text-[40px] md:leading-[48px] font-sans font-extrabold text-[var(--text-primary)] tracking-tight mb-2">Pending Applications</h2>
        <p className="text-[17px] text-[var(--text-secondary)] font-medium leading-relaxed">Manage and review your assigned loan requests.</p>
      </div>

      {/* Grid Layout Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (Spans 8 grids) */}
        <div className="lg:col-span-8 space-y-6">
          
            {/* Stats Cards row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Stat Card 1: Slate Obsidian */}
            <div className="stagger-1 premium-card-dark rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-bl-full transition-transform duration-300 group-hover:scale-110"></div>
              <div className="flex items-center gap-2 mb-4">
                <UserCheck2 className="w-5 h-5" style={{ color: 'var(--card-dark-text)' }} />
                <span className="font-bold text-[13px] uppercase tracking-widest font-sans" style={{ color: 'var(--card-dark-text)' }}>Assigned to database</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-[64px] font-extrabold leading-none tracking-tighter select-none" style={{ color: 'var(--card-dark-text-bright)' }}>{assignedCount}</span>
                <span className="text-[13px] font-bold" style={{ color: 'var(--accent)' }}>+2 this week</span>
              </div>
            </div>

            {/* Stat Card 2: Neutral card */}
            <div className="stagger-2 bg-[var(--surface-card)] rounded-2xl p-6 flex flex-col justify-between border border-[var(--border-primary)] shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-4">
                <FileClock className="text-[var(--text-secondary)] w-5 h-5" />
                <span className="font-bold text-[13px] text-[var(--text-secondary)] uppercase tracking-widest font-sans">Pending requests</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-[64px] font-extrabold text-[var(--text-primary)] leading-none tracking-tighter select-none">
                  {pendingCount.toString().padStart(2, '0')}
                </span>
                <span className="text-[13px] text-red-600 font-bold flex items-center gap-1">
                  <ClockAlert className="w-4 h-4 text-red-500 fill-red-100" />
                  {urgentCount} Urgent
                </span>
              </div>
            </div>
          </div>

          {/* Filtering navigation headers */}
          <div className="flex gap-2.5 overflow-x-auto pb-1.5 pt-1.5 select-none scrollbar-none">
            <button
              onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
              className={`px-6 py-2.5 text-[13px] font-bold rounded-full transition cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[var(--card-dark-bg)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] border border-[var(--border-primary)] hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]'
              }`}
            >
              All Applications ({applications.length})
            </button>
            
            <button
              onClick={() => { setActiveTab('urgent'); setCurrentPage(1); }}
              className={`px-6 py-2.5 text-[13px] font-bold rounded-full transition cursor-pointer ${
                activeTab === 'urgent'
                  ? 'bg-[var(--card-dark-bg)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] border border-[var(--border-primary)] hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Urgent ({applications.filter(a => a.urgency === 'Urgent').length})
            </button>
            
            <button
              onClick={() => { setActiveTab('assigned'); setCurrentPage(1); }}
              className={`px-6 py-2.5 text-[13px] font-bold rounded-full transition cursor-pointer ${
                activeTab === 'assigned'
                  ? 'bg-[var(--card-dark-bg)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] border border-[var(--border-primary)] hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Assigned to me ({applications.filter(a => a.assignedToMe).length})
            </button>
          </div>

          {/* Application Registry Table Panel */}
          <div className="bg-[var(--surface-card)] rounded-2xl border border-[var(--border-primary)] shadow-xs overflow-hidden">
            
            {/* Table headers */}
            <div className="hidden sm:grid grid-cols-12 bg-[var(--surface-secondary)] px-6 sm:px-8 py-5 border-b border-[var(--border-primary)]/85">
              <div className="col-span-8 text-[12px] text-[var(--text-secondary)] uppercase tracking-widest font-bold">Applicant / Reference</div>
              <div className="col-span-4 text-[12px] text-[var(--text-secondary)] uppercase tracking-widest font-bold text-right">Loan value</div>
            </div>

            {/* List collection */}
            <div className="divide-y divide-[var(--border-primary)]/70 select-none">
              {paginatedApps.length > 0 ? (
                paginatedApps.map((app) => {
                  const isUrgent = app.urgency === 'Urgent' && (app.status === 'New' || app.status === 'Review');
                  return (
                    <div
                      key={app.id}
                      onClick={() => onOpenDetails(app)}
                      className={`flex flex-col sm:grid sm:grid-cols-12 px-4 sm:px-8 py-4 sm:py-6 gap-2 sm:gap-0 items-start sm:items-center hover:bg-[var(--surface-secondary)]/50 transition cursor-pointer border-l-4 ${
                        isUrgent ? 'border-red-600 bg-red-50/20 hover:bg-red-50/40' : 'border-transparent hover:border-[#5CF2D0]'
                      } group`}
                    >
                      {/* Name / Sub-references */}
                      <div className="sm:col-span-8 flex items-center gap-4 sm:gap-5">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-[16px] font-extrabold shadow-xs shrink-0 select-none transition-transform duration-200 group-hover:scale-105`}
                          style={{
                            backgroundColor: app.initials === 'SV' ? 'var(--surface-tertiary)' : app.initials === 'NK' ? 'var(--surface-secondary)' : 'var(--accent-muted)',
                            color: app.initials === 'SV' ? 'var(--text-primary)' : app.initials === 'NK' ? 'var(--text-primary)' : 'var(--accent)',
                          }}
                        >
                          {app.initials}
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4">
                          <div>
                            <div className="text-[17px] text-[var(--text-primary)] font-extrabold transition-colors">{app.applicantName}</div>
                            <div className="text-[13.5px] text-[var(--text-secondary)] font-medium mt-0.5">App ID: {app.id}</div>
                          </div>
                          {isUrgent && (
                            <span className="premium-badge px-2 py-0.5 h-fit w-fit select-none shrink-0 leading-none"
                              style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error-text)', border: '1px solid var(--error-bg)' }}
                            >
                              Urgent
                            </span>
                          )}
                          {app.status === 'Approved' && (
                            <span className="premium-badge px-2 py-0.5 h-fit w-fit select-none shrink-0 leading-none"
                              style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-text)', border: '1px solid var(--success-bg)' }}
                            >
                              Approved
                            </span>
                          )}
                          {app.status === 'Rejected' && (
                            <span className="premium-badge px-2 py-0.5 h-fit w-fit select-none shrink-0 leading-none"
                              style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error-text)', border: '1px solid var(--error-bg)' }}
                            >
                              Rejected
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Loan values / descriptions */}
                      <div className="sm:col-span-4 text-left sm:text-right ml-16 sm:ml-0">
                        <div className="text-[19px] sm:text-[21px] text-[var(--text-primary)] font-extrabold tracking-tight">
                          ${app.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[13.5px] text-[var(--text-secondary)] font-semibold mt-0.5">{app.type}</div>
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
              <div className="bg-[var(--surface-secondary)]/40 px-6 sm:px-8 py-5 border-t border-[var(--border-primary)]/80 flex justify-between items-center">
                <span className="text-[13.5px] font-medium text-[var(--text-secondary)] select-none">
                  Showing {startIdx}-{endIdx} of {filteredApps.length} applications
                </span>
                
                <div className="flex items-center gap-4">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-primary)] rounded-full transition disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                  </button>
                  
                  <span className="text-[13.5px] font-bold text-[var(--text-primary)] tracking-wide select-none">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-primary)] rounded-full transition disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
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
          
          {/* Visual Status Chart with Recharts */}
          <div className="bg-[var(--surface-card)] rounded-2xl p-6 border border-[var(--border-primary)] shadow-xs select-none">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-[18px] font-extrabold text-[var(--text-primary)] tracking-tight">Applications by Status</h3>
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[
                { name: 'New', value: chartStats.new, fill: 'var(--text-tertiary)' },
                { name: 'Review', value: chartStats.review, fill: 'var(--accent)' },
                { name: 'Final', value: chartStats.final, fill: 'var(--text-tertiary)' },
                { name: 'Hold', value: chartStats.hold, fill: 'var(--warning-text)' },
              ]} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
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
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>

            <div className="flex justify-between items-center text-[11px] font-semibold pt-3 border-t border-[var(--border-primary)]" style={{color: 'var(--text-tertiary)'}}>
              <span>Total recorded: {applications.length} loan applications</span>
            </div>
          </div>

          {/* Next Task Call Panel CARD */}
          {nextVideoTask && (
            <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl p-6 shadow-xs relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full rounded-r" style={{ backgroundColor: 'var(--accent)' }}></div>
              
              <div className="relative z-10 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-[20px] font-extrabold text-[var(--text-primary)] tracking-tight">Next Task</h3>
                    <p className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mt-0.5">Scheduled: {nextVideoTask.time}</p>
                  </div>
                  <div className="p-2 rounded-full animate-bounce"
                    style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--accent)' }}
                  >
                    <BellRing className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-[var(--surface-secondary)] border border-[var(--border-primary)]/75 rounded-xl p-4.5 hover:border-[var(--text-primary)] transition-colors duration-150">
                  <div className="flex items-center gap-3.5 mb-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white shadow-xs"
                      style={{ backgroundColor: 'var(--card-dark-bg)' }}
                    >
                      <Video className="w-4.5 h-4.5" style={{ color: 'var(--accent)' }} />
                    </div>
                    <h4 className="text-[16px] font-extrabold text-[var(--text-primary)] leading-none">{nextVideoTask.title}</h4>
                  </div>

                  <div className="space-y-1 text-[13.5px] mb-5 border-b border-gray-200/50 pb-3">
                    <p className="text-[var(--text-secondary)]">Applicant: <span className="font-extrabold text-[var(--text-primary)]">{nextVideoTask.applicant}</span></p>
                    <p className="text-[var(--text-secondary)]">Regarding: <span className="font-semibold text-slate-600">{nextVideoTask.regarding}</span></p>
                  </div>

                  <button
                    onClick={() => onJoinMeeting(nextVideoTask)}
                    className="w-full premium-btn-primary text-white py-3.5 rounded-lg flex justify-center items-center gap-2 group cursor-pointer"
                  >
                    <Video className="w-4.5 h-4.5 group-hover:scale-105" style={{ color: 'var(--accent)' }} />
                    JOIN MEETING
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
