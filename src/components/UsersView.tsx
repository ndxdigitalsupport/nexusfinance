import React, { useState, useEffect } from 'react';
import { PlusCircle, ShieldCheck, ChevronDown, Mail, Users as UsersIcon } from 'lucide-react';
import { apiFetch } from '../api';
import { showToast } from './Toast';
import Modal from './Modal';
import { SkeletonTable } from './Skeleton';
import Pagination from './Pagination';

export default function UsersView() {
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
    } catch { showToast('Failed to load users', 'error');
    } finally { setLoading(false); }
  };

  const changeRole = async (userId: number, newRole: string) => {
    try {
      await apiFetch(`/users/${userId}/role`, { method: 'PATCH', body: JSON.stringify({ role: newRole }) });
      await fetchUsers();
    } catch (e: any) { showToast(e.message || 'Failed to update role', 'error'); }
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
    if (!newName || !newEmail || !newPassword) return showToast('All fields required', 'error');
    setCreating(true);
    try {
      const reg = await apiFetch('/auth/register', { method: 'POST', body: JSON.stringify({ name: newName, email: newEmail, password: newPassword }) });
      await apiFetch(`/users/${reg.user.id}/role`, { method: 'PATCH', body: JSON.stringify({ role: 'loan-officer' }) });
      showToast('Loan officer created successfully', 'success');
      setShowCreate(false);
      setNewName(''); setNewEmail(''); setNewPassword('');
      await fetchUsers();
    } catch (e: any) { showToast(e.message || 'Failed to create officer', 'error');
    } finally { setCreating(false); }
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

      <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl overflow-x-auto">
        {users.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-[var(--surface-secondary)] rounded-2xl flex items-center justify-center mb-5 border border-[var(--border-primary)]/50">
              <UsersIcon className="w-10 h-10 text-[var(--text-tertiary)]" />
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
                } catch (e: any) { showToast(e.message || 'Failed to send reset link', 'error');
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
              <input type="password" value={resetPwPassword} onChange={e => setResetPwPassword(e.target.value)} placeholder="New password (min 6 chars)" className="w-full border border-[var(--border-primary)] rounded-xl px-3.5 py-2.5 text-[14px] mb-3 focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20" />
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
