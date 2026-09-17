"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, Crown, Medal, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/components/language-provider";
import type { LeaderboardRow } from "@/components/leaderboard";
import { UserAvatar } from "@/components/UserAvatar";
import { StaggerContainer, StaggerItem } from "@/components/stagger";

const PODIUM_DETAILS = [
  {
    ring: "from-amber-400/90 via-yellow-400/80 to-amber-500/90 ring-amber-400/50 dark:ring-amber-400/30",
    chip: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  },
  {
    ring: "from-zinc-300/90 via-zinc-200/80 to-zinc-400/90 ring-zinc-300/60 dark:ring-zinc-400/30",
    chip: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  },
  {
    ring: "from-orange-400/90 via-orange-300/80 to-orange-500/90 ring-orange-400/50 dark:ring-orange-400/30",
    chip: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
  },
];

export function TopLearnersHome({ rows }: { rows: LeaderboardRow[] }) {
  const t = useT();

  const top3 = useMemo(() => {
    return [...rows]
      .filter((r) => r.allTimeAvg > 0)
      .sort((a, b) => b.allTimeAvg - a.allTimeAvg || a.id - b.id)
      .slice(0, 3);
  }, [rows]);

  if (top3.length === 0) {
    return (
      <section className="mb-14">
        <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-5">
          {t("শীর্ষ শিক্ষার্থীরা", "Top Learners")}
        </h2>
        <div className="rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 px-6 py-12 text-center">
          <Trophy className="mx-auto mb-3 h-9 w-9 text-zinc-300 dark:text-zinc-700" />
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {t("এখনো কোনো শিক্ষার্থী নেই", "No learners yet")}
          </p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {t("আপনিই হতে পারেন প্রথম!", "You could be the first one up there!")}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-14">
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            {t("শীর্ষ শিক্ষার্থীরা", "Top Learners")}
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {t(
              "কুইজ পরীক্ষায় সেরা গড় স্কোর, এক নজরে।",
              "The best quiz exam averages, at a glance."
            )}
          </p>
        </div>
        <Link
          href="/leaderboard"
          className="hidden sm:inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-orange-600 hover:text-orange-700 active:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 dark:active:text-orange-300 transition-colors"
        >
          {t("পুরো লিডারবোর্ড", "Full leaderboard")}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="rounded-3xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-5 sm:p-6 shadow-sm">
        <StaggerContainer className="grid grid-cols-3 items-end gap-2 sm:gap-4">
          {[1, 0, 2].map((idx) => {
            const row = top3[idx];
            if (!row) return <span key={idx} />;
            const first = idx === 0;
            const d = PODIUM_DETAILS[idx];
            return (
              <StaggerItem key={row.id} className="min-w-0">
                <Link
                  href={`/profile/${row.id}`}
                  className="group flex min-w-0 flex-col items-center text-center"
                >
                  <div className="relative mb-2 flex flex-col items-center">
                    {first && <Crown className="mb-1.5 h-6 w-6 text-amber-500 drop-shadow-md" />}
                    <span
                      className={cn(
                        "relative block rounded-full bg-gradient-to-b p-0.5 ring-2 transition-transform duration-300 group-hover:scale-105 active:scale-105",
                        d.ring
                      )}
                    >
                      <UserAvatar
                        id={row.id}
                        name={row.name}
                        userName={row.user_name}
                        image={row.image}
                        size={first ? "lg" : "md"}
                      />
                    </span>
                    {!first && (
                      <span className="absolute -right-1.5 -bottom-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm dark:bg-black">
                        <Medal className={cn("h-4 w-4", idx === 1 ? "text-zinc-400" : "text-orange-500")} />
                      </span>
                    )}
                  </div>
                  <span className="mt-2 block w-full px-1 truncate text-[13px] font-bold sm:text-sm group-hover:underline group-active:underline">
                    {row.name || row.user_name}
                  </span>
                  <span
                    className={cn(
                      "mt-2 inline-flex items-baseline gap-0.5 rounded-full px-2.5 py-1 text-xs font-extrabold tabular-nums sm:text-sm",
                      d.chip
                    )}
                  >
                    {Math.round(row.allTimeAvg)}
                    <span className="text-[10px] font-bold sm:text-xs">%</span>
                  </span>
                  <span className="mt-0.5 text-[10px] tabular-nums text-zinc-400 dark:text-zinc-500">
                    {row.allTimeCount} {t("পরীক্ষা", "exams")}
                  </span>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        <Link
          href="/leaderboard"
          className="group mt-6 flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-4 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 transition-all hover:border-orange-300 hover:text-orange-600 active:border-orange-300 active:text-orange-600 dark:hover:border-orange-800 dark:hover:text-orange-400 dark:active:border-orange-800 dark:active:text-orange-400 sm:hidden"
        >
          <Trophy className="h-4 w-4" />
          {t("পুরো লিডারবোর্ড দেখুন", "View full leaderboard")}
        </Link>
      </div>
    </section>
  );
}