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
import { useT, useNum } from "@/components/language-provider";
import { fetchQuizResultsFromDb } from "@/lib/quiz-results-api";
import { getWordsByType } from "@/lib/db";
import {
  useQuizHistoryStore,
  type QuizHistoryEntry,
} from "@/lib/quiz-history-store";
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

function pseudo(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
}

function randInt(seed: number, max: number) {
  return Math.floor(pseudo(seed) * (max + 1));
}

function hourLabel(h: number) {
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr} ${ampm}`;
}

function hourlySeries(daysAgo: number): ActivityPoint[] {
  const points: ActivityPoint[] = [];
  for (let h = 0; h < 24; h++) {
    const seed = daysAgo * 1000 + h;
    const learned = randInt(seed, h >= 9 && h <= 17 ? 4 : 1);
    points.push({ label: hourLabel(h), learned, quiz: 0 });
  }
  return points;
}

function dailySeries(days: number, endOffset: number): ActivityPoint[] {
  const points: ActivityPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - (i + endOffset));
    const seed = i * 17 + days * 3;
    const learned = randInt(seed, 5) + (i % 7 === 1 ? 2 : 0);
    points.push({
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      learned,
      quiz: 0,
    });
  }
  return points;
}

const dummyGraphData = {
  today: { title: "today", titleBn: "আজ", data: hourlySeries(0), previous: hourlySeries(1) },
  yesterday: { title: "yesterday", titleBn: "গতকাল", data: hourlySeries(1), previous: hourlySeries(2) },
  "7d": { title: "the last 7 days", titleBn: "শেষ ৭ দিনে", data: dailySeries(7, 0), previous: dailySeries(7, 7) },
  "14d": { title: "the last 14 days", titleBn: "শেষ ১৪ দিনে", data: dailySeries(14, 0), previous: dailySeries(14, 14) },
  "30d": { title: "the last 30 days", titleBn: "শেষ ৩০ দিনে", data: dailySeries(30, 0), previous: dailySeries(30, 30) },
  "90d": { title: "the last 90 days", titleBn: "শেষ ৯০ দিনে", data: dailySeries(90, 0), previous: dailySeries(90, 90) },
  "1y": { title: "the last 1 year", titleBn: "শেষ ১ বছরে", data: dailySeries(365, 0), previous: dailySeries(365, 365) },
} satisfies Record<RangeKey, GraphData>;

type LearnedPoint = { label: string; learned: number };

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
    if (dateKey(d) !== tKey) continue;
    byHour[d.getHours()] += 1;
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
    const k = dateKey(new Date(r.timestamp));
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

const RANGE_DAYS: Record<RangeKey, number> = {
  today: 1,
  yesterday: 1,
  "7d": 7,
  "14d": 14,
  "30d": 30,
  "90d": 90,
  "1y": 365,
};

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function buildQuizMap(results: QuizLike[]): Map<string, number> {
  const byDate = new Map<string, { sum: number; count: number }>();
  for (const r of results) {
    const date = dateKey(createdDate(r));
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
  const [activity, setActivity] = useState<Record<RangeKey, GraphData>>(dummyGraphData);
  const t = useT();
  const num = useNum();
  const { status } = useAuthStatus();
  const path = useAuthStore((s) => s.path);
  const quizEntries = useQuizHistoryStore((s) => s.entries);

  const storedUserId = userId;

  const loadActivity = useCallback(async (r: RangeKey) => {
    const isHourly = r === "today" || r === "yesterday";
    const days = r === "today" || r === "yesterday" ? 1 : (RANGE_DAYS[r] ?? 7);

    let learnedRes: { current: LearnedPoint[]; previous: LearnedPoint[] } | null;
    let quizSource: QuizLike[];

    if (status === "google" || storedUserId != null) {
      [learnedRes, quizSource] = await Promise.all([
        fetchLearnedActivity(r, storedUserId),
        fetchQuizResultsFromDb(storedUserId),
      ]);
    } else {
      const records = await getWordsByType("learned", path);
      learnedRes = localLearnedSeries(r, records);
      quizSource = quizFromLocal(quizEntries);
    }

    const qmap = buildQuizMap(quizSource);

    setActivity((prev) => {
      const base = prev[r];

      if (isHourly) {
        const basePoints = learnedRes ? learnedRes.current : base.data;
        const prevPoints = learnedRes ? learnedRes.previous : base.previous;
        const currentOffset = r === "today" ? 0 : 1;
        const previousOffset = r === "today" ? 1 : 2;
        const currentMap = buildHourlyQuizMap(quizSource, currentOffset);
        const previousMap = buildHourlyQuizMap(quizSource, previousOffset);
        return {
          ...prev,
          [r]: {
            title: base.title,
            titleBn: base.titleBn,
            data: basePoints.map((p, i) => ({ ...p, quiz: currentMap.get(i) ?? 0 })),
            previous: prevPoints.map((p, i) => ({ ...p, quiz: previousMap.get(i) ?? 0 })),
          },
        };
      }

      if (!learnedRes) {
        const current = base.data.map((p, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (days - 1) + i);
          return { ...p, quiz: quizForDate(qmap, d) };
        });
        const previous = base.previous.map((p, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (2 * days - 1) + i);
          return { ...p, quiz: quizForDate(qmap, d) };
        });
        return { ...prev, [r]: { ...base, data: current, previous } };
      }

      const current = learnedRes.current.map((pt, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (days - 1) + i);
        return { ...pt, quiz: quizForDate(qmap, d) };
      });
      const previous = learnedRes.previous.map((pt, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (2 * days - 1) + i);
        return { ...pt, quiz: quizForDate(qmap, d) };
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
      avgLearned: currentLearned / active.data.length,
      learnedChange: previousLearned > 0 ? ((currentLearned - previousLearned) / previousLearned) * 100 : null,
      quizChange: previousQuiz > 0 ? ((currentQuiz - previousQuiz) / previousQuiz) * 100 : null,
    };
  }, [active]);

  const change = metric === "quiz" ? stats.quizChange : stats.learnedChange;
  const headline =
    metric === "quiz" ? `${num(stats.quizAvg.toFixed(0))}%` : num(stats.learned.toLocaleString());
  const showLearned = metric !== "quiz";
  const showQuiz = metric !== "learned";
  const granularity = range === "today" || range === "yesterday" ? "hr" : "day";
  const scrollMinWidth = Math.max(520, active.data.length * (granularity === "day" ? 36 : 52));

  return (
    <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-5 sm:p-6 transition-all duration-200 hover:shadow-lg hover:border-zinc-300/80 dark:hover:border-zinc-700/80">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
          <Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("কার্যকলাপ", "Activity")}</h3>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            {t("কার্যকলাপ অ্যানালিটিক্স", "Activity analytics")}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-700/80 bg-zinc-50 dark:bg-zinc-900/40 p-1">
          {METRICS.map((m) => (
            <button
              key={m.value}
              onClick={() => setMetric(m.value)}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer",
                metric === m.value
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
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
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {metric === "quiz"
              ? t("এই সময়ে কুইজে জয়ের হার", "Quiz win rate in the")
              : t("এই সময়ে শেখা শব্দ", "Words learned in the")}{" "}
            {t(active.titleBn, active.title)}
          </p>
          <p className="mt-1 flex items-baseline gap-2 text-3xl font-bold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-100">
            {headline}
            {metric === "all" && (
              <span className="text-sm font-semibold text-zinc-400 dark:text-zinc-500">
                {t("· কুইজে জয়ের হার", "· Quiz win")} {num(stats.quizAvg.toFixed(0))}%
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
              change === null
                ? "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                : change >= 0
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                  : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
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
                {num(Math.abs(change).toFixed(1))}%
              </>
            )}
          </span>
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            {metric === "quiz"
              ? t(`সেরা ${num(stats.bestQuiz)}% · খারাপ ${num(stats.worstQuiz)}%`, `best ${stats.bestQuiz}% · worst ${stats.worstQuiz}%`)
              : t(
                  `আগের তুলনায় · গড় ${num(stats.avgLearned.toFixed(1))}/${
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