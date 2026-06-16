import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Check, ChevronRight, ChevronLeft } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { sendBackendVerificationEmail } from '../services/firebaseService';
import { auth } from '../config/firebase';
import { Button } from '../components/shared/Button';
import { ROUTES } from '../routes/paths';
import api from '../services/apiService';
import LampButton from '../components/shared/LampButton';

interface FormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  inviteCode: string;
  verificationCode: string;
  termsAccepted: boolean;
}

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  inviteCode: '',
  verificationCode: '',
  termsAccepted: false,
};

const steps = ['Basic Info', 'Invite Code', 'Account Verification'];

const AdminRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usernameCheckLoading, setUsernameCheckLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [usernameValid, setUsernameValid] = useState(false);

  // Clear global error when step changes
  useEffect(() => {
    setError('');
  }, [step]);

  const checkUsername = useCallback(async (username: string) => {
    if (username.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      setUsernameValid(false);
      return;
    }
    setUsernameCheckLoading(true);
    setUsernameError('');
    try {
      const res = await api.get(`/api/auth/username/${username}`);
      if (res.data.available) {
        setUsernameValid(true);
      } else {
        setUsernameValid(false);
        setUsernameError('Username is already taken');
      }
    } catch (err: any) {
      setUsernameValid(false);
      setUsernameError('Error checking username');
    } finally {
      setUsernameCheckLoading(false);
    }
  }, []);

  const update = (field: keyof FormData, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
    if (field === 'username' && typeof value === 'string') {
      setUsernameValid(false);
      setUsernameError('');
    }
  };

  const passwordStrength = useCallback((pw: string) => {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  }, []);

  const canNext = () => {
    if (step === 0) {
      return form.firstName && form.lastName && form.username && usernameValid && form.email && 
             form.password && form.password === form.confirmPassword && form.password.length >= 8 && /[A-Z]/.test(form.password) && /[0-9]/.test(form.password) && /[^A-Za-z0-9]/.test(form.password);
    }
    if (step === 1) {
      return form.inviteCode;
    }
    if (step === 2) {
      return form.verificationCode.length === 6 && form.termsAccepted;
    }
    return false;
  };

  const handleContinueToStep3 = async () => {
    setLoading(true);
    setError('');
    try {
      // Check if invite code is valid BEFORE creating the auth user
      await api.post('/api/auth/check-invite-code', { inviteCode: form.inviteCode });
      
      let user = auth.currentUser;
      if (!user || user.email !== form.email) {
         const userCred = await createUserWithEmailAndPassword(auth, form.email, form.password);
         user = userCred.user;
      }
      
      const { sendOtp } = await import('../services/firebaseService');
      await sendOtp();
      setStep(2);
    } catch (err: any) {
      if (err?.response?.status === 400 && err?.response?.data?.message) {
        setError(err.response.data.message);
        return;
      }
      
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
    setError('');
    setLoading(true);
    try {
      const { verifyOtp, getCurrentUser } = await import('../services/firebaseService');
      await verifyOtp(form.verificationCode);

      const user = getCurrentUser();
      await user?.reload();
      
      const profile = {
        uid: user?.uid,
        email: form.email,
        username: form.username,
        role: 'admin',
        firstName: form.firstName,
        lastName: form.lastName,
        inviteCode: form.inviteCode,
      };

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const res = await fetch(`${API_BASE_URL}/api/auth/register-admin`, {
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

      navigate(ROUTES.admin || '/admin');
    } catch (err: any) {
      setError(err.message || 'Verification failed.');
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
        <div className="absolute top-10 left-10 w-72 h-72 bg-brand-green/10 rounded-full blur-3xl" />
        <div className="text-center relative z-10">
          <img src="/ALLFIXLOGO.png" alt="AllFix Logo" className="w-20 h-20 object-contain mx-auto mb-8" />
          <h2 className="text-3xl font-bold text-white mb-4">Admin Registration</h2>
          <p className="text-white/70 max-w-sm">Create your admin account to manage AllFix.ph and oversee all operations.</p>
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
        <div className="w-full max-w-lg">
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <img src="/ALLFIXLOGO.png" alt="AllFix Logo" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold text-brand-navy dark:text-white">AllFix<span className="text-brand-green">.ph</span></span>
          </div>

          <div className="flex justify-end mb-4 lg:mb-6">
            <LampButton />
          </div>

          {/* Mobile step indicator */}
          <div className="lg:hidden flex items-center gap-2 mb-6">
            {steps.map((s, i) => (
              <div key={s} className={`flex-1 h-1.5 rounded-full transition-all ${i <= step ? 'bg-brand-navy dark:bg-brand-green' : 'bg-slate-200 dark:bg-slate-700'}`} />
            ))}
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            {step === 0 ? 'Basic Information' : 'Admin Invite Code'}
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
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input value={form.firstName} onChange={(e) => update('firstName', e.target.value)} className="input-base pl-10" placeholder="Juan" required />
                      </div>
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
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="input-base pl-10" placeholder="you@example.com" required />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => update('password', e.target.value)} className="input-base pl-10 pr-10" placeholder="Min 8 characters" required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {form.password && (
                      <div className="mt-2">
                        <div className="flex gap-1">
                          {[0,1,2,3].map(i => (
                            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < strength ? strengthColors[strength-1] : 'bg-slate-200 dark:bg-slate-700'}`} />
                          ))}
                        </div>
                        <p className="text-xs mt-1 text-slate-500">{strengthLabels[strength-1] || 'Too weak'}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} className="input-base pl-10" placeholder="Re-enter password" required />
                    </div>
                    {form.confirmPassword && form.password !== form.confirmPassword && <p className="text-xs text-brand-red mt-1">Passwords don't match</p>}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Invite Code</label>
                    <input 
                      value={form.inviteCode} 
                      onChange={(e) => update('inviteCode', e.target.value)} 
                      className="input-base" 
                      placeholder="Enter your admin invite code" 
                      required 
                    />
                  </div>

                  <div className="flex items-start gap-3 cursor-pointer mt-6 p-3 rounded-lg bg-brand-green/10 dark:bg-brand-green/5 border border-brand-green/20">
                    <Check className="w-5 h-5 text-brand-green flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Your invite code is valid for single use only.</span>
                  </div>
                </div>
              )}

              {step === 2 && (
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

                  <label className="flex items-start gap-3 cursor-pointer mt-6">
                    <input 
                      type="checkbox" 
                      checked={form.termsAccepted} 
                      onChange={(e) => update('termsAccepted', e.target.checked)} 
                      className="mt-1 flex-shrink-0 w-4 h-4 text-brand-green rounded border-slate-300 focus:ring-brand-green" 
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                  I agree to the <a href="#" className="text-brand-navy dark:text-brand-green font-medium hover:underline">Terms & Conditions</a> and <a href="#" className="text-brand-navy dark:text-brand-green font-medium hover:underline">Privacy Policy</a>.
                </span>
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
            {step === 0 && (
              <Button onClick={() => setStep(s => s + 1)} disabled={!canNext()} icon={<ChevronRight className="w-4 h-4" />}>Continue</Button>
            )}
            {step === 1 && (
              <Button onClick={handleContinueToStep3} loading={loading} disabled={!canNext()} icon={<ChevronRight className="w-4 h-4" />}>Verify Invite</Button>
            )}
            {step === 2 && (
              <Button onClick={handleSubmit} loading={loading} disabled={!canNext()} variant="success">Verify & Create Account</Button>
            )}
          </div>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Back to <Link to={ROUTES.login} className="text-brand-navy dark:text-brand-green font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminRegisterPage;
