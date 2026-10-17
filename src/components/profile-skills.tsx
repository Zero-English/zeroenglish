"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useT } from "@/components/language-provider";
import { useLearnedWords } from "@/lib/use-learned-words";
import { useStillLearningWords } from "@/lib/use-still-learning-words";
import type { UserSkillsProfile } from "@/services/user.service";
import {
  BookOpen,
  GraduationCap,
  Compass,
  FileText,
  Sparkles,
  Clock,
  Layers,
  Mic,
  Target,
  Trophy,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";

function SkillCircularProgress({
  percentage,
  colorClass,
  size = 48,
  strokeWidth = 4.5,
}: {
  percentage: number;
  colorClass: string;
  size?: number;
  strokeWidth?: number;
}) {
  const r = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, Math.round(percentage)));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className="relative shrink-0 flex items-center justify-center select-none"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90 transform"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/60 dark:text-muted/30"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn("transition-all duration-700 ease-out", colorClass)}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] sm:text-xs font-black tabular-nums text-foreground tracking-tight">
          {clamped}%
        </span>
      </div>
    </div>
  );
}

const ICON_MAP: Record<string, LucideIcon> = {
  BookOpen,
  GraduationCap,
  Compass,
  FileText,
  Sparkles,
  Clock,
  Layers,
  Mic,
};

const COLOR_MAP: Record<
  string,
  {
    bg: string;
    border: string;
    text: string;
    progress: string;
    block: string;
    badge: string;
  }
> = {
  emerald: {
    bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    border: "border-emerald-500/20 dark:border-emerald-500/30",
    text: "text-emerald-600 dark:text-emerald-400",
    progress: "bg-emerald-500",
    block: "text-emerald-600 dark:text-emerald-400",
    badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  },
  violet: {
    bg: "bg-violet-500/10 dark:bg-violet-500/15",
    border: "border-violet-500/20 dark:border-violet-500/30",
    text: "text-violet-600 dark:text-violet-400",
    progress: "bg-violet-500",
    block: "text-violet-600 dark:text-violet-400",
    badge: "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30",
  },
  amber: {
    bg: "bg-amber-500/10 dark:bg-amber-500/15",
    border: "border-amber-500/20 dark:border-amber-500/30",
    text: "text-amber-600 dark:text-amber-400",
    progress: "bg-amber-500",
    block: "text-amber-600 dark:text-amber-400",
    badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  },
  sky: {
    bg: "bg-sky-500/10 dark:bg-sky-500/15",
    border: "border-sky-500/20 dark:border-sky-500/30",
    text: "text-sky-600 dark:text-sky-400",
    progress: "bg-sky-500",
    block: "text-sky-600 dark:text-sky-400",
    badge: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30",
  },
  rose: {
    bg: "bg-rose-500/10 dark:bg-rose-500/15",
    border: "border-rose-500/20 dark:border-rose-500/30",
    text: "text-rose-600 dark:text-rose-400",
    progress: "bg-rose-500",
    block: "text-rose-600 dark:text-rose-400",
    badge: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
  },
  indigo: {
    bg: "bg-indigo-500/10 dark:bg-indigo-500/15",
    border: "border-indigo-500/20 dark:border-indigo-500/30",
    text: "text-indigo-600 dark:text-indigo-400",
    progress: "bg-indigo-500",
    block: "text-indigo-600 dark:text-indigo-400",
    badge: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
  },
  cyan: {
    bg: "bg-cyan-500/10 dark:bg-cyan-500/15",
    border: "border-cyan-500/20 dark:border-cyan-500/30",
    text: "text-cyan-600 dark:text-cyan-400",
    progress: "bg-cyan-500",
    block: "text-cyan-600 dark:text-cyan-400",
    badge: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30",
  },
  fuchsia: {
    bg: "bg-fuchsia-500/10 dark:bg-fuchsia-500/15",
    border: "border-fuchsia-500/20 dark:border-fuchsia-500/30",
    text: "text-fuchsia-600 dark:text-fuchsia-400",
    progress: "bg-fuchsia-500",
    block: "text-fuchsia-600 dark:text-fuchsia-400",
    badge: "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-500/30",
  },
};

export interface ProfileSkillsCardProps {
  userId?: number;
  initialProfile?: UserSkillsProfile | null;
  className?: string;
  isPublic?: boolean;
}

