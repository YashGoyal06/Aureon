import React, { useEffect, useState } from 'react';
import { AlertCircle, Calendar, CheckCircle, Loader2, XCircle } from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/layout/PageHeader';
import MetricCard from '../components/common/MetricCard';
import Reveal from '../components/motion/Reveal';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { apiFetch } from '../lib/api';
import { useHeaderUser } from '../hooks/useHeaderUser';

const BillsPage = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useHeaderUser();

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const data = await apiFetch('/finance/subscriptions/');
        setSubscriptions(data);
      } catch (err) {
        console.error('Failed to fetch subscriptions', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscriptions();
  }, []);

  const totalDue = subscriptions.reduce((sum, bill) => sum + parseFloat(bill.amount || 0), 0);
  const activeSubscriptions = subscriptions.filter((sub) => sub.status === 'active');
  const unusedSubscriptions = subscriptions.filter((sub) => sub.status === 'unused');
  const potentialSavings = unusedSubscriptions.reduce((sum, sub) => sum + parseFloat(sub.potential_saving || 0), 0);

  return (
    <AppShell user={user}>
      <PageHeader
        eyebrow="Commitments"
        title="Bills & subscriptions"
        subtitle="Stay ahead of renewals, spot unused subscriptions, and protect recurring cash flow."
      />

      <Reveal className="mb-6 grid gap-4 md:grid-cols-3">
        <MetricCard label="Due next 30 days" value={totalDue} prefix="₹" decimals={2} icon={Calendar} />
        <MetricCard label="Active subscriptions" value={activeSubscriptions.length} icon={CheckCircle} tone="success" />
        <MetricCard label="Potential yearly savings" value={potentialSavings} prefix="₹" decimals={2} icon={AlertCircle} tone="warning" />
      </Reveal>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-white">Upcoming timeline</h2>
          <p className="mt-1 text-sm text-slate-400">Recurring payments sorted by your existing renewal data.</p>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-emerald-300" size={34} />
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="py-16 text-center text-slate-400">No subscriptions found.</div>
          ) : (
            <div className="mt-6 space-y-3">
              {subscriptions.map((bill) => {
                const isUnused = bill.status === 'unused';
                return (
                  <div key={bill.id} className="relative rounded-xl border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.06]">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex gap-3">
                        <div className="mt-1 h-10 w-10 rounded-lg border border-white/10 bg-slate-900 p-2 text-emerald-200">
                          <Calendar size={20} />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-white">{bill.name}</h3>
                            <Badge tone={isUnused ? 'danger' : 'success'}>{bill.status}</Badge>
                          </div>
                          <p className="mt-1 text-sm text-slate-400">Renews {bill.renewal_date || 'N/A'} · Usage {bill.usage_level}</p>
                        </div>
                      </div>
                      <div className="sm:text-right">
                        <p className="text-lg font-semibold text-white">₹{parseFloat(bill.amount || 0).toFixed(2)}</p>
                        <Button variant="ghost" size="sm">Manage</Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-5 flex items-start gap-3">
            <div className="rounded-lg bg-amber-400/10 p-2 text-amber-200">
              <AlertCircle size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Subscription analyzer</h2>
              <p className="mt-1 text-sm text-slate-400">Unused subscriptions and value signals.</p>
            </div>
          </div>

          {unusedSubscriptions.length > 0 && (
            <div className="mb-4 rounded-xl border border-red-300/20 bg-red-300/8 p-4">
              <div className="flex gap-3">
                <XCircle size={22} className="shrink-0 text-red-200" />
                <div>
                  <p className="font-medium text-red-100">Unused subscriptions detected</p>
                  <p className="mt-1 text-sm text-red-100/75">Cancel candidates could save ₹{potentialSavings}/year.</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {subscriptions.map((subscription) => {
              const isUnused = subscription.status === 'unused';
              return (
                <div key={subscription.id} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-medium text-white">{subscription.name}</h3>
                      <p className="mt-1 text-sm text-slate-400">₹{parseFloat(subscription.amount || 0).toFixed(2)}/month · Value {subscription.value_score}/5</p>
                      {subscription.warning && <p className="mt-2 text-sm text-amber-200">{subscription.warning}</p>}
                    </div>
                    <Badge tone={isUnused ? 'danger' : 'neutral'}>{isUnused ? 'Review' : 'Keep'}</Badge>
                  </div>
                  {isUnused && (
                    <Button variant="danger" size="sm" className="mt-4">
                      Cancel subscription
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </AppShell>
  );
};

export default BillsPage;
