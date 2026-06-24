import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ClipboardList, MessageSquare, Building2, User, HelpCircle, Bug, X, AlertCircle } from 'lucide-react';
import { Button } from '../components/shared/Button';
import { formatBookingId } from '../utils/formatters';
import { Sidebar } from '../components/shared/Sidebar';
import { Header } from '../components/shared/Header';
import { Card, StatCard } from '../components/shared/Card';
import { DataTable } from '../components/shared/DataTable';
import { EmptyState } from '../components/shared/EmptyState';
import { NotificationsTab } from '../components/shared/NotificationsTab';
import { useAuth } from '../context/AuthContext';
import { useConfirm } from '../hooks/useConfirm';
import api from '../services/apiService';
import { LineChart } from '../components/shared/LineChart';
import { useChatMessages } from '../hooks/useChat';

function PersonnelChatModal({ 
  isOpen, 
  onClose, 
  type, 
  booking, 
  profile 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  type: 'hq' | 'customer'; 
  booking: any; 
  profile: any; 
}) {
  const threadId = type === 'hq' ? `hq_${profile.id}_${booking.vendor_id}` : booking.id;
  const { messages, loading, sendMessage, retryMessage } = useChatMessages(threadId);
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!inputText.trim()) return;
    try {
      await sendMessage(profile.id, 'technician', inputText, true);
      setInputText('');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col h-[600px] max-h-[90vh]">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${type === 'hq' ? 'bg-brand-navy' : 'bg-brand-green'}`}>
              {type === 'hq' ? <Building2 className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">
                {type === 'hq' ? 'Vendor HQ' : booking.customer_name || 'Customer'}
              </h3>
              <p className="text-xs text-slate-500 font-semibold">
                {type === 'hq' ? 'Internal Channel' : formatBookingId(booking.id)}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
             <div className="text-center py-4 text-sm text-slate-500">Loading messages...</div>
          ) : messages.length === 0 ? (
             <div className="text-center py-4 text-sm text-slate-500">No messages yet. Say hello!</div>
          ) : (
            // For customer channel, only show logistics messages!
            messages.filter(m => type === 'hq' ? true : m.is_logistics).map(msg => (
              <div key={msg.id} className={`flex ${msg.sender_role === 'system' ? 'justify-center' : msg.sender_id === profile.id ? 'justify-end' : 'justify-start'}`}>
                {msg.sender_role === 'system' ? (
                  <span className="text-xs bg-brand-green/10 text-brand-green px-3 py-1 rounded-full font-bold text-center max-w-[80%]">
                    {msg.text}
                  </span>
                ) : (
                  <div className="flex flex-col gap-1 items-end">
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.sender_id === profile.id ? 'bg-brand-green text-white rounded-br-none' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white rounded-bl-none'} ${msg.delivery_status === 'sending' ? 'opacity-70' : ''}`}>
                      {msg.sender_id !== profile.id && (
                        <div className="text-[10px] font-bold text-slate-400 mb-1">
                          {msg.sender_role === 'vendor' ? 'Vendor Manager' : booking.customer_name}
                        </div>
                      )}
                      <p className="text-sm">{msg.text}</p>
                    </div>
                    {msg.sender_id === profile.id && msg.delivery_status === 'sending' && (
                      <span className="text-[10px] text-slate-400">Sending...</span>
                    )}
                    {msg.sender_id === profile.id && msg.delivery_status === 'failed' && (
                      <button onClick={() => retryMessage(msg)} className="text-[10px] text-red-500 font-bold hover:underline flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Tap to retry
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Type your message..." 
              className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20" 
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <Button onClick={handleSend} className="bg-brand-green hover:bg-[#005e3f] text-white rounded-xl shadow-md">Send</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PersonnelHome() {
  const { profile } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      Promise.all([
        api.get(`/api/bookings/personnel/${profile.id}`),
        api.get(`/api/personnel/${profile.id}/dashboard-stats`)
      ]).then(([bookingsRes, statsRes]) => {
        setBookings(bookingsRes.data || []);
        setStats(statsRes.data);
      }).catch((err) => {
        console.error('Failed to fetch personnel dashboard data:', err);
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    console.log("[CAVEMAN] PersonnelHome loaded. Rendering Completed Jobs Trend only. stats:", stats);
  }, [stats]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {Array(2).fill(0).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
      </div>
    );
  }

  const activeJobs = bookings.filter(b => b.status === 'in_progress').length;
  const completedJobs = bookings.filter(b => b.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <StatCard title="Active Jobs" value={activeJobs} icon={<ClipboardList className="w-5 h-5" />} color="green" />
        <StatCard title="Completed Jobs" value={completedJobs} icon={<ClipboardList className="w-5 h-5" />} color="navy" />
      </div>

      <div className="w-full">
        <Card>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Completed Jobs Trend</h3>
          <LineChart
            data={stats?.completedJobsTrend ?? []}
            xKey="week"
            lines={[{ dataKey: 'completed', color: '#20b759', name: 'Completed Jobs' }]}
          />
        </Card>
      </div>
    </div>
  );
}

function PersonnelBookings() {
  const { profile } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [activeChat, setActiveChat] = useState<'hq' | 'customer' | null>(null);

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
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">ID: {formatBookingId(selectedBooking.id)}</p>
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
              {/* Voucher Discount Info */}
              {selectedBooking.discount_amount > 0 && (
                <>
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 font-medium">Subtotal:</span>
                    <span className="col-span-2 text-slate-500 dark:text-slate-400 font-semibold line-through">
                      ₱{selectedBooking.original_price || (selectedBooking.price * (selectedBooking.quantity || 1))}
                    </span>
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

        {/* ── Communication Action Sheet ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <button
            className="flex items-center justify-center gap-2 p-4 rounded-xl bg-brand-navy hover:bg-slate-800 text-white font-bold transition-all shadow-sm active:scale-95"
            onClick={() => setActiveChat('hq')}
          >
            <Building2 className="w-5 h-5" /> Message HQ
          </button>
          
          {/* Conditional Customer Messaging Button */}
          {(selectedBooking.status === 'dispatched' || selectedBooking.status === 'in-transit' || selectedBooking.status === 'in_progress' || selectedBooking.status === 'assigned') && (
            <button
              className="flex items-center justify-center gap-2 p-4 rounded-xl bg-brand-green hover:bg-[#005e3f] text-white font-bold transition-all shadow-sm active:scale-95"
              onClick={() => setActiveChat('customer')}
            >
              <MessageSquare className="w-5 h-5" /> Message Customer
            </button>
          )}
        </div>

        <PersonnelChatModal 
          isOpen={activeChat !== null}
          onClose={() => setActiveChat(null)}
          type={activeChat!}
          booking={selectedBooking}
          profile={profile}
        />
      </div>
    );
  }
  // ── END of details view ──

  // ── Default: bookings list with View Details button ──
  return (
    <DataTable
      columns={[
        { key: 'id', label: 'Booking ID', sortable: true, render: (item: any) => <span className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300">{formatBookingId(item.id)}</span> },
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

// ─── Personnel Help & Support Tab ────────────────────────────────────────────────
function PersonnelSupport() {
  const { confirm, ConfirmComponent } = useConfirm();
  const [showBugModal, setShowBugModal] = useState(false);
  const [bugForm, setBugForm] = useState({ description: '' });

  const handleSubmit = async () => {
    try {
      await api.post('/api/support', {
        role: 'personnel',
        issue_type: 'App Bug Report',
        message: bugForm.description,
        priority: 'medium'
      });
      confirm({
        title: 'Success',
        message: 'Bug reported successfully. Thank you for helping us improve!',
        type: 'success',
        hideCancel: true,
        confirmText: 'Okay'
      });
      setShowBugModal(false);
      setBugForm({ description: '' });
    } catch (err) {
      confirm({
        title: 'Error',
        message: 'Failed to report bug.',
        type: 'danger',
        hideCancel: true,
        confirmText: 'Okay'
      });
    }
  };

  return (
    <div className="space-y-6">
      <ConfirmComponent />
      <Card className="p-8 text-center bg-brand-navy border-none shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
            <HelpCircle className="w-8 h-8 text-brand-green" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">Personnel Support</h2>
          <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto">
            If you encounter issues with platform payouts or customer disputes, please contact your Vendor Manager directly via the Message HQ button in your jobs.
          </p>
          <p className="text-xs font-bold text-slate-400 mt-6 mb-2 uppercase tracking-widest">Experiencing technical issues?</p>
          <Button 
            onClick={() => setShowBugModal(true)} 
            className="bg-brand-green hover:bg-[#005e3f] text-white font-bold px-6 py-2 rounded-xl shadow-md flex items-center gap-2"
          >
            <Bug className="w-4 h-4" /> Report App Bug
          </Button>
        </div>
        <Bug className="absolute -right-8 -bottom-8 w-48 h-48 text-white/5 rotate-12" />
      </Card>

      {showBugModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bug className="w-5 h-5 text-brand-green" /> Report App Bug
              </h3>
              <button onClick={() => setShowBugModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500">Please describe the technical issue or error you experienced in the app.</p>
              <div>
                <textarea rows={5} placeholder="I clicked the complete job button and it crashed..." value={bugForm.description} onChange={e => setBugForm({...bugForm, description: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm"></textarea>
              </div>
            </div>
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowBugModal(false)}>Cancel</Button>
              <Button className="bg-brand-green hover:bg-[#005e3f] text-white" onClick={handleSubmit}>Submit Bug Report</Button>
            </div>
          </div>
        </div>
      )}
    </div>
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
            <Route index element={<PersonnelHome />} />
            <Route path="bookings" element={<PersonnelBookings />} />
            <Route path="profile" element={<PersonnelProfile />} />
            <Route path="notifications" element={<NotificationsTab />} />
            <Route path="support" element={<PersonnelSupport />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
