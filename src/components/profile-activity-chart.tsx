"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Activity, CalendarDays, TrendingDown, TrendingUp } from "lucide-react";
import { useT } from "@/components/language-provider";
import { fetchCombinedExamResultsFromDb } from "@/lib/quiz-results-api";
import { getWordsByType } from "@/lib/db";
import type { QuizHistoryEntry } from "@/lib/quiz-history-store";
import { useQuizHistory } from "@/lib/use-quiz-history";
import { useAuthStatus, useAuthStore } from "@/lib/auth-store";

type ActivityPoint = { label: string; learned: number; quiz: number };

interface GraphData {
  title: string;
  titleBn: string;
  data: ActivityPoint[];
  previous: ActivityPoint[];
}

const RANGE_OPTIONS = [
  { value: "today", label: "Today", labelBn: "আজ" },
  { value: "yesterday", label: "Yesterday", labelBn: "গতকাল" },
  { value: "7d", label: "Last 7 days", labelBn: "শেষ ৭ দিন" },
  { value: "14d", label: "Last 14 days", labelBn: "শেষ ১৪ দিন" },
  { value: "30d", label: "Last 30 days", labelBn: "শেষ ৩০ দিন" },
  { value: "90d", label: "Last 90 days", labelBn: "শেষ ৯০ দিন" },
  { value: "1y", label: "Last 1 year", labelBn: "শেষ ১ বছর" },
] as const;

type RangeKey = (typeof RANGE_OPTIONS)[number]["value"];

const METRICS = [
  { value: "all", label: "All", labelBn: "সব" },
  { value: "learned", label: "Learned", labelBn: "শেখা হয়েছে" },
  { value: "quiz", label: "Quiz", labelBn: "কুইজ" },
] as const;

type Metric = (typeof METRICS)[number]["value"];

const RANGE_DAYS: Record<RangeKey, number> = {
  today: 1,
  yesterday: 1,
  "7d": 7,
  "14d": 14,
  "30d": 30,
  "90d": 90,
  "1y": 365,
};

