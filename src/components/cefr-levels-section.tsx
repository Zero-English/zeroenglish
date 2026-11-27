"use client";

import React from "react";
import Link from "next/link";
import { MotionConfig, motion, useReducedMotion } from "motion/react";
import { ArrowRight, ArrowUpRight, Bookmark } from "lucide-react";
import { useT } from "@/components/language-provider";
import type { LevelStatItem } from "@/lib/data";
import { isLevelLive, VALID_LEVELS, type LevelCode } from "@/lib/level-copy";
import { cn } from "@/lib/utils";

interface CefrLevelsSectionProps {
  levelStats: LevelStatItem[];
  className?: string;
}

const SECTION_EASE = [0.22, 1, 0.36, 1] as const;

const SECTION_SPRING = {
  type: "spring",
  stiffness: 320,
  damping: 26,
  mass: 0.9,
} as const;

const LEVEL_CATALOG: Record<
  LevelCode,
  {
    index: string;
    stage: number;
    labelEn: string;
    labelBn: string;
    focusEn: string;
    focusBn: string;
    sampleWords: readonly string[];
  }
> = {
  A1: {
    index: "01",
    stage: 1,
    labelEn: "Beginner",
    labelBn: "শিক্ষানবিস",
    focusEn: "Everyday foundations & core verbs",
    focusBn: "দৈনন্দিন ভিত্তি ও মূল ক্রিয়া",
    sampleWords: ["water", "family", "simple"],
  },
  A2: {
    index: "02",
    stage: 2,
    labelEn: "Elementary",
    labelBn: "প্রাথমিক",
    focusEn: "Routine travel, plans & common phrases",
    focusBn: "ভ্রমণ, পরিকল্পনা ও সাধারণ বাক্যাংশ",
    sampleWords: ["journey", "decide", "nature"],
  },
  B1: {
    index: "03",
    stage: 3,
    labelEn: "Intermediate",
    labelBn: "মাঝারি",
    focusEn: "Work, study opinions & structured ideas",
    focusBn: "কাজ, পড়াশোনা, মতামত ও যুক্তি",
    sampleWords: ["achieve", "explore", "balance"],
  },
  B2: {
    index: "04",
    stage: 4,
    labelEn: "Upper Intermediate",
    labelBn: "উচ্চ-মাঝারি",
    focusEn: "Fluent precision & academic expression",
    focusBn: "নিখুঁত প্রকাশ ও একাডেমিক ভাষা",
    sampleWords: ["persevere", "resilient", "adapt"],
  },
  C1: {
    index: "05",
    stage: 5,
    labelEn: "Advanced",
    labelBn: "উন্নত",
    focusEn: "Subtle register, policy & formal discourse",
    focusBn: "সূক্ষ্ম অর্থ, নীতি ও আনুষ্ঠানিক প্রয়োগ",
    sampleWords: ["eloquent", "ambiguous", "viable"],
  },
  C2: {
    index: "06",
    stage: 6,
    labelEn: "Mastery",
    labelBn: "পারদর্শী",
    focusEn: "Near-native nuance & rare idioms",
    focusBn: "গভীর সূক্ষ্মতা ও উচ্চতর বাগধারা",
    sampleWords: ["ephemeral", "ubiquitous", "paradigm"],
  },
};

const fmt = (n: number) => n.toLocaleString("en-US");

