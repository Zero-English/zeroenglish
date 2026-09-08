"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useT, useNum } from "@/components/language-provider";
import { BookOpen, Flame, Target, Trophy } from "lucide-react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
}

function fmt(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function generateContributions(userId: number, days = 365): { date: string; count: number }[] {
  const out: { date: string; count: number }[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dow = d.getDay();
    const r = seededRandom(userId * 1009 + i * 17);
    let count = 0;
    if (dow !== 0 && dow !== 6) {
      if (r < 0.15) count = 0;
      else if (r < 0.45) count = 1;
      else if (r < 0.7) count = 2;
      else if (r < 0.9) count = 4;
      else count = 8;
    } else if (seededRandom(userId * 313 + i * 7) < 0.35) {
      count = 1 + Math.floor(seededRandom(userId * 67 + i) * 3);
    }
    if (i % 13 === 0) count = Math.min(10, count + 2);
    out.push({ date: fmt(d), count });
  }
  return out;
}

function getIntensity(count: number): string {
  if (count === 0) return "bg-zinc-100 dark:bg-zinc-800/50";
  if (count <= 2) return "bg-emerald-200 dark:bg-emerald-900/60";
  if (count <= 4) return "bg-emerald-400 dark:bg-emerald-700";
  if (count <= 7) return "bg-emerald-500 dark:bg-emerald-500";
  return "bg-emerald-600 dark:bg-emerald-400";
}

export function ContributionCalendar({
  userId,
  data,
}: {
  userId: number;
  data?: { date: string; count: number }[];
}) {
  const t = useT();
  const num = useNum();

  const isDemo = !data || data.length === 0;
  const items = useMemo(
    () => (isDemo ? generateContributions(userId) : data),
    [userId, data, isDemo]
  );

  const todayCount = items.length > 0 ? items[items.length - 1].count : 0;

  const stats = useMemo(() => {
    const total = items.reduce((acc, d) => acc + d.count, 0);
    let streak = 0;
    for (let i = items.length - 1; i >= 0; i--) {
      if (items[i].count === 0) break;
      streak++;
    }
    let longest = 0;
    let run = 0;
    for (const item of items) {
      run = item.count > 0 ? run + 1 : 0;
      if (run > longest) longest = run;
    }
    const bestDay = Math.max(...items.map((d) => d.count));
    return { total, streak, longest, bestDay };
  }, [items]);

  const weeks: { date: string; count: number }[][] = [];
  let currentWeek: { date: string; count: number }[] = [];

  const firstDate = new Date(items[0]?.date);
  const startDay = firstDate.getDay();

  for (let i = 0; i < startDay; i++) {
    currentWeek.push({ date: "", count: -1 });
  }

  for (const item of items) {
    currentWeek.push(item);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  const monthLabels: { label: string; col: number }[] = [];
  let lastMonth = -1;
  for (let w = 0; w < weeks.length; w++) {
    const firstItem = weeks[w].find((d) => d.date);
    if (firstItem) {
      const m = new Date(firstItem.date).getMonth();
      if (m !== lastMonth) {
        monthLabels.push({ label: MONTHS[m], col: w });
        lastMonth = m;
      }
    }
  }

  const currentYear = new Date().getFullYear();

  const summary = [
    { icon: BookOpen, tint: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30", label: t("এ বছর মোট", "Total this year"), value: num(stats.total) },
    { icon: Target, tint: "text-sky-600", bg: "bg-sky-100 dark:bg-sky-900/30", label: t("আজ", "Today"), value: num(todayCount) },
    { icon: Flame, tint: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/30", label: t("চলমান ধারা", "Current Streak"), value: `${num(stats.streak)}${t(" দিন", "d")}` },
    { icon: Trophy, tint: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30", label: t("দীর্ঘতম ধারা", "Longest Streak"), value: `${num(stats.longest)}${t(" দিন", "d")}` },
    { icon: BookOpen, tint: "text-violet-600", bg: "bg-violet-100 dark:bg-violet-900/30", label: t("সেরা দিন", "Best Day"), value: num(stats.bestDay) },
  ];

  return (
    <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-1">
        <BookOpen className="h-5 w-5 text-zinc-500" />
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          {t("দৈনিক অগ্রগতি", "Daily Progress")}
        </h3>
        {isDemo && (
          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            {t("ডেমো ডেটা", "Demo data")}
          </span>
        )}
      </div>
      <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-5">
        {t("দিনে শেখা শব্দের সংখ্যা", "Words learned per day")}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
        {summary.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-900/40 p-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className={cn("p-1.5 rounded-lg", s.bg)}>
                  <Icon className={cn("h-4 w-4", s.tint)} />
                </div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{s.label}</span>
              </div>
              <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{s.value}</div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="h-4 w-4 text-zinc-400" />
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{num(currentYear)}</span>
        </div>

        <div className="overflow-x-auto no-scrollbar [&::-webkit-scrollbar]:hidden">
          <div className="flex flex-col w-full min-w-[728px]">
            <div className="relative h-4 ml-8">
              {monthLabels.map((m) => (
                  <div
                    key={`${m.label}-${m.col}`}
                    className="absolute text-[10px] text-zinc-400 top-0 whitespace-nowrap overflow-visible"
                    style={{
                      left: `${(m.col / weeks.length) * 100}%`,
                    }}
                  >
                    {m.label}
                  </div>
                ))}
            </div>
            <div className="flex gap-[3px] w-full">
              <div className="flex flex-col gap-[3px] mr-[3px]">
                {DAY_LABELS.map((l, i) => (
                  <div key={i} className="h-[14px] text-[10px] text-zinc-400 leading-[14px]">
                    {l}
                  </div>
                ))}
              </div>
              <div className="flex flex-1 gap-[3px]">
                {weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-1 flex-col gap-[3px]">
                    {week.map((day, di) => (
                      <div
                        key={di}
                        className={cn(
                          "flex-1 aspect-square min-h-[10px] rounded-[3px]",
                          day.count === -1 ? "bg-transparent" : getIntensity(day.count)
                        )}
                        title={
                          day.date
                            ? `${day.date}: ${t(`${num(day.count)}টি শব্দ`, `${day.count} word${day.count !== 1 ? "s" : ""}`)}`
                            : undefined
                        }
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 mt-2 justify-end">
          <span className="text-[10px] text-zinc-400">{t("কম", "Less")}</span>
          <div className="h-3 w-3 rounded-sm bg-zinc-100 dark:bg-zinc-800/50" />
          <div className="h-3 w-3 rounded-sm bg-emerald-200 dark:bg-emerald-900/60" />
          <div className="h-3 w-3 rounded-sm bg-emerald-400 dark:bg-emerald-700" />
          <div className="h-3 w-3 rounded-sm bg-emerald-500 dark:bg-emerald-500" />
          <div className="h-3 w-3 rounded-sm bg-emerald-600 dark:bg-emerald-400" />
          <span className="text-[10px] text-zinc-400">{t("বেশি", "More")}</span>
        </div>
      </div>
    </div>
  );
}