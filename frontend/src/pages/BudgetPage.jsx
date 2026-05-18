// src/pages/BudgetPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Header from '../components/common/Header';
import { TrendingUp, TrendingDown, AlertTriangle, Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { apiFetch } from '../lib/api';
import AddBudgetModal from '../components/budget/AddBudgetModal';

const BudgetPage = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedBudgetForEdit, setSelectedBudgetForEdit] = useState(null);
  const [user, setUser] = useState(null);

  const fetchBudgets = async () => {
    try {
      const data = await apiFetch('/finance/budgets/');
      setBudgets(data);
    } catch (err) {
      console.error("Failed to fetch budgets", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditBudget = (budget) => {
    setSelectedBudgetForEdit(budget);
    setIsAddModalOpen(true);
  };

  const handleDeleteBudget = async (budgetId) => {
    if (!window.confirm("Are you sure you want to delete this category budget?")) return;
    try {
      await apiFetch(`/finance/budgets/${budgetId}/`, { method: 'DELETE' });
      fetchBudgets();
    } catch (err) {
      console.error("Failed to delete budget", err);
      alert("Error deleting budget: " + err.message);
    }
  };

  useEffect(() => {
    fetchBudgets();

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

  const totalBudget = budgets.reduce((sum, b) => sum + parseFloat(b.budget_amount), 0);
  const spent = budgets.reduce((sum, b) => sum + parseFloat(b.spent_amount), 0);
  const remaining = totalBudget - spent;
  const percentageSpent = totalBudget > 0 ? (spent / totalBudget) * 100 : 0;
  
  const daysLeft = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate();
  const dailyBudget = remaining > 0 && daysLeft > 0 ? (remaining / daysLeft).toFixed(2) : '0.00';
  
  const currentMonthName = new Date().toLocaleString('default', { month: 'long' });
  const currentYear = new Date().getFullYear();
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h1 className="text-4xl font-bold text-white">
              Budget Management
            </h1>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl font-medium transition-all duration-300 shadow-lg shadow-emerald-500/20 flex items-center space-x-2 border border-emerald-500/20"
            >
              <Plus size={18} />
              <span>Create Budget</span>
            </button>
          </div>

          {/* Overall Budget Status */}
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl p-6 mb-8 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">{currentMonthName} {currentYear} Budget</h2>
            
            <div className="grid md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                <p className="text-sm text-gray-300 mb-1">Total Budget</p>
                <p className="text-2xl font-bold text-white">₹{totalBudget.toFixed(2)}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-red-500/20 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                <p className="text-sm text-red-300 mb-1">Spent</p>
                <p className="text-2xl font-bold text-red-400">₹{spent.toFixed(2)}</p>
              </div>
              <div className={`bg-white/5 rounded-xl p-4 border ${remaining >= 0 ? 'border-emerald-500/20' : 'border-red-500/20'} backdrop-blur-sm hover:bg-white/10 transition-all duration-300`}>
                <p className={`text-sm ${remaining >= 0 ? 'text-emerald-300' : 'text-red-300'} mb-1`}>Remaining</p>
                <p className={`text-2xl font-bold ${remaining >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{remaining < 0 ? '-' : ''}₹{Math.abs(remaining).toFixed(2)}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-blue-500/20 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                <p className="text-sm text-blue-300 mb-1">Daily Budget</p>
                <p className="text-2xl font-bold text-blue-400">₹{dailyBudget}</p>
              </div>
            </div>

            <div className="w-full bg-white/10 rounded-full h-4 border border-white/10 overflow-hidden">
              <div
                className={`${percentageSpent > 90 ? 'bg-gradient-to-r from-red-600 to-red-400' : 'bg-gradient-to-r from-emerald-500 to-teal-600'} h-4 rounded-full relative overflow-hidden`}
                style={{ width: `${Math.min(percentageSpent, 100)}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
              </div>
            </div>
            <p className="text-sm text-gray-300 mt-3">
              {percentageSpent.toFixed(1)}% of budget used • {daysLeft} days left
            </p>
          </div>

          {/* Category Breakdown */}
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl p-6 mb-8 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-6">Category Breakdown</h2>
            
            <div className="space-y-6">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="animate-spin text-emerald-400" size={40} />
                </div>
              ) : budgets.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  You don't have any budgets configured. Add one to start tracking!
                </div>
              ) : (
                budgets.map((category) => {
                const budgetAmt = parseFloat(category.budget_amount);
                const spentAmt = parseFloat(category.spent_amount);
                const percentage = budgetAmt > 0 ? (spentAmt / budgetAmt) * 100 : 0;
                const isWarning = category.status === 'warning' || percentage > 70;
                const isDanger = category.status === 'danger' || percentage > 90;
                
                return (
                  <div key={category.id} className="group bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-white text-lg">{category.name}</h3>
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={() => handleEditBudget(category)}
                            className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-emerald-400 transition-colors"
                            title="Edit budget limit"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteBudget(category.id)}
                            className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                            title="Delete budget"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-white text-lg">
                          ₹{spentAmt.toFixed(2)} / ₹{budgetAmt.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-400">₹{category.remaining_amount} left</p>
                      </div>
                    </div>
                    
                    <div className="w-full bg-white/10 rounded-full h-3 mb-2 border border-white/10">
                      <div
                        className={`h-3 rounded-full ${
                          isDanger ? 'bg-gradient-to-r from-red-600 to-red-400' : 
                          isWarning ? 'bg-gradient-to-r from-orange-500 to-yellow-400' : 
                          'bg-gradient-to-r from-emerald-500 to-teal-600'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className={`font-medium ${
                        isDanger ? 'text-red-400' : isWarning ? 'text-orange-400' : 'text-emerald-400'
                      }`}>
                        {percentage.toFixed(0)}% used
                      </span>
                      <span className="text-gray-400 capitalize">Status: {category.status}</span>
                    </div>
                    
                    {category.warning_message && (
                      <div className="mt-3 flex items-start space-x-2 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                        <AlertTriangle size={16} className="text-orange-400 mt-0.5" />
                        <p className="text-sm text-orange-300">{category.warning_message}</p>
                      </div>
                    )}
                  </div>
                );
              }))}
            </div>
          </div>

          {/* Budget Optimizer */}
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">AI Budget Optimizer</h2>
            <p className="text-gray-300 mb-6">I've analyzed your spending patterns</p>
            
            <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5 backdrop-blur-sm hover:bg-blue-500/15 transition-all duration-300">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/50">
                    <TrendingUp size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-2">Transportation Budget Adjustment</h3>
                    <p className="text-sm text-blue-200 mb-3">
                      You consistently exceed this by 20-30%. Suggested: Increase to $260/month
                    </p>
                    <button className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">
                      Apply Suggestion →
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 backdrop-blur-sm hover:bg-emerald-500/15 transition-all duration-300">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/50">
                    <TrendingDown size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-2">Dining Out Pattern Detected</h3>
                    <p className="text-sm text-emerald-200 mb-3">
                      You spend 3x more on weekends vs weekdays. Suggestion: Set weekend dining limit to $70/week
                    </p>
                    <button className="text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                      Create Split Budget →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

       {isAddModalOpen && (
        <AddBudgetModal
          editingBudget={selectedBudgetForEdit}
          onClose={() => {
            setIsAddModalOpen(false);
            setSelectedBudgetForEdit(null);
          }}
          onRefresh={fetchBudgets}
        />
      )}

      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default BudgetPage;