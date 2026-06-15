import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { ShieldCheck, ArrowUpDown, X, LayoutDashboard, Landmark, Wallet, History, CheckSquare, Settings, Users, HelpCircle, LogOut, User, PlusCircle, ClipboardList, ChevronDown, QrCode, Mail, HelpCircle as HelpIcon, Download, FileText, Calculator, Webhook } from 'lucide-react';
import AuthPage from './components/AuthPage';
import Toast, { showToast } from './components/Toast';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import PortalSelection from './components/PortalSelection';
import { SkeletonTable } from './components/Skeleton';
import Pagination from './components/Pagination';
import Modal from './components/Modal';
import EmptyState from './components/EmptyState';
import StatusBadge from './components/StatusBadge';
import Heading from './components/Heading';
import Table from './components/Table';
import LoansLedgerSection from './components/LoansLedgerSection';
import WalletsSection from './components/WalletsSection';
import TransactionsSection from './components/TransactionsSection';
import ComplianceTasksSection from './components/ComplianceTasksSection';
import { LoanApplication, Task, Transaction, PlatformConfig, PlatformStats, PortalType } from './types';
import { DEFAULT_CONFIG, DEFAULT_STATS } from './data';
import { API, apiFetch } from './api';
import { downloadCSV, formatCurrency } from './utils';

const CustomerDashboard = lazy(() => import('./components/CustomerDashboard'));
const LoanOfficerDashboard = lazy(() => import('./components/LoanOfficerDashboard'));
const SuperAdminDashboard = lazy(() => import('./components/SuperAdminDashboard'));
const ProfilePage = lazy(() => import('./components/ProfilePage'));
const ApplicationDetailsModal = lazy(() => import('./components/ApplicationDetailsModal'));
const ApplyLoanModal = lazy(() => import('./components/ApplyLoanModal'));
const RepayModal = lazy(() => import('./components/RepayModal'));
const LiveMeetingModal = lazy(() => import('./components/LiveMeetingModal'));
const AuditLogView = lazy(() => import('./components/AuditLogView'));
const KHQRPage = lazy(() => import('./components/KHQRPage'));
const KYCDocumentsPage = lazy(() => import('./components/KYCDocumentsPage'));
const LoanCalculator = lazy(() => import('./components/LoanCalculator'));
const LoanManagement = lazy(() => import('./components/LoanManagement'));
const WebhooksPage = lazy(() => import('./components/WebhooksPage'));
const SupportView = lazy(() => import('./components/SupportView'));
const UsersView = lazy(() => import('./components/UsersView'));

