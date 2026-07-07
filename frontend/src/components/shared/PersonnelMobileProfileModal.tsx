import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Bell, Sun, Moon, ClipboardList, LogOut, LifeBuoy, ShieldCheck, ChevronRight, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../services/firebaseService';
import { MobileConfirmModal } from './MobileConfirmModal';

interface PersonnelMobileProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  isDark: boolean;
  toggleTheme: () => void;
  unreadNotificationsCount: number;
}

export function PersonnelMobileProfileModal({
  isOpen,
  onClose,
  profile,
  isDark,
  toggleTheme,
  unreadNotificationsCount
}: PersonnelMobileProfileModalProps) {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  if (typeof document === 'undefined') return null;

  const modalPortal = createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] lg:hidden pointer-events-auto">
          {/* Backdrop covering viewport */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
          />

          {/* Bottom Sheet Modal */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="fixed inset-x-0 bottom-0 z-10 max-h-[90vh] bg-white dark:bg-[#090D16] border-t border-slate-200 dark:border-slate-800 rounded-t-[32px] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Handle Bar */}
            <div className="pt-3 pb-2 flex justify-center w-full cursor-grab active:cursor-grabbing shrink-0" onClick={onClose}>
              <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700/80" />
            </div>

            {/* Sheet Header: Personnel Info */}
            <div className="px-6 pt-2 pb-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0 bg-white/80 dark:bg-[#090D16]/80 backdrop-blur-md z-10">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-green via-emerald-800 to-brand-navy p-0.5 shadow-md shrink-0 relative group">
                  <div className="w-full h-full rounded-[14px] bg-white dark:bg-slate-900 overflow-hidden flex items-center justify-center">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Specialist Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-black text-brand-green dark:text-white uppercase">
                        {profile?.first_name?.[0] || profile?.last_name?.[0] || 'T'}
                      </span>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-brand-green text-white p-0.5 rounded-full border-2 border-white dark:border-slate-900 shadow-xs">
                    <ShieldCheck className="w-3 h-3" />
                  </div>
                </div>
                <div className="min-w-0 flex flex-col justify-center">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate tracking-tight">
                      {`${profile?.first_name || 'Field'} ${profile?.last_name || 'Specialist'}`}
                    </h2>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Verified Specialist
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 truncate mt-0.5">
                    {profile?.email || 'Authorized Service Personnel'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-colors active:scale-95 shrink-0 ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Navigation Body */}
            <div className="p-5 overflow-y-auto space-y-5 no-scrollbar [&::-webkit-scrollbar]:hidden flex-1 relative">
              {/* Panel 1: Field Management */}
              <div className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2">
                  Field Management
                </span>
                <div className="rounded-3xl bg-slate-50/80 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 overflow-hidden divide-y divide-slate-200/50 dark:divide-slate-800/60 shadow-xs">
                  {/* Dashboard Row */}
                  <button
                    onClick={() => handleNav('/personnel')}
                    className="w-full flex items-center justify-between py-3.5 px-4 transition-all duration-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/40 active:bg-slate-100 dark:active:bg-slate-800 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                        <LayoutDashboard className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col text-left min-w-0">
                        <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">Dashboard Overview</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">View your active jobs & completion trend</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  {/* My Bookings Row */}
                  <button
                    onClick={() => handleNav('/personnel/bookings')}
                    className="w-full flex items-center justify-between py-3.5 px-4 transition-all duration-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/40 active:bg-slate-100 dark:active:bg-slate-800 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                        <ClipboardList className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col text-left min-w-0">
                        <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">My Bookings</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">Assigned jobs, dispatch & proof of work</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  {/* Profile Row */}
                  <button
                    onClick={() => handleNav('/personnel/profile')}
                    className="w-full flex items-center justify-between py-3.5 px-4 transition-all duration-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/40 active:bg-slate-100 dark:active:bg-slate-800 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col text-left min-w-0">
                        <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">Specialist Profile</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">Identity, specialties & emergency contact</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  {/* Notifications Row */}
                  <button
                    onClick={() => handleNav('/personnel/notifications')}
                    className="w-full flex items-center justify-between py-3.5 px-4 transition-all duration-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/40 active:bg-slate-100 dark:active:bg-slate-800 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                        unreadNotificationsCount > 0
                          ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/30 dark:shadow-blue-500/20'
                          : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 dark:text-indigo-400'
                      }`}>
                        <Bell className={`w-5 h-5 ${unreadNotificationsCount > 0 ? 'animate-bounce' : ''}`} />
                      </div>
                      <div className="flex flex-col text-left min-w-0">
                        <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">Notifications</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
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
                </div>
              </div>

              {/* Panel 2: Preferences & Support */}
              <div className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2">
                  Preferences & Support
                </span>
                <div className="rounded-3xl bg-slate-50/80 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 overflow-hidden divide-y divide-slate-200/50 dark:divide-slate-800/60 shadow-xs">
                  {/* Dark Mode Row */}
                  <div className="w-full flex items-center justify-between py-3.5 px-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-slate-200/60 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0">
                        {isDark ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
                      </div>
                      <div className="flex flex-col text-left min-w-0">
                        <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">Dark Mode</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                          {isDark ? 'OLED night theme active' : 'Bright day theme active'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTheme();
                      }}
                      className={`w-[52px] h-7 p-1 rounded-full transition-all duration-300 relative cursor-pointer shrink-0 ml-2 ${
                        isDark ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 flex items-center justify-center ${
                          isDark ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      >
                        {isDark ? (
                          <Moon className="w-3 h-3 text-indigo-600" />
                        ) : (
                          <Sun className="w-3 h-3 text-amber-500" />
                        )}
                      </div>
                    </button>
                  </div>

                  {/* Support Row */}
                  <button
                    onClick={() => handleNav('/personnel/support')}
                    className="w-full flex items-center justify-between py-3.5 px-4 transition-all duration-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/40 active:bg-slate-100 dark:active:bg-slate-800 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                        <LifeBuoy className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col text-left min-w-0">
                        <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">Get Help / Support</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">Report technical issues or contact HQ</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            {/* Sheet Footer: Docked Log Out Button */}
            <div className="p-5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40 pb-safe space-y-3 shrink-0">
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-black text-sm active:scale-95 transition-all border border-red-200/60 dark:border-red-900/40 shadow-xs hover:bg-red-100/80 dark:hover:bg-red-900/40 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out of AllFix</span>
              </button>

              <div className="text-center space-y-1 pt-0.5">
                <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 tracking-wide">
                  AllFix Specialist Portal v2.0 • Field Operations
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
        message="Are you sure you want to end your specialist session? You will need to log in again to receive and manage field assignments."
        confirmText="Yes, Log Out"
        cancelText="Cancel"
        type="logout"
      />
    </>
  );
}
