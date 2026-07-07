import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  CreditCard,
  FileText,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Copy,
  Check,
  Tag,
  ShieldCheck,
  X,
  Home,
  QrCode
} from 'lucide-react';
import { Button } from '../shared/Button';
import api from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';
import { ServiceSelectionItem } from './BookingServiceForm';
import { BookingCancelPrompt } from './BookingCancelPrompt';

export interface CheckoutWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedService: ServiceSelectionItem | null;
  onSuccess: (createdBookings: any[]) => void;
}

export const CheckoutWizardModal: React.FC<CheckoutWizardModalProps> = ({
  isOpen,
  onClose,
  selectedService,
  onSuccess
}) => {
  const { profile } = useAuth();
  const [step, setStep] = useState(1); // 1: Location, 2: Payment & Voucher, 3: Proof & Verification
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);

  // Address Form States
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('profile-default');
  const [useProfileAddress, setUseProfileAddress] = useState(true);
  const [unitNo, setUnitNo] = useState('');
  const [street, setStreet] = useState('');
  const [barangay, setBarangay] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Payment Gateway States
  const [methods, setMethods] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>('GCash');

  // Payment Proof States
  const [referenceNumber, setReferenceNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  // Voucher States
  const [voucherCode, setVoucherCode] = useState('');
  const [availableVouchers, setAvailableVouchers] = useState<any[]>([]);
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [appliedVoucherId, setAppliedVoucherId] = useState('');
  const [voucherValidationMsg, setVoucherValidationMsg] = useState<{ type: 'success' | 'error' | ''; message: string }>({ type: '', message: '' });
  const [voucherValidating, setVoucherValidating] = useState(false);

  const getCleanAddressParts = (addrObj: any, fallbackProfile: any) => {
    const u = (addrObj?.unit_house_no || fallbackProfile?.unit_house_no || '').toString().trim();
    let s = (addrObj?.street || addrObj?.address_line || fallbackProfile?.street || '').toString().trim();
    if (u && s.toLowerCase().startsWith(u.toLowerCase() + ' ')) {
      s = s.substring(u.length + 1).trim();
    } else if (u && s.toLowerCase().startsWith(u.toLowerCase() + ', ')) {
      s = s.substring(u.length + 2).trim();
    }
    return { unit: u, street: s };
  };

  // Reset step & errors when opened
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setErrorMsg('');
      setShowCancelPrompt(false);
      setCopied(false);
      if (profile) {
        api.get(`/api/addresses/customer/${profile.id}`).then((res) => {
          const list = res.data || [];
          setSavedAddresses(list);
          if (list.length > 0) {
            const def = list.find((a: any) => a.is_default) || list[0];
            const { unit, street: cleanStreet } = getCleanAddressParts(def, profile);
            setSelectedAddressId(def.id || def.uid || '0');
            setUseProfileAddress(true);
            setCity(def.city || (profile as any).city || '');
            setBarangay(def.barangay || (profile as any).barangay || '');
            setStreet(cleanStreet);
            setUnitNo(unit);
            setPostalCode(def.postal_code || (profile as any).postal_code || '');
          } else {
            const { unit, street: cleanStreet } = getCleanAddressParts({}, profile);
            setSelectedAddressId('profile-default');
            setCity((profile as any).city || '');
            setBarangay((profile as any).barangay || '');
            setStreet(cleanStreet);
            setUnitNo(unit);
            setPostalCode((profile as any).postal_code || '');
            const hasFullAddr = Boolean((profile as any).city && (profile as any).barangay && (unit || cleanStreet));
            setUseProfileAddress(hasFullAddr);
          }
        }).catch(() => {
          const { unit, street: cleanStreet } = getCleanAddressParts({}, profile);
          setSelectedAddressId('profile-default');
          setCity((profile as any).city || '');
          setBarangay((profile as any).barangay || '');
          setStreet(cleanStreet);
          setUnitNo(unit);
          setPostalCode((profile as any).postal_code || '');
          const hasFullAddr = Boolean((profile as any).city && (profile as any).barangay && (unit || cleanStreet));
          setUseProfileAddress(hasFullAddr);
        });
      }
    }
  }, [isOpen, profile]);

  // Load payment methods
  useEffect(() => {
    if (isOpen) {
      const fetchMethods = async () => {
        const defaultMethod = {
          id: 'default-gcash',
          paymentMethod: 'GCash',
          accountName: 'ALLFIX.PH',
          accountNumber: '0917-123-4567',
          qrImageUrl: '/images/sample-gcash-qr.png'
        };
        try {
          const res = await api.get('/api/payments/methods');
          const data = res.data || [];
          if (data.length > 0) {
            setMethods(data);
            setPaymentMethod(data[0].paymentMethod);
          } else {
            setMethods([defaultMethod]);
            setPaymentMethod(defaultMethod.paymentMethod);
          }
        } catch (err) {
          console.error('[CAVEMAN] Failed to load payment methods', err);
          setMethods([defaultMethod]);
          setPaymentMethod(defaultMethod.paymentMethod);
        }
      };
      fetchMethods();
    }
  }, [isOpen]);

  // Load available customer vouchers
  useEffect(() => {
    if (isOpen && profile?.id) {
      const fetchCheckoutVouchers = async () => {
        try {
          const res = await api.get(`/api/vouchers/customer/${profile.id}`);
          const fetched = res.data || [];
          const active = fetched.filter((v: any) => v.status === 'unused' && v.temp_delete !== 1);
          setAvailableVouchers(active);
        } catch (err: any) {
          console.error('[CAVEMAN] Failed to load customer vouchers for checkout', err);
        }
      };
      fetchCheckoutVouchers();
    }
  }, [isOpen, profile]);

  // Debounced voucher validation
  const totalAmount = selectedService?.total || 0;
  const finalAmount = Math.max(0, totalAmount - appliedDiscount);

  useEffect(() => {
    if (!voucherCode.trim()) {
      setAppliedDiscount(0);
      setAppliedVoucherId('');
      setVoucherValidationMsg({ type: '', message: '' });
      setVoucherValidating(false);
      return;
    }

    if (!profile?.id) return;

    setVoucherValidating(true);
    const debounceTimer = setTimeout(async () => {
      const trimmedCode = voucherCode.trim();
      try {
        const res = await api.get('/api/vouchers/validate', {
          params: { code: trimmedCode, customerId: profile.id }
        });
        const data = res.data;

        if (data.valid) {
          let discount = 0;
          if (data.discount_type === 'percentage') {
            discount = (totalAmount * Number(data.discount_value)) / 100;
          } else {
            discount = Number(data.discount_value);
          }
          setAppliedDiscount(discount);
          setAppliedVoucherId(data.voucher_id);
          setVoucherValidationMsg({ type: 'success', message: data.message || 'Voucher applied successfully!' });
        } else {
          setAppliedDiscount(0);
          setAppliedVoucherId('');
          setVoucherValidationMsg({ type: 'error', message: data.message || 'Invalid voucher code.' });
        }
      } catch (err: any) {
        setAppliedDiscount(0);
        setAppliedVoucherId('');
        setVoucherValidationMsg({ type: 'error', message: 'Failed to validate voucher.' });
      } finally {
        setVoucherValidating(false);
      }
    }, 500);

    return () => {
      clearTimeout(debounceTimer);
      setVoucherValidating(false);
    };
  }, [voucherCode, profile?.id, totalAmount]);

  if (!isOpen || !selectedService) return null;

  const currentMethodObj = methods.find(m => m.paymentMethod === paymentMethod) || methods[0] || {};

  const handleCopyAccount = (accNo: string) => {
    if (!accNo) return;
    navigator.clipboard.writeText(accNo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (step === 1) {
      if (!unitNo.trim() || !street.trim() || !barangay.trim() || !city.trim()) {
        setErrorMsg('Please complete all required address fields (Unit/House No, Street, Barangay, City).');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handlePreSubmitCheck = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!referenceNumber.trim()) {
      setErrorMsg('Please enter your payment transaction reference number.');
      return;
    }
    if (!accountName.trim()) {
      setErrorMsg('Please provide the account name used for payment.');
      return;
    }
    if (!accountNumber.trim()) {
      setErrorMsg('Please provide your source account or phone number.');
      return;
    }

    // Trigger universal policy confirmation modal instead of browser alerts!
    setShowCancelPrompt(true);
  };

  const handleFinalizeBooking = async () => {
    setShowCancelPrompt(false);
    setLoading(true);
    setErrorMsg('');

    try {
      const addressParts = [
        unitNo.trim(),
        street.trim(),
        `Brgy. ${barangay.trim()}`,
        city.trim()
      ];
      if (postalCode.trim()) {
        addressParts.push(postalCode.trim());
      }
      const fullAddress = addressParts.join(', ');

      const bookingData: any = {
        customer_id: profile?.id || 'guest',
        customer_name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Customer',
        vendor_id: selectedService.vendorId,
        vendor_name: selectedService.vendorName,
        vendor_avatar: selectedService.vendorAvatar || null,
        service_type: selectedService.workType || selectedService.subServiceName,
        sub_service: selectedService.subServiceName,
        description: selectedService.description || null,
        scheduled_date: selectedService.scheduledDate,
        scheduled_time: selectedService.scheduledTime,
        price: selectedService.price,
        quantity: selectedService.quantity,
        total_price: finalAmount,
        address: fullAddress,
        service_address: fullAddress,
        unit_house_no: unitNo,
        postal_code: postalCode,
        payment_method: paymentMethod,
        payment_reference: referenceNumber,
        account_name: accountName.trim(),
        account_number: accountNumber.trim(),
        voucher_code: voucherCode || null,
        slot_id: selectedService.slotId || null
      };

      if (appliedDiscount > 0 && appliedVoucherId) {
        bookingData.original_price = selectedService.total;
        bookingData.discount_amount = appliedDiscount;
        bookingData.voucher_id = appliedVoucherId;
      }

      const res = await api.post('/api/bookings', bookingData);
      const createdBooking = {
        id: res.data?.id,
        ...bookingData
      };

      if (appliedVoucherId) {
        await api.patch(`/api/vouchers/${appliedVoucherId}/use`);
      }

      onSuccess([createdBooking]);
    } catch (err: any) {
      console.error('[CAVEMAN] Failed to submit booking:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to submit booking. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <BookingCancelPrompt
        open={showCancelPrompt}
        onClose={() => setShowCancelPrompt(false)}
        onConfirm={handleFinalizeBooking}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col z-10"
          onClick={(e) => e.stopPropagation()}
        >
          
          {/* Top Bar: Progress & Step Indicators */}
          <div className="bg-gradient-to-r from-brand-navy to-[#0a2d5c] text-white p-5 sm:p-6 pb-5 shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">Complete Service Booking</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step Wizard Pills */}
            <div className="flex items-center justify-between gap-2 max-w-md mx-auto">
              {[
                { num: 1, label: '1. Location', icon: MapPin },
                { num: 2, label: '2. Payment & Voucher', icon: CreditCard },
                { num: 3, label: '3. Verification', icon: FileText }
              ].map((s, idx) => {
                const isCurrent = step === s.num;
                const isDone = step > s.num;
                const IconComp = s.icon;
                return (
                  <React.Fragment key={s.num}>
                    <div className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl transition-all text-xs font-bold ${
                      isCurrent
                        ? 'bg-brand-green text-slate-950 shadow-md font-black'
                        : isDone
                        ? 'bg-white/20 text-white'
                        : 'bg-white/5 text-blue-200/60'
                    }`}>
                      {isDone ? <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" /> : <IconComp className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">{s.label}</span>
                      <span className="sm:hidden">Step {s.num}</span>
                    </div>
                    {idx < 2 && (
                      <div className={`h-0.5 flex-1 rounded-full ${isDone ? 'bg-brand-green' : 'bg-white/10'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Collapsible Appointment Summary Bar */}
          <div className="bg-slate-100 dark:bg-slate-800/80 px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-bold shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-slate-500 font-semibold truncate">Service:</span>
              <span className="text-slate-900 dark:text-white font-black truncate">{selectedService.workType || selectedService.subServiceName}</span>
              <span className="text-slate-400 font-semibold hidden sm:inline">•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold hidden sm:inline">{selectedService.vendorName}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-slate-500">Total:</span>
              <span className="text-sm font-black text-brand-green">
                ₱{finalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Form Error Banner */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mx-6 mt-4 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-2xl flex items-center gap-2.5 text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-bold shrink-0"
              >
                <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scrollable Form Body */}
          <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
            
            {/* Step 1: Smart Location & Address */}
            {step === 1 && (
              <form id="wizard-form" onSubmit={handleNextStep} className="space-y-6">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-brand-navy dark:text-blue-400" />
                    <span>Step 1: Where should our specialist arrive?</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                    Select your saved profile address or specify an alternate service location.
                  </p>
                </div>

                {/* Smart Saved Addresses Radio Cards */}
                {(savedAddresses.length > 0 || (profile && ((profile as any).city || (profile as any).barangay))) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {savedAddresses.length > 0 ? (
                      savedAddresses.map((addr, idx) => {
                        const addrId = addr.id || addr.uid || String(idx);
                        const isSelected = useProfileAddress && selectedAddressId === addrId;
                        const { unit: cardUnit, street: cardStreet } = getCleanAddressParts(addr, profile);
                        const cardDisplayLine = cardUnit ? `${cardUnit} ${cardStreet}` : cardStreet;
                        return (
                          <div
                            key={addrId}
                            onClick={() => {
                              setUseProfileAddress(true);
                              setSelectedAddressId(addrId);
                              setCity(addr.city || (profile as any).city || '');
                              setBarangay(addr.barangay || (profile as any).barangay || '');
                              setStreet(cardStreet);
                              setUnitNo(cardUnit);
                              setPostalCode(addr.postal_code || (profile as any).postal_code || '');
                              setErrorMsg('');
                            }}
                            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                              isSelected
                                ? 'border-brand-navy bg-brand-navy/5 dark:bg-brand-navy/20 shadow-md'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${
                              isSelected ? 'border-brand-navy bg-brand-navy text-white' : 'border-slate-300'
                            }`}>
                              {isSelected && <Check className="w-3 h-3" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <Home className="w-3.5 h-3.5 text-brand-navy dark:text-blue-400" />
                                <h4 className="text-xs font-black text-slate-900 dark:text-white">{addr.label || 'Saved Address'}</h4>
                                {addr.is_default && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-brand-green/10 text-brand-green uppercase">Default</span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium mt-1 leading-relaxed">
                                {`${cardDisplayLine}, Brgy. ${addr.barangay || (profile as any).barangay || ''}, ${addr.city || (profile as any).city || ''}`}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div
                        onClick={() => {
                          const { unit: profUnit, street: profStreet } = getCleanAddressParts({}, profile);
                          setUseProfileAddress(true);
                          setSelectedAddressId('profile-default');
                          setCity((profile as any).city || '');
                          setBarangay((profile as any).barangay || '');
                          setStreet(profStreet);
                          setUnitNo(profUnit);
                          setPostalCode((profile as any).postal_code || '');
                          setErrorMsg('');
                        }}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                          useProfileAddress
                            ? 'border-brand-navy bg-brand-navy/5 dark:bg-brand-navy/20 shadow-md'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${
                          useProfileAddress ? 'border-brand-navy bg-brand-navy text-white' : 'border-slate-300'
                        }`}>
                          {useProfileAddress && <Check className="w-3 h-3" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Home className="w-3.5 h-3.5 text-brand-navy dark:text-blue-400" />
                            <h4 className="text-xs font-black text-slate-900 dark:text-white">Saved Profile Address</h4>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium mt-1 leading-relaxed">
                            {(() => {
                              const { unit: profUnit, street: profStreet } = getCleanAddressParts({}, profile);
                              const profDisplayLine = profUnit ? `${profUnit} ${profStreet}` : profStreet;
                              return `${profDisplayLine}, Brgy. ${(profile as any).barangay || ''}, ${(profile as any).city || ''}`;
                            })()}
                          </p>
                        </div>
                      </div>
                    )}

                    <div
                      onClick={() => {
                        if (useProfileAddress) {
                          setUnitNo('');
                          setStreet('');
                          setBarangay('');
                          setCity('');
                          setPostalCode('');
                        }
                        setUseProfileAddress(false);
                        setSelectedAddressId('custom');
                        setErrorMsg('');
                      }}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                        !useProfileAddress
                          ? 'border-brand-navy bg-brand-navy/5 dark:bg-brand-navy/20 shadow-md'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${
                        !useProfileAddress ? 'border-brand-navy bg-brand-navy text-white' : 'border-slate-300'
                      }`}>
                        {!useProfileAddress && <Check className="w-3 h-3" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-brand-navy dark:text-blue-400" />
                          <h4 className="text-xs font-black text-slate-900 dark:text-white">Use Different Address</h4>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium mt-1">
                          Specify a custom unit, street, barangay, or municipality for this specific repair.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Manual Address Fields */}
                <div className={`space-y-4 pt-2 transition-all ${useProfileAddress ? 'opacity-70' : 'opacity-100'}`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                        Unit / House No. / Building *
                      </label>
                      <input
                        type="text"
                        required
                        value={unitNo}
                        onChange={(e) => { setUnitNo(e.target.value); setErrorMsg(''); }}
                        placeholder="e.g. Unit 4B / Block 3 Lot 12"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-navy"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        required
                        value={street}
                        onChange={(e) => { setStreet(e.target.value); setErrorMsg(''); }}
                        placeholder="e.g. Cadena de Amor St."
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-navy"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                        Barangay *
                      </label>
                      <input
                        type="text"
                        required
                        value={barangay}
                        onChange={(e) => { setBarangay(e.target.value); setErrorMsg(''); }}
                        placeholder="e.g. San Miguel"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-navy"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                        City / Municipality *
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => { setCity(e.target.value); setErrorMsg(''); }}
                        placeholder="e.g. City of Taguig"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-navy"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                        Postal Code / ZIP (Optional)
                      </label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="e.g. 1630"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-navy max-w-xs"
                      />
                    </div>
                  </div>
                </div>
              </form>
            )}

            {/* Step 2: Payment Gateway & Vouchers Combined */}
            {step === 2 && (
              <form id="wizard-form" onSubmit={handleNextStep} className="space-y-6">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-brand-navy dark:text-blue-400" />
                    <span>Step 2: Choose Payment & Apply Discounts</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                    Select an electronic wallet or gateway and copy the account number for your payment.
                  </p>
                </div>

                {/* Gateway Pill Selector */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {methods.map((m: any, idx: number) => {
                    const isSelected = paymentMethod === m.paymentMethod;
                    return (
                      <div
                        key={m.id || idx}
                        onClick={() => setPaymentMethod(m.paymentMethod)}
                        className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between gap-2 text-center ${
                          isSelected
                            ? 'border-brand-navy bg-brand-navy/10 dark:bg-brand-navy/30 text-brand-navy dark:text-white font-black shadow-md'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold hover:border-slate-300'
                        }`}
                      >
                        <span className="text-xs truncate">{m.paymentMethod}</span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-brand-navy bg-brand-navy text-white' : 'border-slate-300'
                        }`}>
                          {isSelected && <Check className="w-2.5 h-2.5" />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* QR Code & Account Display Card */}
                <div className="bg-gradient-to-br from-slate-900 to-[#0a2d5c] text-white p-6 rounded-2xl shadow-sm border border-white/10 space-y-5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2.5">
                      <QrCode className="w-5 h-5 text-brand-green" />
                      <span className="text-sm font-black uppercase tracking-wider">{paymentMethod} Gateway Details</span>
                    </div>
                    <span className="text-[10px] bg-white/10 px-2.5 py-1 rounded-full font-bold text-emerald-300">
                      Verified Account
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {currentMethodObj.qrImageUrl ? (
                      <div className="w-36 h-36 bg-white p-2 rounded-2xl shrink-0 shadow-lg flex items-center justify-center">
                        <img
                          src={currentMethodObj.qrImageUrl}
                          alt={`${paymentMethod} QR`}
                          className="w-full h-full object-contain rounded-xl"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-36 h-36 bg-white/10 border border-white/20 rounded-2xl shrink-0 flex flex-col items-center justify-center p-3 text-center">
                        <QrCode className="w-10 h-10 text-white/40 mb-1" />
                        <span className="text-[10px] text-white/60 font-semibold">Scan QR Not Available</span>
                      </div>
                    )}

                    <div className="space-y-3 min-w-0 flex-1 w-full">
                      <div>
                        <p className="text-[10px] font-bold text-blue-200/70 uppercase">Account Name</p>
                        <p className="text-base font-black text-white mt-0.5 truncate">
                          {currentMethodObj.accountName || 'ALLFIX.PH OFFICIAL'}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold text-blue-200/70 uppercase">Account / Phone Number</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xl font-black text-brand-green tracking-wide">
                            {currentMethodObj.accountNumber || '0917-000-0000'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyAccount(currentMethodObj.accountNumber)}
                            className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors flex items-center gap-1.5 text-xs font-bold shrink-0"
                            title="Copy Account Number"
                          >
                            {copied ? <Check className="w-3.5 h-3.5 text-brand-green" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copied ? 'Copied!' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Voucher Redemption Section */}
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-brand-navy dark:text-blue-400" />
                    <span>Apply Discount Voucher (Optional)</span>
                  </label>

                  <div className="relative">
                    <input
                      type="text"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                      placeholder="Enter promo code e.g. ALLFIX20"
                      className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-navy uppercase placeholder:normal-case placeholder:font-normal"
                    />
                    {voucherValidating && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-brand-navy border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>

                  {/* Inline Debounced Voucher Validation Badge */}
                  <AnimatePresence>
                    {voucherValidationMsg.message && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className={`p-3 rounded-xl flex items-center gap-2 text-xs font-bold ${
                          voucherValidationMsg.type === 'success'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'
                        }`}
                      >
                        {voucherValidationMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                        <span>{voucherValidationMsg.message}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Available Voucher Quick-Select Pills */}
                  {availableVouchers.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      <span className="text-[11px] font-bold text-slate-400">Available:</span>
                      {availableVouchers.map((v: any) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setVoucherCode(v.code)}
                          className="px-3 py-1.5 rounded-xl bg-brand-green/15 hover:bg-brand-green/25 text-brand-green border border-brand-green/30 text-xs font-extrabold transition-all flex items-center gap-1"
                        >
                          <Tag className="w-3 h-3" />
                          <span>{v.code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </form>
            )}

            {/* Step 3: Verification & Proof */}
            {step === 3 && (
              <form id="wizard-form" onSubmit={handlePreSubmitCheck} className="space-y-6">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-brand-navy dark:text-blue-400" />
                    <span>Step 3: Verification & Transaction Proof</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                    Enter your payment reference details below so our admin team can verify and dispatch your specialist.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold pb-3 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500">Selected Gateway:</span>
                    <span className="text-slate-900 dark:text-white font-black px-3 py-1 rounded-lg bg-white dark:bg-slate-900 shadow-xs border border-slate-200 dark:border-slate-800">
                      {paymentMethod}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Transaction Reference Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={referenceNumber}
                        onChange={(e) => { setReferenceNumber(e.target.value); setErrorMsg(''); }}
                        placeholder="e.g. 123456789012 or GCASH Ref #..."
                        className="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-navy"
                      />
                      <p className="text-[11px] text-slate-400 font-medium mt-1">
                        Found in your SMS notification or e-wallet receipt screen after transferring.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Sender Account Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={accountName}
                          onChange={(e) => { setAccountName(e.target.value); setErrorMsg(''); }}
                          placeholder="e.g. Juan Dela Cruz"
                          className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-navy"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Sender Account / Phone No. *
                        </label>
                        <input
                          type="text"
                          required
                          value={accountNumber}
                          onChange={(e) => { setAccountNumber(e.target.value); setErrorMsg(''); }}
                          placeholder="e.g. 0917 123 4567"
                          className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-navy"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Final Cost Summary */}
                <div className="p-5 bg-gradient-to-r from-slate-900 to-[#0a2d5c] text-white rounded-2xl shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-blue-200/80 uppercase">Amount Due Today</span>
                    {appliedDiscount > 0 && (
                      <p className="text-[11px] text-emerald-400 font-bold mt-0.5">
                        Includes ₱{appliedDiscount.toLocaleString('en-US', { minimumFractionDigits: 2 })} voucher discount!
                      </p>
                    )}
                  </div>
                  <span className="text-2xl font-black text-brand-green">
                    ₱{finalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </form>
            )}

          </div>

          {/* Bottom Navigation Buttons */}
          <div className="bg-slate-50 dark:bg-slate-800/80 p-5 sm:p-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => { setStep(step - 1); setErrorMsg(''); }}
                className="py-3 px-6 rounded-2xl font-bold text-xs border-slate-300 dark:border-slate-700 flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
            ) : (
              <div />
            )}

            <Button
              type="submit"
              form="wizard-form"
              variant="success"
              loading={loading}
              className="py-3 px-8 rounded-xl font-bold text-xs sm:text-sm shadow-sm flex items-center gap-2 transition-colors ml-auto"
            >
              <span>{step === 3 ? 'Confirm & Book Now' : 'Continue'}</span>
              {step < 3 && <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>

        </motion.div>
      </div>
    </>
  );
};
