import React from 'react';
import { cn } from '../../lib/utils';

const toneMap = {
  neutral: 'bg-white/8 text-slate-200 ring-white/12',
  success: 'bg-emerald-400/10 text-emerald-200 ring-emerald-300/20',
  warning: 'bg-amber-400/10 text-amber-200 ring-amber-300/20',
  danger: 'bg-red-400/10 text-red-200 ring-red-300/20',
  info: 'bg-sky-400/10 text-sky-200 ring-sky-300/20',
};

const Badge = ({ tone = 'neutral', className, ...props }) => (
  <span
    className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1', toneMap[tone], className)}
    {...props}
  />
);

export { Badge };
