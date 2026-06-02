import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, RefreshCw, CheckCircle } from 'lucide-react';
import { resendVerificationEmail, checkEmailVerified, getCurrentUser, verifyEmail } from '../services/firebaseService';
import api from '../services/apiService';
import { ROUTES } from '../routes/paths';

export default function EmailVerificationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = getCurrentUser();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const actionMode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');

  const [pending] = useState<{ sentAt: number; profile: Record<string, unknown> } | null>(() => {
    try {
      const raw = localStorage.getItem('pendingRegistration');
      return raw ? JSON.parse(raw) as { sentAt: number; profile: Record<string, unknown> } : null;
    } catch {
      return null;
    }
  });

  const [expiresInSec, setExpiresInSec] = useState(() => {
    if (!pending?.sentAt) return 0;
    const leftMs = pending.sentAt + 120_000 - Date.now();
    return Math.max(0, Math.ceil(leftMs / 1000));
  });

  // Single interval that ticks both expiresInSec and cooldown every second
  useEffect(() => {
    if (expiresInSec <= 0 && cooldown <= 0) return;
    const t = setInterval(() => {
      setExpiresInSec(prev => Math.max(0, prev - 1));
      setCooldown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [expiresInSec > 0 || cooldown > 0]);

  // If the user opened the Firebase email link, it will include mode/oobCode.
  // Apply the action code automatically and finalize registration.
  useEffect(() => {
    const run = async () => {
      if (actionMode !== 'verifyEmail' || !oobCode) return;
      setLoading(true);
      setError('');
      try {
        await verifyEmail(oobCode);
        
        const pendingRaw = localStorage.getItem('pendingRegistration');
        let nextRoute: string = ROUTES.login;
        if (pendingRaw) {
           const parsed = JSON.parse(pendingRaw) as { profile: any };
           if (parsed.profile?.role === 'admin') nextRoute = ROUTES.admin;
        }

        // After applying the code, immediately try to finalize (store profile + set claims).
        const ok = await finalizeIfVerified();
        if (ok) {
          // Ensure token/claims refresh after backend sets custom claims.
          await getCurrentUser()?.getIdToken(true);
          setVerified(true);
          setTimeout(() => navigate(nextRoute), 2000);
        }
      } catch (e: any) {
        setError(e?.message || 'Verification link is invalid or expired. Please resend a new link.');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [actionMode, oobCode]);

  const finalizeIfVerified = async () => {
    const isVerified = await checkEmailVerified();
    if (!isVerified) return false;

    // Finalize: store profile in backend/Firestore and set role claim.
    const pendingRaw = localStorage.getItem('pendingRegistration');
    if (!pendingRaw) return true;
    const parsed = JSON.parse(pendingRaw) as { profile: any };
    
    if (parsed.profile.inviteCode && parsed.profile.role === 'admin') {
      await api.post('/api/auth/register-admin', parsed.profile);
    } else {
      await api.post('/api/auth/register', parsed.profile);
    }
    
    localStorage.removeItem('pendingRegistration');
    return true;
  };

  // No "Verify Email" button — Firebase handles verification via the email link.
  // We just poll for verification to finalize registration once the user clicks the email link.
  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      if (cancelled || verified) return;
      try {
        const pendingRaw = localStorage.getItem('pendingRegistration');
        let nextRoute: string = ROUTES.login;
        if (pendingRaw) {
           const parsed = JSON.parse(pendingRaw) as { profile: any };
           if (parsed.profile?.role === 'admin') nextRoute = ROUTES.admin;
        }

        const ok = await finalizeIfVerified();
        if (ok) {
          await getCurrentUser()?.getIdToken(true);
          setVerified(true);
          setTimeout(() => navigate(nextRoute), 2000);
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || err.message || 'Verification failed.');
      }
    };
    const interval = setInterval(tick, 2500);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [verified]);

  const handleResend = async () => {
    setResending(true); setError('');
    try {
      await resendVerificationEmail();
      localStorage.setItem(
        'pendingRegistration',
        JSON.stringify({ sentAt: Date.now(), profile: pending?.profile || {} })
      );
      setCooldown(120);
      setExpiresInSec(120);
    } catch (err: any) {
      setError(err.message || 'Failed to resend.');
    } finally {
      setResending(false);
    }
  };

  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-light dark:bg-surface-dark">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="w-20 h-20 rounded-full bg-brand-green/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-brand-green" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Email Verified!</h2>
          <p className="text-slate-500">Redirecting to login...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-light dark:bg-surface-dark p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8">
          <img src="/ALLFIXLOGO.png" alt="AllFix Logo" className="w-8 h-8 object-contain" />
          <span className="text-xl font-bold text-brand-navy dark:text-white">AllFix<span className="text-brand-green">.ph</span></span>
        </div>

        <div className="w-16 h-16 rounded-2xl bg-brand-navy/10 dark:bg-brand-green/10 flex items-center justify-center mb-6">
          <Mail className="w-8 h-8 text-brand-navy dark:text-brand-green" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Check your email</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-1">We sent a verification link to:</p>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-6">{user?.email || 'your email'}</p>

        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
          Verification link sent. For this app flow, we treat the link as expiring in <span className="font-semibold">{expiresInSec || 120}s</span>.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Your account profile will be saved only after your email is verified.
        </p>

        {error && <div className="mb-4 p-3 rounded-xl bg-brand-red/10 border border-brand-red/20 text-brand-red text-sm">{error}</div>}

        <div className="flex items-center justify-center gap-2">
          <button
            onClick={handleResend}
            // Only allow resend once our 2-minute "expiry window" has passed.
            disabled={resending || (expiresInSec > 0) || cooldown > 0}
            className="text-sm text-brand-navy dark:text-brand-green font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">
            <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
            {(expiresInSec > 0 || cooldown > 0) ? `Resend in ${Math.max(expiresInSec, cooldown)}s` : 'Resend Link'}
          </button>
        </div>

        <div className="mt-8 text-center">
          <Link to={ROUTES.register} className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center justify-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Register
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
