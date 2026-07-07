import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Calendar, MapPin, User, ArrowRight, ShieldCheck, Clock, FileText } from 'lucide-react';
import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import { formatBookingId } from '../../utils/formatters';

export interface BookingReceiptViewProps {
  successBookings: any[];
  onBookAnother: () => void;
  onViewBookings: () => void;
}

export const BookingReceiptView: React.FC<BookingReceiptViewProps> = ({
  successBookings,
  onBookAnother,
  onViewBookings
}) => {
  if (!successBookings || successBookings.length === 0) return null;

  const totalAmount = successBookings.reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <Card className="p-8 sm:p-10 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl space-y-8">
          
          {/* Top Success Badge */}
          <div className="space-y-3">
            <div className="w-16 h-16 mx-auto bg-brand-green/15 text-brand-green rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Appointment Confirmed!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto font-medium leading-relaxed">
              Your service request has been transmitted to our verified partner. Payment verification is currently in progress.
            </p>
          </div>

          {/* Official Service Voucher / Receipt Ticket Card */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 text-left shadow-inner relative overflow-hidden space-y-6">
            
            {/* Top Zigzag Ticket Border */}
            <div
              className="absolute top-0 left-0 w-full h-2.5 opacity-30 dark:opacity-20"
              style={{
                backgroundImage: 'radial-gradient(circle, #0f172a 3px, transparent 3.5px)',
                backgroundSize: '12px 12px',
                backgroundRepeat: 'repeat-x'
              }}
            />

            {/* Receipt Header */}
            <div className="text-center pt-2 pb-5 border-b border-dashed border-slate-300 dark:border-slate-700">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/70 dark:bg-slate-700/70 text-slate-700 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest mb-2">
                <FileText className="w-3 h-3 text-brand-navy dark:text-blue-400" />
                <span>Official Service Voucher</span>
              </div>
              <p className="text-xs font-bold text-slate-400">{new Date().toLocaleString()}</p>
            </div>

            {/* Bookings Breakdown */}
            <div className="space-y-6">
              {successBookings.map((b, idx) => (
                <div key={idx} className="pb-6 border-b border-dashed border-slate-300 dark:border-slate-700 last:border-0 last:pb-0 space-y-4">
                  
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Service Type</span>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
                        {b.service_type || b.sub_service}
                      </h3>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Amount</span>
                      <p className="text-lg font-black text-brand-green mt-0.5">
                        ₱{Number(b.total_price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-3 bg-white dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 text-xs">
                    <div>
                      <span className="font-bold text-[10px] uppercase text-slate-400 flex items-center gap-1 mb-0.5">
                        <FileText className="w-3 h-3 text-slate-400" />
                        <span>Booking Reference</span>
                      </span>
                      <span className="font-mono text-slate-800 dark:text-slate-200 font-extrabold">
                        {formatBookingId(b.id)}
                      </span>
                    </div>

                    <div>
                      <span className="font-bold text-[10px] uppercase text-slate-400 flex items-center gap-1 mb-0.5">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>Assigned Partner</span>
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-6 h-6 rounded-lg bg-brand-navy text-white flex items-center justify-center font-black text-[10px] shrink-0 overflow-hidden border border-slate-200/60 dark:border-slate-700/60">
                          {(b.vendor_avatar || b.vendor_logo || b.avatar_url || b.logo_url) ? (
                            <img src={b.vendor_avatar || b.vendor_logo || b.avatar_url || b.logo_url} alt="Partner" className="w-full h-full object-cover" />
                          ) : (
                            <span>{(b.vendor_name || 'V').charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <span className="text-slate-800 dark:text-slate-200 font-extrabold truncate block">
                          {b.vendor_name || 'Verified Professional'}
                        </span>
                      </div>
                    </div>

                    <div className="col-span-2 pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
                      <div>
                        <span className="font-bold text-[10px] uppercase text-slate-400 flex items-center gap-1 mb-0.5">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>Schedule</span>
                        </span>
                        <span className="text-slate-800 dark:text-slate-200 font-bold">
                          {b.scheduled_date} at {b.scheduled_time}
                        </span>
                      </div>

                      <div>
                        <span className="font-bold text-[10px] uppercase text-slate-400 flex items-center gap-1 mb-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Status</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span>Pending Payment Verification</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {b.discount_amount > 0 && (
                    <div className="flex justify-between items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3.5 py-2 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40">
                      <span>Voucher Discount Applied</span>
                      <span>-₱{Number(b.discount_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}

                </div>
              ))}
            </div>

            {/* Total Footer */}
            <div className="pt-5 border-t-2 border-slate-800 dark:border-white flex justify-between items-baseline">
              <div>
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                  Total Amount Transferred
                </span>
                <p className="text-[10px] text-slate-400 font-medium">Includes taxes & service partner fees</p>
              </div>
              <span className="text-2xl sm:text-3xl font-black text-brand-navy dark:text-white">
                ₱{totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Bottom Zigzag Ticket Border */}
            <div
              className="absolute bottom-0 left-0 w-full h-2.5 opacity-30 dark:opacity-20"
              style={{
                backgroundImage: 'radial-gradient(circle, #0f172a 3px, transparent 3.5px)',
                backgroundSize: '12px 12px',
                backgroundRepeat: 'repeat-x',
                backgroundPosition: 'bottom'
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 py-3.5 text-xs sm:text-sm font-bold rounded-2xl border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={onBookAnother}
            >
              Book Another Service
            </Button>

            <Button
              type="button"
              variant="primary"
              className="flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors"
              onClick={onViewBookings}
            >
              <span>Track in My Bookings</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-semibold">
            <ShieldCheck className="w-4 h-4 text-brand-green" />
            <span>Need assistance? Contact 24/7 ALLFIX Concierge via Help Tab</span>
          </div>

        </Card>
      </motion.div>
    </div>
  );
};