export function CefrLevelsSection({
  levelStats,
  className,
}: CefrLevelsSectionProps) {
  const t = useT();
  const shouldReduceMotion = Boolean(useReducedMotion());

  const countMap = new Map(
    levelStats.map((s) => [s.level.toUpperCase(), s.count])
  );

  const displayStats = VALID_LEVELS.map((level) => {
    const total = countMap.get(level) ?? 0;
    return {
      level,
      total,
      live: isLevelLive(total),
      meta: LEVEL_CATALOG[level],
    };
  });

  const liveLevelsCount = displayStats.filter((item) => item.live).length;
  const totalLiveWords = displayStats.reduce(
    (sum, item) => (item.live ? sum + item.total : sum),
    0
  );

  return (
    <MotionConfig reducedMotion="user">
      <section
        id="levels"
        aria-labelledby="cefr-levels-heading"
        className={cn("cefr-section", className)}
      >
        <motion.div
          aria-hidden="true"
          className="cefr-header-ring"
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.9 }}
          whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: SECTION_EASE }}
        />

        {/* Editorial Section Header — matches Hero left column hierarchy */}
        <motion.div
          className="cefr-header"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.48, ease: SECTION_EASE }}
        >
          <div className="cefr-header-copy">
            <div className="cefr-kicker-row">
              <div aria-hidden="true" className="cefr-geo-mark">
                <motion.span
                  className="cefr-geo-pill origin-left"
                  initial={shouldReduceMotion ? false : { scaleX: 0, opacity: 0 }}
                  whileInView={{ scaleX: 1, opacity: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.4, ease: SECTION_EASE }}
                />
                <motion.span
                  className="cefr-geo-dot"
                  initial={shouldReduceMotion ? false : { scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ ...SECTION_SPRING, delay: 0.08 }}
                />
              </div>

              <span className="cefr-kicker-pill">
                <Bookmark
                  className="cefr-kicker-icon size-3.5 shrink-0"
                  aria-hidden="true"
                />
                <span>
                  {t("লেভেল অনুযায়ী খাতা", "Level-by-level notebook")}
                </span>
              </span>
            </div>

            <h2 id="cefr-levels-heading" className="cefr-heading">
              {t(
                "CEFR লেভেল অনুযায়ী শব্দতালিকা",
                "Word Lists by CEFR Level"
              )}
            </h2>

            <div className="cefr-lead-wrap">
              <p className="cefr-lead">
                {t(
                  "প্রাইমারি A1 থেকে অ্যাডভান্সড C1 পর্যন্ত প্রতিটি লেভেলের শব্দ আলাদা নোটবুকে সাজানো। নিজের স্তর বেছে নিয়ে অনুশীলন শুরু করুন।",
                  "Study progressively from A1 Beginner to C1 Advanced. Open any level notebook to start drilling words."
                )}
              </p>
            </div>
          </div>

          {/* Balanced Right Status Summary Chip */}
          <div className="cefr-summary-pill">
            <span aria-hidden="true" className="cefr-live-indicator">
              {!shouldReduceMotion && (
                <motion.span
                  className="cefr-live-pulse"
                  animate={{ scale: [1, 1.85, 1], opacity: [0.55, 0, 0.55] }}
                  transition={{
                    duration: 2.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}
              <span className="cefr-live-core" />
            </span>

            <span className="cefr-summary-text tabular-nums">
              {t(
                `${fmt(totalLiveWords)} শব্দ · ${liveLevelsCount}টি লেভেল চালু`,
                `${fmt(totalLiveWords)} words · ${liveLevelsCount} levels live`
              )}
            </span>
          </div>
        </motion.div>

        {/* 3x2 Structured Notebook Grid */}
        <div className="cefr-grid">
          {displayStats.map(({ level, total, live, meta }, idx) => {
            const cardBody = (
              <div
                className={cn(
                  "cefr-card group",
                  !live && "cefr-card--disabled"
                )}
              >
                {/* Top Hairline Edge Bar */}
                <div className="cefr-card-top">
                  <div className="cefr-card-id">
                    <div
                      className={cn(
                        "cefr-code-badge",
                        !live && "cefr-code-badge--muted"
                      )}
                    >
                      <span>{level}</span>
                    </div>

                    <div className="min-w-0">
                      <span className="cefr-card-index tabular-nums">
                        {t(
                          `নোটবুক ${meta.index}`,
                          `Notebook ${meta.index}`
                        )}
                      </span>
                      <h3 className="cefr-card-title">
                        {t(meta.labelBn, meta.labelEn)}
                      </h3>
                    </div>
                  </div>

                  {live ? (
                    <span className="cefr-action-circle" aria-hidden="true">
                      <ArrowUpRight className="cefr-action-arrow size-4" />
                    </span>
                  ) : (
                    <span className="cefr-draft-badge">
                      {t("খসড়া চলছে", "Drafting")}
                    </span>
                  )}
                </div>

                <p className="cefr-card-focus">
                  {t(meta.focusBn, meta.focusEn)}
                </p>

                {/* Sunken Sample Words Well (DESIGNS.md inset surface — zero borders on well) */}
                <div className="cefr-word-well">
                  <div className="cefr-well-meta">
                    <span className="cefr-well-label">
                      {t("নমুনা শব্দ", "Sample words")}
                    </span>
                    <span className="cefr-word-count tabular-nums">
                      {live
                        ? t(`${fmt(total)}টি শব্দ`, `${fmt(total)} words`)
                        : t("শীঘ্রই আসছে", "Coming soon")}
                    </span>
                  </div>

                  <div className="cefr-sample-list">
                    {meta.sampleWords.map((word) => (
                      <span key={word} className="cefr-word-pill">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Animated 6-Stage CEFR Progression Meter */}
                <div className="cefr-card-footer">
                  <div
                    className="cefr-meter-track"
                    aria-hidden="true"
                  >
                    {Array.from({ length: 6 }).map((_, segIdx) => {
                      const active = segIdx < meta.stage;
                      return (
                        <span key={segIdx} className="cefr-meter-segment">
                          {active && (
                            <motion.span
                              className={cn(
                                "cefr-meter-fill origin-left",
                                !live && "cefr-meter-fill--muted"
                              )}
                              initial={
                                shouldReduceMotion ? false : { scaleX: 0 }
                              }
                              whileInView={{ scaleX: 1 }}
                              viewport={{ once: true, amount: 0.2 }}
                              transition={{
                                duration: 0.42,
                                delay: 0.14 + idx * 0.04 + segIdx * 0.045,
                                ease: SECTION_EASE,
                              }}
                            />
                          )}
                        </span>
                      );
                    })}
                  </div>

                  <div className="cefr-footer-row">
                    <span className="cefr-stage-label tabular-nums">
                      {t(
                        `ধাপ ${meta.stage}/৬`,
                        `Stage ${meta.stage} of 6`
                      )}
                    </span>

                    {live ? (
                      <span className="cefr-open-cue">
                        <span>{t("তালিকা দেখুন", "Open list")}</span>
                        <ArrowRight
                          className="cefr-open-arrow size-3.5"
                          aria-hidden="true"
                        />
                      </span>
                    ) : (
                      <span className="cefr-soon-cue">
                        {t("প্রস্তুত হচ্ছে", "In preparation")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );

            return (
              <motion.div
                key={level}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.42,
                  delay: idx * 0.055,
                  ease: SECTION_EASE,
                }}
                whileHover={
                  live && !shouldReduceMotion ? { y: -3 } : undefined
                }
                whileTap={
                  live && !shouldReduceMotion ? { scale: 0.985 } : undefined
                }
                className="h-full"
              >
                {live ? (
                  <Link
                    href={`/vocabulary/${level.toLowerCase()}`}
                    className="cefr-card-link"
                  >
                    {cardBody}
                  </Link>
                ) : (
                  <div
                    className="cefr-card-static"
                    aria-disabled="true"
                  >
                    {cardBody}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>
    </MotionConfig>
  );
}
