"use client";

import React, { useRef } from "react";
import { motion, useInView } from "motion/react";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  duration?: number;
  once?: boolean;
}

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  distance = 24,
  duration = 0.55,
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: "-50px" });

  const getInitialPosition = () => {
    switch (direction) {
      case "up":
        return { y: distance, x: 0 };
      case "down":
        return { y: -distance, x: 0 };
      case "left":
        return { x: distance, y: 0 };
      case "right":
        return { x: -distance, y: 0 };
      case "none":
        return { x: 0, y: 0 };
    }
  };

  const initialPos = getInitialPosition();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...initialPos }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...initialPos }}
      transition={{
        duration,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Hand-drawn highlighter marker component
 */
export function SketchHighlight({
  children,
  color = "yellow",
  className = "",
}: {
  children: React.ReactNode;
  color?: "yellow" | "orange" | "emerald" | "cyan" | "rose";
  className?: string;
}) {
  const colorMap = {
    yellow: "bg-amber-300/80 dark:bg-amber-500/40 text-zinc-950 dark:text-amber-100",
    orange: "bg-orange-300/80 dark:bg-orange-500/40 text-zinc-950 dark:text-orange-100",
    emerald: "bg-emerald-300/80 dark:bg-emerald-500/40 text-zinc-950 dark:text-emerald-100",
    cyan: "bg-sky-300/80 dark:bg-sky-500/40 text-zinc-950 dark:text-sky-100",
    rose: "bg-rose-300/80 dark:bg-rose-500/40 text-zinc-950 dark:text-rose-100",
  };

  return (
    <span className={`relative inline-block px-1.5 py-0.5 mx-0.5 z-0 font-semibold ${className}`}>
      <span
        aria-hidden="true"
        className={`absolute inset-0 -skew-y-1 -rotate-[0.6deg] rounded-sm -z-10 ${colorMap[color]} transition-transform duration-200 group-hover:scale-105`}
      />
      {children}
    </span>
  );
}

/**
 * Realistic Washi Tape strip for sticky notes & sketchbook cards
 */
export function WashiTape({
  className = "",
  color = "amber",
}: {
  className?: string;
  color?: "amber" | "neutral" | "orange" | "rose";
}) {
  const tapeColors = {
    amber: "bg-amber-200/60 dark:bg-amber-400/25 border-amber-300/40 dark:border-amber-400/20 text-amber-900/40",
    neutral: "bg-zinc-200/60 dark:bg-zinc-700/30 border-zinc-300/50 dark:border-zinc-600/30 text-zinc-500/30",
    orange: "bg-orange-200/60 dark:bg-orange-500/25 border-orange-300/40 dark:border-orange-500/20 text-orange-950/40",
    rose: "bg-rose-200/60 dark:bg-rose-500/25 border-rose-300/40 dark:border-rose-500/20 text-rose-950/40",
  };

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 backdrop-blur-[1px] border-t border-b shadow-xs rotate-[-1.5deg] z-20 ${tapeColors[color]} ${className}`}
      style={{
        clipPath: "polygon(5% 0%, 95% 0%, 100% 50%, 95% 100%, 5% 100%, 0% 50%)",
      }}
    />
  );
}

/**
 * Hand-drawn doodle underlines and accents
 */
export function DoodleUnderline({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 250 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full overflow-visible ${className}`}
      aria-hidden="true"
    >
      <path
        d="M3 10C50 3 150 2 247 9"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M12 11C70 6 180 5 235 11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}

export function DoodleArrow({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-10 h-8 inline-block overflow-visible ${className}`}
      aria-hidden="true"
    >
      <path
        d="M4 24C12 28 28 27 42 12M42 12C36 12 32 14 28 17M42 12C41 18 40 22 41 27"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DoodleStar({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-5 h-5 inline-block overflow-visible ${className}`}
      aria-hidden="true"
    >
      <path
        d="M12 2L13.8 8.8L20.5 7L16.2 12.5L21.5 17L14.8 16.2L13.2 22.5L10.2 16.8L3.5 19L7 13.5L2 9.5L8.5 9.5L12 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DoodlePaperClip({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-3.5 h-7 inline-block overflow-visible ${className}`}
      aria-hidden="true"
    >
      <path
        d="M7 16V40C7 45 10.5 49 15 49C19.5 49 23 45 23 40V10C23 6 20 3 16 3C12 3 9 6 9 10V38C9 40.5 10.8 42.5 13 42.5C15.2 42.5 17 40.5 17 38V16"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DoodleSparkle({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`size-3.5 inline-block overflow-visible ${className}`}
      aria-hidden="true"
    >
      <path
        d="M12 0C12 6.5 6.5 12 0 12C6.5 12 12 17.5 12 24C12 17.5 17.5 12 24 12C17.5 12 12 6.5 12 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

