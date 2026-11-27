"use client";

import React from "react";
import Link from "next/link";
import { MotionConfig, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  BookOpen,
  Check,
  Flame,
  GraduationCap,
  Layers,
  Sparkles,
  Target,
} from "lucide-react";
import { useT } from "@/components/language-provider";
import { cn } from "@/lib/utils";

const HERO_EASE = [0.22, 1, 0.36, 1] as const;

const HERO_SPRING = {
  type: "spring",
  stiffness: 320,
  damping: 26,
  mass: 0.9,
} as const;

interface HeroCleanShowcaseProps {
  className?: string;
}

const HERO_CEFR_PILLS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

const ROUTINE_SAMPLE = [
  {
    key: "words",
    labelEn: "Words learned",
    labelBn: "শেখা শব্দ",
    progress: "0/10",
    done: false,
  },
  {
    key: "quiz",
    labelEn: "Quiz questions",
    labelBn: "কুইজ প্রশ্ন",
    progress: "0/20",
    done: false,
  },
  {
    key: "grammar",
    labelEn: "Grammar rules",
    labelBn: "গ্রামার রুলস",
    progress: "1/1",
    done: true,
  },
  {
    key: "practice",
    labelEn: "Daily practice",
    labelBn: "দৈনিক অনুশীলন",
    progress: "0/1",
    done: false,
  },
] as const;

function SampleProgressRing({
  pct,
  size = 42,
  stroke = 4,
  reducedMotion = false,
}: {
  pct: number;
  size?: number;
  stroke?: number;
  reducedMotion?: boolean;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-90"
      aria-hidden="true"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth={stroke}
        style={{ stroke: "var(--hero-rule)" }}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        initial={reducedMotion ? false : { strokeDashoffset: c }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.9, delay: 0.38, ease: HERO_EASE }}
        style={{ stroke: "var(--hero-emerald)" }}
      />
    </svg>
  );
}

