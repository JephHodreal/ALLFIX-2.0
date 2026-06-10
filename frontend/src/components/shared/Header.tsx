import React from 'react';
import { Bell, Sun, Moon, Menu, Check, Trash2 } from 'lucide-react';
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
  
  const [showDropdown, setShowDropdown] = React.useState(false);
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

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 sticky top-0 z-30">
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
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl overflow-hidden z-50">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Inbox</span>
                <span className="text-[10px] font-extrabold bg-brand-navy/10 text-brand-navy dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded">
                  {notifications.filter(n => !(n.is_read || n.read)).length} Unread
                </span>
              </div>
              
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {loading && notifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 font-medium">Loading inbox...</div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400 font-semibold space-y-2">
                    <p className="text-lg">🔔</p>
                    <p className="text-slate-400">All caught up! No unread messages.</p>
                  </div>
                ) : (
                  notifications.map((item) => {
                    const isRead = item.read || item.is_read;
                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 transition-colors flex items-start gap-3 relative group ${isRead ? 'opacity-60 bg-transparent' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}
                      >
                        {!isRead && <div className="w-2 h-2 rounded-full bg-brand-navy dark:bg-blue-400 mt-1.5 flex-shrink-0 animate-pulse" />}
                        <div className={`flex-grow min-w-0 ${isRead ? 'ml-5' : ''}`}>
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium break-words pr-6">
                            {item.message}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1 items-center justify-center opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          {!isRead && (
                            <button
                              onClick={(e) => handleMarkAsRead(item.id, e)}
                              className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-green-500 hover:border-green-200 dark:hover:border-green-900 transition-all bg-white dark:bg-slate-800 hover:scale-105 shadow-sm"
                              title="Mark as read"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={(e) => handleDeleteNotification(item.id, e)}
                            className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-500 hover:border-red-200 dark:hover:border-red-900 transition-all bg-white dark:bg-slate-800 hover:scale-105 shadow-sm"
                            title="Remove notification"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
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
