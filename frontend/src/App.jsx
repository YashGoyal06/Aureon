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

import { animate } from 'animejs';

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 1. Monogram scale & fade entrance
    animate('.monogram-container', {
      scale: [0.95, 1],
      opacity: [0, 1],
      duration: 1200,
      ease: 'outQuart',
    });

    // 2. Razor-thin path drawing vector animations
    animate('.emblem-path-outer', {
      strokeDashoffset: 0,
      duration: 2000,
      ease: 'outCubic',
    });

    animate('.emblem-path-inner', {
      strokeDashoffset: 0,
      duration: 1600,
      delay: 300,
      ease: 'outCubic',
    });

    // 3. Faint precision circle rotators (very slow, thin)
    animate('.precision-dial', {
      rotate: '360deg',
      duration: 25000,
      loop: true,
      ease: 'linear',
    });

    // 4. Subtle ambient opacity breathing
    animate('.monogram-wrapper', {
      opacity: [0.75, 1],
      duration: 2200,
      direction: 'alternate',
      loop: true,
      ease: 'inOutQuad',
    });

    // 5. High-precision percentage counter
    const counterObj = { value: 0 };
    animate(counterObj, {
      value: 100,
      duration: 3500,
      ease: 'inOutCubic',
      onUpdate: () => {
        setProgress(Math.round(counterObj.value));
      },
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#06080C] flex flex-col items-center justify-center relative overflow-hidden">
      {/* 1. Precision Grid Background (Institutional Desk Look) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none z-0" />
      
      {/* 2. Soft Ambient Bottom Lighting Reflection */}
      <div className="absolute bottom-0 inset-x-0 h-[30vh] bg-gradient-to-t from-emerald-500/3 via-transparent to-transparent pointer-events-none blur-[100px] z-0" />

      {/* Main Container */}
      <div className="flex flex-col items-center z-10 text-center max-w-sm px-6">
        
        {/* Monogram Wrapper */}
        <div className="monogram-wrapper mb-8">
          {/* Custom SVG Monogram */}
          <div className="monogram-container relative w-20 h-20 opacity-0 scale-95 flex items-center justify-center">
            
            {/* Spinning Precision Dial (Faint Platinum Circle Frame) */}
            <svg 
              className="precision-dial absolute inset-0 w-full h-full text-white/10" 
              viewBox="0 0 60 60" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="30" cy="30" r="28" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 9" />
            </svg>

            {/* Core Geometric Emblem (Self-Drawing) */}
            <svg 
              className="w-16 h-16" 
              viewBox="0 0 60 60" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Reference Hairlines */}
              <line x1="0" y1="30" x2="60" y2="30" stroke="white" strokeOpacity="0.03" strokeWidth="0.75" />
              <line x1="30" y1="0" x2="30" y2="60" stroke="white" strokeOpacity="0.03" strokeWidth="0.75" />

              {/* Outer Triangle (Platinum/Slate-100) */}
              <path 
                d="M30 14L46 44H14L30 14Z" 
                stroke="#E2E8F0" 
                strokeWidth="1.25" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="emblem-path-outer"
                style={{ strokeDasharray: 120, strokeDashoffset: 120 }}
              />
              {/* Inner Upward wealth chevron (Champagne Gold) */}
              <path 
                d="M22 36L30 22L38 36" 
                stroke="#C5A880" 
                strokeWidth="1.25" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="emblem-path-inner"
                style={{ strokeDasharray: 50, strokeDashoffset: 50 }}
              />
            </svg>
          </div>
        </div>

        {/* Text Header (Quiet Luxury Typographics) */}
        <h1 className="text-xl font-light tracking-[0.35em] text-white uppercase mb-1">
          Aureon
        </h1>
        <p className="text-[9px] font-semibold text-slate-500 tracking-[0.45em] uppercase mb-10">
          Institutional Wealth
        </p>

        {/* Precision Progress Status Bar */}
        <div className="w-64 flex justify-between items-center text-[9px] tracking-[0.25em] uppercase text-slate-500 font-semibold mb-2.5">
          <span>SYSTEM INTEGRITY</span>
          <span className="font-mono text-slate-400 font-bold">{progress}%</span>
        </div>

        {/* Single-Pixel Matte Timeline Bar */}
        <div className="w-64 h-[1px] bg-white/10 rounded-full overflow-hidden relative">
          <div 
            className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-slate-400 to-[#C5A880] transition-all duration-75 ease-out" 
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Quiet Luxury Terminal Output Message */}
        <p className="text-[9px] tracking-[0.2em] text-[#C5A880]/80 uppercase mt-3 h-4 font-medium transition-all duration-300">
          {progress < 35 ? (
            '// ESTABLISHING SECURE HANDSHAKE'
          ) : progress < 75 ? (
            '// SYNCHRONIZING LEDGER BALANCES'
          ) : (
            '// WEALTH INTERFACE VAULT OPERATIONAL'
          )}
        </p>
      </div>
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
