// src/pages/onboarding/FinancialProfilePage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, DollarSign, Target, TrendingUp } from 'lucide-react';
import { apiFetch } from '../../lib/api';

const FinancialProfilePage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState({
    age: '',
    employment: '',
    monthlyIncome: 3200,
    goals: [],
    savings: '',
    monthlyExpenses: '',
    debts: '',
    riskTolerance: 'moderate',
    currency: 'INR',
    budgetPeriod: 'monthly'
  });

  const goals = [
    'Track daily spending',
    'Create and stick to budgets',
    'Save for specific goals',
    'Invest wisely',
    'Pay off debt',
    'Reduce unnecessary expenses'
  ];

  const toggleGoal = (goal) => {
    if (profileData.goals.includes(goal)) {
      setProfileData({
        ...profileData,
        goals: profileData.goals.filter(g => g !== goal)
      });
    } else {
      setProfileData({
        ...profileData,
        goals: [...profileData.goals, goal]
      });
    }
  };

  const handleNext = async () => {
    try {
      const cash = parseFloat(profileData.savings) || 0;
      const debt = parseFloat(profileData.debts) || 0;
      await apiFetch('/auth/profile/', {
        method: 'PATCH',
        body: JSON.stringify({
          cash_available: cash,
          credit_used: debt,
          net_worth: cash - debt
        })
      });
    } catch (e) {
      console.error("Failed to save profile", e);
    }
    navigate('/onboarding/import');
  };

  return (
    <div className="min-h-screen relative py-8 px-4">
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-0 animate-[fadeIn_0.8s_ease-out]"
        style={{
          backgroundImage: 'url("/common-bg.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      ></div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Progress */}
        {/* Progress bar removed */}

        <div className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/10 animate-[slideUp_0.8s_ease-out]">
          <div>
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-[scaleIn_0.6s_ease-out] hover:scale-110 transition-transform duration-300">
                <DollarSign size={32} className="text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-3 animate-[fadeInDown_0.8s_ease-out_0.2s_both]">
                Current Finances
              </h1>
              <p className="text-gray-400 animate-[fadeInDown_0.8s_ease-out_0.3s_both]">Help us understand your situation</p>
            </div>

            <div className="space-y-6">
              <div className="animate-[slideInRight_0.6s_ease-out_0.4s_both]">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Total Savings
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">₹</span>
                  <input
                    type="number"
                    value={profileData.savings}
                    onChange={(e) => setProfileData({ ...profileData, savings: e.target.value })}
                    placeholder="8,500"
                    className="w-full pl-10 pr-4 py-4 bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all duration-300 backdrop-blur-sm hover:bg-white/10 focus:scale-[1.02]"
                  />
                </div>
              </div>

              <div className="animate-[slideInRight_0.6s_ease-out_0.5s_both]">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Monthly Expenses (estimate)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">₹</span>
                  <input
                    type="number"
                    value={profileData.monthlyExpenses}
                    onChange={(e) => setProfileData({ ...profileData, monthlyExpenses: e.target.value })}
                    placeholder="2,400"
                    className="w-full pl-10 pr-4 py-4 bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all duration-300 backdrop-blur-sm hover:bg-white/10 focus:scale-[1.02]"
                  />
                </div>
              </div>

              <div className="animate-[slideInRight_0.6s_ease-out_0.6s_both]">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Debts (if any)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">₹</span>
                  <input
                    type="number"
                    value={profileData.debts}
                    onChange={(e) => setProfileData({ ...profileData, debts: e.target.value })}
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-4 bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all duration-300 backdrop-blur-sm hover:bg-white/10 focus:scale-[1.02]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex space-x-4 mt-8 animate-[slideUp_0.6s_ease-out_0.8s_both]">
            <button
              onClick={handleNext}
              className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-[1.02] active:scale-95"
            >
              Continue
            </button>
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default FinancialProfilePage;