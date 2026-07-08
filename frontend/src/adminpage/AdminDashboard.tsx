import React, { useState, useEffect, useCallback } from 'react';
import { useConfirm } from '../hooks/useConfirm';
import { Routes, Route, useNavigate, useParams, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Building2, ClipboardList, CreditCard, TrendingUp, Edit, Trash2, X, Check, Plus, Mail, User, Lock, Eye, EyeOff, AlertCircle, AlertTriangle, Phone, MapPin, ArrowRight, ArrowRightLeft, CheckCircle2, Sparkles, Star, Wrench, ArrowLeft, CalendarDays, Clock, Receipt, Search, Filter, Calendar, DollarSign, FileText, Download, Wallet, LayoutDashboard, MessageSquare, UserCog, Ticket, Tag, ShieldCheck, LifeBuoy, CheckCircle } from 'lucide-react';
import { formatBookingId } from '../utils/formatters';
import { Sidebar } from '../components/shared/Sidebar';
import { Header } from '../components/shared/Header';
import { Card, StatCard } from '../components/shared/Card';
import { DataTable } from '../components/shared/DataTable';
import { LineChart } from '../components/shared/LineChart';
import { EmptyState } from '../components/shared/EmptyState';
import { NotificationsTab } from '../components/shared/NotificationsTab';
import { Button } from '../components/shared/Button';
import { EditModal } from '../components/shared/EditModal';
import { VENDOR_SERVICES } from '../constants/services';
import { servicesData, WORK_TYPES_MAPPING } from '../constants/servicesData';
import api from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import AddServiceWizard from './AddServiceWizard';
import AreaServiceManager from './AreaServiceManager';
import { useTheme } from '../context/ThemeContext';
import PartnerLogosManager from './PartnerLogosManager';
import { AdminPageHeader } from '../components/shared/AdminPageHeader';
import { ConfirmModal } from '../components/shared/ConfirmModal';

