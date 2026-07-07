import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Clock, Trash2, Check, CheckCircle2, AlertCircle, Ticket, Calendar, RefreshCcw, LifeBuoy } from 'lucide-react';
import api from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../shared/EmptyState';
import { AdminPageHeader } from './AdminPageHeader';
import { useNavigate, useLocation } from 'react-router-dom';
export function NotificationsTab() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.resetFilter) {
      setCategoryFilter('All');
      // Clear the state so it doesn't get stuck if they navigate away and back
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const isPersonnel = profile?.role === 'personnel';

  const getCategory = (n: any) => {
    const t = (n.type || n.title || '').toLowerCase();
    const m = (n.message || '').toLowerCase();
    // ── Personnel-specific categories ──
    if (isPersonnel) {
      if (t.includes('message') || m.includes('message')) return 'Message';
      if (
        t.includes('assignment') || t.includes('assigned') ||
        t.includes('job') || t.includes('cancel') ||
        t.includes('completed') || t.includes('add-on') ||
        t.includes('add_on') || t.includes('verified') ||
        t.includes('unassigned') || t.includes('charge')
      ) return 'Assigned Job';
      return 'Other';
    }
    // ── Generic categories for all other roles ──
    if (t.includes('voucher') || m.includes('voucher')) return 'Voucher';
    if (t.includes('payment') || m.includes('payment') || t.includes('refund')) return 'Payment';
    if (t.includes('message') || m.includes('message')) return 'Message';
    if (t.includes('book') || t.includes('schedul') || t.includes('cancel')) return 'Booking';
    return 'Other';
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [profile?.id]);

  const fetchNotifications = async () => {
    if (!profile?.id) return;
    try {
      const res = await api.get(`/api/notifications/${profile.id}`);
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true, read: true } : n));
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const markAsUnread = async (id: string) => {
    try {
      await api.patch(`/api/notifications/${id}/unread`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: false, read: false } : n));
    } catch (err) {
      console.error("Failed to mark as unread", err);
    }
  };

  const markAllAsUnread = async () => {
    for (const n of notifications) {
      if (n.is_read || n.read) {
        await markAsUnread(n.id);
      }
    }
  };

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/api/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error("Failed to delete notification", err);
    }
  };

  const markAllAsRead = async () => {
    for (const n of notifications) {
      if (!(n.is_read || n.read)) {
        await markAsRead(n.id);
      }
    }
  };

  const formatDate = (date: any) => {
    if (!date) return '';
    if (typeof date === 'string') return new Date(date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    if (date.seconds) return new Date(date.seconds * 1000).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    if (date._seconds) return new Date(date._seconds * 1000).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    return '';
  };

  const getNotificationStyle = (n: any) => {
    const t = (n.type || n.title || '').toLowerCase();
    
    // Formal premium aesthetic: monochromatic icons and subtle backgrounds
    const baseBorder = "border-slate-200 dark:border-slate-700/60";
    const baseBg = "bg-slate-50 dark:bg-slate-800/40";
    
    if (t.includes('confirm') || t.includes('approve') || t.includes('success')) {
      return { icon: <CheckCircle2 className="w-5 h-5 text-slate-700 dark:text-slate-300" />, bg: baseBg, border: baseBorder };
    }
    if (t.includes('cancel') || t.includes('reject') || t.includes('fail')) {
      return { icon: <AlertCircle className="w-5 h-5 text-slate-700 dark:text-slate-300" />, bg: baseBg, border: baseBorder };
    }
    if (t.includes('voucher') || t.includes('discount') || t.includes('promo')) {
      return { icon: <Ticket className="w-5 h-5 text-slate-700 dark:text-slate-300" />, bg: baseBg, border: baseBorder };
    }
    if (t.includes('book') || t.includes('schedul')) {
      return { icon: <Calendar className="w-5 h-5 text-slate-700 dark:text-slate-300" />, bg: baseBg, border: baseBorder };
    }
    return { icon: <Bell className="w-5 h-5 text-slate-700 dark:text-slate-300" />, bg: baseBg, border: baseBorder };
  };

  const filteredNotifications = notifications.filter(n => {
    if (categoryFilter === 'All') return true;
    return getCategory(n) === categoryFilter;
  });

  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    const getMs = (d: any) => {
      if (!d) return 0;
      if (typeof d === 'string') return new Date(d).getTime();
      if (d.seconds) return d.seconds * 1000;
      if (d._seconds) return d._seconds * 1000;
      return 0;
    };
    const dateA = getMs(a.created_at);
    const dateB = getMs(b.created_at);
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto w-full animate-in fade-in duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl animate-pulse flex gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0"></div>
              <div className="flex-1 space-y-3 py-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      <AdminPageHeader
        title={
          <div className="flex items-center gap-2">
            <span>Notifications</span>
            {notifications.filter(n => !(n.is_read || n.read)).length > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700 ml-2">
                {notifications.filter(n => !(n.is_read || n.read)).length} Unread
              </span>
            )}
          </div>
        }
        subtitle="Your personal updates and alerts."
        icon={<Bell />}
        action={
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
            <button 
              onClick={() => navigate(`/${profile?.role?.toLowerCase() || 'customer'}/support`)}
              className="text-sm font-bold text-white bg-brand-navy dark:bg-brand-green hover:bg-slate-800 dark:hover:bg-[#005e3f] transition-all rounded-xl px-4 py-2 shadow-sm flex items-center gap-2"
            >
              <LifeBuoy className="w-4 h-4" /> 
              {profile?.role?.toLowerCase() === 'admin' ? 'Support Desk' : 'Help & Support'}
            </button>
            
            {notifications.length > 0 && (
              <div className="flex items-center gap-3 self-start sm:self-auto">
                <div className="relative">
                  <select 
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                    className="appearance-none bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-xl px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all shadow-sm cursor-pointer"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>

                <div className="flex bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
                  <button 
                    onClick={markAllAsUnread}
                    title="Mark all as unread"
                    className="text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5 px-4 py-2 border-r border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <RefreshCcw className="w-4 h-4" /> <span className="hidden sm:inline">Mark all unread</span>
                  </button>
                  <button 
                    onClick={markAllAsRead}
                    title="Mark all as read"
                    className="text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <CheckCircle2 className="w-4 h-4" /> <span className="hidden sm:inline">Mark all read</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        }
      />
      
      {notifications.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-2 no-scrollbar">
          {(isPersonnel
            ? ['All', 'Assigned Job', 'Message', 'Other']
            : ['All', 'Booking', 'Payment', 'Voucher', 'Message', 'Other']
          ).map(cat => {
            const dotColors: Record<string, string> = isPersonnel
              ? {
                  'Assigned Job': 'bg-brand-green',
                  'Message':      'bg-orange-500',
                  'Other':        'bg-gray-600 dark:bg-gray-500',
                }
              : {
                  'Booking': 'bg-blue-500',
                  'Payment': 'bg-green-500',
                  'Voucher': 'bg-violet-500',
                  'Message': 'bg-orange-500',
                  'Other':   'bg-gray-600 dark:bg-gray-500',
                };
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${categoryFilter === cat ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'}`}
              >
                {cat !== 'All' && (
                  <span className={`w-2 h-2 rounded-full ${dotColors[cat] || 'bg-slate-400'}`} />
                )}
                {cat}
              </button>
            );
          })}
        </div>
      )}

      {notifications.length === 0 ? (
        <EmptyState 
          title="No Notifications" 
          description="You're all caught up! When you receive updates about your bookings or special vouchers, they will appear here." 
          icon={<Bell className="w-12 h-12 text-slate-300 dark:text-slate-600" />} 
        />
      ) : (
        <AnimatePresence>
          <div className="space-y-3">
            {sortedNotifications.map(n => {
              const isRead = n.read || n.is_read;
              const cat = getCategory(n);
              
              // Define border colors based on category
              const borderColors: Record<string, string> = {
                'Booking': 'border-l-blue-500',
                'Payment': 'border-l-green-500',
                'Voucher': 'border-l-violet-500',
                'Message': 'border-l-orange-500',
                'Other': 'border-l-gray-600 dark:border-l-gray-500'
              };
              const leftBorder = borderColors[cat] || 'border-l-gray-600 dark:border-l-gray-500';

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  key={n.id}
                  onClick={() => {
                    if (!isRead) markAsRead(n.id);
                    if (!profile?.role) return;
                    
                    const role = profile.role.toLowerCase();
                    const title = (n.type || n.title || '').toLowerCase();
                    const message = (n.message || '').toLowerCase();
                    
                    const relatedId = n.related_id;
                    const match = n.message.match(/(BK-\d+|HQ Chat)/i);
                    const bookingId = relatedId || (match ? match[1] : null);

                    // Cancellation or Refund -> Refunds tab (Admin/Customer), Bookings tab (Vendor/Personnel)
                    if (title.includes('cancel') || title.includes('refund') || message.includes('cancel') || message.includes('refund')) {
                      if (role === 'admin' || role === 'customer') {
                        navigate(`/${role}/refunds`, { state: bookingId ? { bookingId } : undefined });
                      } else {
                        navigate(`/${role}/bookings`, { state: bookingId ? { bookingId } : undefined });
                      }
                      return;
                    }
                    
                    // Vouchers -> Vouchers tab (Admin/Customer)
                    if (title.includes('voucher') || message.includes('voucher')) {
                      if (role === 'admin' || role === 'customer') {
                        navigate(`/${role}/vouchers`);
                      }
                      return;
                    }

                    // Admin specific routes
                    if (role === 'admin') {
                      if (title.includes('message') || message.includes('message')) {
                        navigate(`/admin/messages`);
                        return;
                      }
                      if ((title.includes('vendor') || message.includes('vendor')) && (title.includes('review') || title.includes('register') || title.includes('pending'))) {
                        navigate(`/admin/vendors-management`);
                        return;
                      }
                    }

                    // Message routes for Customer, Vendor, Personnel
                    if (title.includes('message') || message.includes('message')) {
                       if (role === 'personnel') {
                          navigate(`/${role}/bookings`, { state: { bookingId } });
                       } else {
                          const openChannel = title.includes('personnel') || message.includes('personnel') || message.includes('technician') || title.includes('specialist') || message.includes('specialist') ? 'personnel' : 'vendor';
                          navigate(`/${role}/messages`, { state: { bookingId: bookingId === 'HQ Chat' ? undefined : bookingId, openChannel } });
                       }
                       return;
                    }

                    // Default to bookings if there's a booking ID
                    if (bookingId) {
                      navigate(`/${role}/bookings`, { state: { bookingId } });
                      return;
                    }
                  }}
                  className={`group relative p-4 sm:p-5 rounded-none border-l-4 border-y border-r flex flex-col sm:flex-row sm:items-start gap-4 transition-all duration-300 cursor-pointer 
                    ${isRead 
                      ? `opacity-70 bg-white/50 dark:bg-slate-900/40 border-y-slate-100 border-r-slate-100 dark:border-y-slate-800/50 dark:border-r-slate-800/50 border-l-slate-300 dark:border-l-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60` 
                      : `opacity-100 bg-slate-100 dark:bg-slate-800 border-y-slate-200 border-r-slate-200 dark:border-y-slate-700 dark:border-r-slate-700 ${leftBorder} shadow-sm hover:shadow-md`}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        {!isRead && <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-extrabold bg-brand-navy dark:bg-brand-green text-white rounded-sm">Recently</span>}
                        <h3 className={`text-sm sm:text-base font-bold tracking-tight ${isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                          {n.title || "Notification"}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 opacity-80">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <p className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {formatDate(n.created_at)}
                        </p>
                      </div>
                    </div>
                    <p className={`text-xs sm:text-sm leading-relaxed max-w-4xl ${isRead ? 'text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-300 font-medium'}`}>
                      {n.message}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
