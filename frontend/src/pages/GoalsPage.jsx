import React, { useEffect, useState, useCallback } from 'react';
import { Loader2, Minus, Plus, Target, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/layout/PageHeader';
import AnimatedProgress from '../components/motion/AnimatedProgress';
import Reveal from '../components/motion/Reveal';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { apiFetch } from '../lib/api';
import { useHeaderUser } from '../hooks/useHeaderUser';
import CreateGoalModal from '../components/goals/CreateGoalModal';

const AddMoneyModal = ({ open, onOpenChange, goal, onUpdated }) => {
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!goal) return;
    setError('');
    setSubmitting(true);
    try {
      const newAmount = parseFloat(goal.current_amount || 0) + parseFloat(amount);
      const updated = await apiFetch(`/finance/goals/${goal.id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ current_amount: newAmount }),
      });
      setAmount('');
      onUpdated?.(updated);
      onOpenChange(false);
    } catch (err) {
      setError(err.message || 'Failed to add money');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClasses =
    'w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-emerald-400/40 focus:ring-1 focus:ring-emerald-400/30';

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[94vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-slate-950 p-6 text-white shadow-2xl">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-emerald-400/10 p-2 text-emerald-300">
              <Wallet size={20} />
            </div>
            <div>
              <Dialog.Title className="text-lg font-semibold text-white">Add money</Dialog.Title>
              <Dialog.Description className="text-sm text-slate-400">
                {goal ? `Add funds to "${goal.name}"` : 'Add funds to your goal'}
              </Dialog.Description>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-300/20 bg-red-300/8 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {goal && (
            <div className="mb-4 rounded-lg border border-white/10 bg-white/[0.04] p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Current progress</span>
                <span className="font-medium text-white">
                  ₹{parseFloat(goal.current_amount || 0).toLocaleString()} / ₹{parseFloat(goal.target_amount || 0).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Amount to add</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">₹</span>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  placeholder="0.00"
                  className={`${inputClasses} pl-7`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Dialog.Close asChild>
                <Button type="button" variant="secondary" className="flex-1">Cancel</Button>
              </Dialog.Close>
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Adding…
                  </>
                ) : (
                  'Add money'
                )}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [addMoneyGoal, setAddMoneyGoal] = useState(null);
  const user = useHeaderUser();

  const fetchGoals = useCallback(async () => {
    try {
      const data = await apiFetch('/finance/goals/');
      setGoals(data);
    } catch (err) {
      console.error('Failed to fetch goals', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleGoalCreated = (newGoal) => {
    setGoals((prev) => [...prev, newGoal]);
  };

  const handleMoneyAdded = (updatedGoal) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === updatedGoal.id ? updatedGoal : g))
    );
    setAddMoneyGoal(null);
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      await apiFetch(`/finance/goals/${goalId}/`, { method: 'DELETE' });
      setGoals((prev) => prev.filter((g) => g.id !== goalId));
    } catch (err) {
      console.error('Failed to delete goal', err);
    }
  };

  const getStatus = (goal, percentage) => {
    if (goal.priority === 'high' && percentage < 50) return 'behind';
    if (percentage >= 75) return 'ahead';
    return 'on-track';
  };

  const statusIcon = {
    ahead: TrendingUp,
    behind: TrendingDown,
    'on-track': Minus,
  };

  return (
    <AppShell user={user}>
      <PageHeader
        eyebrow="Targets"
        title="Financial goals"
        subtitle="Track progress, urgency, and monthly contributions for the goals that matter."
        action={(
          <Button size="lg" onClick={() => setCreateOpen(true)}>
            <Plus size={18} />
            Create goal
          </Button>
        )}
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-emerald-300" size={36} />
        </div>
      ) : goals.length === 0 ? (
        <Card className="p-12 text-center">
          <Target className="mx-auto mb-4 text-slate-500" size={42} />
          <h2 className="text-xl font-semibold text-white">No goals yet</h2>
          <p className="mt-2 text-sm text-slate-400">Create your first target to start tracking savings progress.</p>
          <Button className="mt-5" onClick={() => setCreateOpen(true)}>
            <Plus size={16} /> Get started
          </Button>
        </Card>
      ) : (
        <Reveal className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {goals.map((goal) => {
            const currentAmt = parseFloat(goal.current_amount || 0);
            const targetAmt = parseFloat(goal.target_amount || 0);
            const percentage = targetAmt > 0 ? (currentAmt / targetAmt) * 100 : 0;
            const remaining = targetAmt - currentAmt;
            const status = getStatus(goal, percentage);
            const StatusIcon = statusIcon[status];
            const tone = status === 'behind' ? 'danger' : status === 'ahead' ? 'success' : 'info';

            return (
              <Card key={goal.id} className="p-5 transition-all duration-300 hover:border-emerald-500/30 hover:bg-slate-900/90 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(16,185,129,0.05)]">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white">{goal.name}</h2>
                    <p className="mt-1 text-sm text-slate-400">{goal.deadline || 'No deadline set'}</p>
                  </div>
                  <Badge tone={tone}>
                    <StatusIcon size={13} />
                    {status.replace('-', ' ')}
                  </Badge>
                </div>

                <div className="mb-4 flex items-end justify-between">
                  <p className="text-2xl font-semibold text-white">₹{currentAmt.toLocaleString()}</p>
                  <p className="text-sm text-slate-400">of ₹{targetAmt.toLocaleString()}</p>
                </div>
                <AnimatedProgress value={percentage} indicatorClassName={tone === 'danger' ? 'bg-red-400' : tone === 'success' ? 'bg-emerald-400' : 'bg-sky-400'} />

                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-slate-500">Remaining</p>
                    <p className="mt-1 font-medium text-white">₹{remaining.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-slate-500">Monthly target</p>
                    <p className="mt-1 font-medium text-white">₹{goal.monthly_target}</p>
                  </div>
                </div>

                <div className="mt-5 flex gap-2">
                  <Button variant="secondary" className="flex-1" onClick={() => handleDeleteGoal(goal.id)}>
                    Remove
                  </Button>
                  <Button className="flex-1" onClick={() => setAddMoneyGoal(goal)}>
                    Add money
                  </Button>
                </div>
              </Card>
            );
          })}
        </Reveal>
      )}

      <CreateGoalModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={handleGoalCreated}
      />

      <AddMoneyModal
        open={!!addMoneyGoal}
        onOpenChange={(val) => { if (!val) setAddMoneyGoal(null); }}
        goal={addMoneyGoal}
        onUpdated={handleMoneyAdded}
      />
    </AppShell>
  );
};

export default GoalsPage;
