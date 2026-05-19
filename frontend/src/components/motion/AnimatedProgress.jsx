import React, { useEffect, useRef } from 'react';
import { animate } from 'animejs';
import { cn } from '../../lib/utils';

const AnimatedProgress = ({ value = 0, className, indicatorClassName }) => {
  const barRef = useRef(null);
  const width = `${Math.min(Math.max(Number(value) || 0, 0), 100)}%`;

  useEffect(() => {
    if (!barRef.current) return undefined;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      barRef.current.style.width = width;
      return undefined;
    }

    const animation = animate(barRef.current, {
      width,
      duration: 760,
      ease: 'outQuart',
    });

    return () => animation.pause();
  }, [width]);

  return (
    <div className={cn('h-2.5 overflow-hidden rounded-full bg-white/8 ring-1 ring-white/10', className)}>
      <div ref={barRef} className={cn('h-full rounded-full bg-emerald-400', indicatorClassName)} style={{ width: 0 }} />
    </div>
  );
};

export default AnimatedProgress;
