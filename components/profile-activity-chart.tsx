"use client";

import { useMemo, useState } from "react";
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

type ActivityPoint = { label: string; learned: number; quiz: number };

const RANGE_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "7d", label: "Last 7 days" },
  { value: "14d", label: "Last 14 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "1y", label: "Last 1 year" },
] as const;

type RangeKey = (typeof RANGE_OPTIONS)[number]["value"];

const METRICS = [
  { value: "all", label: "All" },
  { value: "learned", label: "Learned" },
  { value: "quiz", label: "Quiz" },
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
  for (let h = 7; h <= 21; h++) {
    const seed = daysAgo * 1000 + h;
    const learned = randInt(seed, h < 12 ? 2 : 4);
    const quiz = Math.min(96, 50 + randInt(seed + 500, 46));
    points.push({ label: hourLabel(h), learned, quiz });
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
    const quiz = Math.min(92, Math.max(35, 64 + randInt(seed + 11, 26) - (i % 7 === 4 ? 14 : 0)));
    points.push({
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      learned,
      quiz,
    });
  }
  return points;
}

const dummyGraphData = {
  today: { title: "Today", data: hourlySeries(0), previous: hourlySeries(1) },
  yesterday: { title: "Yesterday", data: hourlySeries(1), previous: hourlySeries(2) },
  "7d": { title: "Last 7 days", data: dailySeries(7, 0), previous: dailySeries(7, 7) },
  "14d": { title: "Last 14 days", data: dailySeries(14, 0), previous: dailySeries(14, 14) },
  "30d": { title: "Last 30 days", data: dailySeries(30, 0), previous: dailySeries(30, 30) },
  "90d": { title: "Last 90 days", data: dailySeries(90, 0), previous: dailySeries(90, 90) },
  "1y": { title: "Last 1 year", data: dailySeries(365, 0), previous: dailySeries(365, 365) },
} satisfies Record<RangeKey, { title: string; data: ActivityPoint[]; previous: ActivityPoint[] }>;

const chartConfig = {
  learned: { label: "Learned", color: "#10b981" },
  quiz: { label: "Quiz win rate", color: "#0ea5e9" },
} satisfies ChartConfig;

export function ProfileActivityChart() {
  const [range, setRange] = useState<RangeKey>("7d");
  const [metric, setMetric] = useState<Metric>("all");

  const active = dummyGraphData[range];

  const stats = useMemo(() => {
    const sumLearned = (pts: ActivityPoint[]) => pts.reduce((acc, p) => acc + p.learned, 0);
    const avgQuiz = (pts: ActivityPoint[]) => (pts.length ? pts.reduce((acc, p) => acc + p.quiz, 0) / pts.length : 0);
    const currentLearned = sumLearned(active.data);
    const currentQuiz = avgQuiz(active.data);
    const previousLearned = sumLearned(active.previous);
    const previousQuiz = avgQuiz(active.previous);
    return {
      learned: currentLearned,
      quizAvg: currentQuiz,
      bestQuiz: Math.max(...active.data.map((p) => p.quiz)),
      worstQuiz: Math.min(...active.data.map((p) => p.quiz)),
      avgLearned: currentLearned / active.data.length,
      learnedChange: previousLearned > 0 ? ((currentLearned - previousLearned) / previousLearned) * 100 : null,
      quizChange: previousQuiz > 0 ? ((currentQuiz - previousQuiz) / previousQuiz) * 100 : null,
    };
  }, [active]);

  const change = metric === "quiz" ? stats.quizChange : stats.learnedChange;
  const headline = metric === "quiz" ? `${stats.quizAvg.toFixed(0)}%` : stats.learned.toLocaleString();
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
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Activity</h3>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">Based on dummy data</p>
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
              {m.label}
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
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {metric === "quiz" ? "Quiz win rate in the" : "Words learned in the"}{" "}
            {active.title.toLowerCase()}
          </p>
          <p className="mt-1 flex items-baseline gap-2 text-3xl font-bold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-100">
            {headline}
            {metric === "all" && (
              <span className="text-sm font-semibold text-zinc-400 dark:text-zinc-500">
                · Quiz win {stats.quizAvg.toFixed(0)}%
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
              "New"
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
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            {metric === "quiz"
              ? `best ${stats.bestQuiz}% · worst ${stats.worstQuiz}%`
              : `vs previous · avg ${stats.avgLearned.toFixed(1)}/${granularity}`}
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