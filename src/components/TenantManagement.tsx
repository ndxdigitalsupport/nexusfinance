import React, { useState, useEffect } from 'react';
import { Plus, Building2, Users, Landmark, Settings, Trash2, Edit2, X, Check } from 'lucide-react';
import { apiFetch } from '../api';
import { showToast } from './Toast';
import type { Tenant, TenantStats } from '../types';

export default function TenantManagement() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [tenantStats, setTenantStats] = useState<Record<number, TenantStats>>({});

  // Form state
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formLogoUrl, setFormLogoUrl] = useState('');
  const [formPlan, setFormPlan] = useState('basic');
  const [formMaxUsers, setFormMaxUsers] = useState(50);
  const [formMaxLoans, setFormMaxLoans] = useState(500);

  const fetchTenants = async () => {
    try {
      const data = await apiFetch('/tenants');
      setTenants(data);
      // Fetch stats for each tenant
      for (const tenant of data) {
        try {
          const stats = await apiFetch(`/tenants/${tenant.id}/stats`);
          setTenantStats(prev => ({ ...prev, [tenant.id]: stats }));
        } catch { /* stats fetch failed */ }
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load tenants', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTenants(); }, []);

  const handleCreate = async () => {
    if (!formName) {
      showToast('Organization name is required', 'error');
      return;
    }
    const autoSlug = formName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    try {
      await apiFetch('/tenants', {
        method: 'POST',
        body: JSON.stringify({
          name: formName,
          slug: autoSlug,
          logo_url: formLogoUrl.trim() || undefined,
          plan: formPlan,
          max_users: formMaxUsers,
          max_loans: formMaxLoans,
        }),
      });
      showToast('Tenant created successfully', 'success');
      setShowCreate(false);
      resetForm();
      fetchTenants();
    } catch (err: any) {
      showToast(err.message || 'Failed to create tenant', 'error');
    }
  };

  const handleUpdate = async () => {
    if (!editingTenant) return;
    try {
      await apiFetch(`/tenants/${editingTenant.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: formName,
          logo_url: formLogoUrl.trim() || '',
          plan: formPlan,
          max_users: formMaxUsers,
          max_loans: formMaxLoans,
        }),
      });
      showToast('Tenant updated successfully', 'success');
      setEditingTenant(null);
      resetForm();
      fetchTenants();
    } catch (err: any) {
      showToast(err.message || 'Failed to update tenant', 'error');
    }
  };

  const handleDeactivate = async (tenant: Tenant) => {
    if (!confirm(`Deactivate "${tenant.name}"? Users from this tenant will lose access.`)) return;
    try {
      await apiFetch(`/tenants/${tenant.id}`, { method: 'DELETE' });
      showToast('Tenant deactivated', 'success');
      fetchTenants();
    } catch (err: any) {
      showToast(err.message || 'Failed to deactivate tenant', 'error');
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormSlug('');
    setFormLogoUrl('');
    setFormPlan('basic');
    setFormMaxUsers(50);
    setFormMaxLoans(500);
  };

  const startEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setFormName(tenant.name);
    setFormLogoUrl(tenant.logo_url || '');
    setFormPlan(tenant.plan);
    setFormMaxUsers(tenant.max_users);
    setFormMaxLoans(tenant.max_loans);
  };

  const planColors: Record<string, string> = {
    founding: 'bg-purple-100 text-purple-700',
    basic: 'bg-blue-100 text-blue-700',
    standard: 'bg-green-100 text-green-700',
    premium: 'bg-amber-100 text-amber-700',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--accent)' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Tenant Management</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Manage subscribing organizations</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowCreate(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          <Plus className="w-4 h-4" /> Add Tenant
        </button>
      </div>

      {/* Tenant Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tenants.map(tenant => {
          const stats = tenantStats[tenant.id];
          return (
            <div
              key={tenant.id}
              className="rounded-2xl border p-5 transition-all hover:shadow-md"
              style={{
                backgroundColor: 'var(--surface-primary)',
                borderColor: tenant.is_active ? 'var(--border-primary)' : '#fca5a5',
                opacity: tenant.is_active ? 1 : 0.6,
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden border border-[var(--border-primary)]" style={{ backgroundColor: 'var(--surface-secondary)' }}>
                    {tenant.logo_url ? (
                      <img src={tenant.logo_url} alt={tenant.name} className="w-full h-full object-contain p-1" />
                    ) : (
                      <Building2 className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{tenant.name}</h3>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>/{tenant.slug}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${planColors[tenant.plan] || 'bg-gray-100 text-gray-700'}`}>
                  {tenant.plan}
                </span>
              </div>

              {/* Stats */}
              {stats && (
                <div className="grid grid-cols-3 gap-2 mb-4 py-3 border-t border-b" style={{ borderColor: 'var(--border-primary)' }}>
                  <div className="text-center">
                    <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{stats.total_users}</p>
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Users</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{stats.total_loans}</p>
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Loans</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>${stats.total_volume?.toLocaleString() || 0}</p>
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Volume</p>
                  </div>
                </div>
              )}

              {/* Limits */}
              <div className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
                Max {tenant.max_users} users, {tenant.max_loans} loans
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(tenant)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border cursor-pointer transition-colors hover:bg-[var(--surface-secondary)]"
                  style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                {tenant.id !== 1 && (
                  <button
                    onClick={() => handleDeactivate(tenant)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-red-200 text-red-600 cursor-pointer transition-colors hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create/Edit Modal */}
      {(showCreate || editingTenant) && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => { setShowCreate(false); setEditingTenant(null); }}>
          <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl" style={{ backgroundColor: 'var(--surface-primary)' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                {editingTenant ? 'Edit Tenant' : 'Create Tenant'}
              </h3>
              <button onClick={() => { setShowCreate(false); setEditingTenant(null); }} className="p-1.5 rounded-lg cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Organization Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none focus:ring-2"
                  style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--surface-secondary)', color: 'var(--text-primary)' }}
                  placeholder="e.g. Khmer Microfinance"
                />
              </div>

              {!editingTenant && formName && (
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Slug (auto-generated)</label>
                  <div className="w-full px-3 py-2.5 rounded-xl text-sm border font-mono" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--surface-secondary)', color: 'var(--text-secondary)' }}>
                    /{formName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Logo URL (White-labeling)</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formLogoUrl}
                    onChange={e => setFormLogoUrl(e.target.value)}
                    className="flex-1 px-3 py-2.5 rounded-xl text-sm border outline-none focus:ring-2"
                    style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--surface-secondary)', color: 'var(--text-primary)' }}
                    placeholder="https://example.com/logo.png"
                  />
                  {formLogoUrl && (
                    <div className="w-10 h-10 rounded-xl border border-[var(--border-primary)] flex items-center justify-center p-1 bg-white overflow-hidden shrink-0">
                      <img src={formLogoUrl} alt="Preview" className="w-full h-full object-contain" onError={(e) => { (e.target as any).style.display = 'none'; }} />
                    </div>
                  )}
                </div>
                <p className="text-[11px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
                  Square or horizontal transparent PNG/SVG recommended.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Plan</label>
                <select
                  value={formPlan}
                  onChange={e => setFormPlan(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none cursor-pointer"
                  style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--surface-secondary)', color: 'var(--text-primary)' }}
                >
                  <option value="founding">Founding (Free)</option>
                  <option value="basic">Basic ($49/mo)</option>
                  <option value="standard">Standard ($149/mo)</option>
                  <option value="premium">Premium ($349/mo)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Max Users</label>
                  <input
                    type="number"
                    value={formMaxUsers}
                    onChange={e => setFormMaxUsers(parseInt(e.target.value) || 50)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none focus:ring-2"
                    style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--surface-secondary)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Max Loans</label>
                  <input
                    type="number"
                    value={formMaxLoans}
                    onChange={e => setFormMaxLoans(parseInt(e.target.value) || 500)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none focus:ring-2"
                    style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--surface-secondary)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowCreate(false); setEditingTenant(null); }}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border cursor-pointer"
                style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}
              >
                Cancel
              </button>
              <button
                onClick={editingTenant ? handleUpdate : handleCreate}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                <Check className="w-4 h-4" />
                {editingTenant ? 'Save Changes' : 'Create Tenant'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
