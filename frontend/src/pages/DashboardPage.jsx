import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Plus, Sparkles, WalletCards } from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/layout/PageHeader';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import Reveal from '../components/motion/Reveal';
import FinancialSnapshot from '../components/dashboard/FinancialSnapshot';
import AIInsights from '../components/dashboard/AllInsights';
import SpendingChart from '../components/dashboard/SpendingChart';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import UpcomingBills from '../components/dashboard/UpcomingBills';
import ActiveGoals from '../components/dashboard/ActiveGoals';
import AddTransactionModal from '../components/transactions/AddTransactionModal';
import { useHeaderUser } from '../hooks/useHeaderUser';

const DashboardPage = () => {
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showGuide, setShowGuide] = useState(() => !localStorage.getItem('aureon_guide_dismissed'));
  const user = useHeaderUser();
  const firstName = user?.name?.split(' ')[0] || 'there';

  const dismissGuide = () => {
    localStorage.setItem('aureon_guide_dismissed', 'true');
    setShowGuide(false);
  };

  return (
    <AppShell user={user}>
      <PageHeader
        eyebrow="Overview"
        title={`Welcome back, ${firstName}`}
        subtitle="Track cash flow, budget pressure, bills, and savings goals from one focused workspace."
        action={(
          <Button onClick={() => setShowAddTransaction(true)} size="lg">
            <Plus size={18} />
            Add spending
          </Button>
        )}
      />

      {showGuide && (
        <Reveal>
          <Card className="mb-8 overflow-hidden p-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <Badge tone="info">
                  <Sparkles size={13} />
                  Guided setup
                </Badge>
                <h2 className="mt-3 text-xl font-semibold text-white">Set your limits and track your spending.</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Set budgets, add or import transactions, and monitor your financial progress.
                </p>
              </div>
              <div className="grid gap-3 text-sm sm:grid-cols-3 lg:w-[520px]">
                {[
                  ['Budget limits', '/budget'],
                  ['Import transactions', '/transactions'],
                  ['Ask assistant', '/chat'],
                ].map(([label, path]) => (
                  <Link key={label} to={path} className="rounded-lg border border-white/10 bg-white/5 p-3 text-slate-200 transition hover:bg-white/9">
                    <CheckCircle2 size={16} className="mb-2 text-emerald-300" />
                    {label}
                  </Link>
                ))}
              </div>
            </div>
            <button onClick={dismissGuide} className="mt-4 text-xs font-medium text-slate-500 transition hover:text-slate-300">
              Dismiss guide
            </button>
          </Card>
        </Reveal>
      )}

      <FinancialSnapshot />

      <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <AIInsights />
        <RecentTransactions />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <UpcomingBills />
        <ActiveGoals />
      </div>

      <Reveal>
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-400">
          <WalletCards size={16} />
          Monthly budget movement
        </div>
      </Reveal>
      <SpendingChart />

      {showAddTransaction && (
        <AddTransactionModal onClose={() => {
          setShowAddTransaction(false);
          window.location.reload();
        }} />
      )}
    </AppShell>
  );
};

export default DashboardPage;
