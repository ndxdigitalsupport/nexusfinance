import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowUpDown, X, LayoutDashboard, Landmark, Wallet, History, CheckSquare, Settings, Users, HelpCircle, LogOut, User, PlusCircle } from 'lucide-react';
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
import { LoanApplication, Task, Transaction, PlatformConfig, PlatformStats, PortalType } from './types';
import { DEFAULT_CONFIG, DEFAULT_STATS } from './data';

const API = 'http://localhost:3001/api';

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
  const [token, setToken] = useState<string | null>(() => {
    const googleToken = new URLSearchParams(window.location.search).get('google_token');
    if (googleToken) {
      localStorage.setItem('nexus_token', googleToken);
      window.history.replaceState({}, '', '/');
      return googleToken;
    }
    return localStorage.getItem('nexus_token');
  });
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (new URLSearchParams(window.location.search).get('google_token')) return true;
    return localStorage.getItem('nexus_token') !== null;
  });
  const [currentPortal, setCurrentPortal] = useState<PortalType>(() => {
    return (localStorage.getItem('nexus_portal') as PortalType) || 'portal-selection';
  });
  const [activeMenu, setActiveMenu] = useState(() => localStorage.getItem('nexus_active_menu') || 'dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [outstandingBalance, setOutstandingBalance] = useState(0);
  const [walletBalance, setWalletBalance] = useState(8450.25);
  const [config, setConfig] = useState<PlatformConfig>(DEFAULT_CONFIG);
  const [stats, setStats] = useState<PlatformStats>(DEFAULT_STATS);

  const [searchTermInvoice, setSearchTermInvoice] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<LoanApplication | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [isRepayOpen, setIsRepayOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isMeetingOpen, setIsMeetingOpen] = useState(false);

  const calcBalance = (txs: Transaction[]) =>
    txs.reduce((sum, t) => sum + t.amount, 0);

  const refetchAll = async () => {
    try {
      const [loans, txs, tasksData, configData, statsData] = await Promise.all([
        apiFetch('/loans'),
        apiFetch('/transactions'),
        apiFetch('/tasks'),
        apiFetch('/config'),
        apiFetch('/stats'),
      ]);
      setApplications(loans.map((l: any) => ({ ...l, assignedToMe: l.assignedTo === portalUser?.id })));
      setTransactions(txs);
      setOutstandingBalance(Math.abs(calcBalance(txs)) || 1200);
      setWalletBalance(txs.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0) || 8450.25);
      setTasks(tasksData);
      setConfig(configData);
      setStats(statsData);
    } catch {}
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
  }, []);

  const saveToStorage = (key: string, val: string) => localStorage.setItem(key, val);

  const handleLoginSuccess = (newToken: string) => {
    localStorage.setItem('nexus_token', newToken);
    setToken(newToken);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setToken(null);
    ['nexus_token', 'nexus_portal', 'nexus_active_menu'].forEach(k => localStorage.removeItem(k));
    setCurrentPortal('portal-selection');
    setMobileMenuOpen(false);
  };

  const handleSetPortal = (portal: PortalType) => {
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

  const portalUser = (() => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: (payload as any).id as number,
        name: (payload as any).name || 'User',
        email: (payload as any).email || '',
        role: (payload as any).role || 'customer',
      };
    } catch {
      return null;
    }
  })();

  return (
    <div className="min-h-screen bg-[#f1f4f6]">
      <Toast />
      {!isLoggedIn ? (
        <AuthPage onLoginSuccess={handleLoginSuccess} />
      ) : currentPortal === 'portal-selection' ? (
        <PortalSelection onSelectPortal={handleSetPortal} />
      ) : (<>
      <Sidebar
        currentPortal={currentPortal}
        activeMenu={activeMenu}
        setActiveMenu={handleSetActiveMenu}
        onApplyForLoan={() => setIsApplyOpen(true)}
        onLogout={handleLogout}
      />

      <div className="md:pl-64">
        <Header
          currentPortal={currentPortal}
          searchTermInvoice={searchTermInvoice}
          setSearchTermInvoice={setSearchTermInvoice}
          onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          isMobileMenuOpen={mobileMenuOpen}
        />

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <>
            <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
            <div className="fixed top-0 left-0 h-full w-72 bg-[#ebeef0] border-r border-[#c4c7ca] z-50 animate-in slide-in-from-left duration-200 md:hidden overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#c4c7ca]">
                <div className="flex items-center gap-3 select-none">
                  <span className="font-sans text-[18px] tracking-tight flex items-center">
                    <span className="text-[#0E171C] font-black">Nexus</span>
                    <span className="text-[#0E171C] font-light">finance</span>
                  </span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-md text-[#44474a] hover:bg-[#e0e3e5] cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {currentPortal === 'customer' && (
                <div className="px-4 py-3">
                  <button
                    onClick={() => { setIsApplyOpen(true); setMobileMenuOpen(false); }}
                    className="w-full bg-[#5CF2D0] hover:bg-[#41ddbc] text-[#0F171C] font-semibold text-[14px] py-3 rounded-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <PlusCircle className="w-4.5 h-4.5" /> Apply for Loan
                  </button>
                </div>
              )}

              <div className="px-3 py-2 space-y-1">
                {(() => {
                  const items = currentPortal === 'loan-officer'
                    ? [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }, { id: 'tasks', label: 'Compliance Tasks', icon: CheckSquare }]
                    : currentPortal === 'super-admin'
                    ? [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }, { id: 'users', label: 'Users', icon: Users }, { id: 'settings', label: 'Settings', icon: Settings }]
                    : [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }, { id: 'loans', label: 'Loans Ledger', icon: Landmark }, { id: 'wallets', label: 'Wallets', icon: Wallet }, { id: 'transactions', label: 'History Logs', icon: History }];
                  return items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeMenu === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => { handleSetActiveMenu(item.id); setMobileMenuOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-[14px] transition-all cursor-pointer ${isActive ? 'bg-[#0F171C] text-white shadow-sm' : 'text-[#44474a] hover:bg-[#e0e3e5]'}`}
                      >
                        <Icon className={`w-5 h-5 ${isActive ? 'text-[#5CF2D0]' : 'text-[#44474a]'}`} />
                        {item.label}
                      </button>
                    );
                  });
                })()}
              </div>

              <div className="mt-auto px-3 pt-4 border-t border-[#c4c7ca] mx-3 space-y-1">
                <button
                  onClick={() => { setActiveMenu('profile'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-[14px] transition-all cursor-pointer ${activeMenu === 'profile' ? 'bg-[#0F171C] text-white shadow-sm' : 'text-[#44474a] hover:bg-[#e0e3e5]'}`}
                >
                  <User className="w-5 h-5 text-[#44474a]" /> Profile
                </button>
                <button
                  onClick={() => { setActiveMenu('support'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-[14px] transition-all cursor-pointer ${activeMenu === 'support' ? 'bg-[#0F171C] text-white shadow-sm' : 'text-[#44474a] hover:bg-[#e0e3e5]'}`}
                >
                  <HelpCircle className="w-5 h-5 text-[#44474a]" /> Support
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-[#44474a] hover:bg-red-50 hover:text-red-600 rounded-lg font-semibold text-[14px] cursor-pointer"
                >
                  <LogOut className="w-5 h-5" /> Logout
                </button>
              </div>
            </div>
          </>
        )}

        <main className="p-4 md:p-6 max-w-7xl mx-auto">
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
              <div className="animate-in fade-in duration-200">
                <h2 className="text-[28px] font-extrabold text-[#0f171c] mb-6">Compliance Tasks</h2>
                <div className="bg-white border border-[#c4c7ca] rounded-2xl overflow-hidden">
                  {tasks.length === 0 ? (
                    <div className="p-12 text-center text-[#44474a] font-medium">No tasks assigned.</div>
                  ) : (
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-[#f1f4f6] text-[11px] uppercase tracking-wider text-[#44474a] font-bold">
                          <th className="px-6 py-4">Task</th>
                          <th className="px-6 py-4">Applicant</th>
                          <th className="px-6 py-4">Regarding</th>
                          <th className="px-6 py-4">Time</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e0e3e5]">
                        {tasks.filter(t => !t.completed).length > 0 ? (
                          tasks.filter(t => !t.completed).map(task => (
                            <tr key={task.id} className="text-[14px] font-semibold text-[#0f171c] hover:bg-[#f1f4f6]/50">
                              <td className="px-6 py-4">{task.title}</td>
                              <td className="px-6 py-4 text-[#44474a]">{task.applicant}</td>
                              <td className="px-6 py-4 text-[#44474a]">{task.regarding}</td>
                              <td className="px-6 py-4 text-[#44474a]">{task.time}</td>
                              <td className="px-6 py-4">
                                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700">Pending</span>
                              </td>
                              <td className="px-6 py-4">
                                {task.title.toLowerCase().includes('verification') && (
                                  <button
                                    onClick={() => handleJoinMeeting(task)}
                                    className="bg-[#0F171C] hover:bg-slate-800 text-white text-[12px] font-bold px-4 py-2 rounded-lg transition cursor-pointer"
                                  >
                                    Join Meeting
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="p-12 text-center text-emerald-700 font-bold">
                              All tasks completed.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            ) : null
          )}

          {currentPortal === 'customer' && (
            activeMenu === 'dashboard' ? (
              <CustomerDashboard
                outstandingBalance={outstandingBalance}
                walletBalance={walletBalance}
                transactions={transactions}
                onApplyLoanClick={() => setIsApplyOpen(true)}
                onRepayClick={() => setIsRepayOpen(true)}
                onSetActiveMenu={handleSetActiveMenu}
                onInstantApprovedFastCash={handleInstantApprovedFastCash}
              />
            ) : activeMenu === 'loans' ? (
              <div className="animate-in fade-in duration-200">
                <h2 className="text-[28px] font-extrabold text-[#0f171c] mb-6">Loans Ledger</h2>
                <div className="bg-white border border-[#c4c7ca] rounded-2xl overflow-hidden">
                  {applications.filter(a => a.applicantEmail === (portalUser?.email || '')).length === 0 ? (
                    <div className="p-12 text-center text-[#44474a] font-medium">No loan applications found.</div>
                  ) : (
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-[#f1f4f6] text-[11px] uppercase tracking-wider text-[#44474a] font-bold">
                          <th className="px-6 py-4">ID</th>
                          <th className="px-6 py-4">Amount</th>
                          <th className="px-6 py-4">Type</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e0e3e5]">
                        {applications.filter(a => a.applicantEmail === (portalUser?.email || '')).map(app => (
                          <tr key={app.id} className="text-[14px] font-semibold text-[#0f171c] hover:bg-[#f1f4f6]/50">
                            <td className="px-6 py-4">{app.id}</td>
                            <td className="px-6 py-4">${app.amount.toLocaleString()}</td>
                            <td className="px-6 py-4 text-[#44474a]">{app.type}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                app.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                                app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                app.status === 'Hold' ? 'bg-amber-100 text-amber-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>{app.status}</span>
                            </td>
                            <td className="px-6 py-4 text-[#44474a]">{app.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            ) : activeMenu === 'wallets' ? (
              <div className="animate-in fade-in duration-200">
                <h2 className="text-[28px] font-extrabold text-[#0f171c] mb-6">Wallets</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-[#c4c7ca] rounded-2xl p-8">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#44474a]">Vault Wallet</p>
                    <p className="text-[36px] font-extrabold text-[#0F171C] mt-2">$8,450.25</p>
                    <p className="text-[13px] text-[#44474a] mt-1">Primary checking & savings</p>
                  </div>
                  <div className="bg-white border border-[#c4c7ca] rounded-2xl p-8">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#44474a]">Outstanding Balance</p>
                    <p className="text-[36px] font-extrabold text-[#0F171C] mt-2">${outstandingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    <p className="text-[13px] text-[#44474a] mt-1">Total credit in use</p>
                  </div>
                </div>
              </div>
            ) : activeMenu === 'transactions' ? (
              <div className="animate-in fade-in duration-200">
                <h2 className="text-[28px] font-extrabold text-[#0f171c] mb-6">History Logs</h2>
                <div className="bg-white border border-[#c4c7ca] rounded-2xl overflow-hidden">
                  {transactions.length === 0 ? (
                    <div className="p-12 text-center text-[#44474a] font-medium">No transactions found.</div>
                  ) : (
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-[#f1f4f6] text-[11px] uppercase tracking-wider text-[#44474a] font-bold">
                          <th className="px-6 py-4">Title</th>
                          <th className="px-6 py-4">Date</th>
                          <th className="px-6 py-4">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e0e3e5]">
                        {transactions.map(tx => (
                          <tr key={tx.id} className="text-[14px] font-semibold text-[#0f171c] hover:bg-[#f1f4f6]/50">
                            <td className="px-6 py-4">{tx.title}</td>
                            <td className="px-6 py-4 text-[#44474a]">{tx.date}</td>
                            <td className={`px-6 py-4 font-mono ${tx.amount > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                              {tx.amount > 0 ? '+' : '-'}${Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            ) : null
          )}

          {currentPortal === 'super-admin' && (
            activeMenu === 'dashboard' ? (
              <SuperAdminDashboard
                config={config}
                stats={stats}
                onUpdateConfig={handleUpdateConfig}
                view="dashboard"
              />
            ) : activeMenu === 'users' ? (
              <UsersView />
            ) : activeMenu === 'settings' ? (
              <SuperAdminDashboard
                config={config}
                stats={stats}
                onUpdateConfig={handleUpdateConfig}
                view="settings"
              />
            ) : null
          )}

          {activeMenu === 'profile' && (
            <ProfilePage token={token} />
          )}

          {activeMenu === 'support' && (
            <SupportView />
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
      alert(e.message);
    }
  };

  return (
    <div className="animate-in fade-in duration-200 max-w-3xl mx-auto">
      <h2 className="text-[28px] font-extrabold text-[#0f171c] mb-6">Support & Contact</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-[#c4c7ca] rounded-2xl p-6 space-y-4">
          <h3 className="text-[15px] font-bold text-[#0F171C] uppercase tracking-wider">Get in Touch</h3>
          <div className="space-y-3 text-[14px]">
            <p><span className="font-bold text-[#44474a]">Phone:</span> +1 (800) 555-NEXUS</p>
            <p><span className="font-bold text-[#44474a]">Email:</span> support@nexusfinance.com</p>
            <p><span className="font-bold text-[#44474a]">Hours:</span> Mon–Fri, 9 AM – 6 PM EST</p>
            <p><span className="font-bold text-[#44474a]">Address:</span> 100 Finance Ave, Suite 400, New York, NY 10005</p>
          </div>
        </div>
        <div className="bg-white border border-[#c4c7ca] rounded-2xl p-6 space-y-4">
          <h3 className="text-[15px] font-bold text-[#0F171C] uppercase tracking-wider">Send a Message</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your Name" required className="w-full border border-[#c4c7ca] rounded-lg px-4 py-3 text-[14px] focus:outline-none focus:border-[#5CF2D0]" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your Email" required className="w-full border border-[#c4c7ca] rounded-lg px-4 py-3 text-[14px] focus:outline-none focus:border-[#5CF2D0]" />
            <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Message" rows={4} required className="w-full border border-[#c4c7ca] rounded-lg px-4 py-3 text-[14px] focus:outline-none focus:border-[#5CF2D0] resize-none" />
            <button type="submit" className="bg-[#5CF2D0] hover:bg-[#41ddbc] text-[#0F171C] font-bold text-[14px] px-6 py-3 rounded-lg transition cursor-pointer">
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

  const fetchUsers = async () => {
    try {
      const data = await apiFetch('/users');
      setUsers(data);
    } catch {} finally {
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

  useEffect(() => { fetchUsers(); }, []);

  if (loading) return <div className="p-12 text-center text-[#44474a] font-medium">Loading users...</div>;

  return (
    <div className="animate-in fade-in duration-200">
      <h2 className="text-[28px] font-extrabold text-[#0f171c] mb-6">User Management</h2>
      <div className="bg-white border border-[#c4c7ca] rounded-2xl overflow-hidden">
        {users.length === 0 ? (
          <div className="p-12 text-center text-[#44474a] font-medium">No users found.</div>
        ) : (
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#f1f4f6] text-[11px] uppercase tracking-wider text-[#44474a] font-bold">
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e0e3e5]">
            {users.map(u => (
              <tr key={u.id} className="text-[14px] font-semibold text-[#0f171c] hover:bg-[#f1f4f6]/50">
                <td className="px-6 py-4">{u.name}</td>
                <td className="px-6 py-4 text-[#44474a]">{u.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    u.role === 'super-admin' ? 'bg-purple-100 text-purple-700' :
                    u.role === 'loan-officer' ? 'bg-blue-100 text-blue-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>{u.role}</span>
                </td>
                <td className="px-6 py-4">
                  {u.role !== 'super-admin' && (
                    <select
                      value={u.role}
                      onChange={(e) => changeRole(u.id, e.target.value)}
                      className="text-[12px] font-bold border border-[#c4c7ca] rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:border-[#5CF2D0] cursor-pointer"
                    >
                      <option value="customer">Customer</option>
                      <option value="loan-officer">Loan Officer</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
}