export function ProfileSkillsCard({
  userId,
  initialProfile,
  className,
  isPublic = false,
}: ProfileSkillsCardProps) {
  const t = useT();
  const [profile, setProfile] = useState<UserSkillsProfile | null>(initialProfile ?? null);
  const [loading, setLoading] = useState<boolean>(!initialProfile);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active">("all");
  const [, startTransition] = useTransition();

  // Offline/guest fallback support for vocabulary
  const { learnedIds, loaded: learnedLoaded } = useLearnedWords();
  const { stillLearningIds, loaded: stillLoaded } = useStillLearningWords();
  const guestLearnedCount = learnedIds?.size ?? 0;
  const guestStillLearningCount = stillLearningIds?.size ?? 0;

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const url = userId ? `/api/v1/profile/skills?userId=${userId}` : "/api/v1/profile/skills";
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 401 && !userId) {
          // Unauthenticated guest user
          setProfile(null);
          setLoading(false);
          return;
        }
        throw new Error("Failed to load skills profile");
      }
      const json = await res.json();
      if (json.success && json.data) {
        startTransition(() => {
          setProfile(json.data);
        });
      } else {
        throw new Error(json.message || "Failed to load skills profile");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error loading skills profile");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    let cancelled = false;
    if (!initialProfile) {
      (async () => {
        try {
          const url = userId ? `/api/v1/profile/skills?userId=${userId}` : "/api/v1/profile/skills";
          const res = await fetch(url);
          if (cancelled) return;
          if (!res.ok) {
            if (res.status === 401 && !userId) {
              setProfile(null);
              setLoading(false);
              return;
            }
            throw new Error("Failed to load skills profile");
          }
          const json = await res.json();
          if (cancelled) return;
          if (json.success && json.data) {
            startTransition(() => {
              setProfile(json.data);
            });
          }
        } catch (err: unknown) {
          if (!cancelled) {
            setError(err instanceof Error ? err.message : "Error loading skills profile");
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      })();
    }
    return () => {
      cancelled = true;
    };
  }, [userId, initialProfile]);

  // Construct guest profile if unauthenticated
  const resolvedProfile: UserSkillsProfile | null = profile ?? (
    (!userId && !isPublic && learnedLoaded && stillLoaded)
      ? {
          overallScore: (guestLearnedCount + guestStillLearningCount > 0)
            ? Math.round((guestLearnedCount / (guestLearnedCount + guestStillLearningCount)) * 100)
            : 0,
          levelTitle: "Beginner (A1)",
          levelTitleBn: "শিক্ষানবিস স্তর (A1)",
          totalQuestionsAttempted: 0,
          totalWordsMastered: guestLearnedCount,
          skills: [
            {
              id: "vocabulary",
              name: "Vocabulary",
              nameBn: "শব্দভাণ্ডার",
              percentage: (guestLearnedCount + guestStillLearningCount > 0)
                ? Math.round((guestLearnedCount / (guestLearnedCount + guestStillLearningCount)) * 100)
                : (guestLearnedCount > 0 ? Math.min(100, Math.round((guestLearnedCount / 500) * 100)) : 0),
              visualBar: "█".repeat(Math.min(10, Math.round(((guestLearnedCount / Math.max(1, guestLearnedCount + guestStillLearningCount)) * 10)))) +
                "░".repeat(Math.max(0, 10 - Math.min(10, Math.round(((guestLearnedCount / Math.max(1, guestLearnedCount + guestStillLearningCount)) * 10))))),
              correctCount: guestLearnedCount,
              totalCount: guestLearnedCount + guestStillLearningCount || 500,
              unit: "words",
              status: guestLearnedCount > 0 ? "active" : "untested",
              icon: "BookOpen",
              color: "emerald",
              practiceUrl: "/dictionary",
            },
            {
              id: "grammar",
              name: "Grammar",
              nameBn: "ব্যাকরণ",
              percentage: 0,
              visualBar: "░░░░░░░░░░",
              correctCount: 0,
              totalCount: 0,
              unit: "questions",
              status: "untested",
              icon: "GraduationCap",
              color: "violet",
              practiceUrl: "/quiz",
            },
            {
              id: "prepositions",
              name: "Prepositions",
              nameBn: "প্রেপজিশন",
              percentage: 0,
              visualBar: "░░░░░░░░░░",
              correctCount: 0,
              totalCount: 0,
              unit: "questions",
              status: "untested",
              icon: "Compass",
              color: "amber",
              practiceUrl: "/quiz",
            },
            {
              id: "articles",
              name: "Articles",
              nameBn: "আর্টিকেল",
              percentage: 0,
              visualBar: "░░░░░░░░░░",
              correctCount: 0,
              totalCount: 0,
              unit: "questions",
              status: "untested",
              icon: "FileText",
              color: "sky",
              practiceUrl: "/quiz",
            },
            {
              id: "idioms",
              name: "Idioms & Phrases",
              nameBn: "বাগধারা ও ইডিয়ম",
              percentage: 0,
              visualBar: "░░░░░░░░░░",
              correctCount: 0,
              totalCount: 0,
              unit: "questions",
              status: "untested",
              icon: "Sparkles",
              color: "rose",
              practiceUrl: "/quiz",
            },
          ],
        }
      : null
  );

  const displayedSkills = (resolvedProfile?.skills ?? []).filter((s) => {
    if (filter === "active") return s.status === "active";
    return true;
  });

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md shadow-xs p-4 sm:p-6 transition-all duration-300",
        className
      )}
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-5 pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                {t("আপনার ইংরেজি দক্ষতা প্রোফাইল", "Your English Profile")}
              </h2>
              {resolvedProfile && (
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border border-primary/30 bg-primary/10 text-primary">
                  {t(resolvedProfile.levelTitleBn, resolvedProfile.levelTitle)}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t(
                "শব্দভাণ্ডার ও কুইজের সামগ্রিক দক্ষতা বিশ্লেষণ",
                "Competency analytics across vocabulary, grammar & quiz categories"
              )}
            </p>
          </div>
        </div>

        {/* Filter Toggle & Refresh */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex items-center p-0.5 rounded-lg bg-muted/60 border border-border/60 text-xs font-medium">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={cn(
                "px-2.5 py-1 rounded-md transition-all text-[11px] font-semibold cursor-pointer",
                filter === "all"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t("সকল দক্ষতা", "All Skills")}
            </button>
            <button
              type="button"
              onClick={() => setFilter("active")}
              className={cn(
                "px-2.5 py-1 rounded-md transition-all text-[11px] font-semibold cursor-pointer",
                filter === "active"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t("পরীক্ষিত", "Tested")}
            </button>
          </div>

          {!initialProfile && (
            <button
              type="button"
              onClick={fetchProfile}
              disabled={loading}
              title={t("রিফ্রেশ করুন", "Refresh")}
              className="p-1.5 rounded-lg border border-border/60 bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            </button>
          )}
        </div>
      </div>

      {/* Hero Proficiency Matrix Banner */}
      {resolvedProfile && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-5 p-3.5 sm:p-4 rounded-xl bg-muted/40 border border-border/60">
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              {t("সামগ্রিক দক্ষতা", "Overall Index")}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-black text-foreground tabular-nums">
                {resolvedProfile.overallScore}%
              </span>
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              {t("বর্তমান স্তর", "CEFR Tier")}
            </span>
            <div className="mt-1">
              <span className="inline-flex text-xs sm:text-sm font-bold text-foreground">
                {t(resolvedProfile.levelTitleBn.split(" ")[0], resolvedProfile.levelTitle.split(" ")[0])}
              </span>
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              {t("মুখস্থ শব্দ", "Mastered Words")}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg sm:text-xl font-bold text-foreground tabular-nums">
                {resolvedProfile.totalWordsMastered}
              </span>
              <span className="text-[11px] text-muted-foreground">{t("শব্দ", "words")}</span>
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              {t("কুইজ উত্তর", "Questions")}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg sm:text-xl font-bold text-foreground tabular-nums">
                {resolvedProfile.totalQuestionsAttempted}
              </span>
              <span className="text-[11px] text-muted-foreground">{t("প্রশ্ন", "answered")}</span>
            </div>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !resolvedProfile && (
        <div className="space-y-3.5 py-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-muted/40 animate-pulse border border-border/40"
            />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !resolvedProfile && (
        <div className="py-8 text-center">
          <p className="text-sm text-rose-500 font-medium mb-3">{error}</p>
          <button
            type="button"
            onClick={fetchProfile}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            {t("আবার চেষ্টা করুন", "Retry")}
          </button>
        </div>
      )}

      {/* Skills Breakdown List */}
      {resolvedProfile && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          {displayedSkills.map((skill) => {
            const IconComponent = ICON_MAP[skill.icon] || Target;
            const colorCfg = COLOR_MAP[skill.color] || COLOR_MAP.emerald;

            return (
              <div
                key={skill.id}
                className={cn(
                  "group relative p-3 sm:p-3.5 rounded-xl border border-border/60 bg-card/60 hover:bg-muted/30 transition-all duration-200 hover:border-border flex items-center justify-between gap-3"
                )}
              >
                {/* Left: Icon + Skill Label + Bengali Name + Stats */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      "flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl border transition-transform duration-200 group-hover:scale-105",
                      colorCfg.bg,
                      colorCfg.border,
                      colorCfg.text
                    )}
                  >
                    <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-foreground tracking-tight truncate">
                        {skill.name}
                      </span>
                      <span className="text-[11px] text-muted-foreground/80 truncate">
                        {skill.nameBn}
                      </span>
                    </div>

                    {/* Stat summary subtitle */}
                    <span className="text-[10px] sm:text-[11px] text-muted-foreground block mt-0.5 font-medium truncate">
                      {skill.unit === "words" ? (
                        t(
                          `${skill.correctCount}টি শব্দ মুখস্থ`,
                          `${skill.correctCount} words mastered`
                        )
                      ) : skill.totalCount > 0 ? (
                        t(
                          `${skill.totalCount}টির মধ্যে ${skill.correctCount}টি সঠিক`,
                          `${skill.correctCount}/${skill.totalCount} correct`
                        )
                      ) : (
                        t("এখনও পরীক্ষা দেওয়া হয়নি", "Not tested yet")
                      )}
                    </span>
                  </div>
                </div>

                {/* Right: Circular Progress Bar */}
                <SkillCircularProgress
                  percentage={skill.percentage}
                  colorClass={colorCfg.text}
                />
              </div>
            );
          })}

          {displayedSkills.length === 0 && (
            <div className="col-span-full py-8 text-center text-muted-foreground text-xs">
              {t("কোনো সক্রিয় দক্ষতা পাওয়া যায়নি", "No active skills found with attempts yet.")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
