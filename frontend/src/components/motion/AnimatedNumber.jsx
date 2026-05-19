import React from 'react';
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber';

const AnimatedNumber = ({ value, prefix = '', suffix = '', decimals = 0, className }) => {
  const animatedValue = useAnimatedNumber(value, { decimals });
  return (
    <span className={className}>
      {prefix}
      {animatedValue.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
};

export default AnimatedNumber;
