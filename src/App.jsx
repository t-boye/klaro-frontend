import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { isLoggedIn } from './lib/auth';
import { isAdminLoggedIn } from './lib/adminAuth';
import { initTheme } from './lib/theme';
import { getPreviewInfo } from './components/PreviewBanner';
import { useInactivityLogout } from './hooks/useInactivityLogout';

import { LangProvider } from './context/LangContext';

import SplashScreen    from './components/SplashScreen';
import CookieBanner    from './components/CookieBanner';
import PreviewBanner   from './components/PreviewBanner';
import Landing         from './pages/Landing';
import Auth            from './pages/Auth';
import ResetPassword   from './pages/ResetPassword';
import Onboarding      from './pages/Onboarding';
import Dashboard       from './pages/Dashboard';
import Upload          from './pages/Upload';
import Analysis        from './pages/Analysis';
import SharedAnalysis  from './pages/SharedAnalysis';
import Payment         from './pages/Payment';
import Profile         from './pages/Profile';
import Lawyers         from './pages/Lawyers';
import LegalLibrary    from './pages/LegalLibrary';
import LegalChat       from './pages/LegalChat';
import Templates       from './pages/Templates';
import PrivacyPolicy   from './pages/PrivacyPolicy';
import Terms           from './pages/Terms';
import About           from './pages/About';
import AdminLogin      from './pages/AdminLogin';
import AdminDashboard  from './pages/AdminDashboard';
import NotFound        from './pages/NotFound';

// Inactivity guard — only mounts inside BrowserRouter so useNavigate works
const PUBLIC_PATHS = new Set(['/', '/auth', '/reset-password', '/privacy', '/terms', '/klaro-hub', '/klaro-hub/dashboard']);

function InactivityGuard() {
  const location = useLocation();
  const active   = isLoggedIn() && !PUBLIC_PATHS.has(location.pathname) && !location.pathname.startsWith('/shared/');
  useInactivityLogout(active);
  return null;
}

function PrivateRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/auth" replace />;
}

function OnboardingRoute({ children }) {
  if (!isLoggedIn()) return <Navigate to="/auth" replace />;
  return children;
}

function AdminRoute({ children }) {
  return isAdminLoggedIn() ? children : <Navigate to="/admin/login" replace />;
}

export default function App() {
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    initTheme();
  }, []);

  return (
    <LangProvider>
    <>
      {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}

      <div className={`transition-opacity duration-300 ${splashDone ? 'opacity-100' : 'opacity-0'}`}>
        <BrowserRouter>
          <InactivityGuard />
          <PreviewBanner />
          {getPreviewInfo() && <div className="h-10" />}
          <CookieBanner />
          <Routes>
            <Route path="/"                 element={<Landing />} />
            <Route path="/auth"             element={<Auth />} />
            <Route path="/reset-password"   element={<ResetPassword />} />
            <Route path="/privacy"          element={<PrivacyPolicy />} />
            <Route path="/terms"            element={<Terms />} />
            <Route path="/about"            element={<About />} />
            <Route path="/shared/:token"    element={<SharedAnalysis />} />
            <Route path="/onboarding"       element={<OnboardingRoute><Onboarding /></OnboardingRoute>} />
            <Route path="/dashboard"        element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/upload"           element={<PrivateRoute><Upload /></PrivateRoute>} />
            <Route path="/analysis/:id"     element={<PrivateRoute><Analysis /></PrivateRoute>} />
            <Route path="/payment/callback" element={<PrivateRoute><Payment /></PrivateRoute>} />
            <Route path="/profile"          element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/lawyers"          element={<PrivateRoute><Lawyers /></PrivateRoute>} />
            <Route path="/library"          element={<PrivateRoute><LegalLibrary /></PrivateRoute>} />
            <Route path="/chat"             element={<PrivateRoute><LegalChat /></PrivateRoute>} />
            <Route path="/templates"        element={<PrivateRoute><Templates /></PrivateRoute>} />
            <Route path="/admin"             element={<Navigate to="/klaro-hub" replace />} />
            <Route path="/klaro-hub"        element={<AdminLogin />} />
            <Route path="/klaro-hub/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="*"                 element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </div>
    </>
    </LangProvider>
  );
}
