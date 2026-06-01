import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export const MagneticButton = ({ children, onClick, disabled, className = '' }: { children: React.ReactNode, onClick?: () => void, disabled?: boolean, className?: string }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current || disabled) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.4, y: middleY * 0.4 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      onClick={onClick}
      disabled={disabled}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={`relative z-10 w-full rounded-2xl overflow-hidden group ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute -inset-[1px] bg-gradient-to-r from-[#06B6D4] to-[#4F46E5] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
      <div className="relative z-10 w-full h-full flex items-center justify-center text-white font-bold py-5">
        {children}
      </div>
    </motion.button>
  );
};
