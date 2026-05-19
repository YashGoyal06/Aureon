import React from 'react';
import { cn } from '../../lib/utils';

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('rounded-xl border border-white/10 bg-slate-950/72 shadow-[0_20px_70px_rgba(2,6,23,0.34)] backdrop-blur-xl', className)}
    {...props}
  />
));

Card.displayName = 'Card';

const CardHeader = ({ className, ...props }) => (
  <div className={cn('flex items-start justify-between gap-4 p-5 pb-3', className)} {...props} />
);

const CardTitle = ({ className, ...props }) => (
  <h2 className={cn('text-base font-semibold text-white', className)} {...props} />
);

const CardContent = ({ className, ...props }) => (
  <div className={cn('p-5 pt-2', className)} {...props} />
);

export { Card, CardHeader, CardTitle, CardContent };
