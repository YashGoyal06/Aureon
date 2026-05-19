import { useEffect, useRef } from 'react';
import { motion } from '../lib/motion';

export function useAnimeReveal(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      node.style.opacity = 1;
      node.style.transform = 'none';
      return undefined;
    }

    node.style.opacity = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          motion.reveal(node, options);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [options]);

  return ref;
}
