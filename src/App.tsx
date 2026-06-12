import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowUpDown, X, LayoutDashboard, Landmark, Wallet, History, CheckSquare, Settings, Users, HelpCircle, LogOut, User, PlusCircle, ClipboardList, ChevronDown, QrCode, Mail, HelpCircle as HelpIcon } from 'lucide-react';
import AuthPage from './components/AuthPage';
import Toast, { showToast } from './components/Toast';
import LoanOfficerDashboard from './components/LoanOfficerDashboard';
import CustomerDashboard from './components/CustomerDashboard';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import PortalSelection from './components/PortalSelection';
import ProfilePage from './components/ProfilePage';
import ApplicationDetailsModal from './components/ApplicationDetailsModal';
import ApplyLoanModal from './components/ApplyLoanModal';
import RepayModal from './components/RepayModal';
import LiveMeetingModal from './components/LiveMeetingModal';
import Pagination from './components/Pagination';
import AuditLogView from './components/AuditLogView';
import KHQRPage from './components/KHQRPage';
import { SkeletonTable } from './components/Skeleton';
import Modal from './components/Modal';
import EmptyState from './components/EmptyState';
import StatusBadge from './components/StatusBadge';
import Heading from './components/Heading';
import Table from './components/Table';
import { LoanApplication, Task, Transaction, PlatformConfig, PlatformStats, PortalType } from './types';
import { DEFAULT_CONFIG, DEFAULT_STATS } from './data';
import { API } from './api';

const enc = (id: string) => encodeURIComponent(id);

