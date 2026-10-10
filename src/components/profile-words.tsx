"use client";

import { useBookmarkedWords } from "@/lib/use-bookmarked-words";
import { useLearnedWords } from "@/lib/use-learned-words";
import { useStillLearningWords } from "@/lib/use-still-learning-words";
import type { Word } from "@/lib/data";
import { useState, useMemo, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useSpeak } from "@/lib/use-speak";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StaggerContainer, StaggerItem } from "@/components/stagger";
import { DailyGoalCard } from "@/components/daily-goal";
import { useActiveTab, setActiveTab } from "@/lib/profile-tab-store";
import { useQuizActivity } from "@/lib/use-quiz-activity";
import { Classic } from "@/components/classic";
import { ProfileActivityChart } from "@/components/profile-activity-chart";
import { QuizExamHistoryPanel } from "@/components/profile-quiz-exam-history";
import { useQuizHistory } from "@/lib/use-quiz-history";
import { useQuizExamHistoryStore } from "@/lib/quiz-exam-history-store";
import { CombinedExamResultsPanel } from "@/components/vocabulary-exam-results-panel";
import { QuizPracticeResultsPanel } from "@/components/quiz-practice-results-panel";
import { useSession } from "next-auth/react";
import { useT } from "@/components/language-provider";
import { useAuthStore } from "@/lib/auth-store";
import { ProfileBentoIdentity } from "@/components/profile-card";
import {
  BookmarkCheck,
  CheckCircle2,
  Bookmark,
  Circle,
  BookOpen,
  BookOpenCheck,
  BarChart3,
  Award,
  TrendingUp,
  RefreshCw,
  X,
  GraduationCap,
  Volume2,
  ClipboardList,
  Settings,
  SquarePen,
  Sparkles,
  Layers,
  ArrowRight,
  Flame,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { ProfileSettings } from "@/components/profile-settings";
import { MySubmissions } from "@/components/contribute/my-submissions";
import { ContributorCertificateModal } from "@/components/template-engine/contributor-certificate-modal";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const ITEMS_PER_PAGE = 10;

const levelColors: Record<
  string,
  {
    bg: string;
    border: string;
    text: string;
    gradient: string;
    label: string;
    labelBn: string;
    solid: string;
  }
> = {
  A1: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-200 dark:border-emerald-800/60",
    text: "text-emerald-700 dark:text-emerald-300",
    gradient: "from-emerald-500 to-teal-500",
    label: "Beginner",
    labelBn: "শিক্ষানবিস",
    solid: "bg-emerald-500",
  },
  A2: {
    bg: "bg-sky-50 dark:bg-sky-950/40",
    border: "border-sky-200 dark:border-sky-800/60",
    text: "text-sky-700 dark:text-sky-300",
    gradient: "from-sky-500 to-blue-500",
    label: "Elementary",
    labelBn: "প্রাথমিক",
    solid: "bg-sky-500",
  },
  B1: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-200 dark:border-amber-800/60",
    text: "text-amber-700 dark:text-amber-300",
    gradient: "from-amber-500 to-orange-500",
    label: "Intermediate",
    labelBn: "মাঝারি",
    solid: "bg-amber-500",
  },
  B2: {
    bg: "bg-rose-50 dark:bg-rose-950/40",
    border: "border-rose-200 dark:border-rose-800/60",
    text: "text-rose-700 dark:text-rose-300",
    gradient: "from-rose-500 to-pink-500",
    label: "Upper Intermediate",
    labelBn: "উচ্চ-মাঝারি",
    solid: "bg-rose-500",
  },
  C1: {
    bg: "bg-violet-50 dark:bg-violet-950/40",
    border: "border-violet-200 dark:border-violet-800/60",
    text: "text-violet-700 dark:text-violet-300",
    gradient: "from-violet-500 to-purple-500",
    label: "Advanced",
    labelBn: "উন্নত",
    solid: "bg-violet-500",
  },
  C2: {
    bg: "bg-fuchsia-50 dark:bg-fuchsia-950/40",
    border: "border-fuchsia-200 dark:border-fuchsia-800/60",
    text: "text-fuchsia-700 dark:text-fuchsia-300",
    gradient: "from-fuchsia-500 to-pink-500",
    label: "Mastery",
    labelBn: "পারদর্শী",
    solid: "bg-fuchsia-500",
  },
};

const CARD =
  "rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md shadow-xs";

const ICON_CHIP =
  "flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground";

