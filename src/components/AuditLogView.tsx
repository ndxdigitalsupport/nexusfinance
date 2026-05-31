import React, { useState, useEffect } from 'react';
import { ClipboardList } from 'lucide-react';
import Pagination from './Pagination';
import { showToast } from './Toast';

const API = 'http://localhost:3001/api';
async function apiFetch(path: string, options?: RequestInit) {
  const token = localStorage.getItem('nexus_token');
  const res = await fetch(`${API}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options?.headers || {}) } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export default function AuditLogView() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 15;

  const fetchLogs = async () => {
    try { setLogs(await apiFetch('/audit/logs')); }
    catch { showToast('Failed to load audit logs', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLogs(); }, []);

  const totalPages = Math.ceil(logs.length / itemsPerPage) || 1;
  const paginated = logs.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const actionLabel = (action: string) => {
    const map: Record<string, string> = {
      'loan-approved': 'Loan Approved', 'loan-rejected': 'Loan Rejected', 'loan-held': 'Loan Held',
      'role-changed': 'Role Changed', 'config-updated': 'Config Updated',
    };
    return map[action] || action;
  };

  const actionColor = (action: string) => {
    if (action.includes('approved')) return 'bg-emerald-100 text-emerald-700';
    if (action.includes('rejected')) return 'bg-red-100 text-red-700';
    if (action.includes('held')) return 'bg-amber-100 text-amber-700';
    if (action.includes('role')) return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-700';
  };

  if (loading) return <div className="p-12 text-center text-[#44474a] font-medium">Loading audit logs...</div>;

  return (
    <div className="animate-in fade-in duration-200">
      <h2 className="text-[28px] font-extrabold text-[#0f171c] mb-6">Audit Log</h2>
      <div className="bg-white border border-[#c4c7ca] rounded-2xl overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-16 text-center">
            <ClipboardList className="w-12 h-12 text-[#c4c7ca] mx-auto mb-4" />
            <p className="text-[#44474a] font-semibold text-[15px]">No audit logs yet</p>
            <p className="text-[#74777b] text-[13px] mt-1">Actions like loan approvals and role changes will appear here.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#f1f4f6] text-[11px] uppercase tracking-wider text-[#44474a] font-bold sticky top-0">
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">By</th>
                <th className="px-6 py-4">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e0e3e5]">
              {paginated.map((log, idx) => (
                <tr key={log.id} className={`text-[14px] font-semibold text-[#0f171c] ${idx % 2 === 0 ? 'bg-white' : 'bg-[#f8f9fa]'}`}>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${actionColor(log.action)}`}>{actionLabel(log.action)}</span>
                  </td>
                  <td className="px-6 py-4 text-[#44474a] text-[13px] font-medium">{log.details}</td>
                  <td className="px-6 py-4 text-[#44474a]">{log.userEmail}</td>
                  <td className="px-6 py-4 text-[#44474a] text-[13px]">{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Pagination currentPage={page} totalPages={totalPages} totalItems={logs.length} itemsPerPage={itemsPerPage} onPageChange={setPage} />
    </div>
  );
}
