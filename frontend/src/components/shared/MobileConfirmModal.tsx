import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, LogOut, X, Loader2, Trash2, XCircle } from 'lucide-react';

export interface MobileConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success' | 'delete' | 'logout' | 'error';
  hideCancel?: boolean;
  icon?: React.ReactNode;
}

export function MobileConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  hideCancel = false,
  icon
}: MobileConfirmModalProps) {
  const [loading, setLoading] = useState(false);

  if (typeof document === 'undefined') return null;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
    } catch (error) {
      console.error('Confirm action failed:', error);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  const getIcon = () => {
    if (icon) return icon;
    switch (type) {
      case 'error':
        return <XCircle className="w-6 h-6 text-white" />;
      case 'delete':
        return <Trash2 className="w-6 h-6 text-white" />;
      case 'logout':
        return <LogOut className="w-6 h-6 text-white" />;
      case 'danger':
        return <AlertTriangle className="w-6 h-6 text-white" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-white" />;
      case 'success':
        return <CheckCircle2 className="w-6 h-6 text-white" />;
      case 'info':
      default:
        return <Info className="w-6 h-6 text-white" />;
    }
  };

  const getBadgeStyle = () => {
    switch (type) {
      case 'error':
        return 'bg-gradient-to-br from-orange-600 to-orange-700 shadow-md';
      case 'delete':
      case 'logout':
      case 'danger':
        return 'bg-gradient-to-br from-red-600 to-rose-700 shadow-md';
      case 'warning':
        return 'bg-gradient-to-br from-rose-500 to-orange-600 shadow-md';
      case 'success':
        return 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md';
      case 'info':
      default:
        return 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md';
    }
  };

  const getConfirmButtonStyle = () => {
    switch (type) {
      case 'error':
        return 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-md border border-orange-500/30';
      case 'delete':
      case 'logout':
      case 'danger':
        return 'bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white shadow-md border border-red-500/30';
      case 'warning':
        return 'bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700 text-white shadow-md border border-rose-400/30';
      case 'success':
        return 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md border border-emerald-400/30';
      case 'info':
      default:
        return 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md border border-blue-400/30';
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[20000] flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={!loading ? onClose : undefined}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Modal / Bottom Sheet Container */}
          <motion.div
            initial={{ y: '100%', opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: '100%', opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full sm:max-w-sm bg-white dark:bg-[#090e24] rounded-t-[32px] sm:rounded-3xl shadow-[0_-20px_60px_rgba(0,0,0,0.6)] sm:shadow-2xl overflow-hidden border-t sm:border border-white/10 p-6 sm:p-7 pb-safe"
          >
            {/* Decorative Top Pill Handle for mobile */}
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-6 sm:hidden" />

            {/* Close Button */}
            <button
              onClick={!loading ? onClose : undefined}
              disabled={loading}
              className="absolute top-5 right-5 p-2 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer disabled:opacity-50"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Content Body */}
            <div className="flex flex-col items-center text-center space-y-4 pt-2 mb-8">
              {/* Glowing Avatar Icon */}
              <div className={`w-16 h-16 rounded-3xl flex items-center justify-center ${getBadgeStyle()} transform -rotate-3 hover:rotate-0 transition-transform duration-300`}>
                {getIcon()}
              </div>

              <div className="space-y-1.5 px-2">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  {message}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleConfirm}
                disabled={loading}
                className={`w-full py-4 px-6 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all ${getConfirmButtonStyle()} disabled:opacity-60`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>{confirmText}</span>
                )}
              </motion.button>

              {!hideCancel && cancelText && cancelText.trim() !== '' && (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={!loading ? onClose : undefined}
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-2xl font-bold text-sm bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {cancelText}
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
