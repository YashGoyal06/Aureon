// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import { App as CapApp } from '@capacitor/app';
import { ToastProvider } from './components/mobile/MobileToast';

import LandingPage from './pages/onboarding/LandingPage';
import SignUpPage from './pages/onboarding/SignupPage'; // Check casing (Signup vs SignUp)
import SecuritySetupPage from './pages/onboarding/SecuritySetupPage';
import FinancialProfilePage from './pages/onboarding/FinancialProfilePage';
import DataImportPage from './pages/onboarding/DataImportPage';
import LoginPage from './pages/auth/LoginPage';
import TwoFactorAuth from './pages/auth/TwoFactorAuth';
import DashboardPage from './pages/DashboardPage';
import BudgetPage from './pages/BudgetPage';
import GoalsPage from './pages/GoalsPage';
import BillsPage from './pages/BillsPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import TransactionsPage from './pages/TransactionsPage';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-[#050608] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Subtle Precision Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff01_1px,transparent_1px),linear-gradient(to_bottom,#ffffff01_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />
      
      {/* Soft Platinum ambient top spotlight reflection */}
      <div className="absolute top-0 inset-x-0 h-[40vh] bg-gradient-to-b from-white/[0.02] via-transparent to-transparent pointer-events-none blur-[100px] z-0" />

      {/* Main Centered Content */}
      <div className="flex flex-col items-center z-10 text-center select-none">
        
        {/* Sleek Minimalist Geometric Logo Element */}
        <div className="relative w-16 h-16 mb-8 flex items-center justify-center">
          <img src="/Aureon_logo.png" alt="Aureon Logo" className="w-full h-full object-contain drop-shadow-2xl" />
        </div>

        {/* Shimmering Metallic Brand Text */}
        <h1 className="text-sm font-light tracking-[0.45em] text-slate-300 uppercase mb-2 animate-shimmer bg-clip-text text-transparent bg-gradient-to-r from-slate-400 via-white to-slate-400 bg-[length:200%_auto]">
          Aureon
        </h1>
        
        {/* Luxury Subtitle */}
        <p className="text-[8px] font-bold text-slate-500 tracking-[0.4em] uppercase mb-8">
          Wealth Intelligence
        </p>

        {/* Sleek, 1px Linear/Vercel-style CSS Loader Bar */}
        <div className="w-36 h-[1.5px] bg-white/5 rounded-full overflow-hidden relative">
          <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-slate-500 to-[#C5A880] rounded-full w-1/3 animate-progress-slide" />
        </div>

        {/* Quiet Luxury Connection Message */}
        <p className="text-[8px] tracking-[0.25em] text-slate-500 uppercase mt-5 animate-pulse-soft">
          Secure Ledger Connection Active
        </p>
      </div>

      {/* Embedded High-Performance CSS Keyframes */}
      <style>{`
        @keyframes progress-slide {
          0% { left: -40%; width: 30%; }
          50% { width: 45%; }
          100% { left: 110%; width: 25%; }
        }
        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: -200% center; }
        }
        @keyframes pulse-soft {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.85; }
        }
        
        .animate-progress-slide {
          animation: progress-slide 2.4s cubic-bezier(0.65, 0, 0.35, 1) infinite;
        }
        .animate-shimmer {
          animation: shimmer 4s linear infinite;
        }
        .animate-pulse-soft {
          animation: pulse-soft 2.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

const isMobile = !!window.Capacitor;

const ProtectedRoute = ({ children, loading, isAuthenticated, isOnboarded }) => {
  if (loading) return isMobile ? null : <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isOnboarded) return <Navigate to="/onboarding/import" replace />;
  return children;
};

const PublicRoute = ({ children, loading, isAuthenticated }) => {
  if (loading) return isMobile ? null : <LoadingScreen />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false); 
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(!!window.Capacitor);

  // Add .is-capacitor class to <html> for mobile-only CSS
  useEffect(() => {
    if (window.Capacitor) {
      document.documentElement.classList.add('is-capacitor');
      // Dismiss splash after 2.2 seconds
      const timer = setTimeout(() => setShowSplash(false), 2200);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    // 0. Listen for deep-link URL events (OAuth redirects back into app)
    let handler;
    if (window.Capacitor) {
      handler = CapApp.addListener('appUrlOpen', async (event) => {
        try {
          const url = new URL(event.url);
          // Catch aureon://login scheme
          if (url.protocol === 'aureon:' && url.host === 'login') {
            // Hash contains Supabase tokens: access_token, refresh_token, etc.
            const hash = url.hash.substring(1);
            const params = new URLSearchParams(hash);
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');

            if (accessToken) {
              setLoading(true);
              const { data, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken || '',
              });

              if (data?.session) {
                setIsAuthenticated(true);
                localStorage.setItem('supabase_token', data.session.access_token);
                try {
                  const res = await fetch(`${API_BASE_URL}/auth/me/`, {
                    headers: {
                      'Authorization': `Bearer ${data.session.access_token}`
                    }
                  });
                  if (res.ok) {
                    const dataRes = await res.json();
                    setIsOnboarded(dataRes.profile?.is_onboarded || false);
                  }
                } catch (e) {
                  console.error("Failed to check onboarding status", e);
                }
              }
              setLoading(false);
            }
          }
        } catch (e) {
          console.error("Failed to parse app deep link URL:", e);
        }
      });
    }

    // 1. Check for existing session on app load
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true);
        localStorage.setItem('supabase_token', session.access_token);
        try {
          const res = await fetch(`${API_BASE_URL}/auth/me/`, {
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            setIsOnboarded(data.profile?.is_onboarded || false);
          }
        } catch (e) {
          console.error("Failed to check onboarding status", e);
        }
      }
      setLoading(false);
    });

    // 2. Listen for auth changes (e.g., Google redirect completion)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        setIsAuthenticated(true);
        localStorage.setItem('supabase_token', session.access_token);
        try {
          const res = await fetch(`${API_BASE_URL}/auth/me/`, {
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            setIsOnboarded(data.profile?.is_onboarded || false);
          }
        } catch (e) {
          console.error("Failed to check onboarding status", e);
        }
      } else {
        setIsAuthenticated(false);
        setIsOnboarded(false);
        localStorage.removeItem('supabase_token');
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      if (handler) {
        handler.then(h => h.remove()).catch(() => {});
      }
    };
  }, []);

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-10 text-white">
        <div className="mx-auto max-w-xl rounded-xl border border-amber-300/20 bg-amber-300/10 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-200">Missing configuration</p>
          <h1 className="mt-3 text-2xl font-semibold">Supabase env variables are not set</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `frontend/.env`, then restart the Vite dev server.
          </p>
        </div>
      </div>
    );
  }

  if (loading && !isMobile) {
    return <LoadingScreen />;
  }

  const protectedProps = { loading, isAuthenticated, isOnboarded };
  const publicProps = { loading, isAuthenticated };

  return (
    <ToastProvider>
      {/* Mobile Splash Screen */}
      {showSplash && (
        <div className="mobile-splash">
          <img src="/Aureon_logo.png" alt="Aureon" className="mobile-splash-logo" />
          <span className="mobile-splash-text">Aureon</span>
          <span className="mobile-splash-sub">Wealth Intelligence</span>
        </div>
      )}

      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicRoute {...publicProps}><LandingPage /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute {...publicProps}><LoginPage setIsAuthenticated={setIsAuthenticated} /></PublicRoute>} />
          
          <Route 
            path="/two-factor" 
            element={
              <TwoFactorAuth 
                setIsAuthenticated={setIsAuthenticated} 
                setIsOnboarded={setIsOnboarded} 
              />
            } 
          />
          
          {/* Onboarding Routes */}
          <Route path="/onboarding" element={<LandingPage />} />
          <Route path="/onboarding/signup" element={<SignUpPage />} />
          <Route path="/onboarding/security" element={<SecuritySetupPage />} />
          <Route path="/onboarding/profile" element={<FinancialProfilePage />} />
          <Route path="/onboarding/import" element={<DataImportPage setIsOnboarded={setIsOnboarded} />} />
          
          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute {...protectedProps}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/budget"
            element={
              <ProtectedRoute {...protectedProps}>
                <BudgetPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/goals"
            element={
              <ProtectedRoute {...protectedProps}>
                <GoalsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bills"
            element={
              <ProtectedRoute {...protectedProps}>
                <BillsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute {...protectedProps}>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route path="/profile" element={<ProtectedRoute {...protectedProps}><ProfilePage /></ProtectedRoute>} />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute {...protectedProps}>
                <TransactionsPage />
              </ProtectedRoute>
            }
          />
          {/* Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
