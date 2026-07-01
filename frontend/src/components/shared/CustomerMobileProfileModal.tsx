import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Bell, Sun, Moon, Ticket, LogOut, ShieldAlert, LifeBuoy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../services/firebaseService';

interface CustomerMobileProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  isDark: boolean;
  toggleTheme: () => void;
  unreadNotificationsCount: number;
}

export function CustomerMobileProfileModal({
  isOpen,
  onClose,
  profile,
  isDark,
  toggleTheme,
  unreadNotificationsCount
}: CustomerMobileProfileModalProps) {
  const navigate = useNavigate();

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 lg:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 top-[10vh] bg-white dark:bg-[#020617] rounded-t-3xl shadow-2xl z-[60] flex flex-col overflow-hidden lg:hidden"
          >
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Account Menu</h2>
              <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Profile Section */}
              <div
                className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 cursor-pointer active:scale-95 transition-all"
                onClick={() => handleNav('/customer/profile')}
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-navy to-brand-green flex items-center justify-center text-white text-xl font-bold border-2 border-white dark:border-slate-700 shadow-sm">
                  {profile?.first_name?.[0] || profile?.email?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                    {profile?.first_name} {profile?.last_name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {profile?.email}
                  </p>
                </div>
              </div>

              {/* Menu Items */}
              <div className="space-y-2">
                <button
                  onClick={() => handleNav('/customer/notifications')}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 active:scale-95 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                      <Bell className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-200">Notifications</span>
                  </div>
                  {unreadNotificationsCount > 0 && (
                    <span className="bg-brand-red text-white text-xs font-bold px-2 py-1 rounded-full">
                      {unreadNotificationsCount} new
                    </span>
                  )}
                </button>

                <button
                  onClick={() => handleNav('/customer/vouchers')}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 active:scale-95 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-yellow/10 flex items-center justify-center text-brand-yellow">
                      <Ticket className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-200">My Vouchers</span>
                  </div>
                </button>

                <div className="w-full flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                      {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-200">Dark Mode</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTheme();
                    }}
                    className={`w-12 h-6 rounded-full transition-colors relative ${isDark ? 'bg-brand-green' : 'bg-slate-300 dark:bg-slate-600'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${isDark ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                <button
                  onClick={() => handleNav('/customer/support')}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 active:scale-95 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-navy/10 dark:bg-blue-900/20 flex items-center justify-center text-brand-navy dark:text-blue-400">
                      <LifeBuoy className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-200">Help & Support</span>
                  </div>
                </button>
              </div>

            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 pb-safe">
              <button
                onClick={async () => {
                  try {
                    await logoutUser();
                    navigate('/login');
                  } catch (e) {
                    console.error('Logout failed:', e);
                  }
                }}
                className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-bold active:scale-95 transition-all"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
