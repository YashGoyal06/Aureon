import React from 'react';
import { useAnimeReveal } from '../../hooks/useAnimeReveal';
import { cn } from '../../lib/utils';

const Reveal = ({ as, className, children, ...props }) => {
  const ref = useAnimeReveal();
  const Component = as || 'div';
  return (
    <Component ref={ref} className={cn('motion-reveal', className)} {...props}>
      {children}
    </Component>
  );
};

export default Reveal;