const enc = (id: string) => encodeURIComponent(id);

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
    const defaults = { loans: [], txs: [], tasks: [], config: null, stats: null, audit: [] };
    const [loans, txs, tasksData, configData, statsData, auditData] = await Promise.all([
      apiFetch('/loans').catch(() => defaults.loans),
      apiFetch('/transactions').catch(() => defaults.txs),
      apiFetch('/tasks').catch(() => defaults.tasks),
      apiFetch('/config').catch(() => null),
      apiFetch('/stats').catch(() => null),
      apiFetch('/audit/logs').catch(() => []),
    ]);
    if (!localStorage.getItem('nexus_token')) { handleLogout(); return; }
    setApplications(loans.map((l: any) => ({ ...l, assignedToMe: l.assignedTo === portalUser?.id })));
    setTransactions(txs);
    setOutstandingBalance(Math.abs(calcBalance(txs)));
    setWalletBalance(txs.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0));
    setTasks(tasksData);
    setConfig(configData || DEFAULT_CONFIG);
    setStats(statsData || DEFAULT_STATS);
    setAuditLogs(auditData);
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

    // Handle Appwrite email verification callback
    if (window.location.pathname === '/verify') {
      const userId = params.get('userId');
      const secret = params.get('secret');
      if (userId && secret) {
        (async () => {
          try {
            const { account } = await import('./appwriteClient');
            await account.updateVerification(userId, secret);
            // Get user email from Appwrite session
            const appwriteUser = await account.get();
            // Complete registration in our system
            const data = await fetch(API + '/auth/complete-registration', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: appwriteUser.email }),
            }).then(r => r.json());
            if (data.token) {
              handleLoginSuccess(data.token);
            }
          } catch (err) {
            console.error('Verification callback error:', err);
            showToast('Email verification failed. Try again.', 'error');
          }
          window.history.replaceState({}, '', '/');
        })();
      }
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

  const portalUser = useMemo(() => userData || (() => {
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
  })(), [token, userData]);

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

      <div className="md:pl-72 app-content min-h-screen flex flex-col">
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
            <div className="fixed top-0 left-0 h-full w-72 z-50 animate-slide-in-left duration-200 md:hidden overflow-y-auto"
              style={{ backgroundColor: 'var(--surface-secondary)', borderRight: '1px solid var(--sidebar-border)' }}
            >
              <div className="flex items-center justify-between px-5 py-5 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
                <div className="flex items-center gap-3.5">
                  <span className="font-sans text-[18px] tracking-tight flex items-center">
                    <span className="font-extrabold" style={{ color: 'var(--sidebar-header-text)' }}>Nexus</span>
                    <span className="font-light" style={{ color: 'var(--sidebar-header-muted)' }}>finance</span>
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--accent)' }}
                  >
                    {currentPortal === 'loan-officer' ? 'Corporate' : currentPortal === 'super-admin' ? 'Admin' : 'Client'}
                  </span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 rounded-lg cursor-pointer" style={{ color: 'var(--sidebar-text-muted)' }}>
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
                <p className="text-[10px] font-bold uppercase tracking-widest px-3 pb-2 pt-1" style={{ color: 'var(--sidebar-text-muted)' }}>Menu</p>
                {(() => {
                  const items = currentPortal === 'loan-officer'
                    ? [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }, { id: 'manage', label: 'Loan Management', icon: ClipboardList }, { id: 'webhooks', label: 'Webhooks', icon: Webhook }, { id: 'tasks', label: 'Compliance Tasks', icon: CheckSquare }]
                    : currentPortal === 'super-admin'
                    ? [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }, { id: 'manage', label: 'Loan Management', icon: ClipboardList }, { id: 'webhooks', label: 'Webhooks', icon: Webhook }, { id: 'users', label: 'Users', icon: Users }, { id: 'audit', label: 'Audit Log', icon: ClipboardList }, { id: 'settings', label: 'Settings', icon: Settings }]
                    : [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }, { id: 'loans', label: 'Loans Ledger', icon: Landmark }, { id: 'documents', label: 'KYC Documents', icon: FileText }, { id: 'calculator', label: 'Loan Calculator', icon: Calculator }, { id: 'wallets', label: 'Wallets', icon: Wallet }, { id: 'khqr', label: 'KHQR Payment', icon: QrCode }, { id: 'transactions', label: 'History Logs', icon: History }];
                  return items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeMenu === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => { handleSetActiveMenu(item.id); setMobileMenuOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 cursor-pointer ${isActive ? 'bg-[var(--accent)]/20 text-[var(--text-primary)] border border-[var(--accent)]/40 shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] border border-transparent hover:border-[var(--border-primary)]'}`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${isActive ? 'bg-[var(--accent)] text-white' : 'bg-[var(--surface-secondary)] text-[var(--text-tertiary)]'}`}
                          style={isActive ? undefined : undefined}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        {item.label}
                      </button>
                    );
                  });
                })()}
              </div>
              <div className="px-3 py-3 border-t space-y-0.5" style={{ borderColor: 'var(--sidebar-border)' }}>
                <p className="text-[10px] font-bold uppercase tracking-widest px-3 pb-1" style={{ color: 'var(--sidebar-text-muted)' }}>Account</p>
                <button
                  onClick={() => { setActiveMenu('profile'); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 cursor-pointer group hover:bg-[var(--sidebar-active-bg)]"
                  style={{ color: activeMenu === 'profile' ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)' }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:bg-[var(--sidebar-icon-bg)]"
                    style={{ backgroundColor: activeMenu === 'profile' ? 'var(--sidebar-icon-active-bg)' : 'var(--sidebar-icon-bg)', color: activeMenu === 'profile' ? 'var(--sidebar-icon-active-text)' : 'var(--sidebar-icon-text)' }}
                  >
                    <User className="w-4 h-4" />
                  </div>
                  Profile
                </button>
                <button
                  onClick={() => { setActiveMenu('support'); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 cursor-pointer group hover:bg-[var(--sidebar-active-bg)]"
                  style={{ color: activeMenu === 'support' ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)' }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:bg-[var(--sidebar-icon-bg)]"
                    style={{ backgroundColor: activeMenu === 'support' ? 'var(--sidebar-icon-active-bg)' : 'var(--sidebar-icon-bg)', color: activeMenu === 'support' ? 'var(--sidebar-icon-active-text)' : 'var(--sidebar-icon-text)' }}
                  >
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  Support
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 cursor-pointer group hover:bg-red-500/10"
                  style={{ color: 'rgba(239, 68, 68, 0.6)' }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:bg-red-500/10"
                    style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'rgba(239, 68, 68, 0.6)' }}
                  >
                    <LogOut className="w-4 h-4" />
                  </div>
                  Logout
                </button>
              </div>
            </div>
          </>
        )}

        <main className="p-4 md:p-8 w-full max-w-7xl mx-auto animate-content-enter flex-1">
          <Suspense fallback={<div className="p-8"><SkeletonTable rows={4} /></div>}>
          {currentPortal === 'loan-officer' && (
            activeMenu === 'dashboard' ? (
              <LoanOfficerDashboard
                applications={applications}
                tasks={tasks}
                searchTerm={searchTermInvoice}
                onOpenDetails={handleOpenApplicationDetails}
                onJoinMeeting={handleJoinMeeting}
              />
            ) : activeMenu === 'webhooks' ? (
              <WebhooksPage />
            ) : activeMenu === 'manage' ? (
              <LoanManagement applications={applications} onRefresh={refetchAll} />
            ) : activeMenu === 'tasks' ? (
              <ComplianceTasksSection tasks={tasks} taskPage={taskPage} setTaskPage={setTaskPage} onJoinMeeting={handleJoinMeeting} />
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
              <LoansLedgerSection applications={applications} loanPage={loanPage} setLoanPage={setLoanPage} userEmail={portalUser?.email} />
            ) : activeMenu === 'documents' ? (
              <KYCDocumentsPage />
            ) : activeMenu === 'calculator' ? (
              <LoanCalculator />
            ) : activeMenu === 'wallets' ? (
              <WalletsSection walletBalance={walletBalance} outstandingBalance={outstandingBalance} />
            ) : activeMenu === 'khqr' ? (
              <KHQRPage />
            ) : activeMenu === 'transactions' ? (
              <TransactionsSection transactions={transactions} txPage={txPage} setTxPage={setTxPage} />
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
              <UsersView />
            ) : activeMenu === 'audit' ? (
              <AuditLogView />
            ) : activeMenu === 'webhooks' ? (
              <WebhooksPage />
            ) : activeMenu === 'manage' ? (
              <LoanManagement applications={applications} onRefresh={refetchAll} />
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
            <ProfilePage token={token} user={portalUser} />
          )}

          {activeMenu === 'support' && (
            <SupportView />
          )}
          </Suspense>
        </main>
      </div>

      <Suspense fallback={null}>
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
      </Suspense>
      </>)}
    </div>
  );
}
