// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Header from '../components/common/Header';
import FinancialSnapshot from '../components/dashboard/FinancialSnapshot';
import AIInsights from '../components/dashboard/AllInsights';
import SpendingChart from '../components/dashboard/SpendingChart';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import UpcomingBills from '../components/dashboard/UpcomingBills';
import ActiveGoals from '../components/dashboard/ActiveGoals';
import AddTransactionModal from '../components/transactions/AddTransactionModal';
import { Plus, Loader } from 'lucide-react';

const DashboardPage = () => {
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch User Data on Mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // 2. Extract Display Name & Avatar (Google or Email fallback)
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const firstName = displayName.split(' ')[0];
  const photoURL = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const lastLogin = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  // 3. Prepare User Object for Header
  const headerUser = {
    name: displayName,
    email: user?.email,
    avatar: photoURL
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader className="animate-spin text-emerald-500" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url("/dashboard-bg.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      ></div>

      <div className="relative z-10">
        {/* Pass real user data to Header */}
        <Header user={headerUser} />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-16">
          {/* Welcome Section */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Welcome back, <span className="text-emerald-400">{firstName}</span>!
            </h1>
            <p className="text-gray-300 mt-1">Today is {lastLogin}</p>
          </div>

          {/* Financial Snapshot */}
          <FinancialSnapshot />

          {/* Row 1: AI Insights and Recent Transactions side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="w-full">
              <AIInsights />
            </div>
            <div className="w-full">
              <RecentTransactions />
            </div>
          </div>

          {/* Row 2: Upcoming Bills and Active Goals side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="w-full">
              <UpcomingBills />
            </div>
            <div className="w-full">
              <ActiveGoals />
            </div>
          </div>

          {/* Row 3: Spending Chart (This Month Overview) */}
          <SpendingChart />
        </main>

        {/* Floating Add Button */}
        <button
          onClick={() => setShowAddTransaction(true)}
          className="fixed bottom-8 right-8 bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 rounded-full shadow-2xl hover:shadow-emerald-500/50 hover:scale-110 transition-all duration-300 z-40 border border-emerald-400/20"
        >
          <Plus size={28} />
        </button>

        {/* Add Transaction Modal */}
        {showAddTransaction && (
          <AddTransactionModal onClose={() => setShowAddTransaction(false)} />
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;