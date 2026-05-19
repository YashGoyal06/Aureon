import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-emerald-400 text-slate-950 hover:bg-emerald-300 shadow-[0_12px_30px_rgba(52,211,153,0.18)]',
        secondary: 'bg-white/8 text-white ring-1 ring-white/12 hover:bg-white/12',
        ghost: 'text-slate-300 hover:bg-white/8 hover:text-white',
        danger: 'bg-red-500/12 text-red-200 ring-1 ring-red-400/20 hover:bg-red-500/18',
        outline: 'text-white ring-1 ring-white/14 hover:bg-white/8',
      },
      size: {
        sm: 'h-9 px-3',
        md: 'h-11 px-4',
        lg: 'h-12 px-5',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return <Comp ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />;
});

Button.displayName = 'Button';

export { Button };