function hourLabel(h: number) {
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr} ${ampm}`;
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type LearnedPoint = { label: string; learned: number };

function emptyHourlySeries(): LearnedPoint[] {
  return Array.from({ length: 24 }, (_, h) => ({
    label: hourLabel(h),
    learned: 0,
  }));
}

function emptyDailySeries(days: number, endOffset: number): LearnedPoint[] {
  const out: LearnedPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - (i + endOffset));
    out.push({
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      learned: 0,
    });
  }
  return out;
}

function buildZeroGraphData(): Record<RangeKey, GraphData> {
  const build = (r: RangeKey): GraphData => {
    const isHourly = r === "today" || r === "yesterday";
    const days = RANGE_DAYS[r] ?? 7;
    const currentOffset = r === "today" ? 0 : r === "yesterday" ? 1 : 0;
    const prevOffset = r === "today" ? 1 : r === "yesterday" ? 2 : days;

    const curPoints: ActivityPoint[] = isHourly
      ? emptyHourlySeries().map((p) => ({ ...p, quiz: 0 }))
      : emptyDailySeries(days, currentOffset).map((p) => ({ ...p, quiz: 0 }));

    const prevPoints: ActivityPoint[] = isHourly
      ? emptyHourlySeries().map((p) => ({ ...p, quiz: 0 }))
      : emptyDailySeries(days, prevOffset).map((p) => ({ ...p, quiz: 0 }));

    const meta = RANGE_OPTIONS.find((o) => o.value === r);

    return {
      title: meta?.label.toLowerCase() ?? r,
      titleBn: meta?.labelBn ?? r,
      data: curPoints,
      previous: prevPoints,
    };
  };

  return {
    today: build("today"),
    yesterday: build("yesterday"),
    "7d": build("7d"),
    "14d": build("14d"),
    "30d": build("30d"),
    "90d": build("90d"),
    "1y": build("1y"),
  };
}

interface QuizLike {
  createdAt: string | Date;
  scoreInPercent: number;
}

function entryWin(e: QuizHistoryEntry): number {
  const n = parseFloat(e.win);
  return Number.isFinite(n) ? n : 0;
}

function createdDate(r: QuizLike): Date {
  return r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt);
}

function quizFromLocal(entries: QuizHistoryEntry[]): QuizLike[] {
  return entries.map((e) => ({
    createdAt: new Date(
      e.createdAt ?? new Date(`${e.date}T12:00:00`).getTime()
    ),
    scoreInPercent: entryWin(e),
  }));
}

function localHourlySeries(
  records: { timestamp?: number }[],
  daysAgo: number
): LearnedPoint[] {
  const target = new Date();
  target.setHours(0, 0, 0, 0);
  target.setDate(target.getDate() - daysAgo);
  const tKey = dateKey(target);
  const byHour = new Array<number>(24).fill(0);
  for (const r of records) {
    if (!r.timestamp) continue;
    const d = new Date(r.timestamp);
    if (isNaN(d.getTime())) continue;
    if (dateKey(d) !== tKey) continue;
    const h = d.getHours();
    if (h >= 0 && h < 24) byHour[h] += 1;
  }
  return byHour.map((learned, h) => ({ label: hourLabel(h), learned }));
}

function localDailySeries(
  records: { timestamp?: number }[],
  days: number,
  endOffset: number
): LearnedPoint[] {
  const counts = new Map<string, number>();
  for (const r of records) {
    if (!r.timestamp) continue;
    const d = new Date(r.timestamp);
    if (isNaN(d.getTime())) continue;
    const k = dateKey(d);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const out: LearnedPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - (i + endOffset));
    out.push({
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      learned: counts.get(dateKey(d)) ?? 0,
    });
  }
  return out;
}

function localLearnedSeries(
  r: RangeKey,
  records: { timestamp?: number }[]
): { current: LearnedPoint[]; previous: LearnedPoint[] } {
  if (r === "today" || r === "yesterday") {
    const curOffset = r === "today" ? 0 : 1;
    return {
      current: localHourlySeries(records, curOffset),
      previous: localHourlySeries(records, curOffset + 1),
    };
  }
  const days = RANGE_DAYS[r] ?? 7;
  return {
    current: localDailySeries(records, days, 0),
    previous: localDailySeries(records, days, days),
  };
}

async function fetchLearnedActivity(
  range: RangeKey,
  userId?: number
): Promise<{
  current: LearnedPoint[];
  previous: LearnedPoint[];
} | null> {
  try {
    const qs = new URLSearchParams({ range });
    if (userId != null) qs.set("userId", String(userId));
    const res = await fetch(`/api/v1/words/learned-activity?${qs}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = (await res.json()) as {
      data?: { current?: LearnedPoint[]; previous?: LearnedPoint[] };
      success?: boolean;
    };
    if (!body.success || !Array.isArray(body.data?.current) || !Array.isArray(body.data?.previous)) {
      return null;
    }
    return { current: body.data.current, previous: body.data.previous };
  } catch (err) {
    console.error("Failed to fetch learned word activity:", err);
    return null;
  }
}

const chartConfig = {
  learned: { label: "Learned", color: "#10b981" },
  quiz: { label: "Quiz win rate", color: "#0ea5e9" },
} satisfies ChartConfig;

function buildQuizMap(results: QuizLike[]): Map<string, number> {
  const byDate = new Map<string, { sum: number; count: number }>();
  for (const r of results) {
    const d = createdDate(r);
    if (isNaN(d.getTime())) continue;
    const date = dateKey(d);
    const rec = byDate.get(date) ?? { sum: 0, count: 0 };
    rec.sum += r.scoreInPercent;
    rec.count += 1;
    byDate.set(date, rec);
  }
  const out = new Map<string, number>();
  for (const [date, rec] of byDate) {
    out.set(date, Math.round(rec.sum / rec.count));
  }
  return out;
}

function quizForDate(qmap: Map<string, number>, d: Date): number {
  return qmap.get(dateKey(d)) ?? 0;
}

function buildHourlyQuizMap(results: QuizLike[], daysAgo: number): Map<number, number> {
  const target = new Date();
  target.setHours(0, 0, 0, 0);
  target.setDate(target.getDate() - daysAgo);
  const targetKey = dateKey(target);

  const byHour = new Map<number, { sum: number; count: number }>();
  for (const r of results) {
    const d = createdDate(r);
    if (isNaN(d.getTime())) continue;
    if (dateKey(d) !== targetKey) continue;
    const h = d.getHours();
    const rec = byHour.get(h) ?? { sum: 0, count: 0 };
    rec.sum += r.scoreInPercent;
    rec.count += 1;
    byHour.set(h, rec);
  }
  const out = new Map<number, number>();
  for (const [h, rec] of byHour) out.set(h, Math.round(rec.sum / rec.count));
  return out;
}

