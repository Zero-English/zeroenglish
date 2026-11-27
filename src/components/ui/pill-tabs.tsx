"use client";

/**
 * PillTabs component adapted from Motion Brew
 * (https://motion-brew.com/components/pill-tabs)
 *
 * Engine: motion/react spring-driven edge motion values with stretch physics.
 */

import * as React from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  useVelocity,
} from "motion/react";
import { cn } from "@/lib/utils";

export interface PillTab {
  id: string;
  label: string;
  badge?: number | string;
  icon?: React.ReactNode;
}

export interface PillTabsProps {
  tabs: PillTab[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (id: string) => void;
  stretch?: number;
  blur?: number;
  label?: string;
  className?: string;
}

export const PillTabs = React.forwardRef<HTMLDivElement, PillTabsProps>(
  function PillTabs(
    {
      tabs,
      defaultValue,
      value: valueProp,
      onValueChange,
      stretch = 0.35,
      blur = 6,
      label = "Sections",
      className,
    },
    forwardedRef
  ) {
    const reduceMotion = !!useReducedMotion();
    const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
    const filterId = `pill-blur-${uid}`;
    const track = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(
      forwardedRef,
      () => track.current as HTMLDivElement
    );
    const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
    const blurNode = React.useRef<SVGFEGaussianBlurElement>(null);

    const [inner, setInner] = React.useState(defaultValue ?? tabs[0]?.id ?? "");
    const value = valueProp ?? inner;
    const index = Math.max(
      0,
      tabs.findIndex((t) => t.id === value)
    );
    const placed = React.useRef(false);
    const fromWidth = React.useRef(0);
    const toWidth = React.useRef(0);
    const [height, setHeight] = React.useState(0);

    // The pill is drawn between these two edges, in px from the track's left.
    const left = useMotionValue(0);
    const right = useMotionValue(0);
    const capX = useTransform(right, (r) => r - height);
    const midX = useTransform(left, (l) => l + height / 2);
    const midScale = useTransform([left, right], ([l, r]) =>
      Math.max(0, (r as number) - (l as number) - height)
    );

    // Rubber thins as it stretches
    const thin = useTransform([left, right], ([l, r]) => {
      if (reduceMotion) return 1;
      const w = (r as number) - (l as number);
      const rest = Math.max(fromWidth.current, toWidth.current, 1);
      const over = Math.max(0, w - rest) / rest;
      return 1 - Math.min(0.18, over * 0.35);
    });

    // Motion blur from pill speed
    const center = useTransform(
      [left, right],
      ([l, r]) => ((l as number) + (r as number)) / 2
    );
    const speed = useVelocity(center);
    useMotionValueEvent(speed, "change", (v) => {
      const sd =
        blur > 0 && !reduceMotion ? Math.min(blur, Math.abs(v) / 420) : 0;
      blurNode.current?.setAttribute("stdDeviation", `${sd.toFixed(2)} 0`);
    });

    const select = (id: string) => {
      if (valueProp === undefined) setInner(id);
      onValueChange?.(id);
    };

    const moveTo = React.useCallback(
      (instant: boolean) => {
        const tab = tabRefs.current[index];
        if (!tab) return;
        const l = tab.offsetLeft;
        const r = l + tab.offsetWidth;
        setHeight(tab.offsetHeight);
        if (instant || reduceMotion) {
          left.set(l);
          right.set(r);
          return;
        }
        const goingRight = l > left.get();
        const amount = Math.min(1, Math.max(0, stretch));
        fromWidth.current = right.get() - left.get();
        toWidth.current = r - l;
        const mass = 0.8;
        const critical = (k: number) => 2 * Math.sqrt(k * mass);
        const leadStiffness = 640;
        const trailStiffness = 700 - 540 * amount;
        const lead = {
          type: "spring" as const,
          stiffness: leadStiffness,
          damping: critical(leadStiffness) * 0.95,
          mass,
        };
        const trail = {
          type: "spring" as const,
          stiffness: trailStiffness,
          damping: critical(trailStiffness) * 0.9,
          mass,
          delay: 0.13 * amount,
        };
        animate(left, l, goingRight ? trail : lead);
        animate(right, r, goingRight ? lead : trail);
      },
      [index, left, right, reduceMotion, stretch]
    );

    React.useLayoutEffect(() => {
      moveTo(!placed.current);
      placed.current = true;
    }, [moveTo]);

    React.useEffect(() => {
      const el = track.current;
      if (!el) return;
      const ro = new ResizeObserver(() => moveTo(true));
      ro.observe(el);
      return () => ro.disconnect();
    }, [moveTo]);

    const focusTab = (i: number) => {
      const t = tabs[(i + tabs.length) % tabs.length]!;
      select(t.id);
      tabRefs.current[(i + tabs.length) % tabs.length]?.focus();
    };

    return (
      <div
        ref={track}
        role="tablist"
        aria-label={label}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            focusTab(index + 1);
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            focusTab(index - 1);
          }
          if (e.key === "Home") {
            e.preventDefault();
            focusTab(0);
          }
          if (e.key === "End") {
            e.preventDefault();
            focusTab(tabs.length - 1);
          }
        }}
        className={cn(
          "relative inline-flex max-w-full items-center gap-1 rounded-full bg-black/[0.04] p-1.5 dark:bg-white/[0.06] border border-black/[0.04] dark:border-white/[0.06]",
          className
        )}
      >
        <svg aria-hidden className="absolute size-0">
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur ref={blurNode} stdDeviation="0 0" />
          </filter>
        </svg>

        {/* The sliding fluid rubber pill */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-y-1.5 left-0 w-full"
          style={{
            filter: `url(#${filterId}) drop-shadow(0 1px 2px rgba(0,0,0,0.06)) drop-shadow(0 4px 12px rgba(0,0,0,0.04))`,
            scaleY: thin,
          }}
        >
          <motion.span
            className="absolute left-0 top-0 rounded-full bg-white dark:bg-[#2c2c2e] shadow-xs"
            style={{ x: left, width: height, height }}
          />
          <motion.span
            className="absolute left-0 top-0 w-px origin-left bg-white dark:bg-[#2c2c2e] shadow-xs"
            style={{ x: midX, scaleX: midScale, height }}
          />
          <motion.span
            className="absolute left-0 top-0 rounded-full bg-white dark:bg-[#2c2c2e] shadow-xs"
            style={{ x: capX, width: height, height }}
          />
        </motion.span>

        {tabs.map((tab, i) => {
          const active = i === index;
          return (
            <motion.button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${uid}-tab-${tab.id}`}
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              onClick={() => select(tab.id)}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "relative z-10 inline-flex h-9 sm:h-10 cursor-pointer items-center gap-2 rounded-full px-3.5 sm:px-4 text-xs sm:text-[13px] font-semibold tracking-tight outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-zinc-400 select-none whitespace-nowrap",
                active
                  ? "text-[#1c1c1e] dark:text-[#f4f4f5]"
                  : "text-[#242423]/60 hover:text-[#1c1c1e] dark:text-zinc-400 dark:hover:text-zinc-100"
              )}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    "grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-bold tabular-nums transition-colors",
                    active
                      ? "bg-[#1c1c1e] text-white dark:bg-white dark:text-[#1c1c1e]"
                      : "bg-black/[0.06] text-[#242423]/70 dark:bg-white/[0.08] dark:text-zinc-300"
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    );
  }
);

PillTabs.displayName = "PillTabs";
