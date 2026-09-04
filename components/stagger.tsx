"use client";

import { motion, Variants } from "motion/react";
import { MouseEventHandler, ReactNode } from "react";

const container: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.98, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 24,
    },
  },
};

export function StaggerContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  onDoubleClick,
}: {
  children: ReactNode;
  className?: string;
  onDoubleClick?: MouseEventHandler<HTMLDivElement>;
}) {
  return (
    <motion.div
      variants={staggerItem}
      className={className}
      onDoubleClick={onDoubleClick}
    >
      {children}
    </motion.div>
  );
}
