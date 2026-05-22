import React, { useState, useEffect } from 'react';
import { X, CreditCard, Loader2 } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '../ui/button';
import { apiFetch } from '../../lib/api';

const emptyForm = {
  name: '',
  amount: '',
  renewal_date: '',
  usage_level: 'Medium',
  value_score: 3,
  status: 'active',
  last_used_date: '',
  warning: '',
  potential_saving: '',
};

const SubscriptionModal = ({ open, onOpenChange, onSaved, editingSubscription = null }) => {
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!editingSubscription;

  useEffect(() => {
    if (editingSubscription) {
      setFormData({
        name: editingSubscription.name || '',
        amount: editingSubscription.amount || '',
        renewal_date: editingSubscription.renewal_date || '',
        usage_level: editingSubscription.usage_level || 'Medium',
        value_score: editingSubscription.value_score ?? 3,
        status: editingSubscription.status || 'active',
        last_used_date: editingSubscription.last_used_date || '',
        warning: editingSubscription.warning || '',
        potential_saving: editingSubscription.potential_saving || '',
      });
    } else {
      setFormData(emptyForm);
    }
    setError('');
  }, [editingSubscription, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        amount: parseFloat(formData.amount),
        usage_level: formData.usage_level,
        value_score: parseInt(formData.value_score, 10),
        status: formData.status,
        potential_saving: parseFloat(formData.potential_saving || 0),
      };
      if (formData.renewal_date) payload.renewal_date = formData.renewal_date;
      if (formData.last_used_date) payload.last_used_date = formData.last_used_date;
      if (formData.warning) payload.warning = formData.warning;

      let result;
      if (isEditing) {
        result = await apiFetch(`/finance/subscriptions/${editingSubscription.id}/`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        result = await apiFetch('/finance/subscriptions/', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      resetForm();
      onSaved?.(result, isEditing);
      onOpenChange(false);
    } catch (err) {
      setError(err.message || 'Failed to save subscription');
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
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[94vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-slate-950 p-6 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-400/10 p-2 text-emerald-300">
                <CreditCard size={20} />
              </div>
              <div>
                <Dialog.Title className="text-lg font-semibold text-white">
                  {isEditing ? 'Edit subscription' : 'Add subscription'}
                </Dialog.Title>
                <Dialog.Description className="text-sm text-slate-400">
                  {isEditing ? 'Update this subscription\'s details.' : 'Track a new recurring payment or subscription.'}
                </Dialog.Description>
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
            {/* Name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Subscription name</label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g., Netflix, Spotify, Gym"
                className={inputClasses}
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            {/* Amount + Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Monthly amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">₹</span>
                  <input
                    type="number"
                    name="amount"
                    required
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    className={`${inputClasses} pl-7`}
                    value={formData.amount}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Status</label>
                <select name="status" className={inputClasses} value={formData.status} onChange={handleChange}>
                  <option value="active">Active</option>
                  <option value="unused">Unused</option>
                </select>
              </div>
            </div>

            {/* Renewal date + Last used */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Renewal date</label>
                <input
                  type="date"
                  name="renewal_date"
                  className={inputClasses}
                  value={formData.renewal_date}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Last used date</label>
                <input
                  type="date"
                  name="last_used_date"
                  className={inputClasses}
                  value={formData.last_used_date}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Usage Level + Value Score */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Usage level</label>
                <select name="usage_level" className={inputClasses} value={formData.usage_level} onChange={handleChange}>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                  <option value="None">None</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Value score (1–5)</label>
                <select name="value_score" className={inputClasses} value={formData.value_score} onChange={handleChange}>
                  {[1, 2, 3, 4, 5].map((v) => (
                    <option key={v} value={v}>{v} — {['Poor', 'Fair', 'Average', 'Good', 'Excellent'][v - 1]}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Potential saving */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Potential yearly saving</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">₹</span>
                <input
                  type="number"
                  name="potential_saving"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className={`${inputClasses} pl-7`}
                  value={formData.potential_saving}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Warning note */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Warning note (optional)</label>
              <input
                type="text"
                name="warning"
                placeholder="e.g., Price increase next month"
                className={inputClasses}
                value={formData.warning}
                onChange={handleChange}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Dialog.Close asChild>
                <Button type="button" variant="secondary" className="flex-1">Cancel</Button>
              </Dialog.Close>
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {isEditing ? 'Saving…' : 'Adding…'}
                  </>
                ) : (
                  isEditing ? 'Save changes' : 'Add subscription'
                )}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default SubscriptionModal;
