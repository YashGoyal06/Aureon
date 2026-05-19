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

const LoadingScreen = () => (
  <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>
);

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
