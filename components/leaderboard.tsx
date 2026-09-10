"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
    CalendarRange,
    Crown,
    FileText,
    Hash,
    History,
    Medal,
    Target,
    Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useT, useNum } from "@/components/language-provider";
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
    const num = useNum();
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
                            {num(Math.round(tabValue(tab, row)))}
                            <span className="text-[10px] font-bold sm:text-xs">%</span>
                        </span>
                        <span className="mt-0.5 text-[10px] tabular-nums text-zinc-400 dark:text-zinc-500">
                            {num(tabCount(tab, row))} {t("পরীক্ষা", "exams")}
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
    const num = useNum();
    const value = tabValue(tab, row);
    const count = tabCount(tab, row);
    const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

    const content = (
        <>
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
                    {num(Math.round(value))}%
                </span>
                <span className="mt-0.5 block text-[10px] uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                    {num(count)} {t("পরীক্ষা", "exams")}
                </span>
            </span>
        </>
    );

    const rowClass = cn(
        "relative flex items-center gap-3 px-4 py-3 sm:px-5",
        "border-b last:border-0 border-zinc-100 dark:border-zinc-800/80",
        highlight
            ? "bg-orange-500/[0.06] ring-1 ring-inset ring-orange-500/30 dark:bg-orange-500/10"
            : "transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
    );

    return (
        <Link href={`/profile/${row.id}`} className={rowClass}>
            {content}
        </Link>
    );
}

function MiniStat({
    icon,
    value,
    label,
    tone,
}: {
    icon: ReactNode;
    value: string;
    label: string;
    tone: string;
}) {
    return (
        <div className="flex flex-col items-center gap-1 rounded-2xl border border-zinc-200/70 bg-white/70 p-3 backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-900/40">
            <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", tone)}>
                {icon}
            </div>
            <span className="text-base font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                {value}
            </span>
            <span className="text-center text-[10px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                {label}
            </span>
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
    const num = useNum();
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

    return (
        <StaggerContainer className="space-y-4 sm:space-y-5">
            <div className="mb-1 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-rose-500 to-pink-500 text-white shadow-lg shadow-orange-500/30">
                    <Trophy className="h-7 w-7" />
                </div>
                <h1 className="bg-gradient-to-r from-zinc-900 to-zinc-600 bg-clip-text text-2xl font-bold tracking-tight text-transparent dark:from-white dark:to-zinc-400 sm:text-3xl">
                    {t("লিডারবোর্ড", "Leaderboard")}
                </h1>
                <p className="mx-auto mt-2 max-w-md text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm">
                    {t(
                        "কুইজ পরীক্ষায় সেরা গড় স্কোর অর্জন করা শীর্ষ শিক্ষার্থীদের র‍্যাংকিং।",
                        "Top learners ranked by quiz exam performance."
                    )}
                </p>
            </div>

            <StaggerItem className="mt-6">
                <div className="flex justify-center">
                    <Tabs value={tab} onValueChange={(v) => v && setTab(v as TabKey)} className="w-auto">
                        <TabsList className="h-10 gap-1 p-1">
                            <TabsTrigger value="allTime" className="gap-1.5 rounded-lg px-3 sm:px-4">
                                <History className="h-3.5 w-3.5" />
                                {t("সর্বকাল", "All time")}
                            </TabsTrigger>
                            <TabsTrigger value="lastWeek" className="gap-1.5 rounded-lg px-3 sm:px-4">
                                <CalendarRange className="h-3.5 w-3.5" />
                                {t("গত সপ্তাহ", "Last week")}
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </StaggerItem>

            {ranked.length > 0 ? (
                <>
                    {top3.length > 0 && (
                        <StaggerItem>
                            <div className="rounded-3xl border border-zinc-200/70 bg-white/80 p-5 shadow-lg shadow-zinc-200/50 backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-950/60 dark:shadow-none sm:p-6">
                                <Podium top3={top3} tab={tab} />
                            </div>
                        </StaggerItem>
                    )}

                    {me && (
                        <StaggerItem>
                            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                <MiniStat
                                    icon={<Hash className="h-4 w-4" />}
                                    tone="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300"
                                    value={`#${num(me.rank)}`}
                                    label={t("র‍্যাংক", "Rank")}
                                />
                                <MiniStat
                                    icon={<Target className="h-4 w-4" />}
                                    tone="bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300"
                                    value={`${num(Math.round(tabValue(tab, me)))}%`}
                                    label={tabMetricLabel(tab, t)}
                                />
                                <MiniStat
                                    icon={<FileText className="h-4 w-4" />}
                                    tone="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300"
                                    value={num(tabCount(tab, me))}
                                    label={t("পরীক্ষা", "Exams")}
                                />
                            </div>
                        </StaggerItem>
                    )}

                    {rest.length > 0 && (
                        <StaggerItem>
                            <div>
                                <div className="mb-2 flex items-center gap-2 px-1">
                                    <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
                                    <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                                        {t("অন্যান্য র‍্যাংকিং", "Other rankings")}
                                    </span>
                                    <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
                                </div>
                                <div className="overflow-hidden rounded-2xl border border-zinc-200/70 bg-white/80 shadow-sm backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-950/60">
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
                </>
            ) : (
                <StaggerItem>
                    <div className="rounded-2xl border border-dashed border-zinc-200 px-6 py-16 text-center dark:border-zinc-800">
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
        </StaggerContainer>
    );
}