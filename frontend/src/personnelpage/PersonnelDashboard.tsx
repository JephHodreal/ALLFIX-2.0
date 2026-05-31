import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import { Sidebar } from '../components/shared/Sidebar';
import { Header } from '../components/shared/Header';
import { Card, StatCard } from '../components/shared/Card';
import { DataTable } from '../components/shared/DataTable';
import { EmptyState } from '../components/shared/EmptyState';
import { useAuth } from '../context/AuthContext';
import api from '../services/apiService';

function PersonnelHome() {
  const { profile } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      api.get(`/api/bookings/personnel/${profile.id}`)
        .then(r => setBookings(r.data || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [profile]);

  const activeJobs = bookings.filter(b => b.status === 'in_progress').length;
  const completedJobs = bookings.filter(b => b.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <StatCard title="Active Jobs" value={activeJobs} icon={<ClipboardList className="w-5 h-5" />} color="green" />
        <StatCard title="Completed Jobs" value={completedJobs} icon={<ClipboardList className="w-5 h-5" />} color="navy" />
      </div>
    </div>
  );
}

function PersonnelBookings() {
  const { profile } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  useEffect(() => {
    if (profile?.id) {
      api.get(`/api/bookings/personnel/${profile.id}`)
        .then(r => setBookings(r.data || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [profile]);

  const statusBadge = (status: string) => {
    const cls: Record<string, string> = {
      pending: 'badge-pending',
      confirmed: 'badge-confirmed',
      in_progress: 'badge-in-progress',
      completed: 'badge-completed',
      cancelled: 'badge-cancelled',
    };
    return <span className={cls[status] || 'badge'}>{status?.replace('_', ' ')}</span>;
  };

  // ── CAVEMAN MODE: if a booking is selected, show the READ-ONLY details view ──
  if (selectedBooking) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">

        {/* ── Header with Back button ── */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedBooking(null)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Booking Details</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">ID: {selectedBooking.id}</p>
            </div>
          </div>
          <div>{statusBadge(selectedBooking.status)}</div>
        </div>

        {/* ── Two-column: Service Info & Customer + Schedule ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Service Information */}
          <Card className="p-6 space-y-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm">
            <h4 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest border-b pb-2 border-slate-100 dark:border-slate-800">Service Information</h4>
            <div className="space-y-3 text-sm">

              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-400 font-medium">Service Category:</span>
                <span className="col-span-2 text-slate-900 dark:text-white font-bold">
                  {selectedBooking.sub_service || selectedBooking.service_type || '—'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-400 font-medium">Work Type:</span>
                <span className="col-span-2 text-slate-900 dark:text-white font-semibold">
                  {selectedBooking.service_type || '—'}
                </span>
              </div>

              {selectedBooking.description && (
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-400 font-medium">Description:</span>
                  <span className="col-span-2 text-slate-600 dark:text-slate-300 italic">
                    &ldquo;{selectedBooking.description}&rdquo;
                  </span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-medium">Booking Status:</span>
                <span className="col-span-2">{statusBadge(selectedBooking.status)}</span>
              </div>
            </div>
          </Card>

          {/* Customer & Schedule */}
          <Card className="p-6 space-y-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm">
            <h4 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest border-b pb-2 border-slate-100 dark:border-slate-800">Customer &amp; Schedule</h4>
            <div className="space-y-3 text-sm">

              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-400 font-medium">Customer:</span>
                <span className="col-span-2 text-slate-900 dark:text-white font-semibold">
                  {selectedBooking.customer_name || '—'}
                  {selectedBooking.customer_phone && (
                    <span className="text-xs text-slate-500 dark:text-slate-400 block font-normal">
                      {selectedBooking.customer_phone}
                    </span>
                  )}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-400 font-medium">Date &amp; Time:</span>
                <span className="col-span-2 text-slate-900 dark:text-white font-semibold">
                  📅 {selectedBooking.scheduled_date || '—'} &nbsp;⏰ {selectedBooking.scheduled_time || '—'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-400 font-medium">Address:</span>
                <span className="col-span-2 text-slate-700 dark:text-slate-300 leading-normal">
                  {selectedBooking.address || selectedBooking.service_address || '—'}
                </span>
              </div>

              {/* Assigned Personnel */}
              {selectedBooking.personnel_id && (
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 font-medium">Assigned To:</span>
                  <span className="col-span-2 text-slate-900 dark:text-white font-bold flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-brand-green flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <polyline points="16 11 18 13 22 9" />
                    </svg>
                    {profile?.id === selectedBooking.personnel_id
                      ? `${profile?.first_name} ${profile?.last_name} (You)`
                      : selectedBooking.personnel_id}
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* ── Payment Details (view-only) ── */}
        <Card className="p-6 space-y-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm">
          <h4 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest border-b pb-2 border-slate-100 dark:border-slate-800">Payment Details</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">

            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-400 font-medium">Unit Price:</span>
                <span className="col-span-2 text-slate-900 dark:text-white font-semibold">
                  ₱{selectedBooking.price || '0.00'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-400 font-medium">Quantity:</span>
                <span className="col-span-2 text-slate-900 dark:text-white font-semibold">
                  {selectedBooking.quantity || 1}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-900 dark:text-white font-black">Total:</span>
                <span className="col-span-2 text-lg font-black text-brand-green">
                  ₱{selectedBooking.total_price || (selectedBooking.price * (selectedBooking.quantity || 1)) || '0.00'}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-400 font-medium">Method:</span>
                <span className="col-span-2 text-slate-900 dark:text-white font-semibold">
                  {selectedBooking.payment_method || '—'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-400 font-medium">Reference:</span>
                <span className="col-span-2 font-mono text-slate-900 dark:text-white font-semibold">
                  {selectedBooking.payment_reference || '—'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-400 font-medium">Payment Status:</span>
                <span className="col-span-2">
                  {selectedBooking.payment_confirmed
                    ? <span className="badge-completed">Confirmed</span>
                    : <span className="badge-pending">Pending</span>
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Refund block — view-only, only shown if refund info exists */}
          {(selectedBooking.refund_reference_number || selectedBooking.refund_method) && (
            <div className="mt-2 p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/40 rounded-xl space-y-1.5 text-xs text-rose-800 dark:text-rose-350">
              <p className="font-extrabold uppercase tracking-wide">Linked Refund Information</p>
              <p><span className="font-bold">Refunded Amount:</span> ₱{selectedBooking.refund_amount}</p>
              <p><span className="font-bold">Method:</span> {selectedBooking.refund_method}</p>
              <p><span className="font-bold">Refund Ref No:</span> {selectedBooking.refund_reference_number}</p>
              {selectedBooking.refund_receiver_gcash_number && (
                <p><span className="font-bold">Receiver GCash:</span> {selectedBooking.refund_receiver_gcash_number}</p>
              )}
            </div>
          )}
        </Card>



      </div>
    );
  }
  // ── END of details view ──

  // ── Default: bookings list with View Details button ──
  return (
    <DataTable
      columns={[
        { key: 'service_type', label: 'Service', sortable: true },
        { key: 'scheduled_date', label: 'Date', sortable: true },
        { key: 'service_address', label: 'Address' },
        {
          key: 'status',
          label: 'Status',
          render: (item: any) => {
            const cls: Record<string, string> = {
              pending: 'badge-pending',
              confirmed: 'badge-confirmed',
              in_progress: 'badge-in-progress',
              completed: 'badge-completed',
              cancelled: 'badge-cancelled',
            };
            return <span className={cls[item.status] || 'badge'}>{item.status?.replace('_', ' ')}</span>;
          },
        },
        {
          key: 'actions',
          label: 'Actions',
          render: (item: any) => (
            <button
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                setSelectedBooking(item);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-navy hover:bg-[#0a2d5c] text-white text-xs font-semibold transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              View Details
            </button>
          ),
        },
      ]}
      data={bookings}
      loading={loading}
      emptyTitle="No assigned bookings"
      searchPlaceholder="Search bookings..."
    />
  );
}

function PersonnelProfile() {
  const { profile } = useAuth();
  if (!profile) return <EmptyState title="Profile not loaded" />;
  return (
    <Card>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">My Profile</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          ['First Name', profile.first_name],
          ['Last Name', profile.last_name],
          ['Email', profile.email],
          ['Phone', (profile as any).phone || '—'],
        ].map(([label, val]) => (
          <div key={label as string}>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</p>
            <p className="text-sm font-medium text-slate-900 dark:text-white">{val as string}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function PersonnelDashboard() {
  const [collapsed, setCollapsed] = useState(true);
  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark">
      <Sidebar role="personnel" collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className={`transition-all duration-300 ${collapsed ? 'ml-[72px]' : 'ml-[260px]'}`}>
        <Header />
        <main className="p-6">
          <Routes>
            <Route index element={<Navigate to="bookings" replace />} />
            <Route path="bookings" element={<PersonnelBookings />} />
            <Route path="profile" element={<PersonnelProfile />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
