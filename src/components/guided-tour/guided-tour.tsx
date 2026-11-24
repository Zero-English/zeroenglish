"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowRight, ArrowLeft, Check, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/utils";
import type { TourConfig, TourStep } from "./types";

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface GuidedTourProps {
  config: TourConfig;
  isOpen: boolean;
  currentStepIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

export function GuidedTour({
  config,
  isOpen,
  currentStepIndex,
  onNext,
  onPrev,
  onClose,
}: GuidedTourProps) {
  const { lang } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const currentStep: TourStep | undefined = config.steps[currentStepIndex];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === config.steps.length - 1;

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    if (!isOpen || !currentStep) return;

    if (!currentStep.target) {
      setSpotlightRect(null);
      setPopoverPos(null);
      return;
    }

    const targetEl = document.querySelector(currentStep.target);
    if (!targetEl) {
      setSpotlightRect(null);
      setPopoverPos(null);
      return;
    }

    const pad = currentStep.highlightPadding ?? 8;
    const rect = targetEl.getBoundingClientRect();

    const spot: SpotlightRect = {
      top: Math.max(0, rect.top - pad),
      left: Math.max(0, rect.left - pad),
      width: rect.width + pad * 2,
      height: rect.height + pad * 2,
    };
    setSpotlightRect(spot);

    // Position popover
    const popoverEl = popoverRef.current;
    const popoverWidth = popoverEl ? popoverEl.offsetWidth : 340;
    const popoverHeight = popoverEl ? popoverEl.offsetHeight : 210;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let targetLeft = spot.left + spot.width / 2 - popoverWidth / 2;
    targetLeft = Math.max(16, Math.min(targetLeft, viewportWidth - popoverWidth - 16));

    let targetTop: number;
    const preferredPlacement = currentStep.placement ?? "bottom";

    if (preferredPlacement === "top") {
      targetTop = spot.top - popoverHeight - 14;
      if (targetTop < 16) {
        // Flip to bottom if doesn't fit on top
        targetTop = spot.top + spot.height + 14;
      }
    } else {
      // Default bottom
      targetTop = spot.top + spot.height + 14;
      if (targetTop + popoverHeight > viewportHeight - 16) {
        // Flip to top if doesn't fit below
        targetTop = Math.max(16, spot.top - popoverHeight - 14);
      }
    }

    setPopoverPos({ top: targetTop, left: targetLeft });
  }, [isOpen, currentStep]);

  // Scroll target into view and calculate positioning
  useEffect(() => {
    if (!isOpen || !currentStep?.target) return;

    const targetEl = document.querySelector(currentStep.target);
    if (targetEl) {
      targetEl.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }

    const timer = setTimeout(updatePosition, 300);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [isOpen, currentStepIndex, currentStep, updatePosition]);

  // Keyboard accessibility: Escape to close, Arrow keys to navigate
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") onNext();
      else if (e.key === "ArrowLeft") onPrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, onNext, onPrev]);

  if (!mounted || !isOpen || !currentStep) return null;

  const Icon = currentStep.icon ?? Sparkles;
  const title = lang === "en" ? currentStep.title.en : currentStep.title.bn;
  const description = lang === "en" ? currentStep.description.en : currentStep.description.bn;
  const badge = currentStep.badge
    ? lang === "en"
      ? currentStep.badge.en
      : currentStep.badge.bn
    : null;

  const content = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] overflow-hidden select-none">
        {/* Spotlight SVG Mask Scrim */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0"
        >
          <svg
            className="size-full cursor-pointer"
            onClick={onClose}
            aria-label="Tour backdrop overlay"
          >
            <defs>
              <mask id={`spotlight-mask-${config.id}`}>
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                {spotlightRect && (
                  <rect
                    x={spotlightRect.left}
                    y={spotlightRect.top}
                    width={spotlightRect.width}
                    height={spotlightRect.height}
                    rx={18}
                    ry={18}
                    fill="black"
                  />
                )}
              </mask>
            </defs>
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="rgba(0, 0, 0, 0.65)"
              mask={`url(#spotlight-mask-${config.id})`}
            />
          </svg>
        </motion.div>

        {/* Highlight Focus Ring */}
        {spotlightRect && (
          <motion.div
            key={`highlight-${currentStepIndex}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            style={{
              top: spotlightRect.top,
              left: spotlightRect.left,
              width: spotlightRect.width,
              height: spotlightRect.height,
            }}
            className="fixed pointer-events-none rounded-[18px] ring-2 ring-emerald-400/90 shadow-[0_0_28px_rgba(16,185,129,0.4)] dark:ring-emerald-400 dark:shadow-[0_0_36px_rgba(52,211,153,0.45)]"
          />
        )}

        {/* Floating Instruction Card */}
        <div
          ref={popoverRef}
          style={
            popoverPos
              ? {
                  position: "fixed",
                  top: popoverPos.top,
                  left: popoverPos.left,
                }
              : undefined
          }
          className={cn(
            "z-[10000] w-[calc(100vw-32px)] max-w-sm sm:max-w-md",
            !popoverPos && "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          )}
        >
          <motion.div
            key={`popover-${currentStepIndex}`}
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="rounded-[26px] border border-black/[0.08] bg-white/95 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.12),0_24px_48px_-12px_rgba(0,0,0,0.18)] backdrop-blur-2xl dark:border-white/[0.1] dark:bg-[#1c1c1e]/95"
          >
            {/* Header: Icon + Step Counter + Close */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-[14px] bg-primary/10 text-primary">
                  <Icon className="size-4.5" />
                </div>
                <span className="rounded-full bg-[#f1f1ef] px-2.5 py-0.5 text-[11px] font-bold text-[#242423]/70 tabular-nums dark:bg-[#252528] dark:text-zinc-300">
                  {lang === "en"
                    ? `Step ${currentStepIndex + 1} of ${config.steps.length}`
                    : `ধাপ ${currentStepIndex + 1} / ${config.steps.length}`}
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Skip tour"
                title={lang === "en" ? "Skip tour" : "ট্যুর বন্ধ করুন"}
                className="flex size-7 items-center justify-center rounded-full text-[#242423]/50 transition-colors hover:bg-black/[0.05] hover:text-[#242423] active:scale-95 dark:text-zinc-400 dark:hover:bg-white/[0.08] dark:hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Content Section */}
            <div className="mt-3.5 space-y-1.5">
              {badge && (
                <div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                    <Sparkles className="size-2.5" />
                    <span>{badge}</span>
                  </span>
                </div>
              )}

              <h3 className="text-[16px] font-bold tracking-tight text-[#242423] dark:text-[#f3f3f2]">
                {title}
              </h3>

              <p className="text-xs leading-relaxed text-[#242423]/75 dark:text-zinc-300">
                {description}
              </p>
            </div>

            {/* Footer Navigation */}
            <div className="mt-5 flex items-center justify-between gap-2 border-t border-black/[0.06] pt-3.5 dark:border-white/[0.08]">
              {/* Progress Indicator Dots */}
              <div className="flex items-center gap-1.5">
                {config.steps.map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-200",
                      i === currentStepIndex
                        ? "w-4 bg-primary"
                        : "w-1.5 bg-black/[0.12] dark:bg-white/[0.2]"
                    )}
                  />
                ))}
              </div>

              {/* Prev & Next / Finish Actions */}
              <div className="flex items-center gap-1.5">
                {!isFirst && (
                  <button
                    type="button"
                    onClick={onPrev}
                    className="inline-flex h-8 items-center gap-1 rounded-full px-3 text-xs font-semibold text-[#242423] transition-all hover:bg-[#f1f1ef] active:scale-95 dark:text-zinc-300 dark:hover:bg-[#252528]"
                  >
                    <ArrowLeft className="size-3.5" />
                    <span>{lang === "en" ? "Back" : "আগে"}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onNext}
                  className="inline-flex h-8.5 items-center gap-1.5 rounded-full bg-[#242423] px-4 text-xs font-semibold text-white shadow-xs transition-all hover:bg-black active:scale-95 dark:bg-white dark:text-[#242423] dark:hover:bg-zinc-200"
                >
                  <span>
                    {isLast
                      ? lang === "en"
                        ? "Got it!"
                        : "বুঝেছি!"
                      : lang === "en"
                        ? "Next"
                        : "পরের"}
                  </span>
                  {isLast ? (
                    <Check className="size-3.5" />
                  ) : (
                    <ArrowRight className="size-3.5" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );

  return createPortal(content, document.body);
}

/**
 * Clean floating helper pill to let users re-open the guide at any time
 */
export function TourReplayButton({ onReplay }: { onReplay: () => void }) {
  const { lang } = useLanguage();

  return (
    <button
      type="button"
      onClick={onReplay}
      title={lang === "en" ? "Interactive Page Guide" : "ইন্টারেক্টিভ গাইড দেখুন"}
      aria-label="Open guided tour"
      className="inline-flex h-7 items-center gap-1.5 rounded-full border border-black/[0.06] bg-white px-2.5 text-[11px] font-semibold text-[#242423]/70 shadow-2xs transition-all hover:bg-[#f1f1ef] hover:text-[#242423] active:scale-95 dark:border-white/[0.08] dark:bg-[#1c1c1e] dark:text-zinc-300 dark:hover:bg-[#252528] dark:hover:text-white"
    >
      <Sparkles className="size-3 text-amber-500" />
      <span>{lang === "en" ? "Guide" : "গাইড"}</span>
    </button>
  );
}
