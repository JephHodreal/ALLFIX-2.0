import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ClipboardList, TrendingUp, CalendarDays, UserCog, Edit, Trash2, Users, X, Mail, User, Lock, Eye, EyeOff, Check, Plus, AlertCircle, Phone, Wrench, ArrowRight, ArrowLeft, CreditCard, UserCheck, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '../components/shared/Sidebar';
import { Header } from '../components/shared/Header';
import { Card, StatCard } from '../components/shared/Card';
import { DataTable } from '../components/shared/DataTable';
import { EmptyState } from '../components/shared/EmptyState';
import { Button } from '../components/shared/Button';
import { EditModal } from '../components/shared/EditModal';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/apiService';
import { LineChart } from '../components/shared/LineChart';

/**
 * Filters the vendor's profile services list against active database services.
 * Keeps only services and subservices that exist in the database, matching exact database casing.
 */
export function getFilteredVendorServices(vendorServices: any[], dbServices: any[]): any[] {
  if (!dbServices || dbServices.length === 0) return [];

  return vendorServices
    .map((svc: any) => {
      // Find matching service in database (case-insensitive)
      const dbMatch = dbServices.find(
        (db: any) => db.name.toLowerCase() === svc.service.toLowerCase()
      );
      if (!dbMatch) return null;

      // Filter subservices: must exist in both vendor profile and database (case-insensitive)
      const dbSubNames = (dbMatch.subServices || []).map((sub: any) => (sub.name || sub).toLowerCase());
      const validSubServices = (svc.sub_services || []).filter((subName: string) =>
        dbSubNames.includes(subName.toLowerCase())
      );

      // Map back to database-defined casing/name
      const displaySubServices = validSubServices.map((subName: string) => {
        const matchedDbSub = (dbMatch.subServices || []).find(
          (dbSub: any) => (dbSub.name || dbSub).toLowerCase() === subName.toLowerCase()
        );
        return matchedDbSub ? (matchedDbSub.name || matchedDbSub) : subName;
      });

      return {
        ...svc,
        service: dbMatch.name, // Database casing
        sub_services: displaySubServices, // Filtered and database-cased subservices
        dbDescription: dbMatch.description || '',
      };
    })
    .filter(Boolean);
}

/**
 * Safely formats a Date object to YYYY-MM-DD in the local timezone.
 * Avoids any UTC / toISOString timezone shifting.
 */
function formatLocalYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const formatted = `${year}-${month}-${day}`;
  console.log('[CAVEMAN] formatLocalYYYYMMDD: input dateObj =', date.toString(), '| output localDateString =', formatted);
  return formatted;
}

