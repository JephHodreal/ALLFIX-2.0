import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, Building2, ChevronRight, ChevronLeft, Check, Upload, X, CreditCard, ArrowLeft } from 'lucide-react';
import { registerUser } from '../services/firebaseService';
import { Button } from '../components/shared/Button';
import { ROUTES } from '../routes/paths';
import { VENDOR_SERVICES } from '../constants/services';
import { WORK_TYPES_MAPPING } from '../constants/servicesData';
import LampButton from '../components/shared/LampButton';
import api from '../services/apiService';

interface FormData {
  firstName: string; lastName: string; username: string; email: string; password: string; confirmPassword: string;
  phone: string; role: 'vendor';
  // Address
  city: string; cityCode: string;
  barangay: string; barangayCode: string; unitHouseNo: string; street: string; postalCode: string;
  // Vendor-specific
  companyName: string;
  termsAccepted: boolean;
  businessPermitUrl: string;
  birCertificateUrl: string;
  accountName: string;
  accountNumber: string;
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
  firstName: '', lastName: '', username: '', email: '', password: '', confirmPassword: '',
  phone: '', role: 'vendor' as const,
  city: '', cityCode: '',
  barangay: '', barangayCode: '', unitHouseNo: '', street: '', postalCode: '',
  companyName: '',
  termsAccepted: false,
  businessPermitUrl: '',
  birCertificateUrl: '',
  accountName: '',
  accountNumber: '',
};

const LOCATION_API = import.meta.env.VITE_LOCATION_API || 'https://psgc.gitlab.io/api';
const steps = ['Basic Info', 'Address', 'Company & Services', 'Contact'];

