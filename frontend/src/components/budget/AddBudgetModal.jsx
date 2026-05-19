// src/components/budget/AddBudgetModal.jsx
import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { apiFetch } from '../../lib/api';

const AddBudgetModal = ({ onClose, onRefresh, editingBudget = null }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(() => ({
    name: editingBudget?.category_key || 'dining',
    budget_amount: editingBudget ? Math.round(parseFloat(editingBudget.budget_amount)).toString() : '',
  }));

  const CATEGORIES = [
    { name: 'Food & Dining', value: 'dining' },
    { name: 'Housing', value: 'housing' },
    { name: 'Transportation', value: 'transportation' },
    { name: 'Groceries', value: 'groceries' },
    { name: 'Entertainment', value: 'entertainment' },
    { name: 'Miscellaneous', value: 'miscellaneous' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.budget_amount) return;

    const selectedCategory = CATEGORIES.find(c => c.value === formData.name);
    const budgetName = selectedCategory ? selectedCategory.name : formData.name;

    try {
      if (editingBudget) {
        // Edit existing budget using PATCH
        await apiFetch(`/finance/budgets/${editingBudget.id}/`, {
          method: 'PATCH',
          body: JSON.stringify({
            budget_amount: parseFloat(formData.budget_amount),
          })
        });
      } else {
        // Create new budget using POST
        await apiFetch('/finance/budgets/', {
          method: 'POST',
          body: JSON.stringify({
            name: budgetName,
            category_key: formData.name,
            budget_amount: parseFloat(formData.budget_amount),
            spent_amount: 0,
          })
        });
      }
      
      setStep(2); // Show success
      setTimeout(() => {
        onClose();
        if (onRefresh) onRefresh();
      }, 1500);
    } catch (error) {
      console.error("Failed to save budget", error);
      alert("Error saving budget: " + error.message);
    }
  };

  if (step === 2) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-black border border-emerald-500/30 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl shadow-emerald-500/10">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 animate-pulse">
            {editingBudget ? 'Budget Updated!' : 'Budget Created!'}
          </h2>
          <p className="text-gray-400">Your category limit is now active</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-black/90 border border-white/10 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">
            {editingBudget ? 'Edit Category Budget' : 'Configure Budget'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors duration-300"
          >
            <X size={20} className="text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Category
            </label>
            <select
              value={formData.name}
              disabled={editingBudget !== null}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500/50 transition-colors duration-300 ${
                editingBudget ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value} className="bg-black text-white">
                  {cat.name}
                </option>
              ))}
            </select>
            {editingBudget && (
              <p className="text-xs text-gray-400 mt-1">To change category, delete this budget and create a new one.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Monthly Budget Limit
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
              <input
                type="number"
                step="1"
                value={formData.budget_amount}
                onChange={(e) => setFormData({ ...formData, budget_amount: e.target.value })}
                placeholder="0.00"
                required
                className="w-full pl-8 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500/50 transition-colors duration-300 text-lg"
              />
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
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
              {editingBudget ? 'Update Limit' : 'Set Limit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBudgetModal;
