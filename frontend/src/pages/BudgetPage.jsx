import React, { useEffect, useState } from 'react';
import { AlertTriangle, Loader2, Pencil, Plus, Trash2, TrendingDown, TrendingUp, WalletCards } from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/layout/PageHeader';
import MetricCard from '../components/common/MetricCard';
import AnimatedProgress from '../components/motion/AnimatedProgress';
import Reveal from '../components/motion/Reveal';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { apiFetch } from '../lib/api';
import AddBudgetModal from '../components/budget/AddBudgetModal';
import { useHeaderUser } from '../hooks/useHeaderUser';
import { cn } from '../lib/utils';

const BudgetPage = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedBudgetForEdit, setSelectedBudgetForEdit] = useState(null);
  const user = useHeaderUser();

  const fetchBudgets = async () => {
    try {
      const data = await apiFetch('/finance/budgets/');
      setBudgets(data);
    } catch (err) {
      console.error('Failed to fetch budgets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleEditBudget = (budget) => {
    setSelectedBudgetForEdit(budget);
    setIsAddModalOpen(true);
  };

  const handleDeleteBudget = async (budgetId) => {
    if (!window.confirm('Are you sure you want to delete this category budget?')) return;
    try {
      await apiFetch(`/finance/budgets/${budgetId}/`, { method: 'DELETE' });
      fetchBudgets();
    } catch (err) {
      alert(`Error deleting budget: ${err.message}`);
    }
  };

  const totalBudget = budgets.reduce((sum, b) => sum + parseFloat(b.budget_amount || 0), 0);
  const spent = budgets.reduce((sum, b) => sum + parseFloat(b.spent_amount || 0), 0);
  const remaining = totalBudget - spent;
  const percentageSpent = totalBudget > 0 ? (spent / totalBudget) * 100 : 0;
  const daysLeft = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate();
  const dailyBudget = remaining > 0 && daysLeft > 0 ? remaining / daysLeft : 0;
  const monthLabel = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <AppShell user={user}>
      <PageHeader
        eyebrow={monthLabel}
        title="Budget control"
        subtitle="Watch category limits, remaining cash, and month-end pressure without changing the working budget logic."
        action={(
          <Button onClick={() => setIsAddModalOpen(true)} size="lg">
            <Plus size={18} />
            Create budget
          </Button>
        )}
      />

      <Reveal className="mb-6 grid gap-4 md:grid-cols-4">
        <MetricCard label="Total budget" value={totalBudget} prefix="₹" decimals={2} icon={WalletCards} />
        <MetricCard label="Spent" value={spent} prefix="₹" decimals={2} icon={TrendingUp} tone="danger" />
        <MetricCard label="Remaining" value={Math.abs(remaining)} prefix={remaining < 0 ? '-₹' : '₹'} decimals={2} icon={TrendingDown} tone={remaining >= 0 ? 'success' : 'danger'} />
        <MetricCard label="Daily runway" value={dailyBudget} prefix="₹" decimals={2} icon={WalletCards} tone="info" />
      </Reveal>

      <Card className="mb-6 p-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Monthly burn rate</h2>
            <p className="text-sm text-slate-400">{percentageSpent.toFixed(1)}% used with {daysLeft} days left</p>
          </div>
          <Badge tone={percentageSpent > 90 ? 'danger' : percentageSpent > 70 ? 'warning' : 'success'}>
            {percentageSpent > 90 ? 'Critical' : percentageSpent > 70 ? 'Watch closely' : 'Healthy'}
          </Badge>
        </div>
        <AnimatedProgress
          value={percentageSpent}
          className="h-3"
          indicatorClassName={percentageSpent > 90 ? 'bg-red-400' : percentageSpent > 70 ? 'bg-amber-400' : 'bg-emerald-400'}
        />
      </Card>

      <Card className="mb-6 p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Category budgets</h2>
            <p className="text-sm text-slate-400">Manual limits stay editable; spending totals come from existing transactions.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-emerald-300" size={34} />
          </div>
        ) : budgets.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/14 py-14 text-center">
            <p className="text-sm text-slate-300">No budgets configured yet.</p>
            <Button onClick={() => setIsAddModalOpen(true)} className="mt-4" variant="secondary">
              <Plus size={16} /> Add your first budget
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {budgets.map((category) => {
              const budgetAmt = parseFloat(category.budget_amount || 0);
              const spentAmt = parseFloat(category.spent_amount || 0);
              const percentage = budgetAmt > 0 ? (spentAmt / budgetAmt) * 100 : 0;
              const tone = percentage > 90 ? 'danger' : percentage > 70 ? 'warning' : 'success';

              return (
                <div key={category.id} className="group rounded-xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-white/18 hover:bg-white/[0.06]">
                  <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">{category.name}</h3>
                        <Badge tone={tone}>{category.status}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-slate-400">₹{category.remaining_amount} remaining</p>
                    </div>
                    <div className="flex items-center gap-3 sm:text-right">
                      <div>
                        <p className="font-semibold text-white">₹{spentAmt.toFixed(2)} / ₹{budgetAmt.toFixed(2)}</p>
                        <p className="text-xs text-slate-500">{percentage.toFixed(0)}% used</p>
                      </div>
                      <div className="flex opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                        <Button onClick={() => handleEditBudget(category)} variant="ghost" size="icon" title="Edit budget">
                          <Pencil size={15} />
                        </Button>
                        <Button onClick={() => handleDeleteBudget(category.id)} variant="ghost" size="icon" title="Delete budget" className="text-red-200">
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <AnimatedProgress
                    value={percentage}
                    indicatorClassName={cn(tone === 'danger' && 'bg-red-400', tone === 'warning' && 'bg-amber-400', tone === 'success' && 'bg-emerald-400')}
                  />
                  {category.warning_message && (
                    <div className="mt-3 flex gap-2 rounded-lg border border-amber-300/20 bg-amber-300/8 p-3 text-sm text-amber-100">
                      <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                      {category.warning_message}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card className="p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-sky-400/10 p-2 text-sky-200">
            <TrendingUp size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Budget recommendations</h2>
            <p className="text-sm text-slate-400">A restrained advisor panel for upcoming smart suggestions.</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-sky-300/14 bg-sky-300/8 p-4">
            <p className="font-medium text-white">Watch transportation variance</p>
            <p className="mt-2 text-sm leading-6 text-sky-100/80">If this category crosses 70% before mid-month, increase the limit or move from flexible spending.</p>
          </div>
          <div className="rounded-xl border border-emerald-300/14 bg-emerald-300/8 p-4">
            <p className="font-medium text-white">Protect daily runway</p>
            <p className="mt-2 text-sm leading-6 text-emerald-100/80">Your current daily budget is calculated from live remaining cash and days left.</p>
          </div>
        </div>
      </Card>

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
    </AppShell>
  );
};

export default BudgetPage;
