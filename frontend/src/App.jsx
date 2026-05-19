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

import { animate, stagger } from 'animejs';
import { Coins, Sparkles, Shield, TrendingUp, DollarSign } from 'lucide-react';

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 1. Initial Scale & Rotate Entrance for Emblem
    animate('.emblem-container', {
      scale: [0, 1],
      rotate: [0, 360],
      duration: 1800,
      ease: 'outElastic',
    });

    // 2. Continuous rotating dashed ring
    animate('.rotating-ring', {
      rotate: '360deg',
      duration: 15000,
      loop: true,
      ease: 'linear',
    });

    // 3. Glowing breathing pulse
    animate('.emblem-glow', {
      opacity: [0.3, 0.85],
      scale: [0.96, 1.04],
      duration: 1600,
      direction: 'alternate',
      loop: true,
      ease: 'inOutQuad',
    });

    // 4. Loading Percentage Counter
    const counterObj = { value: 0 };
    animate(counterObj, {
      value: 100,
      duration: 3200,
      ease: 'inOutQuad',
      onUpdate: () => {
        setProgress(Math.round(counterObj.value));
      },
    });

    // 5. Rise and Fade Golden Floating Money Particles
    animate('.wealth-particle', {
      translateY: [0, -280],
      translateX: function() { return Math.floor(Math.random() * 120) - 60; },
      opacity: [
        { value: 0, duration: 0 },
        { value: 0.8, duration: 400 },
        { value: 0, duration: 2400 }
      ],
      scale: function() { return Math.random() * 0.8 + 0.6; },
      duration: function() { return Math.floor(Math.random() * 1600) + 2600; },
      delay: stagger(180),
      loop: true,
      ease: 'outQuad',
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/12 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-emerald-400/6 rounded-full blur-[140px] pointer-events-none" />

      {/* Floating Golden Money Particles */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="wealth-particle absolute bottom-20 left-1/2 -translate-x-1/2 text-amber-400/60"
            style={{
              left: `${35 + (i * 5)}%`,
            }}
          >
            {i % 3 === 0 ? (
              <DollarSign size={16} />
            ) : i % 3 === 1 ? (
              <Coins size={16} />
            ) : (
              <Sparkles size={14} />
            )}
          </div>
        ))}
      </div>

      {/* Main Container */}
      <div className="flex flex-col items-center z-10 text-center max-w-sm px-6">
        
        {/* Money Themed Glowing Animated Logo */}
        <div className="relative mb-8 emblem-container scale-0">
          {/* Pulsing Outer Glow (animejs animated) */}
          <div className="emblem-glow absolute inset-px rounded-full bg-emerald-400/25 blur-lg" />
          
          {/* Rotating Ring (animejs animated) */}
          <div className="rotating-ring absolute -inset-3.5 rounded-full border-2 border-dashed border-emerald-400/20" />
          
          {/* Main Gold/Emerald Emblem */}
          <div className="relative w-28 h-28 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-400 to-amber-300 p-0.5 shadow-[0_0_60px_rgba(52,211,153,0.35)] flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
              {/* Inner Metallic Coin Icon */}
              <div className="relative flex items-center justify-center text-emerald-400">
                <Coins size={52} className="animate-pulse" style={{ animationDuration: '3s' }} />
                <Sparkles size={18} className="absolute -top-1 -right-1 text-amber-300 animate-bounce" style={{ animationDuration: '2.5s' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Brand Casing */}
        <h1 className="text-3xl font-extrabold tracking-[0.25em] text-white uppercase mb-2">
          Aureon
        </h1>
        <p className="text-[11px] font-bold text-emerald-400 tracking-[0.4em] uppercase mb-8">
          Wealth Workspace
        </p>

        {/* Elegant Animated Progress Bar */}
        <div className="w-56 h-1.5 bg-white/5 rounded-full overflow-hidden mb-4 relative border border-white/5 shadow-inner">
          <div 
            className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-300 rounded-full transition-all duration-75 ease-out shadow-[0_0_12px_rgba(52,211,153,0.5)]" 
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Progress Percentage */}
        <div className="text-lg font-bold text-white tracking-widest mb-6 font-mono">
          <span className="text-emerald-400">{progress}</span>
          <span className="text-slate-500 text-sm ml-1">%</span>
        </div>

        {/* Loading Message */}
        <p className="text-[13px] text-slate-300 font-semibold tracking-wide h-6">
          {progress < 30 ? (
            <span className="flex items-center gap-2 justify-center">
              <Shield size={14} className="text-emerald-400" />
              Initializing secure key vault...
            </span>
          ) : progress < 70 ? (
            <span className="flex items-center gap-2 justify-center">
              <Coins size={14} className="text-amber-400" />
              Decrypting ledger balance...
            </span>
          ) : (
            <span className="flex items-center gap-2 justify-center">
              <TrendingUp size={14} className="text-emerald-300 animate-pulse" />
              Optimizing financial engine...
            </span>
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
