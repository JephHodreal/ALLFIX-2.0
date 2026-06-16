import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, Building2, ChevronRight, ChevronLeft, Check, Upload, X, CreditCard, ArrowLeft, FileText, Shield, Wallet, Image as ImageIcon } from 'lucide-react';
import { registerUser } from '../services/firebaseService';
import { Button } from '../components/shared/Button';
import { ROUTES } from '../routes/paths';
import { VENDOR_SERVICES } from '../constants/services';
import { WORK_TYPES_MAPPING } from '../constants/servicesData';
import LampButton from '../components/shared/LampButton';
import api from '../services/apiService';

interface FormData {
  companyName: string; username: string; email: string; password: string; confirmPassword: string;
  phone: string; role: 'vendor';
  // Business Details
  city: string; cityCode: string;
  unitHouseNo: string; street: string; postalCode: string;
  bio: string;
  // Compliance
  termsAccepted: boolean;
  businessPermitUrl: string | null;
  birCertificateUrl: string | null;
  professionalLicenseUrl: string | null;
  proofOfInsuranceUrl: string | null;
  // Payout
  accountName: string;
  bankName: string;
  accountNumber: string;
  verificationCode: string;
}

interface SelectedService {
  service: string;
  sub_services: string[];
  work_types: Array<{
    name: string;
    subService: string;
    price: string;
    status: string;
  }>;
}

const initialFormData: FormData = {
  companyName: '', username: '', email: '', password: '', confirmPassword: '',
  phone: '', role: 'vendor' as const,
  city: '', cityCode: '',
  unitHouseNo: '', street: '', postalCode: '',
  bio: '',
  termsAccepted: false,
  businessPermitUrl: null,
  birCertificateUrl: null,
  professionalLicenseUrl: null,
  proofOfInsuranceUrl: null,
  accountName: '',
  bankName: '',
  accountNumber: '',
  verificationCode: '',
};

const LOCATION_API = import.meta.env.VITE_LOCATION_API || 'https://psgc.gitlab.io/api';
const steps = ['Basic Info', 'Business Details', 'Compliance', 'Payout Details', 'Terms and Conditions'];

