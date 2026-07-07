import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, FileText, Check, Copy, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { Button } from '../shared/Button';
import api from '../../services/apiService';

export interface AddonPaymentModalProps {
  addonId: string | null;
  bookingId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddonPaymentModal: React.FC<AddonPaymentModalProps> = ({
  addonId,
  bookingId,
  onClose,
  onSuccess
}) => {
  const [methods, setMethods] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('GCash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (addonId) {
      setErrorMsg('');
      setReferenceNumber('');
      const fetchMethods = async () => {
        try {
          const res = await api.get('/api/payments/methods');
          const data = res.data || [];
          if (data.length > 0) {
            setMethods(data);
            setPaymentMethod(data[0].paymentMethod);
          } else {
            setMethods([{ paymentMethod: 'GCash', accountName: 'ALLFIX.PH', accountNumber: '0917-123-4567' }]);
          }
        } catch (err) {
          setMethods([{ paymentMethod: 'GCash', accountName: 'ALLFIX.PH', accountNumber: '0917-123-4567' }]);
        }
      };
      fetchMethods();
    }
  }, [addonId]);

  if (!addonId) return null;

  const currentMethodObj = methods.find(m => m.paymentMethod === paymentMethod) || methods[0] || {};

  const handleCopyAccount = (accNo: string) => {
    if (!accNo) return;
    navigator.clipboard.writeText(accNo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referenceNumber.trim()) {
      setErrorMsg('Please enter your payment reference number.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await api.patch(`/api/bookings/${bookingId}/addons/${addonId}/pay`, {
        payment_method: paymentMethod,
        reference_number: referenceNumber.trim()
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('[CAVEMAN] Failed to submit addon payment:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to submit payment. Please verify your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-brand-navy to-[#0a2d5c] text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-brand-green" />
              <h3 className="text-lg font-black text-white">Pay Additional Charge</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-blue-100/80 font-medium mt-1">
            Complete payment for your specialist's mid-job material or service add-on request.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs font-bold"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Payment Method Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Select Electronic Wallet / Gateway
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {methods.map((m: any, idx: number) => {
                const isSelected = paymentMethod === m.paymentMethod;
                return (
                  <div
                    key={m.id || idx}
                    onClick={() => setPaymentMethod(m.paymentMethod)}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between text-xs font-bold ${
                      isSelected
                        ? 'border-brand-navy bg-brand-navy/10 dark:bg-brand-navy/30 text-brand-navy dark:text-white font-black'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span>{m.paymentMethod}</span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-brand-navy bg-brand-navy text-white' : 'border-slate-300'
                    }`}>
                      {isSelected && <Check className="w-2.5 h-2.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Account Details Display */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold">Account Name:</span>
              <span className="font-bold text-slate-900 dark:text-white">{currentMethodObj.accountName || 'ALLFIX.PH'}</span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 font-semibold">Account Number:</span>
              <div className="flex items-center gap-2">
                <span className="font-black text-brand-navy dark:text-blue-400 text-sm">{currentMethodObj.accountNumber || '0917-123-4567'}</span>
                <button
                  type="button"
                  onClick={() => handleCopyAccount(currentMethodObj.accountNumber)}
                  className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors"
                  title="Copy"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-brand-green" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Reference Number Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-brand-navy dark:text-blue-400" />
              <span>Transaction Reference Number *</span>
            </label>
            <input
              type="text"
              required
              value={referenceNumber}
              onChange={(e) => { setReferenceNumber(e.target.value); setErrorMsg(''); }}
              placeholder="Enter SMS or e-wallet ref #"
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-navy"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-bold text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="success"
              loading={loading}
              className="flex-1 py-3 rounded-xl font-bold text-xs shadow-sm transition-colors"
            >
              Submit Payment
            </Button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-green" />
            <span>Encrypted transaction verification</span>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
