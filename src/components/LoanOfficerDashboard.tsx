import React, { useState } from 'react';
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
        <h2 className="text-[32px] md:text-[40px] md:leading-[48px] font-sans font-extrabold text-[#0F171C] tracking-tight mb-2">Pending Applications</h2>
        <p className="text-[17px] text-[#44474a] font-medium leading-relaxed">Manage and review your assigned loan requests.</p>
      </div>

      {/* Grid Layout Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (Spans 8 grids) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Stats Cards row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Stat Card 1: Slate Obsidian */}
            <div className="bg-[#0F171C] rounded-2xl p-6 flex flex-col justify-between shadow-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-bl-full transition-transform duration-300 group-hover:scale-110"></div>
              <div className="flex items-center gap-2 mb-4">
                <UserCheck2 className="text-[#bfc8ce] w-5 h-5" />
                <span className="font-bold text-[13px] text-[#bfc8ce] uppercase tracking-widest font-sans">Assigned to database</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-[64px] font-extrabold text-white leading-none tracking-tighter select-none">{assignedCount}</span>
                <span className="text-[13px] text-[#5CF2D0] font-bold">+2 this week</span>
              </div>
            </div>

            {/* Stat Card 2: Neutral card */}
            <div className="bg-white rounded-2xl p-6 flex flex-col justify-between border border-[#c4c7ca] shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-4">
                <FileClock className="text-[#44474a] w-5 h-5" />
                <span className="font-bold text-[13px] text-[#44474a] uppercase tracking-widest font-sans">Pending requests</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-[64px] font-extrabold text-[#0F171C] leading-none tracking-tighter select-none">
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
                  ? 'bg-[#0F171C] text-white shadow-sm'
                  : 'bg-white text-[#44474a] border border-[#c4c7ca] hover:border-[#0F171C] hover:text-[#0F171C]'
              }`}
            >
              All Applications ({applications.length})
            </button>
            
            <button
              onClick={() => { setActiveTab('urgent'); setCurrentPage(1); }}
              className={`px-6 py-2.5 text-[13px] font-bold rounded-full transition cursor-pointer ${
                activeTab === 'urgent'
                  ? 'bg-[#0F171C] text-white shadow-sm'
                  : 'bg-white text-[#44474a] border border-[#c4c7ca] hover:border-[#0F171C] hover:text-[#0F171C]'
              }`}
            >
              Urgent ({applications.filter(a => a.urgency === 'Urgent').length})
            </button>
            
            <button
              onClick={() => { setActiveTab('assigned'); setCurrentPage(1); }}
              className={`px-6 py-2.5 text-[13px] font-bold rounded-full transition cursor-pointer ${
                activeTab === 'assigned'
                  ? 'bg-[#0F171C] text-white shadow-sm'
                  : 'bg-white text-[#44474a] border border-[#c4c7ca] hover:border-[#0F171C] hover:text-[#0F171C]'
              }`}
            >
              Assigned to me ({applications.filter(a => a.assignedToMe).length})
            </button>
          </div>

          {/* Application Registry Table Panel */}
          <div className="bg-white rounded-2xl border border-[#c4c7ca] shadow-xs overflow-hidden">
            
            {/* Table headers */}
            <div className="grid grid-cols-12 bg-[#f1f4f6] px-6 sm:px-8 py-5 border-b border-[#c4c7ca]/85">
              <div className="col-span-8 text-[12px] text-[#44474a] uppercase tracking-widest font-bold">Applicant / Reference</div>
              <div className="col-span-4 text-[12px] text-[#44474a] uppercase tracking-widest font-bold text-right">Loan value</div>
            </div>

            {/* List collection */}
            <div className="divide-y divide-[#c4c7ca]/70 select-none">
              {paginatedApps.length > 0 ? (
                paginatedApps.map((app) => {
                  const isUrgent = app.urgency === 'Urgent' && (app.status === 'New' || app.status === 'Review');
                  return (
                    <div
                      key={app.id}
                      onClick={() => onOpenDetails(app)}
                      className={`grid grid-cols-12 px-6 sm:px-8 py-6 items-center hover:bg-[#f1f4f6]/50 transition cursor-pointer border-l-4 ${
                        isUrgent ? 'border-red-600 bg-red-50/20 hover:bg-red-50/40' : 'border-transparent hover:border-[#5CF2D0]'
                      } group`}
                    >
                      {/* Name / Sub-references */}
                      <div className="col-span-8 flex items-center gap-4 sm:gap-5">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-[16px] font-extrabold shadow-xs shrink-0 select-none transition-transform duration-200 group-hover:scale-105 ${
                          app.initials === 'SV' ? 'bg-[#dbe4eb] text-slate-700' : app.initials === 'NK' ? 'bg-slate-200 text-[#0F171C]' : 'bg-[#62f7d5]/35 text-[#005142]'
                        }`}>
                          {app.initials}
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4">
                          <div>
                            <div className="text-[17px] text-[#0F171C] font-extrabold group-hover:text-emerald-800 transition-colors">{app.applicantName}</div>
                            <div className="text-[13.5px] text-[#44474a] font-medium mt-0.5">App ID: {app.id}</div>
                          </div>
                          {isUrgent && (
                            <span className="inline-flex px-2 py-0.5 bg-red-100 text-red-600 text-[10px] uppercase tracking-wider font-extrabold rounded border border-red-200 h-fit w-fit select-none shrink-0 leading-none">
                              Urgent
                            </span>
                          )}
                          {app.status === 'Approved' && (
                            <span className="inline-flex px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] uppercase tracking-wider font-extrabold rounded border border-emerald-200 h-fit w-fit select-none shrink-0 leading-none">
                              Approved
                            </span>
                          )}
                          {app.status === 'Rejected' && (
                            <span className="inline-flex px-2 py-0.5 bg-red-100 text-red-700 text-[10px] uppercase tracking-wider font-extrabold rounded border border-red-200 h-fit w-fit select-none shrink-0 leading-none">
                              Rejected
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Loan values / descriptions */}
                      <div className="col-span-4 text-right">
                        <div className="text-[19px] sm:text-[21px] text-[#0F171C] font-extrabold tracking-tight">
                          ${app.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[13.5px] text-[#44474a] font-semibold mt-0.5">{app.type}</div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-12 text-center text-[#44474a] font-medium bg-slate-50/50">
                  No matching files registered under selection categories.
                </div>
              )}
            </div>

            {/* Pagination Controls HUD */}
            {filteredApps.length > 0 && (
              <div className="bg-[#f1f4f6]/40 px-6 sm:px-8 py-5 border-t border-[#c4c7ca]/80 flex justify-between items-center">
                <span className="text-[13.5px] font-medium text-[#44474a] select-none">
                  Showing {startIdx}-{endIdx} of {filteredApps.length} applications
                </span>
                
                <div className="flex items-center gap-4">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="p-1 text-[#44474a] hover:text-[#0F171C] hover:bg-[#e0e3e5] rounded-full transition disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                  </button>
                  
                  <span className="text-[13.5px] font-bold text-[#0F171C] tracking-wide select-none">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="p-1 text-[#44474a] hover:text-[#0F171C] hover:bg-[#e0e3e5] rounded-full transition disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
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
          
          {/* Visual CSS Status Chart */}
          <div className="bg-white rounded-2xl p-6 border border-[#c4c7ca] shadow-xs select-none">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-[18px] font-extrabold text-[#0F171C] tracking-tight">Applications by Status</h3>
              <button className="text-[#44474a] hover:text-[#0F171C] hover:bg-[#f1f4f6] p-1.5 rounded-full transition duration-150 cursor-pointer">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            <div className="h-48 flex items-end justify-between gap-4 px-2 pb-2.5 border-b-2 border-[#c4c7ca] relative mb-2 pr-4">
              
              <div className="absolute w-full h-full flex flex-col justify-between z-0 pointer-events-none pb-2.5 pr-4 left-0">
                <div className="w-full border-t border-gray-100 border-dashed"></div>
                <div className="w-full border-t border-gray-100 border-dashed"></div>
                <div className="w-full border-t border-gray-100 border-dashed"></div>
                <div className="w-full"></div>
              </div>

              {[
                { key: 'new', label: 'New', value: chartStats.new, gradient: 'from-[#dbe4eb] to-[#bfc8ce]', textColor: 'text-[#44474a]', hoverGradient: 'hover:from-[#0F171C] hover:to-[#2a3a44]' },
                { key: 'review', label: 'Review', value: chartStats.review, gradient: 'from-[#0F171C] to-[#1a2a34]', textColor: 'text-[#5CF2D0]', hoverGradient: '' },
                { key: 'final', label: 'Final', value: chartStats.final, gradient: 'from-[#dbe4eb] to-[#bfc8ce]', textColor: 'text-[#44474a]', hoverGradient: 'hover:from-[#0F171C] hover:to-[#2a3a44]' },
                { key: 'hold', label: 'Hold', value: chartStats.hold, gradient: 'from-[#bfc8ce] to-[#a0adb5]', textColor: 'text-gray-700', hoverGradient: 'hover:from-[#44474a] hover:to-[#5a6a74]' },
              ].map((bar) => {
                const pct = chartMaxVal > 0 ? Math.round((bar.value / chartMaxVal) * 100) : 0;
                return (
                  <div key={bar.key} className="flex flex-col items-center gap-2.5 z-10 group w-1/4 relative">
                    <div
                      className={`w-full max-w-[40px] bg-gradient-to-t ${bar.gradient} ${bar.hoverGradient} rounded-t-md transition-all duration-300 font-mono font-bold text-[11px] ${bar.textColor} flex flex-col justify-start items-center pt-1.5 shadow-inner cursor-default`}
                      style={{ height: `${Math.max((bar.value / chartMaxVal) * 110 + 15, 24)}px` }}
                    >
                      {bar.value}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#44474a]">{bar.label}</span>
                    {bar.value > 0 && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0F171C] text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-lg">
                        {pct}% of total
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Chart Subtitle summary */}
            <div className="flex justify-between items-center px-1 text-[11px] font-semibold text-slate-500 pt-2 border-t border-slate-50 select-text">
              <span>Total recorded: {applications.length} loan applications</span>
              <span className="text-emerald-700 font-bold font-mono">Durable Storage</span>
            </div>
          </div>

          {/* Next Task Call Panel CARD */}
          {nextVideoTask && (
            <div className="bg-white border border-[#c4c7ca] rounded-2xl p-6 shadow-xs relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 flex h-full bg-[#0F171C]"></div>
              
              <div className="relative z-10 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-[20px] font-extrabold text-[#0F171C] tracking-tight">Next Task</h3>
                    <p className="text-[11.5px] font-bold text-[#44474a] uppercase tracking-wider mt-0.5">Scheduled: {nextVideoTask.time}</p>
                  </div>
                  <div className="p-2 bg-[#62f7d5]/30 text-[#005142] rounded-full animate-bounce">
                    <BellRing className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-[#f1f4f6] border border-[#c4c7ca]/75 rounded-xl p-4.5 hover:border-[#0F171C] transition-colors duration-150">
                  <div className="flex items-center gap-3.5 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-[#0F171C] flex items-center justify-center text-white shadow-xs">
                      <Video className="w-4.5 h-4.5 text-[#5CF2D0]" />
                    </div>
                    <h4 className="text-[16px] font-extrabold text-[#0F171C] leading-none">{nextVideoTask.title}</h4>
                  </div>

                  <div className="space-y-1 text-[13.5px] mb-5 border-b border-gray-200/50 pb-3">
                    <p className="text-[#44474a]">Applicant: <span className="font-extrabold text-[#0F171C]">{nextVideoTask.applicant}</span></p>
                    <p className="text-[#44474a]">Regarding: <span className="font-semibold text-slate-600">{nextVideoTask.regarding}</span></p>
                  </div>

                  <button
                    onClick={() => onJoinMeeting(nextVideoTask)}
                    className="w-full bg-[#0F171C] hover:bg-slate-800 text-white font-bold text-[14.5px] py-3.5 rounded-lg transition shadow-sm hover:shadow-md flex justify-center items-center gap-2 group cursor-pointer"
                  >
                    <Video className="w-4.5 h-4.5 text-[#5CF2D0] group-hover:scale-105" />
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
