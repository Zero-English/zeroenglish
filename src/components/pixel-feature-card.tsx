"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
  AnimatePresence,
} from "motion/react";
import { Bell, Flame, BookOpen, Check, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PixelFeatureCardProps {
  className?: string;
  /** Image URL for the phone screen mockup. */
  screenImageUrl?: string;
  /** Sample avatar image URL (Unsplash demo). Pass custom image file or URL to replace. */
  avatarUrl?: string;
  userName?: string;
  greeting?: string;
  score?: number;
  dotShape?: "circle" | "square" | "diamond";
  pixelColor?: string;
  perspectiveFloor?: boolean;
}

// 4x4 Bayer Ordered Dithering Matrix
const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

// Hash function for pseudo-random gradient value noise
function hash(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}

// Smooth interpolated 2D value noise
function smoothNoise(x: number, y: number): number {
  const i = Math.floor(x);
  const j = Math.floor(y);
  const fx = x - i;
  const fy = y - j;
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);

  const a = hash(i, j);
  const b = hash(i + 1, j);
  const c = hash(i, j + 1);
  const d = hash(i + 1, j + 1);

  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
}

export function PixelFeatureCard({
  className,
  screenImageUrl = "/assets/images/hero-phone-screen.png",
  avatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  userName = "Alex Morgan",
  greeting = "Good morning",
  score = 88,
  dotShape = "circle",
  pixelColor,
  perspectiveFloor = true,
}: PixelFeatureCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Pointer position relative to canvas
  const mousePos = useRef<{ x: number; y: number; active: boolean }>({
    x: -999,
    y: -999,
    active: false,
  });

  // Ripples pool
  const ripples = useRef<Ripple[]>([]);
  const lastRippleTime = useRef<number>(0);
  const entryRing = useRef<{ radius: number; maxRadius: number; active: boolean }>({
    radius: 0,
    maxRadius: 0,
    active: true,
  });

  const isVisible = useRef<boolean>(true);

  // 3D Tilt Spring Physics for Phone Mockup
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 180, mass: 0.6 };
  const rotateX = useSpring(mouseY, springConfig);
  const rotateY = useSpring(mouseX, springConfig);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      mousePos.current.x = clientX;
      mousePos.current.y = clientY;
      mousePos.current.active = true;

      if (!prefersReducedMotion) {
        // Calculate tilt normalized between -12 and +12 deg
        const normX = (clientX / rect.width - 0.5) * 16;
        const normY = -(clientY / rect.height - 0.5) * 16;
        mouseX.set(normX);
        mouseY.set(normY);
      }
    },
    [mouseX, mouseY, prefersReducedMotion]
  );

  const handlePointerLeave = useCallback(() => {
    mousePos.current.active = false;
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ripples.current.push({
      x,
      y,
      radius: 0,
      maxRadius: Math.max(rect.width, rect.height) * 1.1,
      alpha: 1.0,
      speed: 8,
    });
  }, []);

  // IntersectionObserver to pause loop offscreen
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible.current = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Canvas Animation Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let startTime = performance.now();

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = parent.clientWidth;
      const height = parent.clientHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
      entryRing.current.maxRadius = Math.hypot(width, height) * 0.85;
    };

    resize();
    window.addEventListener("resize", resize);

    const SPACING = 16; // Grid pixel step
    const NOISE_SCALE_1 = 0.012;
    const NOISE_SCALE_2 = 0.024;

    const render = (now: number) => {
      if (!isVisible.current && !prefersReducedMotion) {
        animId = requestAnimationFrame(render);
        return;
      }

      const elapsed = (now - startTime) * 0.001;
      const width = canvas.width / (Math.min(window.devicePixelRatio || 1, 2));
      const height = canvas.height / (Math.min(window.devicePixelRatio || 1, 2));

      ctx.clearRect(0, 0, width, height);

      // Handle Entry Ring expansion on mount
      if (entryRing.current.active) {
        entryRing.current.radius += 10;
        if (entryRing.current.radius > entryRing.current.maxRadius) {
          entryRing.current.active = false;
        }
      }

      // Handle periodic idle ripple
      if (now - lastRippleTime.current > 4200 && !mousePos.current.active) {
        lastRippleTime.current = now;
        ripples.current.push({
          x: width * 0.5 + (Math.random() - 0.5) * 80,
          y: height * 0.45 + (Math.random() - 0.5) * 60,
          radius: 0,
          maxRadius: Math.hypot(width, height) * 0.65,
          alpha: 0.85,
          speed: 4.5,
        });
      }

      // Update active ripples
      for (let r = ripples.current.length - 1; r >= 0; r--) {
        const rip = ripples.current[r];
        rip.radius += rip.speed;
        rip.alpha *= 0.965;
        if (rip.radius > rip.maxRadius || rip.alpha < 0.02) {
          ripples.current.splice(r, 1);
        }
      }

      // Parse dot color
      const isDark = document.documentElement.classList.contains("dark");
      const defaultDotRgb = isDark ? "210, 210, 220" : "40, 40, 48";
      const customRgb = pixelColor || defaultDotRgb;

      // Draw Main Dithered Pixel Cloud Field
      const cols = Math.ceil(width / SPACING);
      const rows = Math.ceil(height / SPACING);

      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const px = i * SPACING;
          const py = j * SPACING;

          // Layer 1 & 2 Value Noise drifting slowly
          const timeOffset1 = elapsed * 0.35;
          const timeOffset2 = elapsed * 0.22;
          const n1 = smoothNoise(px * NOISE_SCALE_1 + timeOffset1, py * NOISE_SCALE_1 - timeOffset1 * 0.5);
          const n2 = smoothNoise(px * NOISE_SCALE_2 - timeOffset2, py * NOISE_SCALE_2 + timeOffset2 * 0.8);
          let intensity = n1 * 0.55 + n2 * 0.45;

          // Bayer Ordered Dither check
          const bayerThreshold = (BAYER_4X4[j % 4][i % 4] + 0.5) / 16;

          // Pointer Light-up radial glow
          if (mousePos.current.active) {
            const dist = Math.hypot(px - mousePos.current.x, py - mousePos.current.y);
            const GLOW_RADIUS = 150;
            if (dist < GLOW_RADIUS) {
              const glow = Math.pow(1 - dist / GLOW_RADIUS, 2) * 0.5;
              intensity += glow;
            }
          }

          // Ripples wave modulation
          for (let r = 0; r < ripples.current.length; r++) {
            const rip = ripples.current[r];
            const dist = Math.hypot(px - rip.x, py - rip.y);
            const waveDist = Math.abs(dist - rip.radius);
            if (waveDist < 45) {
              const wave = Math.cos((waveDist / 45) * Math.PI * 0.5) * rip.alpha * 0.55;
              intensity += wave;
            }
          }

          // Individual dot shimmer based on coordinate phase
          const shimmer = Math.sin(elapsed * 2.2 + px * 0.05 + py * 0.08) * 0.08;
          intensity += shimmer;

          // Filter by threshold
          if (intensity > bayerThreshold * 0.8) {
            // Determine stepped dot size
            const delta = intensity - bayerThreshold * 0.8;
            let radius = 1.0;
            let alpha = 0.25;

            if (delta > 0.45) {
              radius = 2.6;
              alpha = 0.65;
            } else if (delta > 0.2) {
              radius = 1.8;
              alpha = 0.45;
            }

            ctx.fillStyle = `rgba(${customRgb}, ${alpha})`;

            if (dotShape === "circle") {
              ctx.beginPath();
              ctx.arc(px, py, radius, 0, Math.PI * 2);
              ctx.fill();
            } else if (dotShape === "square") {
              ctx.fillRect(px - radius, py - radius, radius * 2, radius * 2);
            } else {
              // Diamond
              ctx.beginPath();
              ctx.moveTo(px, py - radius * 1.3);
              ctx.lineTo(px + radius * 1.3, py);
              ctx.lineTo(px, py + radius * 1.3);
              ctx.lineTo(px - radius * 1.3, py);
              ctx.closePath();
              ctx.fill();
            }
          }
        }
      }

      // Optional Perspective Floor along the bottom rolling toward the viewer
      if (perspectiveFloor) {
        const floorStartY = height * 0.68;
        const floorHeight = height - floorStartY;
        const floorRows = 10;

        for (let r = 0; r < floorRows; r++) {
          const rowNorm = (r + 1) / floorRows;
          const perspY = floorStartY + Math.pow(rowNorm, 1.8) * floorHeight;
          const speed = (elapsed * 25) % (floorHeight / floorRows);
          const currentY = perspY + speed * rowNorm;

          if (currentY > height) continue;

          const rowAlpha = Math.min(1, rowNorm * 0.5);
          const rowSpacing = SPACING * (1.2 + rowNorm * 1.5);
          const floorCols = Math.ceil(width / rowSpacing) + 2;

          ctx.fillStyle = `rgba(${customRgb}, ${rowAlpha * 0.4})`;

          for (let c = -1; c < floorCols; c++) {
            const fx = c * rowSpacing + (r % 2 === 0 ? rowSpacing * 0.5 : 0);
            const dotSize = 0.8 + rowNorm * 1.8;

            ctx.beginPath();
            ctx.arc(fx, currentY, dotSize, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      if (!prefersReducedMotion) {
        animId = requestAnimationFrame(render);
      }
    };

    if (prefersReducedMotion) {
      render(performance.now());
    } else {
      animId = requestAnimationFrame(render);
    }

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [dotShape, pixelColor, perspectiveFloor, prefersReducedMotion]);

  // Mini 7-day bar chart data
  const weeklyActivity = [
    { day: "M", height: "42%" },
    { day: "T", height: "65%" },
    { day: "W", height: "54%" },
    { day: "T", height: "82%" },
    { day: "F", height: "70%" },
    { day: "S", height: "45%" },
    { day: "S", height: "94%", active: true },
  ];

  return (
    <motion.div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative mx-auto flex w-full h-[470px] sm:h-[530px] lg:h-[580px] flex-col items-center justify-start pt-8 sm:pt-11 lg:pt-14 overflow-hidden",
        "rounded-[28px] sm:rounded-[36px] bg-white dark:bg-[#151518]",
        "border border-black/[0.06] dark:border-white/[0.08]",
        "shadow-[0_24px_64px_-16px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-[0_24px_64px_-16px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.06)]",
        "select-none cursor-pointer",
        className
      )}
      style={{ perspective: 1200 }}
    >
      {/* 2D Canvas Background for Dithered Pixel Clouds */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 size-full z-0"
      />

      {/* Floating Interactive Phone Mockup */}
      <motion.div
        style={{
          rotateX: prefersReducedMotion ? 0 : rotateX,
          rotateY: prefersReducedMotion ? 0 : rotateY,
          transformStyle: "preserve-3d",
        }}
        initial={{ y: 60, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{
          type: "spring",
          stiffness: 90,
          damping: 20,
          mass: 0.8,
          delay: 0.15,
        }}
        className="relative z-10 w-[285px] sm:w-[325px] md:w-[350px] lg:w-[370px] origin-top transform-gpu"
      >
        {/* Ink Phone Outer Chassis Frame */}
        <div className="relative rounded-[50px] sm:rounded-[54px] bg-[#0c0c0e] p-2.5 sm:p-3 shadow-[0_32px_80px_-16px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.12)_inset]">
          {/* Top Speaker Earphone Slit in Bezel */}
          <div className="pointer-events-none absolute top-1.5 left-1/2 -translate-x-1/2 w-11 sm:w-13 h-1 rounded-full bg-zinc-800/90" />

          {/* Side Hardware Buttons */}
          <div className="absolute -left-[3px] top-20 h-5 w-[3px] rounded-l-sm bg-zinc-700/80" />
          <div className="absolute -left-[3px] top-28 h-10 w-[3px] rounded-l-sm bg-zinc-700/80" />
          <div className="absolute -left-[3px] top-41 h-10 w-[3px] rounded-l-sm bg-zinc-700/80" />
          <div className="absolute -right-[3px] top-30 h-14 w-[3px] rounded-r-sm bg-zinc-700/80" />

          {/* Inner Phone Screen */}
          {screenImageUrl ? (
            <div className="relative overflow-hidden rounded-[40px] sm:rounded-[44px] bg-[#fafafa] dark:bg-[#121214] shadow-inner">
              {/* Dynamic Island Pill */}
              <div className="pointer-events-none absolute top-2.5 sm:top-3 left-1/2 -translate-x-1/2 z-30 flex h-5 sm:h-5.5 w-22 sm:w-26 items-center justify-between rounded-full bg-black px-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.6)] ring-1 ring-white/10">
                <span className="size-2 sm:size-2.5 rounded-full bg-[#141416] ring-1 ring-white/15" />
                <span className="size-1.5 sm:size-2 rounded-full bg-[#0a0a0c] ring-1 ring-white/5" />
              </div>

              {/* App Screen Image */}
              <img
                src={screenImageUrl}
                alt="Zero English Mobile App"
                className="w-full h-auto object-cover object-top select-none pointer-events-none block"
                draggable={false}
              />

              {/* Subtle glass glare reflection overlay */}
              <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-tr from-transparent via-white/[0.04] to-white/[0.12] opacity-70" />
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-[40px] sm:rounded-[44px] bg-[#fafafa] dark:bg-[#121214] p-3.5 sm:p-4 pb-7 sm:pb-8 text-zinc-900 dark:text-zinc-100 shadow-inner">
            {/* Dynamic Island Pill */}
            <div className="relative z-20 mx-auto flex h-6 w-24 items-center justify-between rounded-full bg-black px-2.5 shadow-md">
              <span className="size-2 rounded-full bg-[#1c1c1e] ring-1 ring-white/10" />
              <span className="size-2.5 rounded-full bg-emerald-500/80 animate-pulse" />
            </div>

            {/* App Screen Content: Staggered Build */}
            <div className="mt-3.5 space-y-3">
              {/* Header: Greeting + User Avatar + Bell */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="relative size-9 rounded-full ring-2 ring-black/5 dark:ring-white/10 overflow-hidden">
                    {/* Sample image from Unsplash demo */}
                    <img
                      src={avatarUrl}
                      alt={userName}
                      className="size-full object-cover"
                    />
                    <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#121214]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                      {greeting}
                    </p>
                    <h4 className="text-xs font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                      {userName}
                    </h4>
                  </div>
                </div>

                <div className="flex size-7.5 items-center justify-center rounded-full bg-black/[0.04] text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-300">
                  <Bell className="size-3.5" />
                </div>
              </div>

              {/* English Mastery Score Hero Card */}
              <div className="rounded-[20px] border border-black/[0.05] bg-white p-3 shadow-2xs dark:border-white/[0.06] dark:bg-[#1a1a1e]">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      English Mastery
                    </span>
                    <div className="mt-0.5 flex items-baseline gap-1">
                      <span className="text-2xl font-bold tracking-tight tabular-nums text-zinc-900 dark:text-zinc-100">
                        {score}
                      </span>
                      <span className="text-xs text-zinc-400">/100</span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                    <TrendingUp className="size-2.5" />
                    +12%
                  </span>
                </div>

                {/* Mini 7-Day Animated Bar Chart */}
                <div className="mt-3 flex items-end justify-between gap-1.5 pt-1">
                  {weeklyActivity.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex flex-1 flex-col items-center gap-1"
                    >
                      <div className="relative h-12 w-full flex items-end justify-center rounded-full bg-black/[0.04] dark:bg-white/[0.06] p-0.5">
                        <motion.div
                          initial={{ height: 0 }}
                          whileInView={{ height: item.height }}
                          viewport={{ once: true }}
                          transition={{
                            duration: 0.6,
                            delay: 0.2 + idx * 0.05,
                            ease: [0.33, 1, 0.68, 1],
                          }}
                          className={cn(
                            "w-full rounded-full transition-colors",
                            item.active
                              ? "bg-amber-500 shadow-xs"
                              : "bg-zinc-800/80 dark:bg-zinc-200"
                          )}
                        />
                      </div>
                      <span className="text-[9px] font-medium text-zinc-400">
                        {item.day}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3 Staggered Stat Rows */}
              <div className="space-y-1.5 pt-0.5">
                {/* Row 1: Daily Vocab */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.35, duration: 0.4 }}
                  className="flex items-center justify-between rounded-[14px] bg-black/[0.03] p-2 dark:bg-white/[0.04]"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex size-6.5 items-center justify-center rounded-[8px] bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400">
                      <BookOpen className="size-3.5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 leading-none">
                        Daily Vocabulary
                      </p>
                      <p className="text-[9px] text-zinc-400 mt-0.5">
                        18 words mastered
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400">
                    A2
                  </span>
                </motion.div>

                {/* Row 2: Grammar Accuracy */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.45, duration: 0.4 }}
                  className="flex items-center justify-between rounded-[14px] bg-black/[0.03] p-2 dark:bg-white/[0.04]"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex size-6.5 items-center justify-center rounded-[8px] bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                      <Check className="size-3.5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 leading-none">
                        Grammar Accuracy
                      </p>
                      <p className="text-[9px] text-zinc-400 mt-0.5">
                        Tenses & Prepositions
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                    94%
                  </span>
                </motion.div>

                {/* Row 3: Active Streak */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.55, duration: 0.4 }}
                  className="flex items-center justify-between rounded-[14px] bg-black/[0.03] p-2 dark:bg-white/[0.04]"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex size-6.5 items-center justify-center rounded-[8px] bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                      <Flame className="size-3.5 fill-amber-500 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 leading-none">
                        Active Streak
                      </p>
                      <p className="text-[9px] text-zinc-400 mt-0.5">
                        Daily blitz challenge
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold tabular-nums text-amber-600 dark:text-amber-400">
                    14d 🔥
                  </span>
                </motion.div>
              </div>
            </div>
          </div>
          )}
        </div>
      </motion.div>

      {/* Subtle floor shadow / ambient depth fade at bottom container edge */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white/20 via-white/5 to-transparent dark:from-black/40 dark:via-black/10 dark:to-transparent z-20" />
    </motion.div>
  );
}
