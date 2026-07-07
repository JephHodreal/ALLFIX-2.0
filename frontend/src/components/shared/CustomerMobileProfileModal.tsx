import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Bell, Sun, Moon, Ticket, LogOut, ShieldAlert, LifeBuoy, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../services/firebaseService';
import api from '../../services/apiService';
import { MobileConfirmModal } from './MobileConfirmModal';

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
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);
  const [activeVouchersCount, setActiveVouchersCount] = React.useState<number>(0);

  React.useEffect(() => {
    if (!isOpen || !profile?.id) return;
    const fetchVoucherCount = async () => {
      try {
        const res = await api.get(`/api/vouchers/customer/${profile.id}`);
        const fetched = res.data || [];
        const active = fetched.filter((v: any) => v.temp_delete !== 1 && (v.status === 'unused' || v.status === 'active'));
        setActiveVouchersCount(active.length);
      } catch (err) {
        console.error('[CAVEMAN] Error fetching voucher count in account menu:', err);
      }
    };
    fetchVoucherCount();
  }, [isOpen, profile?.id]);

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  if (typeof document === 'undefined') return null;

  const modalPortal = createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] lg:hidden pointer-events-auto">
          {/* Backdrop covering 100% of the viewport including bottom nav and floating widget */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-md z-[9999]"
            onClick={onClose}
          />

          {/* Modal Sheet container sliding over everything */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="fixed inset-x-0 bottom-0 top-[6vh] bg-white dark:bg-[#070c20] rounded-t-[32px] shadow-[0_-20px_50px_rgba(0,0,0,0.3)] dark:shadow-[0_-20px_50px_rgba(0,0,0,0.7)] z-[10000] flex flex-col overflow-hidden border-t border-slate-200/80 dark:border-white/10"
          >
            {/* Sheet Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-6 rounded-full bg-gradient-to-b from-brand-navy to-brand-green dark:from-blue-500 dark:to-emerald-400" />
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Account Menu</h2>
              </div>
              <button 
                onClick={onClose} 
                className="p-2.5 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
                aria-label="Close Account Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar [&::-webkit-scrollbar]:hidden relative">
              {/* Profile Header Card (Aurora Concierge Membership Identity) */}
              <div
                className="relative overflow-hidden flex items-center justify-between p-5 rounded-3xl bg-gradient-to-br from-[#071529] via-[#0d2644] to-[#0A3A5E] dark:from-[#050b14] dark:via-[#091a30] dark:to-[#082640] text-white shadow-sm border border-white/15 cursor-pointer active:scale-95 transition-all group"
                onClick={() => handleNav('/customer/profile')}
              >
                {/* Decorative ambient glass shape */}
                <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-brand-green/25 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
                
                <div className="flex items-center gap-4 relative z-10 min-w-0">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-green to-emerald-600 flex items-center justify-center text-white text-xl font-black border-2 border-white/30 shadow-md flex-shrink-0 overflow-hidden relative">
                    {(profile as any)?.avatar_url ? (
                      <img src={(profile as any).avatar_url} alt="Profile Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span>{profile?.first_name?.[0] || profile?.email?.[0]?.toUpperCase() || '?'}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-extrabold text-white text-lg tracking-tight truncate mb-0.5">
                      {profile?.first_name} {profile?.last_name}
                    </h3>
                    <p className="text-xs text-slate-300/80 font-medium truncate">
                      {profile?.email}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 flex items-center gap-1 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition-colors flex-shrink-0 ml-2">
                  <span>Edit</span>
                  <span>→</span>
                </div>
              </div>

              {/* Panel 1: Activity & Rewards */}
              <div className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2">
                  Activity & Rewards
                </span>
                <div className="rounded-3xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/80 overflow-hidden divide-y divide-slate-200/60 dark:divide-slate-800/80 shadow-xs">
                  {/* Notifications Row */}
                  <button
                    onClick={() => handleNav('/customer/notifications')}
                    className={`w-full flex items-center justify-between py-3.5 px-4 transition-all duration-200 active:bg-blue-50/50 dark:active:bg-blue-950/30 cursor-pointer group ${
                      unreadNotificationsCount > 0
                        ? 'bg-gradient-to-r from-white via-blue-50/30 to-blue-50/60 dark:from-slate-900 dark:via-blue-950/20 dark:to-blue-950/30'
                        : 'bg-transparent hover:bg-slate-100/50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                        unreadNotificationsCount > 0
                          ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/30 dark:shadow-blue-500/20'
                          : 'bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400'
                      }`}>
                        <Bell className={`w-5 h-5 ${unreadNotificationsCount > 0 ? 'animate-bounce' : ''}`} />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">Notifications</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {unreadNotificationsCount > 0 
                            ? `You have ${unreadNotificationsCount} unread alert${unreadNotificationsCount > 1 ? 's' : ''}`
                            : 'View all updates & alerts'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      {unreadNotificationsCount > 0 ? (
                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-red-500 to-rose-600 text-white font-black text-xs shadow-md shadow-red-500/30 border border-white/20">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                          </span>
                          <span>{unreadNotificationsCount} New</span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-200/60 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                          Up to date
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>

                  {/* My Vouchers Row */}
                  <button
                    onClick={() => handleNav('/customer/vouchers')}
                    className="w-full flex items-center justify-between py-3.5 px-4 transition-all duration-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/40 active:bg-slate-100 dark:active:bg-slate-800 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500 dark:text-amber-400">
                        <Ticket className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">My Vouchers</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Manage coupons & discounts</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      {activeVouchersCount > 0 ? (
                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 dark:border-amber-500/40 text-amber-600 dark:text-amber-400 font-black text-xs shadow-xs">
                          <span>{activeVouchersCount} Available</span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-200/60 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                          0 Available
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                </div>
              </div>

              {/* Panel 2: Preferences & Support */}
              <div className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2">
                  Preferences & Support
                </span>
                <div className="rounded-3xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/80 overflow-hidden divide-y divide-slate-200/60 dark:divide-slate-800/80 shadow-xs">
                  {/* Dark Mode Row */}
                  <div className="w-full flex items-center justify-between py-3.5 px-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-full bg-slate-200/60 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                        {isDark ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">Dark Mode</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {isDark ? 'OLED night theme active' : 'Bright day theme active'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTheme();
                      }}
                      className={`w-[52px] h-7 p-1 rounded-full transition-all duration-300 relative cursor-pointer ${
                        isDark ? 'bg-brand-green shadow-inner' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                      aria-label="Toggle Dark Mode"
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
                        isDark ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Help & Support Row */}
                  <button
                    onClick={() => handleNav('/customer/support')}
                    className="w-full flex items-center justify-between py-3.5 px-4 transition-all duration-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/40 active:bg-slate-100 dark:active:bg-slate-800 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-full bg-brand-navy/10 dark:bg-blue-900/20 flex items-center justify-center text-brand-navy dark:text-blue-400">
                        <LifeBuoy className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">Help & Support</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">24/7 customer assistance</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>

            </div>

            {/* Sheet Footer: Logout Button & App Version */}
            <div className="p-5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 pb-safe space-y-3 shrink-0">
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-black text-sm active:scale-95 transition-all border border-red-200/60 dark:border-red-900/40 shadow-xs hover:bg-red-100/80 dark:hover:bg-red-900/40 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out of AllFix</span>
              </button>

              {/* App Version Footer */}
              <div className="text-center space-y-1 pt-1">
                <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 tracking-wide">
                  AllFix Concierge v2.0 • Premium Home Maintenance
                </p>
                <p className="text-[10px] font-semibold text-slate-400/80 dark:text-slate-500">
                  © {new Date().getFullYear()} AllFix Platform • All Rights Reserved
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );

  return (
    <>
      {modalPortal}
      <MobileConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={async () => {
          try {
            await logoutUser();
            onClose();
            navigate('/login');
          } catch (e) {
            console.error('Logout failed:', e);
          }
        }}
        title="Log Out of AllFix?"
        message="Are you sure you want to end your session? You will need to log in again to manage your bookings."
        confirmText="Yes, Log Out"
        cancelText="Cancel"
        type="logout"
      />
    </>
  );
}
