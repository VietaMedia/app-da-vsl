'use client';
import { Children } from 'react';
import { motion, useReducedMotion } from 'motion/react';

export default function Cascata({ children, className = '' }) {
  const reduzida = useReducedMotion();
  const items = Children.toArray(children);
  return (
    <div className={className}>
      {items.map((child, i) =>
        reduzida ? (
          <div key={child.key ?? i}>{child}</div>
        ) : (
          <motion.div
            key={child.key ?? i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.12, ease: 'easeOut' }}
          >
            {child}
          </motion.div>
        )
      )}
    </div>
  );
}
