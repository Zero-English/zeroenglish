"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Languages,
  ArrowRight,
  BookOpenCheck,
  GraduationCap,
  Timer,
  CalendarClock,
  Hourglass,
  Zap,
  BarChart3,
  Flame,
  RefreshCw,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { useT } from "@/components/language-provider";
import { cn } from "@/lib/utils";
import { useQuizHistory } from "@/lib/use-quiz-history";
import { useDailyGoal } from "@/lib/use-daily-goal";
import { StaggerContainer, StaggerItem } from "@/components/stagger";
import { requestGoogleLogin } from "@/lib/login-required";
import type { QuizExamPublicItem } from "@/types/quiz-exam";

type QuizCategory = "all" | "daily" | "study" | "exam";

interface QuizCard {
  id: string;
  category: "daily" | "study" | "exam";
  label: string;
  labelBn: string;
  desc: string;
  descBn: string;
  href: string;
  icon: LucideIcon;
  badge: string;
  badgeBn: string;
  badgeIcon?: LucideIcon;
  meta: string;
  metaBn: string;
  pastelStyle: string;
  iconColor: string;
}

const CARDS: QuizCard[] = [
  {
    id: "daily",
    category: "daily",
    label: "Daily Practice",
    labelBn: "দৈনিক অনুশীলন",
    desc: "10 personalized blitz questions (5 vocab + 5 grammar) in 20s each. Complete once a day to protect your streak.",
    descBn: "ব্যক্তিগত ১০টি প্রশ্ন (৫ ভোকাব + ৫ গ্রামার), প্রতিটি ২০ সেকেন্ডে। স্ট্রিক বাড়াতে প্রতিদিন ১ বার দিন।",
    href: "/quiz/daily",
    icon: Flame,
    badge: "Daily 10 × 20s",
    badgeBn: "দৈনিক ১০ × ২০ সে.",
    badgeIcon: Flame,
    meta: "10 Questions · 20s per Q · Streak",
    metaBn: "১০টি প্রশ্ন · ২০ সে. প্রতি প্রশ্ন · স্ট্রিক",
    pastelStyle: "bg-[#faf4ee] dark:bg-[#2b2219] border-amber-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    id: "quick",
    category: "daily",
    label: "Quick Quiz",
    labelBn: "কুইক কুইজ",
    desc: "Rapid mixed 20-question test with 20s timers across grammar and class topics. Test your instant recall.",
    descBn: "গ্রামার ও শ্রেণি টপিক থেকে দ্রুত ২০টি প্রশ্ন, প্রতিটি ২০ সেকেন্ডে সমাধান করুন।",
    href: "/quiz/quick",
    icon: Zap,
    badge: "20 × 20s Blitz",
    badgeBn: "২০ × ২০ সে. ব্লিৎজ",
    badgeIcon: Zap,
    meta: "20 Questions · Rapid Mixed · Blitz",
    metaBn: "২০টি প্রশ্ন · দ্রুত ব্লিৎজ · তাৎক্ষণিক স্কোর",
    pastelStyle: "bg-[#f9f1f5] dark:bg-[#2d1b26] border-rose-500/10",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
  {
    id: "vocabulary",
    category: "study",
    label: "Vocabulary Practice",
    labelBn: "শব্দভাণ্ডার অনুশীলন",
    desc: "Deep practice across Oxford CEFR levels (A1 to C2) and curated word lists with native audio pronunciation.",
    descBn: "অক্সফোর্ড CEFR লেভেল (A1 থেকে C2) ও নির্বাচিত শব্দ তালিকা ধরে অডিওসহ অনুশীলন করুন।",
    href: "/quiz/vocabulary",
    icon: Languages,
    badge: "Vocabulary",
    badgeBn: "শব্দভাণ্ডার",
    badgeIcon: Languages,
    meta: "A1 – C2 CEFR · Oxford 3000 · Audio",
    metaBn: "A1 – C2 CEFR · অক্সফোর্ড ৩০০০ · উচ্চারণ",
    pastelStyle: "bg-[#eef5fa] dark:bg-[#162432] border-blue-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    id: "grammar",
    category: "study",
    label: "Grammar Topic Quizzes",
    labelBn: "গ্রামার টপিক কুইজ",
    desc: "Focused tests on tenses, prepositions, articles, voice change, conditionals, and core rules.",
    descBn: "টেন্স, প্রিপজিশন, আর্টিকেল, ভয়েস চেঞ্জ ও অন্যান্য গুরুত্বপূর্ণ গ্রামার টপিক।",
    href: "/quiz/grammar",
    icon: BookOpenCheck,
    badge: "Grammar",
    badgeBn: "গ্রামার",
    badgeIcon: BookOpenCheck,
    meta: "Tenses · Voice · Prepositions · Rules",
    metaBn: "টেন্স · ভয়েস · প্রিপজিশন · নিয়ম",
    pastelStyle: "bg-[#ecf7f1] dark:bg-[#12281d] border-emerald-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "class",
    category: "study",
    label: "Class Based Quizzes",
    labelBn: "শ্রেণি ভিত্তিক কুইজ",
    desc: "Curated tests tailored for Primary, SSC, HSC, IELTS, TOEFL, BCS, and University Admission exams.",
    descBn: "প্রাথমিক, SSC, HSC, IELTS, TOEFL, BCS ও বিশ্ববিদ্যালয় ভর্তি পরীক্ষার কুইজ।",
    href: "/quiz/class",
    icon: GraduationCap,
    badge: "Academic",
    badgeBn: "একাডেমিক",
    badgeIcon: GraduationCap,
    meta: "SSC · HSC · IELTS · BCS · Admission",
    metaBn: "SSC · HSC · IELTS · BCS · ভর্তি পরীক্ষা",
    pastelStyle: "bg-[#faf4ee] dark:bg-[#2b2219] border-amber-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    id: "mistakes",
    category: "study",
    label: "Mistake Bank Quiz",
    labelBn: "ভুল উত্তর কুইজ",
    desc: "Retest and master questions you previously answered incorrectly to eliminate your recurring weak points.",
    descBn: "পূর্বে ভুল হওয়া প্রশ্নগুলো পুনরায় অনুশীলন করে নিজের দুর্বলতাগুলো দূর করুন।",
    href: "/quiz/mistakes",
    icon: RefreshCw,
    badge: "Smart Review",
    badgeBn: "স্মার্ট রিভিশন",
    badgeIcon: RefreshCw,
    meta: "Smart Retest · Weak Points · Saved",
    metaBn: "স্মার্ট রিটেস্ট · দুর্বলতা দূরীকরণ · সংরক্ষিত",
    pastelStyle: "bg-[#f0f5f1] dark:bg-[#1c2820] border-teal-500/10",
    iconColor: "text-teal-600 dark:text-teal-400",
  },
  {
    id: "exam",
    category: "exam",
    label: "Quiz Exam Arena",
    labelBn: "কুইজ পরীক্ষা",
    desc: "Take scheduled weekly and bi-weekly timed competitive exams with live timer and leaderboard rankings.",
    descBn: "নির্ধারিত সময়ে সাপ্তাহিক ও দ্বি-সাপ্তাহিক লাইভ পরীক্ষা এবং লিডারবোর্ড র‍্যাংকিং।",
    href: "/quiz/exam",
    icon: CalendarClock,
    badge: "Scheduled",
    badgeBn: "নির্ধারিত",
    badgeIcon: Timer,
    meta: "Live Timed · Competitive · Leaderboard",
    metaBn: "লাইভ টাইমার · প্রতিযোগিতা · লিডারবোর্ড",
    pastelStyle: "bg-[#f3f0fb] dark:bg-[#211a33] border-purple-500/10",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  {
    id: "results",
    category: "exam",
    label: "Past Exam Results",
    labelBn: "পূর্বের পরীক্ষার ফলাফল",
    desc: "Review your detailed word-level accuracy, time spent, question breakdowns, and historical analytics.",
    descBn: "আপনার পূর্ববর্তী সকল কুইজের শব্দভিত্তিক ফলাফল, সময় ও বিস্তারিত বিশ্লেষণ দেখুন।",
    href: "/quiz/results",
    icon: BarChart3,
    badge: "Analytics",
    badgeBn: "অ্যানালিটিক্স",
    badgeIcon: BarChart3,
    meta: "Answer Review · Accuracy · Speed Trends",
    metaBn: "উত্তর পর্যালোচনা · নির্ভুলতা · গতি বিশ্লেষণ",
    pastelStyle: "bg-[#f3f0fb] dark:bg-[#211a33] border-purple-500/10",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
];

function formatCountdown(ms: number): string {
  const total = Math.max(0, ms);
  const secs = Math.ceil(total / 1000);
  const days = Math.floor(secs / 86400);
  const hours = Math.floor((secs % 86400) / 3600);
  const minutes = Math.floor((secs % 3600) / 60);
  const seconds = secs % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function pickNextExam(exams: QuizExamPublicItem[], now: number): QuizExamPublicItem | null {
  if (exams.length === 0) return null;
  const open = exams
    .filter((e) => {
      const o = new Date(e.scheduledOpeningTime ?? "").getTime();
      const c = new Date(e.scheduledClosingTime ?? "").getTime();
      return Number.isFinite(o) && Number.isFinite(c) && now >= o && now < c;
    })
    .sort(
      (a, b) =>
        new Date(a.scheduledClosingTime ?? "").getTime() -
        new Date(b.scheduledClosingTime ?? "").getTime()
    );
  if (open.length > 0) return open[0];
  return (
    [...exams]
      .filter((e) => {
        const o = new Date(e.scheduledOpeningTime ?? "").getTime();
        return Number.isFinite(o) && o > now;
      })
      .sort(
        (a, b) =>
          new Date(a.scheduledOpeningTime ?? "").getTime() -
          new Date(b.scheduledOpeningTime ?? "").getTime()
      )[0] ?? null
  );
}

export function QuizMenu() {
  const t = useT();
  const { entries: history, loaded: historyLoaded } = useQuizHistory();
  const { streak } = useDailyGoal();

  const [exam, setExam] = useState<QuizExamPublicItem | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory>("all");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/v1/quiz-exam/scheduled", {
          cache: "no-store",
        });
        const body = (await res.json()) as {
          data?: QuizExamPublicItem[];
          success?: boolean;
        };
        if (!cancelled && body.success && Array.isArray(body.data)) {
          setExam(pickNextExam(body.data, Date.now()));
        }
      } catch {
        // Exam countdown gracefully optional
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const opening = exam ? new Date(exam.scheduledOpeningTime ?? "").getTime() : NaN;
  const closing = exam ? new Date(exam.scheduledClosingTime ?? "").getTime() : NaN;
  const isOpen =
    Number.isFinite(opening) && Number.isFinite(closing) && now >= opening && now < closing;
  const countdownTarget = isOpen ? closing : opening;
  const msLeft = Number.isFinite(countdownTarget) ? countdownTarget - now : 0;

  const total = history.length;
  const wins = history.filter((e) => e.win).length;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

  const filteredCards = useMemo(() => {
    if (selectedCategory === "all") return CARDS;
    return CARDS.filter((card) => card.category === selectedCategory);
  }, [selectedCategory]);

  const categories = [
    { id: "all" as const, labelEn: "All Modes", labelBn: "সব মোড" },
    { id: "daily" as const, labelEn: "Daily & Blitz", labelBn: "দৈনিক ও দ্রুত" },
    { id: "study" as const, labelEn: "Skill Mastery", labelBn: "টপিক ও স্কিল" },
    { id: "exam" as const, labelEn: "Exams & Results", labelBn: "পরীক্ষা ও ফলাফল" },
  ];

  return (
    <div className="relative min-h-dvh bg-[#f8f8f6] px-4 py-6 transition-colors duration-200 dark:bg-[#0c0c0e] sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5 sm:space-y-6">
        {/* ========================================================== */}
        {/* CLEAN TYPOGRAPHIC HEADER (Apple / Linear Restrained Style) */}
        {/* ========================================================== */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-black/[0.05] pb-5 dark:border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-[12px] bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs">
                <Trophy className="size-4.5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {t("কুইজ এরিনা", "Quiz Arena")}
              </h1>
              {streak > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-600 dark:bg-amber-500/20 dark:text-amber-300">
                  <Flame className="size-3.5 fill-amber-500 text-amber-500" />
                  {streak}d
                </span>
              )}
            </div>
            <p className="mt-1.5 text-xs sm:text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400">
              {t(
                "শব্দভাণ্ডার ও ব্যাকরণ অনুশীলন এবং নির্ধারিত লাইভ পরীক্ষা।",
                "Interactive practice, vocabulary recall, and scheduled timed exams."
              )}
              {historyLoaded && total > 0 && (
                <span className="text-zinc-400 dark:text-zinc-500">
                  {" "}· <span className="font-semibold text-zinc-700 dark:text-zinc-300 tabular-nums">{winRate}% {t("জয়", "win rate")}</span> ({wins}/{total} {t("উত্তীর্ণ", "passed")})
                </span>
              )}
            </p>
          </div>

          {/* Segmented Filter Pills */}
          <div
            role="radiogroup"
            className="flex items-center gap-1 rounded-full bg-black/[0.04] p-1 dark:bg-white/[0.06] overflow-x-auto scrollbar-none self-start sm:self-auto shrink-0"
          >
            {categories.map((tab) => {
              const isActive = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategory(tab.id)}
                  className={cn(
                    "relative flex h-8 cursor-pointer items-center justify-center rounded-full px-3.5 text-xs font-semibold outline-none transition-colors whitespace-nowrap",
                    isActive
                      ? "text-zinc-900 dark:text-zinc-100"
                      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeCategoryPill"
                      className="absolute inset-0 rounded-full bg-white shadow-xs dark:bg-[#1c1c1e]"
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">{t(tab.labelBn, tab.labelEn)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Exam Notice Strip (Only displayed when an exam is currently active) */}
        {isOpen && exam && (
          <Link
            href="/quiz/exam"
            className="group flex items-center justify-between rounded-[16px] border border-amber-500/20 bg-amber-50/70 px-4 py-2.5 text-xs text-amber-800 transition-colors hover:bg-amber-100/70 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-200"
          >
            <div className="flex items-center gap-2 truncate">
              <span className="size-2 rounded-full bg-amber-500 animate-ping shrink-0" />
              <span className="font-bold uppercase tracking-wider text-[10px] text-amber-600 dark:text-amber-400 shrink-0">
                {t("লাইভ পরীক্ষা", "LIVE NOW")}:
              </span>
              <span className="font-semibold truncate">{exam.title}</span>
            </div>
            <span className="flex items-center gap-1.5 font-bold shrink-0 tabular-nums ml-2">
              {formatCountdown(msLeft)} {t("বাকি", "left")}
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        )}

        {/* ========================================================== */}
        {/* MODE CATALOG: Clean, Spacious 2-Column Grid               */}
        {/* ========================================================== */}
        <StaggerContainer className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4">
          <AnimatePresence mode="popLayout">
            {filteredCards.map((card) => {
              const Icon = card.icon;
              const BadgeIcon = card.badgeIcon;
              const isExamCard = card.href === "/quiz/exam";

              return (
                <StaggerItem key={card.id}>
                  <Link
                    href={card.href}
                    onClick={(e) => {
                      if (card.href === "/quiz/daily" && requestGoogleLogin()) {
                        e.preventDefault();
                      }
                    }}
                    className={cn(
                      "group relative flex h-full flex-col justify-between rounded-[22px] border border-black/[0.06] bg-white p-4.5 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_8px_24px_-8px_rgba(0,0,0,0.04)] dark:border-white/[0.08] dark:bg-[#1c1c1e]",
                      "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.08)] active:scale-[0.99]"
                    )}
                  >
                    {/* Top Row: Squircle Icon Badge + Pill */}
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className={cn(
                            "flex size-11 shrink-0 items-center justify-center rounded-[14px] border shadow-2xs transition-transform duration-300 group-hover:scale-105",
                            card.pastelStyle
                          )}
                        >
                          <Icon className={cn("size-5", card.iconColor)} />
                        </div>

                        <span className="inline-flex items-center gap-1 rounded-full bg-black/[0.03] px-2.5 py-1 text-[11px] font-semibold text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-300">
                          {BadgeIcon && <BadgeIcon className="size-3" />}
                          {t(card.badgeBn, card.badge)}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div className="mt-3.5">
                        <h2 className="text-[15px] sm:text-base font-semibold tracking-tight text-zinc-900 transition-colors duration-200 dark:text-zinc-100">
                          {t(card.labelBn, card.label)}
                        </h2>
                        <p className="mt-1 text-xs sm:text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                          {t(card.descBn, card.desc)}
                        </p>
                      </div>
                    </div>

                    {/* Special Scheduled Exam Info (if applicable) */}
                    {isExamCard && (
                      <div
                        className={cn(
                          "my-3 flex items-center justify-between rounded-[12px] border px-3 py-1.5 text-xs",
                          isOpen
                            ? "border-amber-500/20 bg-amber-50/70 text-amber-700 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-300"
                            : "border-sky-500/20 bg-sky-50/70 text-sky-700 dark:border-sky-500/30 dark:bg-sky-950/30 dark:text-sky-300"
                        )}
                      >
                        <span className="flex items-center gap-1.5 font-medium">
                          {isOpen ? (
                            <Hourglass className="size-3.5 text-amber-500" />
                          ) : (
                            <Timer className="size-3.5 text-sky-500" />
                          )}
                          {isOpen ? t("পরীক্ষা শেষ হতে:", "Closes in:") : t("পরীক্ষা শুরু হতে:", "Opens in:")}
                        </span>
                        <span className="font-bold tabular-nums">
                          {exam ? formatCountdown(msLeft) : "–"}
                        </span>
                      </div>
                    )}

                    {/* Bottom Row: Metadata Hint + Circular Arrow Button */}
                    <div className="mt-4 flex items-center justify-between border-t border-black/[0.04] pt-3 dark:border-white/[0.04]">
                      <span className="text-[11px] sm:text-xs font-medium text-zinc-400 dark:text-zinc-500">
                        {t(card.metaBn, card.meta)}
                      </span>

                      <span className="flex size-7.5 items-center justify-center rounded-full bg-[#f1f1ef] text-zinc-600 transition-all duration-300 group-hover:bg-zinc-900 group-hover:text-white dark:bg-[#252528] dark:text-zinc-300 dark:group-hover:bg-white dark:group-hover:text-zinc-900">
                        <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Link>
                </StaggerItem>
              );
            })}
          </AnimatePresence>
        </StaggerContainer>
      </div>
    </div>
  );
}
