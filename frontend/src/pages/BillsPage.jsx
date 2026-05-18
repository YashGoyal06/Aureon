// src/pages/BillsPage.jsx
import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import { supabase } from '../lib/supabase';
import { CheckCircle, AlertCircle, XCircle, Calendar, Loader2 } from 'lucide-react';
import { apiFetch } from '../lib/api';

const BillsPage = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const data = await apiFetch('/finance/subscriptions/');
        setSubscriptions(data);
      } catch (err) {
        console.error("Failed to fetch subscriptions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscriptions();

    const fetchUserData = async () => {
      try {
        const { data: { user: sessionUser } } = await supabase.auth.getUser();
        if (sessionUser) {
          const displayName = sessionUser.user_metadata?.full_name || sessionUser.email?.split('@')[0] || 'User';
          const photoURL = sessionUser.user_metadata?.avatar_url || sessionUser.user_metadata?.picture;
          setUser({
            name: displayName,
            email: sessionUser.email,
            avatar: photoURL
          });
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUserData();
  }, []);

  const totalDue = subscriptions.reduce((sum, bill) => sum + parseFloat(bill.amount), 0);
  const unusedSubscriptions = subscriptions.filter(sub => sub.status === 'unused');
  const potentialSavings = unusedSubscriptions.reduce((sum, sub) => sum + parseFloat(sub.potential_saving), 0);

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
        <Header user={user} />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
          <h1 className="text-4xl font-bold text-white mb-8">
            Bills & Subscriptions
          </h1>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/10 hover:border-emerald-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-300">Total Due (Next 30 Days)</p>
                <Calendar size={24} className="text-emerald-400" />
              </div>
              <p className="text-4xl font-bold text-white">
                ₹{totalDue.toFixed(2)}
              </p>
            </div>

            <div className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/10 hover:border-emerald-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-300">Active Subscriptions</p>
                <CheckCircle size={24} className="text-teal-400" />
              </div>
              <p className="text-4xl font-bold text-white">{subscriptions.filter(s => s.status === 'active').length}</p>
            </div>

            <div className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-orange-300">Potential Savings</p>
                <AlertCircle size={24} className="text-orange-400" />
              </div>
              <p className="text-4xl font-bold text-orange-400">₹{potentialSavings}/year</p>
            </div>
          </div>

          {/* Upcoming Bills */}
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl p-6 mb-8 border border-white/10">
            <h2 className="text-2xl font-semibold text-white mb-6">Upcoming Bills</h2>
            
            <div className="space-y-3">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="animate-spin text-emerald-400" size={32} />
                </div>
              ) : subscriptions.length === 0 ? (
                <div className="text-center text-gray-400 py-8">No subscriptions found.</div>
              ) : (
                subscriptions.map((bill) => (
                <div key={bill.id} className="flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-300 backdrop-blur-sm">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-full flex items-center justify-center border border-emerald-500/30">
                      <span className="text-3xl">
                        🎬
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-lg">{bill.name}</h3>
                      <div className="flex items-center space-x-3 text-sm text-gray-400">
                        <span>Due: {bill.renewal_date || 'N/A'}</span>
                        <span>•</span>
                        <span>Usage: {bill.usage_level}</span>
                        {bill.autoPay && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-400 flex items-center space-x-1">
                              <CheckCircle size={14} />
                              <span>Auto-pay</span>
                            </span>
                          </>
                        )}
                        {bill.predicted && (
                          <>
                            <span>•</span>
                            <span className="text-blue-400">Predicted</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-white">₹{parseFloat(bill.amount).toFixed(2)}</p>
                    <button className="text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                      Manage
                    </button>
                  </div>
                </div>
              )))}
            </div>
          </div>

          {/* Subscription Analyzer */}
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl p-6 mb-8 border border-white/10">
            <h2 className="text-2xl font-semibold text-white mb-4">AI Subscription Analyzer</h2>
            <p className="text-gray-300 mb-6">I found opportunities to save money!</p>

            {unusedSubscriptions.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 mb-6 backdrop-blur-sm">
                <div className="flex items-start space-x-3">
                  <XCircle size={28} className="text-red-400 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-300 mb-2 text-lg">Unused Subscriptions Detected</h3>
                    <p className="text-sm text-red-200">
                      Cancel these to save ₹{potentialSavings}/year
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {subscriptions.map((subscription) => {
                const isUnused = subscription.status === 'unused';
                
                return (
                  <div
                    key={subscription.id}
                    className={`border-2 rounded-xl p-5 backdrop-blur-sm transition-all duration-300 ${
                      isUnused ? 'border-red-500/40 bg-red-500/5 hover:bg-red-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white text-lg mb-3">{subscription.name}</h3>
                        <div className="mt-2 space-y-2 text-sm">
                          <p className="text-gray-300">Amount: ₹{parseFloat(subscription.amount).toFixed(2)}/month</p>
                          <p className="text-gray-300">Renewal: {subscription.renewal_date}</p>
                          <p className="text-gray-300">Usage: {subscription.usage_level}</p>
                          {subscription.last_used_date && (
                            <p className="text-red-400 font-medium">Last used: {subscription.last_used_date}</p>
                          )}
                          {subscription.warning && (
                            <p className="text-orange-400 font-medium">{subscription.warning}</p>
                          )}
                        </div>
                        {isUnused && (
                          <div className="mt-4">
                            <p className="text-sm font-semibold text-red-300 mb-3">
                              Potential saving: ₹{subscription.potential_saving}/year
                            </p>
                            <button className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:shadow-lg hover:shadow-red-500/50 transition-all duration-300 text-sm font-medium border border-red-400/30">
                              Cancel Subscription
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end space-y-3 ml-4">
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-xl ${
                                  i < subscription.value_score ? 'text-yellow-400' : 'text-gray-600'
                                }`}
                              >
                              ⭐
                            </span>
                          ))}
                        </div>
                        <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                          isUnused ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {subscription.status === 'active' ? 'Active' : 'Unused'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BillsPage;