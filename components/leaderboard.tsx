"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  CalendarRange,
  Crown,
  FileText,
  Gauge,
  GraduationCap,
  Hash,
  History,
  ListOrdered,
  Medal,
  Sparkles,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/components/language-provider";
import { UserAvatar } from "@/components/UserAvatar";
import { StaggerContainer, StaggerItem } from "@/components/stagger";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface LeaderboardRow {
  id: number;
  name?: string | null;
  user_name?: string | null;
  image?: string | null;
  allTimeAvg: number;
  allTimeCount: number;
  lastWeekAvg: number;
  lastWeekCount: number;
}

type TabKey = "allTime" | "lastWeek";
type RankedRow = LeaderboardRow & { rank: number };
type Translate = (bangla: string, english: string) => string;

const CARD =
  "rounded-2xl border border-black/[0.06] bg-white/70 backdrop-blur-xl shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_30px_-12px_rgba(16,24,40,0.10)] dark:border-white/[0.08] dark:bg-zinc-900/60";

const ICON_CHIP =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-black/[0.04] dark:bg-white/[0.06] ring-1 ring-inset ring-black/[0.05] dark:ring-white/[0.08]";

const RING_RADIUS = 22;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

const podiumThemes = [
  {
    place: 1,
    name: "text-amber-700 dark:text-amber-300",
    scoreChip: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    avatarRing: "from-amber-400/90 via-yellow-400/80 to-amber-500/90",
    ring: "ring-amber-400/50 dark:ring-amber-400/30",
    platform: "from-amber-400 to-yellow-500 h-14 sm:h-20",
    platformText: "text-white",
  },
  {
    place: 2,
    name: "text-zinc-600 dark:text-zinc-300",
    scoreChip: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
    avatarRing: "from-zinc-300/90 via-zinc-200/80 to-zinc-400/90",
    ring: "ring-zinc-300/60 dark:ring-zinc-400/30",
    platform: "from-zinc-300 to-zinc-400 h-10 sm:h-14",
    platformText: "text-zinc-800 dark:text-zinc-900",
  },
  {
    place: 3,
    name: "text-orange-700 dark:text-orange-300",
    scoreChip: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
    avatarRing: "from-orange-400/90 via-orange-300/80 to-orange-500/90",
    ring: "ring-orange-400/50 dark:ring-orange-400/30",
    platform: "from-orange-400 to-orange-500 h-8 sm:h-11",
    platformText: "text-white",
  },
];

function tabValue(tab: TabKey, row: LeaderboardRow): number {
  return tab === "allTime" ? row.allTimeAvg : row.lastWeekAvg;
}

function tabCount(tab: TabKey, row: LeaderboardRow): number {
  return tab === "allTime" ? row.allTimeCount : row.lastWeekCount;
}

function tabMetricLabel(tab: TabKey, t: Translate): string {
  return tab === "allTime"
    ? t("গড় স্কোর", "avg score")
    : t("সপ্তাহের স্কোর", "weekly score");
}

function placeOrdinal(place: number, t: Translate): string {
  const prefix: Record<number, [string, string]> = {
    1: ["প্রথম", "1st"],
    2: ["দ্বিতীয়", "2nd"],
    3: ["তৃতীয়", "3rd"],
  };
  const [bn, en] = prefix[place] ?? ["", ""];
  return t(bn, en);
}

function scoreColor(pct: number): string {
  if (pct >= 90) return "text-emerald-600 dark:text-emerald-400";
  if (pct >= 75) return "text-sky-600 dark:text-sky-400";
  if (pct >= 60) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}

