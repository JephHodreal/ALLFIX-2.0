import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import { loginUser, logoutUser, resetPassword } from '../services/firebaseService';
import { Button } from '../components/shared/Button';
import LampButton from '../components/shared/LampButton';
import { ROUTES } from '../routes/paths';
import { useAuth, UserRole } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = location.state?.from || '/';
  const { refreshProfile } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      // Get email from backend using username
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const userRes = await fetch(`${apiUrl}/api/auth/username/${encodeURIComponent(username)}`);

      if (!userRes.ok) {
        if (userRes.status === 404) {
          setError('Username not found.');
        } else {
          setError('Failed to look up username.');
        }
        setLoading(false);
        return;
      }

      const userData = await userRes.json();
      const email = userData.email;

      const user = await loginUser(email, password);
      if (!user.emailVerified) {
        navigate(ROUTES.verifyEmail);
        return;
      }

      // Ensure profile is loaded with retry
      const profileData = await refreshProfile();
      if (!profileData) {
        setError('Failed to load profile. Please try again.');
        await logoutUser();
        setLoading(false);
        return;
      }

      // Check account approval status
      if (profileData.acc_approve === 'pending') {
        setError('Your account is currently pending approval.');
        await logoutUser();
        setLoading(false);
        return;
      } else if (profileData.acc_approve === 'rejected') {
        setError('Your account application has been rejected.');
        await logoutUser();
        setLoading(false);
        return;
      }

      // Check account deleted status
      if (profileData.temp_delete === 1) {
        setError('Account has been deleted.');
        await logoutUser();
        setLoading(false);
        return;
      }

      // Check if temporary password reset is required
      if (profileData.requires_password_reset) {
        navigate('/reset-password', { state: { tempPassword: password } });
        setLoading(false);
        return;
      }

      // Get role from token claims
      const tokenResult = await user.getIdTokenResult();
      const role = (tokenResult.claims.role as UserRole) || 'customer';
      const routes: Record<UserRole, string> = {
        admin: '/admin',
        customer: '/customer',
        vendor: '/vendor',
        personnel: '/personnel'
      };

      // Call login-success to update last_login timestamp
      try {
        await fetch(`${apiUrl}/api/auth/login-success`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${tokenResult.token}`
          }
        });
      } catch (updateErr) {
        console.error('Failed to update last_login', updateErr);
      }

      navigate(routes[role] || ROUTES.customer);
    } catch (err: any) {
      const msg = err.code === 'auth/invalid-credential' ? 'Invalid username or password.'
        : err.code === 'auth/user-not-found' ? 'No account found.'
          : err.code === 'auth/too-many-requests' ? 'Too many attempts. Try again later.'
            : err.message || 'Login failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordClick = async () => {
    if (!username.trim()) {
      setError('Please enter your username first to reset your password.');
      setSuccessMsg('');
      return;
    }
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const userRes = await fetch(`${apiUrl}/api/auth/username/${encodeURIComponent(username)}`);

      if (!userRes.ok) {
        if (userRes.status === 404) {
          setError('Username not found.');
        } else {
          setError('Failed to look up username.');
        }
        setLoading(false);
        return;
      }

      const userData = await userRes.json();
      const email = userData.email;

      await resetPassword(email);
      setSuccessMsg('A password reset link has been sent to your email.');
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface-light dark:bg-surface-dark">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-gradient items-center justify-center p-12 relative overflow-hidden">
        <button 
          onClick={() => navigate(fromPath)} 
          className="absolute top-8 left-8 text-white/80 hover:text-white flex items-center gap-2 transition-colors z-20"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold text-sm">
            {fromPath === '/' ? 'Back to Home' : 'Back'}
          </span>
        </button>
        <div className="absolute top-10 left-10 w-72 h-72 bg-brand-green/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-brand-yellow/5 rounded-full blur-3xl" />
        <div className="text-center relative z-10">
          <img src="/ALLFIXLOGO.png" alt="AllFix Logo" className="w-20 h-20 object-contain mx-auto mb-8" />
          <h2 className="text-4xl font-bold text-white mb-4">Welcome back!</h2>
          <p className="text-white/70 text-lg max-w-sm">Sign in to manage your bookings and property maintenance services.</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="flex justify-end mb-4">
            <LampButton />
          </div>
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <img src="/ALLFIXLOGO.png" alt="AllFix Logo" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold text-brand-navy dark:text-white">AllFix<span className="text-brand-green">.ph</span></span>
          </div>

          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Sign In</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Enter your credentials to access your account.</p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-brand-red/10 border border-brand-red/20 text-brand-red text-sm">{error}</div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-brand-green/10 border border-brand-green/20 text-brand-green text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              {successMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Username</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" required className="input-base pl-10" />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                <button type="button" onClick={handleForgotPasswordClick} disabled={loading} className="text-sm font-semibold text-brand-navy dark:text-brand-green hover:underline disabled:opacity-50">
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="input-base pl-10 pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" loading={loading} className="w-full">Sign In</Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to={ROUTES.register} className="text-brand-navy dark:text-brand-green font-semibold hover:underline">Create one</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
