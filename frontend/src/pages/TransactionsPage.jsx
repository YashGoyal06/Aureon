// src/pages/TransactionsPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/common/Header';
import { apiFetch } from '../lib/api';
import { supabase } from '../lib/supabase';
import { 
  Search, Filter, Upload, Loader2, ArrowUpRight, ArrowDownRight, 
  Trash2, FileText, CheckCircle, Plus, AlertCircle, ArrowLeft 
} from 'lucide-react';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [user, setUser] = useState(null);

  // Upload/Import States
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef(null);

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

  useEffect(() => {
    fetchTransactions();

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

  // Filter categories
  const categoriesList = ['all', ...new Set(transactions.map(t => t.category.toLowerCase()))];

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.merchant.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (t.note && t.note.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || t.category.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;
    try {
      await apiFetch(`/finance/transactions/${id}/`, { method: 'DELETE' });
      fetchTransactions();
    } catch (err) {
      alert("Failed to delete transaction: " + err.message);
    }
  };

  const handleFileUploadTrigger = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await apiFetch('/importer/upload/', {
        method: 'POST',
        body: formData
      });
      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
        fetchTransactions();
      }, 2000);
    } catch (error) {
      console.error("Statement upload error", error);
      alert("Error importing statement: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const getCategoryIcon = (categoryKey) => {
    const icons = {
      dining: '🍔',
      food: '🍔',
      coffee: '☕',
      groceries: '🛒',
      housing: '🏠',
      transportation: '⛽',
      entertainment: '🎬',
      income: '💰'
    };
    return icons[categoryKey?.toLowerCase()] || '📝';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', month: 'short', day: 'numeric' 
    });
  };

  const totalSpent = filteredTransactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0);

  const totalIncome = filteredTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

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
          
          {/* Back Button */}
          <div className="mb-6 animate-[fadeIn_0.5s_ease-out]">
            <button
              onClick={() => window.history.back()}
              className="group flex items-center space-x-2 text-white/60 hover:text-white transition-colors duration-300 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-md"
            >
              <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform duration-300 text-emerald-400" />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </button>
          </div>
          
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white">Transactions & Spending</h1>
              <p className="text-gray-300 mt-1">Manage expenditures and import bank statements</p>
            </div>
            <div className="flex space-x-3 w-full sm:w-auto">
              <button
                onClick={handleFileUploadTrigger}
                disabled={uploading}
                className="w-full sm:w-auto py-3 px-6 border border-white/10 hover:bg-white/5 text-white rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 bg-black/40 backdrop-blur-xl"
              >
                {uploading ? (
                  <Loader2 className="animate-spin text-emerald-400" size={18} />
                ) : (
                  <Upload size={18} className="text-emerald-400" />
                )}
                <span>{uploading ? 'Analyzing...' : 'Import Statement'}</span>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".csv,.pdf,.xlsx" 
              />
            </div>
          </div>

          {/* Upload Complete Banner */}
          {uploadSuccess && (
            <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center space-x-3 text-emerald-300 backdrop-blur-sm animate-fade-in">
              <CheckCircle size={20} />
              <span>Statement imported successfully! Extracted transactions are now live below.</span>
            </div>
          )}

          {/* Quick Metrics */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-black/40 border border-white/10 rounded-2xl p-5 backdrop-blur-xl hover:bg-black/50 transition-all duration-300">
              <p className="text-sm text-gray-400 mb-1">Total Spending</p>
              <p className="text-2xl font-bold text-white">₹{totalSpent.toFixed(2)}</p>
            </div>
            <div className="bg-black/40 border border-white/10 rounded-2xl p-5 backdrop-blur-xl hover:bg-black/50 transition-all duration-300">
              <p className="text-sm text-gray-400 mb-1">Total Deposits / Income</p>
              <p className="text-2xl font-bold text-emerald-400">₹{totalIncome.toFixed(2)}</p>
            </div>
            <div className="bg-black/40 border border-white/10 rounded-2xl p-5 backdrop-blur-xl hover:bg-black/50 transition-all duration-300">
              <p className="text-sm text-gray-400 mb-1">Net Flow</p>
              <p className={`text-2xl font-bold ${totalIncome - totalSpent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {totalIncome - totalSpent >= 0 ? '+' : '-'}₹{Math.abs(totalIncome - totalSpent).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 mb-8 backdrop-blur-xl flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search merchant or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500/50 transition-all duration-300"
              />
            </div>

            <div className="flex items-center space-x-3 w-full md:w-auto">
              <Filter className="text-gray-400" size={18} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full md:w-56 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500/50 transition-all duration-300 capitalize"
              >
                {categoriesList.map(cat => (
                  <option key={cat} value={cat} className="bg-black text-white">
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Transactions List */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="animate-spin text-emerald-400" size={40} />
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center text-gray-400 py-16">
                <AlertCircle className="mx-auto text-gray-500 mb-3" size={36} />
                <p className="text-lg">No transactions found matching your criteria.</p>
                <p className="text-sm mt-1 text-gray-500">Create one or import a bank statement file.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 text-sm font-medium">
                      <th className="pb-4">Date</th>
                      <th className="pb-4">Merchant</th>
                      <th className="pb-4">Category</th>
                      <th className="pb-4">Method</th>
                      <th className="pb-4 text-right">Amount</th>
                      <th className="pb-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((t) => (
                      <tr 
                        key={t.id} 
                        className="border-b border-white/5 hover:bg-white/5 transition-colors duration-300 text-white text-sm sm:text-base group"
                      >
                        <td className="py-4 font-medium text-gray-300">{formatDate(t.date)}</td>
                        <td className="py-4">
                          <div className="font-semibold text-white">{t.merchant}</div>
                          {t.note && <div className="text-xs text-gray-400 mt-0.5">{t.note}</div>}
                        </td>
                        <td className="py-4">
                          <span className="inline-flex items-center px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium capitalize">
                            <span className="mr-1.5">{getCategoryIcon(t.category_key || t.category)}</span>
                            {t.category}
                          </span>
                        </td>
                        <td className="py-4 text-sm text-gray-300 capitalize">{t.payment_method || 'Cash'}</td>
                        <td className={`py-4 text-right font-bold ${
                          t.amount > 0 ? 'text-emerald-400' : 'text-white'
                        }`}>
                          {t.amount > 0 ? '+' : '-'}₹{Math.abs(t.amount).toFixed(2)}
                        </td>
                        <td className="py-4 text-center">
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="p-2 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded-lg transition-colors duration-300"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal removed */}
    </div>
  );
};

export default TransactionsPage;
