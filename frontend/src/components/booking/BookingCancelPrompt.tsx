import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '../shared/Button';

interface BookingCancelPromptProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function BookingCancelPrompt({ open, onClose, onConfirm }: BookingCancelPromptProps) {
  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-yellow/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-brand-yellow" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Important Notice</h3>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><X className="w-4 h-4" /></button>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            By confirming this booking, you acknowledge that if you cancel after payment is confirmed by our admin,
            a <strong className="text-brand-red">deduction will apply</strong> to your refund.
            Cancellations before admin confirmation are fully refundable.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button variant="success" onClick={onConfirm}>I Understand, Proceed</Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
