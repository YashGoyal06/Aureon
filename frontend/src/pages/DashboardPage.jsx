// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import FinancialSnapshot from '../components/dashboard/FinancialSnapshot';
import AIInsights from '../components/dashboard/AllInsights';
import SpendingChart from '../components/dashboard/SpendingChart';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import UpcomingBills from '../components/dashboard/UpcomingBills';
import ActiveGoals from '../components/dashboard/ActiveGoals';
import AddTransactionModal from '../components/transactions/AddTransactionModal';
import { Loader, Plus } from 'lucide-react';

const DashboardPage = () => {
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGuide, setShowGuide] = useState(() => {
    return !localStorage.getItem('aureon_guide_dismissed');
  });

  const dismissGuide = () => {
    localStorage.setItem('aureon_guide_dismissed', 'true');
    setShowGuide(false);
  };

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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 animate-fade-in">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                Welcome back, <span className="text-emerald-400">{firstName}</span>!
              </h1>
              <p className="text-gray-300 mt-1">Today is {lastLogin}</p>
            </div>
            <button
              onClick={() => setShowAddTransaction(true)}
              className="py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl font-medium transition-all duration-300 shadow-lg shadow-emerald-500/20 flex items-center space-x-2 border border-emerald-500/20"
            >
              <Plus size={18} />
              <span>Add Spending</span>
            </button>
          </div>

          {/* Quick Guide Banner */}
          {showGuide && (
            <div className="bg-gradient-to-r from-emerald-500/10 via-teal-600/10 to-cyan-500/10 border border-emerald-500/30 backdrop-blur-xl rounded-2xl p-6 mb-8 relative overflow-hidden animate-fade-in hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300">
              {/* Decorative background blur blobs */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl -ml-10 -mb-10"></div>
              
              <div className="flex justify-between items-start gap-4 relative z-10">
                <div className="flex-1">
                  <span className="inline-flex items-center px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">
                    🚀 App Quick Guide (User Flow)
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                    Aureon ko use karna bahut aasan hai!
                  </h2>
                  <p className="text-gray-300 text-sm max-w-3xl mb-6">
                    Aureon aapke finances ko automatic track karta hai aur intelligent tips deta hai.
                    Pura system check karne ke liye niche diye gaye 3 aasan steps follow karein:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3">
                        <span className="font-bold text-emerald-400">1</span>
                      </div>
                      <h3 className="font-semibold text-white mb-1">Set Limits (Budget)</h3>
                      <p className="text-xs text-gray-400">
                        Pehle <Link to="/budget" className="text-emerald-400 hover:underline font-medium">Budget</Link> page par jaakar Food & Dining, Groceries aadi ki monthly limits set karein.
                      </p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3">
                        <span className="font-bold text-emerald-400">2</span>
                      </div>
                      <h3 className="font-semibold text-white mb-1">Add Spending</h3>
                      <p className="text-xs text-gray-400">
                        Jab bhi koi kharcha ho, upar diye gaye <span className="text-emerald-400 font-medium">Add Spending</span> button se daalyein. Yeh automatic budget ko update kar dega!
                      </p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3">
                        <span className="font-bold text-emerald-400">3</span>
                      </div>
                      <h3 className="font-semibold text-white mb-1">Ask AI Assistant</h3>
                      <p className="text-xs text-gray-400">
                        Koi bhi doubt ho ya custom insight chahiye, <Link to="/chat" className="text-emerald-400 hover:underline font-medium">AI Chat</Link> par jaakar financial advice lein!
                      </p>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={dismissGuide}
                  className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors duration-300 flex-shrink-0"
                  title="Dismiss Guide"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

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
        
        {showAddTransaction && (
          <AddTransactionModal onClose={() => {
            setShowAddTransaction(false);
            window.location.reload();
          }} />
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