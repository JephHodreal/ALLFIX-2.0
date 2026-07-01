import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ClipboardList, Clock, Wrench } from 'lucide-react';
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

  const getIcon = () => {
    if (isInProgress) {
      return <Wrench className="w-6 h-6 text-white animate-pulse" />;
    }
    if (isConfirmed) {
      return <Clock className="w-6 h-6 text-white" />;
    }
    return <ClipboardList className="w-6 h-6 text-white" />;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0, y: 20 }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 22 
        }}
        className="fixed z-40 lg:hidden"
        style={{
          bottom: 'calc(env(safe-area-inset-bottom) + 80px)',
          right: '18px'
        }}
      >
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => navigate(cartCount > 0 ? '/customer/cart' : '/customer/bookings')}
          className="w-14 h-14 p-3.5 bg-gradient-to-br from-brand-navy to-[#1a3052] dark:from-blue-600 dark:to-brand-navy text-white rounded-full flex items-center justify-center shadow-[0_15px_30px_-5px_rgba(35,64,110,0.5)] dark:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.8)] hover:brightness-110 transition-all relative border border-white/10 cursor-pointer"
          aria-label="Personal Concierge Active Bookings"
        >
          {getIcon()}

          {/* Contextual Visual Cues: Cart Badge or Active Status Indicator Dot */}
          {cartCount > 0 ? (
            <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-brand-green border-2 border-white dark:border-slate-900 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md">
              {cartCount}
            </span>
          ) : (isInProgress || isConfirmed) ? (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              {isInProgress && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75"></span>
              )}
              <span className="relative inline-flex rounded-full h-4 w-4 bg-brand-green border-2 border-white dark:border-slate-900 shadow-sm"></span>
            </span>
          ) : null}
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
}