export default function VendorRegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefillData = location.state?.prefillData;

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>({
    ...initialFormData,
    companyName: prefillData?.companyName || '',
    username: prefillData?.username || '',
    email: prefillData?.email || '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cities, setCities] = useState<Array<{ code: string; name: string }>>([]);
  const [barangays, setBarangays] = useState<Array<{ code: string; name: string }>>([]);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [usernameCheckLoading, setUsernameCheckLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [usernameValid, setUsernameValid] = useState(false);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [citiesDropdownOpen, setCitiesDropdownOpen] = useState(false);
  const citiesDropdownRef = useRef<HTMLDivElement>(null);
  const [activeTooltip, setActiveTooltip] = useState<{ show: boolean, x: number, y: number, text: string }>({ show: false, x: 0, y: 0, text: '' });
  const [servicesCatalog, setServicesCatalog] = useState<any[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  // Clear global error when step changes
  useEffect(() => {
    if (error) setError('');
  }, [step]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setServicesDropdownOpen(false);
      }
      if (citiesDropdownRef.current && !citiesDropdownRef.current.contains(event.target as Node)) {
        setCitiesDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // [CAVEMAN] Log mounting
  useEffect(() => {
    console.log("[CAVEMAN] Vendor Register page loaded! Initial state:", initialFormData);
  }, []);

  useEffect(() => {
    setLoadingCatalog(true);
    
    // First, define the fallback which has all 9 services
    const fallback = VENDOR_SERVICES.map(svc => ({
      name: svc.name,
      description: svc.description,
      sub: svc.sub.map(s => ({
        name: s.name,
        description: s.description,
        workTypes: WORK_TYPES_MAPPING[s.name] || []
      }))
    }));

    fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/services`)
      .then((r) => {
        if (!r.ok) throw new Error('API failed');
        return r.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const formattedBackend = data.map((svc: any) => ({
            name: svc.name,
            description: svc.description || '',
            sub: (svc.subServices || []).map((sub: any) => ({
              name: sub.name || sub,
              description: sub.description || '',
              workTypes: sub.workTypes || []
            }))
          }));
          
          // Merge: use backend data for any services that exist there, else use fallback
          const merged = fallback.map(fb => {
             const found = formattedBackend.find(f => f.name.toLowerCase() === fb.name.toLowerCase());
             return found || fb;
          });
          
          // Add any extras from backend that weren't in fallback (just in case)
          formattedBackend.forEach(f => {
             if (!merged.find(m => m.name.toLowerCase() === f.name.toLowerCase())) {
                merged.push(f);
             }
          });

          setServicesCatalog(merged);
          console.log("[CAVEMAN] Successfully merged database services with fallback. Found " + merged.length + " services.");
        } else {
          setServicesCatalog(fallback);
        }
      })
      .catch(() => {
        console.log("[CAVEMAN] Failed to load database services. Loading fallback services catalog.");
        setServicesCatalog(fallback);
      })
      .finally(() => setLoadingCatalog(false));
  }, []);

  const handleMouseMove = (e: React.MouseEvent, text: string) => {
    setActiveTooltip({ show: true, x: e.clientX, y: e.clientY, text });
  };
  const hideTooltip = () => setActiveTooltip({ ...activeTooltip, show: false });

  const toggleService = (serviceName: string) => {
    console.log("[CAVEMAN] Toggle service:", serviceName);
    const exists = selectedServices.find(s => s.service === serviceName);
    if (exists) {
      setSelectedServices(selectedServices.filter(s => s.service !== serviceName));
      setExpandedService(null);
    } else {
      setSelectedServices([...selectedServices, { service: serviceName, sub_services: [], work_types: [] }]);
      setExpandedService(serviceName);
    }
  };

  const toggleSubService = (serviceName: string, subServiceName: string) => {
    console.log("[CAVEMAN] Toggle subservice:", serviceName, "->", subServiceName);
    setSelectedServices(selectedServices.map(s => {
      if (s.service === serviceName) {
        const hasSub = s.sub_services.includes(subServiceName);
        const newSubs = hasSub
          ? s.sub_services.filter(sub => sub !== subServiceName)
          : [...s.sub_services, subServiceName];

        const currentWts = s.work_types || [];
        const newWts = hasSub
          ? currentWts.filter((wt: any) => wt.subService !== subServiceName)
          : currentWts;

        return {
          ...s,
          sub_services: newSubs,
          work_types: newWts
        };
      }
      return s;
    }));
  };

  const update = (key: keyof FormData, value: string | boolean) => {
    if (error) setError('');
    if (key === 'companyName') {
      console.log("[CAVEMAN] Company name changed:", value);
    }
    // Strip spaces from specific fields
    let processedValue = value;
    if (typeof value === 'string' && ['username', 'email', 'password', 'confirmPassword', 'phone'].includes(key)) {
      processedValue = value.replace(/\s/g, '');
    }
    // Auto-capitalize first letter for firstName and lastName
    if (typeof value === 'string' && ['firstName', 'lastName'].includes(key) && value.length > 0) {
      processedValue = value.charAt(0).toUpperCase() + value.slice(1);
    }
    setForm((prev) => ({ ...prev, [key]: processedValue }));
    if (key === 'username') {
      setUsernameError('');
      setUsernameValid(false);
    }
  };

  const checkUsername = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameError('Min 3 chars');
      return;
    }
    setUsernameCheckLoading(true);
    console.log("[CAVEMAN] Verifying username availability for:", username);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/auth/check-username?username=${encodeURIComponent(username)}`);
      
      // If endpoint is protected or unavailable, skip the check and let registration handle it
      if (!res.ok) {
        setUsernameValid(true);
        setUsernameError('');
        return;
      }

      const data = await res.json();
      if (data.available) {
        setUsernameValid(true);
        setUsernameError('');
      } else {
        setUsernameError('Username taken');
        setUsernameValid(false);
      }
    } catch {
      // Network error — don't block the user
      setUsernameValid(true);
      setUsernameError('');
    } finally {
      setUsernameCheckLoading(false);
    }
  };

  // Check username if prepopulated
  useEffect(() => {
    if (prefillData?.username) {
      checkUsername(prefillData.username);
    }
  }, []);

  // Fetch NCR cities on component mount
  useEffect(() => {
    setCitiesLoading(true);
    fetch(`${LOCATION_API}/regions/130000000/cities-municipalities/`)
      .then((r) => r.json())
      .then((data) => {
        setCities(data.sort((a: any, b: any) => a.name.localeCompare(b.name)));
        setCitiesLoading(false);
      })
      .catch(() => setCitiesLoading(false));
  }, []);

  // Barangays removed per requirements

  const passwordStrength = useCallback((pw: string) => {
    let s = 0;
    if (pw.length >= 8) s++; if (/[A-Z]/.test(pw)) s++; if (/[0-9]/.test(pw)) s++; if (/[^A-Za-z0-9]/.test(pw)) s++;
    console.log("[CAVEMAN] Checked password strength. Score:", s);
    return s;
  }, []);

  const isPhoneValid = (phone: string) => {
    return /^\d{11}$/.test(phone.replace(/\D/g, ''));
  };

  const renderUploadedFile = (url: string, title: string, fieldName: keyof FormData) => {
    const isPdf = url.toLowerCase().endsWith('.pdf');
    return (
      <div 
        className="relative w-full h-full rounded-lg overflow-hidden flex flex-col bg-slate-50 dark:bg-slate-800/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 group/file shadow-sm"
        onClick={() => window.open(url, '_blank')}
        title={`Click to view ${title}`}
      >
        <div className="flex-1 flex items-center justify-center w-full p-2 overflow-hidden relative">
          {isPdf ? (
            <FileText className="w-10 h-10 text-blue-500 group-hover/file:scale-110 transition-transform" />
          ) : (
            <img src={url} alt={title} className="max-h-full max-w-full object-contain rounded-md drop-shadow-sm group-hover/file:scale-[1.02] transition-transform" />
          )}
          <div className="absolute inset-0 bg-black/0 group-hover/file:bg-black/5 transition-colors" />
        </div>
        <div className="w-full bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-1.5 px-2 flex items-center gap-1.5 z-10 shrink-0">
          {isPdf ? <FileText className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" /> : <ImageIcon className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />}
          <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 truncate">{title} {isPdf ? '(PDF)' : '(Image)'}</span>
        </div>
        <button 
          type="button" 
          onClick={(e) => { e.stopPropagation(); update(fieldName, ''); }} 
          className="absolute top-1.5 right-1.5 p-1 bg-black/40 hover:bg-black text-white rounded-full transition-colors z-20 backdrop-blur-sm"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  };


  const [uploadingPermit, setUploadingPermit] = useState(false);
  const [uploadingBIR, setUploadingBIR] = useState(false);
  const [uploadingLicense, setUploadingLicense] = useState(false);
  const [uploadingInsurance, setUploadingInsurance] = useState(false);

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>, type: 'permit' | 'bir' | 'license' | 'insurance') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'permit') setUploadingPermit(true);
    else if (type === 'bir') setUploadingBIR(true);
    else if (type === 'license') setUploadingLicense(true);
    else if (type === 'insurance') setUploadingInsurance(true);
    
    setError('');

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        console.log(`[CAVEMAN] VendorRegisterPage: Uploading ${type} document...`);
        const res = await api.post('/api/upload/image', {
          image: base64Data,
          folder: 'vendors/documents'
        });
        if (type === 'permit') update('businessPermitUrl', res.data.url);
        else if (type === 'bir') update('birCertificateUrl', res.data.url);
        else if (type === 'license') update('professionalLicenseUrl', res.data.url);
        else if (type === 'insurance') update('proofOfInsuranceUrl', res.data.url);
      } catch (err: any) {
        console.error(`[CAVEMAN] VendorRegisterPage: Upload failed for ${type}`, err);
        setError(`Failed to upload document. Please try again.`);
      } finally {
        if (type === 'permit') setUploadingPermit(false);
        else if (type === 'bir') setUploadingBIR(false);
        else if (type === 'license') setUploadingLicense(false);
        else if (type === 'insurance') setUploadingInsurance(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const canNext = () => {
    let ok = false;
    if (step === 0) {
      ok = !!(form.companyName && form.username && usernameValid && form.email && 
             form.password && form.password === form.confirmPassword && form.password.length >= 8 &&
             form.phone && form.phone.length === 11);
    } else if (step === 1) {
      ok = !!(form.cityCode && form.street && selectedServices.length > 0 && form.bio);
    } else if (step === 2) {
      // Compliance
      ok = !!(form.businessPermitUrl && form.birCertificateUrl && form.professionalLicenseUrl);
    } else if (step === 3) {
      // Payout
      ok = !!(form.accountName && form.bankName && form.accountNumber);
    } else if (step === 4) {
      // Terms
      ok = form.termsAccepted;
    } else if (step === 5) {
      // Verification
      ok = form.verificationCode.length === 6;
    }
    console.log("[CAVEMAN] Checking step validity. Step:", step, "canNext:", ok);
    return ok;
  };

  const handleContinueToVerification = async () => {
    setLoading(true);
    setError('');
    try {
      const { registerUser, getCurrentUser, sendOtp } = await import('../services/firebaseService');
      let user = getCurrentUser();
      if (!user || user.email !== form.email) {
         user = await registerUser(form.email, form.password);
      }
      
      await sendOtp();
      setStep(5);
    } catch (err: any) {
      const firebaseCode: string | undefined = err?.code;
      if (firebaseCode === 'auth/email-already-in-use') {
        setError('Email already registered.');
      } else if (firebaseCode === 'auth/invalid-email') {
        setError('Invalid email.');
      } else if (firebaseCode === 'auth/weak-password') {
        setError('Password too weak.');
      } else {
        setError(err.response?.data?.message || err.message || 'Registration failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    console.log("[CAVEMAN] handleSubmit vendor registration triggered!");
    setError(''); setLoading(true);
    try {
      const { verifyOtp, getCurrentUser } = await import('../services/firebaseService');
      await verifyOtp(form.verificationCode);
      
      const user = getCurrentUser();
      await user?.reload();
      
      // Prepare services payload
      const servicesPayload = selectedServices.map(s => ({
        service: s.service,
        sub_services: s.sub_services,
        work_types: s.work_types || []
      }));
      
      const firstServiceName = servicesPayload.length > 0 ? servicesPayload[0].service : '';

      // Save profile directly to database
      const profile: any = {
        uid: user?.uid,
        email: form.email,
        username: form.username,
        role: 'vendor',
        first_name: form.companyName,
        last_name: '',
        phone: form.phone,
        unit_house_no: '',
        street: form.street,
        city: form.city,
        region: 'National Capital Region',
        postal_code: form.postalCode,
        bio: form.bio,
        company_name: form.companyName,
        services: servicesPayload,
        service_type: firstServiceName,
        business_permit_url: form.businessPermitUrl || '',
        bir_certificate_url: form.birCertificateUrl || '',
        professional_license_url: form.professionalLicenseUrl || '',
        proof_of_insurance_url: form.proofOfInsuranceUrl || '',
        account_name: form.accountName || '',
        bank_name: form.bankName || '',
        account_number: form.accountNumber || ''
      };

      console.log("[CAVEMAN] Submitting Vendor registration profile:", profile);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save profile');
      }

      await user?.getIdToken(true);

      console.log("[CAVEMAN] Registration successful. Redirecting to home.");
      navigate(ROUTES.home || '/');
    } catch (err: any) {
      console.log("[CAVEMAN] Registration error:", err.message);
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const strength = passwordStrength(form.password);
  const strengthColors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-brand-green'];
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="min-h-screen flex bg-surface-light dark:bg-surface-dark">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-2/5 bg-brand-gradient items-center justify-center p-12 relative overflow-hidden">
        <button 
          onClick={() => navigate('/vendor-apply')} 
          className="absolute top-8 left-8 text-white/80 hover:text-white flex items-center gap-2 transition-colors z-20"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold text-sm">Back</span>
        </button>
        <div className="absolute top-10 left-10 w-72 h-72 bg-brand-green/10 rounded-full blur-3xl" />
        <div className="text-center relative z-10">
          <img src="/ALLFIXLOGO.png" alt="AllFix Logo" className="w-20 h-20 object-contain mx-auto mb-8" />
          <h2 className="text-3xl font-bold text-white mb-4">Partner with AllFix</h2>
          <p className="text-white/70 max-w-sm">Join AllFix.ph as a Vendor Partner and scale your service business today.</p>
          {/* Step indicator */}
          <div className="mt-12 flex items-center justify-center gap-4">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i <= step ? 'bg-brand-green text-white' : 'bg-white/20 text-white/50'}`}>
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                {i < steps.length - 1 && <div className={`w-12 h-0.5 ${i < step ? 'bg-brand-green' : 'bg-white/20'}`} />}
              </div>
            ))}
          </div>
          <p className="text-white/50 text-sm mt-3">Step {step + 1}: {steps[step]}</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <div className="w-full max-w-lg animate-fade-in relative">
          <div className="absolute -top-2 right-0">
            <LampButton />
          </div>
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <img src="/ALLFIXLOGO.png" alt="AllFix Logo" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold text-brand-navy dark:text-white">AllFix<span className="text-brand-green">.ph</span></span>
          </div>
          {/* Mobile step indicator */}
          <div className="lg:hidden flex items-center gap-2 mb-6">
            {steps.map((s, i) => (
              <div key={s} className={`flex-1 h-1.5 rounded-full transition-all ${i <= step ? 'bg-brand-navy dark:bg-brand-green' : 'bg-slate-200 dark:bg-slate-700'}`} />
            ))}
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-0.5 mt-4 lg:mt-0">
            {step === 0 ? 'Basic Information' : step === 1 ? 'Business Location' : step === 2 ? 'Company Details' : step === 3 ? 'Payout & Banking Details' : step === 4 ? 'Terms & Conditions' : 'Account Verification'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">Step {step + 1} of {steps.length}</p>

          {error && <div className="mb-3 p-3 rounded-xl bg-brand-red/10 border border-brand-red/20 text-brand-red text-sm">{error}</div>}

          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              {step === 0 && (
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-0.5">Business / Trade Name</label>
                    <div className="relative"><Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input value={form.companyName} onChange={(e) => update('companyName', e.target.value.slice(0, 45))} maxLength={45} className="input-base !py-2 pl-10" placeholder="e.g. FixIt Quick Plumbing" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-0.5">Username</label>
                    <div className="relative flex gap-2">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input value={form.username} onChange={(e) => update('username', e.target.value.slice(0, 30))} maxLength={30} onBlur={() => form.username && checkUsername(form.username)} className="input-base !py-2 pl-10 flex-1" placeholder="username" required />
                      {usernameCheckLoading && <div className="text-[10px] text-slate-400 flex items-center">Checking...</div>}
                    </div>
                    {usernameError && <p className="text-[10px] text-brand-red mt-0.5">{usernameError}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-0.5">Primary Contact Email</label>
                    <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="email" value={form.email} onChange={(e) => update('email', e.target.value.slice(0, 35))} maxLength={35} className="input-base !py-2 pl-10" placeholder="you@example.com" required /></div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-0.5">Phone Number</label>
                    <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input value={form.phone} onChange={(e) => update('phone', e.target.value.replace(/\D/g, '').slice(0, 11))} className="input-base !py-2 pl-10" placeholder="09XX XXX XXXX" required /></div>
                    {form.phone && form.phone.length !== 11 && <p className="text-[10px] text-brand-red mt-0.5">Phone must be exactly 11 digits</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-0.5">Password</label>
                    <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => update('password', e.target.value.slice(0, 20))} className="input-base !py-2 pl-10 pr-10" placeholder="Min 8 characters" required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button></div>
                    {form.password && (
                      <div className="mt-1">
                        <div className="flex gap-1">{[0,1,2,3].map(i => <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < strength ? strengthColors[strength-1] : 'bg-slate-200 dark:bg-slate-700'}`} />)}</div>
                        <p className="text-[10px] mt-0.5 text-slate-500">{strengthLabels[strength-1] || 'Too weak'}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-0.5">Confirm Password</label>
                    <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value.slice(0, 20))} className="input-base !py-2 pl-10" placeholder="Re-enter password" required /></div>
                    {form.confirmPassword && form.password !== form.confirmPassword && <p className="text-[10px] text-brand-red mt-0.5">Passwords don't match</p>}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-2">
                  <div className="relative" ref={dropdownRef}>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Services You Offer <span className="text-slate-400 text-[10px] font-normal">(Select all that apply)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                      className="w-full flex items-center justify-between input-base !py-2 bg-white dark:bg-slate-900/50"
                    >
                      <span className={selectedServices.length ? "text-slate-900 dark:text-white font-medium" : "text-slate-400"}>
                        {selectedServices.length > 0 ? `${selectedServices.length} service(s) selected` : 'Select your services...'}
                      </span>
                      <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${servicesDropdownOpen ? 'rotate-90' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {servicesDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-50 top-full left-0 right-0 mt-1 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-2xl"
                        >
                          <div className="p-1 space-y-1 max-h-[180px] overflow-y-auto">
                            {loadingCatalog ? (
                              <p className="text-sm text-slate-400 p-2 animate-pulse">Loading service catalog...</p>
                            ) : servicesCatalog.length === 0 ? (
                              <p className="text-sm text-slate-400 p-2">No services available.</p>
                            ) : (
                              servicesCatalog.map((svc) => {
                                const isSvcSelected = selectedServices.some(s => s.service === svc.name);
                                const isExpanded = expandedService === svc.name;
                                
                                return (
                                  <div key={svc.name} className="border border-slate-100 dark:border-slate-700 rounded-lg overflow-hidden">
                                    <button
                                      type="button"
                                      onClick={() => toggleService(svc.name)}
                                      className={`w-full flex items-center justify-between p-2 text-left transition-colors ${
                                        isSvcSelected 
                                          ? 'bg-brand-green/10 dark:bg-brand-green/5 text-slate-900 dark:text-white' 
                                          : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                          isSvcSelected 
                                            ? 'border-brand-green bg-brand-green text-white' 
                                            : 'border-slate-300 dark:border-slate-600 bg-transparent'
                                        }`}>
                                          {isSvcSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                        </div>
                                        <div>
                                          <span className="font-semibold text-xs">{svc.name}</span>
                                        </div>
                                      </div>
                                      <span className="text-[10px] text-slate-400 font-medium">
                                        {isExpanded ? 'Collapse' : 'Expand'}
                                      </span>
                                    </button>

                                    <AnimatePresence>
                                      {isSvcSelected && isExpanded && svc.sub && svc.sub.length > 0 && (
                                        <motion.div
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{ height: 'auto', opacity: 1 }}
                                          exit={{ height: 0, opacity: 0 }}
                                          className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 p-2 pl-6 space-y-1"
                                        >
                                          <p className="text-[10px] font-medium text-slate-400 mb-1">Select sub-services:</p>
                                          {svc.sub.map((sub: any) => {
                                            const subSvcSelected = selectedServices.find(s => s.service === svc.name)?.sub_services.includes(sub.name);
                                            return (
                                              <div 
                                                key={sub.name} 
                                                className="py-0.5 group border-b border-slate-200/50 dark:border-slate-700 last:border-0"
                                              >
                                                <label className="flex items-start gap-2 cursor-pointer">
                                                  <input
                                                    type="checkbox"
                                                    checked={!!subSvcSelected}
                                                    onChange={() => toggleSubService(svc.name, sub.name)}
                                                    className="mt-0.5 w-3 h-3 rounded border-slate-300 text-brand-green focus:ring-brand-green bg-transparent"
                                                  />
                                                  <div
                                                    onMouseEnter={(e) => sub.description && handleMouseMove(e, sub.description)}
                                                    onMouseLeave={hideTooltip}
                                                  >
                                                    <span className="text-[11px] text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                                      {sub.name}
                                                    </span>
                                                  </div>
                                                </label>
                                                
                                                {subSvcSelected && sub.workTypes && sub.workTypes.length > 0 && (
                                                  <div 
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="mt-1 ml-5 pl-1.5 pr-1.5 py-1 bg-slate-100/80 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700"
                                                  >
                                                    <div className="flex flex-wrap gap-1">
                                                      {sub.workTypes.map((wt: string) => (
                                                        <span 
                                                          key={wt} 
                                                          className="inline-flex items-center px-1 py-0.5 rounded text-[9px] font-medium bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 transition-colors"
                                                        >
                                                          {wt}
                                                        </span>
                                                      ))}
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <p className="text-[10px] text-slate-400 mb-0.5"><MapPin className="w-2.5 h-2.5 inline mr-1" />Region: National Capital Region (NCR) — auto-filled</p>
                  <div className="relative" ref={citiesDropdownRef}>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cities / Municipalities (Service Areas)</label>
                    <button
                      type="button"
                      onClick={() => setCitiesDropdownOpen(!citiesDropdownOpen)}
                      className="w-full flex items-center justify-between input-base !py-2 bg-white dark:bg-slate-900/50"
                    >
                      <span className={form.city ? "text-slate-900 dark:text-white font-medium" : "text-slate-400"}>
                        {form.city ? `${form.city.split(', ').length} coverage area(s) selected` : 'Select Coverage Area of your service...'}
                      </span>
                      <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${citiesDropdownOpen ? 'rotate-90' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {citiesDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-[60] top-full left-0 right-0 mt-1 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-2xl"
                        >
                          <div className="max-h-40 overflow-y-auto p-1">
                            {citiesLoading ? (
                              <p className="text-sm p-2 text-slate-500">Loading cities...</p>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                                {cities.map(c => {
                                  const selectedCities = form.city ? form.city.split(', ') : [];
                                  const isSelected = selectedCities.includes(c.name);
                                  return (
                                    <label key={c.code} className="flex items-center gap-2 p-1 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded transition-colors">
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={(e) => {
                                          let updated = [...selectedCities];
                                          if (e.target.checked) {
                                            updated.push(c.name);
                                          } else {
                                            updated = updated.filter(city => city !== c.name);
                                          }
                                          update('city', updated.join(', '));
                                          update('cityCode', updated.length > 0 ? 'selected' : '');
                                        }}
                                        className="w-3.5 h-3.5 rounded border-slate-300 text-brand-navy focus:ring-brand-navy"
                                      />
                                      <span className="text-xs text-slate-700 dark:text-slate-300">{c.name}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Business Full Address</label>
                    <input 
                      value={form.street} 
                      onChange={(e) => update('street', e.target.value)} 
                      className="input-base !py-2" 
                      placeholder="e.g. Unit 5B, Rizal Ave, Brgy. San Jose" 
                      required 
                    />
                  </div>
                  <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Postal Code</label>
                    <input value={form.postalCode} onChange={(e) => update('postalCode', e.target.value)} className="input-base !py-2" placeholder="e.g. 1000" /></div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bio / Description</label>
                    <textarea 
                      value={form.bio} 
                      onChange={(e) => update('bio', e.target.value.slice(0, 100))} 
                      className="input-base min-h-[50px] !py-2 resize-none" 
                      placeholder="Short introduction about your service" 
                      required 
                    />
                    <p className="text-xs text-slate-400 text-right mt-1">{form.bio.length}/100</p>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Business Permit
                      </label>
                      <div className="flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer relative group h-28">
                        {uploadingPermit ? (
                          <div className="text-xs text-slate-500 font-bold animate-pulse">Uploading...</div>
                        ) : form.businessPermitUrl ? (
                          renderUploadedFile(form.businessPermitUrl, "Business Permit", "businessPermitUrl")
                        ) : (
                          <>
                            <Upload className="w-5 h-5 text-slate-400 mb-1" />
                            <span className="text-[11px] font-semibold text-slate-650 dark:text-slate-400 text-center">Upload Business Permit</span>
                            <span className="text-[9px] text-slate-400 mt-0.5">PDF, JPG</span>
                          </>
                        )}
                        {!form.businessPermitUrl && !uploadingPermit && (
                          <input type="file" accept=".pdf, .jpg, .jpeg" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleUploadFile(e, 'permit')} />
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        BIR Certificate
                      </label>
                      <div className="flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer relative group h-28">
                        {uploadingBIR ? (
                          <div className="text-xs text-slate-500 font-bold animate-pulse">Uploading...</div>
                        ) : form.birCertificateUrl ? (
                          renderUploadedFile(form.birCertificateUrl, "BIR Certificate", "birCertificateUrl")
                        ) : (
                          <>
                            <Upload className="w-5 h-5 text-slate-400 mb-1" />
                            <span className="text-[11px] font-semibold text-slate-650 dark:text-slate-400 text-center">Upload BIR Certificate</span>
                            <span className="text-[9px] text-slate-400 mt-0.5">PDF, JPG</span>
                          </>
                        )}
                        {!form.birCertificateUrl && !uploadingBIR && (
                          <input type="file" accept=".pdf, .jpg, .jpeg" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleUploadFile(e, 'bir')} />
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        DTI Number
                      </label>
                      <div className="flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer relative group h-28">
                        {uploadingLicense ? (
                          <div className="text-xs text-slate-500 font-bold animate-pulse">Uploading...</div>
                        ) : form.professionalLicenseUrl ? (
                          renderUploadedFile(form.professionalLicenseUrl, "DTI Number", "professionalLicenseUrl")
                        ) : (
                          <>
                            <Upload className="w-5 h-5 text-slate-400 mb-1" />
                            <span className="text-[11px] font-semibold text-slate-650 dark:text-slate-400 text-center">Upload DTI Number</span>
                            <span className="text-[9px] text-slate-400 mt-0.5">PDF, JPG</span>
                          </>
                        )}
                        {!form.professionalLicenseUrl && !uploadingLicense && (
                          <input type="file" accept=".pdf, .jpg, .jpeg" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleUploadFile(e, 'license')} />
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Proof of Insurance
                      </label>
                      <div className="flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer relative group h-28">
                        {uploadingInsurance ? (
                          <div className="text-xs text-slate-500 font-bold animate-pulse">Uploading...</div>
                        ) : form.proofOfInsuranceUrl ? (
                          renderUploadedFile(form.proofOfInsuranceUrl, "Proof of Insurance", "proofOfInsuranceUrl")
                        ) : (
                          <>
                            <Upload className="w-5 h-5 text-slate-400 mb-1" />
                            <span className="text-[11px] font-semibold text-slate-650 dark:text-slate-400 text-center">Upload Proof of Insurance (Optional)</span>
                            <span className="text-[9px] text-slate-400 mt-0.5">PDF, JPG</span>
                          </>
                        )}
                        {!form.proofOfInsuranceUrl && !uploadingInsurance && (
                          <input type="file" accept=".pdf, .jpg, .jpeg" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleUploadFile(e, 'insurance')} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Bank Name / eWallet
                      </label>
                      <div className="relative">
                        <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                          value={form.bankName}
                          onChange={(e) => {
                            update('bankName', e.target.value);
                            update('accountNumber', ''); // reset number on change
                          }}
                          className="input-base pl-10 text-sm appearance-none"
                          required
                        >
                          <option value="" disabled>Select Bank / eWallet</option>
                          <optgroup label="eWallets">
                            <option value="GCash">GCash</option>
                            <option value="Maya">Maya</option>
                          </optgroup>
                          <optgroup label="Banks">
                            <option value="BDO">BDO</option>
                            <option value="BPI">BPI</option>
                            <option value="Metrobank">Metrobank</option>
                            <option value="UnionBank">UnionBank</option>
                            <option value="Security Bank">Security Bank</option>
                            <option value="PNB">PNB</option>
                          </optgroup>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Account Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={form.accountName}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^A-Za-z\s-]/g, '').slice(0, 40);
                            update('accountName', val);
                          }}
                          className="input-base pl-10 text-sm"
                          placeholder="e.g. Juan Dela Cruz"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Account Number
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={form.accountNumber}
                          onChange={(e) => {
                            const isEwallet = ['GCash', 'Maya'].includes(form.bankName);
                            const maxLen = isEwallet ? 11 : 16;
                            const val = e.target.value.replace(/\D/g, '').slice(0, maxLen);
                            update('accountNumber', val);
                          }}
                          className="input-base pl-10 text-sm"
                          placeholder={['GCash', 'Maya'].includes(form.bankName) ? "11 digit number" : "Up to 16 digit number"}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 h-[400px] overflow-y-auto">
                    <h3 className="font-bold text-slate-800 dark:text-white mt-2 mb-2">1. Introduction & Account Registration</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2"><strong>The Relationship:</strong> allfix is an on-demand service marketplace platform connecting independent service providers ("Vendors") with customers. This agreement does not create an employer-employee relationship.</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2"><strong>Eligibility:</strong> Vendors must be at least 18 years old, legally allowed to work in the Philippines, and possess all necessary local government permits (e.g., DTI/SEC, BIR, Barangay Clearance, or professional licenses) required for their specific trade.</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2"><strong>Accuracy of Information:</strong> The Vendor agrees to provide true, accurate, and updated documents during the step-by-step registration. Falsifying documents will result in an immediate and permanent ban.</p>

                    <h3 className="font-bold text-slate-800 dark:text-white mt-6 mb-2">2. Platform Fees, Payments, and Payouts</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2"><strong>Platform Commission:</strong> allfix charges a platform commission fee of 15% on the total booking amount for every successfully completed service.</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2"><strong>Payment Processing:</strong> All customer payments are processed securely through allfix’s designated payment gateway partner. Vendors must not solicit direct cash/bank transfers from customers outside the platform to bypass platform fees.</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2"><strong>Payout Schedule:</strong> Earnings (minus the platform commission) will be transferred to the Vendor’s registered bank account or e-wallet every Friday.</p>

                    <h3 className="font-bold text-slate-800 dark:text-white mt-6 mb-2">3. Vendor Service Standards & Conduct</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2"><strong>Quality of Work:</strong> Vendors agree to perform services professionally, safely, and up to standard.</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2"><strong>Pricing Transparency:</strong> Vendors must honor the pricing guidelines or quotes agreed upon through the allfix app. Unauthorized price overcharging upon arrival at the customer's location is strictly prohibited.</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2"><strong>Cancellations:</strong> If a Vendor accepts a booking and cancels without a valid emergency within 2 hours of the scheduled job, they may face a cancellation penalty of ₱100 deducted from their next payout.</p>

                    <h3 className="font-bold text-slate-800 dark:text-white mt-6 mb-2">4. Liability and Customer Property Damage</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2"><strong>Vendor Liability:</strong> The Vendor operates as an independent contractor. The Vendor is fully liable for any damages to the customer’s property, theft, or bodily injury caused during the performance of the service.</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2"><strong>Platform Indemnification:</strong> allfix acts solely as an intermediary matching platform and is not responsible or legally liable for any disputes, damages, or losses resulting from a job.</p>

                    <h3 className="font-bold text-slate-800 dark:text-white mt-6 mb-2">5. Data Privacy Compliance (RA 10173)</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2"><strong>Customer Data:</strong> Vendors will receive customer data (Name, Phone Number, Address) strictly to complete the service. Vendors are legally prohibited under the Data Privacy Act of 2012 from saving, sharing, or using this data for marketing or private contact after the job is closed.</p>

                    <h3 className="font-bold text-slate-800 dark:text-white mt-6 mb-2">6. Termination of Account</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">allfix reserves the right to suspend or permanently terminate a Vendor’s account at any time without prior notice for violations including, but not limited to:</p>
                    <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-400 mb-2 space-y-1">
                      <li>Low customer ratings (consistently below 3.5 stars).</li>
                      <li>Verbal, physical, or sexual harassment of customers.</li>
                      <li>Attempting to transact with allfix clients outside the app (side-stepping).</li>
                    </ul>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <input 
                      type="checkbox" 
                      checked={form.termsAccepted} 
                      onChange={(e) => update('termsAccepted', e.target.checked)} 
                      className="mt-1 flex-shrink-0 w-5 h-5 text-brand-green rounded border-slate-300 focus:ring-brand-green" 
                    />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      I have read, understood, and agree to the Terms & Conditions and Data Privacy Act.
                    </span>
                  </label>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-lg text-sm mb-4">
                    We've sent a 6-digit verification code to <strong>{form.email}</strong>. Please enter it below.
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Verification Code</label>
                    <input 
                      value={form.verificationCode} 
                      onChange={(e) => update('verificationCode', e.target.value.replace(/\D/g, '').slice(0, 6))} 
                      className="input-base text-center tracking-widest text-2xl font-bold font-mono" 
                      placeholder="000000" 
                      required 
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            {step > 0 ? (
              <Button variant="ghost" onClick={() => setStep(s => s - 1)} icon={<ChevronLeft className="w-4 h-4" />}>Back</Button>
            ) : <div />}
            {step < 4 && (
              <Button onClick={() => setStep(s => s + 1)} disabled={!canNext()} icon={<ChevronRight className="w-4 h-4" />}>Continue</Button>
            )}
            {step === 4 && (
              <Button onClick={handleContinueToVerification} loading={loading} disabled={!canNext()} icon={<ChevronRight className="w-4 h-4" />} variant="success">Accept & Verify Account</Button>
            )}
            {step === 5 && (
              <Button onClick={handleSubmit} loading={loading} disabled={!canNext()} variant="success">Verify & Create</Button>
            )}
          </div>

          {step === 0 && (
            <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
              Already have an account? <Link to={ROUTES.login} className="text-brand-navy dark:text-brand-green font-semibold hover:underline">Sign in</Link>
            </p>
          )}
        </div>
      </div>

      {/* Global dynamically positioned tooltip */}
      {activeTooltip.show && (
        <div 
          className="fixed bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs rounded p-2 w-56 max-w-xs break-words shadow-xl z-[9999] pointer-events-none"
          style={{
            left: activeTooltip.x + 15 + 224 > window.innerWidth ? activeTooltip.x - 240 : activeTooltip.x + 15,
            top: activeTooltip.y + 15 + 80 > window.innerHeight ? activeTooltip.y - 80 : activeTooltip.y + 15
          }}
        >
          {activeTooltip.text}
        </div>
      )}
    </div>
  );
}
