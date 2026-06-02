import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle, ShieldAlert, LogOut, Check } from 'lucide-react';
import { useAuth, UserRole } from '../context/AuthContext';
import { changePassword, logoutUser } from '../services/firebaseService';
import { Button } from '../components/shared/Button';
import LampButton from '../components/shared/LampButton';
import api from '../services/apiService';
import { ROUTES } from '../routes/paths';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, role, refreshProfile } = useAuth();
  
  const tempPasswordFromLogin = location.state?.tempPassword || '';
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showReauthField, setShowReauthField] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Password strength logic matching RegisterPage
  const passwordStrength = (pw: string) => {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };

  const strength = passwordStrength(newPassword);
  const strengthColors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-brand-green'];

  // Validation checks matching RegisterPage
  const hasMinLength = newPassword.length >= 8;
  const hasCapital = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  
  const isMatch = newPassword === confirmPassword && newPassword !== '';
  const isSameAsTemp = (newPassword !== '' && newPassword === currentPassword) || (tempPasswordFromLogin !== '' && newPassword === tempPasswordFromLogin);
  const isValid = hasMinLength && hasCapital && hasNumber && hasSpecial && isMatch && (!showReauthField || currentPassword.trim() !== '') && !isSameAsTemp;

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setError('');
    setLoading(true);

    try {
      // 1. Update password in Firebase
      if (showReauthField) {
        await changePassword(newPassword, currentPassword);
      } else {
        await changePassword(newPassword);
      }

      // 2. Clear reset flag in Firestore backend (also updates last_login timestamp)
      await api.post('/api/auth/complete-password-reset');

      // 3. Show success page
      setSuccess(true);

      // 4. Wait 2 seconds, refresh profile context and redirect to role dashboard
      setTimeout(async () => {
        const updatedProfile = await refreshProfile();
        const roleRoutes: Record<UserRole, string> = {
          admin: '/admin/services',
          customer: ROUTES.customer,
          vendor: '/vendor/services',
          personnel: ROUTES.personnel,
        };
        navigate(roleRoutes[(updatedProfile?.role || role || 'customer') as UserRole] || ROUTES.customer);
      }, 2000);

    } catch (err: any) {
      console.error('Password reset failed', err);
      if (err.code === 'auth/requires-recent-login') {
        setShowReauthField(true);
        setError('Security check: Please enter your temporary/current password to confirm.');
      } else {
        setError(err.message || 'Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate(ROUTES.login);
    } catch (err) {
      console.error('Failed to log out', err);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface-light dark:bg-surface-dark">
      {/* Left panel (Premium Brand Showcase) */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-gradient items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 bg-brand-green/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-brand-yellow/5 rounded-full blur-3xl" />
        <div className="text-center relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-8 backdrop-blur-md">
            <Lock className="w-10 h-10 text-white animate-pulse" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Secure Your Account</h2>
          <p className="text-white/70 text-lg max-w-sm mx-auto">
            You're logging in with a temporary password. For maximum security, please create a new permanent password.
          </p>
        </div>
      </div>

      {/* Right panel (Interaction Interface) */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="absolute top-6 right-6 flex items-center gap-4">
          <LampButton />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Log out</span>
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <AnimatePresence mode="wait">
            {!success ? (
              <motion.div
                key="reset-form"
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="lg:hidden flex items-center gap-2 mb-8">
                  <div className="w-9 h-9 rounded-xl bg-brand-navy flex items-center justify-center">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-brand-navy dark:text-white">
                    AllFix<span className="text-brand-green">.ph</span>
                  </span>
                </div>

                <div className="flex items-start gap-3 p-4 mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300">
                  <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <span className="font-semibold block mb-0.5">Action Required</span>
                    Hi {profile?.first_name || 'there'}! This is your first login. Access is restricted until you change your temporary password.
                  </div>
                </div>

                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Reset Password</h1>
                <p className="text-slate-500 dark:text-slate-400 mb-8">
                  Enter your new permanent password below.
                </p>

                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-brand-red/10 border border-brand-red/20 text-brand-red text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleResetPassword} className="space-y-5">
                  {showReauthField && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Temporary Password (sent via email)
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type={showCurrent ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value.replace(/\s/g, ''))}
                          placeholder="••••••••"
                          required
                          disabled={loading}
                          className="input-base pl-10 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrent(!showCurrent)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                          {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showNew ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value.replace(/\s/g, ''))}
                        placeholder="••••••••"
                        required
                        disabled={loading}
                        className="input-base pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {newPassword && (
                      <div className="mt-2">
                        <div className="flex gap-1">
                          {[0, 1, 2, 3].map(i => (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded-full transition-all ${
                                i < strength ? strengthColors[strength - 1] : 'bg-slate-200 dark:bg-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs mt-1 text-slate-500 font-medium">
                          {strength === 4 ? 'Strong' : strength >= 2 ? 'Good' : 'Weak'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value.replace(/\s/g, ''))}
                        placeholder="••••••••"
                        required
                        disabled={loading}
                        className="input-base pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {confirmPassword && (
                      <p className={`text-xs mt-1.5 font-medium flex items-center gap-1 transition-all ${
                        newPassword === confirmPassword ? 'text-brand-green' : 'text-brand-red'
                      }`}>
                        {newPassword === confirmPassword ? (
                          <>
                            <Check className="w-3.5 h-3.5 shrink-0" /> Passwords match
                          </>
                        ) : (
                          "Passwords don't match"
                        )}
                      </p>
                    )}
                  </div>

                  {/* Real-time Requirements check */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${hasMinLength ? 'bg-brand-green text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500'}`}>
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span className={hasMinLength ? 'text-brand-green font-medium' : 'text-slate-500 dark:text-slate-400'}>
                        At least 8 characters
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${hasCapital ? 'bg-brand-green text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500'}`}>
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span className={hasCapital ? 'text-brand-green font-medium' : 'text-slate-500 dark:text-slate-400'}>
                        At least 1 uppercase letter
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${hasNumber ? 'bg-brand-green text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500'}`}>
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span className={hasNumber ? 'text-brand-green font-medium' : 'text-slate-500 dark:text-slate-400'}>
                        At least 1 number
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${hasSpecial ? 'bg-brand-green text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500'}`}>
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span className={hasSpecial ? 'text-brand-green font-medium' : 'text-slate-500 dark:text-slate-400'}>
                        At least 1 special character
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${isMatch ? 'bg-brand-green text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500'}`}>
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span className={isMatch ? 'text-brand-green font-medium' : 'text-slate-500 dark:text-slate-400'}>
                        Passwords match
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${newPassword !== '' && !isSameAsTemp ? 'bg-brand-green text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500'}`}>
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span className={newPassword !== '' && !isSameAsTemp ? 'text-brand-green font-medium' : 'text-slate-500 dark:text-slate-400'}>
                        Different from temporary password
                      </span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    loading={loading}
                    disabled={!isValid}
                    className="w-full"
                  >
                    Reset Password & Continue
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-brand-green/10 text-brand-green rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Password Changed!</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Your permanent password has been successfully configured. Redirecting to your dashboard...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
