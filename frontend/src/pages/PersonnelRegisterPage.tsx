import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, User, Phone, Building2, Lock, Eye, EyeOff, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { registerUser } from '../services/firebaseService';
import { Button } from '../components/shared/Button';
import { ROUTES } from '../routes/paths';
import api from '../services/apiService';
import LampButton from '../components/shared/LampButton';
import { VENDOR_SERVICES } from '../constants/services';

interface FormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  vendorId: string;
  services: SelectedService[];
}

interface SelectedService {
  service: string;
  sub_services: string[];
}

const initialForm: FormData = { firstName: '', lastName: '', username: '', email: '', password: '', confirmPassword: '', phone: '', vendorId: '', services: [] };

export default function PersonnelRegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>(initialForm);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<{ show: boolean, x: number, y: number, text: string }>({ show: false, x: 0, y: 0, text: '' });

  const handleMouseMove = (e: React.MouseEvent, text: string) => {
    setActiveTooltip({ show: true, x: e.clientX, y: e.clientY, text });
  };
  const hideTooltip = () => setActiveTooltip({ ...activeTooltip, show: false });

  const toggleService = (serviceName: string) => {
    const exists = selectedServices.find(s => s.service === serviceName);
    if (exists) {
      setSelectedServices(selectedServices.filter(s => s.service !== serviceName));
      setExpandedService(null);
    } else {
      setSelectedServices([...selectedServices, { service: serviceName, sub_services: [] }]);
      setExpandedService(serviceName);
    }
  };

  const toggleSubService = (serviceName: string, subServiceName: string) => {
    setSelectedServices(selectedServices.map(s => {
      if (s.service === serviceName) {
        const hasSub = s.sub_services.includes(subServiceName);
        return {
          ...s,
          sub_services: hasSub
            ? s.sub_services.filter(sub => sub !== subServiceName)
            : [...s.sub_services, subServiceName]
        };
      }
      return s;
    }));
  };

  // username check states
  const [usernameCheckLoading, setUsernameCheckLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [usernameValid, setUsernameValid] = useState(false);

  useEffect(() => {
    api.get('/api/vendors/approved').then(r => setVendors((r.data || []).filter((v: any) => v.accept_personnel === true))).catch(() => {});
  }, []);

  const update = (key: keyof FormData, value: string) => {
    let processedValue = value;
    if (['username', 'email', 'password', 'confirmPassword', 'phone'].includes(key)) {
      processedValue = value.replace(/\s/g, '');
    }
    if (['firstName', 'lastName'].includes(key) && value.length > 0) {
      processedValue = value.charAt(0).toUpperCase() + value.slice(1);
    }
    setForm(prev => ({ ...prev, [key]: processedValue }));
    if (key === 'username') {
      setUsernameError('');
      setUsernameValid(false);
    }
  };

  const isPhoneValid = (phone: string) => {
    return /^\d{11}$/.test(phone.replace(/\D/g, ''));
  };

  const filtered = vendors.filter(v => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const displayName = (v.company_name || v.name || v.username || '').toLowerCase();
    return displayName.includes(q);
  });

  const selectedVendor = vendors.find(v => v.id === form.vendorId);

  const checkUsername = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameError('Min 3 chars');
      setUsernameValid(false);
      return;
    }
    setUsernameCheckLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/auth/check-username?username=${encodeURIComponent(username)}`);
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
      setUsernameValid(true);
      setUsernameError('');
    } finally {
      setUsernameCheckLoading(false);
    }
  };

  const canNext = () => {
    // Step 0: basic info
    if (step === 0) return form.firstName && form.lastName && form.username && usernameValid && form.email && form.password && form.password === form.confirmPassword && form.password.length >= 8 && /[A-Z]/.test(form.password) && /[0-9]/.test(form.password) && /[^A-Za-z0-9]/.test(form.password);
    // Step 1: vendor + contact + services
    if (step === 1) {
      const hasValidServices = selectedServices.length > 0 && selectedServices.every(s => {
        const vendorService = selectedVendor?.services?.find((vs: any) => vs.service === s.service);
        return !vendorService?.sub_services?.length || s.sub_services.length > 0;
      });
      return form.phone && isPhoneValid(form.phone) && form.vendorId && hasValidServices;
    }
    return false;
  };

  const handleSubmit = async () => {
    setError(''); setLoading(true);
    try {
      const user = await registerUser(form.email, form.password);
      const profile = {
        uid: user.uid,
        username: form.username,
        email: form.email,
        first_name: form.firstName,
        last_name: form.lastName,
        phone: form.phone,
        role: 'personnel',
        vendor_id: form.vendorId,
        services: selectedServices,
      };
      localStorage.setItem('pendingRegistration', JSON.stringify({ sentAt: Date.now(), profile }));
      navigate(ROUTES.verifyEmail);
    } catch (err: any) {
      const firebaseCode: string | undefined = err?.code;
      if (firebaseCode === 'auth/email-already-in-use') {
        setError('Email already registered.');
      } else if (firebaseCode === 'auth/weak-password') {
        setError('Password too weak.');
      } else {
        setError(err.response?.data?.message || err.message || 'Registration failed.');
      }
    } finally { setLoading(false); }
  };

  const passwordStrength = useCallback((pw: string) => {
    let s = 0;
    if (pw.length >= 8) s++; if (/[A-Z]/.test(pw)) s++; if (/[0-9]/.test(pw)) s++; if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  }, []);

  const strength = passwordStrength(form.password);
  const strengthColors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-brand-green'];
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="min-h-screen flex bg-surface-light dark:bg-surface-dark">
      <div className="hidden lg:flex lg:w-2/5 bg-brand-gradient items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 bg-brand-green/10 rounded-full blur-3xl" />
        <div className="text-center relative z-10">
          <img src="/ALLFIXLOGO.png" alt="AllFix Logo" className="w-20 h-20 object-contain mx-auto mb-8" />
          <h2 className="text-3xl font-bold text-white mb-4">Join as Personnel</h2>
          <p className="text-white/70 max-w-sm">Apply to join an existing vendor. Your chosen vendor will review your application.</p>
          {/* Step indicator */}
          <div className="mt-12 flex items-center justify-center gap-4">
            {['Basic Info', 'Vendor Details'].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i <= step ? 'bg-brand-green text-white' : 'bg-white/20 text-white/50'}`}>
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                {i < 1 && <div className={`w-12 h-0.5 ${i < step ? 'bg-brand-green' : 'bg-white/20'}`} />}
              </div>
            ))}
          </div>
          <p className="text-white/50 text-sm mt-3">Step {step + 1}: {step === 0 ? 'Basic Info' : 'Vendor Details'}</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-lg">
          <div className="flex justify-end mb-4 lg:mb-6">
            <LampButton />
          </div>
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <img src="/ALLFIXLOGO.png" alt="AllFix Logo" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold text-brand-navy dark:text-white">AllFix<span className="text-brand-green">.ph</span></span>
          </div>
          {/* Mobile step indicator */}
          <div className="lg:hidden flex items-center gap-2 mb-6">
            {['Basic Info', 'Vendor Details'].map((s, i) => (
              <div key={s} className={`flex-1 h-1.5 rounded-full transition-all ${i <= step ? 'bg-brand-navy dark:bg-brand-green' : 'bg-slate-200 dark:bg-slate-700'}`} />
            ))}
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            {step === 0 ? 'Basic Information' : 'Vendor Details'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Step {step + 1} of 2</p>

          {error && <div className="mb-4 p-3 rounded-xl bg-brand-red/10 border border-brand-red/20 text-brand-red text-sm">{error}</div>}

          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            {step === 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                    <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input value={form.firstName} onChange={(e) => update('firstName', e.target.value)} className="input-base pl-10" placeholder="Juan" /></div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                    <input value={form.lastName} onChange={(e) => update('lastName', e.target.value)} className="input-base" placeholder="Dela Cruz" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Username</label>
                  <div className="relative flex gap-2">
                    <input value={form.username} onChange={(e) => update('username', e.target.value)} onBlur={() => form.username && checkUsername(form.username)} className="input-base flex-1" placeholder="username" />
                    {usernameCheckLoading && <div className="text-xs text-slate-400 flex items-center">Checking...</div>}
                  </div>
                  {usernameError && <p className="text-xs text-brand-red mt-1">{usernameError}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="input-base pl-10" placeholder="you@example.com" /></div>
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
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                  <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input value={form.phone} onChange={(e) => update('phone', e.target.value)} className="input-base pl-10" placeholder="09XX XXX XXXX" required /></div>
                  {form.phone && !isPhoneValid(form.phone) && <p className="text-xs text-brand-red mt-1">Phone must be exactly 11 digits</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select Vendor</label>
                  <div className="relative">
                    <input 
                      placeholder="Search and select vendor..." 
                      value={query} 
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setIsDropdownOpen(true);
                        update('vendorId', '');
                      }}
                      onFocus={() => setIsDropdownOpen(true)}
                      onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                      className="input-base w-full" 
                    />
                    {isDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filtered.length === 0 ? (
                          <div className="p-3 text-sm text-slate-500">No vendors found</div>
                        ) : (
                          filtered.map(v => (
                            <div 
                              key={v.id} 
                              className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer text-sm text-slate-700 dark:text-slate-300"
                              onClick={() => {
                                update('vendorId', v.id);
                                setQuery(v.company_name || v.name || v.username);
                                setIsDropdownOpen(false);
                                setSelectedServices([]); // Reset services when vendor changes
                              }}
                            >
                              {v.company_name || v.name || v.username}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {selectedVendor && selectedVendor.services && selectedVendor.services.length > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 overflow-hidden mt-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Services You Offer</label>
                      <div className="max-h-96 overflow-y-scroll pr-2" style={{ overflowY: 'scroll', WebkitOverflowScrolling: 'touch' }}>
                        <div className="space-y-2 overflow-visible">
                        {selectedVendor.services.map((vendorService: any) => {
                          const serviceDef = VENDOR_SERVICES.find(s => s.name === vendorService.service);
                          const isSelected = selectedServices.find(s => s.service === vendorService.service);
                          return (
                            <div key={vendorService.service} className="space-y-2 relative z-10">
                              <button
                                type="button"
                                onClick={() => toggleService(vendorService.service)}
                                className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                                  isSelected
                                    ? 'border-brand-navy dark:border-brand-green bg-brand-navy/5 dark:bg-brand-green/10'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <p 
                                      className="font-semibold text-sm text-slate-900 dark:text-white relative cursor-help inline-block"
                                      onMouseMove={(e) => serviceDef && handleMouseMove(e, serviceDef.description)}
                                      onMouseLeave={hideTooltip}
                                    >
                                      {vendorService.service}
                                    </p>
                                  </div>
                                  {isSelected && <Check className="w-4 h-4 text-brand-navy dark:text-brand-green flex-shrink-0 mt-1" />}
                                </div>
                              </button>

                              {isSelected && vendorService.sub_services && vendorService.sub_services.length > 0 && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="ml-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 overflow-visible relative z-0">
                                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Select sub-services:</p>
                                  <div className="space-y-2">
                                    {vendorService.sub_services.map((subName: string) => {
                                      const subDef = serviceDef?.sub.find(s => s.name === subName);
                                      return (
                                        <label key={subName} className="flex items-start gap-2 cursor-pointer group/checkbox">
                                          <input
                                            type="checkbox"
                                            checked={isSelected?.sub_services.includes(subName) || false}
                                            onChange={() => toggleSubService(vendorService.service, subName)}
                                            className="mt-1 w-4 h-4 rounded border-slate-300 text-brand-navy focus:ring-brand-navy"
                                          />
                                          <div className="flex-1 relative min-h-fit">
                                            <span 
                                              className="text-sm text-slate-700 dark:text-slate-300 cursor-help inline-block"
                                              onMouseMove={(e) => subDef && handleMouseMove(e, subDef.description)}
                                              onMouseLeave={hideTooltip}
                                            >
                                              {subName}
                                            </span>
                                          </div>
                                        </label>
                                      );
                                    })}
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          );
                        })}
                        </div>
                      </div>
                      {selectedServices.length > 0 && (
                        <div className="mt-3 p-2 rounded-lg bg-brand-green/10 border border-brand-green/20">
                          <p className="text-xs font-medium text-brand-green">Selected: {selectedServices.map(s => `${s.service} (${s.sub_services.length})`).join(', ')}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

              </div>
            )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            {step > 0 ? (
              <Button variant="ghost" onClick={() => setStep(s => s - 1)} icon={<ChevronLeft className="w-4 h-4" />}>Back</Button>
            ) : <div />}
            {step < 1 ? (
              <Button onClick={() => setStep(s => s + 1)} disabled={!canNext()} icon={<ChevronRight className="w-4 h-4" />}>Continue</Button>
            ) : (
              <Button onClick={handleSubmit} loading={loading} disabled={!canNext()} variant="success">Apply</Button>
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
