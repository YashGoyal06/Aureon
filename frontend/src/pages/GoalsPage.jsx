import React, { useEffect, useState } from 'react';
import { Loader2, Minus, Plus, Target, TrendingDown, TrendingUp } from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/layout/PageHeader';
import AnimatedProgress from '../components/motion/AnimatedProgress';
import Reveal from '../components/motion/Reveal';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { apiFetch } from '../lib/api';
import { useHeaderUser } from '../hooks/useHeaderUser';

const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useHeaderUser();

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const data = await apiFetch('/finance/goals/');
        setGoals(data);
      } catch (err) {
        console.error('Failed to fetch goals', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGoals();
  }, []);

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
          <Button size="lg">
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
          <Button className="mt-5">
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
                  <Button variant="secondary" className="flex-1">View details</Button>
                  <Button className="flex-1">Add money</Button>
                </div>
              </Card>
            );
          })}
        </Reveal>
      )}
    </AppShell>
  );
};

export default GoalsPage;
