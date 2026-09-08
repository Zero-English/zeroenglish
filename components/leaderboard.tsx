"use client";

import Link from "next/link";
import { Crown, Medal, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT, useNum } from "@/components/language-provider";
import { UserAvatar } from "@/components/UserAvatar";
import { StaggerContainer, StaggerItem } from "@/components/stagger";

export interface LeaderboardRow {
    rank: number;
    id?: number;
    name?: string | null;
    user_name?: string | null;
    image?: string | null;
    learnedWordCount: number;
}

const podiumThemes = [
    {
        place: 1,
        theme: "from-amber-400/90 via-yellow-400/80 to-amber-500/90",
        ring: "ring-amber-400/50 dark:ring-amber-400/30",
        name: "text-amber-700 dark:text-amber-300",
        stacked: "border-amber-200 bg-amber-50 group-hover:border-amber-300 dark:border-amber-500/20 dark:bg-amber-500/10 dark:group-hover:border-amber-400/40",
    },
    {
        place: 2,
        theme: "from-zinc-300/90 via-zinc-200/80 to-zinc-400/90",
        ring: "ring-zinc-300/60 dark:ring-zinc-400/30",
        name: "text-zinc-600 dark:text-zinc-300",
        stacked: "border-zinc-200 bg-zinc-50 group-hover:border-zinc-300 dark:border-zinc-500/20 dark:bg-zinc-500/10 dark:group-hover:border-zinc-400/40",
    },
    {
        place: 3,
        theme: "from-orange-400/90 via-orange-300/80 to-orange-500/90",
        ring: "ring-orange-400/50 dark:ring-orange-400/30",
        name: "text-orange-700 dark:text-orange-300",
        stacked: "border-orange-200 bg-orange-50 group-hover:border-orange-300 dark:border-orange-500/20 dark:bg-orange-500/10 dark:group-hover:border-orange-400/40",
    },
];

function placeLabel(place: number, t: (bn: string, en: string) => string) {
    const prefix: Record<number, [string, string]> = {
        1: ["#১", "#1"],
        2: ["#২", "#2"],
        3: ["#৩", "#3"],
    };
    const [bn, en] = prefix[place] ?? ["", ""];
    return t(`${bn} অবস্থান`, `${en} Place`);
}

