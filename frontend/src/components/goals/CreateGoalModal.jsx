import React, { useState } from 'react';
import { X, Target, Loader2 } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { apiFetch } from '../../lib/api';

const CreateGoalModal = ({ open, onOpenChange, onCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    deadline: '',
    current_amount: '',
    monthly_target: '',
    priority: 'medium',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      target_amount: '',
      deadline: '',
      current_amount: '',
      monthly_target: '',
      priority: 'medium',
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        target_amount: parseFloat(formData.target_amount),
        current_amount: parseFloat(formData.current_amount || 0),
        monthly_target: parseFloat(formData.monthly_target || 0),
        priority: formData.priority,
      };
      if (formData.deadline) {
        payload.deadline = formData.deadline;
      }

      const created = await apiFetch('/finance/goals/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      resetForm();
      onCreated?.(created);
      onOpenChange(false);
    } catch (err) {
      setError(err.message || 'Failed to create goal');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClasses =
    'w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-emerald-400/40 focus:ring-1 focus:ring-emerald-400/30';

  return (
    <Dialog.Root open={open} onOpenChange={(val) => { if (!val) resetForm(); onOpenChange(val); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[94vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-slate-950 p-6 text-white shadow-2xl">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-400/10 p-2 text-emerald-300">
                <Target size={20} />
              </div>
              <div>
                <Dialog.Title className="text-lg font-semibold text-white">Create new goal</Dialog.Title>
                <Dialog.Description className="text-sm text-slate-400">Set a savings target and track your progress.</Dialog.Description>
              </div>
            </div>
            <Dialog.Close asChild>
              <button className="rounded-lg p-2 text-slate-400 transition hover:bg-white/7 hover:text-white">
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-300/20 bg-red-300/8 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Goal name</label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g., Emergency Fund, Vacation, New Car"
                className={inputClasses}
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Target amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">₹</span>
                  <input
                    type="number"
                    name="target_amount"
                    required
                    min="1"
                    step="0.01"
                    placeholder="0.00"
                    className={`${inputClasses} pl-7`}
                    value={formData.target_amount}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Initial deposit</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">₹</span>
                  <input
                    type="number"
                    name="current_amount"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className={`${inputClasses} pl-7`}
                    value={formData.current_amount}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Target date</label>
                <input
                  type="date"
                  name="deadline"
                  className={inputClasses}
                  value={formData.deadline}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Monthly target</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">₹</span>
                  <input
                    type="number"
                    name="monthly_target"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className={`${inputClasses} pl-7`}
                    value={formData.monthly_target}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Priority</label>
              <select
                name="priority"
                className={inputClasses}
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <Dialog.Close asChild>
                <Button type="button" variant="secondary" className="flex-1">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating…
                  </>
                ) : (
                  'Create goal'
                )}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default CreateGoalModal;