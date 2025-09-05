import React, { useMemo } from 'react';
import { motion } from 'motion/react';

const TextShimmerWave = ({
  children,
  as = 'p',
  className = '',
  duration = 1,
  zDistance = 10,
  xDistance = 2,
  yDistance = -2,
  spread = 1,
  scaleDistance = 1.1,
  rotateYDistance = 10,
  transition = { ease: 'easeInOut' }
}) => {
  const Component = as;
  const text = children || '';
  
  const letters = useMemo(() => {
    return text.split('').map((char, index) => ({
      char: char === ' ' ? '\u00A0' : char, // Non-breaking space
      index
    }));
  }, [text]);

  const baseDelay = 0.1;
  const letterDelay = 0.03;

  return (
    <Component
      className={`inline-block ${className}`}
      style={{
        '--base-color': '#9ca3af', // gray-400
        '--base-gradient-color': '#f97316', // orange-500
      }}
    >
      {letters.map(({ char, index }) => (
        <motion.span
          key={index}
          className="inline-block relative"
          initial={{
            opacity: 0.7,
            scale: 1,
            rotateY: 0,
            z: 0,
          }}
          animate={{
            opacity: [0.7, 1, 0.7],
            scale: [1, scaleDistance, 1],
            rotateY: [0, rotateYDistance, 0],
            z: [0, zDistance, 0],
            x: [0, xDistance, 0],
            y: [0, yDistance, 0],
          }}
          transition={{
            duration: duration,
            delay: baseDelay + index * letterDelay * spread,
            repeat: Infinity,
            repeatDelay: 0.5,
            ...transition,
          }}
          style={{
            background: 'linear-gradient(45deg, var(--base-color), var(--base-gradient-color), var(--base-color))',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundSize: '200% 200%',
          }}
        >
          {char}
        </motion.span>
      ))}
    </Component>
  );
};

export default TextShimmerWave;
