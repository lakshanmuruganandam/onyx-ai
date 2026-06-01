import { useEffect, useState } from 'react';
import { useSpring } from 'framer-motion';

export const FluidCounter = ({ value, className = '' }: { value: number, className?: string }) => {
  const springValue = useSpring(0, { stiffness: 50, damping: 20, mass: 1 });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    springValue.set(value);
  }, [value, springValue]);

  useEffect(() => {
    return springValue.onChange((latest) => {
      setDisplayValue(Math.round(latest));
    });
  }, [springValue]);

  return (
    <span className={className}>
      {displayValue}
    </span>
  );
};