export function HeroCleanShowcase({ className }: HeroCleanShowcaseProps) {
  const t = useT();
  const shouldReduceMotion = Boolean(useReducedMotion());

  const fadeUp = (delay: number) =>
    shouldReduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.45, delay, ease: HERO_EASE },
        };

  return (
    <MotionConfig reducedMotion="user">
      <section
        aria-labelledby="hero-heading"
        className={cn("hero-shell w-full", className)}
      >
        <div className="hero-container">
          <div className="hero-grid">
            {/* Left Editorial Track — Orange theme accents, geometric shapes & quick level access */}
            <div className="hero-copy-col">
              <motion.div
                aria-hidden="true"
                className="hero-left-ring"
                initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.88 }}
                animate={
                  shouldReduceMotion
                    ? { opacity: 1 }
                    : {
                        opacity: 1,
                        scale: 1,
                        y: [0, -6, 0],
                      }
                }
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : {
                        opacity: { duration: 0.55, ease: HERO_EASE },
                        scale: { duration: 0.65, ease: HERO_EASE },
                        y: {
                          duration: 7,
                          repeat: Infinity,
                          ease: "easeInOut",
                        },
                      }
                }
              />

              <motion.div
                aria-hidden="true"
                className="hero-left-shape"
                initial={
                  shouldReduceMotion
                    ? false
                    : { opacity: 0, scale: 0.72, rotate: 0 }
                }
                animate={
                  shouldReduceMotion
                    ? { opacity: 1 }
                    : {
                        opacity: 1,
                        scale: 1,
                        y: [0, -5, 0],
                        rotate: [12, 19, 12],
                      }
                }
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : {
                        opacity: { duration: 0.45, delay: 0.14, ease: HERO_EASE },
                        scale: { ...HERO_SPRING, delay: 0.14 },
                        y: {
                          duration: 6.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.5,
                        },
                        rotate: {
                          duration: 8.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.5,
                        },
                      }
                }
              />

              <div aria-hidden="true" className="hero-geo-mark">
                <motion.span
                  className="hero-geo-pill origin-left"
                  initial={shouldReduceMotion ? false : { scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.04, ease: HERO_EASE }}
                />
                <motion.span
                  className="hero-geo-circle"
                  initial={shouldReduceMotion ? false : { scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ ...HERO_SPRING, delay: 0.12 }}
                />
                <motion.span
                  className="hero-geo-square"
                  initial={shouldReduceMotion ? false : { scale: 0, opacity: 0, rotate: -25 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ ...HERO_SPRING, delay: 0.18 }}
                />
              </div>

              <motion.h1
                id="hero-heading"
                className="hero-heading"
                {...fadeUp(0.06)}
              >
                {t(
                  "সহজ নিয়মে জরুরি ইংরেজি শিখুন।",
                  "Learn the English that matters."
                )}
              </motion.h1>

              <motion.div className="hero-lead-wrap" {...fadeUp(0.12)}>
                <p className="hero-lead">
                  {t(
                    "A1 থেকে C1 অক্সফোর্ড শব্দ, বাংলা অর্থ ও প্রতিদিনের অনুশীলন একসাথে।",
                    "Oxford A1 to C1 words, Bengali meanings, and focused daily practice."
                  )}
                </p>
              </motion.div>

              <motion.div className="hero-actions" {...fadeUp(0.18)}>
                <a href="#levels" className="hero-btn-primary group">
                  <span>{t("শেখা শুরু করুন", "Start learning")}</span>
                  <ArrowRight
                    className="size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </a>

                <Link href="/grammar" className="hero-btn-secondary">
                  <Layers className="size-4 shrink-0" aria-hidden="true" />
                  <span>{t("গ্রামার গাইড", "Grammar guide")}</span>
                </Link>
              </motion.div>

              {/* Quick CEFR Level Links */}
              <motion.div className="hero-level-strip" {...fadeUp(0.24)}>
                <p className="hero-level-caption">
                  {t("সরাসরি লেভেলে যান", "Jump to a level")}
                </p>
                <div className="hero-level-pills">
                  {HERO_CEFR_PILLS.map((lvl, idx) => (
                    <motion.div
                      key={lvl}
                      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.32,
                        delay: 0.25 + idx * 0.035,
                        ease: HERO_EASE,
                      }}
                      whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                      whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
                    >
                      <Link
                        href={`/vocabulary/${lvl.toLowerCase()}`}
                        className="hero-level-chip"
                      >
                        {lvl}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.dl className="hero-ledger" {...fadeUp(0.32)}>
                <div>
                  <dt>
                    <BookOpen
                      className="hero-ledger-icon size-3.5 shrink-0"
                      aria-hidden="true"
                    />
                    <span>{t("পাঠ্যক্রম", "Curriculum")}</span>
                  </dt>
                  <dd>{t("অক্সফোর্ড A1 থেকে C1", "Oxford A1 to C1")}</dd>
                </div>
                <div>
                  <dt>
                    <Layers
                      className="hero-ledger-icon size-3.5 shrink-0"
                      aria-hidden="true"
                    />
                    <span>{t("ব্যাকরণ", "Grammar")}</span>
                  </dt>
                  <dd>{t("সহজ রুলস ও উদাহরণ", "Core rules & drills")}</dd>
                </div>
                <div>
                  <dt>
                    <Sparkles
                      className="hero-ledger-icon size-3.5 shrink-0"
                      aria-hidden="true"
                    />
                    <span>{t("অনুশীলন", "Practice")}</span>
                  </dt>
                  <dd>{t("দৈনিক কুইজ ও রুটিন", "Daily quiz routine")}</dd>
                </div>
              </motion.dl>
            </div>

            {/* Right Stage — Clean iPhone 11 Mockup framed by crisp architectural shapes */}
            <div
              className="hero-phone-col"
              data-slot="hero-phone"
              data-kind="product"
            >
              {/* Geometric Stage Shapes */}
              <motion.div
                aria-hidden="true"
                className="hero-shape-arch origin-bottom"
                initial={
                  shouldReduceMotion
                    ? false
                    : { opacity: 0, x: "-50%", scaleY: 0.9 }
                }
                animate={
                  shouldReduceMotion
                    ? { opacity: 1 }
                    : { opacity: 1, x: "-50%", scaleY: 1 }
                }
                transition={{ duration: 0.55, delay: 0.08, ease: HERO_EASE }}
              />

              <motion.div
                aria-hidden="true"
                className="hero-shape-ring"
                initial={
                  shouldReduceMotion
                    ? false
                    : { opacity: 0, x: "-50%", scale: 0.92, rotate: 0 }
                }
                animate={
                  shouldReduceMotion
                    ? { opacity: 1 }
                    : { opacity: 1, x: "-50%", scale: 1, rotate: 360 }
                }
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : {
                        opacity: { duration: 0.55, delay: 0.12, ease: HERO_EASE },
                        scale: { duration: 0.65, delay: 0.12, ease: HERO_EASE },
                        rotate: {
                          duration: 54,
                          repeat: Infinity,
                          ease: "linear",
                        },
                      }
                }
              />

              <motion.div
                aria-hidden="true"
                className="hero-shape-squircle"
                initial={
                  shouldReduceMotion
                    ? false
                    : { opacity: 0, scale: 0.78, rotate: -18 }
                }
                animate={
                  shouldReduceMotion
                    ? { opacity: 1 }
                    : {
                        opacity: 1,
                        scale: 1,
                        y: [0, -7, 0],
                        rotate: [-10, -5, -10],
                      }
                }
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : {
                        opacity: { duration: 0.45, delay: 0.2, ease: HERO_EASE },
                        scale: { ...HERO_SPRING, delay: 0.2 },
                        y: {
                          duration: 6,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.6,
                        },
                        rotate: {
                          duration: 7.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.6,
                        },
                      }
                }
              >
                <span className="hero-shape-squircle-inner" />
              </motion.div>

              <motion.div
                aria-hidden="true"
                className="hero-shape-amber"
                initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.7 }}
                animate={
                  shouldReduceMotion
                    ? { opacity: 1 }
                    : { opacity: 1, scale: 1, y: [0, 6, 0] }
                }
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : {
                        opacity: { duration: 0.45, delay: 0.26, ease: HERO_EASE },
                        scale: { ...HERO_SPRING, delay: 0.26 },
                        y: {
                          duration: 5.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.8,
                        },
                      }
                }
              />

              <motion.div
                aria-hidden="true"
                className="hero-shape-emerald-pill"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                animate={
                  shouldReduceMotion
                    ? { opacity: 1 }
                    : { opacity: 1, y: [0, -6, 0] }
                }
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : {
                        opacity: { duration: 0.45, delay: 0.3, ease: HERO_EASE },
                        y: {
                          duration: 6.8,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 1,
                        },
                      }
                }
              />

              <motion.div
                aria-hidden="true"
                className="hero-shape-sky-circle"
                initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.75 }}
                animate={
                  shouldReduceMotion
                    ? { opacity: 1 }
                    : { opacity: 1, scale: 1, y: [0, -5, 0] }
                }
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : {
                        opacity: { duration: 0.45, delay: 0.24, ease: HERO_EASE },
                        scale: { ...HERO_SPRING, delay: 0.24 },
                        y: {
                          duration: 5.8,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.7,
                        },
                      }
                }
              />

              <div aria-hidden="true" className="hero-shape-bracket" />

              <motion.div
                aria-hidden="true"
                className="hero-shape-dots"
                initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.22, ease: HERO_EASE }}
              >
                {Array.from({ length: 16 }).map((_, idx) => (
                  <span key={idx} className="hero-shape-dot" />
                ))}
              </motion.div>

              <motion.div
                role="img"
                aria-label={t(
                  "জিরো ইংলিশ মোবাইল ড্যাশবোর্ডের নমুনা প্রদর্শনী",
                  "Zero English mobile dashboard preview inside an iPhone 11 frame"
                )}
                className="hero-iphone-chassis"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 34 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 220,
                  damping: 26,
                  delay: 0.1,
                }}
              >
              {/* Aluminum Frame Antenna Bands */}
              <span aria-hidden="true" className="hero-antenna-tick hero-antenna-tick--left" />
              <span aria-hidden="true" className="hero-antenna-tick hero-antenna-tick--right" />

              {/* Side Hardware Buttons: Mute switch, Vol+, Vol-, Side Power */}
              <span aria-hidden="true" className="hero-hw-btn hero-hw-btn--mute" />
              <span aria-hidden="true" className="hero-hw-btn hero-hw-btn--vol-up" />
              <span aria-hidden="true" className="hero-hw-btn hero-hw-btn--vol-down" />
              <span aria-hidden="true" className="hero-hw-btn hero-hw-btn--power" />

              {/* Obsidian Front Display Glass Bezel */}
              <div className="hero-iphone-bezel">
                <div className="hero-iphone-screen">
                  {/* Signature iPhone 11 Curved Top Notch */}
                  <div aria-hidden="true" className="hero-notch">
                    <svg
                      viewBox="0 0 10 10"
                      className="hero-notch-fillet hero-notch-fillet--left"
                      fill="currentColor"
                    >
                      <path d="M0 0 H10 V10 C10 4.5 5.5 0 0 0 Z" />
                    </svg>
                    <svg
                      viewBox="0 0 10 10"
                      className="hero-notch-fillet hero-notch-fillet--right"
                      fill="currentColor"
                    >
                      <path d="M10 0 H0 V10 C0 4.5 4.5 0 10 0 Z" />
                    </svg>
                    <span className="hero-sensor" />
                    <span className="hero-speaker" />
                    <span className="hero-camera">
                      <span className="hero-camera-optic" />
                    </span>
                  </div>

                  {/* Status Bar Flanking the Notch */}
                  <div className="hero-status-bar">
                    <span className="pl-1 pt-0.5">9:41</span>

                    <div className="flex items-center gap-1.5 pt-0.5">
                      <svg
                        width="13"
                        height="9"
                        viewBox="0 0 13 9"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <rect x="0" y="6" width="2.2" height="3" rx="0.6" />
                        <rect x="3.5" y="4.2" width="2.2" height="4.8" rx="0.6" />
                        <rect x="7" y="2.2" width="2.2" height="6.8" rx="0.6" />
                        <rect x="10.5" y="0" width="2.2" height="9" rx="0.6" />
                      </svg>

                      <span className="text-[11px] leading-none">94%</span>

                      <span className="inline-flex items-center" aria-hidden="true">
                        <span
                          className="inline-flex h-[10px] w-[18px] items-center rounded-[2.5px] p-[1.5px]"
                          style={{ border: "1px solid var(--hero-ink-2)" }}
                        >
                          <span
                            className="h-full w-[90%] rounded-[1px]"
                            style={{ backgroundColor: "var(--hero-ink)" }}
                          />
                        </span>
                        <span
                          className="h-[4px] w-[1.5px] rounded-r-[1px]"
                          style={{ backgroundColor: "var(--hero-ink-2)" }}
                        />
                      </span>
                    </div>
                  </div>

                {/* Exact Dashboard UI Layout (Overview + 4 Stat Tiles + Daily Routine + Daily Practice) */}
                <div className="hero-screen-body">
                  {/* 1. Primary Overview Card */}
                  <div className="hero-app-card space-y-2.5">
                    {/* Inset Header */}
                    <div className="hero-app-inset space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p
                            className="text-[11px] font-medium"
                            style={{ color: "var(--hero-ink-3)" }}
                          >
                            {t("শুক্রবার, ২৭ নভেম্বর", "Friday, November 27")}
                          </p>
                          <p
                            className="mt-0.5 truncate text-[15px] font-bold tracking-tight"
                            style={{ color: "var(--hero-ink)" }}
                          >
                            {t("শুভ সকাল, শিক্ষার্থী", "Good morning, Tahmid Hasan")}
                          </p>
                        </div>

                        <span
                          className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums"
                          style={{
                            backgroundColor: "var(--hero-surface)",
                            color: "var(--hero-ink)",
                          }}
                        >
                          <Flame
                            className="size-3"
                            style={{
                              color: "var(--hero-amber)",
                              fill: "var(--hero-amber)",
                            }}
                            aria-hidden="true"
                          />
                          <span>1d</span>
                        </span>
                      </div>

                      {/* Overall Progress Row */}
                      <div
                        className="flex items-center gap-3 rounded-[11px] p-2.5"
                        style={{ backgroundColor: "var(--hero-surface)" }}
                      >
                        <div className="relative size-[42px] shrink-0">
                          <SampleProgressRing
                            pct={20}
                            size={42}
                            stroke={4}
                            reducedMotion={shouldReduceMotion}
                          />
                          <span
                            className="absolute inset-0 flex items-center justify-center text-[11px] font-bold tabular-nums"
                            style={{ color: "var(--hero-ink)" }}
                          >
                            20%
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className="text-[11px] font-medium"
                            style={{ color: "var(--hero-ink-2)" }}
                          >
                            {t("সামগ্রিক অগ্রগতি", "Overall progress")}
                          </p>
                          <p
                            className="mt-0.5 text-[13px] font-bold tabular-nums"
                            style={{ color: "var(--hero-ink)" }}
                          >
                            1,010{" "}
                            <span
                              className="text-[12px] font-normal"
                              style={{ color: "var(--hero-ink-3)" }}
                            >
                              / 5,089 {t("শব্দ", "words")}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 2x2 Sunken Metric Tiles (Exact 4 Dashboard Tiles) */}
                    <div className="hero-app-tiles">
                      <motion.div
                        className="hero-app-tile"
                        initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.34, delay: 0.28, ease: HERO_EASE }}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className="text-[11px] font-medium"
                            style={{ color: "var(--hero-ink-2)" }}
                          >
                            {t("শেখা শব্দ", "Learned")}
                          </span>
                          <GraduationCap
                            className="size-3.5 shrink-0"
                            style={{ color: "var(--hero-amber)" }}
                            aria-hidden="true"
                          />
                        </div>
                        <p
                          className="mt-1.5 text-[17px] font-bold leading-none tabular-nums"
                          style={{ color: "var(--hero-ink)" }}
                        >
                          1010
                        </p>
                        <p
                          className="mt-1 text-[11px]"
                          style={{ color: "var(--hero-ink-3)" }}
                        >
                          {t("মোট ৫০৮৯", "of 5089")}
                        </p>
                      </motion.div>

                      <motion.div
                        className="hero-app-tile"
                        initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.34, delay: 0.33, ease: HERO_EASE }}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className="text-[11px] font-medium"
                            style={{ color: "var(--hero-ink-2)" }}
                          >
                            {t("আজকের শব্দ", "Today")}
                          </span>
                          <Sparkles
                            className="size-3.5 shrink-0"
                            style={{ color: "var(--hero-sky)" }}
                            aria-hidden="true"
                          />
                        </div>
                        <p
                          className="mt-1.5 text-[17px] font-bold leading-none tabular-nums"
                          style={{ color: "var(--hero-ink)" }}
                        >
                          0
                        </p>
                        <p
                          className="mt-1 text-[11px]"
                          style={{ color: "var(--hero-ink-3)" }}
                        >
                          {t("লক্ষ্য ১০", "goal 10")}
                        </p>
                      </motion.div>

                      <motion.div
                        className="hero-app-tile"
                        initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.34, delay: 0.38, ease: HERO_EASE }}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className="text-[11px] font-medium"
                            style={{ color: "var(--hero-ink-2)" }}
                          >
                            {t("ধারাবাহিকতা", "Streak")}
                          </span>
                          <Flame
                            className="size-3.5 shrink-0"
                            style={{ color: "var(--hero-orange)" }}
                            aria-hidden="true"
                          />
                        </div>
                        <p
                          className="mt-1.5 text-[17px] font-bold leading-none tabular-nums"
                          style={{ color: "var(--hero-ink)" }}
                        >
                          1d
                        </p>
                        <p
                          className="mt-1 text-[11px]"
                          style={{ color: "var(--hero-ink-3)" }}
                        >
                          {t("টানা দিন", "days in a row")}
                        </p>
                      </motion.div>

                      <motion.div
                        className="hero-app-tile"
                        initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.34, delay: 0.43, ease: HERO_EASE }}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className="text-[11px] font-medium"
                            style={{ color: "var(--hero-ink-2)" }}
                          >
                            {t("দৈনিক লক্ষ্য", "Daily goal")}
                          </span>
                          <Target
                            className="size-3.5 shrink-0"
                            style={{ color: "var(--hero-emerald)" }}
                            aria-hidden="true"
                          />
                        </div>
                        <p
                          className="mt-1.5 text-[17px] font-bold leading-none tabular-nums"
                          style={{ color: "var(--hero-ink)" }}
                        >
                          0%
                        </p>
                        <p
                          className="mt-1 text-[11px]"
                          style={{ color: "var(--hero-ink-3)" }}
                        >
                          {t("০/১০ শব্দ", "0/10 words")}
                        </p>
                      </motion.div>
                    </div>
                  </div>

                  {/* 2. Daily Routine Checklist Card */}
                  <div className="hero-app-card space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="flex size-5 items-center justify-center rounded-[6px]"
                          style={{
                            backgroundColor: "var(--hero-well)",
                            color: "var(--hero-ink)",
                          }}
                        >
                          <Target className="size-3" aria-hidden="true" />
                        </span>
                        <span
                          className="text-[12.5px] font-bold"
                          style={{ color: "var(--hero-ink)" }}
                        >
                          {t("দৈনিক রুটিন", "Daily Routine")}
                        </span>
                      </div>
                      <span
                        className="rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums"
                        style={{
                          backgroundColor: "var(--hero-well)",
                          color: "var(--hero-ink-2)",
                        }}
                      >
                        1/4 {t("সম্পন্ন", "Done")}
                      </span>
                    </div>

                    <div
                      className="h-1 w-full overflow-hidden rounded-full"
                      style={{ backgroundColor: "var(--hero-rule)" }}
                    >
                      <motion.div
                        className="h-full w-1/4 origin-left rounded-full"
                        initial={shouldReduceMotion ? false : { scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.7, delay: 0.45, ease: HERO_EASE }}
                        style={{ backgroundColor: "var(--hero-emerald)" }}
                      />
                    </div>

                    <div className="space-y-1.5 pt-0.5">
                      {ROUTINE_SAMPLE.map((item, idx) => (
                        <motion.div
                          key={item.key}
                          className="flex items-center justify-between gap-2 py-0.5"
                          initial={shouldReduceMotion ? false : { opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.28,
                            delay: 0.42 + idx * 0.05,
                            ease: HERO_EASE,
                          }}
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <span
                              className="flex size-4 shrink-0 items-center justify-center rounded-full"
                              style={
                                item.done
                                  ? {
                                      backgroundColor: "var(--hero-emerald)",
                                      color: "var(--hero-accent-ink)",
                                    }
                                  : {
                                      border: "1px solid var(--hero-rule)",
                                    }
                              }
                            >
                              {item.done && (
                                <Check className="size-2.5 stroke-[3]" aria-hidden="true" />
                              )}
                            </span>
                            <span
                              className="truncate text-[12px] font-medium"
                              style={{ color: "var(--hero-ink)" }}
                            >
                              {t(item.labelBn, item.labelEn)}
                            </span>
                          </div>
                          <span
                            className="shrink-0 text-[11px] font-medium tabular-nums"
                            style={{
                              color: item.done
                                ? "var(--hero-emerald)"
                                : "var(--hero-ink-3)",
                            }}
                          >
                            {item.progress}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* 3. Lower Card Peeking at Bottom Clip */}
                  <div className="hero-app-card flex items-center gap-2">
                    <Flame
                      className="size-3.5 shrink-0"
                      style={{
                        color: "var(--hero-amber)",
                        fill: "var(--hero-amber)",
                      }}
                      aria-hidden="true"
                    />
                    <span
                      className="text-[12px] font-bold"
                      style={{ color: "var(--hero-ink)" }}
                    >
                      {t("দৈনিক অনুশীলন", "Personalized Daily Practice")}
                    </span>
                  </div>
                </div>
                </div>
              </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
