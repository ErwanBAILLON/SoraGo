import { motion, HTMLMotionProps } from 'framer-motion';
import React from 'react';

type MotionDivProps = HTMLMotionProps<'div'>;

export const MotionDiv: React.FC<MotionDivProps> = ({ children, ...props }) => (
  <motion.div {...props}>{children}</motion.div>
);

// Vous pouvez ajouter d'autres éléments motion si nécessaire
export const MotionSection: React.FC<HTMLMotionProps<'section'>> = ({ children, ...props }) => (
  <motion.section {...props}>{children}</motion.section>
);