function Podium({ top3 }: { top3: LeaderboardRow[] }) {
    const t = useT();
    const num = useNum();
    const order = [2, 1, 3].filter((p) => top3.some((r) => r.rank === p));

    return (
        <div className="grid grid-cols-3 items-end gap-3 sm:gap-4">
            {order.map((place) => {
                const row = top3.find((r) => r.rank === place)!;
                const theme = podiumThemes[place - 1];
                const isFirst = place === 1;
                return (
                    <Link
                        key={row.id}
                        href={row.id ? `/profile/${row.id}` : "#"}
                        className="group flex flex-col items-center text-center"
                    >
                        <div className="relative mb-2 flex flex-col items-center">
                            {isFirst && (
                                <Crown className="mb-1 h-7 w-7 text-amber-500 drop-shadow transition-transform group-hover:-translate-y-0.5" />
                            )}
                            <span
                                className={cn(
                                    "relative block rounded-full bg-gradient-to-b p-0.5 ring-2 transition-transform group-hover:scale-105",
                                    theme.theme,
                                    theme.ring
                                )}
                            >
                                {row.id ? (
                                    <UserAvatar
                                        id={row.id}
                                        name={row.name}
                                        userName={row.user_name}
                                        image={row.image}
                                        size={isFirst ? "lg" : "md"}
                                    />
                                ) : (
                                    <span className={cn("block rounded-full bg-zinc-200 dark:bg-zinc-800", isFirst ? "h-14 w-14" : "h-9 w-9")} />
                                )}
                            </span>
                            {!isFirst && row.id && (
                                <Medal
                                    className={cn(
                                        "absolute -right-1 -bottom-1 h-5 w-5 rounded-full bg-white p-0.5 dark:bg-black",
                                        place === 2 ? "text-zinc-400" : "text-orange-400"
                                    )}
                                />
                            )}
                        </div>

                        <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                            {placeLabel(place, t)}
                        </span>

                        <span className="mt-1.5 block w-full">
                            <span className={cn("block truncate text-sm font-bold transition-colors group-hover:underline", theme.name)}>
                                {row.name || row.user_name}
                            </span>
                            <span className="block truncate text-xs text-zinc-400 dark:text-zinc-500">
                                @{row.user_name}
                            </span>
                        </span>

                        <div
                            className={cn(
                                "mt-2 flex w-full flex-col items-center rounded-xl border px-2 py-2 transition-colors",
                                theme.stacked
                            )}
                        >
                            <span className="text-base font-extrabold leading-none text-zinc-900 dark:text-white sm:text-lg">
                                {num(row.learnedWordCount)}
                            </span>
                            <span className="mt-0.5 text-[10px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                                {t("শব্দ শিখেছে", "words")}
                            </span>
                        </div>
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
}: {
    row: LeaderboardRow;
    highlight?: boolean;
    max: number;
}) {
    const t = useT();
    const num = useNum();
    const pct = max > 0 ? Math.min(100, Math.round((row.learnedWordCount / max) * 100)) : 0;

    const content = (
        <>
            <span className="w-7 shrink-0 text-right text-xs font-bold text-zinc-400 dark:text-zinc-500">
                {row.rank}
            </span>

            <UserAvatar
                id={row.id ?? 0}
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
                <span className="mt-1 flex items-center gap-2">
                    <span className="h-1.5 w-full max-w-[160px] overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                        <span
                            className="block h-full rounded-full bg-gradient-to-r from-primary/70 to-primary"
                            style={{ width: `${pct}%` }}
                        />
                    </span>
                    <span className="whitespace-nowrap text-[10px] text-zinc-400 dark:text-zinc-500">
                        {pct}%
                    </span>
                </span>
            </span>

            <span className="shrink-0 text-right">
                <span className="block text-sm font-bold text-zinc-900 dark:text-white">
                    {num(row.learnedWordCount)}
                </span>
                <span className="block text-[10px] uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                    {t("শব্দ", "words")}
                </span>
            </span>
        </>
    );

    const rowClass = cn(
        "relative flex items-center gap-3 px-4 py-3 sm:px-5",
        "border-b last:border-0 border-gray-100 dark:border-gray-900",
        highlight
            ? "bg-primary/10 ring-1 ring-primary/30"
            : "hover:bg-gray-50 dark:hover:bg-gray-900/60 transition-colors"
    );

    if (row.id) {
        return (
            <Link href={`/profile/${row.id}`} className={rowClass}>
                {content}
            </Link>
        );
    }
    return <div className={rowClass}>{content}</div>;
}

export function Leaderboard({
    rows,
    viewer,
}: {
    rows: LeaderboardRow[];
    viewer: LeaderboardRow | null;
}) {
    const t = useT();
    const top3 = rows.filter((r) => r.rank <= 3);
    const rest = rows.filter((r) => r.rank > 3);
    const max = rows.length > 0 ? Math.max(...rows.map((r) => r.learnedWordCount)) : 0;

    return (
        <StaggerContainer>
            <div className="mb-6 text-center">
                <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-lg shadow-amber-500/30">
                    <Trophy className="h-7 w-7" />
                </span>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                    {t("লিডারবোর্ড", "Leaderboard")}
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                    {t(
                        "সবচেয়ে বেশি শব্দ শিখেছেন এমন শীর্ষ শিক্ষার্থীদের র‍্যাঙ্কিং।",
                        "Top learners ranked by words learned."
                    )}
                </p>
            </div>

            {rows.length > 0 ? (
                <>
                    <StaggerItem>
                        <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-lg shadow-zinc-200/50 dark:border-gray-800 dark:bg-zinc-900/60 dark:shadow-none sm:p-6">
                            <Podium top3={top3} />
                        </div>
                    </StaggerItem>

                    {rest.length > 0 && (
                        <StaggerItem>
                            <div className="mt-6">
                                <div className="mb-2 flex items-center gap-2 px-1">
                                    <span className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
                                    <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                                        {t("অন্যান্য র‍্যাংকিং", "Other rankings")}
                                    </span>
                                    <span className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
                                </div>
                                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-zinc-900/60">
                                    {rest.map((row) => (
                                        <Row key={row.id} row={row} max={max} />
                                    ))}
                                </div>
                            </div>
                        </StaggerItem>
                    )}
                </>
            ) : (
                <StaggerItem>
                    <div className="rounded-2xl border border-dashed border-gray-200 px-6 py-16 text-center dark:border-gray-800">
                        <Trophy className="mx-auto mb-3 h-10 w-10 text-zinc-300 dark:text-zinc-700" />
                        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                            {t("এখনো কোনো শিক্ষার্থী নেই", "No learners yet")}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                            {t(
                                "আপনি প্রথম শব্দটি শিখে শীর্ষে উঠুন!",
                                "Learn your first word to claim the top spot!"
                            )}
                        </p>
                    </div>
                </StaggerItem>
            )}

            {viewer && (
                <StaggerItem>
                    <div className="mt-4 overflow-hidden rounded-2xl border-2 border-primary/40 bg-white shadow-lg shadow-primary/5 dark:bg-zinc-900/60">
                        <div className="flex items-center justify-between bg-primary/10 px-4 py-1.5">
                            <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
                                {viewer.rank > 1
                                    ? t("আপনার বর্তমান র‍্যাংক", "Your current rank")
                                    : t("আপনার র‍্যাংক", "Your rank")}
                            </span>
                            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                                {t("র‍্যাংক", "Rank")} #{viewer.rank}
                            </span>
                        </div>
                        <Row row={viewer} highlight max={Math.max(max, viewer.learnedWordCount)} />
                    </div>
                </StaggerItem>
            )}
        </StaggerContainer>
    );
}