import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';
import { Button } from './Button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  hideCancel?: boolean;
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
  hideCancel = false
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const getIcon = () => {
    switch (type) {
      case 'danger':
      case 'warning':
        return <AlertTriangle className={`w-6 h-6 ${type === 'danger' ? 'text-brand-red' : 'text-amber-500'}`} />;
      case 'success':
        return <CheckCircle2 className="w-6 h-6 text-brand-green" />;
      case 'info':
      default:
        return <Info className="w-6 h-6 text-brand-navy dark:text-brand-green" />;
    }
  };

  const getIconBg = () => {
    switch (type) {
      case 'danger': return 'bg-brand-red/10 dark:bg-brand-red/20';
      case 'warning': return 'bg-amber-500/10 dark:bg-amber-500/20';
      case 'success': return 'bg-brand-green/10 dark:bg-brand-green/20';
      case 'info':
      default: return 'bg-brand-navy/10 dark:bg-brand-green/20';
    }
  };

  const getButtonVariant = () => {
    switch (type) {
      case 'danger': return 'danger';
      case 'success': return 'success';
      case 'warning': return 'primary';
      case 'info':
      default: return 'primary';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden pointer-events-auto"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl flex-shrink-0 ${getIconBg()}`}>
                    {getIcon()}
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                      {title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {message}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
                {!hideCancel && (
                  <Button variant="ghost" onClick={onClose} className="!px-4">
                    {cancelText}
                  </Button>
                )}
                <Button 
                  variant={getButtonVariant()} 
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className="!px-6"
                >
                  {confirmText}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
