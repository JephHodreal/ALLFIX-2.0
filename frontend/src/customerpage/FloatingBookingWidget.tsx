import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Clock, Wrench, Calendar, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useBookings } from '../hooks/useBookings';

export interface FloatingBookingWidgetProps {
  hasSelectedService?: boolean;
  selectedServiceName?: string;
  cartCount?: number; // Backwards compatibility
}

export function FloatingBookingWidget({
  hasSelectedService,
  selectedServiceName,
  cartCount = 0
}: FloatingBookingWidgetProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();
  const { bookings } = useBookings(profile?.id, 'customer');

  // Only show on the customer home page for mobile
  if (location.pathname !== '/customer' && location.pathname !== '/customer/') {
    return null;
  }

  const isSelectionActive = Boolean(hasSelectedService || cartCount > 0);
  const isInProgress = bookings?.some(b => b.status === 'in_progress' || b.status === 'job_done');
  const isConfirmed = bookings?.some(b => b.status === 'confirmed' || b.status === 'pending');

  const getLabel = () => {
    if (isSelectionActive) return "Review Booking";
    if (isInProgress) return "In Progress";
    if (isConfirmed) return "Scheduled Appointment";
    return null;
  };

  const getSubtitle = () => {
    if (isSelectionActive) {
      return selectedServiceName ? `${selectedServiceName} • Tap to complete` : "1 Service Selected • Tap to review & complete";
    }
    if (isInProgress) return "Specialist assigned • Live tracking";
    if (isConfirmed) return "Tap to view upcoming schedule";
    return null;
  };

  const getIcon = () => {
    if (isInProgress) {
      return (
        <div className="w-10 h-10 rounded-xl bg-brand-green/15 border border-brand-green/30 flex items-center justify-center text-brand-green shrink-0 shadow-sm">
          <Wrench className="w-5 h-5" />
        </div>
      );
    }
    if (isSelectionActive) {
      return (
        <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0 shadow-sm">
          <Calendar className="w-5 h-5" />
        </div>
      );
    }
    if (isConfirmed) {
      return (
        <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0 shadow-sm">
          <Clock className="w-5 h-5" />
        </div>
      );
    }
    return null;
  };

  const label = getLabel();
  const subtitle = getSubtitle();

  if (!label) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        className="fixed z-40 lg:hidden left-4 right-4 max-w-sm mx-auto"
        style={{
          bottom: 'calc(env(safe-area-inset-bottom) + 76px)',
        }}
      >
        <div
          onClick={() => navigate(isSelectionActive ? '/customer/review' : '/customer/bookings?tab=active')}
          className="w-full bg-gradient-to-br from-brand-navy to-[#0a2d5c] dark:from-[#041e41] dark:to-[#0a2d5c] text-white rounded-2xl p-3.5 shadow-xl border border-white/20 dark:border-white/15 flex items-center justify-between gap-3 cursor-pointer hover:border-white/35 transition-all active:scale-[0.99]"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {getIcon()}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-white truncate">{label}</span>
                {isInProgress && (
                  <span className="w-2 h-2 rounded-full bg-brand-green inline-block shrink-0 shadow-sm" />
                )}
              </div>
              <p className="text-xs text-blue-100/80 truncate mt-0.5 font-medium">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/20 text-xs font-bold text-white shrink-0 transition-colors shadow-sm">
            <span>View</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Keep FloatingCartWidget alias for compatibility during refactoring
export { FloatingBookingWidget as FloatingCartWidget };
