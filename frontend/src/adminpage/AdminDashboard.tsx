import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Building2, ClipboardList, CreditCard, TrendingUp, DollarSign, Edit, Trash2, X, Check, Plus, Mail, User, Lock, Eye, EyeOff, AlertCircle, Phone, MapPin, ArrowRight, CheckCircle2, Sparkles, Star, Wrench, ArrowLeft } from 'lucide-react';
import { Sidebar } from '../components/shared/Sidebar';
import { Header } from '../components/shared/Header';
import { Card, StatCard } from '../components/shared/Card';
import { DataTable } from '../components/shared/DataTable';
import { LineChart } from '../components/shared/LineChart';
import { EmptyState } from '../components/shared/EmptyState';
import { Button } from '../components/shared/Button';
import { EditModal } from '../components/shared/EditModal';
import { VENDOR_SERVICES } from '../constants/services';
import { servicesData } from '../constants/servicesData';
import api from '../services/apiService';
import AddServiceWizard from './AddServiceWizard';

// ─── Dashboard Tab ──────────────────────────────────────────────────────────
function DashboardHome() {
  const [stats, setStats] = useState<any>(null);
  const [revenueTrend, setRevenueTrend] = useState<any[]>([]);
  const [jobTrend, setJobTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/admin/stats').catch(() => ({ data: {} })),
      api.get('/api/admin/revenue-trend').catch(() => ({ data: [] })),
      api.get('/api/admin/job-trend').catch(() => ({ data: [] })),
    ]).then(([s, r, j]) => {
      setStats(s.data);
      setRevenueTrend(r.data);
      setJobTrend(j.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>;

  return (
    <div className="space-y-6">
      {/* Primary Analytics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Customers" value={stats?.totalCustomers ?? 0} icon={<Users className="w-5 h-5" />} color="navy" />
        <StatCard title="Active Vendors" value={stats?.totalVendors ?? 0} icon={<Building2 className="w-5 h-5" />} color="green" />
        <StatCard title="Total Bookings" value={stats?.totalBookings ?? 0} icon={<ClipboardList className="w-5 h-5" />} color="yellow" />
        <StatCard title="Pending Payments" value={stats?.pendingPayments ?? 0} icon={<CreditCard className="w-5 h-5" />} color="red" />
      </div>

      {/* Service Request Counters */}
      <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
        <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3.5">Service Management Requests</h4>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <StatCard title="Pending Work Types" value={stats?.pendingWorkTypes ?? 0} icon={<Sparkles className="w-5 h-5" />} color="navy" />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card><h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Revenue Trend</h3>
          <LineChart data={revenueTrend} xKey="week" lines={[{ dataKey: 'revenue', color: '#041e41', name: 'Revenue (₱)' }]} /></Card>
        <Card><h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Bookings Trend</h3>
          <LineChart data={jobTrend} xKey="week" lines={[{ dataKey: 'bookings', color: '#20b759', name: 'Bookings' }]} /></Card>
      </div>
    </div>
  );
}

// ─── Customers Tab ──────────────────────────────────────────────────────────
function CustomersTab() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState<any>(null);
  useEffect(() => { api.get('/api/customers').then(r => setCustomers(r.data)).catch(() => { }).finally(() => setLoading(false)); }, []);
  const handleDelete = async (id: string) => { await api.delete(`/api/customers/${id}`); setCustomers(cs => cs.filter(c => c.id !== id)); };
  const handleEditSave = async (data: Record<string, any>) => {
    await api.put(`/api/customers/${editItem.id}`, data);
    setCustomers(cs => cs.map(c => c.id === editItem.id ? { ...c, ...data } : c));
    setEditItem(null);
  };
  return (
    <>
      <DataTable columns={[
        { key: 'first_name', label: 'First Name', sortable: true },
        { key: 'last_name', label: 'Last Name', sortable: true },
        { key: 'email', label: 'Email', sortable: true },
        { key: 'phone', label: 'Phone' },
        {
          key: 'last_login', label: 'Last Login', sortable: true, render: (item: any) => {
            if (!item.last_login) return 'Never';
            const date = item.last_login.seconds ? new Date(item.last_login.seconds * 1000) : new Date(item.last_login);
            return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString();
          }
        },
        {
          key: 'actions', label: 'Actions', render: (item: any) => (
            <div className="flex gap-2">
              <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white" onClick={(e: any) => { e.stopPropagation(); setEditItem(item); }} icon={<Edit className="w-4 h-4" />}>Edit</Button>
              <Button variant="danger" size="sm" onClick={(e: any) => { e.stopPropagation(); handleDelete(item.id); }} icon={<Trash2 className="w-4 h-4" />}>Delete</Button>
            </div>
          )
        },
      ]} data={customers} loading={loading} searchPlaceholder="Search customers..." emptyTitle="No customers yet" />
      {editItem && (
        <EditModal
          title="Edit Customer"
          fields={[
            { key: 'first_name', label: 'First Name', placeholder: 'First name' },
            { key: 'last_name', label: 'Last Name', placeholder: 'Last name' },
            { key: 'phone', label: 'Phone', type: 'tel', placeholder: '09XX XXX XXXX' },
          ]}
          initialData={editItem}
          onSave={handleEditSave}
          onClose={() => setEditItem(null)}
        />
      )}
    </>
  );
}

// ─── Vendor Edit Modal ──────────────────────────────────────────────────────
function VendorEditModal({ vendor, onSave, onClose }: { vendor: any; onSave: (data: any) => Promise<void>; onClose: () => void }) {
  const contactParts = (vendor.contact_person || '').split(' ');
  const [form, setForm] = useState({
    company_name: vendor.company_name || '',
    first_name: vendor.first_name || contactParts[0] || '',
    last_name: vendor.last_name || contactParts.slice(1).join(' ') || '',
  });
  const [services, setServices] = useState<Array<{ service: string; sub_services: string[]; work_types?: any[] }>>(
    Array.isArray(vendor.services) ? vendor.services.map((s: any) => ({
      service: s.service,
      sub_services: [...(s.sub_services || [])],
      work_types: s.work_types || []
    })) : []
  );
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Dynamically fetch available services from DB
  const [dbServiceOptions, setDbServiceOptions] = useState<Array<{ name: string; sub: Array<{ name: string; description: string; workTypes: string[]; prices: Record<string, string> }> }>>([]);
  useEffect(() => {
    api.get('/api/services')
      .then(res => {
        const dbServices = (res.data || []).map((s: any) => ({
          name: s.name,
          sub: (s.subServices || []).map((sub: any) => ({
            name: typeof sub === 'string' ? sub : sub.name,
            description: typeof sub === 'string' ? '' : (sub.description || ''),
            workTypes: typeof sub === 'string' ? [] : (sub.workTypes || []),
            prices: typeof sub === 'string' ? {} : (sub.prices || {})
          })),
        }));
        setDbServiceOptions(dbServices);
      })
      .catch(() => setDbServiceOptions([]));
  }, []);

  const availableServices = dbServiceOptions;

  const toggleService = (serviceName: string) => {
    const exists = services.find(s => s.service === serviceName);
    if (exists) {
      setServices(services.filter(s => s.service !== serviceName));
      setExpandedService(null);
    } else {
      setServices([...services, { service: serviceName, sub_services: [], work_types: [] }]);
      setExpandedService(serviceName);
    }
  };

  const toggleSubService = (serviceName: string, subName: string) => {
    setServices(services.map(s => {
      if (s.service === serviceName) {
        const has = s.sub_services.includes(subName);
        const newSubServices = has 
          ? s.sub_services.filter(x => x !== subName) 
          : [...s.sub_services, subName];
        
        const currentWts = s.work_types || [];
        const newWts = has
          ? currentWts.filter((wt: any) => wt.subService !== subName)
          : currentWts;

        return {
          ...s,
          sub_services: newSubServices,
          work_types: newWts
        };
      }
      return s;
    }));
  };

  const toggleWorkType = (serviceName: string, subName: string, workTypeName: string, defaultPrice: string) => {
    setServices(services.map(s => {
      if (s.service === serviceName) {
        const currentWts = s.work_types || [];
        const exists = currentWts.some((wt: any) => wt.name === workTypeName && wt.subService === subName);
        const updatedWts = exists
          ? currentWts.filter((wt: any) => !(wt.name === workTypeName && wt.subService === subName))
          : [...currentWts, { name: workTypeName, subService: subName, price: defaultPrice || '0.00', status: 'approved' }];
        return {
          ...s,
          work_types: updatedWts
        };
      }
      return s;
    }));
  };

  const handleSave = async () => {
    setError('');
    if (!form.company_name.trim()) { setError('Company name is required'); return; }
    if (!form.first_name.trim()) { setError('First name is required'); return; }
    if (!form.last_name.trim()) { setError('Last name is required'); return; }
    if (services.length === 0) { setError('At least one service is required'); return; }
    for (const s of services) {
      const def = availableServices.find(vs => vs.name === s.service);
      if (def && def.sub.length > 0 && s.sub_services.length === 0) {
        setError(`Select at least one sub-service for ${s.service}`);
        return;
      }
      if (def && def.sub) {
        for (const subName of s.sub_services) {
          const dbSub = def.sub.find((ds: any) => ds.name === subName);
          if (dbSub && dbSub.workTypes && dbSub.workTypes.length > 0) {
            const hasWt = (s.work_types || []).some((wt: any) => wt.subService === subName);
            if (!hasWt) {
              setError(`Please select at least one work type for sub-service ${subName} under ${s.service}.`);
              return;
            }
          }
        }
      }
    }
    setSaving(true);
    try {
      const mergedServices = services.map(sel => {
        const existing = vendor.services?.find((c: any) => c.service === sel.service);
        const existingCustomWts = (existing?.work_types || []).filter((wt: any) => wt.status === 'pending' || wt.status === 'rejected');
        
        const finalWts = [...(sel.work_types || [])];
        existingCustomWts.forEach((vwt: any) => {
          if (!finalWts.some((wt: any) => wt.name.toLowerCase() === vwt.name.toLowerCase() && wt.subService.toLowerCase() === vwt.subService.toLowerCase())) {
            finalWts.push(vwt);
          }
        });

        return {
          ...sel,
          work_types: finalWts
        };
      });

      await onSave({
        company_name: form.company_name.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        contact_person: `${form.first_name.trim()} ${form.last_name.trim()}`,
        services: mergedServices,
      });
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Save failed');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Vendor</h3>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">{error}</div>}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
                <input value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-brand-navy/20" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                  <input value={form.first_name} onChange={e => { const v = e.target.value; setForm({ ...form, first_name: v.length > 0 ? v.charAt(0).toUpperCase() + v.slice(1) : v }); }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-brand-navy/20" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                  <input value={form.last_name} onChange={e => { const v = e.target.value; setForm({ ...form, last_name: v.length > 0 ? v.charAt(0).toUpperCase() + v.slice(1) : v }); }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-brand-navy/20" />
                </div>
              </div>
              {/* Services Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Services</label>
                <div className="max-h-96 overflow-y-auto pr-1 space-y-2 border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-slate-50/50 dark:bg-slate-800/50">
                  {availableServices.map(svc => {
                    const isSelected = services.find(s => s.service === svc.name);
                    return (
                      <div key={svc.name} className="space-y-1">
                        <button type="button" onClick={() => toggleService(svc.name)}
                          className={`w-full p-2.5 rounded-lg border-2 transition-all text-left text-sm ${isSelected ? 'border-brand-navy dark:border-brand-green bg-brand-navy/5 dark:bg-brand-green/10' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900 dark:text-white">{svc.name}</span>
                            {isSelected && <Check className="w-4 h-4 text-brand-green" />}
                          </div>
                        </button>
                        {isSelected && svc.sub && svc.sub.length > 0 && (
                          <div className="ml-4 mt-1 p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Sub-services & Work Types:</p>
                            {svc.sub.map((sub: any) => {
                              const subName = sub.name;
                              const isSubSelected = isSelected.sub_services.includes(subName);
                              const subServiceWorkTypes = sub.workTypes || [];

                              return (
                                <div key={subName} className="space-y-1.5 border-l-2 border-slate-100 dark:border-slate-800 pl-3">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={isSubSelected} onChange={() => toggleSubService(svc.name, subName)}
                                      className="w-3.5 h-3.5 rounded border-slate-300 text-brand-navy focus:ring-brand-navy" />
                                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{subName}</span>
                                  </label>

                                  {isSubSelected && subServiceWorkTypes.length > 0 && (
                                    <div className="ml-5 mt-1 space-y-1">
                                      <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Select Work Types:</p>
                                      {subServiceWorkTypes.map((wt: string) => {
                                        const isWtSelected = isSelected.work_types?.some((vwt: any) => vwt.name === wt && vwt.subService === subName);

                                        return (
                                          <label key={wt} className="flex items-center gap-2 cursor-pointer py-0.5">
                                            <input type="checkbox" checked={!!isWtSelected} onChange={() => toggleWorkType(svc.name, subName, wt, sub.prices?.[wt] || '0.00')}
                                              className="w-3 h-3 rounded border-slate-300 text-brand-green focus:ring-brand-green" />
                                            <span className="text-[11px] text-slate-655 dark:text-slate-345">{wt}</span>
                                          </label>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {services.length > 0 && (
                  <div className="mt-2 p-2 rounded-lg bg-brand-green/10 border border-brand-green/20">
                    <p className="text-xs font-medium text-brand-green">Selected: {services.map(s => `${s.service} (${s.sub_services.length})`).join(', ')}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 pt-6">
              <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
              <Button variant="success" className="flex-1" onClick={handleSave} loading={saving}>Save Changes</Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

// ─── Vendors Tab ────────────────────────────────────────────────────────────
function VendorsTab() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState<any>(null);
  const [personnelCounts, setPersonnelCounts] = useState<Record<string, number>>({});

  // Creation form states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    companyName: '',
    city: ''
  });
  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [createError, setCreateError] = useState('');
  const [createSaving, setCreateSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [usernameCheckLoading, setUsernameCheckLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [usernameValid, setUsernameValid] = useState(false);

  const [cities, setCities] = useState<Array<{ code: string; name: string }>>([]);
  const [citiesLoading, setCitiesLoading] = useState(true);

  // Fetch NCR cities on component mount
  useEffect(() => {
    setCitiesLoading(true);
    fetch('https://psgc.gitlab.io/api/regions/130000000/cities-municipalities/')
      .then((r) => r.json())
      .then((data) => {
        setCities(data.sort((a: any, b: any) => a.name.localeCompare(b.name)));
        setCitiesLoading(false);
      })
      .catch(() => setCitiesLoading(false));
  }, []);

  // Dynamically fetch available services from DB for Create Vendor
  const [dbCreateServiceOptions, setDbCreateServiceOptions] = useState<Array<{ name: string; sub: Array<{ name: string; description: string; workTypes: string[]; prices: Record<string, string> }> }>>([]);
  useEffect(() => {
    api.get('/api/services')
      .then(res => {
        const dbServices = (res.data || []).map((s: any) => ({
          name: s.name,
          sub: (s.subServices || []).map((sub: any) => ({
            name: typeof sub === 'string' ? sub : sub.name,
            description: typeof sub === 'string' ? '' : (sub.description || ''),
            workTypes: typeof sub === 'string' ? [] : (sub.workTypes || []),
            prices: typeof sub === 'string' ? {} : (sub.prices || {})
          })),
        }));
        setDbCreateServiceOptions(dbServices);
      })
      .catch(() => setDbCreateServiceOptions([]));
  }, []);

  const dynamicServices = dbCreateServiceOptions;

  useEffect(() => {
    api.get('/api/vendors').then(r => {
      setVendors(r.data);
      // Fetch personnel count for each vendor
      r.data.forEach((vendor: any) => {
        api.get(`/api/vendors/${vendor.id}/personnel-count`)
          .then(res => {
            setPersonnelCounts(prev => ({
              ...prev,
              [vendor.id]: res.data.personnel_count
            }));
          })
          .catch(() => {
            setPersonnelCounts(prev => ({
              ...prev,
              [vendor.id]: 0
            }));
          });
      });
    }).catch(() => { }).finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id: string) => { await api.post(`/api/admin/vendors/${id}/approve`); setVendors(vs => vs.map(v => v.id === id ? { ...v, acc_approve: 'approved', is_approved: true } : v)); };
  const handleReject = async (id: string) => { await api.post(`/api/admin/vendors/${id}/reject`); setVendors(vs => vs.map(v => v.id === id ? { ...v, acc_approve: 'rejected', is_approved: false } : v)); };
  const handleDelete = async (id: string) => { await api.delete(`/api/vendors/${id}`); setVendors(vs => vs.filter(v => v.id !== id)); };
  const handleEditSave = async (data: any) => {
    await api.put(`/api/vendors/${editItem.id}`, data);
    setVendors(vs => vs.map(v => v.id === editItem.id ? { ...v, ...data } : v));
    setEditItem(null);
  };

  const passwordStrength = (pw: string) => {
    let s = 0;
    if (pw.length >= 8) s++; if (/[A-Z]/.test(pw)) s++; if (/[0-9]/.test(pw)) s++; if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };

  const strength = passwordStrength(createForm.password);
  const strengthColors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-brand-green'];
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

  const checkUsername = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameError('Min 3 chars');
      setUsernameValid(false);
      return;
    }
    setUsernameCheckLoading(true);
    try {
      const res = await api.get(`/api/auth/check-username?username=${encodeURIComponent(username)}`);
      if (res.data.available) {
        setUsernameValid(true);
        setUsernameError('');
      } else {
        setUsernameError('Username taken');
        setUsernameValid(false);
      }
    } catch {
      setUsernameValid(true);
      setUsernameError('');
    } finally {
      setUsernameCheckLoading(false);
    }
  };

  const updateCreateForm = (key: keyof typeof createForm, value: string) => {
    let processedValue = value;
    if (['username', 'email', 'password', 'confirmPassword'].includes(key)) {
      processedValue = value.replace(/\s/g, '');
    }
    if (['firstName', 'lastName'].includes(key) && value.length > 0) {
      processedValue = value.charAt(0).toUpperCase() + value.slice(1);
    }
    setCreateForm(prev => ({ ...prev, [key]: processedValue }));
    if (key === 'username') {
      setUsernameError('');
      setUsernameValid(false);
    }
  };

  const toggleService = (serviceName: string) => {
    const exists = selectedServices.find(s => s.service === serviceName);
    if (exists) {
      setSelectedServices(selectedServices.filter(s => s.service !== serviceName));
    } else {
      setSelectedServices([...selectedServices, { service: serviceName, sub_services: [], work_types: [] }]);
    }
  };

  const toggleSubService = (serviceName: string, subName: string) => {
    setSelectedServices(selectedServices.map(s => {
      if (s.service === serviceName) {
        const has = s.sub_services.includes(subName);
        const newSubServices = has 
          ? s.sub_services.filter((x: string) => x !== subName) 
          : [...s.sub_services, subName];
        
        const currentWts = s.work_types || [];
        const newWts = has
          ? currentWts.filter((wt: any) => wt.subService !== subName)
          : currentWts;

        return { 
          ...s, 
          sub_services: newSubServices,
          work_types: newWts
        };
      }
      return s;
    }));
  };

  const toggleWorkType = (serviceName: string, subName: string, workTypeName: string, defaultPrice: string) => {
    setSelectedServices(selectedServices.map(s => {
      if (s.service === serviceName) {
        const currentWts = s.work_types || [];
        const exists = currentWts.some((wt: any) => wt.name === workTypeName && wt.subService === subName);
        const updatedWts = exists
          ? currentWts.filter((wt: any) => !(wt.name === workTypeName && wt.subService === subName))
          : [...currentWts, { name: workTypeName, subService: subName, price: defaultPrice || '0.00', status: 'approved' }];
        return {
          ...s,
          work_types: updatedWts
        };
      }
      return s;
    }));
  };

  const handleCreateVendorSubmit = async () => {
    setCreateError('');

    const hasValidServices = selectedServices.length > 0 && selectedServices.every(s => {
      const serviceDef = dynamicServices.find(svc => svc.name === s.service);
      if (!serviceDef) return false;
      if (serviceDef.sub.length === 0) return true;
      if (s.sub_services.length === 0) return false;
      
      return s.sub_services.every((subName: string) => {
        const subDef = serviceDef.sub.find((sub: any) => sub.name === subName);
        if (!subDef || !subDef.workTypes || subDef.workTypes.length === 0) return true;
        return (s.work_types || []).some((wt: any) => wt.subService === subName);
      });
    });

    if (!createForm.firstName || !createForm.lastName || !createForm.username || !createForm.email || !createForm.password || !createForm.confirmPassword || !createForm.phone || !createForm.companyName || !createForm.city || !hasValidServices) {
      setCreateError('All fields and services are required.');
      return;
    }
    if (!/^\d{11}$/.test(createForm.phone)) {
      setCreateError('Phone number must be exactly 11 digits.');
      return;
    }
    if (!usernameValid) {
      setCreateError('Please use a valid, unique username.');
      return;
    }
    if (createForm.password !== createForm.confirmPassword) {
      setCreateError("Passwords do not match.");
      return;
    }
    if (strength < 4) {
      setCreateError("Password must be strong (min 8 chars, uppercase, number, special char).");
      return;
    }

    setCreateSaving(true);
    try {
      const payload = {
        ...createForm,
        services: selectedServices
      };
      const res = await api.post('/api/admin/vendors/create', payload);
      const newVendor = {
        id: res.data.id,
        uid: res.data.id,
        first_name: createForm.firstName,
        last_name: createForm.lastName,
        username: createForm.username,
        email: createForm.email,
        phone: createForm.phone,
        company_name: createForm.companyName,
        city: createForm.city,
        contact_person: `${createForm.firstName} ${createForm.lastName}`,
        acc_approve: 'approved',
        is_approved: true,
        temp_delete: 0,
        last_login: null,
        services: selectedServices
      };
      setVendors(prev => [newVendor, ...prev]);
      setShowCreateModal(false);
      setCreateForm({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        companyName: '',
        city: ''
      });
      setSelectedServices([]);
    } catch (err: any) {
      setCreateError(err.response?.data?.message || err.message || 'Failed to create vendor account.');
    } finally {
      setCreateSaving(false);
    }
  };

  const hasValidServices = selectedServices.length > 0 && selectedServices.every(s => {
    const serviceDef = dynamicServices.find(svc => svc.name === s.service);
    if (!serviceDef) return false;
    if (serviceDef.sub.length === 0) return true;
    if (s.sub_services.length === 0) return false;
    
    return s.sub_services.every((subName: string) => {
      const subDef = serviceDef.sub.find((sub: any) => sub.name === subName);
      if (!subDef || !subDef.workTypes || subDef.workTypes.length === 0) return true;
      return (s.work_types || []).some((wt: any) => wt.subService === subName);
    });
  });

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Service Providers</h3>
        <Button onClick={() => { setShowCreateModal(true); setCreateError(''); }} icon={<Plus className="w-4 h-4" />}>
          Create Vendor
        </Button>
      </div>

      <DataTable columns={[
        { key: 'company_name', label: 'Company', sortable: true },
        { key: 'contact_person', label: 'Contact', sortable: true },
        { key: 'email', label: 'Email', sortable: true },
        {
          key: 'last_login', label: 'Last Login', sortable: true, render: (item: any) => {
            if (!item.last_login) return 'Never';
            const date = item.last_login.seconds ? new Date(item.last_login.seconds * 1000) : new Date(item.last_login);
            return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString();
          }
        },
        {
          key: 'services', label: 'Services', render: (item: any) => {
            if (!item.services || !Array.isArray(item.services) || item.services.length === 0) {
              return <span className="text-xs text-slate-400">—</span>;
            }
            return (
              <div className="flex flex-col gap-1 max-w-[250px] max-h-24 overflow-y-auto pr-2">
                {item.services.map((s: any, i: number) => (
                  <div key={i} className="text-xs leading-tight">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{s.service}</span>
                    {s.sub_services && Array.isArray(s.sub_services) && s.sub_services.length > 0 && (
                      <span className="text-slate-500 block ml-2">• {s.sub_services.join(', ')}</span>
                    )}
                  </div>
                ))}
              </div>
            );
          }
        },
        {
          key: 'acc_approve', label: 'Status', render: (item: any) => {
            const status = item.acc_approve || 'pending';
            return <span className={status === 'approved' ? 'badge-completed' : status === 'rejected' ? 'badge-cancelled' : 'badge-pending'}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>;
          }
        },
        {
          key: 'actions', label: 'Actions', render: (item: any) => {
            const status = item.acc_approve || 'pending';
            return status === 'pending' ? (
              <div className="flex gap-2">
                <Button variant="success" size="sm" onClick={(e: any) => { e.stopPropagation(); handleApprove(item.id); }}>Approve</Button>
                <Button variant="danger" size="sm" onClick={(e: any) => { e.stopPropagation(); handleReject(item.id); }}>Reject</Button>
              </div>
            ) : status === 'approved' ? (
              <div className="flex gap-2">
                <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white" onClick={(e: any) => { e.stopPropagation(); setEditItem(item); }} icon={<Edit className="w-4 h-4" />}>Edit</Button>
                <Button variant="danger" size="sm" onClick={(e: any) => { e.stopPropagation(); handleDelete(item.id); }} icon={<Trash2 className="w-4 h-4" />}>Delete</Button>
              </div>
            ) : <span className="text-xs text-slate-400">—</span>;
          }
        },
      ]} data={vendors} loading={loading} searchPlaceholder="Search vendors..." />
      {editItem && <VendorEditModal vendor={editItem} onSave={handleEditSave} onClose={() => setEditItem(null)} />}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setShowCreateModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg" onClick={e => e.stopPropagation()}>
              <Card>
                <div className="p-6 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create Vendor Account</h3>
                    <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {createError && (
                    <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex gap-2 items-center">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{createError}</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            value={createForm.firstName}
                            onChange={(e) => updateCreateForm('firstName', e.target.value)}
                            className="input-base pl-10 text-sm"
                            placeholder="Juan"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            value={createForm.lastName}
                            onChange={(e) => updateCreateForm('lastName', e.target.value)}
                            className="input-base pl-10 text-sm"
                            placeholder="Dela Cruz"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Username</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          value={createForm.username}
                          onChange={(e) => updateCreateForm('username', e.target.value)}
                          onBlur={() => createForm.username && checkUsername(createForm.username)}
                          className="input-base pl-10 text-sm"
                          placeholder="username"
                        />
                        {usernameCheckLoading && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">Checking...</div>}
                      </div>
                      {usernameError && <p className="text-xs text-brand-red mt-1">{usernameError}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          value={createForm.email}
                          onChange={(e) => updateCreateForm('email', e.target.value)}
                          className="input-base pl-10 text-sm"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={createForm.password}
                          onChange={(e) => updateCreateForm('password', e.target.value)}
                          className="input-base pl-10 pr-10 text-sm"
                          placeholder="Min 8 characters"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {createForm.password && (
                        <div className="mt-2">
                          <div className="flex gap-1">
                            {[0, 1, 2, 3].map(i => (
                              <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < strength ? strengthColors[strength - 1] : 'bg-slate-200 dark:bg-slate-700'}`} />
                            ))}
                          </div>
                          <p className="text-xs mt-1 text-slate-500">{strengthLabels[strength - 1] || 'Too weak'}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="password"
                          value={createForm.confirmPassword}
                          onChange={(e) => updateCreateForm('confirmPassword', e.target.value)}
                          className="input-base pl-10 text-sm"
                          placeholder="Re-enter password"
                        />
                      </div>
                      {createForm.confirmPassword && createForm.password !== createForm.confirmPassword && (
                        <p className="text-xs text-brand-red mt-1">Passwords don't match</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="tel"
                          value={createForm.phone}
                          onChange={(e) => updateCreateForm('phone', e.target.value)}
                          className="input-base pl-10 text-sm"
                          placeholder="09XX XXX XXXX"
                        />
                      </div>
                      {createForm.phone && !/^\d{11}$/.test(createForm.phone) && (
                        <p className="text-xs text-brand-red mt-1">Phone number must be exactly 11 digits</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          value={createForm.companyName}
                          onChange={(e) => updateCreateForm('companyName', e.target.value)}
                          className="input-base pl-10 text-sm"
                          placeholder="Company LLC"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">City / Municipality</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                          value={createForm.city}
                          onChange={(e) => updateCreateForm('city', e.target.value)}
                          className="input-base pl-10 text-sm py-3"
                          disabled={citiesLoading}
                        >
                          <option value="">{citiesLoading ? 'Loading cities...' : 'Select City/Municipality'}</option>
                          {cities.map(c => (
                            <option key={c.code} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Services You Offer</label>
                      <div className="max-h-96 overflow-y-auto pr-1 space-y-2 border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-slate-50/50 dark:bg-slate-800/50">
                        {dynamicServices.map(service => {
                          const isSelected = selectedServices.find(s => s.service === service.name);
                          return (
                            <div key={service.name} className="space-y-1">
                              <button
                                type="button"
                                onClick={() => toggleService(service.name)}
                                className={`w-full p-2.5 rounded-lg border-2 transition-all text-left text-sm ${isSelected
                                  ? 'border-brand-navy dark:border-brand-green bg-brand-navy/5 dark:bg-brand-green/10'
                                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                  }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-slate-900 dark:text-white">{service.name}</span>
                                  {isSelected && <Check className="w-4 h-4 text-brand-green" />}
                                </div>
                              </button>

                              {isSelected && service.sub.length > 0 && (
                                <div className="ml-4 mt-1 p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Sub-services & Work Types:</p>
                                  {service.sub.map((sub: any) => {
                                    const subName = sub.name;
                                    const isSubSelected = isSelected.sub_services.includes(subName);
                                    const subServiceWorkTypes = sub.workTypes || [];

                                    return (
                                      <div key={subName} className="space-y-1.5 border-l-2 border-slate-100 dark:border-slate-800 pl-3">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                          <input
                                            type="checkbox"
                                            checked={isSubSelected}
                                            onChange={() => toggleSubService(service.name, subName)}
                                            className="w-3.5 h-3.5 rounded border-slate-300 text-brand-navy focus:ring-brand-navy"
                                          />
                                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{subName}</span>
                                        </label>

                                        {isSubSelected && subServiceWorkTypes.length > 0 && (
                                          <div className="ml-5 mt-1 space-y-1">
                                            <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Select Work Types:</p>
                                            {subServiceWorkTypes.map((wt: string) => {
                                              const isWtSelected = isSelected.work_types?.some((vwt: any) => vwt.name === wt && vwt.subService === subName);

                                              return (
                                                <label key={wt} className="flex items-center gap-2 cursor-pointer py-0.5">
                                                  <input
                                                    type="checkbox"
                                                    checked={!!isWtSelected}
                                                    onChange={() => toggleWorkType(service.name, subName, wt, sub.prices?.[wt] || '0.00')}
                                                    className="w-3 h-3 rounded border-slate-300 text-brand-green focus:ring-brand-green"
                                                  />
                                                  <span className="text-[11px] text-slate-655 dark:text-slate-345">{wt}</span>
                                                </label>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {selectedServices.length > 0 && (
                        <div className="mt-2 p-2 rounded-lg bg-brand-green/10 border border-brand-green/20">
                          <p className="text-xs font-medium text-brand-green">Selected: {selectedServices.map(s => `${s.service} (${s.sub_services.length})`).join(', ')}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-6">
                    <Button variant="ghost" className="flex-grow sm:flex-1" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                    <Button
                      variant="success"
                      className="flex-grow sm:flex-1"
                      onClick={handleCreateVendorSubmit}
                      loading={createSaving}
                      disabled={!createForm.firstName || !createForm.lastName || !createForm.username || !usernameValid || !createForm.email || !createForm.password || !createForm.confirmPassword || !createForm.phone || !/^\d{11}$/.test(createForm.phone) || !createForm.companyName || !createForm.city || !hasValidServices || createForm.password !== createForm.confirmPassword || strength < 4}
                      icon={<Plus className="w-4 h-4" />}
                    >
                      Create Vendor
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Bookings Tab ───────────────────────────────────────────────────────────
function BookingsTab() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/api/bookings').then(r => setBookings(r.data)).catch(() => { }).finally(() => setLoading(false)); }, []);
  const statusBadge = (status: string) => {
    const cls: Record<string, string> = { pending: 'badge-pending', confirmed: 'badge-confirmed', in_progress: 'badge-in-progress', completed: 'badge-completed' };
    return <span className={cls[status] || 'badge'}>{status.replace('_', ' ')}</span>;
  };
  return (
    <DataTable columns={[
      { key: 'service_type', label: 'Service', sortable: true },
      { key: 'scheduled_date', label: 'Date', sortable: true },
      { key: 'status', label: 'Status', render: (item: any) => statusBadge(item.status) },
      { key: 'payment_confirmed', label: 'Payment', render: (item: any) => item.payment_confirmed ? <span className="badge-completed">Confirmed</span> : <span className="badge-pending">Pending</span> },
    ]} data={bookings} loading={loading} searchPlaceholder="Search bookings..." />
  );
}

// ─── Payments Tab ───────────────────────────────────────────────────────────
function PaymentsTab() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/api/payments/pending').then(r => setPayments(r.data)).catch(() => { }).finally(() => setLoading(false)); }, []);
  return payments.length === 0 && !loading ? <EmptyState title="No pending payments" description="All payments have been processed." /> : (
    <DataTable columns={[
      { key: 'service_type', label: 'Service' },
      { key: 'payment_reference', label: 'Reference' },
      { key: 'scheduled_date', label: 'Date' },
      {
        key: 'actions', label: 'Actions', render: (item: any) => (
          <div className="flex gap-2">
            <Button variant="success" size="sm" onClick={() => api.patch(`/api/payments/${item.id}/confirm`).then(() => setPayments(ps => ps.filter(p => p.id !== item.id)))}>Confirm</Button>
            <Button variant="danger" size="sm" onClick={() => api.patch(`/api/payments/${item.id}/confirm`, { confirmed: false })}>Reject</Button>
          </div>
        )
      },
    ]} data={payments} loading={loading} />
  );
}

// ─── Refunds Tab ────────────────────────────────────────────────────────────
function RefundsTab() {
  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/api/refunds').then(r => setRefunds(r.data)).catch(() => { }).finally(() => setLoading(false)); }, []);
  return (
    <DataTable columns={[
      { key: 'reason', label: 'Reason', sortable: true },
      { key: 'deduction_amount', label: 'Deduction (₱)' },
      { key: 'status', label: 'Status', render: (item: any) => <span className={item.status === 'approved' ? 'badge-completed' : item.status === 'rejected' ? 'badge-cancelled' : 'badge-pending'}>{item.status}</span> },
      {
        key: 'actions', label: 'Actions', render: (item: any) => item.status === 'pending' ? (
          <div className="flex gap-2">
            <Button variant="success" size="sm" onClick={() => api.patch(`/api/refunds/${item.id}/approve`)}>Approve</Button>
            <Button variant="danger" size="sm" onClick={() => api.patch(`/api/refunds/${item.id}/reject`)}>Reject</Button>
          </div>
        ) : null
      },
    ]} data={refunds} loading={loading} searchPlaceholder="Search refunds..." emptyTitle="No refunds" />
  );
}

// ─── Support Tab ────────────────────────────────────────────────────────────
function SupportTab() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/api/support').then(r => setTickets(r.data)).catch(() => { }).finally(() => setLoading(false)); }, []);
  return (
    <DataTable columns={[
      { key: 'subject', label: 'Subject', sortable: true },
      { key: 'role', label: 'Role' },
      { key: 'priority', label: 'Priority', render: (item: any) => <span className={item.priority === 'high' ? 'badge-cancelled' : item.priority === 'medium' ? 'badge-pending' : 'badge-confirmed'}>{item.priority}</span> },
      { key: 'status', label: 'Status', render: (item: any) => <span className={item.status === 'resolved' ? 'badge-completed' : item.status === 'in_progress' ? 'badge-in-progress' : 'badge-pending'}>{item.status}</span> },
    ]} data={tickets} loading={loading} searchPlaceholder="Search tickets..." emptyTitle="No support tickets" />
  );
}

// ─── Personnel Tab ──────────────────────────────────────────────────────────
function PersonnelTab() {
  const [personnel, setPersonnel] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([
      api.get('/api/personnel').catch(() => ({ data: [] })),
      api.get('/api/vendors').catch(() => ({ data: [] }))
    ]).then(([p, v]) => {
      setPersonnel(p.data);
      setVendors(v.data);
    }).finally(() => setLoading(false));
  }, []);

  const getCompanyName = (vendorId: string) => {
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor?.company_name || vendor?.name || '—';
  };

  return (
    <DataTable columns={[
      { key: 'first_name', label: 'First Name', sortable: true },
      { key: 'last_name', label: 'Last Name', sortable: true },
      { key: 'company', label: 'Company', render: (item: any) => getCompanyName(item.vendor_id) },
      { key: 'email', label: 'Email', sortable: true },
      { key: 'phone', label: 'Phone' },
      {
        key: 'last_login', label: 'Last Login', sortable: true, render: (item: any) => {
          if (!item.last_login) return 'Never';
          const date = item.last_login.seconds ? new Date(item.last_login.seconds * 1000) : new Date(item.last_login);
          return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString();
        }
      },
      {
        key: 'acc_approve', label: 'Status', render: (item: any) => {
          const status = item.acc_approve || 'pending';
          return <span className={status === 'approved' ? 'badge-completed' : status === 'rejected' ? 'badge-cancelled' : 'badge-pending'}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>;
        }
      },
    ]} data={personnel.filter(p => p.temp_delete !== 1)} loading={loading} searchPlaceholder="Search personnel..." emptyTitle="No personnel" />
  );
}

// ─── Placeholder Pages ──────────────────────────────────────────────────────
function PlaceholderPage({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-20">
      <div className="w-16 h-16 rounded-2xl bg-brand-navy/10 dark:bg-brand-green/10 flex items-center justify-center mb-4 text-brand-navy dark:text-brand-green">{icon}</div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md text-center">{description}</p>
    </motion.div>
  );
}

function CalendarPage() { return <PlaceholderPage title="Calendar" description="View and manage schedules, appointments, and important dates." icon={<ClipboardList className="w-8 h-8" />} />; }

function ReviewsPage() { return <PlaceholderPage title="Reviews" description="Monitor and manage customer reviews and ratings." icon={<TrendingUp className="w-8 h-8" />} />; }
function VendorsManagementPage() { return <PlaceholderPage title="Vendors Management" description="Manage vendor partnerships, contracts, and performance." icon={<Building2 className="w-8 h-8" />} />; }
function AdminServiceCard({ service, onServiceClick, onEditClick }: { service: any; onServiceClick: (svc: any) => void; onEditClick: (svc: any) => void }) {
  const [hovered, setHovered] = useState(false);
  const Icon = service.icon;

  return (
    <div
      onClick={() => onServiceClick(service)}
      className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-880 transition-all duration-300 bg-white dark:bg-slate-900 flex flex-col h-full cursor-pointer"
      style={{
        boxShadow: hovered ? '0 25px 50px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.05)',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image showcase */}
      <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <img
          src={service.image}
          alt={service.brand}
          className="w-full h-full object-cover transition-opacity duration-500 absolute top-0 left-0"
          style={{
            objectPosition: 'center 10%',
            opacity: hovered ? 0.3 : 1,
          }}
        />
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            backgroundColor: service.accent,
            opacity: hovered ? 0.6 : 0
          }}
        />
        {hovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg animate-pulse"
              style={{
                backgroundColor: service.accent,
                boxShadow: `0 0 20px ${service.accent}80, 0 0 40px ${service.accent}40`,
              }}
            >
              <Icon style={{ width: '28px', height: '28px', color: '#fff' }} />
            </div>
          </motion.div>
        )}
      </div>

      {/* Header */}
      <div
        className="relative px-6 py-5 flex items-center justify-between"
        style={{
          background: `linear-gradient(135deg, ${service.headerBg} 0%, ${service.headerBgLight} 100%)`,
        }}
      >
        <div className="text-xs font-black tracking-wider uppercase px-3 py-1 rounded-full bg-white/20 text-white">
          {service.brand}
        </div>
        <div className="flex items-center gap-2 relative z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditClick(service);
            }}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/25 text-white transition-all border border-white/10 backdrop-blur-sm shadow-sm"
            title="Edit Service"
          >
            <Edit className="w-4 h-4" />
          </button>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/15">
            <Icon style={{ width: '20px', height: '20px', color: '#fff' }} />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="font-extrabold text-lg text-slate-900 dark:text-white mb-0.5">{service.brand}</h3>
        <p className="text-xs font-bold mb-3" style={{ color: service.accent }}>{service.tagline}</p>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4 flex-grow">{service.description}</p>

        <div className="grid grid-cols-2 gap-x-3 gap-y-2 mb-4">
          {service.services.map((tag: string) => (
            <div key={tag} className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-500" style={{ color: service.accent }} />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{tag}</span>
            </div>
          ))}
        </div>

        <div
          className="inline-flex items-center gap-1.5 text-xs font-bold transition-colors duration-200 mt-auto"
          style={{ color: hovered ? service.accentDark : service.accent }}
        >
          <span>About {service.brand}</span>
          <ArrowRight
            className="w-3.5 h-3.5 transition-transform duration-200"
            style={{ transform: hovered ? 'translateX(4px)' : 'translateX(0)' }}
          />
        </div>
      </div>
      <div
        className="absolute bottom-0 left-0 h-0.5 transition-all duration-300"
        style={{
          backgroundColor: service.accent,
          width: hovered ? '100%' : '0%'
        }}
      />
    </div>
  );
}

function ServicesManagementPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState<any[]>(servicesData);
  const [loading, setLoading] = useState(true);

  // Sub-navigation tab
  const [activeTab, setActiveTab] = useState<'catalog' | 'proposals'>('catalog');
  const [proposalsTab, setProposalsTab] = useState<'workTypes'>('workTypes');

  // Request queues state
  const [pendingMains, setPendingMains] = useState<any[]>([]);
  const [pendingSubs, setPendingSubs] = useState<any[]>([]);
  const [pendingWorkTypes, setPendingWorkTypes] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Work Type approval modal
  const [selectedWorkType, setSelectedWorkType] = useState<any>(null);
  const [wtPrice, setWtPrice] = useState('');
  const [wtSubmitting, setWtSubmitting] = useState(false);
  const [wtError, setWtError] = useState('');

  // Add Service wizard modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<any>(null);

  // Subservice management state
  const [selectedService, setSelectedService] = useState<any>(null);
  const [showSubserviceModal, setShowSubserviceModal] = useState(false);
  const [subForm, setSubForm] = useState({ name: '', description: '', imageUrl: '', workTypes: '' as string, prices: '' as string });
  const [subError, setSubError] = useState('');
  const [subSaving, setSubSaving] = useState(false);
  const [backendSubservices, setBackendSubservices] = useState<any[]>([]);
  const [editingSubserviceId, setEditingSubserviceId] = useState<string | null>(null);

  const loadServices = () => {
    setLoading(true);
    api.get('/api/services')
      .then(res => {
        const backendServices = res.data;
        const merged: any[] = [];

        backendServices.forEach((bs: any) => {
          const id = bs.id || bs.name.toLowerCase().replace(/\s+/g, '');
          const frontendMatch = servicesData.find(
            s => s.id.toLowerCase() === id.toLowerCase() || s.brand.toLowerCase() === bs.name.toLowerCase()
          );
          
          if (frontendMatch) {
            merged.push({
              id,
              icon: frontendMatch.icon,
              brand: bs.name,
              tagline: bs.tagline || frontendMatch.tagline,
              description: bs.description,
              image: bs.imageUrl || bs.image || frontendMatch.image,
              accent: frontendMatch.accent,
              accentDark: frontendMatch.accentDark,
              headerBg: frontendMatch.headerBg,
              headerBgLight: frontendMatch.headerBgLight,
              pillText: frontendMatch.pillText,
              services: bs.subServices ? bs.subServices.map((sub: any) => sub.name) : [],
              subServices: bs.subServices || [],
            });
          } else {
            merged.push({
              id,
              icon: Sparkles,
              brand: bs.name,
              tagline: bs.tagline || 'Specialized Services',
              description: bs.description,
              image: bs.imageUrl || bs.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
              accent: '#2E5BA8',
              accentDark: '#10355f',
              headerBg: '#10355f',
              headerBgLight: '#2E5BA8',
              pillText: '#2E5BA8',
              services: bs.subServices ? bs.subServices.map((sub: any) => sub.name) : [],
              subServices: bs.subServices || [],
            });
          }
        });

        // Add remaining frontend services
        servicesData.forEach((fs) => {
          if (!merged.find(m => m.id.toLowerCase() === fs.id.toLowerCase())) {
            merged.push(fs);
          }
        });

        setServices(merged);
      })
      .catch(err => {
        console.error("Failed to load services", err);
        setServices(servicesData);
      })
      .finally(() => setLoading(false));
  };

  const fetchPendingRequests = useCallback(async () => {
    setLoadingRequests(true);
    try {
      const [mains, subs, wts] = await Promise.all([
        api.get('/api/services/requests/main-service/pending').catch(() => ({ data: [] })),
        api.get('/api/services/requests/sub-service/pending').catch(() => ({ data: [] })),
        api.get('/api/services/requests/work-type/pending').catch(() => ({ data: [] }))
      ]);
      setPendingMains(mains.data);
      setPendingSubs(subs.data);
      setPendingWorkTypes(wts.data);
    } catch (e) {
      console.error('Failed to load pending requests', e);
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    if (activeTab === 'proposals') {
      fetchPendingRequests();
    }
  }, [activeTab, fetchPendingRequests]);

  const handleOpenSubservices = (service: any) => {
    setSelectedService(service);
    // Load subservices from backend
    api.get(`/api/services`)
      .then(res => {
        const match = res.data.find((s: any) => s.name.toLowerCase() === service.brand.toLowerCase());
        if (match && match.subServices && match.subServices.length > 0) {
          setBackendSubservices(match.subServices);
        } else {
          // Fallback to static frontend subservices
          const formatted = (service.subServices || []).map((sub: any) => ({
            id: sub.id || sub.name.toLowerCase().replace(/\s+/g, ''),
            name: sub.name,
            description: sub.description,
            imageUrl: sub.image || sub.imageUrl || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
            workTypes: sub.workTypes || [],
            prices: sub.prices || {}
          }));
          setBackendSubservices(formatted);
        }
      })
      .catch(() => {
        const formatted = (service.subServices || []).map((sub: any) => ({
          id: sub.id || sub.name.toLowerCase().replace(/\s+/g, ''),
          name: sub.name,
          description: sub.description,
          imageUrl: sub.image || sub.imageUrl || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
          workTypes: sub.workTypes || [],
          prices: sub.prices || {}
        }));
        setBackendSubservices(formatted);
      });
  };

  const handleEditSubserviceClick = (sub: any) => {
    setEditingSubserviceId(sub.id || sub.name);
    
    // Construct workTypes string
    let wtStr = '';
    if (sub.workTypes && Array.isArray(sub.workTypes)) {
      wtStr = sub.workTypes.join('\n');
    }

    // Construct prices string
    let prStr = '';
    if (sub.prices && typeof sub.prices === 'object') {
      prStr = Object.entries(sub.prices)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n');
    }

    setSubForm({
      name: sub.name || '',
      description: sub.description || '',
      imageUrl: sub.imageUrl || sub.image || '',
      workTypes: wtStr,
      prices: prStr,
    });
    setSubError('');
    setShowSubserviceModal(true);
  };

  const handleAddSubservice = async () => {
    setSubError('');
    if (!subForm.name.trim()) { setSubError('Subservice name is required'); return; }
    if (!subForm.description.trim()) { setSubError('Subservice description is required'); return; }

    // Parse work types
    const workTypesArr = subForm.workTypes.split('\n').map(s => s.trim()).filter(Boolean);
    // Parse prices
    let pricesObj: Record<string, string> = {};
    if (subForm.prices.trim()) {
      subForm.prices.split('\n').forEach(line => {
        const parts = line.split(':');
        if (parts.length >= 2) {
          pricesObj[parts[0].trim()] = parts.slice(1).join(':').trim();
        }
      });
    }

    setSubSaving(true);
    try {
      // Find backend service ID
      const allRes = await api.get('/api/services');
      let backendMatch = allRes.data.find((s: any) => s.name.toLowerCase() === selectedService.brand.toLowerCase());
      if (!backendMatch) {
        // Parent service does not exist in backend yet, let's create/PUT it!
        const parentServiceId = selectedService.id || selectedService.brand.toLowerCase().replace(/\s+/g, '');
        await api.put(`/api/services/${parentServiceId}`, {
          name: selectedService.brand,
          description: selectedService.description || 'Premium services',
          tagline: selectedService.tagline || 'Specialized Services',
          imageUrl: selectedService.image || '',
          subServices: []
        });
        // Retrieve fresh match
        const freshRes = await api.get('/api/services');
        backendMatch = freshRes.data.find((s: any) => s.name.toLowerCase() === selectedService.brand.toLowerCase());
      }

      if (!backendMatch) {
        setSubError('Failed to initialize parent service category.');
        setSubSaving(false);
        return;
      }

      // Upload image to Firebase Storage if it's base64
      let imageUrl = subForm.imageUrl.trim();
      if (imageUrl && imageUrl.startsWith('data:')) {
        const uploadRes = await api.post('/api/upload/image', {
          image: imageUrl,
          folder: 'subservices',
        });
        imageUrl = uploadRes.data.url;
      }

      if (editingSubserviceId) {
        const existingSub = (backendMatch.subServices || []).find((s: any) => s.id === editingSubserviceId || s.name === editingSubserviceId);
        const subIdToUse = existingSub ? existingSub.id : editingSubserviceId;
        await api.put(`/api/services/${backendMatch.id}/subservices/${subIdToUse}`, {
          name: subForm.name.trim(),
          description: subForm.description.trim(),
          imageUrl: imageUrl,
          workTypes: workTypesArr,
          prices: pricesObj,
        });
      } else {
        await api.post(`/api/services/${backendMatch.id}/subservices`, {
          id: Math.random().toString(36).substring(2),
          name: subForm.name.trim(),
          description: subForm.description.trim(),
          imageUrl: imageUrl,
          workTypes: workTypesArr,
          prices: pricesObj,
        });
      }
      setShowSubserviceModal(false);
      setSubForm({ name: '', description: '', imageUrl: '', workTypes: '', prices: '' });
      setEditingSubserviceId(null);
      // Reload subservices
      const updated = await api.get(`/api/services`);
      const updatedMatch = updated.data.find((s: any) => s.name.toLowerCase() === selectedService.brand.toLowerCase());
      setBackendSubservices(updatedMatch?.subServices || []);
    } catch (e: any) {
      setSubError(e?.response?.data?.message || 'Failed to save subservice');
    } finally {
      setSubSaving(false);
    }
  };

  // Request actions
  const handleApproveMain = async (id: string) => {
    try {
      await api.post(`/api/services/requests/main-service/${id}/approve`);
      fetchPendingRequests();
      loadServices();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectMain = async (id: string) => {
    try {
      await api.post(`/api/services/requests/main-service/${id}/reject`);
      fetchPendingRequests();
    } catch (e) {
      console.error(e);
    }
  };

  const handleApproveSub = async (id: string) => {
    try {
      await api.post(`/api/services/requests/sub-service/${id}/approve`);
      fetchPendingRequests();
      loadServices();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectSub = async (id: string) => {
    try {
      await api.post(`/api/services/requests/sub-service/${id}/reject`);
      fetchPendingRequests();
    } catch (e) {
      console.error(e);
    }
  };

  const handleApproveWorkType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wtPrice.trim()) {
      setWtError('Price is required.');
      return;
    }
    setWtSubmitting(true);
    setWtError('');
    try {
      await api.post(`/api/services/requests/work-type/${selectedWorkType.id}/approve`, { price: wtPrice.trim() });
      setSelectedWorkType(null);
      setWtPrice('');
      fetchPendingRequests();
      loadServices();
    } catch (err: any) {
      setWtError(err?.response?.data?.message || 'Failed to approve work type');
    } finally {
      setWtSubmitting(false);
    }
  };

  const handleRejectWorkType = async (id: string) => {
    try {
      await api.post(`/api/services/requests/work-type/${id}/reject`);
      fetchPendingRequests();
    } catch (e) {
      console.error(e);
    }
  };

  // If viewing subservices of selected service
  if (selectedService) {
    const BrandIcon = selectedService.icon;
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedService(null)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
              <X className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedService.brand} — Subservices</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage subservices under {selectedService.brand}</p>
            </div>
          </div>
          <Button onClick={() => { setEditingSubserviceId(null); setSubForm({ name: '', description: '', imageUrl: '', workTypes: '', prices: '' }); setShowSubserviceModal(true); setSubError(''); }} icon={<Plus className="w-4 h-4" />}>
            Add Subservice
          </Button>
        </div>

        {/* Unified Subservices Grid */}
        <div>
          <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3 uppercase tracking-wide">Subservices</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {backendSubservices.length === 0 ? (
              <div className="col-span-full py-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <p className="text-sm text-slate-500 dark:text-slate-400 italic">No subservices configured yet.</p>
              </div>
            ) : (
              backendSubservices.map((sub: any) => (
                <Card key={sub.id} className="cursor-pointer hover:border-brand-navy/30 dark:hover:border-brand-green/30 transition-all hover:shadow-md hover:-translate-y-0.5 duration-200" onClick={() => handleEditSubserviceClick(sub)}>
                  <div className="p-4">
                    {(sub.imageUrl || sub.image) && (
                      <div className="w-full h-32 rounded-lg overflow-hidden mb-3 bg-slate-100 dark:bg-slate-800">
                        <img src={sub.imageUrl || sub.image} alt={sub.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <h5 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{sub.name}</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 line-clamp-2">{sub.description}</p>
                    {sub.workTypes && sub.workTypes.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Work Types & Prices:</p>
                        {sub.workTypes.map((wt: string, i: number) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-brand-green flex-shrink-0" />
                            <span className="text-xs text-slate-600 dark:text-slate-400">{wt}</span>
                            {sub.prices && sub.prices[wt] && (
                              <span className="text-xs font-semibold text-brand-navy dark:text-brand-green ml-auto">₱{sub.prices[wt]}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>


        {/* Add Subservice Modal */}
        <AnimatePresence>
          {showSubserviceModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowSubserviceModal(false)}>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <Card>
                  <div className="p-6 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {editingSubserviceId ? 'Edit Subservice' : 'Add Subservice'} to {selectedService.brand}
                      </h3>
                      <button onClick={() => setShowSubserviceModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    {subError && (
                      <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex gap-2 items-center">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{subError}</span>
                      </div>
                    )}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subservice Name *</label>
                        <input value={subForm.name} onChange={e => setSubForm({ ...subForm, name: e.target.value })}
                          className="input-base text-sm" placeholder="e.g. Window Tinting" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description *</label>
                        <textarea value={subForm.description} onChange={e => setSubForm({ ...subForm, description: e.target.value })}
                          className="input-base text-sm min-h-[80px]" placeholder="Describe the subservice..." />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Image URL</label>
                        <input value={subForm.imageUrl} onChange={e => setSubForm({ ...subForm, imageUrl: e.target.value })}
                          className="input-base text-sm" placeholder="https://example.com/image.jpg" />
                        {subForm.imageUrl && (
                          <div className="mt-2 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 h-32">
                            <img src={subForm.imageUrl} alt="Preview" className="w-full h-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Work Types (one per line)</label>
                        <textarea value={subForm.workTypes} onChange={e => setSubForm({ ...subForm, workTypes: e.target.value })}
                          className="input-base text-sm min-h-[80px]" placeholder="Window Type&#10;Split Type&#10;Cassette" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prices per Work Type (format: WorkType: Price)</label>
                        <textarea value={subForm.prices} onChange={e => setSubForm({ ...subForm, prices: e.target.value })}
                          className="input-base text-sm min-h-[80px]" placeholder="Window Type: 500&#10;Split Type: 800&#10;Cassette: 1200" />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-6">
                      <Button variant="ghost" className="flex-1" onClick={() => setShowSubserviceModal(false)}>Cancel</Button>
                      <Button variant="success" className="flex-1" onClick={handleAddSubservice} loading={subSaving}
                        disabled={!subForm.name.trim() || !subForm.description.trim()}
                        icon={editingSubserviceId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}>
                        {editingSubserviceId ? 'Save Changes' : 'Add Subservice'}
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }



  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Service Management</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Overview of service categories, active brands, and subservices available on the platform.
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'catalog' ? (
            <Button onClick={() => { setServiceToEdit(null); setShowAddModal(true); }} icon={<Plus className="w-4 h-4" />}>
              Add Service
            </Button>
          ) : null}
        </div>
      </div>

      {/* Primary tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2.5 font-semibold text-sm border-b-2 transition-all ${
            activeTab === 'catalog'
              ? 'border-brand-navy dark:border-brand-green text-brand-navy dark:text-brand-green'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Service Catalog
        </button>
        <button
          onClick={() => setActiveTab('proposals')}
          className={`px-4 py-2.5 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'proposals'
              ? 'border-brand-navy dark:border-brand-green text-brand-navy dark:text-brand-green'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <span>Vendor Requests</span>
          {pendingWorkTypes.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
              {pendingWorkTypes.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'catalog' ? (
        loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="skeleton h-[400px] rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div key={index} className="h-full relative group">
                <AdminServiceCard 
                  service={service} 
                  onServiceClick={(svc) => { navigate(`/services/${svc.id}`); }} 
                  onEditClick={(svc) => { setServiceToEdit(svc); setShowAddModal(true); }}
                />
              </div>
            ))}
          </div>
        )
      ) : (
        /* Proposals Dashboard */
        <div className="space-y-6">
          {/* Request Sub tabs */}
          <div className="flex gap-2">
            <button onClick={() => setProposalsTab('workTypes')}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-brand-navy text-white dark:bg-brand-green dark:text-slate-900 shadow-sm">
              Work Types ({pendingWorkTypes.length})
            </button>
          </div>

          <Card>
            <div className="p-6">
              {loadingRequests ? (
                <div className="space-y-3">
                  {Array(3).fill(0).map((_, i) => (
                    <div key={i} className="skeleton h-12 rounded-xl" />
                  ))}
                </div>
              ) : (
                /* Work Type Request Queue */
                pendingWorkTypes.length === 0 ? (
                  <EmptyState title="No pending Work Types" description="All work type requests have been resolved." icon={<Sparkles className="w-8 h-8 text-slate-400" />} />
                ) : (
                  <DataTable
                    columns={[
                      { key: 'name', label: 'Work Type Name', sortable: true },
                      { key: 'restrictions', label: 'Restrictions' },
                      { key: 'subServiceName', label: 'Sub Service', sortable: true },
                      { key: 'serviceName', label: 'Parent Category', sortable: true },
                      { key: 'vendorName', label: 'Proposed By', sortable: true },
                      {
                        key: 'actions', label: 'Actions', render: (item: any) => (
                          <div className="flex gap-2">
                            <Button size="sm" variant="success" onClick={() => setSelectedWorkType(item)}>Review & Price</Button>
                            <Button size="sm" variant="danger" onClick={() => handleRejectWorkType(item.id)}>Reject</Button>
                          </div>
                        )
                      }
                    ]}
                    data={pendingWorkTypes}
                  />
                )
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Add Service Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddServiceWizard 
            serviceToEdit={serviceToEdit}
            onClose={() => {
              setShowAddModal(false);
              setServiceToEdit(null);
            }} 
            onSuccess={() => {
              setShowAddModal(false);
              setServiceToEdit(null);
              loadServices();
            }} 
          />
        )}
      </AnimatePresence>

      {/* Work Type Pricing Modal */}
      <AnimatePresence>
        {selectedWorkType && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedWorkType(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md" onClick={e => e.stopPropagation()}>
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedWorkType.serviceName} → {selectedWorkType.subServiceName}</span>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">Approve Work Type</h3>
                    </div>
                    <button onClick={() => setSelectedWorkType(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {wtError && (
                    <div className="mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                      {wtError}
                    </div>
                  )}

                  <form onSubmit={handleApproveWorkType} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Proposed Name</label>
                      <input type="text" value={selectedWorkType.name} disabled className="input-base text-sm bg-slate-100 dark:bg-slate-800 text-slate-500" />
                    </div>
                    {selectedWorkType.restrictions && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Vendor Restrictions</label>
                        <input type="text" value={selectedWorkType.restrictions} disabled className="input-base text-sm bg-slate-100 dark:bg-slate-800 text-slate-500" />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Set Standard Pricing (₱) *</label>
                      <input type="number" value={wtPrice} onChange={e => setWtPrice(e.target.value)} placeholder="e.g. 1200" className="input-base text-sm font-bold text-brand-navy dark:text-brand-green" required disabled={wtSubmitting} />
                      <p className="text-[11px] text-slate-400 mt-1">This price will be persisted to the platform catalog database for customer billing.</p>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button variant="ghost" className="flex-1" onClick={() => setSelectedWorkType(null)} type="button">Cancel</Button>
                      <Button variant="success" className="flex-1" type="submit" loading={wtSubmitting}>Approve & Save</Button>
                    </div>
                  </form>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
function TransactionsPage() { return <PlaceholderPage title="Transactions" description="View all financial transactions across the platform." icon={<CreditCard className="w-8 h-8" />} />; }
function AccountingPage() { return <PlaceholderPage title="Accounting" description="Financial reports, ledgers, and accounting overview." icon={<DollarSign className="w-8 h-8" />} />; }
function PayoutsPage() { return <PlaceholderPage title="Payouts" description="Manage vendor and personnel payout schedules and history." icon={<CreditCard className="w-8 h-8" />} />; }

function VouchersPage() { return <PlaceholderPage title="Vouchers" description="Create and manage promotional vouchers and discount codes." icon={<CreditCard className="w-8 h-8" />} />; }
function AssignedVouchersPage() { return <PlaceholderPage title="Assigned Vouchers" description="Track vouchers assigned to specific customers or campaigns." icon={<CreditCard className="w-8 h-8" />} />; }

// ─── Main Layout ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [collapsed, setCollapsed] = useState(true);
  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark">
      <Sidebar role="admin" collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className={`transition-all duration-300 ${collapsed ? 'ml-[72px]' : 'ml-[260px]'}`}>
        <Header />
        <main className="p-6">
          <Routes>
            <Route index element={<DashboardHome />} />
            {/* Overview */}
            <Route path="calendar" element={<CalendarPage />} />
            {/* Communications */}

            <Route path="reviews" element={<ReviewsPage />} />
            {/* People */}
            <Route path="customers" element={<CustomersTab />} />
            <Route path="vendors" element={<VendorsTab />} />
            <Route path="personnel" element={<PersonnelTab />} />
            <Route path="vendors-management" element={<VendorsManagementPage />} />
            {/* Operations */}
            <Route path="bookings" element={<BookingsTab />} />
            <Route path="services" element={<ServicesManagementPage />} />
            {/* Finance & Promos */}
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="accounting" element={<AccountingPage />} />
            <Route path="payouts" element={<PayoutsPage />} />

            <Route path="vouchers" element={<VouchersPage />} />
            <Route path="assigned-vouchers" element={<AssignedVouchersPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
