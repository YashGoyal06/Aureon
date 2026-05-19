import React from 'react';
import { Card } from '../ui/card';
import AnimatedNumber from '../motion/AnimatedNumber';
import { cn } from '../../lib/utils';

const MetricCard = ({ label, value, prefix = '', suffix = '', decimals = 0, icon: Icon, tone = 'neutral', className }) => {
  const tones = {
    neutral: 'text-white',
    success: 'text-emerald-200',
    warning: 'text-amber-200',
    danger: 'text-red-200',
    info: 'text-sky-200',
  };

  return (
    <Card className={cn('p-5 transition hover:border-white/18 hover:bg-slate-900/78', className)}>
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm text-slate-400">{label}</p>
        {Icon && <Icon size={20} className={cn('text-slate-400', tones[tone])} />}
      </div>
      <p className={cn('mt-4 text-2xl font-semibold tracking-tight', tones[tone])}>
        <AnimatedNumber value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
      </p>
    </Card>
  );
};

export default MetricCard;
