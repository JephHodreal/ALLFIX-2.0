import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wrench,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Star,
  MapPin,
  Info,
  Layers,
  HelpCircle
} from 'lucide-react';
import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import api from '../../services/apiService';
import { useConfirm } from '../../hooks/useConfirm';

export interface ServiceSelectionItem {
  id: string;
  serviceId: string;
  serviceName: string;
  subServiceId: string;
  subServiceName: string;
  workType: string;
  description?: string;
  vendorId: string;
  vendorName: string;
  vendorAvatar?: string;
  scheduledDate: string;
  scheduledTime: string;
  quantity: number;
  price: number;
  total: number;
  slotId?: string | null;
}

export interface BookingServiceFormProps {
  selectedService: ServiceSelectionItem | null;
  onSelectService: (service: ServiceSelectionItem, proceedToReview: boolean) => void;
}

export const BookingServiceForm: React.FC<BookingServiceFormProps> = ({
  selectedService,
  onSelectService
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const subserviceParam = searchParams.get('subservice') || '';
  const editParam = searchParams.get('edit') || '';
  const navigate = useNavigate();
  const { confirm, ConfirmComponent } = useConfirm();

  // Helper to check if a booking slot has already passed
  const isSlotPassed = (dateStr: string, timeStr: string) => {
    if (!dateStr || !timeStr) return false;
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const todayStr = `${y}-${m}-${d}`;

    if (dateStr < todayStr) return true;
    if (dateStr === todayStr) {
      const currentHour = now.getHours();
      const currentMin = now.getMinutes();
      const [selHour, selMin] = timeStr.split(':').map(Number);
      if (selHour < currentHour || (selHour === currentHour && selMin <= currentMin)) {
        return true;
      }
    }
    return false;
  };

  const [services, setServices] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [serviceId, setServiceId] = useState('');
  const [subServiceId, setSubServiceId] = useState('');
  const [workType, setWorkType] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [description, setDescription] = useState('');

  const [scheduleAvailableVendors, setScheduleAvailableVendors] = useState<any[]>([]);
  const [fetchingAvailableVendors, setFetchingAvailableVendors] = useState(false);
  const [timeError, setTimeError] = useState('');
  const [formError, setFormError] = useState('');

  // Edit / Status state
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/api/services'),
      api.get('/api/vendors/approved')
    ])
      .then(([svcRes, venRes]) => {
        setServices(svcRes.data || []);
        setVendors(venRes.data || []);
      })
      .catch(err => {
        console.error("Failed to load booking form data", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Pre-fill selection based on existing selectedService when editing
  useEffect(() => {
    if (editParam && selectedService && selectedService.id === editParam && services.length > 0) {
      setEditingId(selectedService.id);
      setServiceId(selectedService.serviceId);
      setSubServiceId(selectedService.subServiceId);
      setWorkType(selectedService.workType);
      setDescription(selectedService.description || '');
      setVendorId(selectedService.vendorId);
      setScheduledDate(selectedService.scheduledDate);
      setScheduledTime(selectedService.scheduledTime);
      setQuantity(selectedService.quantity);
      setSearchParams({});
    }
  }, [editParam, selectedService, services, setSearchParams]);

  // Pre-fill selection based on query params
  useEffect(() => {
    if (editParam) return;
    if (services.length > 0 && subserviceParam && !editingId) {
      const matchedSvc = services.find((s: any) =>
        s.subServices?.some((sub: any) => sub.name?.toLowerCase() === subserviceParam.toLowerCase())
      );
      const matchedSub = matchedSvc?.subServices?.find((sub: any) => sub.name?.toLowerCase() === subserviceParam.toLowerCase());

      if (matchedSvc && matchedSub) {
        setServiceId(matchedSvc.id || matchedSvc.name?.toLowerCase()?.replace(/\s+/g, ''));
        setSubServiceId(matchedSub.id || matchedSub.name);
        const subWorkTypes = matchedSub.workTypes || [];
        if (subWorkTypes.length > 0) {
          setWorkType(subWorkTypes[0]);
        } else {
          setWorkType(matchedSub.name);
        }
      }
    }
  }, [services, subserviceParam, editingId, editParam]);

  // Find active category & subservice
  const activeServiceCategory = services.find((s: any) => s.id === serviceId || s.name?.toLowerCase()?.replace(/\s+/g, '') === serviceId);
  const subServicesOptions = activeServiceCategory?.subServices || [];
  const activeSubService = subServicesOptions.find((sub: any) => sub.id === subServiceId || sub.name === subServiceId);

  // Available Work Types
  const workTypeOptions = activeSubService?.workTypes && activeSubService.workTypes.length > 0
    ? activeSubService.workTypes
    : activeSubService ? [activeSubService.name] : [];

  // Validate preferred start time is not in the past for today's date
  useEffect(() => {
    if (scheduledDate && scheduledTime) {
      if (isSlotPassed(scheduledDate, scheduledTime)) {
        setTimeError('This time slot has already passed for today. Please select a future schedule.');
      } else {
        setTimeError('');
      }
    } else {
      setTimeError('');
    }
  }, [scheduledDate, scheduledTime]);

  // Fetch schedule-available vendors from database
  useEffect(() => {
    if (serviceId && workType && scheduledDate && scheduledTime && !timeError) {
      setFetchingAvailableVendors(true);
      const activeSvc = services.find((s: any) => s.id === serviceId || s.name?.toLowerCase()?.replace(/\s+/g, '') === serviceId);
      const params = {
        service_name: activeSvc?.name || '',
        service_brand: activeSvc?.brand || '',
        sub_service: activeSubService?.name || '',
        work_type: workType,
        date: scheduledDate,
        time: scheduledTime
      };

      api.get('/api/slots/available-vendors-schedule', { params })
        .then(res => {
          setScheduleAvailableVendors(res.data || []);
        })
        .catch(err => {
          console.error('[CAVEMAN] FETCH ERROR:', err);
          setScheduleAvailableVendors([]);
        })
        .finally(() => {
          setFetchingAvailableVendors(false);
        });
    } else {
      setScheduleAvailableVendors([]);
    }
  }, [serviceId, workType, scheduledDate, scheduledTime, services, activeSubService?.name, timeError]);

  // Filter selectable vendors (must have available slots > 0)
  const selectableVendors = scheduleAvailableVendors.filter((v: any) => {
    const avail = v.available_slots !== undefined && v.available_slots !== null ? v.available_slots : v.total_slots;
    return avail === undefined || avail === null || avail > 0;
  });

  // Automatically deselect vendor if they have 0 slots remaining
  useEffect(() => {
    if (vendorId && scheduleAvailableVendors.length > 0) {
      const isSelectable = selectableVendors.some(v => v.id === vendorId);
      if (!isSelectable) {
        setVendorId('');
      }
    }
  }, [scheduleAvailableVendors, vendorId]);

  // Filter vendors by capability
  const availableVendors = vendors.filter((v: any) => {
    if (!activeServiceCategory || !workType) return false;
    if (!v.services || !Array.isArray(v.services)) return false;
    return v.services.some((vs: any) => {
      if (vs.service?.toLowerCase() !== activeServiceCategory.brand?.toLowerCase() && vs.service?.toLowerCase() !== activeServiceCategory.name?.toLowerCase()) return false;
      if (vs.work_types && Array.isArray(vs.work_types)) {
        return vs.work_types.some((wt: any) =>
          wt.name?.toLowerCase() === workType?.toLowerCase() &&
          wt.status === 'approved'
        );
      }
      return false;
    });
  });

  const rawPrice =
    activeSubService?.prices?.[workType] ??
    activeSubService?.prices?.[activeSubService?.name] ??
    activeSubService?.prices?.['Base Price'] ??
    activeSubService?.price ??
    activeSubService?.basePrice ??
    activeSubService?.base_price ??
    activeServiceCategory?.price ??
    activeServiceCategory?.basePrice ??
    0;
  const price = typeof rawPrice === 'string' ? Number(rawPrice.replace(/[^0-9.]/g, '')) || 0 : Number(rawPrice) || 0;
  const itemTotal = price * quantity;
  const selectedVendorObj = selectableVendors.find(v => v.id === vendorId) || vendors.find(v => v.id === vendorId);

  // Handle service selection and checkout trigger
  const handleProceedToBooking = (proceedToReview: boolean) => {
    setFormError('');

    if (!serviceId || !subServiceId || !workType || !vendorId || !scheduledDate || !scheduledTime || quantity < 1) {
      setFormError('Please complete all required service specifications and select a schedule.');
      return;
    }

    if (timeError) {
      setFormError(timeError);
      return;
    }

    const isVendorSelectable = selectableVendors.some(v => v.id === vendorId);
    if (!isVendorSelectable) {
      setFormError('The selected service provider is no longer available for this schedule. Please pick another partner.');
      return;
    }

    const selectionItem: ServiceSelectionItem = {
      id: editingId || Math.random().toString(36).substring(2, 9),
      serviceId,
      serviceName: activeServiceCategory?.brand || activeServiceCategory?.name || serviceId,
      subServiceId,
      subServiceName: activeSubService?.name || subServiceId,
      workType,
      description,
      vendorId,
      vendorName: selectedVendorObj?.company_name || selectedVendorObj?.name || selectedVendorObj?.username || 'Assigned Partner',
      vendorAvatar: selectedVendorObj?.avatar_url || selectedVendorObj?.logo_url || selectedVendorObj?.profile_image || selectedVendorObj?.photo_url || selectedVendorObj?.avatar || selectedVendorObj?.vendor_avatar || selectedVendorObj?.vendor_logo || '',
      scheduledDate,
      scheduledTime,
      quantity,
      price,
      total: itemTotal,
      slotId: selectedVendorObj?.slot_id || null
    };

    // Check if we are replacing an existing completely different service category or item
    const isDifferentService = selectedService &&
      selectedService.id !== editingId &&
      !editingId &&
      (selectedService.subServiceId !== selectionItem.subServiceId || selectedService.serviceId !== selectionItem.serviceId);

    if (isDifferentService) {
      confirm({
        title: 'Replace Active Selection?',
        message: `You currently have "${selectedService.subServiceName}" scheduled. Would you like to replace it with "${selectionItem.subServiceName}"?`,
        confirmText: proceedToReview ? 'Yes, Replace & Review' : 'Yes, Replace & Save',
        cancelText: 'Keep Current',
        type: 'warning',
        onConfirm: () => {
          onSelectService(selectionItem, proceedToReview);
          if (proceedToReview) {
            navigate('/customer/review');
          } else {
            confirm({
              title: 'Selection Saved!',
              message: `Your appointment for "${selectionItem.subServiceName}" on ${new Date(scheduledDate).toLocaleDateString()} has been saved to your active summary. You can proceed to review whenever you're ready!`,
              confirmText: 'Proceed to Review Now',
              cancelText: 'Continue Browsing',
              type: 'info',
              onConfirm: () => navigate('/customer/review')
            });
          }
        }
      });
      return;
    }

    // Normal flow (no conflicting existing service)
    onSelectService(selectionItem, proceedToReview);
    if (proceedToReview) {
      navigate('/customer/review');
    } else {
      // Provide positive visual feedback when clicking "Save Selection & Continue Later"
      confirm({
        title: 'Selection Saved!',
        message: `Your appointment for "${selectionItem.subServiceName}" on ${new Date(scheduledDate).toLocaleDateString()} has been saved to your active summary. You can proceed to review whenever you're ready!`,
        confirmText: 'Proceed to Review Now',
        cancelText: 'Continue Browsing',
        type: 'info',
        onConfirm: () => navigate('/customer/review')
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="w-10 h-10 border-4 border-brand-navy border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ConfirmComponent />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-brand-navy to-[#0a2d5c] text-white p-6 rounded-3xl shadow-lg border border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Interactive Appointment Studio</h1>
          </div>
          <p className="text-xs sm:text-sm text-blue-100/90 font-medium">
            Configure your required service, choose your preferred schedule, and book directly with verified specialists.
          </p>
        </div>
        {selectedService && (
          <Button
            variant="outline"
            onClick={() => navigate('/customer/review')}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs font-bold py-2 px-4 rounded-2xl flex items-center gap-2 shrink-0 self-start md:self-auto"
          >
            <span>View Pending Selection</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Global Form Validation Error Banner */}
      <AnimatePresence>
        {formError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-2xl flex items-center gap-3 text-rose-700 dark:text-rose-300 shadow-sm"
          >
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400" />
            <span className="text-xs sm:text-sm font-bold">{formError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Studio Grid: 2/3 Configurator + 1/3 Sticky Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Service & Schedule Configurator (8/12) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Section 1: Service Specification */}
          <Card className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-brand-navy/10 dark:bg-brand-navy/30 text-brand-navy dark:text-blue-400 flex items-center justify-center font-black text-sm">
                1
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Service Specification</h3>
                <p className="text-[11px] text-slate-400 font-semibold">Select the exact category and type of repair or service needed</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Service Category */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Service Category *
                </label>
                <select
                  value={serviceId}
                  onChange={(e) => {
                    setServiceId(e.target.value);
                    setSubServiceId('');
                    setWorkType('');
                    setVendorId('');
                    setFormError('');
                  }}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-navy transition-all"
                >
                  <option value="">Select Category...</option>
                  {services.map((s: any) => (
                    <option key={s.id} value={s.id || s.name?.toLowerCase()?.replace(/\s+/g, '')}>
                      {s.brand || s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sub-Service */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Specific Service / Item *
                </label>
                <select
                  value={subServiceId}
                  disabled={!serviceId}
                  onChange={(e) => {
                    const selectedVal = e.target.value;
                    setSubServiceId(selectedVal);
                    const selectedSub = subServicesOptions.find((sub: any) => sub.id === selectedVal || sub.name === selectedVal);
                    if (selectedSub?.workTypes && selectedSub.workTypes.length > 0) {
                      setWorkType(selectedSub.workTypes[0]);
                    } else if (selectedSub) {
                      setWorkType(selectedSub.name);
                    } else {
                      setWorkType('');
                    }
                    setVendorId('');
                    setFormError('');
                  }}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-navy disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <option value="">Select Sub-service...</option>
                  {subServicesOptions.map((sub: any) => (
                    <option key={sub.id || sub.name} value={sub.id || sub.name}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Work Type */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Scope of Work / Task *
                </label>
                <select
                  value={workType}
                  disabled={!subServiceId}
                  onChange={(e) => {
                    setWorkType(e.target.value);
                    setVendorId('');
                    setFormError('');
                  }}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-navy disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <option value="">Select Work Type...</option>
                  {workTypeOptions.map((wt: string, idx: number) => (
                    <option key={idx} value={wt}>
                      {wt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description / Additional Notes */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Additional Notes or Symptoms (Optional)
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Aircon leaking water from indoor unit, laptop screen flickers when tilted..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-navy placeholder:text-slate-400 transition-all"
                />
              </div>
            </div>
          </Card>

          {/* Section 2: Schedule & Partner Selection */}
          <Card className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-brand-navy/10 dark:bg-brand-navy/30 text-brand-navy dark:text-blue-400 flex items-center justify-center font-black text-sm">
                2
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Schedule & Partner Selection</h3>
                <p className="text-[11px] text-slate-400 font-semibold">Pick your preferred appointment time and select a verified service provider</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Preferred Date */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-brand-navy dark:text-blue-400" />
                  <span>Preferred Date *</span>
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={scheduledDate}
                  onChange={(e) => {
                    setScheduledDate(e.target.value);
                    setVendorId('');
                    setFormError('');
                  }}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-navy transition-all"
                />
              </div>

              {/* Preferred Time */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-brand-navy dark:text-blue-400" />
                  <span>Preferred Start Time *</span>
                </label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => {
                    setScheduledTime(e.target.value);
                    setVendorId('');
                    setFormError('');
                  }}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-navy transition-all"
                />
              </div>
            </div>

            {/* Time Slot Error Banner */}
            <AnimatePresence>
              {timeError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl flex items-center gap-2.5 text-amber-800 dark:text-amber-300 text-xs font-bold"
                >
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>{timeError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Vendor / Partner Selection List */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Available Verified Partners
                </label>
                {fetchingAvailableVendors && (
                  <span className="text-[11px] text-brand-navy dark:text-blue-400 font-bold flex items-center gap-1.5 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-brand-navy dark:bg-blue-400" />
                    Checking live partner schedules...
                  </span>
                )}
              </div>

              {!serviceId || !workType || !scheduledDate || !scheduledTime ? (
                <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-2">
                  <User className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Please select a service specification, date, and time above to view available verified partners.
                  </p>
                </div>
              ) : fetchingAvailableVendors ? (
                <div className="p-8 bg-slate-50 dark:bg-slate-800/40 rounded-2xl flex flex-col items-center justify-center gap-3">
                  <div className="w-7 h-7 border-3 border-brand-navy border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-bold text-slate-500">Matching with top-rated professionals nearby...</p>
                </div>
              ) : selectableVendors.length === 0 ? (
                <div className="p-6 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 rounded-2xl text-center space-y-2">
                  <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    No verified partners are currently available for your selected date and time.
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Please try selecting a different schedule or time slot.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 max-h-[320px] overflow-y-auto pr-1">
                  {selectableVendors.map((v: any) => {
                    const isSelected = vendorId === v.id;
                    const availSlots = v.available_slots !== undefined && v.available_slots !== null ? v.available_slots : v.total_slots;
                    return (
                      <div
                        key={v.id}
                        onClick={() => {
                          setVendorId(v.id);
                          setFormError('');
                        }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                          isSelected
                            ? 'border-brand-navy bg-brand-navy/5 dark:bg-brand-navy/20 shadow-md border-2'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-sm overflow-hidden border border-slate-200/60 dark:border-slate-700/60 ${
                            isSelected
                              ? 'bg-brand-navy text-white dark:bg-blue-500 border-brand-navy dark:border-blue-500'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}>
                            {(v.avatar_url || v.logo_url || v.profile_image || v.photo_url || v.avatar || v.vendor_avatar || v.vendor_logo) ? (
                              <img src={v.avatar_url || v.logo_url || v.profile_image || v.photo_url || v.avatar || v.vendor_avatar || v.vendor_logo} alt={v.company_name || v.name || 'Vendor Logo'} className="w-full h-full object-cover" />
                            ) : (
                              <span>{(v.company_name || v.name || 'V').charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                                {v.company_name || v.name || v.username}
                              </h4>
                              <ShieldCheck className="w-4 h-4 text-brand-green shrink-0" />
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                              {v.city && (
                                <span className="flex items-center gap-1 truncate">
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  {v.city}
                                </span>
                              )}
                              {availSlots !== undefined && (
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                  • {availSlots} slot{availSlots > 1 ? 's' : ''} left
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'border-brand-navy bg-brand-navy text-white dark:border-blue-400 dark:bg-blue-400'
                              : 'border-slate-300 dark:border-slate-600 bg-transparent'
                          }`}>
                            {isSelected && <CheckCircle2 className="w-4 h-4" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Sticky Live Appointment Summary (4/12) */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
          <Card className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/90 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-brand-navy dark:text-blue-400" />
                <span>Live Summary</span>
              </span>
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50">
                Service Booking
              </span>
            </div>

            {/* Selected Specification Summary */}
            <div className="space-y-3.5">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Selected Service</p>
                <h4 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                  {workType || activeSubService?.name || 'No specification selected'}
                </h4>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  {activeServiceCategory?.brand || activeServiceCategory?.name || 'Category not selected'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Schedule</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {scheduledDate ? new Date(scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </p>
                  <p className="text-[11px] text-slate-500 font-semibold">{scheduledTime || 'Time not set'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Partner</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                    {selectedVendorObj ? (selectedVendorObj.company_name || selectedVendorObj.name) : '—'}
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    {selectedVendorObj ? 'Verified Partner' : 'Not selected'}
                  </p>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Service Units / Quantity</span>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-xs">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center font-black text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-black text-xs text-slate-900 dark:text-white">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center font-black text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total Estimated Price */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-baseline justify-between">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Estimated Total</p>
                  <p className="text-[10px] text-slate-400 font-medium">Final price subject to onsite evaluation</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-brand-green">
                    ₱{itemTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Primary Checkout Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <Button
                type="button"
                variant="success"
                onClick={() => handleProceedToBooking(true)}
                className="w-full py-3.5 rounded-xl font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-colors"
              >
                <span>Proceed to Review & Book</span>
                <ArrowRight className="w-4 h-4" />
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => handleProceedToBooking(false)}
                className="w-full py-3 rounded-2xl font-bold text-xs border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              >
                Save Selection & Continue Later
              </Button>
            </div>

            <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-slate-400 font-semibold">
              <ShieldCheck className="w-4 h-4 text-brand-green" />
              <span>100% Guaranteed Quality Service Partner</span>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};
