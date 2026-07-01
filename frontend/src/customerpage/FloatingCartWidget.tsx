import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ClipboardList, Clock, Wrench, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useBookings } from '../hooks/useBookings';

interface FloatingCartWidgetProps {
  cartCount: number;
}

export function FloatingCartWidget({ cartCount }: FloatingCartWidgetProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();
  const { bookings } = useBookings(profile?.id, 'customer');

  // Only show on the customer home page for mobile
  if (location.pathname !== '/customer' && location.pathname !== '/customer/') {
    return null;
  }

  // Check active booking states for semantic iconography & concierge cues
  const isInProgress = bookings?.some(b => b.status === 'in_progress' || b.status === 'job_done');
  const isConfirmed = bookings?.some(b => b.status === 'confirmed' || b.status === 'pending');

  const getLabel = () => {
    if (cartCount > 0) return `Checkout (${cartCount})`;
    if (isInProgress) return "In Progress";
    if (isConfirmed) return "Scheduled";
    return null;
  };

  const getIcon = () => {
    if (isInProgress) {
      return <Wrench className="w-5 h-5 text-emerald-400 animate-pulse flex-shrink-0" />;
    }
    if (cartCount > 0) {
      return <ShoppingBag className="w-5 h-5 text-blue-300 flex-shrink-0" />;
    }
    if (isConfirmed) {
      return <Clock className="w-5 h-5 text-blue-300 flex-shrink-0" />;
    }
    return <ClipboardList className="w-6 h-6 text-white flex-shrink-0" />;
  };

  const label = getLabel();
  const isActive = Boolean(label);

  return (
    <AnimatePresence>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0, y: 20 }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 24 
        }}
        className="fixed z-40 lg:hidden"
        style={{
          bottom: 'calc(env(safe-area-inset-bottom) + 80px)',
          right: '18px'
        }}
      >
        {/* Ambient Neon / LED Halo Backlight */}
        <div 
          className={`absolute -inset-1.5 rounded-full blur-xl opacity-65 transition-all duration-500 -z-10 pointer-events-none ${
            isInProgress 
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 animate-pulse' 
              : isActive 
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 animate-pulse' 
                : 'bg-brand-navy/50 dark:bg-blue-900/40'
          }`} 
        />

        {/* Glassmorphic Live Activity Pill / Squircle */}
        <motion.button
          layout
          whileTap={{ scale: 0.94 }}
          onClick={() => navigate(cartCount > 0 ? '/customer/cart' : '/customer/bookings')}
          className={`relative group flex items-center justify-center overflow-hidden rounded-full font-bold text-white shadow-2xl transition-all duration-300 backdrop-blur-2xl border cursor-pointer ${
            isActive 
              ? 'px-5 py-3.5 gap-2.5 bg-slate-900/90 dark:bg-slate-900/85 border-white/20 dark:border-white/15' 
              : 'w-14 h-14 p-3.5 bg-gradient-to-br from-brand-navy/95 to-[#1a3052]/95 dark:from-slate-900/95 dark:to-blue-950/95 border-white/15'
          }`}
          aria-label="Personal Concierge Active Bookings"
        >
          {/* Shimmering Glass Reflection Sweep */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/15 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          {getIcon()}

          {/* Expandable Live Activity Text Label */}
          <AnimatePresence mode="popLayout">
            {label && (
              <motion.span
                key={label}
                initial={{ opacity: 0, width: 0, scale: 0.8 }}
                animate={{ opacity: 1, width: 'auto', scale: 1 }}
                exit={{ opacity: 0, width: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="text-xs sm:text-sm font-extrabold tracking-wide whitespace-nowrap text-white flex items-center gap-2"
              >
                <span>{label}</span>
                {/* Pulsing Radar Ring on text badge */}
                {isInProgress && (
                  <span className="relative flex h-2 w-2 ml-0.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                  </span>
                )}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Contextual Visual Cues for Idle state */}
          {!label && cartCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-brand-green border-2 border-slate-900 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-md">
              {cartCount}
            </span>
          )}
          {!label && (isInProgress || isConfirmed) && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              {isInProgress && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-slate-900 shadow-sm"></span>
            </span>
          )}
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
}
