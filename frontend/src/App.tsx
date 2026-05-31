import React from 'react';
import { CssBaseline } from '@mui/material'
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './routes/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminRegisterPage from './pages/AdminRegisterPage';
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
  return (
    <>
      <CssBaseline />
      <Routes>
        {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/register-admin" element={<AdminRegisterPage />} />
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
