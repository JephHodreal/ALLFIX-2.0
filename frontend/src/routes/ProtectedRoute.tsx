import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '../context/AuthContext';
import { ROUTES } from './paths';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, role, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-light dark:bg-surface-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-navy border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated → go to landing page
  if (!user || !isAuthenticated) {
    return <Navigate to={ROUTES.home} state={{ from: location }} replace />;
  }

  // Email not verified → go to verification
  if (!user.emailVerified) {
    return <Navigate to={ROUTES.verifyEmail} replace />;
  }

  // Temporary password reset required -> force redirect to /reset-password
  if (profile?.requires_password_reset && location.pathname !== '/reset-password') {
    return <Navigate to="/reset-password" replace />;
  }

  // Access reset-password page only when required
  if (!profile?.requires_password_reset && location.pathname === '/reset-password') {
    const roleRoutes: Record<UserRole, string> = {
      admin: '/admin/services',
      customer: '/customer',
      vendor: '/vendor/services',
      personnel: ROUTES.personnel,
    };
    return <Navigate to={roleRoutes[role || 'customer']} replace />;
  }

  // Wrong role → redirect to their correct dashboard
  if (role && !allowedRoles.includes(role)) {
    const roleRoutes: Record<UserRole, string> = {
      admin: '/admin/services',
      customer: '/customer',
      vendor: '/vendor/services',
      personnel: ROUTES.personnel,
    };
    return <Navigate to={roleRoutes[role]} replace />;
  }

  return <>{children}</>;
}
