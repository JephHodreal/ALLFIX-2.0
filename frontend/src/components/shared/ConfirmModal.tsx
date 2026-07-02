import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, CheckCircle2, LogOut, Loader2, Trash2, XCircle } from 'lucide-react';
import { MobileConfirmModal } from './MobileConfirmModal';

interface ConfirmModalProps {
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

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  hideCancel = false,
  icon
}) => {
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Enter' && !loading) {
        e.preventDefault();
        handleConfirm();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, loading]);

  if (typeof document === 'undefined') return null;

  if (isMobile) {
    return (
      <MobileConfirmModal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={onConfirm}
        title={title}
        message={message}
        confirmText={confirmText}
        cancelText={cancelText}
        type={type as any}
        hideCancel={hideCancel}
        icon={icon}
      />
    );
  }

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
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={!loading ? onClose : undefined}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md"
          />
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[30vh] p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="bg-white dark:bg-[#090e24] rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] w-full max-w-sm overflow-hidden border border-slate-100 dark:border-white/10 pointer-events-auto"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${getBadgeStyle()} transform -rotate-3 hover:rotate-0 transition-transform duration-300`}>
                    {getIcon()}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1.5">
                      {title}
                    </h3>
                    <div className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                      {message}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 pt-0 flex justify-end gap-3">
                {!hideCancel && cancelText && cancelText.trim() !== '' && (
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={!loading ? onClose : undefined}
                    disabled={loading}
                    className="py-3 px-5 rounded-xl font-bold text-sm bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {cancelText}
                  </motion.button>
                )}
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleConfirm}
                  disabled={loading}
                  className={`py-3 px-6 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all ${getConfirmButtonStyle()} disabled:opacity-60`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>{confirmText}</span>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};
