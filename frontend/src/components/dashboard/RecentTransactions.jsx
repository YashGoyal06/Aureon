// src/components/dashboard/RecentTransactions.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { apiFetch } from '../../lib/api';

const RecentTransactions = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await apiFetch('/finance/transactions/');
        setTransactions(data);
      } catch (err) {
        console.error("Failed to fetch transactions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);
  const getCategoryIcon = (categoryKey) => {
    const icons = {
      dining: '🍔',
      coffee: '☕',
      groceries: '🛒',
      transportation: '⛽',
      entertainment: '🎬',
      income: '💰'
    };
    return icons[categoryKey] || '📝';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="h-full">
      <div className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl p-4 sm:p-6 border border-white/10 hover:border-emerald-500/30 transition-all duration-300 h-full flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Transactions</h2>
          <button 
            onClick={() => navigate('/transactions')}
            className="text-sm text-emerald-400 hover:text-emerald-300 font-medium flex items-center transition-colors duration-300"
          >
            View All <ChevronRight size={16} className="ml-1" />
          </button>
        </div>

        <div className="space-y-3 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="animate-spin text-emerald-400" size={32} />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center text-gray-400 mt-8">No recent transactions.</div>
          ) : (
            transactions.slice(0, 4).map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 sm:p-4 hover:bg-white/5 rounded-xl transition-all duration-300 cursor-pointer border border-white/10 hover:border-emerald-500/30 backdrop-blur-sm"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 backdrop-blur-sm rounded-full flex items-center justify-center text-xl sm:text-2xl border border-white/10 flex-shrink-0">
                  {getCategoryIcon(transaction.categoryKey)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm sm:text-base break-words">{transaction.merchant}</p>
                  <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-400">
                    <span>{formatDate(transaction.date)}</span>
                    {transaction.time && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden sm:inline">{transaction.time}</span>
                      </>
                    )}
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline truncate">{transaction.category}</span>
                  </div>
                  {transaction.note && (
                    <p className="text-sm text-gray-500 mt-1 hidden sm:block truncate">{transaction.note}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-2">
                <div className="text-right">
                  <p className={`font-semibold text-sm sm:text-base ${
                    transaction.amount > 0 ? 'text-emerald-400' : 'text-white'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount < 0 ? '-' : ''}₹
                    {Math.abs(transaction.amount).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400 hidden sm:block">{transaction.paymentMethod}</p>
                </div>
                {transaction.amount > 0 ? (
                  <ArrowDownRight size={20} className="text-emerald-400 flex-shrink-0" />
                ) : (
                  <ArrowUpRight size={20} className="text-gray-500 flex-shrink-0" />
                )}
              </div>
            </div>
          )))}
        </div>

        <button 
          onClick={() => navigate('/transactions')}
          className="w-full mt-4 py-2 text-sm text-gray-400 hover:text-white font-medium border border-white/10 rounded-xl hover:bg-white/5 hover:border-emerald-500/30 transition-all duration-300 backdrop-blur-sm"
        >
          View All Transactions
        </button>
      </div>
    </div>
  );
};

export default RecentTransactions;