function Podium({ top3, tab }: { top3: RankedRow[]; tab: TabKey }) {
  const t = useT();
  const places = [2, 1, 3].filter((p) => top3.some((r) => r.rank === p));

  return (
    <div className="grid grid-cols-3 items-end gap-2 sm:gap-4">
      {places.map((place) => {
        const row = top3.find((r) => r.rank === place)!;
        const theme = podiumThemes[place - 1];
        const isFirst = place === 1;
        return (
          <Link
            key={row.id}
            href={`/profile/${row.id}`}
            className="group flex min-w-0 flex-col items-center text-center"
          >
            <div className="relative mb-2 flex flex-col items-center">
              {isFirst && (
                <Crown className="mb-1.5 h-6 w-6 text-amber-500 drop-shadow-md transition-transform duration-300 group-hover:-translate-y-0.5 sm:h-7 sm:w-7" />
              )}
              <span
                className={cn(
                  "relative block rounded-full bg-gradient-to-b p-0.5 ring-2 transition-transform duration-300 group-hover:scale-105",
                  theme.avatarRing,
                  theme.ring
                )}
              >
                <UserAvatar
                  id={row.id}
                  name={row.name}
                  userName={row.user_name}
                  image={row.image}
                  size={isFirst ? "lg" : "md"}
                />
              </span>
              {!isFirst && (
                <span
                  className={cn(
                    "absolute -right-1.5 -bottom-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm dark:bg-black",
                    place === 2 ? "text-zinc-400" : "text-orange-500"
                  )}
                >
                  <Medal className="h-4 w-4" />
                </span>
              )}
            </div>

            <span className="mt-2 block w-full px-1">
              <span
                className={cn(
                  "block truncate text-[13px] font-bold transition-colors group-hover:underline sm:text-sm",
                  theme.name
                )}
              >
                {row.name || row.user_name}
              </span>
              {row.user_name && row.user_name !== row.name && (
                <span className="block truncate text-[10px] text-zinc-400 dark:text-zinc-500 sm:text-[11px]">
                  @{row.user_name}
                </span>
              )}
            </span>

            <span
              className={cn(
                "mt-2 inline-flex items-baseline gap-0.5 rounded-full px-2.5 py-1 text-xs font-extrabold tabular-nums sm:text-sm",
                theme.scoreChip
              )}
            >
              {Math.round(tabValue(tab, row))}
              <span className="text-[10px] font-bold sm:text-xs">%</span>
            </span>
            <span className="mt-0.5 text-[10px] tabular-nums text-zinc-400 dark:text-zinc-500">
              {tabCount(tab, row)} {t("পরীক্ষা", "exams")}
            </span>

            <span
              className={cn(
                "mt-3 w-full rounded-t-xl bg-gradient-to-b pt-1.5 text-center text-[10px] font-black uppercase tracking-wider shadow-inner sm:pt-2 sm:text-[11px]",
                theme.platform,
                theme.platformText
              )}
            >
              {placeOrdinal(place, t)}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

function Row({
  row,
  highlight,
  max,
  tab,
}: {
  row: RankedRow;
  highlight?: boolean;
  max: number;
  tab: TabKey;
}) {
  const t = useT();
  const value = tabValue(tab, row);
  const count = tabCount(tab, row);
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <Link
      href={`/profile/${row.id}`}
      className={cn(
        "relative flex items-center gap-3 px-4 py-3 sm:px-5",
        highlight
          ? "bg-orange-500/[0.06] ring-1 ring-inset ring-orange-500/30 dark:bg-orange-500/10"
          : "transition-colors hover:bg-black/[0.02] active:bg-black/[0.02] dark:hover:bg-white/[0.04] dark:active:bg-white/[0.04]"
      )}
    >
      <span
        className={cn(
          "flex h-7 min-w-7 shrink-0 items-center justify-center rounded-lg px-1 text-xs font-bold tabular-nums",
          row.rank === 1 && "bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-sm shadow-amber-500/30",
          row.rank === 2 && "bg-gradient-to-br from-zinc-300 to-zinc-400 text-zinc-900 shadow-sm",
          row.rank === 3 && "bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-sm shadow-orange-500/30",
          row.rank > 3 && "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
        )}
      >
        {row.rank}
      </span>

      <UserAvatar
        id={row.id}
        name={row.name}
        userName={row.user_name}
        image={row.image}
        size="sm"
      />

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
            {row.name || row.user_name}
          </span>
          {highlight && (
            <span className="shrink-0 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
              {t("আপনি", "You")}
            </span>
          )}
        </span>
        <span className="mt-1.5 flex items-center gap-2">
          <span className="h-1.5 w-full max-w-[160px] overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <span
              className="block h-full rounded-full bg-gradient-to-r from-primary/70 to-primary"
              style={{ width: `${pct}%` }}
            />
          </span>
          <span className="whitespace-nowrap text-[10px] tabular-nums text-zinc-400 dark:text-zinc-500">
            {pct}%
          </span>
        </span>
      </span>

      <span className="shrink-0 text-right">
        <span className={cn("block text-sm font-bold tabular-nums", scoreColor(value))}>
          {Math.round(value)}%
        </span>
        <span className="mt-0.5 block text-[10px] uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          {count} {t("পরীক্ষা", "exams")}
        </span>
      </span>
    </Link>
  );
}

function StatRow({
  icon: Icon,
  labelEn,
  labelBn,
  value,
  subEn,
  subBn,
  tint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  labelEn: string;
  labelBn: string;
  value: string;
  subEn: string;
  subBn: string;
  tint: string;
}) {
  const t = useT();

  return (
    <div className="flex items-center gap-3 px-5 py-4">
      <div className={cn(ICON_CHIP, tint)}>
        <Icon className="size-4.5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
          {t(labelBn, labelEn)}
        </p>
        <p className="mt-0.5 text-lg font-semibold tracking-tight tabular-nums text-zinc-900 dark:text-zinc-100">
          {value}
        </p>
        <p className="truncate text-[11px] text-zinc-400 dark:text-zinc-500">
          {t(subBn, subEn)}
        </p>
      </div>
    </div>
  );
}

export function Leaderboard({
  rows,
  currentUserId,
}: {
  rows: LeaderboardRow[];
  currentUserId?: number;
}) {
  const t = useT();
  const [tab, setTab] = useState<TabKey>("allTime");

  const ranked = useMemo(() => {
    const value = (r: LeaderboardRow) => tabValue(tab, r);
    return [...rows]
      .sort((a, b) => value(b) - value(a) || a.id - b.id)
      .map((r, i) => ({ ...r, rank: i + 1 }));
  }, [rows, tab]);

  const top3 = ranked.filter((r) => r.rank <= 3 && tabValue(tab, r) > 0);
  const rest = ranked.filter((r) => r.rank > 3 || tabValue(tab, r) === 0);
  const max = ranked.length > 0 ? Math.max(...ranked.map((r) => tabValue(tab, r))) : 0;
  const me = currentUserId ? ranked.find((r) => r.id === currentUserId) : undefined;
  const topRow = ranked[0];

  return (
    <StaggerContainer className="space-y-4 sm:space-y-6">
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        {/* Left rail: overview */}
        <div className="order-2 space-y-4 sm:space-y-6 lg:order-1">
          <div className="lg:sticky lg:top-6">
          <StaggerItem>
            <div className={cn(CARD, "overflow-hidden")}>
              <div className="p-5 sm:p-6">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.03] dark:bg-white/[0.06] px-3 py-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  <Sparkles className="h-3.5 w-3.5 text-orange-500" />
                  {t("পরীক্ষার র‍্যাংকিং", "Exam ranking")}
                </div>
                <h1 className="mt-3 text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                  {t("লিডারবোর্ড", "Leaderboard")}
                </h1>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {t(
                    "কুইজ পরীক্ষায় গড় স্কোর অনুযায়ী সেরা শিক্ষার্থীদের র‍্যাংকিং।",
                    "Learners ranked by their average quiz exam score."
                  )}
                </p>
              </div>

              <div className="flex items-center gap-4 border-y border-black/[0.06] dark:border-white/[0.08] px-5 sm:px-6 py-4">
                <div className="relative h-14 w-14 shrink-0">
                  <svg viewBox="0 0 52 52" className="h-14 w-14 -rotate-90">
                    <circle
                      cx="26"
                      cy="26"
                      r={RING_RADIUS}
                      fill="none"
                      strokeWidth="5"
                      className="stroke-black/[0.06] dark:stroke-white/[0.08]"
                    />
                    <motion.circle
                      cx="26"
                      cy="26"
                      r={RING_RADIUS}
                      fill="none"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray={RING_LENGTH}
                      initial={{ strokeDashoffset: RING_LENGTH }}
                      animate={{ strokeDashoffset: RING_LENGTH * (1 - max / 100) }}
                      transition={{ duration: 0.9, ease: "easeOut" }}
                      className="stroke-orange-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                      {Math.round(max)}%
                    </span>
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {t("সেরা স্কোর", "Top score")}
                  </p>
                  <p className="mt-0.5 truncate text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                    {topRow ? `#1 · ${topRow.name || topRow.user_name || "—"}` : "—"}
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    {t("সব শিক্ষার্থীর মধ্যে", "among all learners")}
                  </p>
                </div>
              </div>

              <StaggerContainer className="grid grid-cols-2 overflow-hidden">
                <StaggerItem className="border-l border-t border-black/[0.06] dark:border-white/[0.08] [&:nth-child(odd)]:border-l-0 [&:nth-child(-n+2)]:border-t-0">
                  <StatRow
                    icon={Users}
                    labelEn="Learners"
                    labelBn="শিক্ষার্থী"
                    value={`${rows.length}`}
                    subEn="on the leaderboard"
                    subBn="লিডারবোর্ডে"
                    tint="text-orange-500"
                  />
                </StaggerItem>
                <StaggerItem className="border-l border-t border-black/[0.06] dark:border-white/[0.08] [&:nth-child(odd)]:border-l-0 [&:nth-child(-n+2)]:border-t-0">
                  <StatRow
                    icon={Hash}
                    labelEn="Your rank"
                    labelBn="আপনার র‍্যাংক"
                    value={me ? `#${me.rank}` : "–"}
                    subEn={me ? `of ${rows.length} total` : "visible after login"}
                    subBn={me ? `মোট ${rows.length} জনের মধ্যে` : "লগইন করলে দেখা যাবে"}
                    tint="text-emerald-500"
                  />
                </StaggerItem>
                <StaggerItem className="border-l border-t border-black/[0.06] dark:border-white/[0.08] [&:nth-child(odd)]:border-l-0 [&:nth-child(-n+2)]:border-t-0">
                  <StatRow
                    icon={Gauge}
                    labelEn="Your score"
                    labelBn="আপনার স্কোর"
                    value={me ? `${Math.round(tabValue(tab, me))}%` : "–"}
                    subEn={me ? tabMetricLabel(tab, t) : "visible after login"}
                    subBn={me ? tabMetricLabel(tab, t) : "লগইন করলে দেখা যাবে"}
                    tint="text-sky-500"
                  />
                </StaggerItem>
                <StaggerItem className="border-l border-t border-black/[0.06] dark:border-white/[0.08] [&:nth-child(odd)]:border-l-0 [&:nth-child(-n+2)]:border-t-0">
                  <StatRow
                    icon={FileText}
                    labelEn="Exams"
                    labelBn="পরীক্ষা"
                    value={me ? `${tabCount(tab, me)}` : "–"}
                    subEn={me ? "exams taken" : "visible after login"}
                    subBn={me ? "পরীক্ষা নেওয়া হয়েছে" : "লগইন করলে দেখা যাবে"}
                    tint="text-violet-500"
                  />
                </StaggerItem>
              </StaggerContainer>
            </div>
          </StaggerItem>
          </div>

          <StaggerItem>
            <div className={cn(CARD, "overflow-hidden")}>
              <div className="flex items-center gap-2.5 border-b border-black/[0.06] dark:border-white/[0.08] px-5 sm:px-6 py-4">
                <div className={cn(ICON_CHIP, "text-violet-500")}>
                  <GraduationCap className="size-4.5" />
                </div>
                <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                  {t("কীভাবে র‍্যাংকিং হয়", "How ranking works")}
                </h2>
              </div>

              <div className="px-5 sm:px-6 py-4">
                <ul className="space-y-2.5">
                  {[
                    t(
                      "পরীক্ষায় অংশ নিয়ে স্কোর বাড়ান।",
                      "Take exam quizzes to build your score."
                    ),
                    t(
                      "গড় স্কোর অনুযায়ী র‍্যাংক নির্ধারিত হয়।",
                      "Rank is based on your average score."
                    ),
                    t(
                      "সাম্প্রতিক ও সর্বকাল — দুই র‍্যাংকিংই দেখুন।",
                      "Weekly and all-time rankings are both tracked."
                    ),
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">{line}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="px-5 sm:px-6 pb-5">
                <Link
                  href="/quiz"
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-violet-500 text-sm font-medium text-white shadow-[0_1px_2px_rgba(139,92,246,0.3),0_4px_12px_-4px_rgba(139,92,246,0.35)] transition-colors hover:bg-violet-600 active:bg-violet-600"
                >
                  <Target className="size-4" />
                  {t("কুইজ দিন", "Take a Quiz")}
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </StaggerItem>
        </div>

        {/* Main column */}
        <StaggerItem className="order-1 lg:order-2">
          <section>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3 px-1">
              <div className="min-w-0 px-1">
                <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                  {t("শীর্ষ শিক্ষার্থীরা", "Top Performers")}
                </h2>
                <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
                  {t(
                    "সাম্প্রতিক বা সব সময়ের — কে এগিয়ে আছে দেখুন।",
                    "Weekly or all-time — see who leads."
                  )}
                </p>
              </div>
              <Tabs value={tab} onValueChange={(v) => v && setTab(v as TabKey)} className="w-auto shrink-0">
                <TabsList className="h-9 gap-1 p-1">
                  <TabsTrigger value="allTime" className="gap-1.5 rounded-lg px-3 text-xs sm:px-4">
                    <History className="h-3.5 w-3.5" />
                    {t("সর্বকাল", "All time")}
                  </TabsTrigger>
                  <TabsTrigger value="lastWeek" className="gap-1.5 rounded-lg px-3 text-xs sm:px-4">
                    <CalendarRange className="h-3.5 w-3.5" />
                    {t("গত সপ্তাহ", "Last week")}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {ranked.length > 0 ? (
              <StaggerContainer className="space-y-4 sm:space-y-6">
                {top3.length > 0 && (
                  <StaggerItem>
                    <div className={cn(CARD, "overflow-hidden")}>
                      <div className="flex items-center gap-2.5 border-b border-black/[0.06] dark:border-white/[0.08] px-5 sm:px-6 py-4">
                        <div className={cn(ICON_CHIP, "text-amber-500")}>
                          <Trophy className="size-4.5" />
                        </div>
                        <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                          {t("শীর্ষ ৩", "Podium")}
                        </h2>
                      </div>
                      <div className="px-5 py-6 sm:px-6">
                        <Podium top3={top3} tab={tab} />
                      </div>
                    </div>
                  </StaggerItem>
                )}

                {rest.length > 0 && (
                  <StaggerItem>
                    <div className={cn(CARD, "overflow-hidden")}>
                      <div className="flex items-center gap-2.5 border-b border-black/[0.06] dark:border-white/[0.08] px-5 sm:px-6 py-4">
                        <div className={cn(ICON_CHIP, "text-sky-500")}>
                          <ListOrdered className="size-4.5" />
                        </div>
                        <div className="min-w-0">
                          <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                            {t("অন্যান্য র‍্যাংকিং", "Other Rankings")}
                          </h2>
                          <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                            {t("৪র্থ স্থান থেকে নিচের দিকে", "From 4th place onwards")}
                          </p>
                        </div>
                      </div>
                      <div className="divide-y divide-black/[0.06] dark:divide-white/[0.08]">
                        {rest.map((row) => (
                          <Row
                            key={row.id}
                            row={row}
                            max={max}
                            tab={tab}
                            highlight={row.id === currentUserId}
                          />
                        ))}
                      </div>
                    </div>
                  </StaggerItem>
                )}
              </StaggerContainer>
            ) : (
              <StaggerItem>
                <div className={cn(CARD, "px-6 py-16 text-center")}>
                  <Trophy className="mx-auto mb-3 h-10 w-10 text-zinc-300 dark:text-zinc-700" />
                  <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    {t("এখনো কোনো শিক্ষার্থী নেই", "No learners yet")}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {t(
                      "কুইজ পরীক্ষায় অংশ নিয়ে শীর্ষে উঠুন!",
                      "Take a quiz exam to claim the top spot!"
                    )}
                  </p>
                </div>
              </StaggerItem>
            )}
          </section>
        </StaggerItem>
      </div>
    </StaggerContainer>
  );
}