function VendorHome() {
  const { profile } = useAuth();
  const { isDark } = useTheme();
  const [personnelCount, setPersonnelCount] = useState(0);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (profile?.id) {
          const [persRes, statsRes] = await Promise.all([
            api.get(`/api/vendors/${profile.id}/personnels`),
            api.get(`/api/vendors/${profile.id}/dashboard-stats`)
          ]);
          setPersonnelCount(persRes.data?.length ?? 0);
          setStats(statsRes.data);
        }
      } catch (error) {
        console.error('Failed to fetch vendor dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [profile?.id]);

  useEffect(() => {
    console.log("[CAVEMAN] VendorHome UI adjustment check - isDark:", isDark, "Completion Rate line color:", isDark ? '#60a5fa' : '#041e41');
  }, [isDark]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {Array(3).fill(0).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
      </div>
    );
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Jobs" value={stats?.totalJobs ?? 0} icon={<ClipboardList className="w-5 h-5" />} color="navy" />
        <StatCard title="Total Income" value={formatCurrency(stats?.totalIncome ?? 0)} icon={<CreditCard className="w-5 h-5" />} color="green" />
        <StatCard title="Personnels" value={personnelCount} icon={<Users className="w-5 h-5" />} color="navy" />
      </div>

      {/* Graphs */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Total Income Trend</h3>
          <LineChart
            data={stats?.incomeTrend ?? []}
            xKey="week"
            lines={[{ dataKey: 'income', color: '#20b759', name: 'Income (₱)' }]}
          />
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Completion Rate Trend</h3>
          <LineChart
            data={stats?.completionTrend ?? []}
            xKey="week"
            lines={[{ dataKey: 'rate', color: isDark ? '#60a5fa' : '#041e41', name: 'Completion Rate (%)' }]}
          />
        </Card>
      </div>
    </div>
  );
}

function VendorBookings() {
  const { profile } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [showAssignPersonnelModal, setShowAssignPersonnelModal] = useState(false);

  // Refund Form State
  const [refundAmount, setRefundAmount] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [refundMethod, setRefundMethod] = useState('GCash');
  const [receiverGcashNumber, setReceiverGcashNumber] = useState('');
  const [refundSubmitting, setRefundSubmitting] = useState(false);
  const [refundError, setRefundError] = useState('');

  // Cancellation Reason Form State
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [cancelError, setCancelError] = useState('');

  // Personnel List State
  const [personnel, setPersonnel] = useState<any[]>([]);
  const [assigningLoading, setAssigningLoading] = useState(false);
  const [showAllPersonnel, setShowAllPersonnel] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      setLoading(true);
      api.get(`/api/bookings/vendor/${profile.id}`)
        .then(r => setBookings(r.data || []))
        .catch(() => { })
        .finally(() => setLoading(false));

      api.get(`/api/personnel?vendor_id=${profile.id}`)
        .then(r => setPersonnel(r.data || []))
        .catch(() => { });
    } else {
      setLoading(false);
    }
  }, [profile]);

  // [CAVEMAN] Compute set of personnel IDs who are actively assigned (in_progress bookings)
  // These personnel must be excluded from the assign-personnel list
  const activePersonnelIds = new Set(
    bookings
      .filter((b: any) => b.status === 'in_progress' && b.personnel_id)
      .map((b: any) => b.personnel_id)
  );
  console.log('[CAVEMAN] activePersonnelIds (busy personnel):', Array.from(activePersonnelIds));

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

  const handleAssignPersonnelSubmit = async (personnelId: string) => {
    setAssigningLoading(true);
    try {
      await api.patch(`/api/bookings/${selectedBooking.id}/assign-personnel`, {
        personnel_id: personnelId,
      });

      // Update selected booking in state
      setSelectedBooking((prev: any) => ({
        ...prev,
        status: 'in_progress',
        personnel_id: personnelId,
      }));

      // Update bookings list
      setBookings((prevList: any[]) =>
        prevList.map((b: any) =>
          b.id === selectedBooking.id
            ? { ...b, status: 'in_progress', personnel_id: personnelId }
            : b
        )
      );

      setShowAssignPersonnelModal(false);
      alert('Personnel assigned successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to assign personnel.');
    } finally {
      setAssigningLoading(false);
    }
  };

  const handleCompleteBooking = async () => {
    try {
      await api.patch(`/api/bookings/${selectedBooking.id}/complete`);

      // Update selected booking in state
      setSelectedBooking((prev: any) => ({
        ...prev,
        status: 'completed',
      }));

      // Update bookings list
      setBookings((prevList: any[]) =>
        prevList.map((b: any) =>
          b.id === selectedBooking.id
            ? { ...b, status: 'completed' }
            : b
        )
      );

      alert('Booking completed successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to complete booking.');
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
        cancelled_by: 'vendor',
      };

      await api.post(`/api/bookings/${selectedBooking.id}/cancel-with-refund`, payload);

      // Update selected booking in state
      setSelectedBooking((prev: any) => ({
        ...prev,
        status: 'cancelled',
        cancellation_requested: true,
        refund_id: 'linked',
        refund_amount: payload.refund_amount,
        refund_reference_number: payload.reference_number,
        refund_method: payload.refund_method,
        refund_receiver_gcash_number: payload.receiver_gcash_number,
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
            }
            : b
        )
      );

      setShowRefundForm(false);
      alert('Booking cancelled and refund details linked successfully!');
    } catch (err: any) {
      setRefundError(err.response?.data?.message || 'Failed to submit refund.');
    } finally {
      setRefundSubmitting(false);
    }
  };

  // Helper to get assigned personnel display name
  const getAssignedPersonnelName = (id: string) => {
    const p = personnel.find((x: any) => x.id === id || x.uid === id);
    return p ? `${p.first_name} ${p.last_name}` : null;
  };

  if (selectedBooking) {
    // [CAVEMAN] Filter personnel: must be approved, not deleted, qualified for sub-service,
    // AND not currently assigned to an active/in_progress booking.
    const bookingSubService = (selectedBooking.sub_service || selectedBooking.service_type || '').toLowerCase();
    const matchedPersonnel = personnel.filter((p: any) => {
      if (p.acc_approve !== 'approved' || p.temp_delete === 1) return false;
      // Exclude personnel currently on an active assignment (in_progress)
      if (activePersonnelIds.has(p.id) || activePersonnelIds.has(p.uid)) {
        console.log(`[CAVEMAN] Excluding busy personnel: ${p.first_name} ${p.last_name} (ID: ${p.id})`);
        return false;
      }
      if (!p.services || !Array.isArray(p.services)) return false;
      return p.services.some((svc: any) => {
        const subs = svc.sub_services || [];
        return subs.some((sub: string) => sub.toLowerCase() === bookingSubService);
      });
    });

    // showAllPersonnel fallback also excludes actively-busy personnel
    const displayPersonnelList = showAllPersonnel
      ? personnel.filter((p: any) => {
        if (p.acc_approve !== 'approved' || p.temp_delete === 1) return false;
        if (activePersonnelIds.has(p.id) || activePersonnelIds.has(p.uid)) {
          console.log(`[CAVEMAN] (showAll) Excluding busy personnel: ${p.first_name} ${p.last_name}`);
          return false;
        }
        return true;
      })
      : matchedPersonnel;

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
                setShowAssignPersonnelModal(false);
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
                <span className="text-slate-400 font-medium">Customer:</span>
                <span className="col-span-2 text-slate-900 dark:text-white font-semibold">
                  {selectedBooking.customer_name || '—'}
                  {selectedBooking.customer_phone && <span className="text-xs text-slate-500 dark:text-slate-450 block font-normal">{selectedBooking.customer_phone}</span>}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-400 font-medium">Date & Time:</span>
                <span className="col-span-2 text-slate-900 dark:text-white font-semibold">📅 {selectedBooking.scheduled_date} at ⏰ {selectedBooking.scheduled_time}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-400 font-medium">Address:</span>
                <span className="col-span-2 text-slate-700 dark:text-slate-300 leading-normal">{selectedBooking.address || selectedBooking.service_address || '—'}</span>
              </div>
              {selectedBooking.personnel_id && (
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-850">
                  <span className="text-slate-400 font-medium">Assigned Personnel:</span>
                  <span className="col-span-2 text-slate-900 dark:text-white font-bold flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-brand-green" />
                    {getAssignedPersonnelName(selectedBooking.personnel_id) || 'Assigned'}
                  </span>
                </div>
              )}
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
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-850">
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
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        {!showRefundForm && !showCancelConfirm && !showAssignPersonnelModal && (
          <div className="flex flex-wrap gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800/80">
            {selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'completed' && selectedBooking.status !== 'pending' && (
              <Button
                variant="danger"
                className="flex-1 py-3 text-sm font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white min-w-[120px]"
                onClick={() => {
                  setShowCancelConfirm(true);
                }}
              >
                Cancel
              </Button>
            )}
            {selectedBooking.status === 'confirmed' && (
              <Button
                variant="success"
                className="flex-grow sm:flex-1 py-3 text-sm font-semibold rounded-xl min-w-[150px] bg-brand-navy hover:bg-[#0a2d5c]"
                onClick={() => {
                  setShowAssignPersonnelModal(true);
                  setShowAllPersonnel(false);
                }}
              >
                Assign Personnel
              </Button>
            )}
            {selectedBooking.status === 'in_progress' && (
              <Button
                variant="success"
                className="flex-grow sm:flex-1 py-3 text-sm font-semibold rounded-xl min-w-[150px]"
                onClick={handleCompleteBooking}
              >
                Complete
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
                  setCancellationReason('');
                  setCancelError('');
                  setShowRefundForm(true);
                }}
              >
                Yes, Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Cancellation Reason Form */}
        {showRefundForm && (
          <Card className="p-6 bg-white dark:bg-slate-950 border border-rose-200 dark:border-rose-900/30 rounded-2xl shadow-xl space-y-6">
            <div className="flex items-center gap-3 border-b pb-4 border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Cancel Booking</h4>
                <p className="text-xs text-slate-500">Provide a reason for cancelling this booking. A full refund will be automatically issued to the customer.</p>
              </div>
            </div>

            {cancelError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl">
                {cancelError}
              </div>
            )}

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Reason for Cancellation *</label>
              <textarea
                rows={4}
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder:text-slate-400 resize-none"
                placeholder="e.g. Vendor is unavailable on this date, equipment issue, etc."
                required
              />
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-xl">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                ⚠ A full refund of <span className="font-black">₱{Number(selectedBooking.total_price || (selectedBooking.price * (selectedBooking.quantity || 1)) || 0).toFixed(2)}</span> will be submitted to the admin for processing.
              </p>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowRefundForm(false);
                  setCancelError('');
                }}
                disabled={cancelSubmitting}
              >
                Back to Details
              </Button>
              <Button
                variant="danger"
                className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold px-6"
                onClick={async () => {
                  if (!cancellationReason.trim()) {
                    setCancelError('Please provide a reason for cancellation.');
                    return;
                  }
                  setCancelSubmitting(true);
                  setCancelError('');
                  try {
                    const totalAmt = selectedBooking.total_price || (selectedBooking.price * (selectedBooking.quantity || 1)) || 0;
                    await api.post(`/api/bookings/${selectedBooking.id}/cancel-with-refund`, {
                      refund_amount: totalAmt,
                      reason: cancellationReason.trim(),
                      cancelled_by: 'vendor',
                    });
                    setSelectedBooking((prev: any) => ({
                      ...prev,
                      status: 'cancelled',
                      cancellation_requested: true,
                    }));
                    setBookings((prevList: any[]) =>
                      prevList.map((b: any) =>
                        b.id === selectedBooking.id
                          ? { ...b, status: 'cancelled', cancellation_requested: true }
                          : b
                      )
                    );
                    setShowRefundForm(false);
                    alert('Booking cancelled. A full refund request has been submitted to the admin.');
                  } catch (err: any) {
                    setCancelError(err.response?.data?.message || 'Failed to cancel booking. Please try again.');
                  } finally {
                    setCancelSubmitting(false);
                  }
                }}
                loading={cancelSubmitting}
              >
                Confirm Cancellation
              </Button>
            </div>
          </Card>
        )}

        {/* Assign Personnel Modal/Section */}
        {showAssignPersonnelModal && (
          <Card className="p-6 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-xl space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b pb-4 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-navy/10 dark:bg-brand-green/10 flex items-center justify-center text-brand-navy dark:text-brand-green">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">Assign Personnel</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Qualified &amp; available personnel for: <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedBooking.sub_service || selectedBooking.service_type}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAssignPersonnelModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {displayPersonnelList.length === 0 ? (
              <div className="text-center py-8 space-y-4">
                <p className="text-sm text-slate-500">
                  {showAllPersonnel
                    ? "No available personnel found. All personnel are either busy with active bookings or not yet approved."
                    : "No available personnel qualified for this sub-service. They may be busy with active assignments."}
                </p>
                {!showAllPersonnel && personnel.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllPersonnel(true)}
                  >
                    Show All Available Personnel
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {showAllPersonnel ? "All Approved Personnel" : "Qualified Personnel"}
                  </span>
                  {!showAllPersonnel && personnel.length > matchedPersonnel.length && (
                    <button
                      type="button"
                      onClick={() => setShowAllPersonnel(true)}
                      className="text-xs text-brand-navy dark:text-brand-green font-bold hover:underline"
                    >
                      Show All Personnel
                    </button>
                  )}
                  {showAllPersonnel && matchedPersonnel.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAllPersonnel(false)}
                      className="text-xs text-brand-navy dark:text-brand-green font-bold hover:underline"
                    >
                      Show Only Qualified
                    </button>
                  )}
                </div>

                {displayPersonnelList.map((p: any) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100/50 dark:hover:bg-slate-900 flex justify-between items-center transition-all"
                  >
                    <div>
                      <h5 className="text-sm font-bold text-slate-900 dark:text-white">{p.first_name} {p.last_name}</h5>
                      <div className="flex flex-col sm:flex-row sm:gap-4 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span>✉ {p.email}</span>
                        {p.phone && <span>📞 {p.phone}</span>}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="bg-brand-navy hover:bg-[#0a2d5c]"
                      onClick={() => handleAssignPersonnelSubmit(p.id)}
                      loading={assigningLoading}
                    >
                      Assign
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="ghost"
                onClick={() => setShowAssignPersonnelModal(false)}
                disabled={assigningLoading}
              >
                Cancel
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
        { key: 'service_type', label: 'Service', sortable: true },
        { key: 'scheduled_date', label: 'Date', sortable: true },
        { key: 'status', label: 'Status', render: (item: any) => statusBadge(item.status) },
        {
          key: 'actions',
          label: 'Actions',
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

function SlotCalendar({ dbServices }: { dbServices: any[] }) {
  const { profile } = useAuth();
  const [slots, setSlots] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newSlot, setNewSlot] = useState({ service: '', sub_service: '', total_slots: 5, time_from: '09:00', time_to: '17:00' });
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [timeError, setTimeError] = useState<string>('');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedDates, setSelectedDates] = useState<number[]>([]);

  const vendorProfile = profile as any;
  const vendorServices = getFilteredVendorServices(vendorProfile?.services || [], dbServices);

  const isStatusActive = (status: string) => {
    const normalized = (status || '').toLowerCase().replace(/[-_]/g, '');
    return ['pending', 'assigned', 'inprogress', 'completed'].includes(normalized);
  };

  const fetchSlotsAndBookings = useCallback(async () => {
    if (!vendorProfile?.id) return;
    setLoading(true);
    try {
      const [slotsRes, bookingsRes] = await Promise.all([
        api.get(`/api/slots/vendor/${vendorProfile.id}`),
        api.get(`/api/bookings/vendor/${vendorProfile.id}`)
      ]);
      const slotsData = slotsRes.data || [];
      const bookingsData = bookingsRes.data || [];
      setBookings(bookingsData);

      const enriched = slotsData.map((s: any) => {
        const consumed = bookingsData.filter((b: any) => {
          const matchesSlot = b.slot_id === s.id;
          return matchesSlot && isStatusActive(b.status);
        }).length;
        // [CAVEMAN] Respect explicitly set 0 or less from slot's db available_slots
        let available = Math.max(0, (s.total_slots || 0) - consumed);
        if (s.available_slots === 0 || s.available_slots === '0') {
          console.log(`Database available_slots is 0 for slot ${s.id}, overriding to 0.`);
          available = 0;
        } else if (s.available_slots !== undefined && s.available_slots !== null) {
          available = Math.min(available, Number(s.available_slots));
        }
        return {
          ...s,
          available_slots: available
        };
      });
      setSlots(enriched);
    } catch (err) {
      console.error('Failed to fetch slots or bookings:', err);
    } finally {
      setLoading(false);
    }
  }, [vendorProfile?.id]);

  useEffect(() => {
    fetchSlotsAndBookings();
  }, [fetchSlotsAndBookings]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isDateDisabled = (date: number) => {
    const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), date);
    return checkDate < today;
  };

  const getSlotsForDate = (date: number) => {
    const dateStr = formatLocalYYYYMMDD(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), date));
    return slots.filter(s => s.slot_date === dateStr);
  };

  const getTotalAvailableForDate = (date: number) => {
    const dateSlots = getSlotsForDate(date);
    return dateSlots.reduce((sum, s) => {
      const avail = s.available_slots !== undefined && s.available_slots !== null ? s.available_slots : s.total_slots;
      const safeAvail = Math.max(0, avail !== undefined && avail !== null ? avail : 0);
      return sum + safeAvail;
    }, 0);
  };

  const handleAddSlot = async () => {
    setTimeError('');
    if (!newSlot.service || newSlot.total_slots < 1) {
      alert('Fill all fields');
      return;
    }

    if (!isSelectionMode && !selectedDate) {
      alert('No date selected');
      return;
    }
    if (isSelectionMode && selectedDates.length === 0) {
      alert('No dates selected');
      return;
    }

    // Check if service has sub-services; if not, sub_service not required
    const selectedService = vendorServices.find((s: any) => s.service === newSlot.service);
    if (selectedService?.sub_services?.length > 0 && !newSlot.sub_service) {
      alert('Select sub-service');
      return;
    }

    // Validate time range
    const [fromHour, fromMin] = newSlot.time_from.split(':').map(Number);
    const [toHour, toMin] = newSlot.time_to.split(':').map(Number);
    const fromTime = fromHour * 60 + fromMin;
    const toTime = toHour * 60 + toMin;
    if (toTime <= fromTime) {
      setTimeError('End time must be later than start time');
      return;
    }

    // Validate time not in past
    const now = new Date();
    const datesToProcess = isSelectionMode
      ? selectedDates.map(d => new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d))
      : [selectedDate!];

    for (const d of datesToProcess) {
      const isToday = d.toDateString() === now.toDateString();
      if (isToday) {
        const fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), fromHour, fromMin);
        if (fromDate < now) {
          alert(`Cannot create slot with past time for today (${d.getDate()})`);
          return;
        }
      }
    }

    try {
      await Promise.all(datesToProcess.map(d => {
        const dateStr = formatLocalYYYYMMDD(d);
        return api.post('/api/slots', {
          vendor_id: vendorProfile.id,
          slot_date: dateStr,
          service_type: newSlot.service,
          sub_service: newSlot.sub_service || null,
          time_from: newSlot.time_from,
          time_to: newSlot.time_to,
          total_slots: newSlot.total_slots,
        });
      }));
      await fetchSlotsAndBookings();
      setShowModal(false);
      setNewSlot({ service: '', sub_service: '', total_slots: 5, time_from: '09:00', time_to: '17:00' });
      setIsSelectionMode(false);
      setSelectedDates([]);
    } catch (err) {
      alert('Failed to create slots for some or all dates');
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm('Are you sure you want to delete this slot? All availability for this time will be removed.')) return;
    try {
      await api.delete(`/api/slots/${slotId}`);
      await fetchSlotsAndBookings();
    } catch (err) {
      alert('Failed to delete slot');
    }
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Calendar Card */}
      <Card className="overflow-hidden border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 shadow-sm rounded-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-green/10 dark:bg-brand-green/20 flex items-center justify-center text-brand-green text-xl font-bold shadow-sm shadow-brand-green/10">
                <CalendarDays className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-slate-800 dark:text-white">{monthName}</h2>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Manage and view your service slot capacities</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800/80 flex-wrap justify-end">
              <button
                onClick={() => {
                  setIsSelectionMode(!isSelectionMode);
                  if (isSelectionMode) setSelectedDates([]);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all duration-200 ${isSelectionMode
                    ? 'bg-brand-navy text-white shadow-sm'
                    : 'hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                {isSelectionMode ? 'Cancel Select' : 'Select'}
              </button>
              {isSelectionMode && selectedDates.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowModal(true);
                      setTimeError('');
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-black bg-brand-green text-white hover:bg-[#005e3f] shadow-sm transition-all whitespace-nowrap"
                  >
                    Add
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm(`Are you sure you want to delete all slots for the ${selectedDates.length} selected days?`)) return;
                      try {
                        const dateStrings = selectedDates.map(day => formatLocalYYYYMMDD(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)));
                        const slotsToDelete = slots.filter((s: any) => s.slot_date && dateStrings.includes(s.slot_date));
                        
                        if (slotsToDelete.length === 0) {
                          alert('No slots found on the selected dates.');
                          return;
                        }
                        
                        for (const slot of slotsToDelete) {
                          await api.delete(`/api/slots/${slot.id}`);
                        }
                        await fetchSlotsAndBookings();
                        setSelectedDates([]);
                        setIsSelectionMode(false);
                      } catch (err) {
                        alert('Failed to delete some or all slots');
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-black bg-rose-500 text-white hover:bg-rose-600 shadow-sm transition-all whitespace-nowrap"
                  >
                    Delete
                  </button>
                </div>
              )}
              {(!isSelectionMode || selectedDates.length === 0) && (
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />
              )}
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
                  className={`text-center text-[10px] font-black uppercase tracking-wider py-2 rounded-lg ${isWeekend
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
              const disabled = isDateDisabled(day);
              const isToday = dateObj.toDateString() === today.toDateString();
              const dateSlots = getSlotsForDate(day);
              const totalAvailable = getTotalAvailableForDate(day);
              const hasSlots = dateSlots.length > 0;

              return (
                <motion.div
                  key={`day-${day}`}
                  whileHover={!disabled ? { scale: 1.03, y: -2 } : {}}
                  whileTap={!disabled ? { scale: 0.97 } : {}}
                  onClick={() => {
                    if (disabled) return;
                    if (isSelectionMode) {
                      setSelectedDates(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
                    } else {
                      setSelectedDate(dateObj);
                      setShowModal(true);
                      setTimeError('');
                    }
                  }}
                  className={`aspect-square p-2.5 rounded-2xl flex flex-col justify-between cursor-pointer transition-all border relative overflow-hidden select-none ${disabled
                      ? 'bg-slate-50/40 dark:bg-slate-900/10 border-slate-100/50 dark:border-slate-800/10 text-slate-300 dark:text-slate-700 cursor-not-allowed'
                      : isSelectionMode && selectedDates.includes(day)
                        ? 'bg-brand-navy border-brand-navy text-white shadow-md shadow-brand-navy/20 scale-[0.98]'
                        : hasSlots
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 border-emerald-400/20 text-white shadow-md shadow-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/20'
                          : isToday
                            ? 'bg-white dark:bg-slate-950 border-brand-green border-2 text-slate-900 dark:text-white shadow-sm font-bold'
                            : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800/80 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-sm font-black ${(hasSlots || (isSelectionMode && selectedDates.includes(day))) ? 'text-white' : 'text-slate-800 dark:text-white'}`}>
                      {day}
                    </span>
                    {hasSlots && dateSlots.length > 0 && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSlot(dateSlots[0].id);
                        }}
                        className="text-white/80 hover:text-rose-500 transition-colors p-1"
                        title="Delete slot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {hasSlots && (
                    <div className="mt-auto flex flex-col gap-0.5 overflow-hidden">
                      <div className="text-[11px] font-black text-white/95 px-0.5 mb-0.5">
                        {totalAvailable} {totalAvailable === 1 ? 'slot' : 'slots'}
                      </div>
                      {dateSlots.slice(0, 2).map((s, idx) => (
                        <div key={idx} className="text-[11px] font-bold bg-white/20 dark:bg-black/20 text-white rounded px-1.5 py-0.5 truncate" title={`${s.time_from} - ${s.time_to}`}>
                          {s.time_from} - {s.time_to}
                        </div>
                      ))}
                      {dateSlots.length > 2 && (
                        <div className="text-[10px] font-bold text-white/80 px-1">
                          +{dateSlots.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Active slots grouped by service/sub-service */}
      <Card className="border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 shadow-sm rounded-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Slots List</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Your currently configured booking availabilities</p>
            </div>
            <span className="text-xs bg-brand-navy/10 dark:bg-brand-green/20 text-brand-navy dark:text-brand-green px-2.5 py-1 rounded-full font-bold">
              {slots.length} Active Slot{slots.length !== 1 ? 's' : ''}
            </span>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-brand-green rounded-full animate-spin" />
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Fetching slots data...</p>
            </div>
          ) : slots.length === 0 ? (
            <EmptyState title="No slots" description="Create slots to accept bookings" icon={<CalendarDays className="w-6 h-6 text-slate-400" />} />
          ) : (
            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
              {vendorServices.map((svc: any) => {
                const serviceSlots = slots.filter(s => s.service_type === svc.service);
                if (serviceSlots.length === 0) return null;
                return (
                  <div key={svc.service} className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/60 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b pb-3 border-slate-200/40 dark:border-slate-800/40">
                      <div className="w-2.5 h-6 rounded bg-brand-green" />
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">{svc.service}</h4>
                    </div>

                    <div className="space-y-4">
                      {svc.sub_services.map((sub: any) => {
                        const subSlots = serviceSlots.filter(s => s.sub_service === sub);
                        if (subSlots.length === 0) return null;
                        return (
                          <div key={sub} className="space-y-2">
                            <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 pl-1">{sub}</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {subSlots.map((s, i) => {
                                const avail = s.available_slots !== undefined && s.available_slots !== null ? s.available_slots : s.total_slots;
                                const total = s.total_slots !== undefined && s.total_slots !== null ? s.total_slots : 0;
                                const safeAvail = Math.max(0, avail !== undefined && avail !== null ? avail : 0);
                                const safeTotal = Math.max(0, total);
                                const percentAvail = safeTotal > 0 ? (safeAvail / safeTotal) * 100 : 0;

                                return (
                                  <div key={i} className="p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-950 flex flex-col justify-between hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 group">
                                    <div className="flex justify-between items-start gap-4">
                                      <div className="space-y-1">
                                        <span className="text-xs font-black text-slate-800 dark:text-slate-200 group-hover:text-brand-green transition-colors">{s.slot_date}</span>
                                        {s.time_from && s.time_to && (
                                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>{s.time_from} - {s.time_to}</span>
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className={`text-xs px-2.5 py-1 rounded-lg font-black flex items-center gap-1.5 shrink-0 ${safeAvail > 0
                                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200/40 dark:border-emerald-800/40'
                                            : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200/40 dark:border-rose-800/40'
                                          }`}>
                                          {safeAvail > 0 ? 'Active' : 'Fully Booked'} • {safeAvail}/{safeTotal}
                                        </span>
                                        <button
                                          onClick={() => handleDeleteSlot(s.id)}
                                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                                          title="Delete slot"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>

                                    {/* Sleek thin progress bar to represent remaining slots visually */}
                                    <div className="mt-3 space-y-1">
                                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                          className={`h-full rounded-full transition-all duration-500 ${percentAvail > 50
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
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Add slot modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="w-full max-w-md"
            >
              <Card className="border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 shadow-2xl rounded-2xl overflow-hidden">
                <div className="p-6 space-y-5">
                  <div className="flex items-center justify-between border-b pb-4 border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center text-brand-green">
                        <Plus className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">Add Booking Slot</h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{isSelectionMode ? `For ${selectedDates.length} selected days` : `For ${selectedDate?.toLocaleDateString('en-US', { dateStyle: 'long' })}`}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setShowModal(false); setTimeError(''); }}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5">Main Service</label>
                      <select
                        value={newSlot.service}
                        onChange={(e) => { setNewSlot({ ...newSlot, service: e.target.value, sub_service: '' }); }}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-brand-green transition-all"
                      >
                        <option value="">Select main service...</option>
                        {vendorServices.map((s: any) => <option key={s.service} value={s.service}>{s.service}</option>)}
                      </select>
                    </div>

                    {newSlot.service && vendorServices.find((s: any) => s.service === newSlot.service)?.sub_services.length > 0 && (
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5">Sub-Service</label>
                        <select
                          value={newSlot.sub_service}
                          onChange={(e) => setNewSlot({ ...newSlot, sub_service: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-brand-green transition-all"
                        >
                          <option value="">Select sub-service...</option>
                          {vendorServices.find((s: any) => s.service === newSlot.service)?.sub_services.map((s: string) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5">Time From</label>
                        <div className="relative">
                          <input
                            type="time"
                            value={newSlot.time_from}
                            onChange={(e) => { setNewSlot({ ...newSlot, time_from: e.target.value }); setTimeError(''); }}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-brand-green transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5">Time To</label>
                        <div className="relative">
                          <input
                            type="time"
                            value={newSlot.time_to}
                            onChange={(e) => { setNewSlot({ ...newSlot, time_to: e.target.value }); setTimeError(''); }}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-brand-green transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {timeError && (
                      <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-800/50 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{timeError}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5">Available Slots Capacity</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={newSlot.total_slots}
                        onChange={(e) => setNewSlot({ ...newSlot, total_slots: parseInt(e.target.value) || 5 })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-brand-green transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Button
                      variant="ghost"
                      className="flex-1 text-slate-500 font-bold"
                      onClick={() => { setShowModal(false); setTimeError(''); }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 bg-brand-green hover:bg-[#005e3f] text-white font-bold"
                      onClick={handleAddSlot}
                    >
                      Add Slot
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

function VendorPersonnel({ dbServices }: { dbServices: any[] }) {
  const { profile } = useAuth();
  const [personnel, setPersonnel] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState<any>(null);
  const [editSelectedServices, setEditSelectedServices] = useState<Array<{ service: string; sub_services: string[] }>>([]);

  useEffect(() => {
    if (editItem) {
      setEditSelectedServices(editItem.services || []);
    } else {
      setEditSelectedServices([]);
    }
  }, [editItem]);

  // Creation form states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [selectedServices, setSelectedServices] = useState<Array<{ service: string; sub_services: string[] }>>([]);
  const [createError, setCreateError] = useState('');
  const [createSaving, setCreateSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const toggleService = (serviceName: string) => {
    setSelectedServices(prev => {
      const exists = prev.find(s => s.service === serviceName);
      if (exists) {
        return prev.filter(s => s.service !== serviceName);
      } else {
        return [...prev, { service: serviceName, sub_services: [] }];
      }
    });
  };

  const toggleSubService = (serviceName: string, subServiceName: string) => {
    setSelectedServices(prev => prev.map(s => {
      if (s.service === serviceName) {
        const hasSub = s.sub_services.includes(subServiceName);
        const newSubs = hasSub
          ? s.sub_services.filter(sub => sub !== subServiceName)
          : [...s.sub_services, subServiceName];
        return {
          ...s,
          sub_services: newSubs
        };
      }
      return s;
    }));
  };

  const [usernameCheckLoading, setUsernameCheckLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [usernameValid, setUsernameValid] = useState(false);

  useEffect(() => {
    if (profile?.id) api.get(`/api/personnel?vendor_id=${profile.id}`).then(r => setPersonnel(r.data || [])).catch(() => { }).finally(() => setLoading(false));
    else setLoading(false);
  }, [profile]);

  const handleApprove = async (id: string) => {
    try {
      await api.post(`/api/personnel/${id}/approve`);
      setPersonnel(ps => ps.map(p => p.id === id ? { ...p, acc_approve: 'approved', temp_delete: 0 } : p));
    } catch (e) { }
  };

  const handleReject = async (id: string) => {
    try {
      await api.post(`/api/personnel/${id}/reject`);
      setPersonnel(ps => ps.map(p => p.id === id ? { ...p, acc_approve: 'rejected', temp_delete: 0 } : p));
    } catch (e) { }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/personnel/${id}`);
      setPersonnel(ps => ps.map(p => p.id === id ? { ...p, temp_delete: 1 } : p));
    } catch (e) { }
  };

  const handleEditSave = async (data: Record<string, any>) => {
    await api.put(`/api/personnel/${editItem.id}`, data);
    setPersonnel(ps => ps.map(p => p.id === editItem.id ? { ...p, ...data } : p));
    setEditItem(null);
  };

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

  const passwordStrength = useCallback((pw: string) => {
    let s = 0;
    if (pw.length >= 8) s++; if (/[A-Z]/.test(pw)) s++; if (/[0-9]/.test(pw)) s++; if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  }, []);

  const strength = passwordStrength(createForm.password);
  const strengthColors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-brand-green'];
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

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

  const vendorServices = getFilteredVendorServices((profile as any)?.services || [], dbServices);
  const handleCreatePersonnelSubmit = async () => {
    setCreateError('');

    if (!createForm.firstName || !createForm.lastName || !createForm.username || !createForm.email || !createForm.password || !createForm.confirmPassword || !createForm.phone || selectedServices.length === 0) {
      setCreateError('All fields are required and at least one service must be selected.');
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
      const res = await api.post('/api/personnel/create-by-vendor', {
        ...createForm,
        services: selectedServices
      });
      const newPersonnel = {
        id: res.data.id,
        uid: res.data.id,
        first_name: createForm.firstName,
        last_name: createForm.lastName,
        username: createForm.username,
        email: createForm.email,
        phone: createForm.phone,
        acc_approve: 'approved',
        temp_delete: 0,
        last_login: null
      };
      setPersonnel(prev => [newPersonnel, ...prev]);
      setShowCreateModal(false);
      setCreateForm({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: ''
      });
      setSelectedServices([]);
    } catch (err: any) {
      setCreateError(err.response?.data?.message || err.message || 'Failed to create personnel account.');
    } finally {
      setCreateSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Personnel List</h3>
        <Button onClick={() => { setShowCreateModal(true); setCreateError(''); }} icon={<Plus className="w-4 h-4" />}>
          Create Personnel
        </Button>
      </div>

      <DataTable columns={[
        { key: 'first_name', label: 'First Name', sortable: true },
        { key: 'last_name', label: 'Last Name', sortable: true },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone', render: (item: any) => item.phone || '—' },
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
        }
      ]} data={personnel.filter(p => p.temp_delete !== 1)} loading={loading} searchPlaceholder="Search personnel..." emptyTitle="No personnel added" />

      {editItem && (
        <EditModal
          title="Edit Personnel"
          fields={[
            { key: 'first_name', label: 'First Name', placeholder: 'First name' },
            { key: 'last_name', label: 'Last Name', placeholder: 'Last name' },
            { key: 'phone', label: 'Phone', type: 'tel', placeholder: '09XX XXX XXXX' },
          ]}
          initialData={editItem}
          onSave={async (data) => {
            const updatedData = {
              ...data,
              services: editSelectedServices
            };
            await handleEditSave(updatedData);
          }}
          onClose={() => setEditItem(null)}
        >
          <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Services & Sub-services Offered</label>
            <div className="max-h-60 overflow-y-auto pr-1 space-y-2 border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-slate-50/50 dark:bg-slate-800/50">
              {vendorServices.map(service => {
                const isSelected = editSelectedServices.find(s => s.service === service.service);
                return (
                  <div key={service.service} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditSelectedServices(prev => {
                          const exists = prev.find(s => s.service === service.service);
                          if (exists) {
                            return prev.filter(s => s.service !== service.service);
                          } else {
                            return [...prev, { service: service.service, sub_services: [] }];
                          }
                        });
                      }}
                      className={`w-full p-2 rounded-lg border transition-all text-left text-xs ${isSelected
                        ? 'border-brand-navy dark:border-brand-green bg-brand-navy/5 dark:bg-brand-green/10'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 dark:text-white">{service.service}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-brand-green" />}
                      </div>
                    </button>

                    {(() => {
                      const dbService = dbServices.find(
                        (ds: any) => ds.name.toLowerCase() === service.service.toLowerCase()
                      );
                      const dbSubServices = dbService?.subServices || [];
                      return isSelected && dbSubServices.length > 0 && (
                        <div className="ml-3 mt-1 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Sub-services:</p>
                          {dbSubServices.map((sub: any) => {
                            const subName = sub.name || sub;
                            const isSubSelected = isSelected.sub_services.includes(subName);

                            return (
                              <div key={subName} className="space-y-1 border-l-2 border-slate-100 dark:border-slate-800 pl-2">
                                <label className="flex items-center gap-1.5 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={isSubSelected}
                                    onChange={() => {
                                      setEditSelectedServices(prev => prev.map(s => {
                                        if (s.service === service.service) {
                                          const hasSub = s.sub_services.includes(subName);
                                          const newSubs = hasSub
                                            ? s.sub_services.filter(subItem => subItem !== subName)
                                            : [...s.sub_services, subName];
                                          return {
                                            ...s,
                                            sub_services: newSubs
                                          };
                                        }
                                        return s;
                                      }));
                                    }}
                                    className="w-3 h-3 rounded border-slate-300 text-brand-navy focus:ring-brand-navy"
                                  />
                                  <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">{subName}</span>
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
            {editSelectedServices.length > 0 && (
              <div className="mt-2 p-1.5 rounded-lg bg-brand-green/10 border border-brand-green/20">
                <p className="text-[10px] font-medium text-brand-green">Selected: {editSelectedServices.map(s => `${s.service} (${s.sub_services.length})`).join(', ')}</p>
              </div>
            )}
          </div>
        </EditModal>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setShowCreateModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg" onClick={e => e.stopPropagation()}>
              <Card>
                <div className="p-6 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create Personnel Account</h3>
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
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Services You Offer</label>
                      <div className="max-h-60 overflow-y-auto pr-1 space-y-2 border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-slate-50/50 dark:bg-slate-800/50">
                        {vendorServices.map(service => {
                          const isSelected = selectedServices.find(s => s.service === service.service);
                          return (
                            <div key={service.service} className="space-y-1">
                              <button
                                type="button"
                                onClick={() => toggleService(service.service)}
                                className={`w-full p-2 rounded-lg border transition-all text-left text-xs ${isSelected
                                  ? 'border-brand-navy dark:border-brand-green bg-brand-navy/5 dark:bg-brand-green/10'
                                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                  }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-slate-900 dark:text-white">{service.service}</span>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-brand-green" />}
                                </div>
                              </button>

                              {(() => {
                                const dbService = dbServices.find(
                                  (ds: any) => ds.name.toLowerCase() === service.service.toLowerCase()
                                );
                                const dbSubServices = dbService?.subServices || [];
                                return isSelected && dbSubServices.length > 0 && (
                                  <div className="ml-3 mt-1 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Sub-services:</p>
                                    {dbSubServices.map((sub: any) => {
                                      const subName = sub.name || sub;
                                      const isSubSelected = isSelected.sub_services.includes(subName);

                                      return (
                                        <div key={subName} className="space-y-1 border-l-2 border-slate-100 dark:border-slate-800 pl-2">
                                          <label className="flex items-center gap-1.5 cursor-pointer">
                                            <input
                                              type="checkbox"
                                              checked={isSubSelected}
                                              onChange={() => toggleSubService(service.service, subName)}
                                              className="w-3 h-3 rounded border-slate-300 text-brand-navy focus:ring-brand-navy"
                                            />
                                            <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">{subName}</span>
                                          </label>
                                        </div>
                                      );
                                    })}
                                  </div>
                                );
                              })()}
                            </div>
                          );
                        })}
                      </div>
                      {selectedServices.length > 0 && (
                        <div className="mt-2 p-1.5 rounded-lg bg-brand-green/10 border border-brand-green/20">
                          <p className="text-[10px] font-medium text-brand-green">Selected: {selectedServices.map(s => `${s.service} (${s.sub_services.length})`).join(', ')}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-6">
                    <Button variant="ghost" className="flex-grow sm:flex-1" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                    <Button
                      variant="success"
                      className="flex-grow sm:flex-1"
                      onClick={handleCreatePersonnelSubmit}
                      loading={createSaving}
                      disabled={!createForm.firstName || !createForm.lastName || !createForm.username || !usernameValid || !createForm.email || !createForm.password || !createForm.confirmPassword || !createForm.phone || !/^\d{11}$/.test(createForm.phone) || selectedServices.length === 0 || createForm.password !== createForm.confirmPassword || strength < 4}
                      icon={<Plus className="w-4 h-4" />}
                    >
                      Create Personnel
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

function EditVendorServicesModal({ isOpen, onClose, dbServices, currentServices, onSave }: {
  isOpen: boolean;
  onClose: () => void;
  dbServices: any[];
  currentServices: any[];
  onSave: (services: any[]) => Promise<void>;
}) {
  const [selectedServices, setSelectedServices] = useState<Array<{ service: string; sub_services: string[]; work_types?: any[] }>>([]);
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedServices(
        currentServices.map((s: any) => ({
          service: s.service,
          sub_services: [...(s.sub_services || []), ...(s.subServices || [])],
          work_types: s.work_types || []
        }))
      );
      setError('');
    }
  }, [isOpen, currentServices]);

  const toggleService = (serviceName: string) => {
    const exists = selectedServices.find(s => s.service === serviceName);
    if (exists) {
      setSelectedServices(selectedServices.filter(s => s.service !== serviceName));
      setExpandedService(null);
    } else {
      setSelectedServices([...selectedServices, { service: serviceName, sub_services: [], work_types: [] }]);
      setExpandedService(serviceName);
    }
  };

  const toggleSubService = (serviceName: string, subName: string) => {
    setSelectedServices(selectedServices.map(s => {
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

  const handleSave = async () => {
    setError('');
    if (selectedServices.length === 0) {
      setError('Please select at least one service brand.');
      return;
    }
    for (const s of selectedServices) {
      const def = dbServices.find(db => db.name === s.service);
      if (def && def.subServices && def.subServices.length > 0 && s.sub_services.length === 0) {
        setError(`Please select at least one sub-service for ${s.service}.`);
        return;
      }
      if (def && def.subServices) {
        for (const subName of s.sub_services) {
          const dbSub = def.subServices.find((ds: any) => (ds.name || ds) === subName);
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
      const mergedServices = selectedServices.map(sel => {
        const existing = currentServices.find(c => c.service === sel.service);
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
      await onSave(mergedServices);
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to save services');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Offered Services</h3>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Select the services, sub-services, and work types you offer:
                </label>
                <div className="max-h-96 overflow-y-auto pr-1 space-y-2 border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-slate-50/50 dark:bg-slate-800/50">
                  {dbServices.map(svc => {
                    const isSelected = selectedServices.find(s => s.service === svc.name);
                    return (
                      <div key={svc.name} className="space-y-1">
                        <button type="button" onClick={() => toggleService(svc.name)}
                          className={`w-full p-2.5 rounded-lg border-2 transition-all text-left text-sm ${isSelected ? 'border-brand-navy dark:border-brand-green bg-brand-navy/5 dark:bg-brand-green/10' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900 dark:text-white">{svc.name}</span>
                            {isSelected && <Check className="w-4 h-4 text-brand-green" />}
                          </div>
                        </button>
                        {isSelected && svc.subServices && svc.subServices.length > 0 && (
                          <div className="ml-4 mt-1 p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Sub-services & Work Types:</p>
                            {svc.subServices.map((sub: any) => {
                              const subName = sub.name || sub;
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
              </div>
            </div>
            <div className="flex gap-3 pt-6">
              <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
              <Button variant="success" className="flex-1" onClick={handleSave} loading={saving}>
                Save Changes
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

function SubServiceDetailModal({ isOpen, onClose, service, subServiceName, dbServices, onNewRequest }: {
  isOpen: boolean;
  onClose: () => void;
  service: any;
  subServiceName: string;
  dbServices: any[];
  onNewRequest: () => void;
}) {
  const { profile } = useAuth();
  const p = profile as any;
  const [proposedRows, setProposedRows] = useState<Array<{ name: string; restrictions: string }>>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [vendorRequests, setVendorRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const dbServiceMatch = dbServices.find(s => s.name.toLowerCase() === service.service.toLowerCase());
  const dbSubServiceMatch = dbServiceMatch?.subServices?.find((sub: any) => (sub.name || sub).toLowerCase() === subServiceName.toLowerCase());

  const existingWorkTypes = dbSubServiceMatch?.workTypes || [];
  const prices = dbSubServiceMatch?.prices || {};

  // Merge general work types with vendor's approved custom ones from their profile
  const vendorSvc = (profile as any)?.services?.find((s: any) => s.service.toLowerCase() === service.service.toLowerCase());
  const vendorApprovedWorkTypes = vendorSvc?.work_types?.filter((wt: any) => wt.subService.toLowerCase() === subServiceName.toLowerCase() && wt.status === 'approved') || [];

  const allActiveWts = [...existingWorkTypes];
  vendorApprovedWorkTypes.forEach((vwt: any) => {
    if (!allActiveWts.some(wtName => wtName.toLowerCase() === vwt.name.toLowerCase())) {
      allActiveWts.push(vwt.name);
    }
  });

  const allPrices = { ...prices };
  vendorApprovedWorkTypes.forEach((vwt: any) => {
    allPrices[vwt.name] = vwt.price;
  });

  const fetchVendorRequests = useCallback(() => {
    if (!p?.id) return;
    setLoadingRequests(true);
    api.get(`/api/services/requests/work-type/vendor/${p.id}`)
      .then(res => {
        const filtered = (res.data || []).filter((req: any) =>
          req.serviceId.toLowerCase() === (dbServiceMatch?.id || service.service).toLowerCase() &&
          req.subServiceId.toLowerCase() === subServiceName.toLowerCase()
        );
        setVendorRequests(filtered);
      })
      .catch(err => {
        console.error('Failed to load vendor work type requests', err);
      })
      .finally(() => setLoadingRequests(false));
  }, [p?.id, dbServiceMatch?.id, service.service, subServiceName]);

  useEffect(() => {
    if (isOpen) {
      setProposedRows([]);
      setError('');
      setSuccess('');
      fetchVendorRequests();
    }
  }, [isOpen, fetchVendorRequests]);

  const handleAddRow = () => {
    setProposedRows([...proposedRows, { name: '', restrictions: '' }]);
  };

  const handleRowChange = (index: number, key: 'name' | 'restrictions', val: string) => {
    const updated = [...proposedRows];
    updated[index] = { ...updated[index], [key]: val };
    setProposedRows(updated);
  };

  const handleRemoveRow = (index: number) => {
    setProposedRows(proposedRows.filter((_, i) => i !== index));
  };

  const handleSubmitAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!p) {
      setError('Not authenticated');
      return;
    }

    const validNewProposals = proposedRows.filter(r => r.name.trim());
    if (validNewProposals.length === 0) {
      setError('Please add at least one work type proposal.');
      return;
    }

    // Validation checks for existing or pending
    for (const row of validNewProposals) {
      const proposedName = row.name.trim();
      const existsApproved = allActiveWts.some((wt: string) => wt.toLowerCase() === proposedName.toLowerCase());
      const existsPending = vendorRequests.some((req: any) => req.name.toLowerCase() === proposedName.toLowerCase() && req.status === 'pending');

      if (existsApproved) {
        setError(`"${proposedName}" is already approved and active for this sub-service.`);
        return;
      }
      if (existsPending) {
        setError(`You have already submitted a pending request for "${proposedName}".`);
        return;
      }
    }

    setSubmitting(true);
    try {
      await Promise.all(
        validNewProposals.map(row =>
          api.post('/api/services/requests/work-type', {
            vendorId: p.id,
            vendorName: p.company_name || p.name || 'Vendor',
            serviceId: dbServiceMatch?.id || service.service,
            serviceName: service.service,
            subServiceId: subServiceName,
            subServiceName: subServiceName,
            name: row.name.trim(),
            restrictions: row.restrictions.trim()
          })
        )
      );

      setSuccess('Your request(s) have been submitted successfully and are pending admin approval.');
      setProposedRows([]);
      fetchVendorRequests();
      onNewRequest();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to submit requests');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-navy/60 dark:text-brand-green/60">{service.service}</span>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">{subServiceName} — Work Types</h3>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex gap-2 items-center">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="p-3 rounded-xl bg-brand-green/10 border border-brand-green/20 text-brand-green text-sm flex gap-2 items-center">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              <div>
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2.5">Configure Work Types</h4>
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">

                  {/* Active Work Types (Read Only) */}
                  {allActiveWts.map((wt: string) => (
                    <div
                      key={wt}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 space-y-2"
                    >
                      <div className="flex gap-2 items-center">
                        <div className="flex-grow">
                          <input
                            type="text"
                            value={wt}
                            disabled
                            className="w-full text-xs font-semibold px-3 py-2 border border-slate-250 dark:border-slate-750 bg-slate-100/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 rounded-lg outline-none cursor-not-allowed"
                          />
                        </div>
                        <div className="relative w-28">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">₱</span>
                          <input
                            type="text"
                            value={allPrices[wt] || '0.00'}
                            disabled
                            className="w-full pl-6 pr-3 py-2 text-xs font-semibold border border-slate-250 dark:border-slate-750 bg-slate-100/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 rounded-lg outline-none cursor-not-allowed"
                          />
                        </div>
                        <div className="flex-shrink-0">
                          <span className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            Active
                          </span>
                        </div>
                      </div>
                      {vendorApprovedWorkTypes.find((vwt: any) => vwt.name.toLowerCase() === wt.toLowerCase())?.restrictions && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100/40 dark:bg-slate-800/20 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800 flex gap-1.5 items-center">
                          <span className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[9px]">Restrictions:</span>
                          <span>{vendorApprovedWorkTypes.find((vwt: any) => vwt.name.toLowerCase() === wt.toLowerCase())?.restrictions}</span>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Proposed/Pending Work Types (Read Only) */}
                  {vendorRequests.map((req: any) => (
                    <div
                      key={req.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 space-y-2"
                    >
                      <div className="flex gap-2 items-center">
                        <div className="flex-grow">
                          <input
                            type="text"
                            value={req.name}
                            disabled
                            className="w-full text-xs font-semibold px-3 py-2 border border-slate-250 dark:border-slate-750 bg-slate-100/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 rounded-lg outline-none cursor-not-allowed"
                          />
                        </div>
                        <div className="relative w-28">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">₱</span>
                          <input
                            type="text"
                            value={req.price || 'TBD'}
                            disabled
                            className="w-full pl-6 pr-3 py-2 text-xs font-semibold border border-slate-250 dark:border-slate-750 bg-slate-100/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 rounded-lg outline-none cursor-not-allowed"
                          />
                        </div>
                        <div className="flex-shrink-0">
                          <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${req.status === 'approved'
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              : req.status === 'rejected'
                                ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            }`}>
                            {req.status}
                          </span>
                        </div>
                      </div>
                      {req.restrictions && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100/40 dark:bg-slate-800/20 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800 flex gap-1.5 items-center">
                          <span className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[9px]">Restrictions:</span>
                          <span>{req.restrictions}</span>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Editable Proposed New Rows */}
                  {proposedRows.map((row, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-brand-navy/5 dark:bg-brand-green/5 border border-brand-navy/20 dark:border-brand-green/20 flex gap-2 items-center"
                    >
                      <div className="flex-grow">
                        <input
                          type="text"
                          value={row.name}
                          onChange={e => handleRowChange(idx, 'name', e.target.value)}
                          placeholder="e.g. Standard Split Type"
                          disabled={submitting}
                          className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-brand-navy/20 dark:focus:ring-brand-green/20"
                          required
                        />
                      </div>
                      <div className="flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(idx)}
                          className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-colors"
                          title="Remove proposal row"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {existingWorkTypes.length === 0 && vendorRequests.length === 0 && proposedRows.length === 0 && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      No work types defined. Click "Add Work Type" below to propose one.
                    </p>
                  )}
                </div>
              </div>

              {/* Add Row Button */}
              <div className="pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleAddRow}
                  icon={<Plus className="w-4 h-4" />}
                  className="w-full border border-dashed border-slate-300 dark:border-slate-700 text-slate-550 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  disabled={submitting}
                >
                  Add Work Type
                </Button>
              </div>

              {/* Form Buttons */}
              {proposedRows.length > 0 && (
                <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1"
                    onClick={() => setProposedRows([])}
                    disabled={submitting}
                  >
                    Clear New Rows
                  </Button>
                  <Button
                    type="button"
                    variant="success"
                    className="flex-1"
                    onClick={handleSubmitAll}
                    loading={submitting}
                    disabled={proposedRows.every(r => !r.name.trim())}
                  >
                    Submit Proposals
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

function ProposeMainServiceModal({ isOpen, onClose, onSubmitted }: {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const { profile } = useAuth();
  const p = profile as any;
  const [form, setForm] = useState({ name: '', tagline: '', description: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({ name: '', tagline: '', description: '' });
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!p) {
      setError('Not authenticated');
      return;
    }
    if (!form.name.trim() || !form.tagline.trim() || !form.description.trim()) {
      setError('All fields are required.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/api/services/requests/main-service', {
        vendorId: p.id,
        vendorName: p.company_name || p.name || 'Vendor',
        name: form.name.trim(),
        tagline: form.tagline.trim(),
        description: form.description.trim()
      });
      onSubmitted();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Propose New Main Service Brand</h3>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Service Brand Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="input-base text-sm" placeholder="e.g. RoofFix" disabled={submitting} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tagline *</label>
                <input value={form.tagline} onChange={e => setForm({ ...form, tagline: e.target.value })}
                  className="input-base text-sm" placeholder="e.g. Premium Roofing & Gutter Solutions" disabled={submitting} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description *</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="input-base text-sm min-h-[100px]" placeholder="Describe the service..." disabled={submitting} />
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="ghost" className="flex-1" onClick={onClose} type="button">Cancel</Button>
                <Button variant="success" className="flex-1" type="submit" loading={submitting}>Submit Proposal</Button>
              </div>
            </form>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

function ProposeSubServiceModal({ isOpen, onClose, dbServices, onSubmitted }: {
  isOpen: boolean;
  onClose: () => void;
  dbServices: any[];
  onSubmitted: () => void;
}) {
  const { profile } = useAuth();
  const p = profile as any;
  const [form, setForm] = useState({ serviceId: '', name: '', description: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({ serviceId: dbServices[0]?.id || dbServices[0]?.name || '', name: '', description: '' });
      setError('');
    }
  }, [isOpen, dbServices]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!p) {
      setError('Not authenticated');
      return;
    }
    if (!form.serviceId || !form.name.trim() || !form.description.trim()) {
      setError('All fields are required.');
      return;
    }
    const parentSvc = dbServices.find(s => s.id === form.serviceId || s.name === form.serviceId);
    setSubmitting(true);
    try {
      await api.post('/api/services/requests/sub-service', {
        vendorId: p.id,
        vendorName: p.company_name || p.name || 'Vendor',
        serviceId: form.serviceId,
        serviceName: parentSvc?.name || form.serviceId,
        name: form.name.trim(),
        description: form.description.trim()
      });
      onSubmitted();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Propose New Sub Service</h3>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Parent Service Category *</label>
                <select value={form.serviceId} onChange={e => setForm({ ...form, serviceId: e.target.value })}
                  className="input-base text-sm" disabled={submitting}>
                  {dbServices.map(s => (
                    <option key={s.id || s.name} value={s.id || s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sub Service Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="input-base text-sm" placeholder="e.g. Deep Cleaning" disabled={submitting} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description *</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="input-base text-sm min-h-[100px]" placeholder="Describe the subservice..." disabled={submitting} />
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="ghost" className="flex-1" onClick={onClose} type="button">Cancel</Button>
                <Button variant="success" className="flex-1" type="submit" loading={submitting}>Submit Proposal</Button>
              </div>
            </form>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

function VendorServices({ dbServices, loadingDb, refreshServices }: { dbServices: any[]; loadingDb: boolean; refreshServices: () => void }) {
  const { profile, refreshProfile } = useAuth();
  const p = profile as any;
  const [activeTab, setActiveTab] = useState<'offered' | 'proposals'>('offered');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSubService, setSelectedSubService] = useState<{ svc: any; subName: string } | null>(null);

  // Proposals & Requests lists
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [proposals, setProposals] = useState<any[]>([]);
  const [showProposeMain, setShowProposeMain] = useState(false);
  const [showProposeSub, setShowProposeSub] = useState(false);

  const vendorServices = getFilteredVendorServices(p?.services || [], dbServices);

  const fetchAllProposals = useCallback(async () => {
    if (!p?.id) return;
    setLoadingRequests(true);
    try {
      const [mains, subs, wts] = await Promise.all([
        api.get(`/api/services/requests/main-service/vendor/${p.id}`).catch(() => ({ data: [] })),
        api.get(`/api/services/requests/sub-service/vendor/${p.id}`).catch(() => ({ data: [] })),
        api.get(`/api/services/requests/work-type/vendor/${p.id}`).catch(() => ({ data: [] }))
      ]);

      const formatted = [
        ...mains.data.map((r: any) => ({ ...r, type: 'Main Service' })),
        ...subs.data.map((r: any) => ({ ...r, type: 'Sub Service', parent: r.serviceName })),
        ...wts.data.map((r: any) => ({ ...r, type: 'Work Type', parent: `${r.serviceName} → ${r.subServiceName}` }))
      ];
      // Sort by status / creation if available
      setProposals(formatted);
    } catch (e) {
      console.error('Failed to load proposals', e);
    } finally {
      setLoadingRequests(false);
    }
  }, [p?.id]);

  useEffect(() => {
    if (activeTab === 'proposals') {
      fetchAllProposals();
    }
  }, [activeTab, fetchAllProposals]);

  const handleUpdateServices = async (updatedServices: any[]) => {
    if (!p?.id) return;
    await api.put(`/api/vendors/${p.id}`, { services: updatedServices });
    await refreshProfile();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Service Brand Management</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure offered service brands, propose custom categories, or manage custom Work Types.
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'offered' ? (
            <Button onClick={() => setShowEditModal(true)} icon={<Edit className="w-4 h-4" />}>
              Edit Offered Services
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setShowProposeMain(true)} icon={<Plus className="w-4 h-4" />}>
                Propose Main Category
              </Button>
              <Button onClick={() => setShowProposeSub(true)} icon={<Plus className="w-4 h-4" />}>
                Propose Sub Service
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Elegant Sub-navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('offered')}
          className={`px-4 py-2.5 font-semibold text-sm border-b-2 transition-all ${activeTab === 'offered'
              ? 'border-brand-navy dark:border-brand-green text-brand-navy dark:text-brand-green'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
        >
          My Offered Services
        </button>
        <button
          onClick={() => setActiveTab('proposals')}
          className={`px-4 py-2.5 font-semibold text-sm border-b-2 transition-all ${activeTab === 'proposals'
              ? 'border-brand-navy dark:border-brand-green text-brand-navy dark:text-brand-green'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
        >
          Proposals & Request History
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'offered' ? (
        vendorServices.length === 0 ? (
          <EmptyState
            title="No Services Assigned"
            description="You have not selected any services you offer yet. Click 'Edit Offered Services' above to choose from the platform catalog."
            icon={<Wrench className="w-8 h-8 text-slate-400" />}
          />
        ) : loadingDb ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array(2).fill(0).map((_, i) => (
              <div key={i} className="skeleton h-48 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vendorServices.map((svc: any, idx: number) => {
              const displaySubServices = svc.sub_services || [];

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-navy/10 dark:bg-brand-green/10 flex items-center justify-center text-brand-navy dark:text-brand-green">
                          <Wrench className="w-5 h-5" />
                        </div>
                        <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-wide">
                          {svc.service}
                        </h4>
                      </div>
                    </div>

                    {displaySubServices.length === 0 ? (
                      <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                        No specific sub-services assigned.
                      </p>
                    ) : (
                      <div className="space-y-2.5">
                        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Sub Services (Click to view/propose Work Types):</p>
                        {displaySubServices.map((sub: string) => (
                          <div
                            key={sub}
                            className="flex items-center justify-between gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 transition-all hover:bg-brand-navy/5 hover:border-brand-navy/20 dark:hover:bg-brand-green/10 dark:hover:border-brand-green/20 cursor-pointer"
                          >
                            <div
                              className="flex items-center gap-2.5 flex-grow"
                              onClick={() => setSelectedSubService({ svc, subName: sub })}
                            >
                              <Check className="w-4 h-4 text-brand-green flex-shrink-0" />
                              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                {sub}
                              </span>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <span
                                onClick={() => setSelectedSubService({ svc, subName: sub })}
                                className="text-xs text-brand-navy dark:text-brand-green font-bold flex items-center gap-1"
                              >
                                Configure <ArrowRight className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )
      ) : (
        /* Proposals & Request History Tab */
        <Card>
          <div className="p-6">
            <h4 className="text-md font-bold text-slate-900 dark:text-white mb-4">Submitted Category & Work Type Proposals</h4>
            {loadingRequests ? (
              <div className="space-y-3">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="skeleton h-12 rounded-xl" />
                ))}
              </div>
            ) : proposals.length === 0 ? (
              <EmptyState
                title="No proposals found"
                description="You haven't proposed any new categories, sub-services, or work types yet. Click 'Propose Category' or configure a Sub-Service to add a Work Type."
                icon={<Mail className="w-8 h-8 text-slate-400" />}
              />
            ) : (
              <DataTable
                columns={[
                  { key: 'name', label: 'Proposed Item Name', sortable: true },
                  {
                    key: 'type', label: 'Proposal Level', sortable: true, render: (item: any) => (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-brand-navy/10 text-brand-navy dark:bg-brand-green/10 dark:text-brand-green font-bold">
                        {item.type}
                      </span>
                    )
                  },
                  { key: 'parent', label: 'Context / Parent', render: (item: any) => item.parent || '—' },
                  {
                    key: 'status', label: 'Status', render: (item: any) => (
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${item.status === 'approved'
                          ? 'badge-completed'
                          : item.status === 'rejected'
                            ? 'badge-cancelled'
                            : 'badge-pending'
                        }`}>
                        {item.status}
                      </span>
                    )
                  },
                ]}
                data={proposals}
                searchPlaceholder="Search request history..."
              />
            )}
          </div>
        </Card>
      )}

      {/* Edit Offered Services Modal */}
      <EditVendorServicesModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        dbServices={dbServices}
        currentServices={(profile as any)?.services || []}
        onSave={handleUpdateServices}
      />

      {/* Subservice & Work Types detail modal */}
      {selectedSubService && (
        <SubServiceDetailModal
          isOpen={!!selectedSubService}
          onClose={() => setSelectedSubService(null)}
          service={selectedSubService.svc}
          subServiceName={selectedSubService.subName}
          dbServices={dbServices}
          onNewRequest={fetchAllProposals}
        />
      )}

      {/* Propose Main Category Modal */}
      <ProposeMainServiceModal
        isOpen={showProposeMain}
        onClose={() => setShowProposeMain(false)}
        onSubmitted={() => {
          setActiveTab('proposals');
          fetchAllProposals();
        }}
      />

      {/* Propose Sub Service Modal */}
      <ProposeSubServiceModal
        isOpen={showProposeSub}
        onClose={() => setShowProposeSub(false)}
        dbServices={dbServices}
        onSubmitted={() => {
          setActiveTab('proposals');
          fetchAllProposals();
        }}
      />
    </div>
  );
}


export default function VendorDashboard() {
  const [collapsed, setCollapsed] = useState(true);
  const [dbServices, setDbServices] = useState<any[]>([]);
  const [loadingDb, setLoadingDb] = useState(true);

  const fetchServices = () => {
    setLoadingDb(true);
    api.get('/api/services')
      .then(res => {
        setDbServices(res.data || []);
      })
      .catch(err => {
        console.error('Failed to load services from DB', err);
      })
      .finally(() => setLoadingDb(false));
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark">
      <Sidebar role="vendor" collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className={`transition-all duration-300 ${collapsed ? 'ml-[72px]' : 'ml-[260px]'}`}>
        <Header />
        <main className="p-6">
          <Routes>
            <Route index element={<VendorHome />} />
            <Route path="schedule" element={<SlotCalendar dbServices={dbServices} />} />
            <Route path="bookings" element={<VendorBookings />} />
            <Route path="services" element={<VendorServices dbServices={dbServices} loadingDb={loadingDb} refreshServices={fetchServices} />} />

            <Route path="personnel" element={<VendorPersonnel dbServices={dbServices} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
