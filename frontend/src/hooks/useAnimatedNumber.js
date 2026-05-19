import { useEffect, useState } from 'react';
import { animate } from 'animejs';

export function useAnimatedNumber(value, { duration = 760, decimals = 0 } = {}) {
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = Number(value) || 0;
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (prefersReducedMotion) return undefined;

    const state = { value: 0 };
    const animation = animate(state, {
      value: numericValue,
      duration,
      ease: 'outCubic',
      onUpdate: () => setDisplayValue(Number(state.value.toFixed(decimals))),
    });

    return () => animation.pause();
  }, [numericValue, duration, decimals, prefersReducedMotion]);

  return prefersReducedMotion ? numericValue : displayValue;
}
