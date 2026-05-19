// src/components/transactions/AddTransactionModal.jsx
import React, { useState } from 'react';
import { X, Camera, Upload, Check } from 'lucide-react';
import { CATEGORIES, PAYMENT_METHODS } from '../../data/config';
import { apiFetch } from '../../lib/api';

const AddTransactionModal = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    merchant: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    notes: '',
    tags: '',
    addToBudget: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const amount = formData.type === 'expense' ? -Math.abs(parseFloat(formData.amount)) : Math.abs(parseFloat(formData.amount));
      await apiFetch('/finance/transactions/', {
        method: 'POST',
        body: JSON.stringify({
          merchant: formData.merchant,
          amount: amount,
          category: CATEGORIES.find(c => c.key === formData.category)?.name || formData.category,
          category_key: formData.category,
          date: formData.date,
          payment_method: formData.paymentMethod,
          note: formData.notes
        })
      });
      setStep(2); // Show success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Failed to add transaction", error);
      alert("Error adding transaction: " + error.message);
    }
  };

  const getCategoryIcon = (key) => {
    const icons = {
      dining: '🍔',
      coffee: '☕',
      groceries: '🛒',
      housing: '🏠',
      transportation: '🚗',
      entertainment: '🎬',
      shopping: '🛍️',
      healthcare: '🏥',
      education: '📚',
      income: '💰'
    };
    return icons[key] || '📝';
  };

  if (step === 2) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-black border border-emerald-500/30 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl shadow-emerald-500/10">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-scale-in">
            <Check size={32} className="text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 animate-pulse">Transaction Saved!</h2>
          <p className="text-gray-400">Your transaction has been added successfully</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 sm:p-4">
      <div className="bg-black/90 sm:border border-white/10 sm:rounded-2xl w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-2xl shadow-2xl flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0 mt-8 sm:mt-0">
          <h2 className="text-xl font-bold text-white">Add Transaction</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors duration-300"
          >
            <X size={20} className="text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 pb-24 sm:pb-6">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Transaction Type
            </label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'expense' })}
                className={`flex-1 py-3 px-4 rounded-xl border font-medium transition-all duration-300 ${
                  formData.type === 'expense'
                    ? 'border-red-500/50 bg-red-500/10 text-red-400 shadow-lg shadow-red-500/5'
                    : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:text-white'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'income' })}
                className={`flex-1 py-3 px-4 rounded-xl border font-medium transition-all duration-300 ${
                  formData.type === 'income'
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-lg shadow-emerald-500/5'
                    : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:text-white'
                }`}
              >
                Income
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">₹</span>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                required
                className="w-full pl-8 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500/50 transition-colors duration-300 text-lg"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CATEGORIES.filter(cat => 
                formData.type === 'income' ? cat.key === 'income' : cat.key !== 'income'
              ).map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: category.key })}
                  className={`p-3 rounded-xl border text-left transition-all duration-300 ${
                    formData.category === category.key
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/5'
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{getCategoryIcon(category.key)}</span>
                    <span className="text-sm font-medium text-white">
                      {category.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Merchant/Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Merchant / Description
            </label>
            <input
              type="text"
              value={formData.merchant}
              onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
              placeholder="e.g., Starbucks, Salary, etc."
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500/50 transition-colors duration-300"
            />
          </div>

          {/* Date and Payment Method Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500/50 transition-colors duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Payment Method
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500/50 transition-colors duration-300"
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method.id} value={method.type} className="bg-black text-white">
                    {method.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any additional notes..."
              rows="2"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500/50 transition-colors duration-300 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-white/10 hover:bg-white/5 text-white rounded-xl font-medium transition-colors duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl font-medium transition-all duration-300 shadow-lg shadow-emerald-500/20"
            >
              Save Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;