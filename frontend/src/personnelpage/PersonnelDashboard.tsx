import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, MessageSquare, Building2, User, HelpCircle, Bug, X, AlertCircle, LayoutDashboard, CheckCircle } from 'lucide-react';
import { AdminPageHeader } from '../components/shared/AdminPageHeader';
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
import { PersonnelMessages } from '@/personnelpage/PersonnelMessages';
import { MobileBottomNav } from '../components/shared/MobileBottomNav';

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
  const { messages, loading, sendMessage, retryMessage } = useChatMessages(threadId, profile?.id);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const prevMessagesLength = React.useRef(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (messagesEndRef.current) {
        const isInitialLoad = prevMessagesLength.current === 0 || messages.length === 0;
        messagesEndRef.current.scrollIntoView({ behavior: isInitialLoad ? 'auto' : 'smooth' });
        prevMessagesLength.current = messages.length;
      }
    }, 100);
    return () => clearTimeout(timeout);
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const msgText = inputText;
    setInputText('');
    try {
      await sendMessage(profile.id, 'technician', msgText, true, (profile as any)?.avatar_url);
    } catch (e) {
      console.error(e);
      setInputText(msgText); // Revert on error
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col h-[600px] max-h-[90vh]">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950 shrink-0">
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
            messages.filter(m => type === 'hq' ? true : m.is_logistics).map((msg, idx, filteredArray) => {
              const prevMsg = idx > 0 ? filteredArray[idx - 1] : null;
              const nextMsg = idx < filteredArray.length - 1 ? filteredArray[idx + 1] : null;
              
              const isNextSame = nextMsg && nextMsg.sender_id === msg.sender_id && nextMsg.sender_role !== 'system';
              const timeDiff = nextMsg && msg.created_at && nextMsg.created_at ? 
                ((nextMsg.created_at?.toDate?.() || new Date(nextMsg.created_at)).getTime() - (msg.created_at?.toDate?.() || new Date(msg.created_at)).getTime()) : 0;
              
              const showAvatar = msg.sender_id !== profile.id && (!isNextSame || timeDiff > 60000);

              return (
                <div key={msg.id} className={`flex ${msg.sender_role === 'system' ? 'justify-center' : msg.sender_id === profile.id ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender_role === 'system' ? (
                    <span className="text-xs bg-brand-green/10 text-brand-green px-3 py-1 rounded-full font-bold text-center max-w-[80%]">
                      {msg.text}
                    </span>
                  ) : (
                    <div className={`flex items-end gap-2 max-w-[80%] ${msg.sender_id === profile.id ? 'flex-row-reverse' : 'flex-row'}`}>
                      {msg.sender_id !== profile.id && (
                        <div className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 flex items-end justify-center">
                          {showAvatar && (
                            <div className="w-full h-full rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center border border-slate-300 dark:border-slate-600">
                              {msg.sender_avatar ? (
                                <img src={msg.sender_avatar} alt="avatar" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                  {msg.sender_role === 'vendor' ? 'V' : msg.sender_role === 'customer' ? 'C' : 'T'}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      <div className={`flex flex-col gap-1 ${msg.sender_id === profile.id ? 'items-end' : 'items-start'}`}>
                        <div className={`min-w-[120px] rounded-2xl px-4 py-2 ${msg.sender_id === profile.id ? 'bg-brand-green text-white rounded-br-none' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white rounded-bl-none'} ${msg.delivery_status === 'sending' ? 'opacity-70' : ''}`}>
                          {msg.sender_id !== profile.id && showAvatar && (
                            <div className="text-[10px] font-bold text-slate-400 mb-1">
                              {msg.sender_role === 'vendor' ? 'Vendor Manager' : booking.customer_name}
                            </div>
                          )}
                          <p className="text-sm">{msg.text}</p>
                          {msg.sender_id === profile.id && (
                            <div className="text-[9px] text-white/80 text-right mt-1 flex justify-end items-center gap-0.5">
                              {msg.created_at ? (typeof msg.created_at.toDate === 'function' ? msg.created_at.toDate() : new Date(msg.created_at)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '2:53 PM'}
                              <span className={msg.is_read ? 'text-blue-200 font-black tracking-tighter text-[11px]' : 'text-slate-300/60 font-bold'}>
                                {msg.is_read ? '✓✓' : '✓'}
                              </span>
                            </div>
                          )}
                        </div>
                        {msg.sender_id === profile.id && msg.delivery_status === 'sending' && (
                          <span className="text-[10px] text-slate-400">Sending...</span>
                        )}
                        {msg.sender_id === profile.id && msg.delivery_status === 'failed' && (
                          <button onClick={() => retryMessage(msg)} className="text-[10px] text-red-500 font-bold hover:underline flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Tap to retry
                          </button>
                        )}
                        {msg.sender_id !== profile.id && (
                          <div className="text-[9px] text-slate-400 mt-1">
                            {msg.created_at ? (typeof msg.created_at.toDate === 'function' ? msg.created_at.toDate() : new Date(msg.created_at)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Type your message..." 
              className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20" 
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button 
              onClick={handleSend} 
              disabled={!inputText.trim()}
              className={`rounded-xl ${!inputText.trim() ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 !opacity-100' : 'bg-brand-green hover:bg-[#005e3f] text-white shadow-md'}`}
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PersonnelHome() {
  const { profile } = useAuth();
  const navigate = useNavigate();
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

  const activeJobs = bookings.filter(b => b?.status === 'in_progress').length;
  const completedJobs = bookings.filter(b => b?.status === 'completed').length;

  // Truly upcoming: assigned or confirmed but not yet started
  const nextJob = (Array.isArray(bookings) ? [...bookings] : [])
    .filter(b => b && ['assigned', 'confirmed'].includes(b.status))
    .sort((a, b) => {
      const dateA = a?.scheduled_date ? new Date(a.scheduled_date).getTime() : Infinity;
      const dateB = b?.scheduled_date ? new Date(b.scheduled_date).getTime() : Infinity;
      return dateA - dateB;
    })[0];

  // Already started: dispatched, in-transit, or in_progress
  const activeJob = (Array.isArray(bookings) ? [...bookings] : [])
    .filter(b => b && ['dispatched', 'in-transit', 'in_progress'].includes(b.status))
    .sort((a, b) => {
      const dateA = a?.scheduled_date ? new Date(a.scheduled_date).getTime() : Infinity;
      const dateB = b?.scheduled_date ? new Date(b.scheduled_date).getTime() : Infinity;
      return dateA - dateB;
    })[0];

  const jobCardData = activeJob || nextJob;
  const isOngoing = !!activeJob;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dashboard"
        subtitle="Your field overview, upcoming jobs, and performance trend."
        icon={<LayoutDashboard />}
      />
      <div className="grid grid-cols-2 gap-4">
        <StatCard title="Active Jobs" value={activeJobs} icon={<ClipboardList className="w-5 h-5" />} color="green" />
        <StatCard title="Completed Jobs" value={completedJobs} icon={<ClipboardList className="w-5 h-5" />} color="navy" />
      </div>

      {jobCardData && (
        <Card className="bg-brand-navy border-none shadow-lg overflow-hidden relative p-5 sm:p-6">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className={`text-[10px] font-extrabold uppercase tracking-widest mb-1 ${
                isOngoing ? 'text-amber-400' : 'text-brand-green'
              }`}>
                {isOngoing ? '🟡 Active Job In Progress' : 'Next Scheduled Job'}
              </p>
              <h3 className="text-lg font-black text-white">
                {formatBookingId(jobCardData.id)} — {jobCardData.service_type || jobCardData.service_category || '—'}
              </h3>
              <p className="text-sm font-semibold text-slate-300 mt-1 truncate max-w-sm">
                {(() => {
                  if (!jobCardData.scheduled_date) return 'TBD';
                  const d = new Date(jobCardData.scheduled_date);
                  return isNaN(d.getTime()) ? 'TBD' : d.toLocaleDateString();
                })()} @ {jobCardData.scheduled_time || 'TBD'} • {jobCardData.service_address || jobCardData.customer_address || 'Location provided upon dispatch'}
              </p>
            </div>
            <button
              onClick={() => navigate('/personnel/bookings')}
              className={`font-bold px-6 py-3 rounded-xl shadow-md transition-colors w-full sm:w-auto text-sm whitespace-nowrap active:scale-95 flex items-center justify-center gap-2 ${
                isOngoing
                  ? 'bg-amber-400 hover:bg-amber-500 text-slate-900'
                  : 'bg-brand-green hover:bg-[#005e3f] text-white'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              {isOngoing ? 'Continue Job' : 'View Dispatch'}
            </button>
          </div>
          <ClipboardList className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5 rotate-12 pointer-events-none" />
        </Card>
      )}

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
  const { confirm, ConfirmComponent } = useConfirm();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [activeChat, setActiveChat] = useState<'hq' | 'customer' | null>(null);
  const [hasConfirmedHq, setHasConfirmedHq] = useState(false);
  const [hasConfirmedCustomer, setHasConfirmedCustomer] = useState(false);

  // Proof of Work Modal State
  const [showProofModal, setShowProofModal] = useState(false);
  const [proofNote, setProofNote] = useState('');
  const [proofImageUrl, setProofImageUrl] = useState('');
  const [uploadingProof, setUploadingProof] = useState(false);

  const handleProofFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingProof(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = reader.result as string;
        const res = await api.post('/api/upload/image', {
          image: base64,
          folder: 'proof_of_work'
        });
        setProofImageUrl(res.data.url);
      } catch (err: any) {
        console.error('Upload failed', err);
      } finally {
        setUploadingProof(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateStatus = (newStatus: string, label: string) => {
    confirm({
      title: `Confirm ${label}`,
      message: `Are you sure you want to mark this booking as ${label}?`,
      type: 'info',
      confirmText: `Yes, ${label}`,
      onConfirm: async () => {
        try {
          await api.put(`/api/bookings/${selectedBooking.id}`, { status: newStatus });
          const updated = await api.get(`/api/bookings/${selectedBooking.id}`);
          setSelectedBooking(updated.data);
          setBookings(bookings.map((b: any) => b.id === selectedBooking.id ? updated.data : b));
        } catch (err) {
          confirm({ title: 'Error', message: 'Failed to update booking status.', type: 'danger', hideCancel: true, confirmText: 'Okay' });
        }
      }
    });
  };

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
      in_progress: 'badge-in-progress',
      job_done: 'badge-in-progress bg-blue-100 text-blue-800',
      completed: 'badge-completed',
      cancelled: 'badge-cancelled',
    };
    return <span className={cls[status] || 'badge'}>{status?.replace('_', ' ')}</span>;
  };

  // ── CAVEMAN MODE: if a booking is selected, show the READ-ONLY details view ──
  if (selectedBooking) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">

        {/* ── Header with Back button ── */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
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

        {/* ── Two-column Layout: Service Info & Payment Info ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Service Information */}
          <Card className="p-4 sm:p-5 space-y-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm">
            <h4 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest border-b pb-2 border-slate-100 dark:border-slate-800">Service Information</h4>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-400 font-medium">Service Category:</span>
                <span className="col-span-2 text-slate-900 dark:text-white font-semibold">
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
                  <span className="col-span-2 text-slate-600 dark:text-slate-300 italic leading-tight">
                    &ldquo;{selectedBooking.description}&rdquo;
                  </span>
                </div>
              )}
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
                <span className="col-span-2 text-slate-700 dark:text-slate-300 leading-tight">
                  {selectedBooking.address || selectedBooking.service_address || '—'}
                </span>
              </div>
              {selectedBooking.personnel_id && (
                <div className="grid grid-cols-3 gap-2 pt-2 mt-1 border-t border-slate-100 dark:border-slate-800/60 items-center">
                  <span className="text-slate-400 font-medium">Assigned To:</span>
                  <span className="col-span-2 text-slate-900 dark:text-white font-bold flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-brand-green flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
                    {profile?.id === selectedBooking.personnel_id
                      ? `${profile?.first_name} ${profile?.last_name} (You)`
                      : selectedBooking.personnel_id}
                  </span>
                </div>
              )}
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
            </div>

            {/* Additional Charges / Add-ons Section */}
            {((selectedBooking.add_ons && selectedBooking.add_ons.length > 0) || (selectedBooking.status === 'in_progress' || selectedBooking.status === 'assigned' || selectedBooking.status === 'dispatched' || selectedBooking.status === 'in-transit')) && (
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Additional Charges</h4>
                  {selectedBooking.status !== 'completed' && selectedBooking.status !== 'cancelled' && (
                    <button
                      className="text-[11px] font-bold text-brand-navy dark:text-slate-200 hover:text-brand-blue dark:hover:text-white flex items-center gap-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-2 py-1 rounded transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      Add Extra Service / Parts
                    </button>
                  )}
                </div>
                
                {selectedBooking.add_ons && selectedBooking.add_ons.length > 0 ? (
                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                    {selectedBooking.add_ons.map((addon: any) => (
                      <div key={addon.id} className="flex flex-col sm:flex-row sm:items-center px-2.5 py-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800 text-[13px] sm:text-sm gap-2">
                        <div className="font-medium text-slate-700 dark:text-slate-300 flex-1 min-w-0 pr-2">
                          {addon.description}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-bold text-slate-900 dark:text-white shrink-0">₱{Number(addon.amount).toFixed(2)}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            {addon.status === 'pending_approval' && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider bg-amber-100 text-amber-700 rounded whitespace-nowrap">Pending Cust. Approval</span>
                            )}
                            {addon.status === 'pending_verification' && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider bg-blue-100 text-blue-700 rounded whitespace-nowrap">Pending Admin Verif.</span>
                            )}
                            {addon.status === 'confirmed' && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider bg-emerald-100 text-emerald-700 rounded whitespace-nowrap">Confirmed</span>
                            )}
                            {addon.status === 'pending_approval' && (
                              <button
                                className="text-slate-400 hover:text-red-500 transition-colors p-0.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 cursor-not-allowed opacity-50"
                                title="Cannot cancel request from this dashboard"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 text-center py-1.5 italic bg-slate-50 dark:bg-slate-900/50 rounded flex items-center justify-center">No additional charges</div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            {/* Communication Actions */}
            <div className="flex gap-3">
              <button
                className="flex flex-1 items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-navy hover:bg-slate-800 text-white font-bold transition-all text-sm shadow-sm"
                onClick={() => {
                  if (hasConfirmedHq) {
                    setActiveChat('hq');
                    return;
                  }
                  confirm({
                    title: 'Message HQ',
                    message: 'Are you sure you want to open a chat with HQ?',
                    type: 'info',
                    confirmText: 'Yes',
                    onConfirm: () => {
                      setHasConfirmedHq(true);
                      setActiveChat('hq');
                    }
                  });
                }}
              >
                <Building2 className="w-4 h-4" /> Message HQ
              </button>
              
              {(selectedBooking.status === 'dispatched' || selectedBooking.status === 'in-transit' || selectedBooking.status === 'in_progress' || selectedBooking.status === 'assigned') && (
                <button
                  className="flex flex-1 items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-green/10 hover:bg-brand-green/20 text-brand-green font-bold transition-all text-sm shadow-sm"
                  onClick={() => {
                    if (hasConfirmedCustomer) {
                      setActiveChat('customer');
                      return;
                    }
                    confirm({
                      title: 'Message Customer',
                      message: 'Are you sure you want to message the customer directly?',
                      type: 'info',
                      confirmText: 'Yes',
                      onConfirm: () => {
                        setHasConfirmedCustomer(true);
                        setActiveChat('customer');
                      }
                    });
                  }}
                >
                  <MessageSquare className="w-4 h-4" /> Message Customer
                </button>
              )}
            </div>
  
            {/* Status Actions */}
            <div className="flex w-full gap-3">
              {(selectedBooking.status === 'confirmed' || selectedBooking.status === 'assigned') && (
                <button
                  className="flex flex-1 items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold transition-all text-sm shadow-sm"
                  onClick={() => handleUpdateStatus('dispatched', 'Dispatched')}
                >
                  Start Job
                </button>
              )}
              {selectedBooking.status === 'dispatched' && (
                <button
                  className="flex flex-1 items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-all text-sm shadow-sm"
                  onClick={() => handleUpdateStatus('in-transit', 'In Transit')}
                >
                  In Transit
                </button>
              )}
              {selectedBooking.status === 'in-transit' && (
                <button
                  className="flex flex-1 items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold transition-all text-sm shadow-sm"
                  onClick={() => handleUpdateStatus('in_progress', 'In Progress')}
                >
                  Arrived
                </button>
              )}
              {selectedBooking.status === 'in_progress' && (() => {
                const hasPendingAddons = selectedBooking.add_ons?.some((addon: any) => addon.status === 'pending_approval' || addon.status === 'pending_verification');
                return (
                  <button
                    className={`flex flex-1 items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold transition-all text-sm shadow-sm ${
                      hasPendingAddons
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-300 dark:border-slate-700'
                        : 'bg-brand-green hover:bg-[#005e3f] text-white'
                    }`}
                    onClick={() => {
                      if (hasPendingAddons) {
                        confirm({
                          title: 'Pending Additional Charges',
                          message: 'You have extra services or parts that are still pending customer approval or admin verification. Please wait for all charges to be confirmed before completing the job.',
                          type: 'warning',
                          hideCancel: true,
                          confirmText: 'Understood'
                        });
                        return;
                      }
                      setShowProofModal(true);
                    }}
                  >
                    <ClipboardList className="w-4 h-4" /> Complete Job
                  </button>
                );
              })()}
            </div>
          </div>

        <PersonnelChatModal 
          isOpen={activeChat !== null}
          onClose={() => setActiveChat(null)}
          type={activeChat!}
          booking={selectedBooking}
          profile={profile}
        />
        <ConfirmComponent />

        {/* Upload Proof of Work Modal */}
        <AnimatePresence>
          {showProofModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowProofModal(false)} />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-slate-100 dark:border-slate-800">
                <div className="p-6 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Complete Job</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Please provide proof of work to request final approval.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Photo Evidence (Optional)</label>
                      <input type="file" accept="image/*" onChange={handleProofFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-brand-green/10 file:text-brand-green hover:file:bg-brand-green/20" />
                      {uploadingProof && <p className="text-xs text-brand-blue mt-2 font-bold animate-pulse">Uploading...</p>}
                      {proofImageUrl && <img src={proofImageUrl} alt="Proof" className="mt-3 rounded-xl max-h-32 object-cover border border-slate-200 dark:border-slate-800" />}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Closing Note (Optional)</label>
                      <textarea
                        rows={3}
                        placeholder="E.g., Screen replaced, tested, works perfectly."
                        value={proofNote}
                        onChange={e => setProofNote(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setShowProofModal(false)} className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                    <button
                      disabled={uploadingProof}
                      onClick={async () => {
                        try {
                          await api.put(`/api/bookings/${selectedBooking.id}`, { 
                            status: 'job_done',
                            proof_note: proofNote,
                            proof_image_url: proofImageUrl
                          });
                          const updated = await api.get(`/api/bookings/${selectedBooking.id}`);
                          setSelectedBooking(updated.data);
                          setBookings(bookings.map((b: any) => b.id === selectedBooking.id ? updated.data : b));
                          setShowProofModal(false);
                        } catch (err) {
                          confirm({ title: 'Error', message: 'Failed to complete job.', type: 'danger', hideCancel: true, confirmText: 'Okay' });
                        }
                      }}
                      className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-brand-green hover:bg-[#005e3f] disabled:opacity-50 transition-colors"
                    >
                      Submit & Complete
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }
  // ── END of details view ──

  // ── Default: bookings list with View Details button ──
  return (
    <div className="space-y-0">
      <AdminPageHeader
        title="My Bookings"
        subtitle="Your assigned jobs, dispatch details, and proof of work submissions."
        icon={<ClipboardList />}
      />
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
              job_done: 'badge-in-progress bg-blue-100 text-blue-800',
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
    </div>
  );
}

// ─── Personnel Profile Tab ───────────────────────────────────────────────────────
function PersonnelProfile() {
  const { profile, refreshProfile } = useAuth();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { confirm: showAlert, ConfirmComponent } = useConfirm();
  
  const [avatarUrl, setAvatarUrl] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  
  // Local state placeholders for features not yet in the DB
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [contactData, setContactData] = useState({ phone: '' });
  
  const [isEditingSafety, setIsEditingSafety] = useState(false);
  const [safetyData, setSafetyData] = useState({ eName: '', eRel: '', ePhone: '' });
  const [savedSafetyData, setSavedSafetyData] = useState({ eName: 'Maria Cruz', eRel: 'Spouse', ePhone: '0917-000-0000' });

  useEffect(() => {
    if (profile) {
      setAvatarUrl((profile as any).avatar_url || '');
      setContactData({ phone: (profile as any).phone || '' });
    }
  }, [profile]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarUrl(URL.createObjectURL(file));
      setSelectedAvatar(file);
    }
  };

  const handleSaveAvatar = async () => {
    if (!selectedAvatar) return;
    showAlert({
      title: 'Confirm Photo Upload',
      message: 'Are you sure you want to update your professional photo?',
      type: 'info',
      confirmText: 'Yes, Upload',
      onConfirm: () => {
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const res = await api.post('/api/upload/image', {
              image: reader.result,
              folder: 'personnel/avatar'
            });
            await api.put(`/api/personnel/${profile?.id}`, { avatar_url: res.data.url });
            showAlert({ title: 'Success', message: 'Professional photo updated!', type: 'success', hideCancel: true });
            setSelectedAvatar(null);
            await refreshProfile();
          } catch (err) {
            console.error("Failed to upload photo", err);
            showAlert({ title: 'Error', message: 'Failed to upload photo.', type: 'danger', hideCancel: true });
          }
        };
        reader.readAsDataURL(selectedAvatar);
      }
    });
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    showAlert({
      title: 'Confirm Update',
      message: 'Are you sure you want to update your mobile number?',
      type: 'info',
      confirmText: 'Yes, Update',
      onConfirm: async () => {
        try {
          await api.put(`/api/personnel/${profile?.id}`, { phone: contactData.phone });
          setIsEditingContact(false);
          await refreshProfile();
          showAlert({ title: 'Success', message: 'Contact number updated!', type: 'success', hideCancel: true });
        } catch (err) {
          showAlert({ title: 'Error', message: 'Failed to save contact number.', type: 'danger', hideCancel: true });
        }
      }
    });
  };

  const handleSaveSafety = (e: React.FormEvent) => {
    e.preventDefault();
    showAlert({
      title: 'Confirm Update',
      message: 'Are you sure you want to save this emergency contact?',
      type: 'info',
      confirmText: 'Yes, Save',
      onConfirm: () => {
        setSavedSafetyData(safetyData);
        setIsEditingSafety(false);
        showAlert({ title: 'Success', message: 'Emergency contact updated!', type: 'success', hideCancel: true });
      }
    });
  };

  if (!profile) return <EmptyState title="Profile not loaded" />;

  const btnBase = "inline-flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 w-full sm:w-auto";
  const btnSuccess = `${btnBase} text-white bg-brand-green hover:bg-[#005e3f] focus:ring-brand-green dark:bg-brand-green dark:hover:bg-[#005e3f]`;
  const btnGhost = `${btnBase} text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 focus:ring-slate-900 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-700`;
  const inputClass = "w-full mt-1.5 px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:focus:border-white dark:focus:ring-white transition-all shadow-sm";

  const EditButton = ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick} className={btnGhost}>
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
      Edit
    </button>
  );

  return (
    <div className="space-y-3 h-full flex flex-col">
      <AdminPageHeader
        title="My Profile"
        subtitle="Manage your identity, service specialties, and emergency contacts."
        icon={<User />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-stretch flex-1 pb-2">
        {/* ─── LEFT COLUMN ─── */}
        <div className="lg:col-span-1 flex flex-col gap-3">
          <Card className="flex flex-col items-center justify-center text-center p-4">
            <div className="relative group mb-4">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-slate-800 shadow-lg overflow-hidden bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Professional Photo" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-slate-400" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/50 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer focus:outline-none"
              >
                <span className="text-xs font-semibold px-2 text-center">Change Photo</span>
              </button>
              <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white break-words w-full">
              {profile.first_name} {profile.last_name}
            </h2>
            <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 truncate w-full mb-3">
              {profile.email}
            </p>
            <div className="w-full flex flex-col gap-2">
              {!selectedAvatar ? (
                <button onClick={() => fileInputRef.current?.click()} className={`${btnGhost} w-full`}>Upload Photo</button>
              ) : (
                <div className="flex gap-2 w-full">
                  <button onClick={() => { setAvatarUrl((profile as any).avatar_url || ''); setSelectedAvatar(null); }} className={`${btnGhost} flex-1`}>Cancel</button>
                  <button onClick={handleSaveAvatar} className={`${btnSuccess} flex-1`}>Save</button>
                </div>
              )}
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
          {/* Logistics Card */}
          <Card className="flex flex-col p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">Field Contact Info</h2>
            </div>
            {!isEditingContact ? (
              <div className="space-y-2.5">
                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-0.5">Mobile Number (For Customers)</span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white break-words">{(profile as any).phone || '—'}</span>
                  </div>
                  <EditButton onClick={() => setIsEditingContact(true)} />
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveContact} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Mobile Number</label>
                  <input type="text" value={contactData.phone} onChange={(e) => setContactData({ ...contactData, phone: e.target.value })} className={inputClass} autoFocus />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setIsEditingContact(false)} className={btnGhost}>Cancel</button>
                  <button type="submit" className={btnSuccess}>Save Changes</button>
                </div>
              </form>
            )}
          </Card>

          {/* Capabilities Card */}
          <Card className="flex flex-col p-4">
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white mb-3">Service Specialties</h2>
            <div className="flex flex-wrap gap-2">
               <span className="px-3 py-1.5 bg-brand-navy/10 text-brand-navy font-bold text-xs rounded-lg border border-brand-navy/20">Desktop Repair</span>
               <span className="px-3 py-1.5 bg-brand-navy/10 text-brand-navy font-bold text-xs rounded-lg border border-brand-navy/20">Printer Setup</span>
               <span className="px-3 py-1.5 bg-slate-100 text-slate-500 font-bold text-xs rounded-lg border border-slate-200 border-dashed hover:bg-slate-200 cursor-pointer transition-colors flex items-center gap-1">+ Add Specialty</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">These tags help your Vendor Manager assign you to the correct jobs.</p>
          </Card>

          {/* Safety Card */}
          <Card className="flex flex-col p-4 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-rose-600 dark:text-rose-400 flex items-center gap-2">
                 <AlertCircle className="w-4 h-4" /> Emergency Contact
              </h2>
              <EditButton onClick={() => { setIsEditingSafety(true); setSafetyData(savedSafetyData); }} />
            </div>
            
            <div className="space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-3 gap-x-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col">
                  <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-0.5">Name</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{savedSafetyData.eName || '—'}</p>
                </div>
                <div className="flex flex-col">
                  <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-0.5">Relationship</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{savedSafetyData.eRel || '—'}</p>
                </div>
                <div className="flex flex-col">
                  <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-0.5">Phone Number</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{savedSafetyData.ePhone || '—'}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Emergency Contact Modal */}
      {isEditingSafety && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 relative z-10">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-500" /> Edit Emergency Contact
              </h3>
              <button type="button" onClick={() => setIsEditingSafety(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveSafety}>
              <div className="p-6 space-y-4">
                <p className="text-xs text-slate-500">Please provide the contact details of the person we should reach out to in case of an emergency while you're on the field.</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Full Name</label>
                    <input type="text" placeholder="e.g. Maria Cruz" value={safetyData.eName} onChange={(e) => setSafetyData({ ...safetyData, eName: e.target.value })} className={inputClass} required />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Relationship</label>
                    <input type="text" placeholder="e.g. Spouse, Parent, Sibling" value={safetyData.eRel} onChange={(e) => setSafetyData({ ...safetyData, eRel: e.target.value })} className={inputClass} required />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Phone Number</label>
                    <input type="text" placeholder="e.g. 0917-000-0000" value={safetyData.ePhone} onChange={(e) => setSafetyData({ ...safetyData, ePhone: e.target.value })} className={inputClass} required />
                  </div>
                </div>
              </div>
              <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-950">
                <Button type="button" variant="outline" onClick={() => setIsEditingSafety(false)}>Cancel</Button>
                <Button type="submit" className="bg-brand-green hover:bg-[#005e3f] text-white">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmComponent />
    </div>
  );
}

// ─── Personnel Help & Support Tab ────────────────────────────────────────────────
function PersonnelSupport() {
  const { confirm, ConfirmComponent } = useConfirm();
  const [showBugModal, setShowBugModal] = useState(false);
  const [bugForm, setBugForm] = useState({ description: '' });

  const handleSubmit = () => {
    confirm({
      title: 'Submit Bug Report',
      message: 'Are you sure you want to submit this bug report?',
      type: 'info',
      confirmText: 'Yes, Submit',
      onConfirm: async () => {
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
      }
    });
  };

  return (
    <div className="space-y-6">
      <ConfirmComponent />
      <AdminPageHeader
        title="Help &amp; Support"
        subtitle="Report technical issues or contact your Vendor Manager for field concerns."
        icon={<HelpCircle />}
      />
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
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark">
      <Sidebar role="personnel" collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className={`transition-all duration-300 ${collapsed ? 'md:ml-[72px]' : 'md:ml-[260px]'}`}>
        <Header onMenuToggle={() => setMobileOpen(true)} />
        <main className="p-4 md:p-6 pb-24 lg:pb-6">
          <Routes>
            <Route index element={<PersonnelHome />} />
            <Route path="bookings" element={<PersonnelBookings />} />
            <Route path="messages" element={<PersonnelMessages />} />
            <Route path="profile" element={<PersonnelProfile />} />
            <Route path="notifications" element={<NotificationsTab />} />
            <Route path="support" element={<PersonnelSupport />} />
          </Routes>
        </main>
      </div>
      <MobileBottomNav role="personnel" />
    </div>
  );
}
