import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  User,
  MapPin,
  ShieldCheck,
  ArrowRight,
  Trash2,
  FileText,
  AlertCircle,
  CheckCircle2,
  ChevronLeft
} from 'lucide-react';
import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import { useConfirm } from '../../hooks/useConfirm';
import { ServiceSelectionItem } from './BookingServiceForm';

export interface ServiceReviewTabProps {
  selectedService: ServiceSelectionItem | null;
  onClearSelection: () => void;
  onProceedToCheckout: () => void;
}

export const ServiceReviewTab: React.FC<ServiceReviewTabProps> = ({
  selectedService,
  onClearSelection,
  onProceedToCheckout
}) => {
  const navigate = useNavigate();
  const { confirm, ConfirmComponent } = useConfirm();

  const handleClear = () => {
    confirm({
      title: 'Clear Active Selection?',
      message: 'Are you sure you want to remove your scheduled service selection? You will need to reconfigure your appointment.',
      confirmText: 'Yes, Clear Selection',
      cancelText: 'Keep Selection',
      type: 'danger',
      onConfirm: () => {
        onClearSelection();
      }
    });
  };

  if (!selectedService) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <Card className="p-10 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-6 shadow-xl">
          <div className="w-20 h-20 bg-brand-navy/10 dark:bg-brand-navy/30 text-brand-navy dark:text-blue-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Calendar className="w-10 h-10" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">No Active Service Selected</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              You haven't configured a service appointment yet. Choose your preferred repair or maintenance service, pick a schedule, and match with a verified professional.
            </p>
          </div>
          <div className="pt-2">
            <Button
              variant="primary"
              onClick={() => navigate('/customer/book')}
              className="py-3 px-8 rounded-xl font-bold text-sm shadow-sm inline-flex items-center gap-2 transition-colors"
            >
              <span>Configure New Appointment</span>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <ConfirmComponent />

      {/* Header Bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate('/customer/book')}
          className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors py-2 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Studio</span>
        </button>
        <span className="text-xs font-extrabold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-ping" />
          <span>Step 1 of 2: Review Booking</span>
        </span>
      </div>

      {/* Main Review Card */}
      <Card className="p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm bg-gradient-to-b from-white to-slate-50/30 dark:from-slate-900 dark:to-slate-900/90 space-y-8">
        
        {/* Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {selectedService.workType || selectedService.subServiceName}
              </h1>
              <span className="px-2.5 py-0.5 rounded-md bg-brand-green/15 text-brand-green text-xs font-extrabold uppercase">
                Ready
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-bold mt-1">
              Category: <span className="text-slate-800 dark:text-slate-200">{selectedService.serviceName}</span> • Subservice: <span className="text-slate-800 dark:text-slate-200">{selectedService.subServiceName}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 py-2.5 px-4 rounded-xl transition-colors flex items-center gap-2 self-start sm:self-auto border border-rose-200/60 dark:border-rose-900/40"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Selection</span>
          </button>
        </div>

        {/* 2-Column Grid: Schedule & Partner vs Description & Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Schedule & Partner */}
          <div className="space-y-4 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-brand-navy dark:text-blue-400" />
              <span>Appointment Schedule</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Scheduled Date</p>
                <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                  {selectedService.scheduledDate ? new Date(selectedService.scheduledDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Start Time</p>
                <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                  {selectedService.scheduledTime || '—'}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Assigned Professional Partner</p>
              <div className="flex items-center gap-3 mt-1.5">
                <div className="w-9 h-9 rounded-xl bg-brand-navy text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm overflow-hidden border border-slate-200/60 dark:border-slate-700/60">
                  {(selectedService.vendorAvatar || (selectedService as any).avatar_url || (selectedService as any).logo_url || (selectedService as any).profile_image || (selectedService as any).vendor_avatar || (selectedService as any).vendor_logo) ? (
                    <img src={selectedService.vendorAvatar || (selectedService as any).avatar_url || (selectedService as any).logo_url || (selectedService as any).profile_image || (selectedService as any).vendor_avatar || (selectedService as any).vendor_logo} alt={selectedService.vendorName} className="w-full h-full object-cover" />
                  ) : (
                    <span>{(selectedService.vendorName || 'V').charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                      {selectedService.vendorName}
                    </span>
                    <ShieldCheck className="w-4 h-4 text-brand-green shrink-0" />
                  </div>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">Verified Service Partner</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Notes / Symptoms */}
          <div className="space-y-4 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
                <FileText className="w-4 h-4 text-brand-navy dark:text-blue-400" />
                <span>Problem Description & Notes</span>
              </h3>
              {selectedService.description ? (
                <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed italic bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  "{selectedService.description}"
                </p>
              ) : (
                <p className="text-xs text-slate-400 font-semibold italic">
                  No additional notes or symptoms specified for this appointment.
                </p>
              )}
            </div>

            <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 rounded-xl flex items-center gap-2.5 text-blue-800 dark:text-blue-300 text-[11px] font-bold">
              <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Specialist will review notes prior to dispatch.</span>
            </div>
          </div>

        </div>

        {/* Pricing Breakdown Card */}
        <div className="bg-slate-900 dark:bg-slate-950 text-white p-6 rounded-2xl shadow-lg space-y-4 border border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Service Price Estimation</span>
            <span className="text-xs font-semibold text-slate-400">Unit Price: ₱{selectedService.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="flex items-center justify-between text-sm font-bold">
            <span className="text-slate-300">Quantity / Units</span>
            <span>{selectedService.quantity} Unit{selectedService.quantity > 1 ? 's' : ''}</span>
          </div>

          <div className="flex items-baseline justify-between pt-2 border-t border-slate-800">
            <div>
              <span className="text-base sm:text-lg font-black text-white">Estimated Final Total</span>
              <p className="text-[11px] text-slate-400 font-medium">Final onsite quote may vary based on required replacement parts</p>
            </div>
            <span className="text-3xl font-black text-brand-green">
              ₱{selectedService.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/customer/book')}
            className="w-full sm:w-auto py-3.5 px-6 rounded-2xl font-bold text-xs border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Edit Specifications
          </Button>

          <Button
            type="button"
            variant="success"
            onClick={onProceedToCheckout}
            className="w-full sm:w-auto py-3.5 px-8 rounded-xl font-bold text-sm shadow-sm flex items-center justify-center gap-2.5 transition-colors"
          >
            <span>Continue to Checkout Drawer</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>

      </Card>
    </div>
  );
};
