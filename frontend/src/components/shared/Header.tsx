import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, Sun, Moon, Menu, Check, Trash2, ArrowRight, LifeBuoy } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/apiService';

interface HeaderProps {
  onMenuToggle?: () => void;
  title?: string;
}

export function Header({ onMenuToggle, title }: HeaderProps) {
  const { isDark, toggleTheme } = useTheme();
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);
  const [filter, setFilter] = React.useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  const fetchNotifications = React.useCallback(async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      console.log("[CAVEMAN] Fetching notifications from secure API for user:", profile.id);
      const res = await api.get(`/api/notifications/${profile.id}`);
      const data = res.data || [];
      setNotifications(data);
    } catch (err) {
      console.error("[CAVEMAN] Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  React.useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Poll every 15 seconds
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  React.useEffect(() => {
    const handleOutsideClick = () => {
      setShowDropdown(false);
    };
    if (showDropdown) {
      window.addEventListener('click', handleOutsideClick);
    }
    return () => {
      window.removeEventListener('click', handleOutsideClick);
    };
  }, [showDropdown]);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("[CAVEMAN] Marking notification as read and deleting from database:", id);
    try {
      await api.patch(`/api/notifications/${id}/read`);
      // Update local state: mark the notification as read immediately
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true, read: true } : n));
      console.log("[CAVEMAN] Successfully read notification:", id);
    } catch (err) {
      console.error("[CAVEMAN] Failed to mark notification as read", err);
    }
  };

  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("[CAVEMAN] Deleting notification from database:", id);
    try {
      await api.delete(`/api/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      console.log("[CAVEMAN] Successfully deleted notification:", id);
    } catch (err) {
      console.error("[CAVEMAN] Failed to delete notification", err);
    }
  };

  const sortedNotifications = React.useMemo(() => {
    return [...notifications].sort((a, b) => {
      const getMs = (d: any) => {
        if (!d) return 0;
        if (typeof d === 'string') return new Date(d).getTime();
        if (d.seconds) return d.seconds * 1000;
        if (d._seconds) return d._seconds * 1000;
        return 0;
      };
      return getMs(b.created_at) - getMs(a.created_at);
    });
  }, [notifications]);

  return (
    <header className="h-16 bg-white dark:bg-[#020617] border-b border-slate-200 dark:border-[#1E293B] flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {onMenuToggle && (
          <button onClick={onMenuToggle} className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        )}
        {title && <h1 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h1>}
      </div>
      <div className="flex items-center gap-3">
        <button onClick={toggleTheme} className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" aria-label="Toggle theme">
          {isDark ? <Sun className="w-5 h-5 text-brand-yellow" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>
        
        {/* Secure Notification Center */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowDropdown(!showDropdown);
              if (!showDropdown) {
                setExpanded(false); // Reset expanded state when opening
                fetchNotifications();
              }
            }}
            className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative" 
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            {notifications.filter(n => !(n.is_read || n.read)).length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-brand-red text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {notifications.filter(n => !(n.is_read || n.read)).length}
              </span>
            )}
          </button>

          {/* Secure Dropdown list */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-[340px] sm:w-[380px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden z-50 flex flex-col">
              <div className="pt-4 px-5 flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">
                  Notifications
                </h2>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDropdown(false);
                    const role = profile?.role?.toLowerCase() || 'customer';
                    navigate(`/${role}/support`);
                  }}
                  className="text-[12px] font-bold text-brand-green hover:underline flex items-center gap-1"
                >
                  <LifeBuoy className="w-4 h-4" /> Help & Support
                </button>
              </div>
              
              <div className="flex gap-6 px-5 border-b border-slate-100 dark:border-slate-800">
                <button 
                  onClick={(e) => { e.stopPropagation(); setFilter('all'); }} 
                  className={`pb-2.5 text-[13px] font-semibold transition-all border-b-2 ${filter === 'all' ? 'border-brand-navy text-brand-navy dark:border-blue-400 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
                >
                  All Activity
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setFilter('unread'); }} 
                  className={`pb-2.5 text-[13px] font-semibold transition-all border-b-2 flex items-center gap-1.5 ${filter === 'unread' ? 'border-brand-navy text-brand-navy dark:border-blue-400 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
                >
                  Unread
                  {notifications.filter(n => !(n.is_read || n.read)).length > 0 && filter !== 'unread' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-red"></span>
                  )}
                </button>
              </div>
              
              <div className={`overflow-y-auto transition-all duration-300 ${expanded ? 'max-h-[500px]' : 'max-h-[380px]'}`}>
                {loading && notifications.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-400 font-medium">Loading inbox...</div>
                ) : notifications.filter(n => filter === 'all' || !(n.is_read || n.read)).length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400 font-semibold space-y-2">
                    <p className="text-xl">🔔</p>
                    <p className="text-slate-400">All caught up!</p>
                  </div>
                ) : (
                  <>
                  <div className="p-2 space-y-1">
                    {(expanded ? sortedNotifications.filter(n => filter === 'all' || !(n.is_read || n.read)) : sortedNotifications.filter(n => filter === 'all' || !(n.is_read || n.read)).slice(0, 5)).map((item) => {
                      const isRead = item.read || item.is_read;
                      return (
                        <div
                          key={item.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isRead) handleMarkAsRead(item.id, e);
                            
                            if (profile?.role) {
                              const role = profile.role.toLowerCase();
                              const messageLower = item.message.toLowerCase();
                              
                              if (messageLower.includes('refund')) {
                                navigate(`/${role}/refunds`);
                              } else {
                                const match = item.message.match(/BK-\d+/);
                                if (match) {
                                  const bookingId = match[0];
                                  navigate(`/${role}/bookings`, { state: { bookingId } });
                                } else {
                                  navigate(`/${role}/notifications`);
                                }
                              }
                              setShowDropdown(false);
                            }
                          }}
                          className={`p-3.5 rounded-xl transition-all flex items-start gap-3 relative cursor-pointer ${isRead ? 'opacity-70 hover:bg-slate-50 dark:hover:bg-slate-800/40' : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm'}`}
                        >
                          <div className="flex-grow min-w-0">
                            <p className={`text-[13px] leading-relaxed break-words pr-2 ${isRead ? 'text-slate-600 dark:text-slate-400 font-medium' : 'text-slate-800 dark:text-slate-100 font-semibold'}`}>
                              {item.message}
                            </p>
                            {!isRead && (
                              <div className="mt-1.5 flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-blue-500">Recently</span>
                              </div>
                            )}
                          </div>
                        </div>
                    );
                  })}
                  </div>
                  {!expanded && sortedNotifications.filter(n => filter === 'all' || !(n.is_read || n.read)).length > 5 && (
                    <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-center sticky bottom-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpanded(true);
                        }}
                        className="text-[13px] font-bold text-brand-navy dark:text-blue-400 hover:underline flex items-center gap-1 transition-all"
                      >
                        View all history <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-navy to-brand-green flex items-center justify-center text-white text-sm font-bold">
          {profile?.first_name?.[0] || profile?.email?.[0]?.toUpperCase() || '?'}
        </div>
      </div>
    </header>
  );
}