export default function VendorRegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefillData = location.state?.prefillData;

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>({
    ...initialFormData,
    firstName: prefillData?.firstName || '',
    lastName: prefillData?.lastName || '',
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
  const [activeTooltip, setActiveTooltip] = useState<{ show: boolean, x: number, y: number, text: string }>({ show: false, x: 0, y: 0, text: '' });
  const [servicesCatalog, setServicesCatalog] = useState<any[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  // [CAVEMAN] Log mounting
  useEffect(() => {
    console.log("[CAVEMAN] Vendor Register page loaded! Initial state:", initialFormData);
  }, []);

  useEffect(() => {
    setLoadingCatalog(true);
    fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/services`)
      .then((r) => {
        if (!r.ok) throw new Error('API failed');
        return r.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map((svc: any) => ({
            name: svc.name,
            description: svc.description || '',
            sub: (svc.subServices || []).map((sub: any) => ({
              name: sub.name || sub,
              description: sub.description || '',
              workTypes: sub.workTypes || []
            }))
          }));
          setServicesCatalog(formatted);
          console.log("[CAVEMAN] Successfully loaded services catalog. Found " + formatted.length + " services.");
        } else {
          throw new Error('Empty database services');
        }
      })
      .catch(() => {
        console.log("[CAVEMAN] Failed to load database services. Loading fallback services catalog.");
        const fallback = VENDOR_SERVICES.map(svc => ({
          name: svc.name,
          description: svc.description,
          sub: svc.sub.map(s => ({
            name: s.name,
            description: s.description,
            workTypes: WORK_TYPES_MAPPING[s.name] || []
          }))
        }));
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

  // Fetch barangays when city changes
  useEffect(() => {
    if (!form.cityCode) { 
      setBarangays([]); 
      return; 
    }
    setBarangays([]);
    update('barangay', ''); 
    update('barangayCode', '');
    fetch(`${LOCATION_API}/cities-municipalities/${form.cityCode}/barangays/`)
      .then((r) => r.json())
      .then((data) => setBarangays(data.sort((a: any, b: any) => a.name.localeCompare(b.name))))
      .catch(() => {});
  }, [form.cityCode]);

  const passwordStrength = useCallback((pw: string) => {
    let s = 0;
    if (pw.length >= 8) s++; if (/[A-Z]/.test(pw)) s++; if (/[0-9]/.test(pw)) s++; if (/[^A-Za-z0-9]/.test(pw)) s++;
    console.log("[CAVEMAN] Checked password strength. Score:", s);
    return s;
  }, []);

  const isPhoneValid = (phone: string) => {
    return /^\d{11}$/.test(phone.replace(/\D/g, ''));
  };

  const [uploadingPermit, setUploadingPermit] = useState(false);
  const [uploadingBIR, setUploadingBIR] = useState(false);

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>, type: 'permit' | 'bir') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'permit') setUploadingPermit(true);
    else setUploadingBIR(true);
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
        if (type === 'permit') {
          update('businessPermitUrl', res.data.url);
        } else {
          update('birCertificateUrl', res.data.url);
        }
      } catch (err: any) {
        console.error(`[CAVEMAN] VendorRegisterPage: Upload failed for ${type}`, err);
        setError(`Failed to upload ${type === 'permit' ? 'Business Permit' : 'BIR Certificate'}. Please try again.`);
      } finally {
        if (type === 'permit') setUploadingPermit(false);
        else setUploadingBIR(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const canNext = () => {
    let ok = false;
    if (step === 0) {
      ok = !!(form.firstName && form.lastName && form.username && usernameValid && form.email && form.password && form.password === form.confirmPassword && form.password.length >= 8 && /[A-Z]/.test(form.password) && /[0-9]/.test(form.password) && /[^A-Za-z0-9]/.test(form.password));
    } else if (step === 1) {
      ok = !!(form.cityCode && form.barangayCode && form.unitHouseNo && form.street);
    } else if (step === 2) {
      const hasCompanyName = !!form.companyName.trim();
      const hasServices = selectedServices.length > 0;
      const allHaveSubs = selectedServices.every(s => s.sub_services && s.sub_services.length > 0);
      ok = hasCompanyName && hasServices && allHaveSubs;
    } else if (step === 3) {
      ok = !!(form.phone && isPhoneValid(form.phone) && form.termsAccepted);
    }
    console.log("[CAVEMAN] Checking step validity. Step:", step, "canNext:", ok);
    return ok;
  };

  const handleSubmit = async () => {
    console.log("[CAVEMAN] handleSubmit vendor registration triggered!");
    setError(''); setLoading(true);
    try {
      const user = await registerUser(form.email, form.password);
      
      // Prepare services payload
      const servicesPayload = selectedServices.map(s => ({
        service: s.service,
        sub_services: s.sub_services,
        work_types: s.work_types || []
      }));
      
      const firstServiceName = servicesPayload.length > 0 ? servicesPayload[0].service : '';

      // Save profile locally; will be written to Firestore after email verification
      const profile: any = {
        uid: user.uid,
        email: form.email,
        username: form.username,
        role: 'vendor',
        first_name: form.firstName,
        last_name: form.lastName,
        phone: form.phone,
        unit_house_no: form.unitHouseNo,
        street: form.street,
        barangay: form.barangay,
        city: form.city,
        region: 'National Capital Region',
        postal_code: form.postalCode,
        company_name: form.companyName,
        services: servicesPayload,
        service_type: firstServiceName,
        business_permit_url: form.businessPermitUrl || '',
        bir_certificate_url: form.birCertificateUrl || '',
        account_name: form.accountName || '',
        account_number: form.accountNumber || ''
      };

      console.log("[CAVEMAN] Submitting Vendor registration profile:", profile);
      localStorage.setItem('pendingRegistration', JSON.stringify({ sentAt: Date.now(), profile }));
      console.log("[CAVEMAN] Registration successful. Redirecting to verify email.");
      navigate(ROUTES.verifyEmail);
    } catch (err: any) {
      console.log("[CAVEMAN] Registration error:", err.message);
      const firebaseCode: string | undefined = err?.code;
      if (firebaseCode === 'auth/email-already-in-use') {
        setError('Email already registered.');
        return;
      }
      if (firebaseCode === 'auth/invalid-email') {
        setError('Invalid email.');
        return;
      }
      if (firebaseCode === 'auth/weak-password') {
        setError('Password too weak.');
        return;
      }
      setError(err.response?.data?.message || err.message || 'Registration failed.');
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
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-lg animate-fade-in">
          <div className="flex justify-end mb-4 lg:mb-6">
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

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            {step === 0 ? 'Basic Information' : step === 1 ? 'Business Location' : step === 2 ? 'Company Details' : 'Contact Person'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Step {step + 1} of {steps.length}</p>

          {error && <div className="mb-4 p-3 rounded-xl bg-brand-red/10 border border-brand-red/20 text-brand-red text-sm">{error}</div>}

          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              {step === 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                      <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input value={form.firstName} onChange={(e) => update('firstName', e.target.value)} className="input-base pl-10" placeholder="Juan" required /></div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                      <input value={form.lastName} onChange={(e) => update('lastName', e.target.value)} className="input-base" placeholder="Dela Cruz" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Username</label>
                    <div className="relative flex gap-2">
                      <input value={form.username} onChange={(e) => update('username', e.target.value)} onBlur={() => form.username && checkUsername(form.username)} className="input-base flex-1" placeholder="username" required />
                      {usernameCheckLoading && <div className="text-xs text-slate-400 flex items-center">Checking...</div>}
                    </div>
                    {usernameError && <p className="text-xs text-brand-red mt-1">{usernameError}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                    <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="input-base pl-10" placeholder="you@example.com" required /></div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                    <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => update('password', e.target.value)} className="input-base pl-10 pr-10" placeholder="Min 8 characters" required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button></div>
                    {form.password && (
                      <div className="mt-2">
                        <div className="flex gap-1">{[0,1,2,3].map(i => <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < strength ? strengthColors[strength-1] : 'bg-slate-200 dark:bg-slate-700'}`} />)}</div>
                        <p className="text-xs mt-1 text-slate-500">{strengthLabels[strength-1] || 'Too weak'}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
                    <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} className="input-base pl-10" placeholder="Re-enter password" required /></div>
                    {form.confirmPassword && form.password !== form.confirmPassword && <p className="text-xs text-brand-red mt-1">Passwords don't match</p>}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-400 mb-2"><MapPin className="w-3 h-3 inline mr-1" />Region: National Capital Region (NCR) — auto-filled</p>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cities / Municipalities (Service Areas)</label>
                    <div className="max-h-48 overflow-y-auto pr-1 border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-slate-50/50 dark:bg-slate-800/50">
                      {citiesLoading ? (
                        <p className="text-sm p-2 text-slate-500">Loading cities...</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                          {cities.map(c => {
                            const selectedCities = form.city ? form.city.split(', ') : [];
                            const isSelected = selectedCities.includes(c.name);
                            return (
                              <label key={c.code} className="flex items-center gap-2 p-1.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors">
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
                                  className="w-4 h-4 rounded border-slate-300 text-brand-navy focus:ring-brand-navy"
                                />
                                <span className="text-sm text-slate-700 dark:text-slate-300">{c.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {form.city && (
                      <p className="text-xs text-brand-green mt-1 font-medium">Selected: {form.city.split(', ').length} cities</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Barangay (Optional)</label>
                    <input 
                      value={form.barangay} 
                      onChange={(e) => { update('barangay', e.target.value); update('barangayCode', e.target.value || 'skipped'); }} 
                      className="input-base" 
                      placeholder="e.g. Brgy. San Lorenzo" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Unit / House No.</label>
                      <input value={form.unitHouseNo} onChange={(e) => update('unitHouseNo', e.target.value)} className="input-base" placeholder="e.g. Unit 5B" required /></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Street</label>
                      <input value={form.street} onChange={(e) => update('street', e.target.value)} className="input-base" placeholder="e.g. Rizal Ave" required /></div>
                  </div>
                  <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Postal Code</label>
                    <input value={form.postalCode} onChange={(e) => update('postalCode', e.target.value)} className="input-base" placeholder="e.g. 1000" /></div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        value={form.companyName} 
                        onChange={(e) => update('companyName', e.target.value)} 
                        className="input-base pl-10" 
                        placeholder="e.g. FixIt Pro Solutions Co." 
                        required 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Services You Offer <span className="text-slate-400 text-xs font-normal">(Select all that apply)</span>
                    </label>
                    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900/50 p-4 space-y-3 max-h-[300px] overflow-y-auto">
                      {loadingCatalog ? (
                        <p className="text-sm text-slate-400 animate-pulse">Loading service catalog...</p>
                      ) : servicesCatalog.length === 0 ? (
                        <p className="text-sm text-slate-400">No services available.</p>
                      ) : (
                        servicesCatalog.map((svc) => {
                          const isSvcSelected = selectedServices.some(s => s.service === svc.name);
                          const isExpanded = expandedService === svc.name;
                          
                          return (
                            <div key={svc.name} className="border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden">
                              {/* Service Header Row */}
                              <button
                                type="button"
                                onClick={() => toggleService(svc.name)}
                                className={`w-full flex items-center justify-between p-3 text-left transition-colors ${
                                  isSvcSelected 
                                    ? 'bg-brand-green/10 dark:bg-brand-green/5 text-slate-900 dark:text-white' 
                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                                    isSvcSelected 
                                      ? 'border-brand-green bg-brand-green text-white' 
                                      : 'border-slate-300 dark:border-slate-600 bg-transparent'
                                  }`}>
                                    {isSvcSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                  </div>
                                  <div>
                                    <span className="font-semibold text-sm">{svc.name}</span>
                                    {svc.description && (
                                      <p className="text-xs text-slate-400 line-clamp-1">{svc.description}</p>
                                    )}
                                  </div>
                                </div>
                                <span className="text-xs text-slate-400 font-medium">
                                  {isExpanded ? 'Collapse' : 'Expand'}
                                </span>
                              </button>

                              {/* Sub-services selection (rendered when service is selected and expanded) */}
                              <AnimatePresence>
                                {isSvcSelected && isExpanded && svc.sub && svc.sub.length > 0 && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800 p-3 pl-8 space-y-2"
                                  >
                                    <p className="text-xs font-medium text-slate-400 mb-2">Select sub-services:</p>
                                    {svc.sub.map((sub: any) => {
                                      const subSvcSelected = selectedServices.find(s => s.service === svc.name)?.sub_services.includes(sub.name);
                                      return (
                                        <div 
                                          key={sub.name} 
                                          className="py-1.5 group border-b border-slate-100/50 dark:border-slate-800/30 last:border-0"
                                        >
                                          <label className="flex items-start gap-2.5 cursor-pointer">
                                            <input
                                              type="checkbox"
                                              checked={!!subSvcSelected}
                                              onChange={() => toggleSubService(svc.name, sub.name)}
                                              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-brand-green focus:ring-brand-green bg-transparent"
                                            />
                                            <div
                                              onMouseEnter={(e) => sub.description && handleMouseMove(e, sub.description)}
                                              onMouseLeave={hideTooltip}
                                            >
                                              <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                                {sub.name}
                                              </span>
                                              {sub.description && (
                                                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{sub.description}</p>
                                              )}
                                            </div>
                                          </label>
                                          
                                          {subSvcSelected && sub.workTypes && sub.workTypes.length > 0 && (
                                            <div 
                                              onClick={(e) => e.stopPropagation()}
                                              className="mt-2 ml-6 pl-3 pr-2 py-2 bg-slate-100/50 dark:bg-slate-800/40 rounded-lg border border-slate-200/50 dark:border-slate-700/50"
                                            >
                                              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">
                                                Available Work Types (Reference Only)
                                              </span>
                                              <div className="flex flex-wrap gap-1.5">
                                                {sub.workTypes.map((wt: string) => (
                                                  <span 
                                                    key={wt} 
                                                    className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-200/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 border border-slate-300/40 dark:border-slate-700/40 transition-colors"
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
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                    <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input value={form.phone} onChange={(e) => update('phone', e.target.value)} className="input-base pl-10" placeholder="09XX XXX XXXX" required /></div>
                    {form.phone && !isPhoneValid(form.phone) && <p className="text-xs text-brand-red mt-1">Phone must be exactly 11 digits</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Business Permit
                      </label>
                      <div className="flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer relative group h-28">
                        {uploadingPermit ? (
                          <div className="text-xs text-slate-500 font-bold animate-pulse">Uploading...</div>
                        ) : form.businessPermitUrl ? (
                          <div className="relative w-full h-full rounded-lg overflow-hidden flex items-center justify-center">
                            <img src={form.businessPermitUrl} alt="Business Permit" className="max-h-full object-contain" />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                update('businessPermitUrl', '');
                              }}
                              className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-black text-white rounded transition-colors z-10"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-5 h-5 text-slate-400 mb-1" />
                            <span className="text-[11px] font-semibold text-slate-650 dark:text-slate-400 text-center">
                              Upload Business Permit
                            </span>
                            <span className="text-[9px] text-slate-400 mt-0.5">PNG, JPG, WEBP</span>
                          </>
                        )}
                        {!form.businessPermitUrl && !uploadingPermit && (
                          <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => handleUploadFile(e, 'permit')}
                          />
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        BIR Certificate (Form 2303)
                      </label>
                      <div className="flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer relative group h-28">
                        {uploadingBIR ? (
                          <div className="text-xs text-slate-500 font-bold animate-pulse">Uploading...</div>
                        ) : form.birCertificateUrl ? (
                          <div className="relative w-full h-full rounded-lg overflow-hidden flex items-center justify-center">
                            <img src={form.birCertificateUrl} alt="BIR Certificate" className="max-h-full object-contain" />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                update('birCertificateUrl', '');
                              }}
                              className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-black text-white rounded transition-colors z-10"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-5 h-5 text-slate-400 mb-1" />
                            <span className="text-[11px] font-semibold text-slate-650 dark:text-slate-400 text-center">
                              Upload BIR Certificate
                            </span>
                            <span className="text-[9px] text-slate-400 mt-0.5">PNG, JPG, WEBP</span>
                          </>
                        )}
                        {!form.birCertificateUrl && !uploadingBIR && (
                          <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => handleUploadFile(e, 'bir')}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Account Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={form.accountName}
                          onChange={(e) => update('accountName', e.target.value)}
                          className="input-base pl-10 text-sm"
                          placeholder="Enter Bank or GCash Account Name..."
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
                          onChange={(e) => update('accountNumber', e.target.value)}
                          className="input-base pl-10 text-sm"
                          placeholder="Enter Bank or GCash Account Number..."
                        />
                      </div>
                    </div>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer mt-4">
                    <input type="checkbox" checked={form.termsAccepted} onChange={(e) => update('termsAccepted', e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-slate-300 text-brand-navy focus:ring-brand-navy" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">I agree to the <a href="#" className="text-brand-navy dark:text-brand-green font-medium hover:underline">Terms & Conditions</a> and <a href="#" className="text-brand-navy dark:text-brand-green font-medium hover:underline">Privacy Policy</a>.</span>
                  </label>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            {step > 0 ? (
              <Button variant="ghost" onClick={() => setStep(s => s - 1)} icon={<ChevronLeft className="w-4 h-4" />}>Back</Button>
            ) : <div />}
            {step < 3 ? (
              <Button onClick={() => setStep(s => s + 1)} disabled={!canNext()} icon={<ChevronRight className="w-4 h-4" />}>Continue</Button>
            ) : (
              <Button onClick={handleSubmit} loading={loading} disabled={!canNext()} variant="success">Create Account</Button>
            )}
          </div>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account? <Link to={ROUTES.login} className="text-brand-navy dark:text-brand-green font-semibold hover:underline">Sign in</Link>
          </p>
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
