import React, { useState, useEffect } from 'react';
import { PlusCircle, ShieldCheck, ChevronDown, Mail, Users as UsersIcon, Building2 } from 'lucide-react';
import { apiFetch } from '../api';
import { showToast } from './Toast';
import Modal from './Modal';
import { SkeletonTable } from './Skeleton';
import Pagination from './Pagination';
import { useCurrency } from '../context/CurrencyContext';
import type { Tenant } from '../types';
interface UsersViewProps {
  userRole?: string;
}

export default function UsersView({ userRole }: UsersViewProps = {}) {
  const { t } = useCurrency();
  const [users, setUsers] = useState<any[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('loan-officer');
  const [newTenantId, setNewTenantId] = useState<string>(() => {
    const saved = localStorage.getItem('nexus_selected_tenant_id');
    return (saved && saved !== 'all') ? saved : '1';
  });
  const [creating, setCreating] = useState(false);
  const [userPage, setUserPage] = useState(1);
  const [roleDropdownId, setRoleDropdownId] = useState<number | null>(null);
  const [tenantDropdownId, setTenantDropdownId] = useState<number | null>(null);
  const [resetPwUserId, setResetPwUserId] = useState<number | null>(null);
  const [resetPwPassword, setResetPwPassword] = useState('');
  const [resettingPw, setResettingPw] = useState(false);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.role-dropdown-wrapper')) setRoleDropdownId(null);
      if (!target.closest('.tenant-dropdown-wrapper')) setTenantDropdownId(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const itemsPerPage = 10;

  const fetchUsers = async () => {
    try {
      const data = await apiFetch('/users');
      setUsers(data);
    } catch { showToast('Failed to load users', 'error');
    } finally { setLoading(false); }
  };

  const fetchTenants = async () => {
    try {
      const data = await apiFetch('/tenants');
      if (Array.isArray(data)) setTenants(data);
    } catch { /* ignored */ }
  };

  const changeRole = async (userId: number, newRole: string) => {
    const originalUsers = [...users];
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    try {
      await apiFetch(`/users/${userId}/role`, { method: 'PATCH', body: JSON.stringify({ role: newRole }) });
      await fetchUsers();
    } catch (e: any) {
      setUsers(originalUsers);
      showToast(e.message || 'Failed to update role', 'error');
    }
  };

  const changeTenant = async (userId: number, targetTenantId: number) => {
    const originalUsers = [...users];
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, tenant_id: targetTenantId } : u));
    try {
      await apiFetch(`/users/${userId}/tenant`, { method: 'PATCH', body: JSON.stringify({ tenant_id: targetTenantId }) });
      showToast('User organization reassigned successfully', 'success');
      await fetchUsers();
    } catch (e: any) {
      setUsers(originalUsers);
      showToast(e.message || 'Failed to reassign organization', 'error');
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
    } catch (e: any) { showToast(e.message || 'Failed to reset password', 'error');
    } finally { setResettingPw(false); }
  };

  const handleCreateOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPassword) return showToast('Name and password are required', 'error');
    setCreating(true);
    try {
      const created = await apiFetch('/users', {
        method: 'POST',
        body: JSON.stringify({
          name: newName,
          email: newEmail.trim() || undefined,
          password: newPassword,
          phone: newPhone.trim() || undefined,
          role: newRole,
          tenant_id: parseInt(newTenantId) || 1,
        })
      });
      showToast(`User "${created.name}" created! Login ID: ${created.email}`, 'success');
      setShowCreate(false);
      setNewName(''); setNewEmail(''); setNewPhone(''); setNewPassword('');
      await fetchUsers();
    } catch (e: any) { showToast(e.message || 'Failed to create user', 'error');
    } finally { setCreating(false); }
  };

  useEffect(() => {
    fetchUsers();
    fetchTenants();
  }, []);

  if (loading) return <div className="animate-in fade-in duration-200"><SkeletonTable rows={6} /></div>;

  const sortedUsers = [...users].sort((a, b) => {
    const getRoleRank = (role: string) => {
      if (role === 'super-admin') return 0;
      if (role === 'loan-officer') return 1;
      return 2;
    };
    const rankA = getRoleRank(a.role);
    const rankB = getRoleRank(b.role);
    if (rankA !== rankB) return rankA - rankB;

    const nameA = (a.name || '').toLowerCase().trim();
    const nameB = (b.name || '').toLowerCase().trim();
    return nameA.localeCompare(nameB);
  });

  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage) || 1;
  const paginatedUsers = sortedUsers.slice((userPage - 1) * itemsPerPage, sortedUsers.length === 0 ? 0 : Math.min(sortedUsers.length, userPage * itemsPerPage));

  const getRoleLabel = (role: string) => {
    if (role === 'super-admin') return 'Super Admin';
    if (role === 'loan-officer') return t('loan_officer_label');
    if (role === 'admin') return t('admin_role');
    return t('customer_role');
  };

  return (
    <div className="animate-in fade-in duration-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[28px] font-extrabold text-[var(--text-primary)]">{t('user_management')}</h2>
          <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5">Manage users, officers, and organization admins across institutions.</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--text-primary)] text-[13.5px] font-bold px-4.5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
        >
          <PlusCircle className="w-4.5 h-4.5" /> {showCreate ? 'Cancel' : '+ Add Member / User'}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreateOfficer} className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl p-6 mb-6 animate-in fade-in slide-in-from-top-2 duration-200">
          <h3 className="font-bold text-[var(--text-primary)] mb-4">Create Team Member / User</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Full Name / Username" required className="border border-[var(--border-primary)] rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:border-[var(--accent)] bg-[var(--surface-primary)] text-[var(--text-primary)]" />
            <input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Email (optional — can verify later)" type="email" className="border border-[var(--border-primary)] rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:border-[var(--accent)] bg-[var(--surface-primary)] text-[var(--text-primary)]" />
            <input value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="Phone number (optional — can verify later)" className="border border-[var(--border-primary)] rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:border-[var(--accent)] bg-[var(--surface-primary)] text-[var(--text-primary)]" />
            <input value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Password (min 6 chars)" type="password" required className="border border-[var(--border-primary)] rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:border-[var(--accent)] bg-[var(--surface-primary)] text-[var(--text-primary)]" />
            
            {/* Role selection */}
            <div className="relative">
              <select
                value={newRole}
                onChange={e => setNewRole(e.target.value)}
                className="w-full appearance-none border border-[var(--border-primary)] rounded-xl px-4 py-2.5 text-[14px] font-semibold focus:outline-none focus:border-[var(--accent)] bg-[var(--surface-primary)] text-[var(--text-primary)] cursor-pointer pr-10"
              >
                <option value="loan-officer">Loan Officer</option>
                <option value="admin">Organization Admin</option>
                <option value="customer">Customer</option>
              </select>
              <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Tenant assignment selection (only if super-admin or multiple tenants) */}
            {userRole === 'super-admin' ? (
              <div className="relative">
                <select
                  value={newTenantId}
                  onChange={e => setNewTenantId(e.target.value)}
                  className="w-full appearance-none border border-[var(--border-primary)] rounded-xl px-4 py-2.5 text-[14px] font-semibold focus:outline-none focus:border-[var(--accent)] bg-[var(--surface-primary)] text-[var(--text-primary)] cursor-pointer pr-10"
                >
                  {tenants.map(t => (
                    <option key={t.id} value={String(t.id)}>
                      🏢 {t.name} (#{t.id})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--surface-secondary)]/50 text-[13.5px] font-semibold text-[var(--text-secondary)]">
                <Building2 className="w-4 h-4 text-[var(--accent)]" />
                <span className="truncate">{tenants.find(t => String(t.id) === newTenantId)?.name || 'Current Organization'}</span>
              </div>
            )}
          </div>
          <button type="submit" disabled={creating} className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--text-primary)] font-bold text-[14px] px-6 py-2.5 rounded-xl transition cursor-pointer disabled:opacity-50">
            {creating ? t('creating') : 'Create Member'}
          </button>
        </form>
      )}

      <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl min-h-[380px] relative pb-4">
        {users.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-[var(--surface-secondary)] rounded-2xl flex items-center justify-center mb-5 border border-[var(--border-primary)]/50">
              <UsersIcon className="w-10 h-10 text-[var(--text-tertiary)]" />
            </div>
            <p className="text-[var(--text-primary)] font-extrabold text-[17px]">{t('no_users_registered')}</p>
            <p className="text-[var(--text-tertiary)] text-[13px] mt-1.5 max-w-xs">{t('no_users_desc')}</p>
          </div>
        ) : (
        <>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[var(--surface-secondary)] text-[11px] uppercase tracking-wider text-[var(--text-secondary)] font-bold sticky top-0 rounded-t-2xl">
              <th className="px-5 py-3.5 rounded-tl-2xl">{t('name_header')}</th>
              <th className="px-5 py-3.5">{t('email_header')}</th>
              <th className="px-5 py-3.5">{t('phone_header')}</th>
              <th className="px-5 py-3.5">Organization</th>
              <th className="px-5 py-3.5">{t('role_header')}</th>
              <th className="px-5 py-3.5 rounded-tr-2xl"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-primary)]">
              {paginatedUsers.map((u) => (
                  <tr key={u.id} className="text-[14px] font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]/50 transition-colors bg-[var(--surface-card)]">
                    <td className="px-5 py-3.5 font-bold">{u.name}</td>
                    <td className="px-5 py-3.5 text-[var(--text-secondary)] text-[13px] font-mono">{u.email}</td>
                    <td className="px-5 py-3.5 text-[var(--text-secondary)] text-[13px]">{u.phone || '-'}</td>
                    <td className="px-5 py-3.5">
                      {userRole === 'super-admin' ? (
                        <div className="relative tenant-dropdown-wrapper">
                          <button
                            onClick={(e) => { e.stopPropagation(); setTenantDropdownId(tenantDropdownId === u.id ? null : u.id); }}
                            className="flex items-center gap-1.5 text-[12px] font-semibold border border-[var(--border-primary)] rounded-xl px-3 py-1.5 bg-[var(--surface-primary)] hover:border-[var(--accent)] transition-all cursor-pointer shadow-2xs"
                          >
                            <Building2 className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                            <span className="truncate max-w-[130px]">
                              {tenants.find(t => t.id === u.tenant_id)?.name || `Tenant #${u.tenant_id || 1}`}
                            </span>
                            <ChevronDown className={`w-3.5 h-3.5 text-[var(--text-tertiary)] ml-auto transition-transform duration-150 ${tenantDropdownId === u.id ? 'rotate-180' : ''}`} />
                          </button>
                          {tenantDropdownId === u.id && (
                            <div className="absolute left-0 top-full mt-1.5 w-60 bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl shadow-2xl shadow-black/10 z-50 py-1.5 max-h-56 overflow-y-auto animate-dropdown-enter backdrop-blur-xl">
                              <div className="px-3.5 py-1.5 text-[10.5px] uppercase font-bold text-[var(--text-tertiary)] border-b border-[var(--border-primary)]">
                                Move to Organization
                              </div>
                              {tenants.map(t => (
                                <button
                                  key={t.id}
                                  onClick={() => { changeTenant(u.id, t.id); setTenantDropdownId(null); }}
                                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-[12.5px] text-left cursor-pointer transition-colors hover:bg-[var(--surface-secondary)] ${t.id === u.tenant_id ? 'font-bold text-[var(--accent)] bg-[var(--accent)]/10' : 'text-[var(--text-primary)]'}`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <Building2 className="w-3.5 h-3.5 opacity-60 shrink-0" />
                                    <span className="truncate">{t.name}</span>
                                  </div>
                                  {t.id === u.tenant_id && <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-1 rounded-lg bg-[var(--surface-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)]">
                          <Building2 className="w-3.5 h-3.5 text-[var(--accent)]" />
                          <span>{tenants.find(t => t.id === u.tenant_id)?.name || 'Organization'}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {u.role === 'super-admin' ? (
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[var(--info-bg)] text-[var(--info-text)]">
                          Super Admin
                        </span>
                      ) : (
                        <div className="relative role-dropdown-wrapper">
                          <button
                            onClick={(e) => { e.stopPropagation(); setRoleDropdownId(roleDropdownId === u.id ? null : u.id); }}
                            className="flex items-center gap-1.5 text-[12px] font-bold border border-[var(--border-primary)] rounded-xl px-2.5 py-1.5 bg-[var(--surface-card)] hover:border-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all cursor-pointer min-w-[125px] shadow-2xs"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold"
                              style={{
                                backgroundColor: u.role === 'loan-officer' ? 'var(--info-bg)' : u.role === 'admin' ? 'rgba(109, 40, 217, 0.1)' : 'var(--success-bg)',
                                color: u.role === 'loan-officer' ? 'var(--info-text)' : u.role === 'admin' ? 'rgb(109, 40, 217)' : 'var(--success-text)'
                              }}
                            >{getRoleLabel(u.role)}</span>
                            <ChevronDown className={`w-3.5 h-3.5 text-[var(--text-tertiary)] ml-auto transition-transform duration-150 ${roleDropdownId === u.id ? 'rotate-180' : ''}`} />
                          </button>
                          {roleDropdownId === u.id && (
                            <div className="absolute left-0 top-full mt-1.5 w-52 bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl shadow-2xl shadow-black/10 z-50 py-1.5 overflow-hidden animate-dropdown-enter backdrop-blur-xl">
                              <div className="px-3.5 py-1.5 text-[10.5px] uppercase font-bold text-[var(--text-tertiary)] border-b border-[var(--border-primary)]">
                                Select Role
                              </div>
                              {['customer', 'loan-officer', 'admin'].map(r => (
                                <button
                                  key={r}
                                  onClick={() => { changeRole(u.id, r); setRoleDropdownId(null); }}
                                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-left cursor-pointer transition-colors duration-100 hover:bg-[var(--surface-secondary)] ${r === u.role ? 'bg-[#f0fdfa] font-bold text-[#0d9488]' : 'font-medium text-[var(--text-primary)]'}`}
                                >
                                  <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${r === u.role ? 'border-[#0d9488] bg-[#0d9488]' : 'border-[#cbd5e1]'}`}>
                                    {r === u.role && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                                  </span>
                                  <span>{getRoleLabel(r)}</span>
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
                          className="text-[11px] font-bold text-[var(--text-tertiary)] hover:text-[var(--text-primary)] border border-[var(--border-primary)] rounded-lg px-2.5 py-1.5 hover:border-[var(--text-tertiary)] transition-all cursor-pointer bg-[var(--surface-secondary)]"
                        >
                          {t('reset_pw')}
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
      </div>

      {resetPwUserId !== null && (
        <Modal isOpen={true} onClose={() => setResetPwUserId(null)} maxWidth="max-w-sm">
          <div className="p-6">
            <h3 className="text-[18px] font-extrabold text-[var(--text-primary)] mb-1">{t('reset_user_password')}</h3>
            <p className="text-[13px] text-[var(--text-tertiary)] mb-4">{t('reset_pw_desc')}</p>

            <button
              onClick={async () => {
                setResettingPw(true);
                try {
                  await apiFetch(`/users/${resetPwUserId}/send-reset-link`, { method: 'POST' });
                  showToast('Reset link sent to user email');
                  setResetPwUserId(null);
                } catch (e: any) { showToast(e.message || 'Failed to send reset link', 'error');
                } finally { setResettingPw(false); }
              }}
              disabled={resettingPw}
              className="w-full text-left px-4 py-3 rounded-xl border border-[var(--border-primary)] hover:border-[var(--accent)] hover:bg-[var(--accent-muted)] transition-all cursor-pointer mb-3 disabled:opacity-50 bg-[var(--surface-primary)]"
            >
              <span className="font-bold text-[14px] text-[var(--text-primary)] flex items-center gap-2"><Mail className="w-4 h-4 text-[var(--accent)]" /> {t('send_reset_link')}</span>
              <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">{t('reset_pw_email_desc')}</p>
            </button>

            <div className="border-t border-[var(--border-primary)] pt-3">
              <p className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">{t('or_set_manually')}</p>
              <input type="password" value={resetPwPassword} onChange={e => setResetPwPassword(e.target.value)} placeholder="New password (min 6 chars)" className="w-full border border-[var(--border-primary)] bg-[var(--surface-secondary)] text-[var(--text-primary)] rounded-xl px-3.5 py-2.5 text-[14px] mb-3 focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20" />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setResetPwUserId(null)} className="px-4 py-2 text-[13px] font-bold text-[var(--text-tertiary)] hover:text-[var(--text-primary)] border border-[var(--border-primary)] rounded-xl cursor-pointer bg-[var(--surface-secondary)]">Cancel</button>
                <button onClick={() => resetPassword(resetPwUserId)} disabled={resettingPw || !resetPwPassword || resetPwPassword.length < 6} className="px-4 py-2 text-[13px] font-bold bg-[var(--sidebar-bg)] text-white rounded-xl hover:brightness-110 cursor-pointer disabled:opacity-50">{resettingPw ? t('saving') : t('set_password')}</button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
