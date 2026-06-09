import React, { useEffect } from 'react';
import { CssBaseline } from '@mui/material'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ProtectedRoute } from './routes/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminRegisterPage from './pages/AdminRegisterPage';
import VendorRegisterPage from './pages/VendorRegisterPage';
import VendorLanding from './pages/VendorLanding';
import PersonnelLanding from './pages/PersonnelLanding';
import EmailVerificationPage from './pages/EmailVerificationPage';
import NotFoundPage from './pages/NotFoundPage';
import AdminDashboard from './adminpage/AdminDashboard';
import CustomerApp from './customerpage/CustomerApp';
import VendorDashboard from './vendorpage/VendorDashboard';
import PersonnelDashboard from './personnelpage/PersonnelDashboard';
import AboutUsPage from './footerlinks/AboutUsPage';
import PrivacyPage from './footerlinks/PrivacyPage';
import TermsOfUse from './footerlinks/TermsOfUse';
import ServicesPages from './pages/Servicespages';
import ResetPasswordPage from './pages/ResetPasswordPage';


export function App() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Redirect to main dashboard/home upon hard refresh
    const path = location.pathname;
    if (path.startsWith('/admin/')) {
      navigate('/admin', { replace: true });
    } else if (path.startsWith('/customer/')) {
      navigate('/customer', { replace: true });
    } else if (path.startsWith('/vendor/')) {
      navigate('/vendor', { replace: true });
    } else if (path.startsWith('/personnel/')) {
      navigate('/personnel', { replace: true });
    }
  }, []); // Only runs on initial mount

  return (
    <>
      <CssBaseline />
      <Routes>
        {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/register-admin" element={<AdminRegisterPage />} />
      <Route path="/register-vendor" element={<VendorRegisterPage />} />
      <Route path="/vendor-apply" element={<VendorLanding />} />
      <Route path="/personnel-apply" element={<PersonnelLanding />} />
      <Route path="/verify-email" element={<EmailVerificationPage />} />
      <Route path="/about" element={<AboutUsPage />} /> 
      <Route path="/privacy" element={<PrivacyPage />} /> 
      <Route path="/terms-of-use" element={<TermsOfUse />} /> 
      <Route path="/services" element={<ServicesPages />} /> 
      <Route path="/services/:serviceId" element={<ServicesPages />} /> 

      {/* Protected routes */}
      <Route
        path="/reset-password"
        element={
          <ProtectedRoute allowedRoles={['admin', 'vendor', 'personnel', 'customer']}>
            <ResetPasswordPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/*"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerApp />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor/*"
        element={
          <ProtectedRoute allowedRoles={['vendor']}>
            <VendorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/personnel/*"
        element={
          <ProtectedRoute allowedRoles={['personnel']}>
            <PersonnelDashboard />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
