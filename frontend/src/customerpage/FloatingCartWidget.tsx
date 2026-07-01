import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FloatingCartWidgetProps {
  cartCount: number;
}

export function FloatingCartWidget({ cartCount }: FloatingCartWidgetProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Only show on the customer home page for mobile
  if (location.pathname !== '/customer' && location.pathname !== '/customer/') {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.8 }}
        className="fixed bottom-20 right-4 z-40 lg:hidden"
      >
        <button
          onClick={() => navigate('/customer/cart')}
          className="w-13 h-13 p-3.5 bg-brand-navy text-white rounded-full flex items-center justify-center shadow-[0_10px_25px_rgba(35,64,110,0.4)] hover:bg-[#1a3052] active:scale-95 transition-all relative"
          aria-label="View Active Bookings"
        >
          <ClipboardList className="w-6 h-6" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-green border-2 border-white text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
