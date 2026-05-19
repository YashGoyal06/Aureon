// src/components/dashboard/FinancialSnapshot.jsx
import React, { useState, useEffect } from 'react';
import { TrendingUp, Wallet, CreditCard, Target, Loader2 } from 'lucide-react';
import { apiFetch } from '../../lib/api';

const FinancialSnapshot = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiFetch('/auth/profile/');
        setProfile(data.profile);
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="mb-8 bg-black/40 backdrop-blur-xl rounded-2xl p-6 flex justify-center items-center h-48 border border-white/10">
        <Loader2 className="animate-spin text-emerald-500" size={40} />
      </div>
    );
  }

  const p = profile || {
    cash_available: 0,
    invested_amount: 0,
    credit_used: 0,
    credit_limit: 0,
    net_worth: 0
  };
  const stats = [
    {
      icon: Wallet,
      label: 'Cash Available',
      value: `₹${parseFloat(p.cash_available || 0).toLocaleString()}`,
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-600'
    },
    {
      icon: TrendingUp,
      label: 'Invested',
      value: `₹${parseFloat(p.invested_amount || 0).toLocaleString()}`,
      color: 'green',
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      icon: CreditCard,
      label: 'Credit Used',
      value: `₹${parseFloat(p.credit_used || 0).toLocaleString()}/₹${parseFloat(p.credit_limit || 0).toLocaleString()}`,
      color: 'purple',
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      icon: Target,
      label: 'Savings Goal',
      value: `Pending setup`,
      color: 'orange',
      gradient: 'from-orange-500 to-red-600'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      orange: 'bg-orange-500/10 text-orange-400 border-orange-500/30'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="mb-8">
      <div className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl p-6 mb-6 border border-white/10 hover:border-emerald-500/30 transition-all duration-300">
        <h2 className="text-lg font-semibold text-white mb-4">Financial Snapshot</h2>
        
        {/* Net Worth Card */}
        <div className="bg-gradient-to-r from-emerald-900 to-teal-950 rounded-2xl p-6 text-white mb-6 shadow-2xl border border-emerald-400/20 hover:shadow-emerald-500/30 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Net Worth</span>
            <TrendingUp size={20} />
          </div>
          <div className="text-4xl font-bold mb-2">
            ₹{parseFloat(p.net_worth || 0).toLocaleString()}
          </div>
          {/* Monthly change line removed */}
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                <div className={`w-10 h-10 rounded-lg ${getColorClasses(stat.color)} border flex items-center justify-center mb-3`}>
                  <Icon size={20} />
                </div>
                <div className="text-xs text-gray-400 mb-1">{stat.label}</div>
                <div className="text-sm font-semibold text-white">{stat.value}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FinancialSnapshot;