function WordCardDetails({ word }: { word: Word }) {
  const speak = useSpeak();
  const t = useT();
  const colorCfg = levelColors[word.level];

  return (
    <div className="pl-3 sm:pl-4 pr-14 sm:pr-16">
      <div className="flex flex-wrap items-baseline gap-2 sm:gap-2.5 mb-1.5 sm:mb-2">
        <h2 className="text-base sm:text-xl font-bold text-foreground tracking-tight">
          {word.word}
        </h2>
        <button
          onClick={() => speak(word.word)}
          className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground transition-colors bg-muted hover:bg-muted/80 cursor-pointer"
          title={t("উচ্চারণ শুনুন", "Listen to pronunciation")}
        >
          <Volume2 className="h-3.5 w-3.5" />
        </button>
        <span className="text-[11px] sm:text-xs text-muted-foreground font-mono bg-muted border border-border/60 rounded-lg px-2 py-0.5">
          {word.wordType.join(", ")}
        </span>
        <span
          className={cn(
            "text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded-lg border",
            colorCfg?.bg,
            colorCfg?.text,
            colorCfg?.border
          )}
        >
          {word.level}
        </span>
      </div>

      {word.meaningBn.length > 0 && word.meaningBn[0] !== "..." && (
        <p className="text-xs sm:text-sm font-semibold text-foreground/90 mb-1.5 sm:mb-2">
          {word.meaningBn.join("; ")}
        </p>
      )}
      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
        {`${word.definitionEn} (${word.definitionBn})`}
      </p>

      {(word.synonyms.length > 0 || word.antonyms.length > 0) && (
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 border-t border-border/60 pt-2.5 sm:pt-3">
          {word.synonyms.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t("সমার্থক", "Synonyms")}
              </span>
              {word.synonyms.map((syn, i) => (
                <span
                  key={i}
                  className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-1.5 sm:px-2 py-0.5 text-[11px] sm:text-xs font-medium text-emerald-700 dark:text-emerald-300"
                >
                  {syn}
                </span>
              ))}
            </div>
          )}
          {word.antonyms.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t("বিপরীত", "Antonyms")}
              </span>
              {word.antonyms.map((ant, i) => (
                <span
                  key={i}
                  className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-1.5 sm:px-2 py-0.5 text-[11px] sm:text-xs font-medium text-rose-700 dark:text-rose-300"
                >
                  {ant}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function WordItem({
  word,
  isLearned,
  isBookmarked,
  onToggleBookmark,
  onToggleLearned,
}: {
  word: Word;
  isLearned: boolean;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onToggleLearned: () => void;
}) {
  const colorCfg = levelColors[word.level];
  const t = useT();

  return (
    <StaggerItem
      onDoubleClick={onToggleLearned}
      className={cn(
        "relative overflow-hidden rounded-2xl border p-4 sm:p-6 transition-all duration-200 backdrop-blur-md shadow-xs cursor-pointer",
        isLearned
          ? "border-emerald-500/30 bg-emerald-500/[0.04] hover:border-emerald-500/50"
          : "border-border/80 bg-card/80 hover:border-border hover:bg-card"
      )}
    >
      <div
        className={cn(
          "absolute inset-y-4 left-0 w-1 rounded-full bg-gradient-to-b transition-all duration-300",
          isLearned
            ? "from-emerald-400 to-emerald-500 opacity-100"
            : `${colorCfg?.gradient} opacity-60`
        )}
      />
      <WordCardDetails word={word} />

      <div className="absolute top-3 right-3 sm:top-3.5 sm:right-3.5 flex items-center gap-1 bg-muted/80 backdrop-blur-md rounded-xl p-1 border border-border/60">
        <button
          onClick={onToggleBookmark}
          className={cn(
            "p-1.5 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer",
            isBookmarked
              ? "text-amber-500 bg-amber-500/10"
              : "text-muted-foreground hover:text-foreground"
          )}
          title={isBookmarked ? t("বুকমার্ক সরান", "Remove bookmark") : t("বুকমার্ক করুন", "Bookmark")}
        >
          {isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        </button>
        <button
          onClick={onToggleLearned}
          className={cn(
            "p-1.5 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer",
            isLearned
              ? "text-emerald-500 bg-emerald-500/10"
              : "text-muted-foreground hover:text-foreground"
          )}
          title={
            isLearned
              ? t("শেখা থেকে সরান", "Mark as unlearned")
              : t("শেখা হিসেবে চিহ্নিত করুন", "Mark as learned")
          }
        >
          {isLearned ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
        </button>
      </div>
    </StaggerItem>
  );
}

function EmptyWordState({ type }: { type: "bookmark" | "learned" | "still-learning" }) {
  const t = useT();
  const Icon = type === "bookmark" ? Bookmark : type === "learned" ? Circle : RefreshCw;
  const messages: Record<string, { title: string; desc: string }> = {
    bookmark: {
      title: t("এখনো কোনো বুকমার্ক করা শব্দ নেই।", "No bookmarked words yet."),
      desc: t(
        "শব্দভাণ্ডার ব্রাউজ করার সময় শব্দ বুকমার্ক করলে সেগুলো এখানে সংরক্ষিত থাকবে।",
        "Bookmark words while browsing vocabulary to save them here."
      ),
    },
    learned: {
      title: t("এখনো কোনো শেখা শব্দ নেই।", "No learned words yet."),
      desc: t(
        "অগ্রগতি ট্র্যাক করতে শব্দগুলোতে ডাবল-ক্লিক করে শেখা হিসেবে চিহ্নিত করুন।",
        "Mark words as learned by double-clicking to track your progress."
      ),
    },
    "still-learning": {
      title: t("পর্যালোচনা করার কোনো শব্দ নেই।", "No words to review."),
      desc: t(
        "কুইজে ভুল উত্তর দেওয়া শব্দগুলো অতিরিক্ত অনুশীলনের জন্য এখানে জমা থাকবে।",
        "Quiz incorrect answers will appear here for targeted review."
      ),
    },
  };
  const msg = messages[type];
  return (
    <div className={cn(CARD, "text-center py-16 sm:py-20 px-4")}>
      <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-muted mx-auto mb-4 border border-border/60">
        <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-muted-foreground" />
      </div>
      <p className="text-foreground text-sm sm:text-base font-semibold mb-1">
        {msg.title}
      </p>
      <p className="text-muted-foreground text-xs max-w-sm mx-auto">{msg.desc}</p>
      <div className="mt-5">
        <Link
          href="/vocabulary"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline transition-colors"
        >
          {t("শব্দভাণ্ডার দেখুন", "Browse Vocabulary")}
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}

function PaginatedWordList({
  idSet,
  page,
  onPageChange,
  emptyType,
  onToggleBookmark,
  onToggleLearned,
  isBookmarked,
  isLearned,
}: {
  idSet: Set<string>;
  page: number;
  onPageChange: (p: number) => void;
  emptyType: "bookmark" | "learned" | "still-learning";
  onToggleBookmark: (id: number) => void;
  onToggleLearned: (id: number) => void;
  isBookmarked: (id: number) => boolean;
  isLearned: (id: number) => boolean;
}) {
  const t = useT();
  const idsArray = useMemo(
    () => Array.from(idSet).map(Number).filter((n) => Number.isInteger(n) && n > 0),
    [idSet]
  );
  const totalCount = idsArray.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageIds = useMemo(
    () => idsArray.slice(start, start + ITEMS_PER_PAGE),
    [idsArray, start]
  );

  const [wordsMap, setWordsMap] = useState<Map<number, Word>>(new Map());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pageIds.length === 0) return;
    const missing = pageIds.filter((id) => !wordsMap.has(id));
    if (missing.length === 0) return;

    setLoading(true);
    fetch(`/api/v1/words/by-ids?ids=${missing.join(",")}`)
      .then((res) => res.json())
      .then((json: { success?: boolean; data?: Word[] }) => {
        if (json.success && Array.isArray(json.data)) {
          setWordsMap((prev) => {
            const next = new Map(prev);
            for (const w of json.data!) next.set(w.id, w);
            return next;
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [pageIds, wordsMap]);

  if (totalCount === 0) return <EmptyWordState type={emptyType} />;

  const pageWords = pageIds.map((id) => wordsMap.get(id)).filter(Boolean) as Word[];

  const activeRef = useRef<HTMLLIElement | null>(null);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [currentPage]);

  return (
    <>
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <p className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {emptyType === "bookmark"
            ? t(
                `মোট ${totalCount}টি বুকমার্ক করা শব্দ`,
                `Total ${totalCount} bookmarked word${totalCount !== 1 ? "s" : ""}`
              )
            : emptyType === "learned"
            ? t(
                `মোট ${totalCount}টি শেখা শব্দ`,
                `Total ${totalCount} learned word${totalCount !== 1 ? "s" : ""}`
              )
            : t(
                `মোট ${totalCount}টি শব্দ পর্যালোচনা তালিকায় রয়েছে`,
                `Total ${totalCount} word${totalCount !== 1 ? "s" : ""} in review list`
              )}
        </p>
      </div>

      {loading && pageWords.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {Array.from({ length: Math.min(4, pageIds.length) }).map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/70 dark:bg-zinc-900/60 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <StaggerContainer className="contents">
            {pageWords.map((word) => (
              <WordItem
                key={word.id}
                word={word}
                isLearned={isLearned(word.id)}
                isBookmarked={isBookmarked(word.id)}
                onToggleBookmark={() => onToggleBookmark(word.id)}
                onToggleLearned={() => onToggleLearned(word.id)}
              />
            ))}
          </StaggerContainer>
        </div>
      )}

      <p className="mt-6 sm:mt-8 mb-4 sm:mb-5 text-center text-xs sm:text-sm text-zinc-400 dark:text-zinc-500">
        {t(
          `মোট ${totalCount}টির মধ্যে ${start + 1}–${Math.min(start + ITEMS_PER_PAGE, totalCount)} দেখানো হচ্ছে`,
          `Showing ${start + 1}–${Math.min(start + ITEMS_PER_PAGE, totalCount)} of ${totalCount}`
        )}
      </p>

      {totalPages > 1 && (
        <Pagination>
          <div className="relative flex items-center justify-center max-w-full w-full gap-1 sm:gap-1.5">
            <div className="shrink-0 z-10 bg-background/95 backdrop-blur-xs">
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) onPageChange(currentPage - 1);
                }}
                className={cn(currentPage <= 1 ? "pointer-events-none opacity-50" : "")}
              />
            </div>
            <div className="min-w-0 flex-1 overflow-x-auto [&::-webkit-scrollbar]:hidden py-1 px-1">
              <PaginationContent className="flex items-center justify-center gap-0.5 w-max min-w-full">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <PaginationItem
                    key={p}
                    ref={p === currentPage ? activeRef : undefined}
                    className="shrink-0"
                  >
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        onPageChange(p);
                      }}
                      isActive={p === currentPage}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}
              </PaginationContent>
            </div>
            <div className="shrink-0 z-10 bg-background/95 backdrop-blur-xs">
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) onPageChange(currentPage + 1);
                }}
                className={cn(currentPage >= totalPages ? "pointer-events-none opacity-50" : "")}
              />
            </div>
          </div>
        </Pagination>
      )}
    </>
  );
}

export interface ProfileTabsProps {
  levelStats?: { level: string; count: number }[];
  totalWords?: number;
  levelWordMap?: Record<string, number[]>;
}

export function ProfileTabs({
  levelStats = [],
  totalWords = 0,
  levelWordMap = {},
}: ProfileTabsProps) {
  const activeTab = useActiveTab();
  const normalizedTab = activeTab === "still-learning" ? "quiz" : activeTab;
  const authStatus = useAuthStore((s) => s.status);
  const { data: session } = useSession();
  const isContributor =
    session?.user?.role === "admin" || session?.user?.role === "contributor";
  const effectiveTab = normalizedTab === "submits" && !isContributor ? "overview" : normalizedTab;
  const [quizSubTab, setQuizSubTab] = useState<"exams" | "vocab" | "still-learning">(
    activeTab === "still-learning" ? "still-learning" : "vocab"
  );
  const quizCount = useQuizHistory().entries.length;
  const examCount = useQuizExamHistoryStore((s) => s.entries.length);
  const { bookmarkedIds, isBookmarked, toggleBookmark, loaded: bookmarkLoaded } = useBookmarkedWords();
  const { learnedIds, isLearned, toggleLearned, loaded: learnedLoaded } = useLearnedWords();
  const { stillLearningIds, removeStillLearning, toggleStillLearning, loaded: stillLearningLoaded } =
    useStillLearningWords();
  const { totalCorrectAnswers, loaded: quizLoaded } = useQuizActivity();
  const loaded = bookmarkLoaded && learnedLoaded && stillLearningLoaded;
  const t = useT();

  const levelProgress = useMemo(() => {
    const map: Record<string, { total: number; learned: number; pct: number }> = {};
    for (const { level, count } of levelStats) {
      const ids = levelWordMap[level] ?? [];
      let learned = 0;
      if (loaded) {
        for (const id of ids) {
          if (learnedIds.has(String(id))) learned++;
        }
      }
      const total = count || ids.length || 0;
      const pct = total > 0 ? Math.min(100, Math.round((learned / total) * 100)) : 0;
      map[level] = { total, learned, pct };
    }
    return map;
  }, [levelStats, levelWordMap, learnedIds, loaded]);

  const [bookmarkedPage, setBookmarkedPage] = useState(1);
  const [stillLearningPage, setStillLearningPage] = useState(1);
  const [learnedPage, setLearnedPage] = useState(1);

  const handleMarkLearned = (id: number) => {
    const k = String(id);
    if (!learnedIds.has(k)) toggleLearned(id);
    if (stillLearningIds.has(k)) removeStillLearning(id);
  };

  const handleMarkStillLearning = (id: number) => {
    const k = String(id);
    if (learnedIds.has(k)) toggleLearned(id);
    if (!stillLearningIds.has(k)) toggleStillLearning(id);
  };

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-20 text-zinc-400">
        <Classic className="size-6" />
      </div>
    );
  }

  const total = totalWords;
  const learnedCount = learnedIds.size;
  const bookmarkedCount = bookmarkedIds.size;
  const stillLearningCount = stillLearningIds.size;
  const overallProgress = total > 0 ? Math.round((learnedCount / total) * 100) : 0;

  const totalQuizAnswers = totalCorrectAnswers + stillLearningCount;
  const quizAccuracy = totalQuizAnswers > 0 ? Math.round((totalCorrectAnswers / totalQuizAnswers) * 100) : 0;
  const quizCircumference = 2 * Math.PI * 30;
  const quizOffset = quizCircumference * (1 - quizAccuracy / 100);

  const navItems = [
    {
      id: "overview",
      label: t("ড্যাশবোর্ড", "Dashboard"),
      icon: BarChart3,
      color: "text-orange-500",
      badge: null,
      badgeColor: "",
    },
    {
      id: "bookmarked",
      label: t("বুকমার্ক ডেক", "Bookmarked"),
      icon: BookmarkCheck,
      color: "text-amber-500",
      badge: bookmarkedCount > 0 ? bookmarkedCount : null,
      badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    },
    {
      id: "learned",
      label: t("শেখা শব্দভাণ্ডার", "Learned Words"),
      icon: Award,
      color: "text-emerald-500",
      badge: learnedCount > 0 ? learnedCount : null,
      badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    },
    {
      id: "quiz",
      label: t("কুইজ ও পরীক্ষা", "Quiz & Exams"),
      icon: GraduationCap,
      color: "text-violet-500",
      badge: quizCount + examCount > 0 ? quizCount + examCount : null,
      badgeColor: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    },
    ...(isContributor
      ? [
          {
            id: "submits",
            label: t("আমার অবদান", "My Contributions"),
            icon: SquarePen,
            color: "text-sky-500",
            badge: null,
            badgeColor: "",
          },
        ]
      : []),
    ...(authStatus === "google"
      ? [
          {
            id: "settings",
            label: t("অ্যাকাউন্ট সেটিংস", "Settings"),
            icon: Settings,
            color: "text-zinc-500",
            badge: null,
            badgeColor: "",
          },
        ]
      : []),
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 lg:gap-6 items-start w-full min-w-0">
      {/* ========================================================================= */}
      {/* 🧭 SHADCN UI MINIMAL SIDEBAR TAB NAVIGATION */}
      {/* ========================================================================= */}
      <aside className="lg:col-span-3 lg:sticky lg:top-20 z-10 w-full min-w-0">
        <div className="rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md p-1.5 sm:p-2 lg:p-2.5 space-y-1">
          <div className="hidden lg:block px-2.5 py-1 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
              {t("নেভিগেশন মেনু", "Profile Menu")}
            </span>
          </div>

          <nav className="flex flex-row m-0 lg:flex-col gap-1 w-full overflow-x-auto no-scrollbar [&::-webkit-scrollbar]:hidden">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = effectiveTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer shrink-0 text-left",
                    "w-auto lg:w-full",
                    isActive
                      ? "bg-accent text-accent-foreground font-semibold shadow-2xs"
                      : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={cn("size-4 shrink-0 transition-colors", isActive ? "text-foreground" : "text-muted-foreground")} />
                    <span className="whitespace-nowrap lg:whitespace-normal">{item.label}</span>
                  </div>

                  {item.badge != null && (
                    <span
                      className={cn(
                        "ml-auto inline-flex items-center justify-center px-1.5 py-0.5 rounded-md text-[11px] font-medium shrink-0 tabular-nums",
                        isActive
                          ? "bg-background/80 text-foreground shadow-2xs"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Minimal Mastery Status (Desktop) */}
          <div className="hidden lg:block mt-3 pt-3 border-t border-border/60 px-2.5 pb-1">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-muted-foreground font-medium">
                {t("মাস্টারি রেট", "Mastery Rate")}
              </span>
              <span className="font-semibold tabular-nums text-foreground">
                {overallProgress}%
              </span>
            </div>
            <div className="h-1 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 📱 MAIN CONTENT AREA (Bento Dashboard / Word Lists / History) */}
      {/* ========================================================================= */}
      <div className="lg:col-span-9 min-w-0 w-full space-y-4 sm:space-y-5">
        {/* ========================================================================= */}
        {/* 🚀 TAB 1: BENTO DASHBOARD */}
        {/* ========================================================================= */}
        {effectiveTab === "overview" && (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 w-full min-w-0">
            {/* BENTO TILE 1: Identity & Overall Mastery Gauge */}
            <StaggerItem className="col-span-1 md:col-span-12 min-w-0">
              <ProfileBentoIdentity totalWords={total} />
            </StaggerItem>

            {/* BENTO TILE 2: Streak & Daily Goal Bento Box */}
            <StaggerItem className="col-span-1 md:col-span-6 flex flex-col min-w-0">
              <DailyGoalCard />
            </StaggerItem>

            {/* BENTO TILE 3: Quiz Performance & Accuracy Engine */}
            <StaggerItem className="col-span-1 md:col-span-6 min-w-0">
              <div className={cn(CARD, "p-4 sm:p-6 h-full flex flex-col justify-between")}>
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4 sm:mb-5">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className={cn(ICON_CHIP, "text-foreground")}>
                        <GraduationCap className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                      </div>
                      <div>
                        <h3 className="text-xs sm:text-base font-semibold text-foreground tracking-tight">
                          {t("কুইজ ও মূল্যায়ন", "Quiz Assessment")}
                        </h3>
                        <p className="text-[10px] sm:text-[11px] text-muted-foreground">
                          {t("নির্ভুলতা বিশ্লেষণ", "Practice analytics")}
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/quiz"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
                    >
                      <Zap className="h-3 w-3" />
                      {t("খেলুন", "Play")}
                    </Link>
                  </div>

                  {/* Accuracy Gauge + Stats Split */}
                  <div className="flex items-center gap-3.5 sm:gap-5 p-3 sm:p-4 rounded-xl bg-muted/40 border border-border/60 mb-3.5 sm:mb-4">
                    <div className="relative shrink-0 h-14 w-14 sm:h-16 sm:w-16">
                      <svg width="56" height="56" viewBox="0 0 70 70" className="-rotate-90 sm:w-16 sm:h-16">
                        <circle
                          cx="35"
                          cy="35"
                          r="30"
                          fill="none"
                          strokeWidth="5"
                          className="stroke-muted"
                        />
                        <circle
                          cx="35"
                          cy="35"
                          r="30"
                          fill="none"
                          strokeWidth="5"
                          strokeDasharray={quizCircumference}
                          strokeDashoffset={quizLoaded ? quizOffset : quizCircumference}
                          strokeLinecap="round"
                          className="stroke-primary transition-all duration-700 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xs font-bold tabular-nums text-foreground">
                          {quizLoaded ? `${quizAccuracy}%` : "…"}
                        </span>
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <span className="text-xs sm:text-sm font-semibold text-foreground block">
                        {t("কুইজ নির্ভুলতার হার", "Quiz Accuracy Rate")}
                      </span>
                      <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">
                        {quizLoaded
                          ? t(
                              `${totalQuizAnswers}টি প্রশ্নের মধ্যে ${totalCorrectAnswers}টি সঠিক`,
                              `${totalCorrectAnswers} correct of ${totalQuizAnswers} answers`
                            )
                          : "…"}
                      </p>
                    </div>
                  </div>

                  {/* Stat 3-pack */}
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center">
                    <div className="p-2 sm:p-2.5 rounded-xl bg-muted/50 border border-border/60">
                      <span className="text-[9px] sm:text-[10px] font-semibold text-muted-foreground uppercase tracking-wide block">
                        {t("সঠিক", "Correct")}
                      </span>
                      <span className="text-sm sm:text-base font-bold tabular-nums text-foreground mt-0.5 block">
                        {quizLoaded ? totalCorrectAnswers : "—"}
                      </span>
                    </div>
                    <div className="p-2 sm:p-2.5 rounded-xl bg-muted/50 border border-border/60">
                      <span className="text-[9px] sm:text-[10px] font-semibold text-muted-foreground uppercase tracking-wide block">
                        {t("ভুল", "Mistakes")}
                      </span>
                      <span className="text-sm sm:text-base font-bold tabular-nums text-foreground mt-0.5 block">
                        {stillLearningCount}
                      </span>
                    </div>
                    <div className="p-2 sm:p-2.5 rounded-xl bg-muted/50 border border-border/60">
                      <span className="text-[9px] sm:text-[10px] font-semibold text-muted-foreground uppercase tracking-wide block">
                        {t("পরীক্ষা", "Exams")}
                      </span>
                      <span className="text-sm sm:text-base font-bold tabular-nums text-foreground mt-0.5 block">
                        {examCount}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3.5 sm:mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground text-[11px] sm:text-xs">{t("পূর্বের ফলাফল", "Review scores")}</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("quiz")}
                    className="font-medium text-foreground hover:underline cursor-pointer"
                  >
                    {t("ফলাফল ডেক", "Results Deck")} →
                  </button>
                </div>
              </div>
            </StaggerItem>

            {/* BENTO TILE 4: CEFR 6-Tier Progression Matrix */}
            <StaggerItem className="col-span-1 md:col-span-12 min-w-0">
              <div className={cn(CARD, "p-4 sm:p-6")}>
                <div className="flex items-center justify-between gap-3 mb-4 sm:mb-5">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className={cn(ICON_CHIP, "text-foreground")}>
                      <Layers className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-base font-semibold text-foreground tracking-tight">
                        {t("CEFR ৬-স্তরের অগ্রগতি ম্যাট্রিক্স", "CEFR 6-Tier Progression Matrix")}
                      </h3>
                      <p className="text-[10px] sm:text-[11px] text-muted-foreground">
                        {t("A1 থেকে C2 লেভেল পর্যন্ত বিস্তার", "A1 Beginner to C2 Mastery distribution")}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/vocabulary"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline transition-colors"
                  >
                    {t("লেভেল দেখুন", "View Levels")}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                {/* 6 Levels Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
                  {levelStats.map(({ level, count: totalInLevel }) => {
                    const c = levelColors[level] ?? levelColors.A1;
                    const stat = levelProgress[level] ?? { total: totalInLevel, learned: 0, pct: 0 };
                    return (
                      <Link
                        key={level}
                        href={`/vocabulary/${level.toLowerCase()}`}
                        className={cn(
                          "group p-2.5 sm:p-3 rounded-xl border transition-all duration-200 min-w-0 flex flex-col justify-between",
                          "bg-muted/40 border-border/60 hover:bg-muted/70 hover:border-border"
                        )}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span
                              className={cn(
                                "text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-md border text-[11px]",
                                c.bg,
                                c.text,
                                c.border
                              )}
                            >
                              {level}
                            </span>
                            <span className="text-[11px] font-semibold tabular-nums text-foreground">
                              {loaded ? `${stat.pct}%` : "…"}
                            </span>
                          </div>
                          <div className="text-xs font-medium text-foreground truncate">
                            {t(c.labelBn, c.label)}
                          </div>
                          <div className="text-[10px] text-muted-foreground tabular-nums mt-0.5">
                            {loaded ? `${stat.learned} / ${stat.total}` : `0 / ${stat.total}`} {t("শেখা", "learned")}
                          </div>
                        </div>
                        <div className="mt-2.5 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all duration-500", c.solid)}
                            style={{ width: `${loaded ? Math.max(stat.pct, stat.learned > 0 ? 3 : 0) : 0}%` }}
                          />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </StaggerItem>

            {/* BENTO TILE 5: Learning Activity & Trends Curve */}
            <StaggerItem className="col-span-1 md:col-span-12 min-w-0">
              <ProfileActivityChart />
            </StaggerItem>
          </StaggerContainer>
        )}

        {/* ========================================================================= */}
        {/* 🔖 TAB 2: BOOKMARKED WORDS */}
        {/* ========================================================================= */}
        {effectiveTab === "bookmarked" && (
          <PaginatedWordList
            idSet={bookmarkedIds}
            page={bookmarkedPage}
            onPageChange={setBookmarkedPage}
            emptyType="bookmark"
            onToggleBookmark={toggleBookmark}
            onToggleLearned={handleMarkLearned}
            isBookmarked={isBookmarked}
            isLearned={isLearned}
          />
        )}

        {/* ========================================================================= */}
        {/* 🏆 TAB 3: LEARNED WORDS */}
        {/* ========================================================================= */}
        {effectiveTab === "learned" && (
          <PaginatedWordList
            idSet={learnedIds}
            page={learnedPage}
            onPageChange={setLearnedPage}
            emptyType="learned"
            onToggleBookmark={toggleBookmark}
            onToggleLearned={handleMarkStillLearning}
            isBookmarked={isBookmarked}
            isLearned={isLearned}
          />
        )}

        {/* ========================================================================= */}
        {/* 📝 TAB 4: QUIZ & EXAMS HISTORY */}
        {/* ========================================================================= */}
        {effectiveTab === "quiz" && (
          <Tabs
            value={quizSubTab}
            onValueChange={(v) => setQuizSubTab(v as "exams" | "vocab" | "still-learning")}
            className="w-full min-w-0"
          >
            <div className="overflow-x-auto no-scrollbar [&::-webkit-scrollbar]:hidden mb-4 sm:mb-5">
              <TabsList className="bg-muted/80 p-1 rounded-xl border border-border/60 flex w-max sm:w-auto">
                <TabsTrigger
                  value="vocab"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer shrink-0 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-2xs text-muted-foreground"
                >
                  <BookOpenCheck className="h-3.5 w-3.5" />
                  {t("প্র্যাকটিস কুইজ ফলাফল", "Practice Results")}
                </TabsTrigger>
                <TabsTrigger
                  value="exams"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer shrink-0 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-2xs text-muted-foreground"
                >
                  <ClipboardList className="h-3.5 w-3.5" />
                  {t("নির্ধারিত পরীক্ষা ফলাফল", "Scheduled Exams")}
                  {examCount > 0 && (
                    <span className="inline-flex items-center justify-center h-4.5 min-w-4.5 px-1.5 rounded-md text-[10px] font-semibold bg-muted text-muted-foreground">
                      {examCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="still-learning"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer shrink-0 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-2xs text-muted-foreground"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  {t("ভুল উত্তর পুনর্বিবেচনা", "Mistakes Review Deck")}
                  {stillLearningCount > 0 && (
                    <span className="inline-flex items-center justify-center h-4.5 min-w-4.5 px-1.5 rounded-md text-[10px] font-semibold bg-muted text-muted-foreground">
                      {stillLearningCount}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="vocab" className="min-w-0 w-full space-y-4 sm:space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("শব্দ কুইজ", "Vocabulary Quizzes")}
                  </span>
                </div>
                <div className={cn(CARD, "p-4 sm:p-6")}>
                  <CombinedExamResultsPanel />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("গ্রামার ও শ্রেণি কুইজ", "Grammar & Class Quizzes")}
                  </span>
                </div>
                <div className={cn(CARD, "p-4 sm:p-6")}>
                  <QuizPracticeResultsPanel />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="exams" className="min-w-0 w-full">
              <div className={cn(CARD, "p-4 sm:p-6")}>
                <QuizExamHistoryPanel />
              </div>
            </TabsContent>

            <TabsContent value="still-learning" className="min-w-0 w-full">
              <PaginatedWordList
                idSet={stillLearningIds}
                page={stillLearningPage}
                onPageChange={setStillLearningPage}
                emptyType="still-learning"
                onToggleBookmark={toggleBookmark}
                onToggleLearned={handleMarkLearned}
                isBookmarked={isBookmarked}
                isLearned={isLearned}
              />
            </TabsContent>
          </Tabs>
        )}

        {/* ========================================================================= */}
        {/* ✍️ TAB 5: CONTRIBUTOR SUBMITS */}
        {/* ========================================================================= */}
        {effectiveTab === "submits" && isContributor && (
          <div className="space-y-4 sm:space-y-5">
            <div className={cn(CARD, "p-4 sm:p-6")}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
                  <div className={cn(ICON_CHIP, "text-foreground")}>
                    <SquarePen className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-base font-semibold text-foreground tracking-tight">
                      {t("আমার অবদান", "My Contributions")}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-muted-foreground">
                      {t(
                        "জমা দেওয়া শব্দ ও কুইজ প্রশ্নের স্থিতি পর্যালোচনা করুন",
                        "Track and manage the review status of your submitted content"
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <ContributorCertificateModal
                    userId={session?.user?.id ?? 0}
                    userName={session?.user?.name}
                    trigger={
                      <Button variant="outline" size="sm" className="h-8.5 gap-1.5 text-xs font-semibold cursor-pointer rounded-xl border border-border/80 bg-background/80 hover:bg-muted shadow-2xs">
                        <Award className="h-3.5 w-3.5 text-foreground" />
                        {t("সার্টিফিকেট", "Certificate")}
                      </Button>
                    }
                  />
                  <Button asChild size="sm" className="h-8.5 gap-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-2xs">
                    <Link href="/contribute">
                      <SquarePen className="h-3.5 w-3.5" />
                      {t("নতুন যোগ করুন", "New Submission")}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            <MySubmissions />
          </div>
        )}

        {/* ========================================================================= */}
        {/* ⚙️ TAB 6: ACCOUNT SETTINGS */}
        {/* ========================================================================= */}
        {effectiveTab === "settings" && authStatus === "google" && (
          <div className={cn(CARD, "p-4")}>
            <ProfileSettings />
          </div>
        )}
      </div>
    </div>
  );
}