// ─── Dashboard Tab ──────────────────────────────────────────────────────────
function DashboardHome() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [revenueTrend, setRevenueTrend] = useState<any[]>([]);
  const [jobTrend, setJobTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAttentionModal, setShowAttentionModal] = useState(false);

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

  const totalPending = (stats?.pendingWorkTypes ?? 0) + (stats?.pendingCancellations ?? 0) + (stats?.pendingRefunds ?? 0) + (stats?.pendingVendors ?? 0) + (stats?.pendingBookings ?? 0);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dashboard"
        subtitle="Welcome to your admin dashboard. Here is a summary of your platform's performance."
        icon={<LayoutDashboard />}
      />
      {/* Primary Analytics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Customers" value={stats?.totalCustomers ?? 0} icon={<Users className="w-5 h-5" />} color="navy" />
        <StatCard title="Active Vendors" value={stats?.totalVendors ?? 0} icon={<Building2 className="w-5 h-5" />} color="green" />
        <StatCard title="Total Bookings" value={stats?.totalBookings ?? 0} icon={<ClipboardList className="w-5 h-5" />} color="yellow" />
        <StatCard title="Pending Payments" value={stats?.pendingPayments ?? 0} icon={<CreditCard className="w-5 h-5" />} color="red" />
      </div>

      {/* Service Request Counters */}
      {/* Single Dynamic Attention Required Banner */}
      <div 
        onClick={() => {
          if (totalPending > 0) {
            setShowAttentionModal(true);
          }
        }}
        className={`relative overflow-hidden bg-[#021024] rounded-2xl p-4 sm:p-5 shadow-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 ${
          totalPending > 0 
            ? 'cursor-pointer hover:shadow-xl hover:scale-[1.01] border-white/5 dark:border-brand-red/40 hover:border-brand-green/30 dark:hover:border-brand-red/60 dark:bg-brand-red/10 group' 
            : 'border-white/5'
        }`}
      >
        {/* Subtle glow effect */}
        <div className="absolute top-0 right-0 w-[400px] h-full bg-brand-green/5 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="relative z-10">
          <p className="text-[10px] font-extrabold text-brand-green uppercase tracking-widest mb-1">
            Attention Required
          </p>
          <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
            {totalPending > 0 
              ? "Action Items Pending" 
              : "All Caught Up!"}
          </h3>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            {totalPending > 0 
              ? "There are items that require your review and approval."
              : "No pending requests, approvals, or cancellations at this time."}
          </p>
        </div>

        <div className="relative z-10 flex items-center bg-[#1E293B] border border-[#334155] rounded-2xl p-3 gap-4 min-w-[200px] shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#0f172a] flex items-center justify-center flex-shrink-0 shadow-inner">
            {totalPending > 0 
              ? <AlertCircle className="w-4 h-4 text-brand-red" /> 
              : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-200 uppercase tracking-wider mb-0.5">Pending Requests</p>
            <p className={`text-2xl font-black leading-none ${totalPending > 0 ? 'text-brand-red' : 'text-emerald-400'}`}>
              {totalPending}
            </p>
          </div>
        </div>
      </div>

      {showAttentionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAttentionModal(false)} />
          <div className="relative bg-white dark:bg-[#0a1628] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="p-6 bg-[#0a1628] border-b border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Attention Required</h3>
                <p className="text-sm text-slate-400">Select an item below to take action.</p>
              </div>
              <button onClick={() => setShowAttentionModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {(() => {
                const items = [];
                if ((stats?.pendingBookings ?? 0) > 0) {
                  items.push({
                    title: 'New Pending Bookings',
                    description: 'New service requests waiting to be assigned or confirmed.',
                    count: stats?.pendingBookings,
                    icon: <Calendar className="w-5 h-5 text-purple-400" />,
                    colorClass: 'border-purple-500/30 bg-purple-500/10 hover:border-purple-500/50 hover:bg-purple-500/20 text-purple-400',
                    path: '/admin/bookings'
                  });
                }
                if ((stats?.pendingCancellations ?? 0) > 0) {
                  items.push({
                    title: 'Late Cancellation Requests',
                    description: 'Bookings awaiting intervention before they can be cancelled.',
                    count: stats?.pendingCancellations,
                    icon: <AlertCircle className="w-5 h-5 text-rose-400" />,
                    colorClass: 'border-rose-500/30 bg-rose-500/10 hover:border-rose-500/50 hover:bg-rose-500/20 text-rose-400',
                    path: '/admin/bookings'
                  });
                }
                if ((stats?.pendingRefunds ?? 0) > 0) {
                  items.push({
                    title: 'Pending Refunds',
                    description: 'Refund requests requiring review and processing.',
                    count: stats?.pendingRefunds,
                    icon: <RefreshCcw className="w-5 h-5 text-orange-400" />,
                    colorClass: 'border-orange-500/30 bg-orange-500/10 hover:border-orange-500/50 hover:bg-orange-500/20 text-orange-400',
                    path: '/admin/refunds'
                  });
                }
                if ((stats?.pendingWorkTypes ?? 0) > 0) {
                  items.push({
                    title: 'Service Management Requests',
                    description: 'Pending work types require review before they can go live.',
                    count: stats?.pendingWorkTypes,
                    icon: <Sparkles className="w-5 h-5 text-blue-400" />,
                    colorClass: 'border-blue-500/30 bg-blue-500/10 hover:border-blue-500/50 hover:bg-blue-500/20 text-blue-400',
                    path: '/admin/services'
                  });
                }
                if ((stats?.pendingVendors ?? 0) > 0) {
                  items.push({
                    title: 'Pending Vendor Approvals',
                    description: 'New vendor registrations waiting for background check and approval.',
                    count: stats?.pendingVendors,
                    icon: <UserCog className="w-5 h-5 text-brand-green" />,
                    colorClass: 'border-brand-green/30 bg-brand-green/10 hover:border-brand-green/50 hover:bg-brand-green/20 text-brand-green',
                    path: '/admin/vendors'
                  });
                }
                return items.map((item, idx) => (
                  <div 
                    key={idx}
                    onClick={() => {
                      setShowAttentionModal(false);
                      navigate(item.path);
                    }}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer group ${item.colorClass}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-black/5 dark:bg-black/20 flex items-center justify-center flex-shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-white mb-0.5">{item.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-300 dark:opacity-80">{item.description}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div className="font-black text-2xl">{item.count}</div>
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="w-4 h-4 text-slate-400 dark:text-white" />
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">Revenue Trend</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total earnings over time</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-brand-navy/10 dark:bg-brand-navy/20 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-brand-navy dark:text-blue-400" />
            </div>
          </div>
          <div className="flex-1 min-h-[300px] -ml-4">
            <LineChart data={revenueTrend} xKey="week" lines={[{ dataKey: 'revenue', color: '#0EA5E9', name: 'Revenue (₱)' }]} />
          </div>
        </Card>

        <Card className="flex flex-col">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">Bookings Trend</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total bookings over time</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-brand-green/10 dark:bg-brand-green/20 flex items-center justify-center flex-shrink-0">
              <ClipboardList className="w-5 h-5 text-brand-green" />
            </div>
          </div>
          <div className="flex-1 min-h-[300px] -ml-4">
            <LineChart data={jobTrend} xKey="week" lines={[{ dataKey: 'bookings', color: '#20b759', name: 'Bookings' }]} />
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Customers Tab ──────────────────────────────────────────────────────────
function CustomersTab() {
  const { confirm, ConfirmComponent } = useConfirm();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState<any>(null);
  useEffect(() => { api.get('/api/customers').then(r => setCustomers(r.data)).catch(() => { }).finally(() => setLoading(false)); }, []);
  const handleDelete = (id: string, name?: string) => { 
    confirm({
      title: 'Delete Customer',
      message: `Are you sure you want to delete ${name || 'this customer'}? This action cannot be undone.`,
      confirmText: 'Delete',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.delete(`/api/customers/${id}`); 
          setCustomers(cs => cs.filter(c => c.id !== id)); 
        } catch (error) {
          console.error('Delete failed:', error);
          confirm({ title: 'Error', message: 'Failed to delete customer.', type: 'danger', hideCancel: true });
        }
      }
    });
  };
  const handleEditSave = async (data: Record<string, any>) => {
    await api.put(`/api/customers/${editItem.id}`, data);
    setCustomers(cs => cs.map(c => c.id === editItem.id ? { ...c, ...data } : c));
    setEditItem(null);
  };
  return (
    <div className="space-y-6">
      <AdminPageHeader title="Customers" subtitle="Manage registered customers on the platform." icon={<Users />} />
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
              <Button variant="danger" size="sm" onClick={(e: any) => { e.stopPropagation(); handleDelete(item.id, `${item.first_name} ${item.last_name}`); }} icon={<Trash2 className="w-4 h-4" />}>Delete</Button>
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
      <ConfirmComponent />
    </div>
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
                  <span className="text-[10px] uppercase font-bold text-slate-400">Business / Trade Name</span>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {vendor.company_name || vendor.contact_person || (vendor.first_name ? `${vendor.first_name} ${vendor.last_name || ''}`.trim() : 'N/A')}
                  </p>
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
                  <span className="text-[10px] uppercase font-bold text-slate-400">Bank Name / eWallet</span>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{vendor.bank_name || 'N/A'}</p>
                </div>
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
                      className="max-h-48 w-full object-contain rounded transition-transform group-hover:scale-[1.02]"
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
                      className="max-h-48 w-full object-contain rounded transition-transform group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="text-center p-6">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <span className="text-xs text-slate-400 font-medium">No BIR Certificate uploaded</span>
                    </div>
                  )}
                </div>
              </div>

              {/* DTI Number Card */}
              <div className="border border-slate-150 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col bg-white dark:bg-slate-800">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-white">DTI Number</span>
                  {vendor.professional_license_url && (
                    <a
                      href={vendor.professional_license_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-brand-navy dark:text-brand-green hover:underline flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> Full Size
                    </a>
                  )}
                </div>
                <div className="bg-slate-100 dark:bg-slate-900/50 flex-1 flex items-center justify-center min-h-[160px] p-4 relative group">
                  {vendor.professional_license_url ? (
                    <img
                      src={vendor.professional_license_url}
                      alt="DTI Number"
                      className="max-h-48 w-full object-contain rounded transition-transform group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="text-center p-6">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <span className="text-xs text-slate-400 font-medium">No DTI Number uploaded</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Proof of Insurance Card */}
              <div className="border border-slate-150 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col bg-white dark:bg-slate-800">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-white">Proof of Insurance</span>
                  {vendor.proof_of_insurance_url && (
                    <a
                      href={vendor.proof_of_insurance_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-brand-navy dark:text-brand-green hover:underline flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> Full Size
                    </a>
                  )}
                </div>
                <div className="bg-slate-100 dark:bg-slate-900/50 flex-1 flex items-center justify-center min-h-[160px] p-4 relative group">
                  {vendor.proof_of_insurance_url ? (
                    <img
                      src={vendor.proof_of_insurance_url}
                      alt="Proof of Insurance"
                      className="max-h-48 w-full object-contain rounded transition-transform group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="text-center p-6">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <span className="text-xs text-slate-400 font-medium">No Proof of Insurance uploaded</span>
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
function VendorEditModal({ vendor, onSave, onClose, confirm }: { vendor: any; onSave: (data: any) => Promise<void>; onClose: () => void; confirm: any }) {
  const [form, setForm] = useState({
    company_name: vendor.company_name || '',
    contact_person: vendor.contact_person || `${vendor.first_name || ''} ${vendor.last_name || ''}`.trim(),
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
  const [showAddService, setShowAddService] = useState(false);

  // Dynamically fetch available services from DB with fallback
  const [availableServices, setAvailableServices] = useState<Array<{ name: string; sub: Array<{ name: string; description: string; workTypes: string[]; prices: Record<string, string> }> }>>([]);
  
  useEffect(() => {
    const fallback = VENDOR_SERVICES.map(svc => ({
      name: svc.name,
      description: svc.description,
      sub: svc.sub.map(s => ({
        name: s.name,
        description: s.description,
        workTypes: WORK_TYPES_MAPPING[s.name] || [],
        prices: {}
      }))
    }));

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
        
        const merged = fallback.map(fb => {
          const found = dbServices.find((f: any) => f.name.toLowerCase() === fb.name.toLowerCase());
          return found || fb;
        });
        
        dbServices.forEach((f: any) => {
          if (!merged.find(m => m.name.toLowerCase() === f.name.toLowerCase())) {
            merged.push(f);
          }
        });
        
        setAvailableServices(merged);
      })
      .catch(() => setAvailableServices(fallback));
  }, []);

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

  const handleSaveClick = async () => {
    setError('');
    if (!form.contact_person.trim()) { setError('Contact Person Full Name is required'); return; }
    if (services.length === 0) { setError('At least one service is required'); return; }
    for (const s of services) {
      const def = availableServices.find(vs => vs.name === s.service);
      if (def && def.sub.length > 0 && s.sub_services.length === 0) {
        setError(`Select at least one sub-service for ${s.service}`);
        return;
      }
    }
    confirm({
      title: 'Confirm Changes',
      message: 'Are you sure you want to save these profile changes? This will immediately update the vendor\'s public profile and service offerings.',
      confirmText: 'Yes, Save',
      type: 'success',
      onConfirm: () => {
        confirmSave();
      }
    });
  };

  const confirmSave = async () => {
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

      const contactParts = form.contact_person.trim().split(' ');
      const firstName = contactParts[0] || form.company_name;
      const lastName = contactParts.slice(1).join(' ') || '';

      await onSave({
        company_name: form.company_name.trim(),
        first_name: firstName,
        last_name: lastName,
        contact_person: form.contact_person.trim(),
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
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto relative" onClick={e => e.stopPropagation()}>
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-navy/5 dark:bg-brand-green/10 rounded-lg">
                  <Edit className="w-5 h-5 text-brand-navy dark:text-brand-green" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit Vendor Profile</h3>
              </div>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex gap-2"><AlertCircle className="w-4 h-4 shrink-0" /> {error}</div>}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Basic Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Edit className="w-4 h-4 text-slate-400" />
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200">Basic Information</h4>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
                  <input value={form.company_name} disabled title="Company name is tied to legal documents."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/50 text-slate-500 cursor-not-allowed text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contact Person Full Name</label>
                  <input value={form.contact_person} onChange={e => { const v = e.target.value; setForm({ ...form, contact_person: v.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') }); }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-brand-navy/20"
                    placeholder="e.g. Juan Dela Cruz" />
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
              </div>

              {/* Right Column: Services Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Wrench className="w-4 h-4 text-slate-400" />
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200">Manage Services</h4>
                </div>
                
                {/* Current Services List */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Current Services ({services.length})</span>
                  </div>
                  <div className="p-2 space-y-2 max-h-80 overflow-y-auto">
                    {services.length === 0 && <p className="text-xs text-slate-500 text-center py-4">No services selected.</p>}
                    {availableServices.filter(svc => services.find(s => s.service === svc.name)).map(svc => {
                      const isSelected = services.find(s => s.service === svc.name)!;
                      const isExpanded = expandedService === svc.name;
                      return (
                        <div key={svc.name} className="border-2 border-brand-green/30 dark:border-brand-green/20 rounded-lg overflow-hidden bg-brand-green/5 dark:bg-brand-green/5">
                          <div className="flex items-center pr-2">
                            <button type="button" onClick={() => { if(isExpanded) setExpandedService(null); else setExpandedService(svc.name); }}
                              className="flex-1 flex items-center justify-between p-3 text-left transition-colors">
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-sm text-brand-navy dark:text-brand-green">{svc.name}</span>
                              </div>
                              <span className="text-xs text-brand-navy/70 dark:text-brand-green/70 font-medium bg-white/50 dark:bg-slate-800 px-2 py-1 rounded">
                                {isSelected.sub_services.length} sub-services • {isExpanded ? 'Collapse' : 'Expand'}
                              </span>
                            </button>
                            <button type="button" onClick={() => {
                              confirm({
                                title: 'Remove Service?',
                                message: `Are you sure you want to remove ${svc.name} from this vendor? They will lose access to provide this service.`,
                                confirmText: 'Remove',
                                type: 'danger',
                                onConfirm: () => {
                                  setServices(services.filter(s => s.service !== svc.name));
                                  setExpandedService(null);
                                }
                              });
                            }} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors ml-1" title="Remove Service">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <AnimatePresence>
                            {isExpanded && svc.sub && svc.sub.length > 0 && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 p-3 pl-6 space-y-2">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Select Sub-services:</p>
                                {svc.sub.map((sub: any) => {
                                  const subName = sub.name;
                                  const isSubSelected = isSelected.sub_services.includes(subName);
                                  const subServiceWorkTypes = sub.workTypes || [];

                                  return (
                                    <div key={subName} className="py-1 group border-b border-slate-200/50 dark:border-slate-700 last:border-0">
                                      <label className="flex items-start gap-3 cursor-pointer">
                                        <input type="checkbox" checked={isSubSelected} onChange={() => toggleSubService(svc.name, subName)}
                                          className="mt-0.5 w-4 h-4 rounded border-slate-300 text-brand-green focus:ring-brand-green bg-transparent" />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{subName}</span>
                                      </label>
                                    </div>
                                  );
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Add Service Button & Section */}
                {!showAddService && (
                  <button type="button" onClick={() => setShowAddService(true)} className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-brand-green font-semibold flex items-center justify-center gap-2 hover:bg-brand-green/5 transition-colors">
                    <Plus className="w-4 h-4" /> Add New Service
                  </button>
                )}
                
                {showAddService && (
                  <div className="border-2 border-dashed border-brand-green/30 rounded-xl p-3 bg-brand-green/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-brand-navy dark:text-brand-green">Select Services to Add</span>
                      <button type="button" onClick={() => setShowAddService(false)} className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Close</button>
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                      {availableServices.filter(svc => !services.find(s => s.service === svc.name)).length === 0 && (
                        <p className="text-xs text-slate-500 text-center py-2">No more services available to add.</p>
                      )}
                      {availableServices.filter(svc => !services.find(s => s.service === svc.name)).map(svc => (
                        <button key={svc.name} type="button" onClick={() => toggleService(svc.name)} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between hover:border-brand-green hover:bg-brand-green/5 transition-all text-left">
                          <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{svc.name}</span>
                          <Plus className="w-4 h-4 text-brand-green" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-3 pt-6 mt-6 border-t border-slate-200 dark:border-slate-700">
              <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
              <Button variant="success" className="flex-1" onClick={handleSaveClick} loading={saving}>Save Changes</Button>
            </div>
          </div>
        </Card>


      </motion.div>
    </div>
  );
}
// ─── Vendors Tab ────────────────────────────────────────────────────────────
function VendorsTab() {
  const { confirm, ConfirmComponent } = useConfirm();
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState<any>(null);
  const [viewItem, setViewItem] = useState<any>(null);
  const [viewServicesVendor, setViewServicesVendor] = useState<any>(null);
  const [personnelCounts, setPersonnelCounts] = useState<Record<string, number>>({});

  // Creation form states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    companyName: '',
    contactPersonFullName: ''
  });
  const [createError, setCreateError] = useState('');
  const [createSaving, setCreateSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [usernameCheckLoading, setUsernameCheckLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [usernameValid, setUsernameValid] = useState(false);


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

  const handleApprove = (id: string, companyName?: string) => { 
    confirm({
      title: 'Approve Vendor',
      message: `Are you sure you want to approve ${companyName || 'this vendor'}? They will be notified via email and granted access to the platform.`,
      confirmText: 'Approve Vendor',
      type: 'success',
      onConfirm: async () => {
        try {
          await api.post(`/api/admin/vendors/${id}/approve`); 
          setVendors(vs => vs.map(v => v.id === id ? { ...v, acc_approve: 'approved', is_approved: true } : v)); 
        } catch (error) {
          console.error('Approval failed:', error);
          confirm({ title: 'Error', message: 'Failed to approve vendor.', type: 'danger', hideCancel: true });
        }
      }
    });
  };
  
  const handleReject = (id: string, companyName?: string) => { 
    confirm({
      title: 'Reject Vendor',
      message: `Are you sure you want to reject ${companyName || 'this vendor'}? Their registration will be marked as rejected.`,
      confirmText: 'Reject Vendor',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.post(`/api/admin/vendors/${id}/reject`); 
          setVendors(vs => vs.map(v => v.id === id ? { ...v, acc_approve: 'rejected', is_approved: false } : v)); 
        } catch (error) {
          console.error('Rejection failed:', error);
          confirm({ title: 'Error', message: 'Failed to reject vendor.', type: 'danger', hideCancel: true });
        }
      }
    });
  };

  const handleDelete = (id: string, companyName?: string) => { 
    confirm({
      title: 'Delete Vendor',
      message: `Are you sure you want to permanently delete ${companyName || 'this vendor'}? This action cannot be undone.`,
      confirmText: 'Delete Vendor',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.delete(`/api/vendors/${id}`); 
          setVendors(vs => vs.filter(v => v.id !== id)); 
        } catch (error) {
          console.error('Deletion failed:', error);
          confirm({ title: 'Error', message: 'Failed to delete vendor.', type: 'danger', hideCancel: true });
        }
      }
    });
  };
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
    if (key === 'contactPersonFullName') {
      processedValue = value.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
    setCreateForm(prev => ({ ...prev, [key]: processedValue }));
    if (key === 'username') {
      setUsernameError('');
      setUsernameValid(false);
    }
  };

  const handleCreateVendorSubmit = async () => {
    setCreateError('');

    if (!createForm.username || !createForm.email || !createForm.password || !createForm.confirmPassword || !createForm.phone || !createForm.companyName || !createForm.contactPersonFullName) {
      setCreateError('All fields are required.');
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
    const pwStrength = passwordStrength(createForm.password);
    if (pwStrength < 4) {
      setCreateError("Password must be strong (min 8 chars, uppercase, number, special char).");
      return;
    }

    setCreateSaving(true);
    try {
      const contactParts = createForm.contactPersonFullName.trim().split(' ');
      const firstName = contactParts[0] || createForm.companyName;
      const lastName = contactParts.slice(1).join(' ') || '';

      const payload = {
        ...createForm,
        firstName: firstName,
        lastName: lastName,
        contact_person: createForm.contactPersonFullName.trim(),
        services: [] // No services selected during admin creation
      };
      const res = await api.post('/api/admin/vendors/create', payload);
      const newVendor = {
        id: res.data.id,
        uid: res.data.id,
        first_name: firstName,
        last_name: lastName,
        username: createForm.username,
        email: createForm.email,
        phone: createForm.phone,
        company_name: createForm.companyName,
        city: '',
        contact_person: createForm.contactPersonFullName.trim(),
        acc_approve: 'approved',
        is_approved: true,
        temp_delete: 0,
        last_login: null,
        services: []
      };
      setVendors(prev => [newVendor, ...prev]);
      setShowCreateModal(false);
      setCreateForm({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        companyName: '',
        contactPersonFullName: ''
      });

    } catch (err: any) {
      setCreateError(err.response?.data?.message || err.message || 'Failed to create vendor account.');
    } finally {
      setCreateSaving(false);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Service Providers"
        subtitle="Manage registered service vendors and their details."
        icon={<Building2 />}
        action={
          <Button onClick={() => { setShowCreateModal(true); setCreateError(''); }} icon={<Plus className="w-4 h-4" />}>
            Create Vendor
          </Button>
        }
      />

      <DataTable columns={[
        { key: 'company_name', label: 'Company', sortable: true },
        { 
          key: 'contact_person', 
          label: 'Phone Number', 
          sortable: true,
          render: (item: any) => {
            const phone = item.phone || '';
            if (!phone) return <span className="text-xs text-slate-400">—</span>;
            return <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{phone}</span>;
          }
        },
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
              <div className="flex flex-wrap gap-1.5 max-w-[280px]">
                {item.services.map((s: any, i: number) => {
                  const hasSubServices = s.sub_services && Array.isArray(s.sub_services) && s.sub_services.length > 0;
                  return (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setViewServicesVendor({ vendor: item, service: s }); }}
                      className="group inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 cursor-pointer transition-colors hover:bg-brand-navy hover:text-white hover:border-brand-navy dark:hover:bg-brand-green dark:hover:text-slate-900 dark:hover:border-brand-green"
                    >
                      {s.service}
                      {hasSubServices && <span className="ml-1.5 text-[10px] bg-slate-200/80 dark:bg-slate-700 group-hover:bg-white/20 group-hover:text-white dark:group-hover:bg-slate-900/20 dark:group-hover:text-slate-900 px-1.5 rounded font-bold text-slate-600 dark:text-slate-400 transition-colors">{s.sub_services.length}</span>}
                    </button>
                  );
                })}
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
                <Button variant="success" size="sm" onClick={(e: any) => { e.stopPropagation(); handleApprove(item.id, item.company_name); }}>Approve</Button>
                <Button variant="danger" size="sm" onClick={(e: any) => { e.stopPropagation(); handleReject(item.id, item.company_name); }}>Reject</Button>
              </div>
            ) : status === 'approved' ? (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={(e: any) => { e.stopPropagation(); setViewItem(item); }}>View</Button>
                <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white" onClick={(e: any) => { e.stopPropagation(); setEditItem(item); }} icon={<Edit className="w-4 h-4" />}>Edit</Button>
                <Button variant="danger" size="sm" onClick={(e: any) => { e.stopPropagation(); handleDelete(item.id, item.company_name); }} icon={<Trash2 className="w-4 h-4" />}>Delete</Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={(e: any) => { e.stopPropagation(); setViewItem(item); }}>View</Button>
              </div>
            );
          }
        },
      ]} data={vendors} loading={loading} searchPlaceholder="Search vendors..." />
      {editItem && <VendorEditModal vendor={editItem} onSave={handleEditSave} onClose={() => setEditItem(null)} confirm={confirm} />}
      {viewItem && <VendorViewModal vendor={viewItem} onClose={() => setViewItem(null)} onApprove={(id) => { handleApprove(id, viewItem?.company_name); setViewItem(null); }} onReject={(id) => { handleReject(id, viewItem?.company_name); setViewItem(null); }} />}
      
      <ConfirmComponent />

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
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Business / Trade Name</label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          value={createForm.companyName}
                          onChange={(e) => updateCreateForm('companyName', e.target.value.slice(0, 45))}
                          maxLength={45}
                          className="input-base pl-10 text-sm"
                          placeholder="e.g. FixIt Quick Plumbing"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contact Person Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          value={createForm.contactPersonFullName}
                          onChange={(e) => updateCreateForm('contactPersonFullName', e.target.value.slice(0, 60))}
                          maxLength={60}
                          className="input-base pl-10 text-sm"
                          placeholder="e.g. Juan Dela Cruz"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Username</label>
                      <div className="relative flex gap-2">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          value={createForm.username}
                          onChange={(e) => updateCreateForm('username', e.target.value.slice(0, 30).replace(/\s/g, ''))}
                          maxLength={30}
                          onBlur={() => createForm.username && checkUsername(createForm.username)}
                          className="input-base pl-10 text-sm flex-1"
                          placeholder="username"
                        />
                        {usernameCheckLoading && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">Checking...</div>}
                      </div>
                      {usernameError && <p className="text-xs text-brand-red mt-1">{usernameError}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Primary Contact Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          value={createForm.email}
                          onChange={(e) => updateCreateForm('email', e.target.value.slice(0, 35).replace(/\s/g, ''))}
                          maxLength={35}
                          className="input-base pl-10 text-sm"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="tel"
                          value={createForm.phone}
                          onChange={(e) => updateCreateForm('phone', e.target.value.replace(/\D/g, '').slice(0, 11))}
                          className="input-base pl-10 text-sm"
                          placeholder="09XX XXX XXXX"
                        />
                      </div>
                      {createForm.phone && createForm.phone.length !== 11 && (
                        <p className="text-xs text-brand-red mt-1">Phone must be exactly 11 digits</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={createForm.password}
                          onChange={(e) => updateCreateForm('password', e.target.value.replace(/\s/g, ''))}
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
                          onChange={(e) => updateCreateForm('confirmPassword', e.target.value.replace(/\s/g, ''))}
                          className="input-base pl-10 text-sm"
                          placeholder="Re-enter password"
                        />
                      </div>
                      {createForm.confirmPassword && createForm.password !== createForm.confirmPassword && (
                        <p className="text-xs text-brand-red mt-1">Passwords don't match</p>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-6">
                      <Button variant="ghost" className="flex-grow sm:flex-1" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                      <Button
                        variant="success"
                        className="flex-grow sm:flex-1"
                        onClick={handleCreateVendorSubmit}
                        loading={createSaving}
                        disabled={!createForm.companyName || !createForm.username || !usernameValid || !createForm.email || !createForm.password || !createForm.confirmPassword || createForm.phone.length !== 11 || createForm.password !== createForm.confirmPassword || strength < 4}
                        icon={<Plus className="w-4 h-4" />}
                      >
                        Create Vendor
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Services Modal */}
      <AnimatePresence>
        {viewServicesVendor && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setViewServicesVendor(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md" onClick={e => e.stopPropagation()}>
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{viewServicesVendor.service.service} Sub-services</h3>
                    <button onClick={() => setViewServicesVendor(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50 max-h-[60vh] overflow-y-auto">
                    {viewServicesVendor.service.sub_services && viewServicesVendor.service.sub_services.length > 0 ? (
                      <ul className="space-y-2">
                        {viewServicesVendor.service.sub_services.map((sub: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-green flex-shrink-0" />
                            <span>{sub}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-500 text-center py-4">No sub-services listed.</p>
                    )}
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button onClick={() => setViewServicesVendor(null)}>Close</Button>
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
  const [urgentFilterActive, setUrgentFilterActive] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showConfirmPayment, setShowConfirmPayment] = useState(false);
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{ show: boolean; title: string; message: string; type: 'success' | 'danger' | 'info' | 'warning' } | null>(null);

  // Late Cancellation Penalty State
  const [resolutionPenalty, setResolutionPenalty] = useState<string>('');
  const [showPenaltyModal, setShowPenaltyModal] = useState(false);
  const [showFullRefundConfirm, setShowFullRefundConfirm] = useState(false);
  const [showDenyConfirm, setShowDenyConfirm] = useState(false);

  // Add-on Verification State
  const [addonToVerify, setAddonToVerify] = useState<string | null>(null);

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

  const location = useLocation();

  useEffect(() => {
    api.get('/api/bookings')
      .then(r => {
        const fetchedBookings = r.data || [];
        setBookings(fetchedBookings);
        
        if (location.state?.bookingId && fetchedBookings.length > 0) {
          const b = fetchedBookings.find((bk: any) => bk.id === location.state.bookingId || bk.uid === location.state.bookingId);
          if (b) {
            setSelectedBooking(b);
            if (location.state.openAddon) {
               // In AdminDashboard, verification is done per addon. 
               // No specific modal opens automatically by default unless we set it.
               // We just open the booking details.
            }
          }
        }
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [location.state?.bookingId]);

  const statusBadge = (status: string) => {
    const cls: Record<string, string> = {
      pending: 'badge-pending',
      confirmed: 'badge-confirmed',
      in_progress: 'badge-in-progress',
      job_done: 'badge-in-progress bg-blue-100 text-blue-800',
      completed: 'badge-completed',
      cancellation_requested: 'bg-rose-500/10 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-500/20 font-semibold px-2.5 py-1 rounded-xl text-[11px] tracking-wide'
    };
    
    // Standardize text formatting to Title Case
    const formattedStatus = status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    
    return <span className={cls[status] || 'badge'}>{formattedStatus}</span>;
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
      setAlertConfig({ show: true, type: 'success', title: 'Payment Confirmed', message: 'Payment confirmed successfully!' });
    } catch (err: any) {
      setAlertConfig({ show: true, type: 'danger', title: 'Error', message: err.response?.data?.message || 'Failed to confirm payment.' });
    }
  };

  const handleVerifyAddon = async (addonId: string) => {
    try {
      await api.patch(`/api/bookings/${selectedBooking.id}/addons/${addonId}/verify`);
      
      const r = await api.get('/api/bookings');
      setBookings(r.data);
      const updatedBooking = r.data.find((b: any) => b.id === selectedBooking.id);
      if (updatedBooking) setSelectedBooking(updatedBooking);
      
      setAlertConfig({ show: true, type: 'success', title: 'Add-on Verified', message: 'Add-on payment verified successfully!' });
    } catch (err: any) {
      setAlertConfig({ show: true, type: 'danger', title: 'Error', message: err.response?.data?.message || 'Failed to verify add-on.' });
    }
  };

  const handleResolveCancellation = async (action: 'full_refund' | 'penalty' | 'deny') => {
    try {
      const penaltyAmt = action === 'penalty' ? parseFloat(resolutionPenalty) : undefined;
      await api.patch(`/api/bookings/${selectedBooking.id}/resolve-cancellation`, { action, penalty_amount: penaltyAmt });
      setSelectedBooking(null);
      setShowPenaltyModal(false);
      setResolutionPenalty('');
      // Reload bookings
      const r = await api.get('/api/bookings');
      setBookings(r.data);
      setAlertConfig({ show: true, type: 'success', title: 'Resolved', message: 'Cancellation request resolved successfully.' });
    } catch (err: any) {
      setAlertConfig({ show: true, type: 'danger', title: 'Error', message: err.response?.data?.message || 'Failed to resolve.' });
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
      setAlertConfig({ show: true, type: 'success', title: 'Booking Cancelled', message: 'Booking cancelled and refund details linked successfully!' });
    } catch (err: any) {
      setRefundError(err.response?.data?.message || 'Failed to submit refund.');
    } finally {
      setRefundSubmitting(false);
    }
  };

  if (selectedBooking) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
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
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">ID: {selectedBooking.id}</p>
            </div>
          </div>
          <div>
            {statusBadge(selectedBooking.status)}
          </div>
        </div>

        {/* Two column layout: Booking Info & Payment Info */}
        {selectedBooking.status === 'cancellation_requested' && (
          <div className="bg-rose-50 dark:bg-rose-950/20 border-l-4 border-rose-500 p-4 rounded-xl flex items-start gap-3 shadow-sm mb-6">
            <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-rose-900 dark:text-rose-300 font-bold text-sm uppercase tracking-wide">URGENT: Customer Requested Cancellation</h4>
              <p className="text-rose-700 dark:text-rose-400 text-sm mt-1">Specialist <span className="font-bold">{selectedBooking.personnel_name || 'Assigned'}</span> is currently dispatched. Please contact the vendor or specialist to check if they have left for the job yet.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Service Information */}
          <Card className="p-4 sm:p-5 space-y-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm">
            <h4 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest border-b pb-2 border-slate-100 dark:border-slate-800">Service Information</h4>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-400 font-medium">Service Category:</span>
                <span className="col-span-2 text-slate-900 dark:text-white font-semibold">{selectedBooking.sub_service || selectedBooking.service_type}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-400 font-medium">Work Type:</span>
                <span className="col-span-2 text-slate-900 dark:text-white font-semibold">{selectedBooking.service_type}</span>
              </div>
              {selectedBooking.description && (
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-400 font-medium">Description:</span>
                  <span className="col-span-2 text-slate-600 dark:text-slate-350 italic leading-tight">"{selectedBooking.description}"</span>
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
                <span className="col-span-2 text-slate-800 dark:text-slate-200 leading-tight">{selectedBooking.address || selectedBooking.service_address || '—'}</span>
              </div>
            </div>
          </Card>

          {/* Payment Info Card & Additional Charges */}
          <Card className="p-4 sm:p-5 space-y-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm relative">
            <h4 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest border-b pb-2 border-slate-100 dark:border-slate-800">Payment & Pricing</h4>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-3 gap-2 items-center">
                <span className="text-slate-400 font-medium">Unit Price:</span>
                <div className="col-span-2">
                  <span className="text-slate-900 dark:text-white font-semibold">₱{Number(selectedBooking.price || 0).toFixed(2)}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-400 font-medium">Quantity:</span>
                <span className="col-span-2 text-slate-900 dark:text-white font-semibold">{selectedBooking.quantity || 1}</span>
              </div>
              {/* Voucher Discount Info */}
              {selectedBooking.discount_amount > 0 && (
                <>
                  <div className="grid grid-cols-3 gap-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/60">
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
              <div className="grid grid-cols-3 gap-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/60 items-center">
                <span className="text-slate-900 dark:text-white font-black">Total Payment:</span>
                <div className="col-span-2">
                  <span className="text-lg font-black text-brand-green">₱{Number(selectedBooking.total_price || (selectedBooking.price * (selectedBooking.quantity || 1)) || 0).toFixed(2)}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-400 font-medium">Payment Method:</span>
                <span className="col-span-2 text-slate-900 dark:text-white font-semibold">{selectedBooking.payment_method || '—'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-400 font-medium">Reference No:</span>
                <span className="col-span-2 font-mono text-slate-900 dark:text-white font-semibold">{selectedBooking.payment_reference || '—'}</span>
              </div>
              {(selectedBooking.account_name || selectedBooking.account_number) && (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-400 font-medium">Account Name:</span>
                    <span className="col-span-2 text-slate-900 dark:text-white font-semibold">{selectedBooking.account_name || '—'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-400 font-medium">Account Number:</span>
                    <span className="col-span-2 text-slate-900 dark:text-white font-semibold">{selectedBooking.account_number || '—'}</span>
                  </div>
                </>
              )}
              <div className="grid grid-cols-3 gap-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-400 font-medium">Payment Status:</span>
                <span className="col-span-2">
                  {selectedBooking.payment_confirmed ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5 text-sm">
                      <CheckCircle2 className="w-4 h-4" /> Paid
                    </span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1.5 text-sm">
                      <Clock className="w-4 h-4" /> Awaiting Payment
                    </span>
                  )}
                </span>
              </div>
              {(selectedBooking.refund_reference_number || selectedBooking.refund_method) && (
                <div className="mt-3 p-2.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/40 rounded-xl space-y-1 text-xs text-rose-800 dark:text-rose-350">
                  <p className="font-extrabold uppercase tracking-wide mb-1">Linked Refund Information</p>
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

            {/* Additional Charges / Add-ons Section */}
            {selectedBooking.add_ons && selectedBooking.add_ons.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-brand-navy dark:text-blue-400" />
                    Additional Charges / Add-ons
                  </h4>
                </div>
                
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                  {selectedBooking.add_ons.map((addon: any) => (
                    <div key={addon.id} className="p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800 text-[13px] sm:text-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="font-medium text-slate-700 dark:text-slate-300 flex-1 min-w-0 pr-2">
                          {addon.description}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-bold text-slate-900 dark:text-white shrink-0">₱{Number(addon.amount).toFixed(2)}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            {addon.status === 'pending_approval' && <span className="text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider bg-amber-100 text-amber-700 rounded whitespace-nowrap">Pending Customer Approval</span>}
                            {addon.status === 'pending_verification' && <span className="text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider bg-blue-100 text-blue-700 rounded whitespace-nowrap">Pending Admin Verification</span>}
                            {addon.status === 'confirmed' && <span className="text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider bg-emerald-100 text-emerald-700 rounded whitespace-nowrap">Confirmed & Paid</span>}
                            
                            {addon.status === 'pending_verification' && (
                              <Button size="sm" variant="success" className="h-6 text-[10px] py-0.5 px-2 ml-1" onClick={() => setAddonToVerify(addon.id)}>Verify Payment</Button>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {(addon.payment_method || addon.reference_number) && (
                        <div className="mt-1.5 pt-1.5 border-t border-slate-200 dark:border-slate-800/60 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
                          {addon.payment_method && <div><span className="font-medium">Method:</span> <span className="text-slate-700 dark:text-slate-300 font-bold">{addon.payment_method}</span></div>}
                          {addon.reference_number && <div><span className="font-medium">Ref No:</span> <span className="text-slate-700 dark:text-slate-300 font-bold">{addon.reference_number}</span></div>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Action Buttons */}
        {!showRefundForm && !showCancelConfirm && (
          <div className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800/80">
            {selectedBooking.status === 'cancellation_requested' ? (
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button 
                  variant="outline" 
                  className="flex-1 py-3 text-sm font-bold rounded-xl border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30 shadow-none" 
                  onClick={() => setShowFullRefundConfirm(true)}
                >
                  Approve & Full Refund
                </Button>
                <Button 
                  variant="primary" 
                  className="flex-1 py-3 text-sm font-bold rounded-xl bg-brand-navy hover:bg-[#061936] dark:bg-brand-navy dark:hover:bg-[#061936] text-white border-0 shadow-lg shadow-brand-navy/20" 
                  onClick={() => setShowPenaltyModal(true)}
                >
                  Approve with Penalty
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 py-3 text-sm font-bold rounded-xl border-2 border-rose-500 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 shadow-none" 
                  onClick={() => setShowDenyConfirm(true)}
                >
                  Deny Cancellation
                </Button>
              </div>
            ) : (
              <>
                {selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'completed' && selectedBooking.status !== 'job_done' && (
                  <Button
                    variant="outline"
                    className="flex-1 py-3 text-sm font-semibold rounded-xl border-2 !border-rose-500 !text-rose-600 !bg-transparent hover:!bg-rose-50 dark:hover:!bg-rose-950/30 min-w-[120px] transition-colors shadow-none flex items-center justify-center gap-2"
                    onClick={() => {
                      setShowCancelConfirm(true);
                    }}
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>Cancel Booking</span>
                  </Button>
                )}
                {selectedBooking.status === 'job_done' && (
                  <div className="flex-1 text-center py-3 px-4 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 rounded-xl font-bold text-sm border border-blue-200 dark:border-blue-800 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Job Completed by Specialist — Awaiting Customer Verification</span>
                  </div>
                )}
                {!selectedBooking.payment_confirmed && selectedBooking.status !== 'cancelled' && (
                  <Button
                    variant="success"
                    className="flex-grow sm:flex-1 py-3 text-sm font-semibold rounded-xl"
                    onClick={() => setShowConfirmPayment(true)}
                  >
                    Confirm Payment
                  </Button>
                )}
              </>
            )}
          </div>
        )}

        {/* Penalty Modal */}
        <ConfirmModal
          isOpen={showPenaltyModal}
          onClose={() => { setShowPenaltyModal(false); setResolutionPenalty(''); }}
          onConfirm={() => {
            if (!resolutionPenalty || isNaN(parseFloat(resolutionPenalty))) {
              setAlertConfig({ show: true, type: 'danger', title: 'Error', message: 'Please enter a valid penalty amount.' });
              return;
            }
            handleResolveCancellation('penalty');
          }}
          title="Approve Cancellation with Penalty"
          message={
            <div className="space-y-4 text-left">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                The specialist is already en route. Enter the Late Cancellation Fee (₱) to be deducted from the customer's refund and retained.
              </p>
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Late Cancellation Fee (₱)</label>
                <input
                  type="number"
                  value={resolutionPenalty}
                  onChange={(e) => setResolutionPenalty(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-sm font-black focus:outline-none"
                  placeholder="e.g. 500"
                  required
                />
              </div>
            </div>
          }
          confirmText="Confirm Penalty & Cancel"
          cancelText="Back"
          type="warning"
        />

        {/* Full Refund Confirmation Dialog */}
        <ConfirmModal
          isOpen={showFullRefundConfirm}
          onClose={() => setShowFullRefundConfirm(false)}
          onConfirm={() => {
            setShowFullRefundConfirm(false);
            handleResolveCancellation('full_refund');
          }}
          title="Approve & Full Refund"
          message="Are you sure you want to approve this cancellation and issue a full refund? The vendor will not receive any compensation for this booking."
          confirmText="Yes, Issue Full Refund"
          cancelText="Back"
          type="warning"
        />

        {/* Deny Cancellation Confirmation Dialog */}
        <ConfirmModal
          isOpen={showDenyConfirm}
          onClose={() => setShowDenyConfirm(false)}
          onConfirm={() => {
            setShowDenyConfirm(false);
            handleResolveCancellation('deny');
          }}
          title="Deny Cancellation Request"
          message="Are you sure you want to deny this cancellation request? The booking will remain active and the customer will not be refunded."
          confirmText="Yes, Deny Cancellation"
          cancelText="Back"
          type="danger"
        />

        {/* Cancel Confirmation Dialog */}
        <ConfirmModal
          isOpen={showCancelConfirm}
          onClose={() => setShowCancelConfirm(false)}
          onConfirm={() => {
            setShowCancelConfirm(false);
            // Open Refund Form & populate Refund Amount
            const totalAmt = selectedBooking.total_price || (selectedBooking.price * (selectedBooking.quantity || 1)) || '0.00';
            setRefundAmount(String(totalAmt));
            setRefundMethod('GCash');
            setReceiverGcashNumber('');
            setReferenceNumber('');
            setShowRefundForm(true);
          }}
          title="Cancel Booking"
          message="Are you sure you want to cancel this booking?"
          confirmText="Yes, Cancel"
          cancelText="No, Keep Booking"
          type="warning"
        />

        {/* Confirm Payment Dialog */}
        <ConfirmModal
          isOpen={showConfirmPayment}
          onClose={() => setShowConfirmPayment(false)}
          onConfirm={async () => {
            setShowConfirmPayment(false);
            await handleConfirmPayment();
          }}
          title="Confirm Payment"
          message={`Are you sure you want to confirm the payment of ₱${selectedBooking.total_price || (selectedBooking.price * (selectedBooking.quantity || 1)) || '0.00'} for Booking ${selectedBooking.id}?`}
          confirmText="Yes, Confirm"
          cancelText="No, Cancel"
          type="info"
        />

        {/* Verify Add-on Payment Dialog */}
        <ConfirmModal
          isOpen={!!addonToVerify}
          onClose={() => setAddonToVerify(null)}
          onConfirm={() => {
            if (addonToVerify) {
              handleVerifyAddon(addonToVerify);
              setAddonToVerify(null);
            }
          }}
          title="Verify Add-on Payment"
          message="Are you sure you want to verify this additional charge payment? This confirms that the payment has been successfully received."
          confirmText="Yes, Verify Payment"
          cancelText="Cancel"
          type="info"
        />

        {/* Alert Modal */}
        {alertConfig && (
          <ConfirmModal
            isOpen={alertConfig.show}
            onClose={() => setAlertConfig(null)}
            onConfirm={() => setAlertConfig(null)}
            title={alertConfig.title}
            message={alertConfig.message}
            type={alertConfig.type}
            hideCancel={true}
            confirmText="Okay"
          />
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
    <div className="space-y-6">
      <AdminPageHeader
        title="Bookings"
        subtitle="Manage and view all service bookings across the platform."
        icon={<ClipboardList />}
      />

      {bookings.filter(b => b.status === 'cancellation_requested').length > 0 && (
        <div className="bg-white dark:bg-[#021024] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg border border-rose-200 dark:border-rose-900/50">
          <div className="space-y-1">
            <h5 className="text-rose-600 dark:text-rose-500 font-black text-[10px] tracking-widest uppercase">Attention Required</h5>
            <h3 className="text-slate-800 dark:text-white text-lg sm:text-xl font-bold">Late Cancellation Requests</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">There are bookings awaiting your intervention before they can be cancelled.</p>
          </div>
          <button 
            onClick={() => setUrgentFilterActive(!urgentFilterActive)}
            className={`group border rounded-xl p-3 flex items-center gap-4 shadow-sm transition-all duration-200 cursor-pointer outline-none ${
              urgentFilterActive 
                ? 'border-rose-400 dark:border-rose-500 ring-4 ring-rose-500/10 bg-rose-100 dark:bg-rose-900/40' 
                : 'bg-rose-50 dark:bg-slate-800/50 border-rose-100 dark:border-slate-700/50 hover:shadow-md hover:border-rose-300 dark:hover:border-rose-700'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
              urgentFilterActive 
                ? 'bg-rose-500 text-white dark:bg-rose-500 dark:text-white group-hover:bg-rose-600 dark:group-hover:bg-rose-600' 
                : 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'
            }`}>
              {urgentFilterActive ? (
                <>
                  <AlertCircle className="w-5 h-5 group-hover:hidden" />
                  <X className="w-5 h-5 hidden group-hover:block" />
                </>
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
            </div>
            <div className="text-left">
              <p className={`text-[10px] font-bold uppercase tracking-wider ${urgentFilterActive ? 'text-rose-600 dark:text-rose-300' : 'text-slate-500 dark:text-slate-400'}`}>
                {urgentFilterActive ? (
                  <>
                    <span className="group-hover:hidden">Filter Active</span>
                    <span className="hidden group-hover:inline">Clear Filter</span>
                  </>
                ) : 'Filter Urgent'}
              </p>
              <p className={`font-black text-xl leading-none ${urgentFilterActive ? 'text-rose-700 dark:text-rose-200 group-hover:hidden' : 'text-rose-600 dark:text-rose-400'}`}>
                {urgentFilterActive ? (
                  <>
                    <span className="group-hover:hidden">{bookings.filter(b => b.status === 'cancellation_requested').length}</span>
                    <span className="hidden group-hover:inline text-rose-600 dark:text-rose-300 text-sm">Reset</span>
                  </>
                ) : (
                  bookings.filter(b => b.status === 'cancellation_requested').length
                )}
              </p>
            </div>
          </button>
        </div>
      )}

      <DataTable
        columns={[
          { key: 'id', label: 'Booking ID', render: (item: any) => <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{item.id}</span> },
          { key: 'customer_name', label: 'Customer', sortable: true },
          { key: 'vendor_name', label: 'Vendor', sortable: true, render: (item: any) => item.vendor_name || '—' },
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
        data={[...bookings]
          .filter(b => urgentFilterActive ? b.status === 'cancellation_requested' : true)
          .sort((a, b) => {
            if (a.status === 'cancellation_requested' && b.status !== 'cancellation_requested') return -1;
            if (b.status === 'cancellation_requested' && a.status !== 'cancellation_requested') return 1;
            return 0;
          })
        }
        rowClassName={(item: any) => item.status === 'cancellation_requested' ? 'bg-rose-50/50 dark:bg-rose-950/30 hover:bg-rose-100/50 dark:hover:bg-rose-900/40' : ''}
        loading={loading}
        searchPlaceholder="Search bookings..."
      />
    </div>
  );
}

// ─── Payments Tab ───────────────────────────────────────────────────────────
function PaymentsTab() {
  const { confirm, ConfirmComponent } = useConfirm();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/api/payments/pending').then(r => setPayments(r.data)).catch(() => { }).finally(() => setLoading(false)); }, []);
  return (
    <>
      {payments.length === 0 && !loading ? (
        <EmptyState title="No pending payments" description="All payments have been processed." />
      ) : (
        <DataTable columns={[
          { key: 'sub_service', label: 'Service', render: (item: any) => item.sub_service || item.service_type },
          { key: 'payment_reference', label: 'Reference' },
          { key: 'scheduled_date', label: 'Date' },
          {
            key: 'actions', label: 'Actions', render: (item: any) => (
              <div className="flex gap-2">
                <Button variant="success" size="sm" onClick={() => {
                  confirm({
                    title: 'Confirm Payment',
                    message: 'Are you sure you want to confirm this payment?',
                    confirmText: 'Confirm',
                    type: 'success',
                    onConfirm: () => api.patch(`/api/payments/${item.id}/confirm`).then(() => setPayments(ps => ps.filter(p => p.id !== item.id)))
                  });
                }}>Confirm</Button>
                <Button variant="danger" size="sm" onClick={() => {
                  confirm({
                    title: 'Reject Payment',
                    message: 'Are you sure you want to reject this payment?',
                    confirmText: 'Reject',
                    type: 'danger',
                    onConfirm: () => api.patch(`/api/payments/${item.id}/confirm`, { confirmed: false }).then(() => setPayments(ps => ps.filter(p => p.id !== item.id)))
                  });
                }}>Reject</Button>
              </div>
            )
          },
        ]} data={payments} loading={loading} />
      )}
      <ConfirmComponent />
    </>
  );
}

// ─── Refunds Tab ────────────────────────────────────────────────────────────
function RefundsTab() {
  const { confirm, ConfirmComponent } = useConfirm();
  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const loadData = () => { api.get('/api/refunds').then(r => setRefunds(r.data)).catch(() => { }).finally(() => setLoading(false)); };
  useEffect(() => { loadData(); }, []);
  return (
    <>
      <DataTable columns={[
        { key: 'reason', label: 'Reason', sortable: true },
        { key: 'deduction_amount', label: 'Deduction (₱)' },
        { key: 'status', label: 'Status', render: (item: any) => <span className={item.status === 'approved' ? 'badge-completed' : item.status === 'rejected' ? 'badge-cancelled' : 'badge-pending'}>{item.status}</span> },
        {
          key: 'actions', label: 'Actions', render: (item: any) => item.status === 'pending' ? (
            <div className="flex gap-2">
              <Button variant="success" size="sm" onClick={() => confirm({
                title: 'Approve Refund',
                message: 'Are you sure you want to approve this refund?',
                confirmText: 'Approve',
                type: 'success',
                onConfirm: () => api.patch(`/api/refunds/${item.id}/approve`).then(loadData)
              })}>Approve</Button>
              <Button variant="danger" size="sm" onClick={() => confirm({
                title: 'Reject Refund',
                message: 'Are you sure you want to reject this refund?',
                confirmText: 'Reject',
                type: 'danger',
                onConfirm: () => api.patch(`/api/refunds/${item.id}/reject`).then(loadData)
              })}>Reject</Button>
            </div>
          ) : null
        },
      ]} data={refunds} loading={loading} searchPlaceholder="Search refunds..." emptyTitle="No refunds" />
      <ConfirmComponent />
    </>
  );
}

// ─── Support Tab ────────────────────────────────────────────────────────────
function SupportTab() {
  const { confirm, ConfirmComponent } = useConfirm();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('open'); // open, pending_reply, resolved
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  const fetchTickets = () => {
    setLoading(true);
    api.get('/api/support')
      .then(r => setTickets(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleResolve = (ticketId: string) => {
    confirm({
      title: 'Resolve Ticket',
      message: 'Are you sure you want to mark this ticket as resolved? Escrow funds will be settled.',
      type: 'warning',
      confirmText: 'Resolve',
      onConfirm: async () => {
        try {
          await api.patch(`/api/support/${ticketId}/status`, { status: 'resolved' });
          fetchTickets();
          if (selectedTicket?.id === ticketId) {
            setSelectedTicket({ ...selectedTicket, status: 'resolved' });
          }
        } catch (err) {
          confirm({ title: 'Error', message: 'Failed to resolve ticket', type: 'danger', hideCancel: true });
        }
      }
    });
  };

  const handleDelete = (ticketId: string) => {
    confirm({
      title: 'Delete Ticket',
      message: 'Are you sure you want to permanently delete this ticket? This action cannot be undone.',
      type: 'danger',
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          await api.delete(`/api/support/${ticketId}`);
          fetchTickets();
          if (selectedTicket?.id === ticketId) {
            setSelectedTicket(null);
          }
        } catch (err) {
          confirm({ title: 'Error', message: 'Failed to delete ticket', type: 'danger', hideCancel: true });
        }
      }
    });
  };

  const filteredTickets = tickets.filter(t => {
    const matchesStatus = statusFilter === 'all' || (t.status || 'open') === statusFilter;
    const matchesSearch = (t.booking_id || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (t.issue_type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.subject || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 h-[calc(100vh-120px)] flex flex-col">
      <AdminPageHeader
        title="Help & Support Desk"
        subtitle="Manage platform escalations and resolve escrow disputes."
        icon={<LifeBuoy />}
      />

      <div className="flex-1 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm overflow-hidden flex h-full min-h-[600px]">
        {/* Left Pane - Ticket Queue (30%) */}
        <div className="w-1/3 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-900/20">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search Booking ID or Issue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all dark:text-white"
              />
            </div>
            <div className="flex gap-2">
              {['open', 'pending_reply', 'resolved'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all ${
                    statusFilter === status
                      ? 'bg-brand-navy text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-6 h-6 border-2 border-brand-green border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center px-4">
                <LifeBuoy className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-sm font-bold text-slate-500">No tickets found</p>
                <p className="text-xs text-slate-400 mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              filteredTickets.map(ticket => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedTicket?.id === ticket.id
                      ? 'bg-white dark:bg-slate-800 border-brand-navy dark:border-brand-navy shadow-md ring-1 ring-brand-navy/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {ticket.booking_id || 'General'}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${
                      ticket.priority === 'high' ? 'bg-rose-500' : ticket.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{ticket.issue_type || ticket.subject}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{ticket.message || ticket.description}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Pane - Resolution Thread (70%) */}
        <div className="w-2/3 flex flex-col bg-slate-50 dark:bg-slate-950 relative">
          {selectedTicket ? (
            <>
              {/* Context Header */}
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {selectedTicket.customer_name || 'Customer'} vs. {selectedTicket.vendor_name || 'Vendor'}
                  </h3>
                  <div className="flex items-center gap-3 mt-1.5 text-xs font-semibold text-slate-500">
                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{selectedTicket.service_category || 'Service'}</span>
                    <span>Escrow Funds Held: <span className="text-brand-green font-bold text-sm">₱{selectedTicket.escrow_amount || '0.00'}</span></span>
                  </div>
                </div>
                {selectedTicket.status !== 'resolved' && (
                  <Button 
                    onClick={() => handleResolve(selectedTicket.id)}
                    className="bg-brand-green hover:bg-[#005e3f] text-white shadow-sm font-bold"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Resolved
                  </Button>
                )}
              </div>

              {/* Resolution Thread Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-black uppercase text-slate-400">Original Complaint</span>
                    <span className="text-[10px] font-bold text-slate-400">{new Date(selectedTicket.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {selectedTicket.message || selectedTicket.description}
                  </p>
                </div>

                {selectedTicket.status === 'resolved' && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-emerald-800 dark:text-emerald-400">Ticket Resolved & Locked</h4>
                      <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">This escalation has been resolved by the admin. Escrow funds have been settled into production accordingly.</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-200">Select a Ticket</h3>
              <p className="text-sm text-slate-500 mt-2 max-w-sm">Choose a ticket from the queue on the left to view the resolution thread and manage escrow funds.</p>
            </div>
          )}
        </div>
      </div>
    </div>
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
    <div className="space-y-6">
      <AdminPageHeader title="Service Personnel" subtitle="Manage the service personnel assigned by vendors." icon={<UserCog />} />
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
    </div>
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
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
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
  const isSelectedPast = selectedDate ? selectedDate < today : false;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Admin Calendar"
        subtitle="View all scheduled service bookings and availability."
        icon={<CalendarDays />}
      />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-2 space-y-6">
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
              const isPastDate = dateObj < today && !isToday;
              const dateSlots = getSlotsForDate(day);
              const totalAvailable = getTotalAvailableForDate(day);
              const hasSlots = dateSlots.length > 0;

              const isSelected = selectedDate && dateObj.getTime() === selectedDate.getTime();

              return (
                <motion.div
                  key={`day-${day}`}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setSelectedDate(dateObj);
                  }}
                  className={`aspect-square p-2.5 rounded-2xl flex flex-col justify-between cursor-pointer transition-all border relative overflow-hidden select-none ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-500 shadow-md ring-2 ring-blue-400/20'
                      : isPastDate
                        ? 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800/40 opacity-60'
                        : hasSlots
                          ? 'bg-brand-green/10 dark:bg-brand-green/20 border-brand-green/50 border-2 shadow-sm hover:bg-brand-green/20'
                          : isToday
                            ? 'bg-white dark:bg-slate-950 border-blue-200 dark:border-blue-900/50 hover:bg-slate-50 dark:hover:bg-slate-900/60 shadow-sm'
                            : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-sm font-black ${
                      isToday 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : isPastDate 
                          ? 'text-slate-400 dark:text-slate-600' 
                          : 'text-slate-800 dark:text-white'
                    }`}>
                      {day}
                    </span>
                    {isToday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
                    )}
                  </div>

                  {hasSlots && (
                    <div className="mt-auto">
                      <div className={`text-[10px] font-black rounded-md px-1 py-0.5 inline-block max-w-full truncate ${
                        isPastDate 
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-500' 
                          : 'bg-brand-green/20 dark:bg-brand-green/30 text-brand-green dark:text-brand-green'
                      }`}>
                        {totalAvailable} avail
                      </div>
                      <div className={`text-[8px] font-bold mt-0.5 hidden sm:block truncate ${
                        isPastDate ? 'text-slate-400' : 'text-brand-green/80'
                      }`}>
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
        </div>

        <div className="space-y-6">
          {/* Global Calendar Status Overview */}
      <Card className="border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 shadow-sm rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-brand-navy/10 flex items-center justify-center text-brand-navy dark:text-brand-green">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {isSelectedPast ? 'Historical Slot Data' : 'Active System Slots'}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              {isSelectedPast ? 'Past occupancy and capacity metrics' : 'Real-time occupancy and capacity metrics'}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-brand-green rounded-full animate-spin" />
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Fetching slot details...</p>
          </div>
        ) : activeSlotsForSelectedDate.length === 0 ? (
          <EmptyState 
            title={`No active slots registered for ${selectedDate?.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`}
            description="Platform capacity is currently 0." 
            icon={<CalendarDays className="w-6 h-6 text-slate-400" />} 
          />
        ) : (
          <div className="flex flex-col gap-4 max-h-[700px] overflow-y-auto pr-1">
            {activeSlotsForSelectedDate.map((s, i) => {
              const avail = s.available_slots !== undefined && s.available_slots !== null ? s.available_slots : s.total_slots;
              const total = s.total_slots !== undefined && s.total_slots !== null ? s.total_slots : 0;
              const safeAvail = Math.max(0, avail);
              const safeTotal = Math.max(0, total);
              const booked = safeTotal - safeAvail;
              const percentBooked = safeTotal > 0 ? (booked / safeTotal) * 100 : 0;
              const vName = getVendorName(s.vendor_id);

              let badgeClass = '';
              let badgeText = '';

              if (isSelectedPast) {
                badgeClass = 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/40 dark:border-slate-700';
                badgeText = booked > 0 ? `${booked}/${safeTotal} Filled` : `${safeAvail}/${safeTotal} Unfilled (Expired)`;
              } else {
                badgeClass = booked >= safeTotal 
                  ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200/40' 
                  : booked > 0
                    ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200/40'
                    : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200/40';
                badgeText = `${booked}/${safeTotal} Booked`;
              }

              return (
                <div key={i} className={`p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col justify-between hover:shadow-sm transition-all duration-200 ${isSelectedPast ? 'opacity-75 grayscale-[0.2]' : ''}`}>
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <span className="text-xs bg-brand-navy/10 text-brand-navy dark:bg-brand-green/20 dark:text-brand-green px-2 py-0.5 rounded font-black text-[10px] uppercase tracking-wider">{vName}</span>
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">{s.service_type} - {s.sub_service || 'General'}</h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{s.slot_date} at {s.time_from} - {s.time_to}</span>
                      </div>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-lg font-black shrink-0 ${badgeClass}`}>
                      {badgeText}
                    </span>
                  </div>

                  <div className="mt-3.5">
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          isSelectedPast
                            ? 'bg-slate-400 dark:bg-slate-600'
                            : percentBooked >= 100 
                              ? 'bg-rose-500' 
                              : percentBooked >= 50 
                                ? 'bg-amber-500' 
                                : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percentBooked}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
        </div>
      </div>

      {/* Date Details Modal Removed as Sidebar handles it now */}
    </div>
  );
}

function ReviewsPage() {
  const { confirm, ConfirmComponent } = useConfirm();
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
      confirm({ title: 'Error', message: 'Failed to update featured status', type: 'danger', hideCancel: true });
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
      <AdminPageHeader
        title="Customer Reviews & Testimonials"
        subtitle="Monitor ratings, customer feedback, and select reviews to feature on the website's Client Stories."
        icon={<Star />}
      />

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

        {/* Floating Top Left Tag */}
        <div className="absolute top-4 left-4 z-20">
          <div className="text-[10px] font-black tracking-wider uppercase px-3 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-md text-white shadow-sm border border-white/10">
            {service.brand}
          </div>
        </div>

        {/* Floating Top Right Actions */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditClick(service);
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-900/60 hover:bg-slate-900/80 text-white transition-all border border-white/10 backdrop-blur-md shadow-sm"
            title="Edit Service"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-sm">
            <Icon style={{ width: '16px', height: '16px', color: '#fff' }} />
          </div>
        </div>
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

      {/* Body */}
      <div className="p-6 sm:p-7 flex flex-col flex-grow bg-white dark:bg-slate-900 relative z-30">
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
  const { confirm, ConfirmComponent } = useConfirm();
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
          if (!merged.find(m => m.id.toLowerCase() === fs.id.toLowerCase() || m.brand.toLowerCase() === fs.brand.toLowerCase())) {
            merged.push(fs);
          }
        });

        const desiredOrder = [
          'coolfix', 'sanifix', 'homefix', 'techfix', 'movefix', 
          'spacefix', 'poolfix', 'healthfix', 'greenfix'
        ];
        merged.sort((a, b) => {
          const brandA = (a.brand || '').toLowerCase();
          const brandB = (b.brand || '').toLowerCase();
          const indexA = desiredOrder.indexOf(brandA);
          const indexB = desiredOrder.indexOf(brandB);
          return (indexA !== -1 ? indexA : 999) - (indexB !== -1 ? indexB : 999);
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
  const handleApproveMain = (id: string, name?: string) => {
    confirm({
      title: 'Approve Service Request',
      message: `Are you sure you want to approve the service request for ${name || 'this service'}?`,
      confirmText: 'Approve',
      type: 'success',
      onConfirm: async () => {
        try {
          await api.post(`/api/services/requests/main-service/${id}/approve`);
          fetchPendingRequests();
          loadServices();
        } catch (e) {
          console.error(e);
          confirm({ title: 'Error', message: 'Failed to approve request.', type: 'danger', hideCancel: true });
        }
      }
    });
  };

  const handleRejectMain = (id: string, name?: string) => {
    confirm({
      title: 'Reject Service Request',
      message: `Are you sure you want to reject the service request for ${name || 'this service'}?`,
      confirmText: 'Reject',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.post(`/api/services/requests/main-service/${id}/reject`);
          fetchPendingRequests();
        } catch (e) {
          console.error(e);
          confirm({ title: 'Error', message: 'Failed to reject request.', type: 'danger', hideCancel: true });
        }
      }
    });
  };

  const handleApproveSub = (id: string, name?: string) => {
    confirm({
      title: 'Approve Sub-service Request',
      message: `Are you sure you want to approve the sub-service request for ${name || 'this sub-service'}?`,
      confirmText: 'Approve',
      type: 'success',
      onConfirm: async () => {
        try {
          await api.post(`/api/services/requests/sub-service/${id}/approve`);
          fetchPendingRequests();
          loadServices();
        } catch (e) {
          console.error(e);
          confirm({ title: 'Error', message: 'Failed to approve request.', type: 'danger', hideCancel: true });
        }
      }
    });
  };

  const handleRejectSub = (id: string, name?: string) => {
    confirm({
      title: 'Reject Sub-service Request',
      message: `Are you sure you want to reject the sub-service request for ${name || 'this sub-service'}?`,
      confirmText: 'Reject',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.post(`/api/services/requests/sub-service/${id}/reject`);
          fetchPendingRequests();
        } catch (e) {
          console.error(e);
          confirm({ title: 'Error', message: 'Failed to reject request.', type: 'danger', hideCancel: true });
        }
      }
    });
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
    confirm({
      title: 'Reject Work Type Request',
      message: 'Are you sure you want to reject this work type request?',
      confirmText: 'Reject',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.post(`/api/services/requests/work-type/${id}/reject`);
          fetchPendingRequests();
        } catch (e) {
          console.error(e);
        }
      }
    });
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
      <AdminPageHeader
        title="Service Management"
        subtitle="Overview of service categories, active brands, and subservices available on the platform."
        icon={<Wrench />}
        action={
          activeTab === 'catalog' ? (
            <Button onClick={() => { setServiceToEdit(null); setShowAddModal(true); }} icon={<Plus className="w-4 h-4" />}>
              Add Service
            </Button>
          ) : null
        }
      />

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

      <ConfirmComponent />
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
      <AdminPageHeader
        title="Admin Transactions"
        subtitle="Track completed services, system fee deductions, and service partner earnings."
        icon={<ArrowRightLeft />}
      />

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
      <AdminPageHeader
        title="Payout Management"
        subtitle="Track GCash or Bank payout logs and receipts for service providers."
        icon={<CreditCard />}
      />

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
  const { confirm, ConfirmComponent } = useConfirm();
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

  const handleDelete = (id: string) => {
    confirm({
      title: 'Delete Voucher',
      message: 'Are you sure you want to permanently delete this voucher?',
      confirmText: 'Delete',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.delete(`/api/vouchers/${id}`);
          setVouchers(prev => prev.filter(v => v.id !== id));
        } catch (err) {
          console.error('Failed to delete voucher', err);
        }
      }
    });
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
      <AdminPageHeader
        title="Promotional Vouchers"
        subtitle="Create, assign, and manage promotional discount vouchers for active customers."
        icon={<Ticket />}
        action={
          <Button onClick={() => { setShowCreateModal(true); setError(''); }} icon={<Plus className="w-4 h-4" />}>
            Create Voucher
          </Button>
        }
      />

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
      <ConfirmComponent />
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
      <AdminPageHeader
        title="Assigned Vouchers Tracker"
        subtitle="Monitor and track the usage of vouchers assigned to specific customer accounts."
        icon={<Tag />}
      />

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
  const { confirm, ConfirmComponent } = useConfirm();
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
  
  const [alertConfig, setAlertConfig] = useState<{isOpen: boolean, title: string, message: string, type: 'success' | 'danger'}>({ isOpen: false, title: '', message: '', type: 'success' });
  const showAlert = (message: string, type: 'success' | 'danger' = 'success') => {
    setAlertConfig({ isOpen: true, title: type === 'success' ? 'Success' : 'Error', message, type });
  };

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

    const processType = isProcessingExisting ? 'Process' : 'Create';

    confirm({
      title: `Confirm ${processType} Refund`,
      message: `Are you sure you want to ${processType.toLowerCase()} this refund? Please double check the deduction amount and reference numbers. This action cannot be undone.`,
      confirmText: `Yes, ${processType} Refund`,
      type: 'warning',
      onConfirm: async () => {
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
            showAlert('Refund approved and details recorded successfully!');
          } else {
            if (!selectedBookingId) {
              setError('Please select a booking.');
              setSubmitting(false);
              return;
            }
            await api.post('/api/refunds/direct', payload);
            console.log('[CAVEMAN] RefundsPage: Direct refund creation successful');
            showAlert('Direct refund created and processed successfully!');
          }

          setShowModal(false);
          loadData();
        } catch (err: any) {
          console.error('[CAVEMAN] RefundsPage: Submission failed', err);
          setError(err.response?.data?.message || 'Failed to submit refund details. Please check the inputs.');
        } finally {
          setSubmitting(false);
        }
      }
    });
  };

  const handleReject = (refundId: string) => {
    if (!rejectionDetails.trim()) {
      setError('Please provide a reason for rejection.');
      return;
    }
    confirm({
      title: 'Reject Refund Request',
      message: 'Are you sure you want to reject this refund request?',
      confirmText: 'Reject',
      type: 'danger',
      onConfirm: async () => {
        console.log('[CAVEMAN] RefundsPage: Rejecting refund request ID:', refundId, 'Reason:', rejectionDetails.trim());
        setSubmitting(true);
        try {
          await api.patch(`/api/refunds/${refundId}/reject`, { rejection_reason: rejectionDetails.trim() });
          console.log('[CAVEMAN] RefundsPage: Reject refund request successful');
          showAlert('Refund request rejected successfully!', 'success');
          setShowModal(false);
          loadData();
        } catch (err: any) {
          console.error('[CAVEMAN] RefundsPage: Reject failed', err);
          showAlert(err.response?.data?.message || 'Failed to reject refund request.', 'danger');
        } finally {
          setSubmitting(false);
        }
      }
    });
  };

  const handleQuickApprove = (refund: any) => {
    confirm({
      title: 'Approve Refund',
      message: `Approve this vendor-cancelled refund of ₱${Number(refund.refund_amount || 0).toFixed(2)} for ${refund.customer_name}? This will mark the refund as processed.`,
      confirmText: 'Approve',
      type: 'success',
      onConfirm: async () => {
        console.log('[CAVEMAN] RefundsPage: Quick-approving vendor-cancelled refund ID:', refund.id);
        try {
          await api.patch(`/api/refunds/${refund.id}/approve`, {
            cancelled_by: refund.cancelled_by || 'vendor',
            status_at_cancellation: refund.status_at_cancellation || '',
          });
          console.log('[CAVEMAN] RefundsPage: Quick approve successful for vendor-cancelled refund');
          showAlert('Vendor-cancelled refund approved and marked as processed!');
          loadData();
        } catch (err: any) {
          console.error('[CAVEMAN] RefundsPage: Quick approve failed', err);
          showAlert(err.response?.data?.message || 'Failed to process vendor-cancelled refund.', 'danger');
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Refund Management"
        subtitle="Create direct booking refunds or process customer-initiated cancellation refund requests."
        icon={<RefreshCcw />}
        action={
          <Button onClick={handleOpenCreate} icon={<Plus className="w-4 h-4" />}>
            Create Refund
          </Button>
        }
      />

      <Card>
        <div className="p-6">
          <DataTable
            columns={[
              { key: 'created_at', label: 'Date Requested', sortable: true, render: (item: any) => {
                let parsedDate = null;
                if (item.created_at) {
                  if (Array.isArray(item.created_at)) {
                    const [y, m, d, h = 0, min = 0, s = 0] = item.created_at;
                    parsedDate = new Date(y, m - 1, d, h, min, s);
                  } else {
                    parsedDate = new Date(item.created_at);
                  }
                }
                const formatted = parsedDate && !isNaN(parsedDate.getTime())
                  ? parsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : '—';
                return (
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
                    {formatted}
                  </span>
                );
              }},
              { key: 'id', label: 'Refund ID', sortable: true, render: (item: any) => <span className="font-mono text-xs font-semibold text-slate-500">{item.id?.substring(0, 8)}...</span> },
              { key: 'booking_id', label: 'Booking ID', sortable: true, render: (item: any) => (
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-semibold text-slate-850 dark:text-white">{formatBookingId(item.booking_id)}</span>
                  {item.is_automatic_expiration && (
                    <span className="text-rose-500 cursor-help flex items-center justify-center w-4 h-4 rounded-full bg-rose-500/10 border border-rose-500/20 text-[10px] font-bold" title="Missed Deadline">
                      !
                    </span>
                  )}
                </div>
              ) },
              { key: 'customer_name', label: 'Customer Name', sortable: true, render: (item: any) => <span className="font-bold text-slate-800 dark:text-white">{item.customer_name}</span> },
              { key: 'refund_amount', label: 'Refund Amount', sortable: true, render: (item: any) => <span className="font-black text-brand-green">₱{Number(item.refund_amount || 0).toFixed(2)}</span> },
              { key: 'context', label: 'Context', render: (item: any) => {
                const cb = item.cancelled_by || '—';
                const formattedCb = cb === '—' ? 'Unknown' : cb.charAt(0).toUpperCase() + cb.slice(1).toLowerCase();
                let reasonText = item.reason || 'Customer Requested';
                if (item.is_automatic_expiration) reasonText = 'Automatic Expiration';
                
                // Truncate to 25 chars and enforce Sentence case
                let formattedReason = reasonText.charAt(0).toUpperCase() + reasonText.slice(1).toLowerCase();
                if (formattedReason.length > 25) {
                  formattedReason = formattedReason.substring(0, 25) + '...';
                }
                
                return (
                  <div className="flex flex-col max-w-[200px]">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400" title={`${formattedCb} - ${item.reason || 'Customer Requested'}`}>
                      <span className="font-bold text-slate-900 dark:text-white">{formattedCb}</span> - {formattedReason}
                    </span>
                  </div>
                );
              } },
              {
                key: 'status',
                label: 'Status',
                sortable: true,
                render: (item: any) => {
                  const status = (item.status || 'pending').toLowerCase();
                  let colorClass = 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20'; // pending
                  if (status === 'processed' || status === 'approved') {
                    colorClass = 'bg-slate-500/10 text-slate-600 border border-slate-500/20'; // processed
                  } else if (status === 'rejected') {
                    colorClass = 'bg-rose-500/10 text-rose-600 border border-rose-500/20'; // rejected
                  }
                  
                  return (
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${colorClass}`}>
                      {status === 'approved' ? 'PROCESSED' : status.toUpperCase()}
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
                      <button 
                        onClick={() => handleOpenProcess(item)}
                        className="text-xs font-bold text-brand-green hover:text-emerald-700 transition-colors flex items-center gap-1 group"
                      >
                        Review <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                      </button>
                    );
                  }
                  return <span className="text-xs text-slate-400">—</span>;
                }
              }
            ]}
            data={[...refunds].sort((a, b) => {
              const parseDt = (val: any) => {
                if (!val) return 0;
                if (Array.isArray(val)) return new Date(val[0], val[1] - 1, val[2], val[3] || 0, val[4] || 0, val[5] || 0).getTime();
                const d = new Date(val);
                return isNaN(d.getTime()) ? 0 : d.getTime();
              };
              return parseDt(a.created_at) - parseDt(b.created_at);
            })}
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
              className="w-full max-w-2xl"
              onClick={e => e.stopPropagation()}
            >
              <Card className="p-5 sm:p-6 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-xl space-y-4 sm:space-y-5">
                <div className="flex items-center justify-between border-b pb-3 sm:pb-4 border-slate-100 dark:border-slate-800">
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

                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                  {!isProcessingExisting ? (
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Select Booking *</label>
                      <select
                        value={selectedBookingId}
                        onChange={e => setSelectedBookingId(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-navy"
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
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Booking ID</label>
                        <div className="w-full px-3 py-2 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-500 dark:text-slate-400 text-xs font-semibold">
                          {selectedBookingId || '—'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Customer Name</label>
                        <div className="w-full px-3 py-2 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-500 dark:text-slate-400 text-xs font-bold">
                          {customerName || '—'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Cancelled By</label>
                        <div className="w-full px-3 py-2 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-500 dark:text-slate-400 text-xs font-bold">
                          {cancelledBy ? cancelledBy.charAt(0).toUpperCase() + cancelledBy.slice(1).toLowerCase() : '—'}
                        </div>
                      </div>
                    </div>
                  )}

                  {!isProcessingExisting && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Customer Name</label>
                        <div className="w-full px-3 py-2 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-500 dark:text-slate-400 text-xs font-bold">
                          {customerName || '—'}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Refund Amount (₱)</label>
                        <input
                          type="text"
                          value={refundAmount ? `₱${Number(refundAmount).toFixed(2)}` : '₱0.00'}
                          readOnly
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-brand-green text-xs font-black focus:outline-none"
                          placeholder="₱0.00"
                        />
                      </div>
                    </div>
                  )}

                  {isProcessingExisting && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
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
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-navy"
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
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-rose-500 text-xs sm:text-sm font-black focus:outline-none"
                          />
                        </div>
                      </div>
                      
                      <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex flex-col justify-center space-y-1.5 sm:space-y-2 h-full">
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Refund Breakdown</p>
                        <div className="flex justify-between text-xs font-semibold text-slate-650 dark:text-slate-350">
                          <span>Original Price:</span>
                          <span>₱{totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs font-semibold text-rose-500">
                          <span>Deductions Applied:</span>
                          <span>- ₱{(totalPrice * (deductionPercentage / 100)).toFixed(2)} ({deductionPercentage}%)</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-brand-green border-t border-dashed border-slate-200 dark:border-slate-700 pt-1.5 mt-1">
                          <span>Final Refund Amount:</span>
                          <span>₱{Number(refundAmount).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Reference Number *</label>
                      <input
                        type="text"
                        value={referenceNumber}
                        onChange={e => setReferenceNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy placeholder:text-slate-400 font-bold"
                        placeholder="Reference #"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Account Number *</label>
                      <input
                        type="text"
                        value={accountNumber}
                        onChange={e => setAccountNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy placeholder:text-slate-400 font-bold"
                        placeholder="Account #"
                        required
                      />
                    </div>
                  </div>

                  {/* Proof of Refund Image File Input & Rejection side-by-side if rejecting */}
                  <div className={`grid gap-3 ${isProcessingExisting ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                        Proof of Refund Image (Optional)
                      </label>
                      <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-350 dark:border-slate-700 rounded-2xl p-2.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer relative group h-24">
                        {uploadingImage ? (
                          <div className="text-[10px] text-slate-500 font-bold animate-pulse">Uploading...</div>
                        ) : proofImageUrl ? (
                          <div className="relative w-full h-full rounded-xl overflow-hidden">
                            <img src={proofImageUrl} alt="Proof" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setProofImageUrl('');
                              }}
                              className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-black text-white rounded-lg transition-colors z-10"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 mb-1">
                              <Plus className="w-4 h-4" />
                            </div>
                            <p className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 text-center px-2">
                              Upload receipt image
                            </p>
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
                          Rejection Details (Required if Rejecting)
                        </label>
                        <textarea
                          value={rejectionDetails}
                          onChange={e => setRejectionDetails(e.target.value)}
                          className="w-full h-24 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-navy placeholder:text-slate-400 resize-none"
                          placeholder="Reason for rejection..."
                        />
                      </div>
                    )}
                  </div>

                  {(() => {
                    const showRejectButton = isProcessingExisting;

                    return (
                      <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        {showRejectButton && (
                          <button
                            type="button"
                            onClick={() => handleReject(selectedRefundId!)}
                            disabled={submitting}
                            className="flex-1 py-2 text-sm font-bold text-rose-500 bg-white border border-rose-500 rounded-xl hover:bg-rose-50 transition-colors disabled:opacity-50"
                          >
                            Reject Refund
                          </button>
                        )}
                        <Button
                          variant="success"
                          className="flex-1 py-2 text-sm"
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

      <ConfirmModal
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        hideCancel={true}
        confirmText="OK"
      />
      <ConfirmComponent />
    </div>
  );
}

function PaymentsPage() {
  const { confirm, ConfirmComponent } = useConfirm();
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

  const handleDelete = (id: string) => {
    confirm({
      title: 'Delete Payment Method',
      message: 'Are you sure you want to delete this payment method?',
      confirmText: 'Delete',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.delete(`/api/payments/methods/${id}`);
          setPaymentMethods(prev => prev.filter(pm => pm.id !== id));
        } catch (err) {
          console.error('Failed to delete payment method', err);
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Payment Methods"
        subtitle="Configure available payment gateways and details for checkout."
        icon={<Wallet />}
        action={
          <Button onClick={() => { setShowCreateModal(true); setError(''); }} icon={<Plus className="w-4 h-4" />}>
            Add Payment Method
          </Button>
        }
      />

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

// ─── Admin Profile Tab ──────────────────────────────────────────────────────────
function AdminProfileTab() {
  const { profile } = useAuth();
  const { confirm: showAlert, ConfirmComponent } = useConfirm();
  
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);

  if (!profile) return <EmptyState title="Profile not loaded" />;

  const btnBase = "inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 w-full sm:w-auto";
  const btnGhost = `${btnBase} text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 focus:ring-slate-900 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-700`;

  const EditButton = ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick} className={btnGhost}>
      <Edit className="w-4 h-4 shrink-0" /> Edit
    </button>
  );

  return (
    <div className="space-y-3 h-full flex flex-col">
      <AdminPageHeader
        title="Admin Profile"
        subtitle="Manage your administrative credentials, 2FA security, and access controls."
        icon={<ShieldCheck />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-stretch flex-1 pb-2">
        {/* ─── LEFT COLUMN ─── */}
        <div className="lg:col-span-1 flex flex-col gap-3">
          <Card className="flex flex-col items-center justify-center text-center p-4">
            <div className="relative group mb-4">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-slate-800 shadow-lg overflow-hidden bg-brand-navy dark:bg-slate-700 flex items-center justify-center">
                <ShieldCheck className="w-12 h-12 text-white opacity-80" />
              </div>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white break-words w-full">
              {profile.first_name} {profile.last_name}
            </h2>
            <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 truncate w-full mb-3">
              {profile.email}
            </p>
            <div className="w-full">
               <span className="inline-block px-3 py-1 bg-brand-navy/10 text-brand-navy font-bold text-xs rounded-full border border-brand-navy/20 dark:bg-brand-navy dark:text-white dark:border-brand-navy/50">
                 Platform Administrator
               </span>
            </div>
          </Card>

          <Card className="p-4 flex flex-col flex-1">
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white mb-3">Account Security</h2>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Password</span>
                  <span className="text-xs text-slate-500">••••••••••••</span>
                </div>
                <EditButton onClick={() => showAlert({ title: 'Account Security', message: 'Password reset functionality to be integrated.', type: 'info', hideCancel: true })} />
              </div>
            </div>
          </Card>
        </div>

        {/* ─── RIGHT COLUMN ─── */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          {/* 2FA Security Card */}
          <Card className="flex flex-col p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-brand-green dark:text-emerald-400 flex items-center gap-2">
                 <Lock className="w-4 h-4" /> Two-Factor Authentication
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-5 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">
               <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Authenticator App</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">Use an authenticator app (like Google Authenticator or Authy) to generate one time security codes.</p>
               </div>
               <div className="flex items-center gap-3">
                 <span className={`text-xs font-bold ${is2FAEnabled ? 'text-brand-green' : 'text-slate-400'}`}>
                   {is2FAEnabled ? 'ENABLED' : 'DISABLED'}
                 </span>
                 <button 
                    onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${is2FAEnabled ? 'bg-brand-green' : 'bg-slate-300 dark:bg-slate-600'}`}
                 >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${is2FAEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                 </button>
               </div>
            </div>
          </Card>

          {/* Access Level Card */}
          <Card className="flex flex-col p-4 flex-1">
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white mb-3">Permission Tier</h2>
            <div className="space-y-3 flex-1 flex flex-col justify-center items-center text-center py-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <ShieldCheck className="w-10 h-10 text-brand-navy dark:text-slate-500 mb-2" />
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Super Admin Access</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">You have unrestricted read/write access to all platform modules, including Escrow Payouts, Vendor Approvals, and System Configurations.</p>
            </div>
          </Card>
        </div>
      </div>
      <ConfirmComponent />
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
            <Route path="profile" element={<AdminProfileTab />} />
            <Route path="support" element={<SupportTab />} />
            <Route path="reviews" element={<ReviewsPage />} />
            {/* People */}
            <Route path="customers" element={<CustomersTab />} />
            <Route path="vendors" element={<VendorsTab />} />
            <Route path="personnel" element={<PersonnelTab />} />
            <Route path="vendors-management" element={<VendorsManagementPage />} />
            <Route path="notifications" element={<NotificationsTab />} />
            {/* Operations */}
            <Route path="bookings" element={<BookingsTab />} />
            <Route path="services" element={<ServicesManagementPage />} />
            <Route path="area-services" element={<AreaServiceManager />} />
            <Route path="partner-logos" element={<PartnerLogosManager />} />
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
