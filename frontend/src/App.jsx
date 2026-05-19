// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { isSupabaseConfigured, supabase } from './lib/supabase'; // Import your supabase client

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
        <div className="relative w-12 h-12 mb-8 flex items-center justify-center">
          {/* Subtle concentric frame */}
          <div className="absolute inset-0 rounded-full border border-white/5" />
          {/* Active gold/platinum geometric cross vector */}
          <div className="w-4 h-4 relative">
            {/* Horizontal line segment */}
            <div className="absolute top-1/2 left-0 right-0 h-[1.5px] -translate-y-1/2 bg-gradient-to-r from-slate-400 to-[#C5A880] rounded-full animate-vector-h" />
            {/* Vertical line segment */}
            <div className="absolute left-1/2 top-0 bottom-0 w-[1.5px] -translate-x-1/2 bg-gradient-to-b from-slate-400 to-[#C5A880] rounded-full animate-vector-v" />
          </div>
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
        @keyframes vector-h {
          0%, 100% { transform: scaleX(0.7) translateY(-50%); }
          50% { transform: scaleX(1.3) translateY(-50%); }
        }
        @keyframes vector-v {
          0%, 100% { transform: scaleY(0.7) translateX(-50%); }
          50% { transform: scaleY(1.3) translateX(-50%); }
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
        .animate-vector-h {
          animation: vector-h 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .animate-vector-v {
          animation: vector-v 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
};

const ProtectedRoute = ({ children, loading, isAuthenticated, isOnboarded }) => {
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isOnboarded) return <Navigate to="/onboarding/import" replace />;
  return children;
};

const PublicRoute = ({ children, loading, isAuthenticated }) => {
  if (loading) return <LoadingScreen />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    return () => subscription.unsubscribe();
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

  if (loading) {
    return <LoadingScreen />;
  }

  const protectedProps = { loading, isAuthenticated, isOnboarded };
  const publicProps = { loading, isAuthenticated };

  return (
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
  );
}

export default App;