export function ProfileActivityChart({ userId }: { userId?: number }) {
  const [range, setRange] = useState<RangeKey>("7d");
  const [metric, setMetric] = useState<Metric>("all");
  const [activity, setActivity] = useState<Record<RangeKey, GraphData>>(buildZeroGraphData);
  const [loaded, setLoaded] = useState(false);
  const t = useT();
  const { status } = useAuthStatus();
  const path = useAuthStore((s) => s.path);
  const quizEntries = useQuizHistory().entries;

  const storedUserId = userId;

  const loadActivity = useCallback(async (r: RangeKey) => {
    const isHourly = r === "today" || r === "yesterday";
    const days = isHourly ? 1 : (RANGE_DAYS[r] ?? 7);
    const currentOffset = r === "today" ? 0 : r === "yesterday" ? 1 : 0;
    const previousOffset = r === "today" ? 1 : r === "yesterday" ? 2 : days;

    let learnedRes: { current: LearnedPoint[]; previous: LearnedPoint[] } | null = null;
    let quizSource: QuizLike[] = [];

    try {
      if (status === "google" || storedUserId != null) {
        const [lRes, qRes] = await Promise.all([
          fetchLearnedActivity(r, storedUserId),
          fetchCombinedExamResultsFromDb(storedUserId),
        ]);
        learnedRes = lRes;
        quizSource = qRes ?? [];
      } else {
        const records = await getWordsByType("learned", path);
        learnedRes = localLearnedSeries(r, records);
        quizSource = quizFromLocal(quizEntries);
      }
    } catch (err) {
      console.error("Failed to load activity real data:", err);
    }

    const qmap = buildQuizMap(quizSource);

    setActivity((prev) => {
      const base = prev[r];
      const fallbackCurrent = isHourly
        ? emptyHourlySeries()
        : emptyDailySeries(days, currentOffset);
      const fallbackPrevious = isHourly
        ? emptyHourlySeries()
        : emptyDailySeries(days, previousOffset);

      const curLearned = learnedRes?.current?.length ? learnedRes.current : fallbackCurrent;
      const prevLearned = learnedRes?.previous?.length ? learnedRes.previous : fallbackPrevious;

      if (isHourly) {
        const currentMap = buildHourlyQuizMap(quizSource, currentOffset);
        const previousMap = buildHourlyQuizMap(quizSource, previousOffset);
        return {
          ...prev,
          [r]: {
            title: base.title,
            titleBn: base.titleBn,
            data: curLearned.map((p, i) => ({
              label: p.label,
              learned: p.learned || 0,
              quiz: currentMap.get(i) ?? 0,
            })),
            previous: prevLearned.map((p, i) => ({
              label: p.label,
              learned: p.learned || 0,
              quiz: previousMap.get(i) ?? 0,
            })),
          },
        };
      }

      const current: ActivityPoint[] = curLearned.map((pt, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (days - 1) + i);
        return {
          label: pt.label,
          learned: pt.learned || 0,
          quiz: quizForDate(qmap, d),
        };
      });

      const previous: ActivityPoint[] = prevLearned.map((pt, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (2 * days - 1) + i);
        return {
          label: pt.label,
          learned: pt.learned || 0,
          quiz: quizForDate(qmap, d),
        };
      });

      return {
        ...prev,
        [r]: {
          title: base.title,
          titleBn: base.titleBn,
          data: current,
          previous,
        },
      };
    });

    setLoaded(true);
  }, [status, path, quizEntries, storedUserId]);

  useEffect(() => {
    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      loadActivity(range);
    };

    run();

    const onFocus = () => {
      if (document.visibilityState === "visible") run();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);

    const onActivityChange = () => {
      run();
    };
    window.addEventListener("activity-changed", onActivityChange);

    const interval = setInterval(run, 30000);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
      window.removeEventListener("activity-changed", onActivityChange);
      clearInterval(interval);
    };
  }, [range, loadActivity]);

  const active = activity[range];

  const stats = useMemo(() => {
    const sumLearned = (pts: ActivityPoint[]) => pts.reduce((acc, p) => acc + p.learned, 0);
    const avgQuiz = (pts: ActivityPoint[]) => {
      const active = pts.filter((p) => p.quiz > 0);
      return active.length ? active.reduce((acc, p) => acc + p.quiz, 0) / active.length : 0;
    };
    const quizValues = (pts: ActivityPoint[]) => pts.map((p) => p.quiz).filter((v) => v > 0);
    const currentLearned = sumLearned(active.data);
    const currentQuiz = avgQuiz(active.data);
    const previousLearned = sumLearned(active.previous);
    const previousQuiz = avgQuiz(active.previous);
    const curQuizValues = quizValues(active.data);
    return {
      learned: currentLearned,
      quizAvg: currentQuiz,
      bestQuiz: curQuizValues.length ? Math.max(...curQuizValues) : 0,
      worstQuiz: curQuizValues.length ? Math.min(...curQuizValues) : 0,
      avgLearned: active.data.length > 0 ? currentLearned / active.data.length : 0,
      learnedChange: previousLearned > 0 ? ((currentLearned - previousLearned) / previousLearned) * 100 : null,
      quizChange: previousQuiz > 0 ? ((currentQuiz - previousQuiz) / previousQuiz) * 100 : null,
    };
  }, [active]);

  const change = metric === "quiz" ? stats.quizChange : stats.learnedChange;
  const headline =
    metric === "quiz" ? `${stats.quizAvg.toFixed(0)}%` : stats.learned.toLocaleString();
  const showLearned = metric !== "quiz";
  const showQuiz = metric !== "learned";
  const granularity = range === "today" || range === "yesterday" ? "hr" : "day";
  const scrollMinWidth = Math.max(520, active.data.length * (granularity === "day" ? 36 : 52));

  return (
    <div className="rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md shadow-xs p-5 sm:p-6">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
          <Activity className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
        </div>
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-foreground">{t("কার্যকলাপ", "Activity")}</h3>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground">
            {t("কার্যকলাপ অ্যানালিটিক্স", "Activity analytics")}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 rounded-lg border border-border/80 bg-muted/60 p-1">
          {METRICS.map((m) => (
            <button
              key={m.value}
              onClick={() => setMetric(m.value)}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer",
                metric === m.value
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t(m.labelBn, m.label)}
            </button>
          ))}
        </div>

        <Select value={range} onValueChange={(v) => setRange(v as RangeKey)}>
          <SelectTrigger size="default" className="gap-1.5">
            <CalendarDays className="size-3.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {RANGE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {t(o.labelBn, o.label)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground">
            {metric === "quiz"
              ? t("এই সময়ে কুইজে জয়ের হার", "Quiz win rate in the")
              : t("এই সময়ে শেখা শব্দ", "Words learned in the")}{" "}
            {t(active.titleBn, active.title)}
          </p>
          <p className="mt-1 flex items-baseline gap-2 text-3xl font-bold tabular-nums tracking-tight text-foreground">
            {headline}
            {metric === "all" && (
              <span className="text-sm font-semibold text-muted-foreground">
                {t("· কুইজে জয়ের হার", "· Quiz win")} {stats.quizAvg.toFixed(0)}%
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
              change === null
                ? "bg-muted text-muted-foreground"
                : change >= 0
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20"
            )}
          >
            {change === null ? (
              t("নতুন", "New")
            ) : (
              <>
                {change >= 0 ? (
                  <TrendingUp className="size-3" />
                ) : (
                  <TrendingDown className="size-3" />
                )}
                {Math.abs(change).toFixed(1)}%
              </>
            )}
          </span>
          <span className="text-xs text-muted-foreground">
            {metric === "quiz"
              ? t(`সেরা ${stats.bestQuiz}% · খারাপ ${stats.worstQuiz}%`, `best ${stats.bestQuiz}% · worst ${stats.worstQuiz}%`)
              : t(
                  `আগের তুলনায় · গড় ${stats.avgLearned.toFixed(1)}/${
                    granularity === "hr" ? "ঘণ্টা" : "দিন"
                  }`,
                  `vs previous · avg ${stats.avgLearned.toFixed(1)}/${granularity}`
                )}
          </span>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto pb-1 no-scrollbar [&::-webkit-scrollbar]:hidden">
        <div style={{ minWidth: scrollMinWidth }}>
          <ChartContainer config={chartConfig} className="h-[260px] w-full">
            <BarChart accessibilityLayer data={active.data}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                minTickGap={24}
              />
              {showLearned && (
                <YAxis
                  yAxisId="learned"
                  orientation="left"
                  width={34}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  allowDecimals={false}
                />
              )}
              {showQuiz && (
                <YAxis
                  yAxisId="quiz"
                  orientation="right"
                  width={46}
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(v) => `${v}%`}
                />
              )}
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    formatter={(value, name) => (name === "quiz" ? `${value}%` : value)}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              {showLearned && (
                <Bar yAxisId="learned" dataKey="learned" fill="var(--color-learned)" radius={4} />
              )}
              {showQuiz && (
                <Bar yAxisId="quiz" dataKey="quiz" fill="var(--color-quiz)" radius={4} />
              )}
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
}