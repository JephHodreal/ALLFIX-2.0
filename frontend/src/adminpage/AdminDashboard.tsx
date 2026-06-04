import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Building2, ClipboardList, CreditCard, TrendingUp, Edit, Trash2, X, Check, Plus, Mail, User, Lock, Eye, EyeOff, AlertCircle, Phone, MapPin, ArrowRight, CheckCircle2, Sparkles, Star, Wrench, ArrowLeft, CalendarDays, Clock, Receipt, Search, Filter, Calendar, DollarSign, FileText, Download, Wallet } from 'lucide-react';
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
import { useTheme } from '../context/ThemeContext';

// ─── Dashboard Tab ──────────────────────────────────────────────────────────
function DashboardHome() {
  const { isDark } = useTheme();
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
          <LineChart data={revenueTrend} xKey="week" lines={[{ dataKey: 'revenue', color: isDark ? '#60a5fa' : '#041e41', name: 'Revenue (₱)' }]} /></Card>
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

// ─── Vendor View Modal ──────────────────────────────────────────────────────
function VendorViewModal({ vendor, onClose, onApprove, onReject }: { vendor: any; onClose: () => void; onApprove?: (id: string) => void; onReject?: (id: string) => void }) {
  const status = vendor.acc_approve || 'pending';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-6 h-6 text-brand-navy dark:text-brand-green" />
              {vendor.company_name || 'Vendor Profile'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">Vendor ID: {vendor.id}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={status === 'approved' ? 'badge-completed' : status === 'rejected' ? 'badge-cancelled' : 'badge-pending'}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Grid for basic info and address */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Contact Person Details */}
            <div className="bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <User className="w-4 h-4" />
                Account & Contact Info
              </h4>
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Contact Person</span>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{vendor.first_name} {vendor.last_name}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Username</span>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{vendor.username}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Email Address</span>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{vendor.email}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Phone Number</span>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{vendor.phone}</p>
                </div>
              </div>
            </div>

            {/* Address Details */}
            <div className="bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                Business Location
              </h4>
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Street Address</span>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {vendor.unit_house_no ? `${vendor.unit_house_no}, ` : ''}
                    {vendor.street || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Barangay</span>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{vendor.barangay || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">City / Municipality</span>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{vendor.city || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Postal / Zip Code</span>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{vendor.postal_code || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Payout & Bank Details */}
            <div className="bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4" />
                Payout & Bank Details
              </h4>
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Account Name</span>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{vendor.account_name || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Account Number</span>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{vendor.account_number || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Services Section */}
          <div className="bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <Wrench className="w-4 h-4" />
              Offered Services
            </h4>
            {!vendor.services || !Array.isArray(vendor.services) || vendor.services.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 italic">No services listed.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {vendor.services.map((s: any, idx: number) => (
                  <div key={idx} className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/60 shadow-sm">
                    <span className="text-sm font-bold text-slate-800 dark:text-white block mb-2">{s.service}</span>
                    {s.sub_services && Array.isArray(s.sub_services) && s.sub_services.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {s.sub_services.map((sub: string, subIdx: number) => (
                          <span key={subIdx} className="inline-block px-2.5 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-655 dark:text-slate-350 rounded-lg">
                            {sub}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Registration Documents Section */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              Registration Documents
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Business Permit Card */}
              <div className="border border-slate-150 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col bg-white dark:bg-slate-800">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-white">Business Permit</span>
                  {vendor.business_permit_url && (
                    <a
                      href={vendor.business_permit_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-brand-navy dark:text-brand-green hover:underline flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> Full Size
                    </a>
                  )}
                </div>
                <div className="bg-slate-100 dark:bg-slate-900/50 flex-1 flex items-center justify-center min-h-[160px] p-4 relative group">
                  {vendor.business_permit_url ? (
                    <img
                      src={vendor.business_permit_url}
                      alt="Business Permit"
                      className="max-h-48 object-contain rounded transition-transform group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="text-center p-6">
                      <FileText className="w-8 h-8 text-slate-350 mx-auto mb-2" />
                      <span className="text-xs text-slate-400 font-medium">No Business Permit uploaded</span>
                    </div>
                  )}
                </div>
              </div>

              {/* BIR Certificate Card */}
              <div className="border border-slate-150 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col bg-white dark:bg-slate-800">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-white">BIR Certificate (Form 2303)</span>
                  {vendor.bir_certificate_url && (
                    <a
                      href={vendor.bir_certificate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-brand-navy dark:text-brand-green hover:underline flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> Full Size
                    </a>
                  )}
                </div>
                <div className="bg-slate-100 dark:bg-slate-900/50 flex-1 flex items-center justify-center min-h-[160px] p-4 relative group">
                  {vendor.bir_certificate_url ? (
                    <img
                      src={vendor.bir_certificate_url}
                      alt="BIR Certificate"
                      className="max-h-48 object-contain rounded transition-transform group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="text-center p-6">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <span className="text-xs text-slate-400 font-medium">No BIR Certificate uploaded</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          {status === 'pending' && onApprove && onReject && (
            <div className="flex gap-2">
              <Button
                variant="danger"
                onClick={() => onReject(vendor.id)}
              >
                Reject Vendor
              </Button>
              <Button
                variant="success"
                onClick={() => onApprove(vendor.id)}
              >
                Approve Vendor
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Vendor Edit Modal ──────────────────────────────────────────────────────
function VendorEditModal({ vendor, onSave, onClose }: { vendor: any; onSave: (data: any) => Promise<void>; onClose: () => void }) {
  const contactParts = (vendor.contact_person || '').split(' ');
  const [form, setForm] = useState({
    company_name: vendor.company_name || '',
    first_name: vendor.first_name || contactParts[0] || '',
    last_name: vendor.last_name || contactParts.slice(1).join(' ') || '',
    account_name: vendor.account_name || '',
    account_number: vendor.account_number || '',
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
        account_name: form.account_name.trim(),
        account_number: form.account_number.trim(),
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Account Name</label>
                  <input value={form.account_name} onChange={e => setForm({ ...form, account_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-brand-navy/20"
                    placeholder="Enter Account Name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Account Number</label>
                  <input value={form.account_number} onChange={e => setForm({ ...form, account_number: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-brand-navy/20"
                    placeholder="Enter Account Number" />
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
  const [viewItem, setViewItem] = useState<any>(null);
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
    city: '',
    accountName: '',
    accountNumber: ''
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
        city: '',
        accountName: '',
        accountNumber: ''
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
                <Button variant="outline" size="sm" onClick={(e: any) => { e.stopPropagation(); setViewItem(item); }}>View</Button>
                <Button variant="success" size="sm" onClick={(e: any) => { e.stopPropagation(); handleApprove(item.id); }}>Approve</Button>
                <Button variant="danger" size="sm" onClick={(e: any) => { e.stopPropagation(); handleReject(item.id); }}>Reject</Button>
              </div>
            ) : status === 'approved' ? (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={(e: any) => { e.stopPropagation(); setViewItem(item); }}>View</Button>
                <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white" onClick={(e: any) => { e.stopPropagation(); setEditItem(item); }} icon={<Edit className="w-4 h-4" />}>Edit</Button>
                <Button variant="danger" size="sm" onClick={(e: any) => { e.stopPropagation(); handleDelete(item.id); }} icon={<Trash2 className="w-4 h-4" />}>Delete</Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={(e: any) => { e.stopPropagation(); setViewItem(item); }}>View</Button>
              </div>
            );
          }
        },
      ]} data={vendors} loading={loading} searchPlaceholder="Search vendors..." />
      {editItem && <VendorEditModal vendor={editItem} onSave={handleEditSave} onClose={() => setEditItem(null)} />}
      {viewItem && <VendorViewModal vendor={viewItem} onClose={() => setViewItem(null)} onApprove={(id) => { handleApprove(id); setViewItem(null); }} onReject={(id) => { handleReject(id); setViewItem(null); }} />}

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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Account Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            value={createForm.accountName}
                            onChange={(e) => updateCreateForm('accountName', e.target.value)}
                            className="input-base pl-10 text-sm"
                            placeholder="Enter Bank or GCash Account Name..."
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Account Number</label>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            value={createForm.accountNumber}
                            onChange={(e) => updateCreateForm('accountNumber', e.target.value)}
                            className="input-base pl-10 text-sm"
                            placeholder="Enter Bank or GCash Account Number..."
                          />
                        </div>
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
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showRefundForm, setShowRefundForm] = useState(false);

  // Refund Form State
  const [refundAmount, setRefundAmount] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [refundMethod, setRefundMethod] = useState('GCash');
  const [receiverGcashNumber, setReceiverGcashNumber] = useState('');
  const [refundSubmitting, setRefundSubmitting] = useState(false);
  const [refundError, setRefundError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [proofImageUrl, setProofImageUrl] = useState('');

  // Handle direct file upload / base64 reading
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('[CAVEMAN] BookingsTab: handleFileChange - Selected file:', file.name);
    setUploadingImage(true);
    setRefundError('');

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = reader.result as string;
        console.log('[CAVEMAN] BookingsTab: Uploading base64 image to server...');
        const res = await api.post('/api/upload/image', {
          image: base64,
          folder: 'refunds'
        });
        setProofImageUrl(res.data.url);
        console.log('[CAVEMAN] BookingsTab: Upload success. URL:', res.data.url);
      } catch (err: any) {
        console.error('[CAVEMAN] BookingsTab: Upload failed', err);
        setRefundError('Failed to upload image. Please try again.');
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    api.get('/api/bookings')
      .then(r => setBookings(r.data))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const statusBadge = (status: string) => {
    const cls: Record<string, string> = {
      pending: 'badge-pending',
      confirmed: 'badge-confirmed',
      in_progress: 'badge-in-progress',
      completed: 'badge-completed',
      cancelled: 'badge-cancelled'
    };
    return <span className={cls[status] || 'badge'}>{status?.replace('_', ' ')}</span>;
  };

  const handleConfirmPayment = async () => {
    try {
      await api.patch(`/api/bookings/${selectedBooking.id}/confirm-payment`);
      // Update selected booking in state
      setSelectedBooking((prev: any) => ({
        ...prev,
        status: 'confirmed',
        payment_confirmed: true,
      }));
      // Update booking in bookings list too!
      setBookings((prevList: any[]) =>
        prevList.map((b: any) =>
          b.id === selectedBooking.id
            ? { ...b, status: 'confirmed', payment_confirmed: true }
            : b
        )
      );
      alert('Payment confirmed successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to confirm payment.');
    }
  };

  const handleSubmitRefund = async () => {
    setRefundError('');
    setRefundSubmitting(true);
    try {
      const payload = {
        refund_amount: parseFloat(refundAmount) || 0,
        reference_number: referenceNumber.trim(),
        refund_method: refundMethod,
        receiver_gcash_number: refundMethod === 'GCash' ? receiverGcashNumber.trim() : '',
        cancelled_by: 'admin',
        proof_image_url: proofImageUrl,
      };

      await api.post(`/api/bookings/${selectedBooking.id}/cancel-with-refund`, payload);
      
      // Update selected booking in state
      setSelectedBooking((prev: any) => ({
        ...prev,
        status: 'cancelled',
        cancellation_requested: true,
        refund_id: 'linked', // indicate linked refund
        refund_amount: payload.refund_amount,
        refund_reference_number: payload.reference_number,
        refund_method: payload.refund_method,
        refund_receiver_gcash_number: payload.receiver_gcash_number,
        refund_proof_image_url: payload.proof_image_url,
      }));

      // Update bookings list too!
      setBookings((prevList: any[]) =>
        prevList.map((b: any) =>
          b.id === selectedBooking.id
            ? {
                ...b,
                status: 'cancelled',
                cancellation_requested: true,
                refund_amount: payload.refund_amount,
                refund_reference_number: payload.reference_number,
                refund_method: payload.refund_method,
                refund_receiver_gcash_number: payload.receiver_gcash_number,
                refund_proof_image_url: payload.proof_image_url,
              }
            : b
        )
      );

      setShowRefundForm(false);
      setProofImageUrl('');
      alert('Booking cancelled and refund details linked successfully!');
    } catch (err: any) {
      setRefundError(err.response?.data?.message || 'Failed to submit refund.');
    } finally {
      setRefundSubmitting(false);
    }
  };

  if (selectedBooking) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header with Back button */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedBooking(null);
                setShowRefundForm(false);
                setShowCancelConfirm(false);
                setProofImageUrl('');
              }}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Booking Details</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">ID: {selectedBooking.id}</p>
            </div>
          </div>
          <div>
            {statusBadge(selectedBooking.status)}
          </div>
        </div>

        {/* Two column layout: Booking Info & Payment Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Booking Info Card */}
          <Card className="p-6 space-y-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm">
            <h4 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest border-b pb-2 border-slate-100 dark:border-slate-800">Service Information</h4>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-400 font-medium">Service Category:</span>
                <span className="col-span-2 text-slate-900 dark:text-white font-bold">{selectedBooking.sub_service || selectedBooking.service_type}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-400 font-medium">Work Type:</span>
                <span className="col-span-2 text-slate-900 dark:text-white font-semibold">{selectedBooking.service_type}</span>
              </div>
              {selectedBooking.description && (
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-400 font-medium">Description:</span>
                  <span className="col-span-2 text-slate-600 dark:text-slate-300 italic">"{selectedBooking.description}"</span>
                </div>
              )}
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-400 font-medium">Provider / Vendor:</span>
                <span className="col-span-2 text-slate-900 dark:text-white font-semibold">{selectedBooking.vendor_name || '—'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-400 font-medium">Customer:</span>
                <span className="col-span-2 text-slate-900 dark:text-white font-semibold">{selectedBooking.customer_name || '—'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-400 font-medium">Date & Time:</span>
                <span className="col-span-2 text-slate-900 dark:text-white font-semibold">📅 {selectedBooking.scheduled_date} at ⏰ {selectedBooking.scheduled_time}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-400 font-medium">Address:</span>
                <span className="col-span-2 text-slate-700 dark:text-slate-300 leading-normal">{selectedBooking.address || selectedBooking.service_address || '—'}</span>
              </div>
            </div>
          </Card>

          {/* Payment Info Card */}
          <Card className="p-6 space-y-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm">
            <h4 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest border-b pb-2 border-slate-100 dark:border-slate-800">Payment & Pricing</h4>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-400 font-medium">Unit Price:</span>
                <span className="col-span-2 text-slate-900 dark:text-white font-semibold">₱{selectedBooking.price || '0.00'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-400 font-medium">Quantity:</span>
                <span className="col-span-2 text-slate-900 dark:text-white font-semibold">{selectedBooking.quantity || 1}</span>
              </div>
              {/* Voucher Discount Info */}
              {selectedBooking.discount_amount > 0 && (
                <>
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-850">
                    <span className="text-slate-400 font-medium">Subtotal:</span>
                    <span className="col-span-2 text-slate-500 dark:text-slate-400 font-semibold line-through">₱{selectedBooking.original_price || (selectedBooking.price * (selectedBooking.quantity || 1))}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-400 font-medium">Voucher:</span>
                    <span className="col-span-2 flex items-center gap-2">
                      <span className="font-mono text-xs px-2 py-0.5 rounded-lg bg-brand-green/10 text-brand-green border border-brand-green/20 font-bold">{selectedBooking.voucher_code}</span>
                      <span className="text-brand-green font-bold text-xs">-₱{Number(selectedBooking.discount_amount).toFixed(2)}</span>
                    </span>
                  </div>
                </>
              )}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-850">
                <span className="text-slate-900 dark:text-white font-black">Total Payment:</span>
                <span className="col-span-2 text-lg font-black text-brand-green">₱{selectedBooking.total_price || (selectedBooking.price * (selectedBooking.quantity || 1)) || '0.00'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-850">
                <span className="text-slate-400 font-medium">Payment Method:</span>
                <span className="col-span-2 text-slate-900 dark:text-white font-semibold">{selectedBooking.payment_method || '—'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-400 font-medium">Reference No:</span>
                <span className="col-span-2 font-mono text-slate-900 dark:text-white font-semibold">{selectedBooking.payment_reference || '—'}</span>
              </div>
              {selectedBooking.account_name && (
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-400 font-medium">Account Name:</span>
                  <span className="col-span-2 text-slate-900 dark:text-white font-semibold">{selectedBooking.account_name}</span>
                </div>
              )}
              {selectedBooking.account_number && (
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-400 font-medium">Account Number:</span>
                  <span className="col-span-2 font-mono text-slate-900 dark:text-white font-semibold">{selectedBooking.account_number}</span>
                </div>
              )}
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-400 font-medium">Payment Status:</span>
                <span className="col-span-2">
                  {selectedBooking.payment_confirmed ? (
                    <span className="badge-completed">Confirmed</span>
                  ) : (
                    <span className="badge-pending">Pending</span>
                  )}
                </span>
              </div>
              {(selectedBooking.refund_reference_number || selectedBooking.refund_method) && (
                <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/40 rounded-xl space-y-1.5 text-xs text-rose-800 dark:text-rose-350">
                  <p className="font-extrabold uppercase tracking-wide">Linked Refund Information</p>
                  {selectedBooking.cancelled_by && (
                    <p><span className="font-bold">Cancelled By:</span> {selectedBooking.cancelled_by}</p>
                  )}
                  <p><span className="font-bold">Refunded Amount:</span> ₱{selectedBooking.refund_amount}</p>
                  <p><span className="font-bold">Method:</span> {selectedBooking.refund_method}</p>
                  <p><span className="font-bold">Refund Ref No:</span> {selectedBooking.refund_reference_number}</p>
                  {selectedBooking.refund_receiver_gcash_number && (
                    <p><span className="font-bold">Receiver GCash Number:</span> {selectedBooking.refund_receiver_gcash_number}</p>
                  )}
                  {selectedBooking.refund_proof_image_url && (
                    <p className="mt-1 flex items-center gap-1.5">
                      <span className="font-bold">Proof Image:</span>{' '}
                      <a href={selectedBooking.refund_proof_image_url} target="_blank" rel="noopener noreferrer" className="text-brand-navy dark:text-brand-green hover:underline font-bold inline-flex items-center gap-1">
                        View Image <Eye className="w-3.5 h-3.5" />
                      </a>
                    </p>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        {!showRefundForm && !showCancelConfirm && (
          <div className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800/80">
            {selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'completed' && (
              <Button
                variant="danger"
                className="flex-1 py-3 text-sm font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white"
                onClick={() => {
                  setShowCancelConfirm(true);
                }}
              >
                Cancel
              </Button>
            )}
            {!selectedBooking.payment_confirmed && selectedBooking.status !== 'cancelled' && (
              <Button
                variant="success"
                className="flex-grow sm:flex-1 py-3 text-sm font-semibold rounded-xl"
                onClick={handleConfirmPayment}
              >
                Confirm
              </Button>
            )}
          </div>
        )}

        {/* Cancel Confirmation Dialog */}
        {showCancelConfirm && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Cancel Booking</h4>
            </div>
            <p className="text-sm text-slate-655 dark:text-slate-350">
              Are you sure you want to cancel this booking?
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setShowCancelConfirm(false)}>No, Keep Booking</Button>
              <Button
                variant="danger"
                onClick={() => {
                  setShowCancelConfirm(false);
                  // Open Refund Form & populate Refund Amount
                  const totalAmt = selectedBooking.total_price || (selectedBooking.price * (selectedBooking.quantity || 1)) || '0.00';
                  setRefundAmount(String(totalAmt));
                  setRefundMethod('GCash');
                  setReceiverGcashNumber('');
                  setReferenceNumber('');
                  setShowRefundForm(true);
                }}
              >
                Yes, Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Refund Form */}
        {showRefundForm && (
          <Card className="p-6 bg-white dark:bg-slate-950 border border-rose-200 dark:border-rose-900/30 rounded-2xl shadow-xl space-y-6">
            <div className="flex items-center gap-3 border-b pb-4 border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Refund Form</h4>
                <p className="text-xs text-slate-500">Provide details to submit the booking cancellation refund.</p>
              </div>
            </div>

            {refundError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl">
                {refundError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Refund Amount (₱) *</label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-xs sm:text-sm font-black focus:outline-none"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Refund Method *</label>
                <select
                  value={refundMethod}
                  onChange={(e) => setRefundMethod(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
                >
                  <option value="GCash">GCash</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Reference Number *</label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy placeholder:text-slate-400"
                  placeholder="Enter Reference Number"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Receiver GCash Number</label>
                <input
                  type="text"
                  value={receiverGcashNumber}
                  onChange={(e) => setReceiverGcashNumber(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy placeholder:text-slate-400"
                  placeholder="Enter Receiver's GCash Number"
                  disabled={refundMethod !== 'GCash'}
                />
              </div>
            </div>

            {/* Proof of Refund Image File Input */}
            <div className="pt-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                Proof of Refund Image (Optional)
              </label>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-350 dark:border-slate-700 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer relative group">
                {uploadingImage ? (
                  <div className="text-xs text-slate-500 font-bold animate-pulse">Uploading Image...</div>
                ) : proofImageUrl ? (
                  <div className="relative w-full h-40 rounded-xl overflow-hidden">
                    <img src={proofImageUrl} alt="Proof of Refund" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setProofImageUrl('');
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-lg transition-colors z-10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 mb-2">
                      <Plus className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Click to upload receipt or transaction proof image
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">PNG, JPG, or WEBP formats allowed</p>
                  </>
                )}
                {!proofImageUrl && !uploadingImage && (
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                  />
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowRefundForm(false);
                  setRefundError('');
                  setProofImageUrl('');
                }}
                disabled={refundSubmitting}
              >
                Back to Details
              </Button>
              <Button
                variant="danger"
                className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold px-6"
                onClick={handleSubmitRefund}
                loading={refundSubmitting}
                disabled={!referenceNumber.trim() || !refundAmount.trim()}
              >
                Submit Refund Details
              </Button>
            </div>
          </Card>
        )}
      </div>
    );
  }

  return (
    <DataTable
      columns={[
        {
          key: 'sub_service',
          label: 'Service',
          sortable: true,
          render: (item: any) => item.sub_service || item.service_type
        },
        { key: 'scheduled_date', label: 'Date', sortable: true },
        { key: 'status', label: 'Status', render: (item: any) => statusBadge(item.status) },
        {
          key: 'actions',
          label: 'View Details',
          render: (item: any) => (
            <Button
              size="sm"
              className="bg-brand-navy hover:bg-[#0a2d5c] text-white flex items-center gap-1.5"
              onClick={(e: any) => {
                e.stopPropagation();
                setSelectedBooking(item);
              }}
              icon={<Eye className="w-4 h-4" />}
            >
              View Details
            </Button>
          )
        },
      ]}
      data={bookings}
      loading={loading}
      searchPlaceholder="Search bookings..."
    />
  );
}

// ─── Payments Tab ───────────────────────────────────────────────────────────
function PaymentsTab() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/api/payments/pending').then(r => setPayments(r.data)).catch(() => { }).finally(() => setLoading(false)); }, []);
  return payments.length === 0 && !loading ? <EmptyState title="No pending payments" description="All payments have been processed." /> : (
    <DataTable columns={[
      { key: 'sub_service', label: 'Service', render: (item: any) => item.sub_service || item.service_type },
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

function CalendarPage() {
  const [slots, setSlots] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [slotsRes, vendorsRes] = await Promise.all([
        api.get('/api/slots').catch(() => ({ data: [] })),
        api.get('/api/vendors').catch(() => ({ data: [] }))
      ]);
      setSlots(slotsRes.data || []);
      setVendors(vendorsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch calendar data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatLocalYYYYMMDD = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getSlotsForDate = (day: number) => {
    const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = formatLocalYYYYMMDD(checkDate);
    return slots.filter(s => s.slot_date === dateStr);
  };

  const getTotalAvailableForDate = (day: number) => {
    const dateSlots = getSlotsForDate(day);
    return dateSlots.reduce((sum, s) => {
      const avail = s.available_slots !== undefined && s.available_slots !== null ? s.available_slots : s.total_slots;
      return sum + Math.max(0, Number(avail));
    }, 0);
  };

  const getVendorName = (vendorId: string) => {
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor ? (vendor.company_name || vendor.name) : 'Unknown Vendor';
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Get active slots for the clicked date
  const selectedDateStr = selectedDate ? formatLocalYYYYMMDD(selectedDate) : '';
  const activeSlotsForSelectedDate = slots.filter(s => s.slot_date === selectedDateStr);

  return (
    <div className="space-y-6">
      {/* Calendar Card */}
      <Card className="overflow-hidden border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 shadow-sm rounded-2xl animate-in fade-in duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-green/10 dark:bg-brand-green/20 flex items-center justify-center text-brand-green text-xl font-bold shadow-sm shadow-brand-green/10">
                <CalendarDays className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-slate-800 dark:text-white">{monthName}</h2>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">All registered slots across all vendors</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800/80">
              <button 
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200"
                title="Previous Month"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setCurrentMonth(new Date())}
                className="px-3 py-1.5 rounded-lg text-xs font-black hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200"
              >
                Today
              </button>
              <button 
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200"
                title="Next Month"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2.5 mb-3">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, index) => {
              const isWeekend = index === 0 || index === 6;
              return (
                <div 
                  key={d} 
                  className={`text-center text-[10px] font-black uppercase tracking-wider py-2 rounded-lg ${
                    isWeekend 
                      ? 'text-slate-400 dark:text-slate-500 bg-slate-50/20 dark:bg-slate-900/10' 
                      : 'text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/30'
                  }`}
                >
                  {d}
                </div>
              );
            })}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2.5">
            {days.map((day, i) => {
              if (!day) {
                return (
                  <div 
                    key={`empty-${i}`} 
                    className="aspect-square bg-transparent rounded-2xl border border-transparent"
                  />
                );
              }

              const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
              const isToday = dateObj.toDateString() === today.toDateString();
              const dateSlots = getSlotsForDate(day);
              const totalAvailable = getTotalAvailableForDate(day);
              const hasSlots = dateSlots.length > 0;

              return (
                <motion.div
                  key={`day-${day}`}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setSelectedDate(dateObj);
                    setShowModal(true);
                  }}
                  className={`aspect-square p-2.5 rounded-2xl flex flex-col justify-between cursor-pointer transition-all border relative overflow-hidden select-none ${
                    hasSlots
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 border-emerald-400/20 text-white shadow-md shadow-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/20'
                      : isToday
                        ? 'bg-white dark:bg-slate-950 border-brand-green border-2 text-slate-900 dark:text-white shadow-sm font-bold'
                        : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800/80 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-sm font-black ${hasSlots ? 'text-white' : 'text-slate-800 dark:text-white'}`}>
                      {day}
                    </span>
                    {isToday && !hasSlots && (
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
                    )}
                  </div>

                  {hasSlots && (
                    <div className="mt-auto">
                      <div className="text-[10px] font-black bg-white/20 dark:bg-black/20 text-white rounded-md px-1 py-0.5 inline-block backdrop-blur-sm max-w-full truncate">
                        {totalAvailable} slot{totalAvailable !== 1 ? 's' : ''}
                      </div>
                      <div className="text-[8px] text-white/80 font-bold mt-0.5 hidden sm:block truncate">
                        {dateSlots.length} vendor{dateSlots.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Global Calendar Status Overview */}
      <Card className="border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 shadow-sm rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-brand-navy/10 flex items-center justify-center text-brand-navy dark:text-brand-green">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active System Slots</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Real-time occupancy and capacity metrics</p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-brand-green rounded-full animate-spin" />
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Fetching slot details...</p>
          </div>
        ) : slots.length === 0 ? (
          <EmptyState title="No active slots" description="Vendors have not configured any slots yet." icon={<CalendarDays className="w-6 h-6 text-slate-400" />} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-1">
            {slots.map((s, i) => {
              const avail = s.available_slots !== undefined && s.available_slots !== null ? s.available_slots : s.total_slots;
              const total = s.total_slots !== undefined && s.total_slots !== null ? s.total_slots : 0;
              const safeAvail = Math.max(0, avail);
              const safeTotal = Math.max(0, total);
              const percentAvail = safeTotal > 0 ? (safeAvail / safeTotal) * 100 : 0;
              const vName = getVendorName(s.vendor_id);

              return (
                <div key={i} className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col justify-between hover:shadow-sm transition-all duration-200">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <span className="text-xs bg-brand-navy/10 text-brand-navy dark:bg-brand-green/20 dark:text-brand-green px-2 py-0.5 rounded font-black text-[10px] uppercase tracking-wider">{vName}</span>
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">{s.service_type} - {s.sub_service || 'General'}</h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{s.slot_date} at {s.time_from} - {s.time_to}</span>
                      </div>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-lg font-black shrink-0 ${
                      safeAvail > 0 
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200/40' 
                        : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200/40'
                    }`}>
                      {safeAvail}/{safeTotal}
                    </span>
                  </div>

                  <div className="mt-3.5">
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          percentAvail > 50 
                            ? 'bg-emerald-500' 
                            : percentAvail > 20 
                              ? 'bg-amber-500' 
                              : 'bg-rose-500'
                        }`}
                        style={{ width: `${percentAvail}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Date Details Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="w-full max-w-lg"
            >
              <Card className="border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 shadow-2xl rounded-2xl overflow-hidden">
                <div className="p-6 space-y-5">
                  <div className="flex items-center justify-between border-b pb-4 border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-navy/10 flex items-center justify-center text-brand-navy">
                        <CalendarDays className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">Vendor Slots</h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">For {selectedDate?.toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowModal(false)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                    {activeSlotsForSelectedDate.length === 0 ? (
                      <div className="text-center py-10 space-y-3">
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No slots registered for this date.</p>
                      </div>
                    ) : (
                      activeSlotsForSelectedDate.map((s, idx) => {
                        const avail = s.available_slots !== undefined && s.available_slots !== null ? s.available_slots : s.total_slots;
                        const total = s.total_slots !== undefined && s.total_slots !== null ? s.total_slots : 0;
                        const safeAvail = Math.max(0, avail);
                        const safeTotal = Math.max(0, total);
                        const percentAvail = safeTotal > 0 ? (safeAvail / safeTotal) * 100 : 0;
                        const vName = getVendorName(s.vendor_id);

                        return (
                          <div key={idx} className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col justify-between hover:shadow-sm transition-all duration-200">
                            <div className="flex justify-between items-start gap-4">
                              <div className="space-y-1">
                                <span className="text-xs bg-brand-navy/10 text-brand-navy dark:bg-brand-green/20 dark:text-brand-green px-2 py-0.5 rounded font-black text-[10px] uppercase tracking-wider">{vName}</span>
                                <h4 className="text-sm font-black text-slate-800 dark:text-slate-200">{s.service_type} - {s.sub_service || 'General'}</h4>
                                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-bold">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{s.time_from} - {s.time_to}</span>
                                </div>
                              </div>
                              <span className={`text-xs px-2.5 py-1 rounded-lg font-black shrink-0 ${
                                safeAvail > 0 
                                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200/40' 
                                  : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200/40'
                              }`}>
                                {safeAvail}/{safeTotal}
                              </span>
                            </div>

                            <div className="mt-3.5">
                              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    percentAvail > 50 
                                      ? 'bg-emerald-500' 
                                      : percentAvail > 20 
                                        ? 'bg-amber-500' 
                                        : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${percentAvail}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Button 
                      variant="ghost" 
                      className="px-6 font-bold" 
                      onClick={() => setShowModal(false)}
                    >
                      Close
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

function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = () => {
    setLoading(true);
    api.get('/api/reviews')
      .then(res => {
        const sorted = (res.data || []).sort((a: any, b: any) => {
          const dateA = a.created_at?.seconds ? a.created_at.seconds * 1000 : new Date(a.created_at || 0).getTime();
          const dateB = b.created_at?.seconds ? b.created_at.seconds * 1000 : new Date(b.created_at || 0).getTime();
          return dateB - dateA;
        });
        setReviews(sorted);
      })
      .catch(err => console.error("Failed to fetch reviews", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleFeatured = async (review: any) => {
    const newStatus = !review.featured;
    console.log('[CAVEMAN] Admin toggling featured status for review:', review.id, 'to:', newStatus);
    try {
      await api.patch(`/api/reviews/${review.id}/featured`, { featured: newStatus });
      setReviews(prev => prev.map(r => r.id === review.id ? { ...r, featured: newStatus } : r));
    } catch (err) {
      console.error("Failed to update featured status", err);
      alert("Failed to update featured status");
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5 text-yellow-400">
        {[1, 2, 3, 4, 5].map(star => (
          <Star key={star} className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200 dark:text-slate-800'}`} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Customer Reviews & Testimonials</h2>
        <p className="text-sm text-slate-500">Monitor ratings, customer feedback, and select reviews to feature on the website's Client Stories.</p>
      </div>

      <DataTable
        columns={[
          { key: 'customer_name', label: 'Customer', sortable: true },
          { 
            key: 'rating', 
            label: 'Rating', 
            sortable: true,
            render: (item: any) => renderStars(item.rating || 0)
          },
          { 
            key: 'feedback', 
            label: 'Feedback Review', 
            render: (item: any) => (
              <p className="text-sm max-w-xs xl:max-w-md truncate whitespace-normal leading-relaxed text-slate-600 dark:text-slate-350">
                "{item.feedback}"
              </p>
            )
          },
          { key: 'service_type', label: 'Service', sortable: true },
          { key: 'vendor_name', label: 'Vendor Partner', sortable: true },
          {
            key: 'created_at',
            label: 'Submitted Date',
            sortable: true,
            render: (item: any) => {
              if (!item.created_at) return '—';
              const date = item.created_at.seconds ? new Date(item.created_at.seconds * 1000) : new Date(item.created_at);
              return isNaN(date.getTime()) ? '—' : date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
          },
          {
            key: 'featured',
            label: 'Client Story (Featured)',
            render: (item: any) => (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleFeatured(item);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  item.featured 
                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400' 
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-transparent hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {item.featured ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Featured
                  </>
                ) : (
                  'Feature Story'
                )}
              </button>
            )
          }
        ]}
        data={reviews}
        loading={loading}
        searchPlaceholder="Search reviews..."
        emptyTitle="No reviews yet"
        emptyDescription="Customer reviews will appear here once bookings are completed."
      />
    </div>
  );
}
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
        if (existingSub && existingSub.prices && existingSub.prices['Base Price'] && !pricesObj['Base Price']) {
          pricesObj['Base Price'] = existingSub.prices['Base Price'];
        }
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
function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Settings state
  const [systemFeePercentage, setSystemFeePercentage] = useState<number>(10);
  const [updatingFee, setUpdatingFee] = useState(false);
  const [feeSuccess, setFeeSuccess] = useState(false);
  
  // Filters state
  const [searchVendor, setSearchVendor] = useState('');
  const [searchService, setSearchService] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Modal state
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  
  // Personnel state for resolving assigned staff details
  const [personnelList, setPersonnelList] = useState<any[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('[CAVEMAN] TransactionsPage: loadData - Fetching transactions, settings, and personnel');
      const [txRes, feeRes, personnelRes] = await Promise.all([
        api.get('/api/admin/transactions'),
        api.get('/api/admin/settings/system-fee'),
        api.get('/api/personnel').catch(() => ({ data: [] }))
      ]);
      setTransactions(txRes.data || []);
      if (feeRes.data && feeRes.data.percentage !== undefined) {
        setSystemFeePercentage(feeRes.data.percentage);
      }
      setPersonnelList(personnelRes.data || []);
      console.log('[CAVEMAN] TransactionsPage: loadData - Success. Loaded', txRes.data?.length, 'transactions');
    } catch (err) {
      console.error('[CAVEMAN] TransactionsPage: Failed to load data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateSystemFee = async () => {
    setUpdatingFee(true);
    setFeeSuccess(false);
    try {
      console.log('[CAVEMAN] TransactionsPage: Updating system fee to', systemFeePercentage);
      const res = await api.post('/api/admin/settings/system-fee', { percentage: systemFeePercentage });
      if (res.data.success || res.status === 200) {
        setFeeSuccess(true);
        setTimeout(() => setFeeSuccess(false), 3000);
        // Reload transactions to recalculate with the new fee if historical fallback is triggered
        const txRes = await api.get('/api/admin/transactions');
        setTransactions(txRes.data || []);
      }
    } catch (err) {
      console.error('[CAVEMAN] TransactionsPage: Failed to update system fee', err);
    } finally {
      setUpdatingFee(false);
    }
  };

  const getPersonnelDetails = (pId: string) => {
    if (!pId) return null;
    return personnelList.find(p => p.id === pId || p.uid === pId);
  };

  const formatDate = (dateVal: any) => {
    if (!dateVal) return '—';
    if (dateVal.seconds) {
      return new Date(dateVal.seconds * 1000).toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric'
      });
    }
    const parsed = new Date(dateVal);
    if (isNaN(parsed.getTime())) return String(dateVal);
    return parsed.toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const formatCurrency = (val: any) => {
    const num = Number(val);
    return isNaN(num) ? '₱0.00' : `₱${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getMonthYearString = (dateVal: any) => {
    if (!dateVal) return new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    let d: Date;
    if (dateVal.seconds) {
      d = new Date(dateVal.seconds * 1000);
    } else {
      d = new Date(dateVal);
    }
    if (isNaN(d.getTime())) return new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  };

  // Payout states in TransactionsPage
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutDate, setPayoutDate] = useState('');
  const [checkNumber, setCheckNumber] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [payoutError, setPayoutError] = useState('');

  const setPayoutFormFields = (tx: any) => {
    setSelectedTx(tx);
    setPayoutDate(new Date().toISOString().split('T')[0]);
    setCheckNumber('');
    setAttachmentUrl('');
    setPayoutError('');
  };

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setPayoutError('');
    console.log('[CAVEMAN] TransactionsPage: Uploading supporting document:', file.name);

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = reader.result as string;
        const res = await api.post('/api/upload/image', {
          image: base64,
          folder: 'payouts'
        });
        setAttachmentUrl(res.data.url);
        console.log('[CAVEMAN] TransactionsPage: Upload success. URL:', res.data.url);
      } catch (err: any) {
        console.error('[CAVEMAN] TransactionsPage: Upload failed', err);
        setPayoutError('Failed to upload attachment. Please try again.');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleProcessPayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutError('');
    
    if (!payoutDate) {
      setPayoutError('Please select a payout date.');
      return;
    }
    if (!checkNumber.trim()) {
      setPayoutError('Please enter a Reference Number.');
      return;
    }
    if (!attachmentUrl) {
      setPayoutError('Please upload a proof of payment.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        vendor_id: selectedTx.vendor_id,
        vendor_name: selectedTx.vendor_name,
        amount: Number(selectedTx.vendor_earnings),
        month: getMonthYearString(selectedTx.completed_at),
        check_number: checkNumber.trim(),
        attachment: attachmentUrl,
        payout_date: new Date(payoutDate),
        booking_id: selectedTx.id,
        status: 'Paid'
      };

      console.log('[CAVEMAN] TransactionsPage: Processing payout for booking:', selectedTx.id, 'with payload:', payload);
      await api.post('/api/admin/payouts', payload);
      setShowPayoutModal(false);
      setSelectedTx(null);
      loadData();
    } catch (err: any) {
      console.error('[CAVEMAN] TransactionsPage: Process payout failed', err);
      setPayoutError(err?.response?.data?.message || 'Failed to process payout.');
    } finally {
      setSaving(false);
    }
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(tx => {
    if (searchVendor.trim()) {
      const vName = (tx.vendor_name || '').toLowerCase();
      if (!vName.includes(searchVendor.toLowerCase())) return false;
    }
    if (searchService.trim()) {
      const sType = (tx.service_type || '').toLowerCase();
      const subSvc = (tx.sub_service || '').toLowerCase();
      const term = searchService.toLowerCase();
      if (!sType.includes(term) && !subSvc.includes(term)) return false;
    }
    const txDate = tx.completed_at ? 
      (tx.completed_at.seconds ? new Date(tx.completed_at.seconds * 1000) : new Date(tx.completed_at)) : null;
    if (startDate && txDate) {
      const start = new Date(startDate);
      start.setHours(0,0,0,0);
      if (txDate < start) return false;
    }
    if (endDate && txDate) {
      const end = new Date(endDate);
      end.setHours(23,59,59,999);
      if (txDate > end) return false;
    }
    return true;
  });

  // Calculate analytics totals
  const totalVolume = filteredTransactions.reduce((sum, tx) => sum + (tx.total_payment || 0), 0);
  const totalFees = filteredTransactions.reduce((sum, tx) => sum + (tx.system_fee || 0), 0);
  const totalEarnings = filteredTransactions.reduce((sum, tx) => sum + (tx.vendor_earnings || 0), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-brand-navy dark:text-brand-green" />
            <span>Admin Transactions</span>
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track completed services, system fee deductions, and service partner earnings.
          </p>
        </div>
      </div>

      {/* Settings Panel & Premium Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Fee Config */}
        <Card className="lg:col-span-1 p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between animate-fadeIn">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
              <Wrench className="w-4 h-4 text-brand-navy dark:text-brand-green" />
              <span>System Fee Configuration</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal mb-4">
              Set the commission fee percentage automatically applied on bookings.
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <div className="relative flex-1">
                <input 
                  type="number" 
                  value={systemFeePercentage} 
                  onChange={(e) => setSystemFeePercentage(Math.max(0, Math.min(100, Number(e.target.value))))} 
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white pr-8 focus:outline-none focus:ring-2 focus:ring-brand-navy"
                  min="0"
                  max="100"
                  step="0.5"
                  disabled={updatingFee}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">%</span>
              </div>
              <Button 
                onClick={handleUpdateSystemFee} 
                variant="success" 
                loading={updatingFee}
                className="whitespace-nowrap font-bold"
              >
                Apply Fee
              </Button>
            </div>
            {feeSuccess && (
              <p className="text-xs text-emerald-500 font-bold mt-2 flex items-center gap-1 animate-pulse">
                <Check className="w-3.5 h-3.5" /> Updated system fee settings successfully!
              </p>
            )}
          </div>
        </Card>

        {/* Dynamic Financial Overview */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatCard title="Completed Jobs" value={filteredTransactions.length} icon={<ClipboardList className="w-5 h-5" />} color="navy" />
          <StatCard title="Transactions Volume" value={formatCurrency(totalVolume)} icon={<TrendingUp className="w-5 h-5" />} color="green" />
          <StatCard title="Fees Collected" value={formatCurrency(totalFees)} icon={<Receipt className="w-5 h-5" />} color="yellow" />
          <div className="col-span-2 sm:col-span-1">
            <StatCard title="Vendor Earnings" value={formatCurrency(totalEarnings)} icon={<DollarSign className="w-5 h-5" />} color="red" />
          </div>
        </div>
      </div>

      {/* Filter Options */}
      <Card className="p-5 border border-slate-200 dark:border-slate-800">
        <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3.5 flex items-center gap-2">
          <Filter className="w-3.5 h-3.5" /> Filter Transactions
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search Vendor Name..."
              value={searchVendor}
              onChange={(e) => setSearchVendor(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-navy text-slate-800 dark:text-white"
            />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search Service Category..."
              value={searchService}
              onChange={(e) => setSearchService(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-navy text-slate-800 dark:text-white"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-navy text-slate-800 dark:text-white"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-navy text-slate-800 dark:text-white"
            />
          </div>
        </div>
        {(searchVendor || searchService || startDate || endDate) && (
          <div className="mt-3 flex justify-end">
            <button 
              onClick={() => { setSearchVendor(''); setSearchService(''); setStartDate(''); setEndDate(''); }}
              className="text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </Card>

      {/* Main Transactions List (Responsive: Desktop Table / Mobile Cards) */}
      <Card className="border border-slate-200 dark:border-slate-800">
        <div className="p-6">
          {loading ? (
            <div className="space-y-4">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="skeleton h-12 rounded-xl" />
              ))}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <EmptyState 
              title="No Completed Transactions Found" 
              description="No bookings have been completed within the given search criteria yet." 
              icon={<Receipt className="w-8 h-8 text-slate-400" />} 
            />
          ) : (
            <>
              {/* Desktop / Tablet Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold text-xs uppercase tracking-wider">
                      <th className="py-4 px-4">Service</th>
                      <th className="py-4 px-4">Vendor</th>
                      <th className="py-4 px-4 text-right">Total Payment</th>
                      <th className="py-4 px-4 text-right">System Fee</th>
                      <th className="py-4 px-4 text-center">Date Completed</th>
                      <th className="py-4 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((tx) => (
                      <tr 
                        key={tx.id} 
                        className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-850 dark:text-white">{tx.sub_service || tx.service_type}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{tx.service_type}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{tx.vendor_name || '—'}</span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="font-extrabold text-brand-green">{formatCurrency(tx.total_payment)}</span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-bold text-brand-navy dark:text-brand-green">{formatCurrency(tx.system_fee)}</span>
                            <span className="text-[9px] text-slate-400 font-semibold">({tx.system_fee_percentage}%)</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="text-xs font-semibold text-slate-650 dark:text-slate-400">{formatDate(tx.completed_at)}</span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setSelectedTx(tx)}
                            icon={<Eye className="w-4 h-4" />}
                            className="inline-flex text-brand-navy dark:text-brand-green hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg p-1.5"
                          >
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View (Vertical stacked cards optimized for touch screens) */}
              <div className="block sm:hidden space-y-4">
                {filteredTransactions.map((tx) => (
                  <div 
                    key={tx.id}
                    className="p-4 rounded-2xl border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/25 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{tx.service_type}</span>
                        <h5 className="font-bold text-slate-905 dark:text-white text-sm">{tx.sub_service || tx.service_type}</h5>
                      </div>
                      <span className="text-xs font-semibold text-slate-450 dark:text-slate-500">{formatDate(tx.completed_at)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs border-t border-b border-slate-100 dark:border-slate-800/80 py-2.5">
                      <div>
                        <p className="text-slate-400 font-semibold mb-0.5">Vendor Partner</p>
                        <p className="font-bold text-slate-700 dark:text-slate-300 truncate">{tx.vendor_name || '—'}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 font-semibold mb-0.5">Total Payment</p>
                        <p className="font-extrabold text-brand-green text-sm">{formatCurrency(tx.total_payment)}</p>
                      </div>
                      <div className="mt-1">
                        <p className="text-slate-400 font-semibold mb-0.5">System Fee Deduction</p>
                        <p className="font-bold text-brand-navy dark:text-brand-green">
                          {formatCurrency(tx.system_fee)} <span className="text-[9px] text-slate-400">({tx.system_fee_percentage}%)</span>
                        </p>
                      </div>
                      <div className="mt-1">
                        <p className="text-slate-400 font-semibold mb-0.5">Vendor Net Earnings</p>
                        <p className="font-bold text-emerald-500">{formatCurrency(tx.vendor_earnings)}</p>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        onClick={() => setSelectedTx(tx)}
                        variant="ghost" 
                        size="sm" 
                        icon={<Eye className="w-4 h-4" />}
                        className="text-brand-navy dark:text-brand-green font-bold text-xs"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Transaction Details Modal */}
      <AnimatePresence>
        {selectedTx && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs" onClick={() => setSelectedTx(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/40">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Transaction Details</span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">Booking Ref: #{selectedTx.id}</h3>
                </div>
                <button 
                  onClick={() => setSelectedTx(null)} 
                  className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-650 dark:text-slate-400">
                
                {/* Section 1: Booking & Partner Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Service Info */}
                  <div className="space-y-3">
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-1 flex items-center gap-1.5 font-bold">
                      <Wrench className="w-3.5 h-3.5 text-brand-navy dark:text-brand-green" /> Service Description
                    </h5>
                    <div className="space-y-1">
                      <p><span className="font-semibold">Service Type:</span> {selectedTx.service_type}</p>
                      <p><span className="font-semibold">Sub-service:</span> {selectedTx.sub_service || '—'}</p>
                      <p><span className="font-semibold">Preferred Schedule:</span> 📅 {selectedTx.scheduled_date} at ⏰ {selectedTx.scheduled_time}</p>
                      <p><span className="font-semibold">Address:</span> {selectedTx.address || selectedTx.service_address || '—'}</p>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-3">
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-1 flex items-center gap-1.5 font-bold">
                      <Users className="w-3.5 h-3.5 text-brand-navy dark:text-brand-green" /> Customer Details
                    </h5>
                    <div className="space-y-1">
                      <p><span className="font-semibold">Name:</span> {selectedTx.customer_name || '—'}</p>
                      <p><span className="font-semibold">User Account:</span> {selectedTx.customer_id || '—'}</p>
                      <p><span className="font-semibold">GCash Number:</span> {selectedTx.payment_reference ? selectedTx.payment_reference.substring(0, 11) : '—'}</p>
                      {selectedTx.account_name && <p><span className="font-semibold">Account Name:</span> {selectedTx.account_name}</p>}
                      {selectedTx.account_number && <p><span className="font-semibold">Account Number:</span> {selectedTx.account_number}</p>}
                    </div>
                  </div>
                </div>

                {/* Section 2: Partner & Personnel */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Vendor Info */}
                  <div className="space-y-3">
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-1 flex items-center gap-1.5 font-bold">
                      <Building2 className="w-3.5 h-3.5 text-brand-navy dark:text-brand-green" /> Vendor Partner
                    </h5>
                    <div className="space-y-1">
                      <p><span className="font-semibold">Company:</span> {selectedTx.vendor_name || '—'}</p>
                      <p><span className="font-semibold">Vendor ID:</span> {selectedTx.vendor_id || '—'}</p>
                    </div>
                  </div>

                  {/* Assigned Personnel */}
                  <div className="space-y-3">
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-1 flex items-center gap-1.5 font-bold">
                      <User className="w-3.5 h-3.5 text-brand-navy dark:text-brand-green" /> Service Personnel Assigned
                    </h5>
                    {selectedTx.personnel_id ? (
                      (() => {
                        const staff = getPersonnelDetails(selectedTx.personnel_id);
                        return (
                          <div className="space-y-1">
                            <p><span className="font-semibold">Staff Name:</span> {staff ? `${staff.first_name || ''} ${staff.last_name || ''}`.trim() : 'Unknown Personnel'}</p>
                            <p><span className="font-semibold">Username:</span> {staff?.username || '—'}</p>
                            <p><span className="font-semibold">Phone:</span> {staff?.phone || '—'}</p>
                          </div>
                        );
                      })()
                    ) : (
                      <p className="text-xs italic text-slate-450 font-bold">No dedicated personnel was assigned to this booking.</p>
                    )}
                  </div>
                </div>

                {/* Section 3: Financial Payment Breakdown */}
                <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800/60">
                  <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-1.5">
                    Financial Summary Breakdown
                  </h5>
                  
                  <div className="space-y-2 text-xs sm:text-sm">
                    {/* Item price / qty */}
                    <div className="flex justify-between font-medium">
                      <span>Unit Price (₱{selectedTx.price || '0.00'} × {selectedTx.quantity || 1})</span>
                      <span className="text-slate-800 dark:text-white font-bold">
                        {formatCurrency((selectedTx.price || 0) * (selectedTx.quantity || 1))}
                      </span>
                    </div>

                    {/* Discount details */}
                    {selectedTx.discount_amount > 0 && (
                      <div className="flex justify-between font-medium text-brand-green">
                        <span className="flex items-center gap-1.5">
                          Voucher Discounted ({selectedTx.voucher_code})
                        </span>
                        <span className="font-bold dark:text-white">-{formatCurrency(selectedTx.discount_amount)}</span>
                      </div>
                    )}

                    {/* Total payment */}
                    <div className="flex justify-between font-bold border-t border-dashed border-slate-250 dark:border-slate-700 pt-2.5 text-sm">
                      <span className="text-slate-900 dark:text-slate-100">Customer Total Payment</span>
                      <span className="text-brand-green dark:text-white text-base">{formatCurrency(selectedTx.total_payment)}</span>
                    </div>

                    {/* System Fee percentage and deduction */}
                    <div className="flex justify-between font-bold text-rose-500 pt-1">
                      <span>Platform Fee Deducted ({selectedTx.system_fee_percentage}%)</span>
                      <span className="dark:text-white">-{formatCurrency(selectedTx.system_fee)}</span>
                    </div>

                    {/* Vendor Net earnings */}
                    <div className="flex justify-between font-black text-emerald-500 border-t border-slate-200 dark:border-slate-700 pt-2.5 text-base sm:text-lg bg-emerald-500/5 dark:bg-emerald-500/10 p-2 rounded-xl">
                      <span>Vendor Partner Earnings</span>
                      <span className="dark:text-white">{formatCurrency(selectedTx.vendor_earnings)}</span>
                    </div>
                  </div>
                </div>

                {/* Date completed tracking */}
                <div className="text-right text-[11px] text-slate-450 font-bold">
                  Payment Confirmed Ref: {selectedTx.payment_reference || 'GCASH'} • Date Logged: {formatDate(selectedTx.completed_at)}
                </div>

              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end gap-2">
                <Button 
                  onClick={() => setSelectedTx(null)}
                  variant="ghost"
                  className="font-bold"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payout Form Modal for TransactionsPage */}
      <AnimatePresence>
        {showPayoutModal && selectedTx && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs" onClick={() => setShowPayoutModal(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <form onSubmit={handleProcessPayoutSubmit}>
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-855/50 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Process Vendor Payout</h3>
                    <p className="text-xs text-slate-400 font-bold">Log transfer reference details for {selectedTx.vendor_name}</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setShowPayoutModal(false)} 
                    className="p-1 rounded-xl hover:bg-slate-205 dark:hover:bg-slate-800 text-slate-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {payoutError && (
                  <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold flex gap-2 items-center animate-fadeIn">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{payoutError}</span>
                  </div>
                )}

                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  {/* Payout Date */}
                  <div>
                    <label className="block text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-1.5 font-bold">Payout Date *</label>
                    <input
                      type="date"
                      value={payoutDate}
                      onChange={(e) => setPayoutDate(e.target.value)}
                      required
                      placeholder="Select payout date..."
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-navy"
                    />
                  </div>

                  {/* Reference Number */}
                  <div>
                    <label className="block text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-1.5 font-bold">Reference Number *</label>
                    <input
                      type="text"
                      value={checkNumber}
                      onChange={(e) => setCheckNumber(e.target.value)}
                      required
                      placeholder="Enter GCash or Bank Reference Number..."
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-navy"
                    />
                  </div>

                  {/* Attach Proof */}
                  <div>
                    <label className="block text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-1.5 font-bold">Attach Proof *</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="file" 
                        accept="image/*,.pdf" 
                        onChange={handleUploadFile}
                        id="tx-payout-file-process"
                        className="hidden"
                        disabled={uploading}
                      />
                      <label 
                        htmlFor="tx-payout-file-process"
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-205 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-bold text-xs rounded-xl cursor-pointer transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" /> {uploading ? 'Uploading...' : 'Choose File'}
                      </label>
                      <span className="text-xs text-slate-400 truncate max-w-[200px]">
                        {attachmentUrl ? '✓ File loaded' : 'No document chosen'}
                      </span>
                    </div>
                    {attachmentUrl && (
                      <div className="mt-2 text-xs font-semibold text-emerald-500 flex items-center gap-1 animate-pulse">
                        <Check className="w-3 h-3" /> Supporting file attached successfully!
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-855 flex gap-3">
                  <Button type="button" variant="ghost" className="flex-1 font-bold" onClick={() => setShowPayoutModal(false)}>Cancel</Button>
                  <Button type="submit" variant="success" className="flex-1 font-bold shadow-sm" loading={saving}>Payout</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PayoutsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [personnelList, setPersonnelList] = useState<any[]>([]);
  
  // Modal toggles
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  
  // Form elements
  const [payoutDate, setPayoutDate] = useState('');
  const [checkNumber, setCheckNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [vendorAccountNumber, setVendorAccountNumber] = useState('');
  const [vendorAccountName, setVendorAccountName] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Filters state
  const [searchVendor, setSearchVendor] = useState('');
  const [searchService, setSearchService] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('[CAVEMAN] PayoutsPage: loadData - Loading transactions and personnel');
      const [txRes, personnelRes] = await Promise.all([
        api.get('/api/admin/transactions'),
        api.get('/api/personnel').catch(() => ({ data: [] }))
      ]);
      setTransactions(txRes.data || []);
      setPersonnelList(personnelRes.data || []);
      console.log('[CAVEMAN] PayoutsPage: loadData - Loaded', txRes.data?.length, 'transactions');
    } catch (err) {
      console.error('[CAVEMAN] PayoutsPage: Failed to load data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getPersonnelDetails = (pId: string) => {
    if (!pId) return null;
    return personnelList.find(p => p.id === pId || p.uid === pId);
  };

  const getMonthYearString = (dateVal: any) => {
    if (!dateVal) return new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    let d: Date;
    if (dateVal.seconds) {
      d = new Date(dateVal.seconds * 1000);
    } else {
      d = new Date(dateVal);
    }
    if (isNaN(d.getTime())) return new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  };

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed as proof of payment.');
      return;
    }

    setUploading(true);
    console.log('[CAVEMAN] PayoutsPage: Uploading supporting document:', file.name);

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = reader.result as string;
        const res = await api.post('/api/upload/image', {
          image: base64,
          folder: 'payouts'
        });
        setAttachmentUrl(res.data.url);
        console.log('[CAVEMAN] PayoutsPage: Upload success. URL:', res.data.url);
      } catch (err: any) {
        console.error('[CAVEMAN] PayoutsPage: Upload failed', err);
        setError('Failed to upload attachment. Please try again.');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const setPayoutFormFields = async (tx: any) => {
    setSelectedTx(tx);
    setPayoutDate(new Date().toISOString().split('T')[0]);
    setCheckNumber('');
    setAccountNumber(tx.account_number || '');
    setAccountName(tx.account_name || '');
    setVendorAccountNumber('');
    setVendorAccountName('');
    setAttachmentUrl('');
    setError('');

    if (tx && tx.vendor_id) {
      try {
        console.log('[CAVEMAN] PayoutsPage: Fetching vendor details for vendor_id:', tx.vendor_id);
        const res = await api.get(`/api/vendors/${tx.vendor_id}`);
        if (res.data) {
          const vAccName = res.data.account_name || '';
          const vAccNo = res.data.account_number || '';
          console.log('[CAVEMAN] PayoutsPage: Vendor details fetched. Name:', vAccName, 'No:', vAccNo);
          setVendorAccountName(vAccName);
          setVendorAccountNumber(vAccNo);
          if (vAccName) setAccountName(vAccName);
          if (vAccNo) setAccountNumber(vAccNo);
        }
      } catch (err) {
        console.error('[CAVEMAN] PayoutsPage: Failed to fetch vendor details', err);
      }
    }
  };

  const handleProcessPayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!payoutDate) {
      setError('Please select a payout date.');
      return;
    }
    if (!checkNumber.trim()) {
      setError('Please enter a Reference Number.');
      return;
    }
    if (!accountName.trim()) {
      setError('Please enter an Account Name.');
      return;
    }
    if (!accountNumber.trim()) {
      setError('Please enter an Account Number.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        vendor_id: selectedTx.vendor_id,
        vendor_name: selectedTx.vendor_name,
        amount: Number(selectedTx.vendor_earnings),
        month: getMonthYearString(selectedTx.completed_at),
        check_number: checkNumber.trim(),
        account_name: accountName.trim(),
        account_number: accountNumber.trim(),
        attachment: attachmentUrl,
        payout_date: new Date(payoutDate),
        booking_id: selectedTx.id,
        status: 'Paid'
      };

      console.log('[CAVEMAN] PayoutsPage: Processing payout for booking ID:', selectedTx.id, 'with payload:', payload);
      await api.post('/api/admin/payouts', payload);
      setShowPayoutModal(false);
      setSelectedTx(null);
      loadData();
    } catch (err: any) {
      console.error('[CAVEMAN] PayoutsPage: Process payout failed', err);
      setError(err?.response?.data?.message || 'Failed to process payout.');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateVal: any) => {
    if (!dateVal) return '—';
    if (dateVal.seconds) {
      return new Date(dateVal.seconds * 1000).toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric'
      });
    }
    const parsed = new Date(dateVal);
    if (isNaN(parsed.getTime())) return String(dateVal);
    return parsed.toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const formatCurrency = (val: any) => {
    const num = Number(val);
    return isNaN(num) ? '₱0.00' : `₱${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Filter completed bookings eligible for payouts
  const filteredEligible = transactions.filter(tx => {
    if (tx.payout_status === 'Paid') return false;

    if (searchVendor.trim()) {
      const vName = (tx.vendor_name || '').toLowerCase();
      if (!vName.includes(searchVendor.toLowerCase())) return false;
    }
    if (searchService.trim()) {
      const sType = (tx.service_type || '').toLowerCase();
      const subSvc = (tx.sub_service || '').toLowerCase();
      const term = searchService.toLowerCase();
      if (!sType.includes(term) && !subSvc.includes(term)) return false;
    }
    const txDate = tx.completed_at ? 
      (tx.completed_at.seconds ? new Date(tx.completed_at.seconds * 1000) : new Date(tx.completed_at)) : null;
    if (startDate && txDate) {
      const start = new Date(startDate);
      start.setHours(0,0,0,0);
      if (txDate < start) return false;
    }
    if (endDate && txDate) {
      const end = new Date(endDate);
      end.setHours(23,59,59,999);
      if (txDate > end) return false;
    }
    return true;
  });

  const totalVolume = filteredEligible.reduce((sum, tx) => sum + (tx.vendor_earnings || 0), 0);
  const totalRecords = filteredEligible.length;
  const avgPayout = totalRecords ? totalVolume / totalRecords : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-905 dark:text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-brand-navy dark:text-brand-green" />
            <span>Payout Management</span>
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track GCash or Bank payout logs and receipts for service providers.
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard title="Pending Payout Volume" value={formatCurrency(totalVolume)} icon={<TrendingUp className="w-5 h-5" />} color="navy" />
        <StatCard title="Eligible Payout Jobs" value={totalRecords} icon={<ClipboardList className="w-5 h-5" />} color="green" />
      </div>

      {/* Filters Bar */}
      <Card className="p-5 border border-slate-200 dark:border-slate-800">
        <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3.5 flex items-center gap-2">
          <Filter className="w-3.5 h-3.5" /> Filter Eligible Bookings
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search Vendor Partner..."
              value={searchVendor}
              onChange={(e) => setSearchVendor(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-navy text-slate-800 dark:text-white"
            />
          </div>
          <div className="relative">
            <Wrench className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search Service..."
              value={searchService}
              onChange={(e) => setSearchService(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-navy text-slate-800 dark:text-white"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-navy text-slate-800 dark:text-white"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-navy text-slate-800 dark:text-white"
            />
          </div>
        </div>
        {(searchVendor || searchService || startDate || endDate) && (
          <div className="mt-3 flex justify-end">
            <button 
              onClick={() => { setSearchVendor(''); setSearchService(''); setStartDate(''); setEndDate(''); }}
              className="text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </Card>

      {/* Main Table / Mobile Cards */}
      <Card className="border border-slate-200 dark:border-slate-800">
        <div className="p-6">
          {loading ? (
            <div className="space-y-4">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="skeleton h-12 rounded-xl" />
              ))}
            </div>
          ) : filteredEligible.length === 0 ? (
            <EmptyState 
              title="No Pending Payouts Found" 
              description="All completed vendor booking payouts have been processed successfully." 
              icon={<CreditCard className="w-8 h-8 text-slate-400" />} 
            />
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold text-xs uppercase tracking-wider">
                      <th className="py-4 px-4">Service</th>
                      <th className="py-4 px-4">Vendor</th>
                      <th className="py-4 px-4 text-right">Total Payment</th>
                      <th className="py-4 px-4 text-right">System Fee</th>
                      <th className="py-4 px-4 text-center">Date Completed</th>
                      <th className="py-4 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEligible.map((tx) => (
                      <tr 
                        key={tx.id}
                        className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-855 dark:text-white">{tx.sub_service || tx.service_type}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{tx.service_type}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{tx.vendor_name || '—'}</span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="font-extrabold text-brand-green">{formatCurrency(tx.total_payment)}</span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-bold text-brand-navy dark:text-brand-green">{formatCurrency(tx.system_fee)}</span>
                            <span className="text-[9px] text-slate-400 font-semibold">({tx.system_fee_percentage}%)</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="text-xs font-semibold text-slate-655 dark:text-slate-400">{formatDate(tx.completed_at)}</span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex justify-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setSelectedTx(tx)}
                              icon={<Eye className="w-4 h-4" />}
                              className="text-brand-navy dark:text-brand-green font-bold text-xs"
                            >
                              View Details
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile / Tablet cards list view */}
              <div className="block sm:hidden space-y-4">
                {filteredEligible.map((tx) => (
                  <div 
                    key={tx.id}
                    className="p-4 rounded-2xl border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/25 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{tx.service_type}</span>
                        <h5 className="font-bold text-slate-905 dark:text-white text-sm">{tx.sub_service || tx.service_type}</h5>
                      </div>
                      <span className="text-xs font-semibold text-slate-450 dark:text-slate-500">{formatDate(tx.completed_at)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs border-t border-b border-slate-150 dark:border-slate-800/80 py-2.5">
                      <div>
                        <p className="text-slate-400 font-semibold mb-0.5">Vendor Partner</p>
                        <p className="font-bold text-slate-700 dark:text-slate-300 truncate">{tx.vendor_name || '—'}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 font-semibold mb-0.5">Total Payment</p>
                        <p className="font-extrabold text-brand-green text-sm">{formatCurrency(tx.total_payment)}</p>
                      </div>
                      <div className="mt-1">
                        <p className="text-slate-400 font-semibold mb-0.5">System Fee Deduction</p>
                        <p className="font-bold text-brand-navy dark:text-brand-green">
                          {formatCurrency(tx.system_fee)} <span className="text-[9px] text-slate-400">({tx.system_fee_percentage}%)</span>
                        </p>
                      </div>
                      <div className="mt-1">
                        <p className="text-slate-400 font-semibold mb-0.5">Vendor Net Earnings</p>
                        <p className="font-bold text-emerald-500">{formatCurrency(tx.vendor_earnings)}</p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button 
                        onClick={() => setSelectedTx(tx)}
                        variant="ghost" 
                        size="sm" 
                        icon={<Eye className="w-4 h-4" />}
                        className="text-brand-navy dark:text-brand-green font-bold text-xs"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Payout Form Modal */}
      <AnimatePresence>
        {showPayoutModal && selectedTx && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs" onClick={() => setShowPayoutModal(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <form onSubmit={handleProcessPayoutSubmit}>
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-855/50 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Process Vendor Payout</h3>
                    <p className="text-xs text-slate-400 font-bold">Log transfer reference details for {selectedTx.vendor_name}</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setShowPayoutModal(false)} 
                    className="p-1 rounded-xl hover:bg-slate-205 dark:hover:bg-slate-800 text-slate-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {error && (
                  <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold flex gap-2 items-center animate-fadeIn">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  {/* Payout Date */}
                  <div>
                    <label className="block text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-1.5 font-bold">Payout Date *</label>
                    <input
                      type="date"
                      value={payoutDate}
                      onChange={(e) => setPayoutDate(e.target.value)}
                      required
                      placeholder="Select payout date..."
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-navy"
                    />
                  </div>

                  {/* Reference Number */}
                  <div>
                    <label className="block text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-1.5 font-bold">Reference Number *</label>
                    <input
                      type="text"
                      value={checkNumber}
                      onChange={(e) => setCheckNumber(e.target.value)}
                      required
                      placeholder="Enter GCash or Bank Reference Number..."
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-navy"
                    />
                  </div>

                  {/* Account Name */}
                  <div>
                    <label className="block text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-1.5 font-bold">Account Name *</label>
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      required
                      placeholder={vendorAccountName || "Enter Bank or GCash Account Name..."}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-navy"
                    />
                  </div>

                  {/* Account Number */}
                  <div>
                    <label className="block text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-1.5 font-bold">Account Number *</label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      required
                      placeholder={vendorAccountNumber || "Enter Bank or GCash Account Number..."}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-navy"
                    />
                  </div>

                  {/* Supporting proof document file upload */}
                  <div>
                    <label className="block text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-1.5 font-bold">Attach Proof (Image Only)</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleUploadFile}
                        id="payout-file-process"
                        className="hidden"
                        disabled={uploading}
                      />
                      <label 
                        htmlFor="payout-file-process"
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-205 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-bold text-xs rounded-xl cursor-pointer transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" /> {uploading ? 'Uploading...' : 'Choose Image'}
                      </label>
                      <span className="text-xs text-slate-400 truncate max-w-[200px]">
                        {attachmentUrl ? '✓ Image loaded' : 'No image chosen'}
                      </span>
                    </div>
                    {attachmentUrl && (
                      <div className="mt-2 text-xs font-semibold text-emerald-500 flex items-center gap-1 animate-pulse">
                        <Check className="w-3 h-3" /> Supporting file attached successfully!
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-855 flex gap-3">
                  <Button type="button" variant="ghost" className="flex-1 font-bold" onClick={() => setShowPayoutModal(false)}>Cancel</Button>
                  <Button type="submit" variant="success" className="flex-1 font-bold shadow-sm" loading={saving}>Payout</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Booking/Transaction Details Modal */}
      <AnimatePresence>
        {selectedTx && !showPayoutModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs" onClick={() => setSelectedTx(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/40">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Transaction Details</span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">Booking Ref: #{selectedTx.id}</h3>
                </div>
                <button 
                  onClick={() => setSelectedTx(null)} 
                  className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-650 dark:text-slate-400">
                
                {/* Section 1: Booking & Partner Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Service Info */}
                  <div className="space-y-3">
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-1 flex items-center gap-1.5 font-bold">
                      <Wrench className="w-3.5 h-3.5 text-brand-navy dark:text-brand-green" /> Service Description
                    </h5>
                    <div className="space-y-1">
                      <p><span className="font-semibold">Service Type:</span> {selectedTx.service_type}</p>
                      <p><span className="font-semibold">Sub-service:</span> {selectedTx.sub_service || '—'}</p>
                      <p><span className="font-semibold">Preferred Schedule:</span> 📅 {selectedTx.scheduled_date} at ⏰ {selectedTx.scheduled_time}</p>
                      <p><span className="font-semibold">Address:</span> {selectedTx.address || selectedTx.service_address || '—'}</p>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-3">
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-1 flex items-center gap-1.5 font-bold">
                      <Users className="w-3.5 h-3.5 text-brand-navy dark:text-brand-green" /> Customer Details
                    </h5>
                    <div className="space-y-1">
                      <p><span className="font-semibold">Name:</span> {selectedTx.customer_name || '—'}</p>
                      <p><span className="font-semibold">User Account:</span> {selectedTx.customer_id || '—'}</p>
                      <p><span className="font-semibold">GCash Number:</span> {selectedTx.payment_reference ? selectedTx.payment_reference.substring(0, 11) : '—'}</p>
                      {selectedTx.account_name && <p><span className="font-semibold">Account Name:</span> {selectedTx.account_name}</p>}
                      {selectedTx.account_number && <p><span className="font-semibold">Account Number:</span> {selectedTx.account_number}</p>}
                    </div>
                  </div>
                </div>

                {/* Section 2: Partner & Personnel */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Vendor Info */}
                  <div className="space-y-3">
                    <h5 className="font-bold text-slate-905 dark:text-white text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-1 flex items-center gap-1.5 font-bold">
                      <Building2 className="w-3.5 h-3.5 text-brand-navy dark:text-brand-green" /> Vendor Partner
                    </h5>
                    <div className="space-y-1">
                      <p><span className="font-semibold">Company:</span> {selectedTx.vendor_name || '—'}</p>
                      <p><span className="font-semibold">Vendor ID:</span> {selectedTx.vendor_id || '—'}</p>
                    </div>
                  </div>

                  {/* Assigned Personnel */}
                  <div className="space-y-3">
                    <h5 className="font-bold text-slate-905 dark:text-white text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-1 flex items-center gap-1.5 font-bold">
                      <User className="w-3.5 h-3.5 text-brand-navy dark:text-brand-green" /> Service Personnel Assigned
                    </h5>
                    {selectedTx.personnel_id ? (
                      (() => {
                        const staff = getPersonnelDetails(selectedTx.personnel_id);
                        return (
                          <div className="space-y-1">
                            <p><span className="font-semibold">Staff Name:</span> {staff ? `${staff.first_name || ''} ${staff.last_name || ''}`.trim() : 'Unknown Personnel'}</p>
                            <p><span className="font-semibold">Username:</span> {staff?.username || '—'}</p>
                            <p><span className="font-semibold">Phone:</span> {staff?.phone || '—'}</p>
                          </div>
                        );
                      })()
                    ) : (
                      <p className="text-xs italic text-slate-450 font-bold">No dedicated personnel was assigned to this booking.</p>
                    )}
                  </div>
                </div>

                {/* Section 3: Financial Payment Breakdown */}
                <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800/60">
                  <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-1.5">
                    Financial Summary Breakdown
                  </h5>
                  
                  <div className="space-y-2 text-xs sm:text-sm">
                    {/* Item price / qty */}
                    <div className="flex justify-between font-medium">
                      <span>Unit Price (₱{selectedTx.price || '0.00'} × {selectedTx.quantity || 1})</span>
                      <span className="text-slate-800 dark:text-white font-bold">
                        {formatCurrency((selectedTx.price || 0) * (selectedTx.quantity || 1))}
                      </span>
                    </div>

                    {/* Discount details */}
                    {selectedTx.discount_amount > 0 && (
                      <div className="flex justify-between font-medium text-brand-green">
                        <span className="flex items-center gap-1.5">
                          Voucher Discounted ({selectedTx.voucher_code})
                        </span>
                        <span className="font-bold dark:text-white">-{formatCurrency(selectedTx.discount_amount)}</span>
                      </div>
                    )}

                    {/* Total payment */}
                    <div className="flex justify-between font-bold border-t border-dashed border-slate-250 dark:border-slate-700 pt-2.5 text-sm">
                      <span className="text-slate-900 dark:text-slate-100">Customer Total Payment</span>
                      <span className="text-brand-green dark:text-white text-base">{formatCurrency(selectedTx.total_payment)}</span>
                    </div>

                    {/* System Fee percentage and deduction */}
                    <div className="flex justify-between font-bold text-rose-500 pt-1">
                      <span>Platform Fee Deducted ({selectedTx.system_fee_percentage}%)</span>
                      <span className="dark:text-white">-{formatCurrency(selectedTx.system_fee)}</span>
                    </div>

                    {/* Vendor Net earnings */}
                    <div className="flex justify-between font-black text-emerald-500 border-t border-slate-200 dark:border-slate-700 pt-2.5 text-base sm:text-lg bg-emerald-500/5 dark:bg-emerald-500/10 p-2 rounded-xl">
                      <span>Vendor Partner Earnings</span>
                      <span className="dark:text-white">{formatCurrency(selectedTx.vendor_earnings)}</span>
                    </div>
                  </div>
                </div>

                {/* Date completed tracking */}
                <div className="text-right text-[11px] text-slate-450 font-bold">
                  Payment Confirmed Ref: {selectedTx.payment_reference || 'GCASH'} • Date Logged: {formatDate(selectedTx.completed_at)}
                </div>

              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end gap-2">
                <Button 
                  onClick={() => setSelectedTx(null)}
                  variant="ghost"
                  className="font-bold"
                >
                  Close
                </Button>
                {selectedTx.payout_status !== 'Paid' && (
                  <Button 
                    onClick={() => {
                      setPayoutFormFields(selectedTx);
                      setShowPayoutModal(true);
                    }}
                    variant="success"
                    className="font-bold"
                  >
                    Payout
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function VouchersPage() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  // Form fields
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  const loadVouchers = () => {
    setLoading(true);
    api.get('/api/vouchers')
      .then(res => {
        setVouchers(res.data || []);
      })
      .catch(err => {
        console.error('Failed to load vouchers', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadVouchers();
    // Load active customers
    api.get('/api/customers')
      .then(res => {
        // Only display records from Customer collection where temp_delete = 0 (active customers)
        const active = (res.data || []).filter((c: any) => c.temp_delete === 0 || !c.hasOwnProperty('temp_delete'));
        setCustomers(active);
      })
      .catch(err => {
        console.error('Failed to load customers', err);
      });
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this voucher?')) {
      try {
        await api.delete(`/api/vouchers/${id}`);
        setVouchers(prev => prev.filter(v => v.id !== id));
      } catch (err) {
        console.error('Failed to delete voucher', err);
      }
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!code.trim()) {
      setError('Voucher code is required.');
      return;
    }
    if (!discountValue || Number(discountValue) <= 0) {
      setError('Please enter a valid discount value greater than 0.');
      return;
    }
    if (!selectedCustomerId) {
      setError('Please select a customer to assign this voucher.');
      return;
    }

    const selectedCust = customers.find(c => c.id === selectedCustomerId);
    if (!selectedCust) {
      setError('Selected customer is invalid.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        customerId: selectedCustomerId,
        customerName: `${selectedCust.first_name || ''} ${selectedCust.last_name || ''}`.trim() || selectedCust.email
      };

      await api.post('/api/vouchers', payload);
      setShowCreateModal(false);
      
      // Reset form
      setCode('');
      setDiscountType('percentage');
      setDiscountValue('');
      setSelectedCustomerId('');
      
      loadVouchers();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create voucher.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Promotional Vouchers</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create, assign, and manage promotional discount vouchers for active customers.
          </p>
        </div>
        <Button onClick={() => { setShowCreateModal(true); setError(''); }} icon={<Plus className="w-4 h-4" />}>
          Create Voucher
        </Button>
      </div>

      <Card>
        <div className="p-6">
          <DataTable
            columns={[
              { key: 'code', label: 'Voucher Code', sortable: true, render: (item: any) => (
                <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-sm font-bold text-brand-navy dark:text-brand-green border border-slate-200 dark:border-slate-700/60 uppercase">
                  {item.code}
                </span>
              )},
              { key: 'discount_type', label: 'Type', render: (item: any) => (
                <span className="capitalize font-semibold text-slate-700 dark:text-white text-xs">
                  {item.discount_type}
                </span>
              )},
              { key: 'discount_value', label: 'Value', render: (item: any) => (
                <span className="font-extrabold text-sm text-brand-green">
                  {item.discount_type === 'percentage' ? `${item.discount_value}%` : `₱${item.discount_value}`}
                </span>
              )},
              { key: 'customer_name', label: 'Assigned Customer', sortable: true, render: (item: any) => (
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800 dark:text-white text-xs">{item.customer_name}</span>
                  <span className="text-[10px] text-slate-450 font-medium">ID: {item.customer_id}</span>
                </div>
              )},
              { key: 'status', label: 'Status', render: (item: any) => (
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase inline-block ${
                  item.status === 'used'
                    ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                    : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                }`}>
                  {item.status || 'unused'}
                </span>
              )},
              {
                key: 'actions', label: 'Actions', render: (item: any) => (
                  <div className="flex gap-2">
                    <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)} icon={<Trash2 className="w-4 h-4" />}>
                      Delete
                    </Button>
                  </div>
                )
              }
            ]}
            data={vouchers}
            loading={loading}
            searchPlaceholder="Search vouchers..."
            emptyTitle="No Vouchers Created"
            emptyDescription="Click 'Create Voucher' to get started."
          />
        </div>
      </Card>

      {/* Create Voucher Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md" onClick={e => e.stopPropagation()}>
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create & Assign Voucher</h3>
                      <p className="text-xs text-slate-400 font-bold">Configure promotional benefits for active accounts</p>
                    </div>
                    <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {error && (
                    <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex gap-2 items-center">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Voucher Code *</label>
                      <input
                        type="text"
                        value={code}
                        onChange={e => setCode(e.target.value.toUpperCase())}
                        placeholder="e.g. SAVINGS10"
                        className="w-full px-4 py-2.5 sm:py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white text-xs sm:text-sm font-bold uppercase focus:outline-none focus:ring-2 focus:ring-brand-navy"
                        required
                        disabled={saving}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Discount Type</label>
                        <select
                          value={discountType}
                          onChange={e => setDiscountType(e.target.value)}
                          className="w-full px-4 py-2.5 sm:py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-navy"
                          disabled={saving}
                        >
                          <option value="percentage">Percentage (%)</option>
                          <option value="fixed">Fixed Amount (PHP)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                          {discountType === 'percentage' ? 'Percentage (%)' : 'Amount (₱)'} *
                        </label>
                        <input
                          type="number"
                          value={discountValue}
                          onChange={e => setDiscountValue(e.target.value)}
                          placeholder={discountType === 'percentage' ? '10' : '100'}
                          className="w-full px-4 py-2.5 sm:py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-850 dark:text-white text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-navy"
                          required
                          disabled={saving}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Assign to Customer *</label>
                      <select
                        value={selectedCustomerId}
                        onChange={e => setSelectedCustomerId(e.target.value)}
                        className="w-full px-4 py-2.5 sm:py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-850 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-navy"
                        required
                        disabled={saving}
                      >
                        <option value="">Select an active customer...</option>
                        {customers.map(c => (
                          <option key={c.id} value={c.id}>
                            {`${c.first_name || ''} ${c.last_name || ''}`.trim() || c.email} ({c.email})
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold">Only active customers (temp_delete = 0) are listed.</p>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button variant="ghost" className="flex-1" onClick={() => setShowCreateModal(false)} type="button" disabled={saving}>
                        Cancel
                      </Button>
                      <Button variant="success" className="flex-1" type="submit" loading={saving}>
                        Create & Assign
                      </Button>
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

function AssignedVouchersPage() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadVouchers = () => {
    setLoading(true);
    api.get('/api/vouchers')
      .then(res => {
        setVouchers(res.data || []);
      })
      .catch(err => {
        console.error('Failed to load vouchers', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadVouchers();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Assigned Vouchers Tracker</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Monitor and track the usage of vouchers assigned to specific customer accounts.
        </p>
      </div>

      <Card>
        <div className="p-6">
          <DataTable
            columns={[
              { key: 'customer_name', label: 'Customer Account', sortable: true, render: (item: any) => (
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800 dark:text-white text-xs">{item.customer_name}</span>
                  <span className="text-[10px] text-slate-450 font-medium">Customer ID: {item.customer_id}</span>
                </div>
              )},
              { key: 'code', label: 'Assigned Voucher Code', render: (item: any) => (
                <span className="font-mono bg-blue-500/10 dark:bg-blue-500/20 px-2.5 py-1 rounded-lg text-xs font-bold text-blue-600 dark:text-blue-400 uppercase border border-blue-500/10">
                  {item.code}
                </span>
              )},
              { key: 'benefit', label: 'Discount Benefit', render: (item: any) => (
                <span className="font-extrabold text-xs text-brand-green">
                  {item.discount_type === 'percentage' ? `${item.discount_value}% Off` : `₱${item.discount_value} Off`}
                </span>
              )},
              { key: 'status', label: 'Redemption Status', sortable: true, render: (item: any) => (
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase inline-block ${
                  item.status === 'used'
                    ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                    : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 animate-pulse'
                }`}>
                  {item.status || 'unused'}
                </span>
              )}
            ]}
            data={vouchers}
            loading={loading}
            searchPlaceholder="Search assigned vouchers..."
            emptyTitle="No Assigned Vouchers"
            emptyDescription="Assign a voucher code to a customer in the Vouchers section to begin tracking."
          />
        </div>
      </Card>
    </div>
  );
}

// ─── Refunds Tab ────────────────────────────────────────────────────────────
import { RefreshCcw } from 'lucide-react';

function RefundsPage() {
  const [refunds, setRefunds] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form States
  const [showModal, setShowModal] = useState(false);
  const [isProcessingExisting, setIsProcessingExisting] = useState(false);
  const [selectedRefundId, setSelectedRefundId] = useState<string | null>(null);

  // Form Fields
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [proofImageUrl, setProofImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Cancel Details & Deduction States
  const [cancelledBy, setCancelledBy] = useState('');
  const [statusAtCancellation, setStatusAtCancellation] = useState('');
  const [deductionPercentage, setDeductionPercentage] = useState(0);
  const [rejectionDetails, setRejectionDetails] = useState('');

  const selectedBooking = bookings.find(b => b.id === selectedBookingId);
  const totalPrice = selectedBooking ? (selectedBooking.total_price || (selectedBooking.price * (selectedBooking.quantity || 1)) || 0) : 0;

  useEffect(() => {
    if (isProcessingExisting) {
      const selectedRefund = refunds.find(r => r.id === selectedRefundId);
      const basePrice = totalPrice || (selectedRefund ? selectedRefund.refund_amount : 0) || 0;
      const dedAmt = basePrice * (deductionPercentage / 100);
      setRefundAmount(String(basePrice - dedAmt));
    }
  }, [deductionPercentage, totalPrice, isProcessingExisting, selectedRefundId, refunds]);

  const loadData = async () => {
    console.log('[CAVEMAN] RefundsPage: loadData - Loading refunds and bookings');
    setLoading(true);
    try {
      const [refundsRes, bookingsRes] = await Promise.all([
        api.get('/api/refunds'),
        api.get('/api/bookings')
      ]);
      setRefunds(refundsRes.data || []);
      setBookings(bookingsRes.data || []);
      console.log('[CAVEMAN] RefundsPage: loadData - Success. Refunds count:', refundsRes.data?.length, 'Bookings count:', bookingsRes.data?.length);
    } catch (err) {
      console.error('[CAVEMAN] RefundsPage: loadData - Failed to load data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // When a booking is selected in direct creation mode
  useEffect(() => {
    if (!isProcessingExisting && selectedBookingId) {
      const booking = bookings.find(b => b.id === selectedBookingId);
      if (booking) {
        console.log('[CAVEMAN] RefundsPage: Booking selected:', selectedBookingId, booking);
        setCustomerName(booking.customer_name || '—');
        setRefundAmount(String(booking.total_price || (booking.price * (booking.quantity || 1)) || 0));
        
        if (booking.customer_id) {
          api.get(`/api/customers/${booking.customer_id}`)
            .then(res => {
              if (res.data && res.data.account_number) {
                console.log('[CAVEMAN] RefundsPage: Automatically populated account number from customer profile for direct refund:', res.data.account_number);
                setAccountNumber(res.data.account_number);
              } else {
                setAccountNumber('');
              }
            })
            .catch(err => {
              console.error('[CAVEMAN] RefundsPage: Failed to fetch customer details for account number', err);
              setAccountNumber('');
            });
        } else {
          setAccountNumber('');
        }
      }
    }
  }, [selectedBookingId, isProcessingExisting, bookings]);

  // Handle direct file upload / base64 reading
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('[CAVEMAN] RefundsPage: handleFileChange - Selected file:', file.name);
    setUploadingImage(true);
    setError('');

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = reader.result as string;
        console.log('[CAVEMAN] RefundsPage: Uploading base64 image to server...');
        const res = await api.post('/api/upload/image', {
          image: base64,
          folder: 'refunds'
        });
        setProofImageUrl(res.data.url);
        console.log('[CAVEMAN] RefundsPage: Upload success. URL:', res.data.url);
      } catch (err: any) {
        console.error('[CAVEMAN] RefundsPage: Upload failed', err);
        setError('Failed to upload image. Please try again.');
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOpenCreate = () => {
    console.log('[CAVEMAN] RefundsPage: Opening direct refund creation modal');
    setIsProcessingExisting(false);
    setSelectedRefundId(null);
    setSelectedBookingId('');
    setCustomerName('');
    setRefundAmount('');
    setReferenceNumber('');
    setAccountNumber('');
    setProofImageUrl('');
    setCancelledBy('admin');
    setStatusAtCancellation('');
    setDeductionPercentage(0);
    setRejectionDetails('');
    setError('');
    setShowModal(true);
  };

  const handleOpenProcess = (refund: any) => {
    console.log('[CAVEMAN] RefundsPage: Opening process refund modal for refund ID:', refund.id);
    setIsProcessingExisting(true);
    setSelectedRefundId(refund.id);
    setSelectedBookingId(refund.booking_id || '');
    setCustomerName(refund.customer_name || '—');
    setRefundAmount(String(refund.refund_amount || 0));
    setReferenceNumber('');

    const booking = bookings.find(b => b.id === refund.booking_id);
    setAccountNumber(refund.account_number || booking?.account_number || '');
    setProofImageUrl('');
    setRejectionDetails('');

    const cBy = booking?.cancelled_by || refund.cancelled_by || 'customer';
    const sAtCancel = booking?.status_at_cancellation || refund.status_at_cancellation || 'pending';
    setCancelledBy(cBy);
    setStatusAtCancellation(sAtCancel);
    setDeductionPercentage(booking?.refund_deduction_percentage || refund.deduction_percentage || 0);

    setError('');
    setShowModal(true);

    if (refund.customer_id) {
      console.log('[CAVEMAN] RefundsPage: Fetching latest customer account number for customer:', refund.customer_id);
      api.get(`/api/customers/${refund.customer_id}`)
        .then(res => {
          if (res.data && res.data.account_number) {
            console.log('[CAVEMAN] RefundsPage: Found latest account number:', res.data.account_number);
            setAccountNumber(res.data.account_number);
          } else if (booking?.account_number) {
            setAccountNumber(booking.account_number);
          }
        })
        .catch(err => {
          console.error('[CAVEMAN] RefundsPage: Failed to fetch latest customer account number', err);
          if (booking?.account_number) {
            setAccountNumber(booking.account_number);
          }
        });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[CAVEMAN] RefundsPage: Submitting refund. isProcessingExisting:', isProcessingExisting);

    if (!referenceNumber.trim()) {
      setError('Reference number is required.');
      return;
    }
    if (!accountNumber.trim()) {
      setError('Account number is required.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const deductionAmt = isProcessingExisting ? (totalPrice * (deductionPercentage / 100)) : 0;
      const deductionPct = isProcessingExisting ? deductionPercentage : 0;

      const payload = {
        booking_id: selectedBookingId,
        reference_number: referenceNumber.trim(),
        account_number: accountNumber.trim(),
        proof_image_url: proofImageUrl,
        refund_amount: parseFloat(refundAmount) || 0,
        deduction_amount: deductionAmt,
        deduction_percentage: deductionPct,
        cancelled_by: cancelledBy,
        status_at_cancellation: statusAtCancellation,
      };

      console.log('[CAVEMAN] RefundsPage: Submitting payload:', payload);

      if (isProcessingExisting && selectedRefundId) {
        await api.patch(`/api/refunds/${selectedRefundId}/approve`, payload);
        console.log('[CAVEMAN] RefundsPage: Process/Approve refund successful');
        alert('Refund approved and details recorded successfully!');
      } else {
        if (!selectedBookingId) {
          setError('Please select a booking.');
          setSubmitting(false);
          return;
        }
        await api.post('/api/refunds/direct', payload);
        console.log('[CAVEMAN] RefundsPage: Direct refund creation successful');
        alert('Direct refund created and processed successfully!');
      }

      setShowModal(false);
      loadData();
    } catch (err: any) {
      console.error('[CAVEMAN] RefundsPage: Submission failed', err);
      setError(err.response?.data?.message || 'Failed to submit refund details. Please check the inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (refundId: string) => {
    if (!rejectionDetails.trim()) {
      setError('Rejection details are required to reject the refund request. Please fill in the rejection reason above.');
      alert('Rejection details are required to reject the refund request. Please fill in the rejection reason above.');
      return;
    }
    if (!window.confirm('Are you sure you want to reject this refund request?')) return;
    console.log('[CAVEMAN] RefundsPage: Rejecting refund request ID:', refundId, 'Reason:', rejectionDetails.trim());
    setSubmitting(true);
    try {
      await api.patch(`/api/refunds/${refundId}/reject`, { rejection_reason: rejectionDetails.trim() });
      console.log('[CAVEMAN] RefundsPage: Reject refund request successful');
      alert('Refund request rejected successfully!');
      setShowModal(false);
      loadData();
    } catch (err: any) {
      console.error('[CAVEMAN] RefundsPage: Reject failed', err);
      alert(err.response?.data?.message || 'Failed to reject refund request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickApprove = async (refund: any) => {
    if (!window.confirm(`Approve this vendor-cancelled refund of ₱${Number(refund.refund_amount || 0).toFixed(2)} for ${refund.customer_name}? This will mark the refund as processed.`)) return;
    console.log('[CAVEMAN] RefundsPage: Quick-approving vendor-cancelled refund ID:', refund.id);
    try {
      await api.patch(`/api/refunds/${refund.id}/approve`, {
        cancelled_by: refund.cancelled_by || 'vendor',
        status_at_cancellation: refund.status_at_cancellation || '',
      });
      console.log('[CAVEMAN] RefundsPage: Quick approve successful for vendor-cancelled refund');
      alert('Vendor-cancelled refund approved and marked as processed!');
      loadData();
    } catch (err: any) {
      console.error('[CAVEMAN] RefundsPage: Quick approve failed', err);
      alert(err.response?.data?.message || 'Failed to approve refund.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Refund Management</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create direct booking refunds or process customer-initiated cancellation refund requests.
          </p>
        </div>
        <Button onClick={handleOpenCreate} icon={<Plus className="w-4 h-4" />}>
          Create Refund
        </Button>
      </div>

      <Card>
        <div className="p-6">
          <DataTable
            columns={[
              { key: 'id', label: 'Refund ID', sortable: true, render: (item: any) => <span className="font-mono text-xs font-semibold text-slate-500">{item.id?.substring(0, 8)}...</span> },
              { key: 'booking_id', label: 'Booking ID', sortable: true, render: (item: any) => (
                <div className="flex flex-col">
                  <span className="font-mono text-xs font-semibold text-slate-850 dark:text-white">{item.booking_id}</span>
                  {item.is_automatic_expiration && (
                    <span className="bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[9px] px-1.5 py-0.5 rounded-full inline-block mt-1 font-semibold w-fit">
                      ⚠️ Missed Deadline
                    </span>
                  )}
                </div>
              ) },
              { key: 'customer_name', label: 'Customer Name', sortable: true, render: (item: any) => <span className="font-bold text-slate-800 dark:text-white">{item.customer_name}</span> },
              { key: 'refund_amount', label: 'Refund Amount', sortable: true, render: (item: any) => <span className="font-black text-brand-green">₱{Number(item.refund_amount || 0).toFixed(2)}</span> },
              { key: 'reason', label: 'Reason', render: (item: any) => (
                <div className="flex flex-col gap-0.5 max-w-[150px]">
                  <span className="text-xs text-slate-700 dark:text-white font-bold truncate" title={item.reason}>
                    {item.reason || 'Customer Requested'}
                  </span>
                  {item.is_automatic_expiration && (
                    <span className="text-[9px] text-rose-500 font-extrabold">
                      Automatic Expiration
                    </span>
                  )}
                </div>
              ) },
              { key: 'cancelled_by', label: 'Cancelled By', render: (item: any) => {
                const cb = item.cancelled_by || '—';
                const colorMap: Record<string, string> = {
                  customer: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
                  vendor: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
                  admin: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
                  system: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
                };
                const cls = colorMap[cb.toLowerCase()] || 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
                return cb === '—'
                  ? <span className="text-xs text-slate-400">—</span>
                  : <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${cls}`}>{cb}</span>;
              } },
              { key: 'account_number', label: 'Account Number', render: (item: any) => <span className="font-mono text-xs text-slate-600 dark:text-slate-400">{item.account_number || '—'}</span> },
              { key: 'proof_image_url', label: 'Proof Image', render: (item: any) => item.proof_image_url ? (
                <a href={item.proof_image_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-brand-navy dark:text-brand-green hover:underline font-bold">
                  <Eye className="w-3.5 h-3.5" /> View Proof
                </a>
              ) : <span className="text-xs text-slate-400">None</span> },
              {
                key: 'status',
                label: 'Status',
                sortable: true,
                render: (item: any) => {
                  const status = item.status || 'pending';
                  return (
                    <span className={status === 'approved' || status.toLowerCase() === 'processed' ? 'badge-completed' : status === 'rejected' ? 'badge-cancelled' : 'badge-pending'}>
                      {status.toUpperCase()}
                    </span>
                  );
                }
              },
              {
                key: 'actions',
                label: 'Actions',
                render: (item: any) => {
                  const status = item.status || 'pending';
                  if (status === 'pending') {
                    return (
                      <Button size="sm" onClick={() => handleOpenProcess(item)}>
                        Process
                      </Button>
                    );
                  }
                  return <span className="text-xs text-slate-400">—</span>;
                }
              }
            ]}
            data={refunds}
            loading={loading}
            searchPlaceholder="Search refunds..."
            emptyTitle="No Refunds Recorded"
            emptyDescription="Create a refund or check for client cancellation requests."
          />
        </div>
      </Card>

      {/* Create / Process Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setShowModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg"
              onClick={e => e.stopPropagation()}
            >
              <Card className="p-6 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b pb-4 border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-navy/10 dark:bg-brand-green/10 flex items-center justify-center text-brand-navy dark:text-brand-green">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                        {isProcessingExisting ? 'Process Refund Request' : 'Create Direct Refund'}
                      </h4>
                      <p className="text-xs text-slate-500">Provide details to record and execute the refund transaction.</p>
                    </div>
                  </div>
                  <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isProcessingExisting ? (
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Select Booking *</label>
                      <select
                        value={selectedBookingId}
                        onChange={e => setSelectedBookingId(e.target.value)}
                        className="w-full px-4 py-2.5 sm:py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-navy"
                        required
                      >
                        <option value="">Select a booking to refund...</option>
                        {bookings
                          .filter(b => b.status !== 'cancelled' || !b.refund_id)
                          .map(b => (
                            <option key={b.id} value={b.id}>
                              {b.id} - {b.customer_name} - {b.service_type} (₱{Number(b.total_price || (b.price * (b.quantity || 1)) || 0).toFixed(2)})
                            </option>
                          ))}
                      </select>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Booking ID</label>
                        <input
                          type="text"
                          value={selectedBookingId}
                          readOnly
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-550 dark:text-slate-400 text-xs sm:text-sm font-semibold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Customer Name</label>
                        <input
                          type="text"
                          value={customerName}
                          readOnly
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-550 dark:text-slate-400 text-xs sm:text-sm font-bold focus:outline-none"
                          placeholder="Customer Name"
                        />
                      </div>
                    </div>
                  )}

                  {!isProcessingExisting && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Customer Name</label>
                        <input
                          type="text"
                          value={customerName}
                          readOnly
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-550 dark:text-slate-400 text-xs sm:text-sm font-bold focus:outline-none"
                          placeholder="Customer Name"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Refund Amount (₱)</label>
                        <input
                          type="text"
                          value={refundAmount ? `₱${Number(refundAmount).toFixed(2)}` : '₱0.00'}
                          readOnly
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-brand-green text-xs sm:text-sm font-black focus:outline-none"
                          placeholder="₱0.00"
                        />
                      </div>
                    </div>
                  )}

                  {isProcessingExisting && (
                    <>
                      <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Cancelled By</label>
                        <input
                          type="text"
                          value={cancelledBy || '—'}
                          readOnly
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-550 dark:text-slate-400 text-xs sm:text-sm font-bold focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Deduction Percentage (%) *</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={deductionPercentage}
                            onChange={e => {
                              const val = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                              setDeductionPercentage(val);
                            }}
                            className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-navy"
                            placeholder="0"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Deduction Amount (₱)</label>
                          <input
                            type="text"
                            value={`₱${(totalPrice * (deductionPercentage / 100)).toFixed(2)}`}
                            readOnly
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-rose-500 text-xs sm:text-sm font-black focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-2">
                        <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Refund Breakdown</p>
                        <div className="flex justify-between text-xs font-semibold text-slate-650 dark:text-slate-350">
                          <span>Original Price:</span>
                          <span>₱{totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs font-semibold text-rose-500">
                          <span>Deductions Applied:</span>
                          <span>- ₱{(totalPrice * (deductionPercentage / 100)).toFixed(2)} ({deductionPercentage}%)</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-brand-green border-t border-dashed border-slate-200 dark:border-slate-700 pt-2 mt-1">
                          <span>Final Refund Amount:</span>
                          <span>₱{Number(refundAmount).toFixed(2)}</span>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Reference Number *</label>
                      <input
                        type="text"
                        value={referenceNumber}
                        onChange={e => setReferenceNumber(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy placeholder:text-slate-400 font-bold"
                        placeholder="Enter Reference Number"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Account Number *</label>
                      <input
                        type="text"
                        value={accountNumber}
                        onChange={e => setAccountNumber(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy placeholder:text-slate-400 font-bold"
                        placeholder={selectedBooking?.account_number || "Enter Customer's Account Number"}
                        required
                      />
                    </div>
                  </div>

                  {/* Proof of Refund Image File Input */}
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                      Proof of Refund Image (Optional)
                    </label>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-350 dark:border-slate-700 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer relative group">
                      {uploadingImage ? (
                        <div className="text-xs text-slate-500 font-bold animate-pulse">Uploading Image...</div>
                      ) : proofImageUrl ? (
                        <div className="relative w-full h-40 rounded-xl overflow-hidden">
                          <img src={proofImageUrl} alt="Proof of Refund" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setProofImageUrl('');
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-lg transition-colors z-10"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 mb-2">
                            <Plus className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                            Click to upload receipt or transaction proof image
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1 font-medium">PNG, JPG, or WEBP formats allowed</p>
                        </>
                      )}
                      {!proofImageUrl && !uploadingImage && (
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={handleFileChange}
                        />
                      )}
                    </div>
                  </div>

                  {isProcessingExisting && (
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                        Rejection Details / Reason (Required if Rejecting)
                      </label>
                      <textarea
                        value={rejectionDetails}
                        onChange={e => setRejectionDetails(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-navy placeholder:text-slate-400"
                        placeholder="Provide details or reason for rejection if you choose to reject this request..."
                        rows={3}
                      />
                    </div>
                  )}

                  {(() => {
                    const showRejectButton = isProcessingExisting;

                    return (
                      <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                        {showRejectButton && (
                          <Button
                            variant="danger"
                            className="flex-1"
                            type="button"
                            onClick={() => handleReject(selectedRefundId!)}
                            disabled={submitting}
                          >
                            Reject Refund
                          </Button>
                        )}
                        <Button
                          variant="success"
                          className="flex-1"
                          type="submit"
                          loading={submitting}
                        >
                          {isProcessingExisting ? 'Process Refund' : 'Create Refund'}
                        </Button>
                      </div>
                    );
                  })()}
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PaymentsPage() {
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [paymentMethod, setPaymentMethod] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [qrImageUrl, setQrImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const loadPaymentMethods = () => {
    setLoading(true);
    api.get('/api/payments/methods')
      .then(res => {
        setPaymentMethods(res.data || []);
      })
      .catch(err => {
        console.error('Failed to load payment methods', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const handleUploadQR = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError('');

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        console.log('[CAVEMAN] PaymentsPage: Uploading QR image...');
        const res = await api.post('/api/upload/image', {
          image: base64Data,
          folder: 'payments'
        });
        setQrImageUrl(res.data.url);
      } catch (err: any) {
        console.error('[CAVEMAN] PaymentsPage: Upload failed', err);
        setError('Failed to upload image. Please try again.');
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!paymentMethod.trim()) {
      setError('Payment Method name is required.');
      return;
    }
    if (!accountName.trim()) {
      setError('Account Name is required.');
      return;
    }
    if (!accountNumber.trim()) {
      setError('Account Number is required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        paymentMethod: paymentMethod.trim(),
        accountName: accountName.trim(),
        accountNumber: accountNumber.trim(),
        qrImageUrl: qrImageUrl
      };

      await api.post('/api/payments/methods', payload);
      setShowCreateModal(false);

      // Reset
      setPaymentMethod('');
      setAccountName('');
      setAccountNumber('');
      setQrImageUrl('');

      loadPaymentMethods();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to add payment method.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this payment method?')) {
      try {
        await api.delete(`/api/payments/methods/${id}`);
        setPaymentMethods(prev => prev.filter(pm => pm.id !== id));
      } catch (err) {
        console.error('Failed to delete payment method', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Payment Methods</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure available payment gateways and details for checkout.
          </p>
        </div>
        <Button onClick={() => { setShowCreateModal(true); setError(''); }} icon={<Plus className="w-4 h-4" />}>
          Add Payment Method
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="skeleton h-48 rounded-3xl" />
          ))}
        </div>
      ) : paymentMethods.length === 0 ? (
        <EmptyState
          title="No Payment Methods Configured"
          description="Click 'Add Payment Method' to set up Gcash, Maya, or bank details."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paymentMethods.map((pm) => (
            <motion.div
              key={pm.id}
              whileHover={{ y: -4, scale: 1.01 }}
              className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg rounded-3xl p-6 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="font-extrabold text-sm px-3 py-1 rounded-xl bg-brand-navy/10 dark:bg-brand-green/20 text-brand-navy dark:text-brand-green border border-brand-navy/5">
                    {pm.paymentMethod}
                  </span>
                  <button
                    onClick={() => handleDelete(pm.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-semibold">Account Name</span>
                    <span className="font-bold text-slate-900 dark:text-white">{pm.accountName}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-semibold">Account Number</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{pm.accountNumber}</span>
                  </div>
                </div>
              </div>

              {pm.qrImageUrl ? (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-semibold">Payment QR Code</span>
                  <a
                    href={pm.qrImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-brand-navy dark:text-brand-green hover:underline font-bold"
                  >
                    <Eye className="w-3.5 h-3.5" /> View QR Image
                  </a>
                </div>
              ) : (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400 italic">
                  <span>No QR Code Uploaded</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Payment Method Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Payment Method</h3>
                      <p className="text-xs text-slate-400 font-bold">Configure client checkout payment instructions</p>
                    </div>
                    <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {error && (
                    <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex gap-2 items-center">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Payment Method *</label>
                      <input
                        type="text"
                        value={paymentMethod}
                        onChange={e => setPaymentMethod(e.target.value)}
                        placeholder="Payment Method"
                        required
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-navy placeholder:text-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Account Name *</label>
                      <input
                        type="text"
                        value={accountName}
                        onChange={e => setAccountName(e.target.value)}
                        placeholder="Account Name"
                        required
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-navy placeholder:text-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Account Number *</label>
                      <input
                        type="text"
                        value={accountNumber}
                        onChange={e => setAccountNumber(e.target.value)}
                        placeholder="Account Number"
                        required
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-navy placeholder:text-slate-400 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                        Payment QR Image
                      </label>
                      <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-350 dark:border-slate-700 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer relative group">
                        {uploadingImage ? (
                          <div className="text-xs text-slate-500 font-bold animate-pulse">Uploading Image...</div>
                        ) : qrImageUrl ? (
                          <div className="relative w-full h-40 rounded-xl overflow-hidden">
                            <img src={qrImageUrl} alt="QR Code" className="w-full h-full object-contain" />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setQrImageUrl('');
                              }}
                              className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-lg transition-colors z-10"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Plus className="w-6 h-6 text-slate-400 mb-2" />
                            <p className="text-xs font-semibold text-slate-650 dark:text-slate-400">
                              Click to upload QR code image
                            </p>
                            <p className="text-[10px] text-slate-450 mt-1">PNG, JPG, or WEBP formats allowed</p>
                          </>
                        )}
                        {!qrImageUrl && !uploadingImage && (
                          <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={handleUploadQR}
                          />
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowCreateModal(false)}
                        className="py-2.5 px-4 text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        Cancel
                      </button>
                      <Button
                        type="submit"
                        disabled={uploadingImage || saving}
                      >
                        {saving ? 'Adding...' : 'Add Method'}
                      </Button>
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

            <Route path="payouts" element={<PayoutsPage />} />
            <Route path="refunds" element={<RefundsPage />} />

            <Route path="vouchers" element={<VouchersPage />} />
            <Route path="assigned-vouchers" element={<AssignedVouchersPage />} />
            <Route path="payments" element={<PaymentsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