async function apiFetch(path: string, options?: RequestInit) {
  const token = localStorage.getItem('nexus_token');
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export default function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('nexus_token'));
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => localStorage.getItem('nexus_token') !== null);
  const [currentPortal, setCurrentPortal] = useState<PortalType>(() => {
    return (localStorage.getItem('nexus_portal') as PortalType) || 'portal-selection';
  });
  const [activeMenu, setActiveMenu] = useState(() => localStorage.getItem('nexus_active_menu') || 'dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [outstandingBalance, setOutstandingBalance] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [config, setConfig] = useState<PlatformConfig>(DEFAULT_CONFIG);
  const [stats, setStats] = useState<PlatformStats>(DEFAULT_STATS);

  const [userData, setUserData] = useState<{ id: number; name: string; email: string; role: string } | null>(null);

  const [searchTermInvoice, setSearchTermInvoice] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<LoanApplication | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [isRepayOpen, setIsRepayOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isMeetingOpen, setIsMeetingOpen] = useState(false);
  const [loanPage, setLoanPage] = useState(1);
  const [txPage, setTxPage] = useState(1);
  const [taskPage, setTaskPage] = useState(1);

  const calcBalance = (txs: Transaction[]) =>
    txs.reduce((sum, t) => sum + t.amount, 0);

  const refetchAll = async () => {
    try {
      const [loans, txs, tasksData, configData, statsData, auditData] = await Promise.all([
        apiFetch('/loans'),
        apiFetch('/transactions'),
        apiFetch('/tasks'),
        apiFetch('/config'),
        apiFetch('/stats'),
        apiFetch('/audit/logs').catch(() => []),
      ]);
      setApplications(loans.map((l: any) => ({ ...l, assignedToMe: l.assignedTo === portalUser?.id })));
      setTransactions(txs);
      setOutstandingBalance(Math.abs(calcBalance(txs)));
      setWalletBalance(txs.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0));
      setTasks(tasksData);
      setConfig(configData);
      setStats(statsData);
      setAuditLogs(auditData);
    } catch {
      showToast('Some data failed to load. Check your connection.', 'error');
    }
  };

  useEffect(() => {
    if (!token) return;
    refetchAll();
  }, [token]);

  useEffect(() => {
    ['nexus_applications','nexus_tasks','nexus_transactions','nexus_outstanding_bal','nexus_config','nexus_stats','nexus_is_logged_in']
      .forEach(k => localStorage.removeItem(k));
    const savedPortal = localStorage.getItem('nexus_portal');
    const savedMenu = localStorage.getItem('nexus_active_menu');
    if (savedPortal) setCurrentPortal(savedPortal as PortalType);
    if (savedMenu) setActiveMenu(savedMenu);

    // Check for Google OAuth callback token
    const params = new URLSearchParams(window.location.search);
    const googleToken = params.get('google_token');
    const googleError = params.get('error');
    if (googleToken) {
      handleLoginSuccess(googleToken);
      window.history.replaceState({}, '', window.location.pathname);
    } else if (googleError) {
      console.error('Google OAuth error:', googleError);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const saveToStorage = (key: string, val: string) => localStorage.setItem(key, val);

  async function fetchUserData(newToken: string) {
    try {
      const res = await fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${newToken}` } });
      const data = await res.json();
      if (res.ok && data.role) {
        setUserData(data);
        if (data.role === 'customer') handleSetPortal('customer');
        else if (data.role === 'loan-officer') handleSetPortal('loan-officer');
        else handleSetPortal('portal-selection');
      }
    } catch { /* fallback */ }
  }

  const handleLoginSuccess = (newToken: string) => {
    localStorage.setItem('nexus_token', newToken);
    localStorage.removeItem('nexus_portal');
    localStorage.removeItem('nexus_active_menu');
    setToken(newToken);
    setIsLoggedIn(true);
    fetchUserData(newToken);
  };

  const handleLogout = async () => {
    document.documentElement.classList.remove('dark');
    setIsLoggedIn(false);
    setToken(null);
    ['nexus_token', 'nexus_portal', 'nexus_active_menu'].forEach(k => localStorage.removeItem(k));
    setCurrentPortal('portal-selection');
    setMobileMenuOpen(false);
    setApplications([]);
    setTasks([]);
    setTransactions([]);
    setOutstandingBalance(0);
    setWalletBalance(0);
    setConfig(DEFAULT_CONFIG);
    setStats(DEFAULT_STATS);
    setAuditLogs([]);
  };

  const handleSetPortal = (portal: PortalType) => {
    if (!portalUser) return;
    if (portal === 'super-admin' && portalUser.role !== 'super-admin') return;
    if (portal === 'loan-officer' && portalUser.role !== 'loan-officer' && portalUser.role !== 'super-admin') return;
    if (portal === 'portal-selection' && portalUser.role !== 'super-admin') return;
    setCurrentPortal(portal);
    saveToStorage('nexus_portal', portal);
    if (portal === 'loan-officer') setActiveMenu('dashboard');
    else if (portal === 'customer') setActiveMenu('dashboard');
    else if (portal === 'super-admin') setActiveMenu('dashboard');
    setMobileMenuOpen(false);
  };

  const handleSetActiveMenu = (menu: string) => {
    setActiveMenu(menu);
    saveToStorage('nexus_active_menu', menu);
    setMobileMenuOpen(false);
  };

  const reloadLoans = async () => {
    try {
      const data = await apiFetch('/loans');
      const userId = portalUser?.id;
      setApplications(data.map((l: any) => ({ ...l, assignedToMe: l.assignedTo === userId })));
    } catch {}
  };
  const reloadTransactions = async () => {
    try {
      const data = await apiFetch('/transactions');
      setTransactions(data);
      setOutstandingBalance(Math.abs(calcBalance(data)) || 1200);
    } catch {}
  };

  const handleApproveApplication = async (id: string) => {
    try {
      await apiFetch(`/loans/${enc(id)}/approve`, { method: 'PATCH' });
      await Promise.all([reloadLoans(), reloadTransactions()]);
    } catch (e: any) {
      showToast(e.message || 'Failed to approve loan', 'error');
    }
  };

  const handleRejectApplication = async (id: string) => {
    try {
      await apiFetch(`/loans/${enc(id)}/reject`, { method: 'PATCH' });
      await reloadLoans();
    } catch (e: any) {
      showToast(e.message || 'Failed to reject loan', 'error');
    }
  };

  const handleHoldApplication = async (id: string) => {
    try {
      await apiFetch(`/loans/${enc(id)}/hold`, { method: 'PATCH' });
      await reloadLoans();
    } catch (e: any) {
      showToast(e.message || 'Failed to hold loan', 'error');
    }
  };

  const handleCompleteMeetingKyc = async () => {
    if (!selectedTask) return;
    try {
      await apiFetch(`/tasks/${selectedTask.id}/complete`, { method: 'PATCH' });
      const data = await apiFetch('/tasks');
      setTasks(data);
      showToast('KYC completed successfully');
    } catch (e: any) {
      showToast(e.message || 'Failed to complete KYC', 'error');
    }
  };

  const handleUpdateConfig = async (newConfig: PlatformConfig) => {
    try {
      await apiFetch('/config', { method: 'PATCH', body: JSON.stringify(newConfig) });
      const data = await apiFetch('/config');
      setConfig(data);
      showToast('Configuration updated successfully');
    } catch (e: any) {
      showToast(e.message || 'Failed to update config', 'error');
    }
  };

  const handleApplyLoanSubmit = async (appData: Partial<LoanApplication>) => {
    try {
      await apiFetch('/loans', { method: 'POST', body: JSON.stringify(appData) });
      await reloadLoans();
      setIsApplyOpen(false);
      showToast('Loan application submitted');
    } catch (e: any) {
      showToast(e.message || 'Failed to submit loan application', 'error');
    }
  };

  const handleRepayConfirm = async (amount: number) => {
    try {
      await apiFetch('/transactions/repay', { method: 'POST', body: JSON.stringify({ amount }) });
      await reloadTransactions();
      setIsRepayOpen(false);
      showToast('Repayment successful');
    } catch (e: any) {
      showToast(e.message || 'Repayment failed', 'error');
    }
  };

  const handleInstantApprovedFastCash = async (amount: number) => {
    try {
      await apiFetch('/transactions/disburse', { method: 'POST', body: JSON.stringify({ amount }) });
      await reloadTransactions();
      showToast(`$${amount} Fast Cash disbursed`);
    } catch (e: any) {
      showToast(e.message || 'Fast Cash disbursement failed', 'error');
    }
  };

  const handleOpenApplicationDetails = (app: LoanApplication) => {
    setSelectedApplication(app);
    setIsDetailOpen(true);
  };

  const handleJoinMeeting = (task: Task) => {
    setSelectedTask(task);
    setIsMeetingOpen(true);
  };

  const portalUser = userData || (() => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: Number(payload.id),
        name: (payload as any).name || 'User',
        email: (payload as any).email || '',
        role: (payload as any).role || 'customer',
      };
    } catch { return null; }
  })();

  return (
    <div className="min-h-screen bg-[var(--surface-secondary)] app-root">
      <Toast />
      {!isLoggedIn ? (
        <AuthPage onLoginSuccess={handleLoginSuccess} />
      ) : currentPortal === 'portal-selection' ? (
        <PortalSelection onSelectPortal={handleSetPortal} userRole={portalUser?.role || 'customer'} />
      ) : (<>
      <Sidebar
        currentPortal={currentPortal}
        activeMenu={activeMenu}
        setActiveMenu={handleSetActiveMenu}
        onApplyForLoan={() => setIsApplyOpen(true)}
        onLogout={handleLogout}
      />

      <div className="md:pl-64 app-content">
        <Header
          currentPortal={currentPortal}
          searchTermInvoice={searchTermInvoice}
          setSearchTermInvoice={setSearchTermInvoice}
          onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          isMobileMenuOpen={mobileMenuOpen}
          onPortalSwitchClick={() => handleSetPortal('portal-selection')}
          userName={portalUser?.name}
          userRole={portalUser?.role}
          onProfileClick={() => handleSetActiveMenu('profile')}
          onLogout={handleLogout}
        />

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <>
            <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
            <div className="fixed top-0 left-0 h-full w-72 z-50 animate-in slide-in-from-left duration-200 md:hidden overflow-y-auto"
              style={{ backgroundColor: 'var(--card-dark-bg)' }}
            >
              <div className="flex items-center justify-between px-5 py-5 border-b border-white/5">
                <div className="flex items-center gap-3.5">
                  <span className="font-sans text-[18px] tracking-tight flex items-center">
                    <span className="text-white font-black">Nexus</span>
                    <span className="text-white/60 font-light">finance</span>
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--accent)' }}
                  >
                    {currentPortal === 'loan-officer' ? 'Corporate' : currentPortal === 'super-admin' ? 'Admin' : 'Client'}
                  </span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {currentPortal === 'customer' && (
                <div className="px-4 pt-4 pb-2">
                  <button
                    onClick={() => { setIsApplyOpen(true); setMobileMenuOpen(false); }}
                    className="w-full premium-btn-primary font-bold text-[14px] py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <PlusCircle className="w-4.5 h-4.5" /> Apply for Loan
                  </button>
                </div>
              )}

              <div className="px-3 py-3 space-y-0.5">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-3 pb-2 pt-1">Menu</p>
                {(() => {
                  const items = currentPortal === 'loan-officer'
                    ? [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }, { id: 'tasks', label: 'Compliance Tasks', icon: CheckSquare }]
                    : currentPortal === 'super-admin'
                    ? [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }, { id: 'users', label: 'Users', icon: Users }, { id: 'audit', label: 'Audit Log', icon: ClipboardList }, { id: 'settings', label: 'Settings', icon: Settings }]
                    : [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }, { id: 'loans', label: 'Loans Ledger', icon: Landmark }, { id: 'wallets', label: 'Wallets', icon: Wallet }, { id: 'khqr', label: 'KHQR Payment', icon: QrCode }, { id: 'transactions', label: 'History Logs', icon: History }];
                  return items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeMenu === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => { handleSetActiveMenu(item.id); setMobileMenuOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 cursor-pointer ${isActive ? 'bg-white/10 text-white shadow-sm' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${isActive ? '' : 'bg-white/5 text-white/40'}`}
                          style={isActive ? { backgroundColor: 'var(--accent)', color: 'var(--text-primary)' } : undefined}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        {item.label}
                      </button>
                    );
                  });
                })()}
              </div>

              <div className="px-3 py-3 border-t border-white/5 space-y-0.5">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-3 pb-1">Account</p>
                <button
                  onClick={() => { setActiveMenu('profile'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 cursor-pointer ${activeMenu === 'profile' ? 'bg-white/10 text-white shadow-sm' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 text-white/40">
                    <User className="w-4 h-4" />
                  </div>
                  Profile
                </button>
                <button
                  onClick={() => { setActiveMenu('support'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 cursor-pointer ${activeMenu === 'support' ? 'bg-white/10 text-white shadow-sm' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 text-white/40">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  Support
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 cursor-pointer text-red-400/60 hover:text-red-400 hover:bg-red-500/10"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 text-red-400/60">
                    <LogOut className="w-4 h-4" />
                  </div>
                  Logout
                </button>
              </div>
            </div>
          </>
        )}

        <main className="p-4 md:p-6 max-w-7xl mx-auto animate-content-enter">
          {currentPortal === 'loan-officer' && (
            activeMenu === 'dashboard' ? (
              <LoanOfficerDashboard
                applications={applications}
                tasks={tasks}
                searchTerm={searchTermInvoice}
                onOpenDetails={handleOpenApplicationDetails}
                onJoinMeeting={handleJoinMeeting}
              />
            ) : activeMenu === 'tasks' ? (
              <div className="animate-content-enter">
                <Heading>Compliance Tasks</Heading>
                <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl overflow-hidden">
                  {tasks.length === 0 ? (
                    <EmptyState icon={CheckSquare} title="No compliance tasks" description="Tasks will appear here automatically when loans require review or verification." />
                  ) : (() => {
                    const pending = tasks.filter(t => !t.completed);
                    if (pending.length === 0) return (
                      <EmptyState icon={CheckSquare} title="All tasks completed" description="Nothing requires your attention right now." />
                    );
                    const itemsPerPage = 5;
                    const totalPages = Math.ceil(pending.length / itemsPerPage) || 1;
                    const paginated = pending.slice((taskPage - 1) * itemsPerPage, taskPage * itemsPerPage);
                    return <>
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-[var(--surface-secondary)] text-[11px] uppercase tracking-wider text-[var(--text-secondary)] font-bold sticky top-0">
                          <th className="px-5 py-3.5">Task</th>
                          <th className="px-5 py-3.5">Applicant</th>
                          <th className="px-5 py-3.5">Regarding</th>
                          <th className="px-5 py-3.5">Time</th>
                          <th className="px-5 py-3.5">Status</th>
                          <th className="px-5 py-3.5"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-primary)]">
                        {paginated.map((task) => (
                          <tr key={task.id} className="text-[14px] font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]/70 transition-colors bg-[var(--surface-card)]">
                            <td className="px-5 py-3.5">{task.title}</td>
                            <td className="px-5 py-3.5 text-[var(--text-secondary)]">{task.applicant}</td>
                            <td className="px-5 py-3.5 text-[var(--text-secondary)]">{task.regarding}</td>
                            <td className="px-5 py-3.5 text-[var(--text-secondary)]">{task.time}</td>
                            <td className="px-5 py-3.5">
                              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold" style={{backgroundColor: 'var(--warning-bg)', color: 'var(--warning-text)'}}>Pending</span>
                            </td>
                            <td className="px-5 py-3.5">
                              {task.title.toLowerCase().includes('verification') && (
                                  <button
                                    onClick={() => handleJoinMeeting(task)}
                                    className="bg-[var(--sidebar-bg)] hover:brightness-125 text-white text-[12px] font-bold px-4 py-2 rounded-lg transition cursor-pointer"
                                  >
                                  Join Meeting
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <Pagination currentPage={taskPage} totalPages={totalPages} totalItems={pending.length} itemsPerPage={itemsPerPage} onPageChange={setTaskPage} />
                    </>;
                  })()}
                </div>
              </div>
            ) : null
          )}

          {currentPortal === 'customer' && (
            activeMenu === 'dashboard' ? (
              <CustomerDashboard
                userName={portalUser?.name || 'Customer'}
                outstandingBalance={outstandingBalance}
                walletBalance={walletBalance}
                transactions={transactions}
                onApplyLoanClick={() => setIsApplyOpen(true)}
                onRepayClick={() => setIsRepayOpen(true)}
                onSetActiveMenu={handleSetActiveMenu}
                onInstantApprovedFastCash={handleInstantApprovedFastCash}
              />
            ) : activeMenu === 'loans' ? (
              <div className="animate-content-enter">
                <Heading>Loans Ledger</Heading>
                <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl overflow-hidden">
                  {(() => {
                    const filtered = applications.filter(a => a.applicantEmail === (portalUser?.email || ''));
                    if (filtered.length === 0) return (
                      <EmptyState icon={Landmark} title="No loan applications yet" description="Apply for your first loan to get started with Nexus Finance." />
                    );
                    const itemsPerPage = 5;
                    const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
                    const paginated = filtered.slice((loanPage - 1) * itemsPerPage, loanPage * itemsPerPage);
                    return <>
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-[var(--surface-secondary)] text-[11px] uppercase tracking-wider text-[var(--text-secondary)] font-bold sticky top-0">
                          <th className="px-5 py-3.5">ID</th>
                          <th className="px-5 py-3.5">Amount</th>
                          <th className="px-5 py-3.5">Type</th>
                          <th className="px-5 py-3.5">Status</th>
                          <th className="px-5 py-3.5">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-primary)]">
                        {paginated.map((app) => (
                          <tr key={app.id} className="text-[14px] font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]/70 transition-colors bg-[var(--surface-card)]">
                            <td className="px-5 py-3.5">{app.id}</td>
                            <td className="px-5 py-3.5">${app.amount.toLocaleString()}</td>
                            <td className="px-5 py-3.5 text-[var(--text-secondary)]">{app.type}</td>
                            <td className="px-5 py-3.5">
                              <StatusBadge
                                variant={app.status === 'Approved' ? 'success' : app.status === 'Rejected' ? 'error' : app.status === 'Hold' ? 'warning' : 'info'}
                                label={app.status}
                              />
                            </td>
                            <td className="px-5 py-3.5 text-[var(--text-secondary)]">{app.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <Pagination currentPage={loanPage} totalPages={totalPages} totalItems={filtered.length} itemsPerPage={itemsPerPage} onPageChange={setLoanPage} />
                    </>;
                  })()}
                </div>
              </div>
            ) : activeMenu === 'wallets' ? (
              <div className="animate-content-enter">
                <Heading>Wallets</Heading>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl p-8">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Vault Wallet</p>
                    <p className="text-[36px] font-extrabold text-[var(--text-primary)] mt-2">$8,450.25</p>
                    <p className="text-[13px] text-[var(--text-secondary)] mt-1">Primary checking & savings</p>
                  </div>
                  <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl p-8">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Outstanding Balance</p>
                    <p className="text-[36px] font-extrabold text-[var(--text-primary)] mt-2">${outstandingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    <p className="text-[13px] text-[var(--text-secondary)] mt-1">Total credit in use</p>
                  </div>
                </div>
              </div>
            ) : activeMenu === 'khqr' ? (
              <div className="animate-content-enter"><KHQRPage /></div>
            ) : activeMenu === 'transactions' ? (
              <div className="animate-content-enter">
                <Heading>History Logs</Heading>
                <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl overflow-hidden">
                  {transactions.length === 0 ? (
                    <EmptyState icon={History} title="No transactions yet" description="Your financial activity will appear here once you make a transaction." />
                  ) : (() => {
                    const itemsPerPage = 10;
                    const totalPages = Math.ceil(transactions.length / itemsPerPage) || 1;
                    const paginated = transactions.slice((txPage - 1) * itemsPerPage, txPage * itemsPerPage);
                    return <>
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-[var(--surface-secondary)] text-[11px] uppercase tracking-wider text-[var(--text-secondary)] font-bold sticky top-0">
                          <th className="px-5 py-3.5">Title</th>
                          <th className="px-5 py-3.5">Date</th>
                          <th className="px-5 py-3.5">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-primary)]">
                        {paginated.map((tx) => (
                          <tr key={tx.id} className="text-[14px] font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]/70 transition-colors bg-[var(--surface-card)]">
                            <td className="px-5 py-3.5">{tx.title}</td>
                            <td className="px-5 py-3.5 text-[var(--text-secondary)]">{tx.date}</td>
                            <td className="px-5 py-3.5 font-mono" style={{color: tx.amount > 0 ? 'var(--success-text)' : 'var(--error-text)'}}>
                              {tx.amount > 0 ? '+' : '-'}${Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <Pagination currentPage={txPage} totalPages={totalPages} totalItems={transactions.length} itemsPerPage={itemsPerPage} onPageChange={setTxPage} />
                    </>;
                  })()}
                </div>
              </div>
            ) : null
          )}

          {currentPortal === 'super-admin' && (
            activeMenu === 'dashboard' ? (
              <SuperAdminDashboard
                config={config}
                stats={stats}
                auditLogs={auditLogs}
                onUpdateConfig={handleUpdateConfig}
                view="dashboard"
              />
            ) : activeMenu === 'users' ? (
              <div className="animate-content-enter"><UsersView /></div>
            ) : activeMenu === 'audit' ? (
              <div className="animate-content-enter"><AuditLogView /></div>
            ) : activeMenu === 'settings' ? (
              <SuperAdminDashboard
                config={config}
                stats={stats}
                auditLogs={auditLogs}
                onUpdateConfig={handleUpdateConfig}
                view="settings"
              />
            ) : null
          )}

          {activeMenu === 'profile' && (
            <div className="animate-content-enter"><ProfilePage token={token} user={portalUser} /></div>
          )}

          {activeMenu === 'support' && (
            <div className="animate-content-enter"><SupportView /></div>
          )}
        </main>
      </div>

      <ApplicationDetailsModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        application={selectedApplication}
        onApprove={handleApproveApplication}
        onReject={handleRejectApplication}
        onHold={handleHoldApplication}
      />

      <ApplyLoanModal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        onSubmit={handleApplyLoanSubmit}
        userName={portalUser?.name}
        userEmail={portalUser?.email}
      />

      <RepayModal
        isOpen={isRepayOpen}
        onClose={() => setIsRepayOpen(false)}
        outstandingBalance={outstandingBalance}
        onRepayConfirm={handleRepayConfirm}
      />

      <LiveMeetingModal
        isOpen={isMeetingOpen}
        onClose={() => { setIsMeetingOpen(false); setSelectedTask(null); }}
        applicantName={selectedTask?.applicant || ''}
        regardingLoan={selectedTask?.regarding || ''}
        onCompleteKyc={handleCompleteMeetingKyc}
      />
      </>)}
    </div>
  );
}

function SupportView() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/support/message', { method: 'POST', body: JSON.stringify({ name, email, message }) });
      setSent(true);
      setTimeout(() => { setSent(false); setName(''); setEmail(''); setMessage(''); }, 3000);
    } catch (e: any) {
      showToast(e.message || 'Failed to send message', 'error');
    }
  };

  return (
    <div className="animate-in fade-in duration-200 max-w-3xl mx-auto">
      <Heading>Support & Contact</Heading>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl p-6 space-y-4">
          <h3 className="text-[15px] font-bold text-[var(--text-primary)] uppercase tracking-wider">Get in Touch</h3>
          <div className="space-y-3 text-[14px]">
            <p><span className="font-bold text-[var(--text-secondary)]">Phone:</span> +1 (800) 555-NEXUS</p>
            <p><span className="font-bold text-[var(--text-secondary)]">Email:</span> support@nexusfinance.com</p>
            <p><span className="font-bold text-[var(--text-secondary)]">Hours:</span> Mon–Fri, 9 AM – 6 PM EST</p>
            <p><span className="font-bold text-[var(--text-secondary)]">Address:</span> 100 Finance Ave, Suite 400, New York, NY 10005</p>
          </div>
        </div>
        <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl p-6 space-y-4">
          <h3 className="text-[15px] font-bold text-[var(--text-primary)] uppercase tracking-wider">Send a Message</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your Name" required className="w-full border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your Email" required className="w-full border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all" />
            <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Message" rows={4} required className="w-full border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all resize-none" />
            <button type="submit" className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--text-primary)] font-bold text-[14px] px-6 py-3 rounded-xl transition cursor-pointer">
              {sent ? 'Message Sent!' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function UsersView() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [creating, setCreating] = useState(false);
  const [userPage, setUserPage] = useState(1);
  const [roleDropdownId, setRoleDropdownId] = useState<number | null>(null);
  const [resetPwUserId, setResetPwUserId] = useState<number | null>(null);
  const [resetPwPassword, setResetPwPassword] = useState('');
  const [resettingPw, setResettingPw] = useState(false);

  useEffect(() => {
    const handler = () => setRoleDropdownId(null);
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const itemsPerPage = 10;

  const fetchUsers = async () => {
    try {
      const data = await apiFetch('/users');
      setUsers(data);
    } catch {
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const changeRole = async (userId: number, newRole: string) => {
    try {
      await apiFetch(`/users/${userId}/role`, { method: 'PATCH', body: JSON.stringify({ role: newRole }) });
      await fetchUsers();
    } catch (e: any) {
      showToast(e.message || 'Failed to update role', 'error');
    }
  };

  const resetPassword = async (userId: number) => {
    if (!resetPwPassword || resetPwPassword.length < 6) return showToast('Password must be at least 6 characters', 'error');
    setResettingPw(true);
    try {
      await apiFetch(`/users/${userId}/reset-password`, { method: 'PATCH', body: JSON.stringify({ password: resetPwPassword }) });
      showToast('Password reset successfully');
      setResetPwUserId(null);
      setResetPwPassword('');
    } catch (e: any) {
      showToast(e.message || 'Failed to reset password', 'error');
    } finally {
      setResettingPw(false);
    }
  };

  const handleCreateOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail || !newPassword) return showToast('All fields required', 'error');
    setCreating(true);
    try {
      const reg = await apiFetch('/auth/register', { method: 'POST', body: JSON.stringify({ name: newName, email: newEmail, password: newPassword }) });
      const newUserId = reg.user.id;
      await apiFetch(`/users/${newUserId}/role`, { method: 'PATCH', body: JSON.stringify({ role: 'loan-officer' }) });
      showToast('Loan officer created successfully', 'success');
      setShowCreate(false);
      setNewName(''); setNewEmail(''); setNewPassword('');
      await fetchUsers();
    } catch (e: any) {
      showToast(e.message || 'Failed to create officer', 'error');
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  if (loading) return <div className="animate-in fade-in duration-200"><SkeletonTable rows={6} /></div>;

  const totalPages = Math.ceil(users.length / itemsPerPage) || 1;
  const paginatedUsers = users.slice((userPage - 1) * itemsPerPage, userPage * itemsPerPage);

  return (
    <div className="animate-in fade-in duration-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[28px] font-extrabold text-[var(--text-primary)]">User Management</h2>
        <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 bg-[var(--sidebar-bg)] hover:brightness-125 text-white text-[13px] font-bold px-4 py-2.5 rounded-lg transition cursor-pointer">
          <PlusCircle className="w-4 h-4" /> {showCreate ? 'Cancel' : 'Create Loan Officer'}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreateOfficer} className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl p-6 mb-6 animate-in fade-in slide-in-from-top-2 duration-200">
          <h3 className="font-bold text-[var(--text-primary)] mb-4">New Loan Officer</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Full Name" className="border border-[var(--border-primary)] rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:border-[var(--accent)]" />
            <input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Email" type="email" className="border border-[var(--border-primary)] rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:border-[var(--accent)]" />
            <input value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Password" type="password" className="border border-[var(--border-primary)] rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:border-[var(--accent)]" />
          </div>
          <button type="submit" disabled={creating} className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--text-primary)] font-bold text-[14px] px-6 py-2.5 rounded-lg transition cursor-pointer disabled:opacity-50">
            {creating ? 'Creating...' : 'Create Officer'}
          </button>
        </form>
      )}

      <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl overflow-hidden">
        {users.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-[var(--surface-secondary)] rounded-2xl flex items-center justify-center mb-5 border border-[var(--border-primary)]/50">
              <Users className="w-10 h-10 text-[var(--text-tertiary)]" />
            </div>
            <p className="text-[var(--text-primary)] font-extrabold text-[17px]">No users registered</p>
            <p className="text-[var(--text-tertiary)] text-[13px] mt-1.5 max-w-xs">Users will appear here once they sign up through the registration page.</p>
          </div>
        ) : (
        <>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[var(--surface-secondary)] text-[11px] uppercase tracking-wider text-[var(--text-secondary)] font-bold sticky top-0">
              <th className="px-5 py-3.5">Name</th>
              <th className="px-5 py-3.5">Email</th>
              <th className="px-5 py-3.5">Role</th>
              <th className="px-5 py-3.5"></th>
              <th className="px-5 py-3.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-primary)]">
              {paginatedUsers.map((u) => (
                  <tr key={u.id} className="text-[14px] font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]/70 transition-colors bg-[var(--surface-card)]">
                <td className="px-5 py-3.5">{u.name}</td>
                <td className="px-5 py-3.5 text-[var(--text-secondary)]">{u.email}</td>
                <td className="px-5 py-3.5">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold"
                    style={{
                      backgroundColor: u.role === 'super-admin' ? 'var(--info-bg)' :
                        u.role === 'loan-officer' ? 'var(--info-bg)' : 'var(--success-bg)',
                      color: u.role === 'super-admin' ? 'var(--info-text)' :
                        u.role === 'loan-officer' ? 'var(--info-text)' : 'var(--success-text)'
                    }}
                  >{u.role}</span>
                </td>
                <td className="px-5 py-3.5">
                  {u.role !== 'super-admin' && (
                    <div className="relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setRoleDropdownId(roleDropdownId === u.id ? null : u.id); }}
                        className="flex items-center gap-1.5 text-[12px] font-bold border border-[var(--border-primary)] rounded-xl px-2.5 py-1.5 bg-[var(--surface-card)] hover:border-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all cursor-pointer min-w-[120px]"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold"
                          style={{
                            backgroundColor: u.role === 'loan-officer' ? 'var(--info-bg)' : 'var(--success-bg)',
                            color: u.role === 'loan-officer' ? 'var(--info-text)' : 'var(--success-text)'
                          }}
                        >{u.role === 'loan-officer' ? 'Loan Officer' : 'Customer'}</span>
                        <ChevronDown className={`w-3.5 h-3.5 text-[var(--text-tertiary)] ml-auto transition-transform duration-150 ${roleDropdownId === u.id ? 'rotate-180' : ''}`} />
                      </button>
                      {roleDropdownId === u.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-xl shadow-xl shadow-black/5 z-20 py-1.5 overflow-hidden animate-dropdown-enter">
                          {['customer', 'loan-officer'].map(r => (
                            <button
                              key={r}
                              onClick={() => { changeRole(u.id, r); setRoleDropdownId(null); }}
                              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-left cursor-pointer transition-colors duration-100 hover:bg-[var(--surface-secondary)] ${r === u.role ? 'bg-[#f0fdfa] font-bold' : 'font-medium'}`}
                            >
                              <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${r === u.role ? 'border-[#0d9488] bg-[#0d9488]' : 'border-[#cbd5e1]'}`}>
                                {r === u.role && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </span>
                              <span className={`${r === u.role ? 'text-[#0d9488]' : 'text-[var(--text-primary)]'}`}>{r === 'loan-officer' ? 'Loan Officer' : 'Customer'}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  {u.role !== 'super-admin' && (
                    <button
                      onClick={() => { setResetPwUserId(u.id); setResetPwPassword(''); }}
                      className="text-[11px] font-bold text-[var(--text-tertiary)] hover:text-[var(--text-primary)] border border-[var(--border-primary)] rounded-lg px-2.5 py-1.5 hover:border-[var(--text-tertiary)] transition-all cursor-pointer"
                    >
                      Reset PW
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination currentPage={userPage} totalPages={totalPages} totalItems={users.length} itemsPerPage={itemsPerPage} onPageChange={setUserPage} />
        </>
        )}

      {resetPwUserId !== null && (
        <Modal isOpen={true} onClose={() => setResetPwUserId(null)} maxWidth="max-w-sm">
          <div className="p-6">
            <h3 className="text-[18px] font-extrabold text-[var(--text-primary)] mb-1">Reset User Password</h3>
            <p className="text-[13px] text-[var(--text-tertiary)] mb-4">Send a reset link via email, or set a new password directly.</p>

            <button
              onClick={async () => {
                setResettingPw(true);
                try {
                  await apiFetch(`/users/${resetPwUserId}/send-reset-link`, { method: 'POST' });
                  showToast('Reset link sent to user email');
                  setResetPwUserId(null);
                } catch (e: any) {
                  showToast(e.message || 'Failed to send reset link', 'error');
                } finally { setResettingPw(false); }
              }}
              disabled={resettingPw}
              className="w-full text-left px-4 py-3 rounded-xl border border-[var(--border-primary)] hover:border-[var(--accent)] hover:bg-[var(--accent-muted)] transition-all cursor-pointer mb-3 disabled:opacity-50"
            >
              <span className="font-bold text-[14px] text-[var(--text-primary)] flex items-center gap-2"><Mail className="w-4 h-4" /> Send Reset Link</span>
              <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">User receives an email to set their own password</p>
            </button>

            <div className="border-t border-[var(--border-primary)] pt-3">
              <p className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Or set manually</p>
              <input
                type="password"
                value={resetPwPassword}
                onChange={e => setResetPwPassword(e.target.value)}
                placeholder="New password (min 6 chars)"
                className="w-full border border-[var(--border-primary)] rounded-xl px-3.5 py-2.5 text-[14px] mb-3 focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setResetPwUserId(null)} className="px-4 py-2 text-[13px] font-bold text-[var(--text-tertiary)] hover:text-[var(--text-primary)] border border-[var(--border-primary)] rounded-xl cursor-pointer">Cancel</button>
                <button onClick={() => resetPassword(resetPwUserId)} disabled={resettingPw || !resetPwPassword || resetPwPassword.length < 6} className="px-4 py-2 text-[13px] font-bold bg-[var(--sidebar-bg)] text-white rounded-xl hover:brightness-110 cursor-pointer disabled:opacity-50">{resettingPw ? 'Saving...' : 'Set Password'}</button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      </div>
    </div>
  );
}
