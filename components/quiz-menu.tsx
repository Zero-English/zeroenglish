"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Languages,
  ArrowRight,
  BookMarked,
  GraduationCap,
  ClipboardList,
  History,
  Sparkles,
  Timer,
  CalendarClock,
  Hourglass,
  Zap,
  Target,
  Trophy,
  Layers,
  type LucideIcon,
} from "lucide-react";
import { useT } from "@/components/language-provider";
import { cn } from "@/lib/utils";
import { useQuizHistory } from "@/lib/use-quiz-history";
import { StaggerContainer, StaggerItem } from "@/components/stagger";
import type { QuizExamPublicItem } from "@/types/quiz-exam";

const CARD =
  "rounded-2xl border border-black/[0.06] bg-white/70 backdrop-blur-xl shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_30px_-12px_rgba(16,24,40,0.10)] dark:border-white/[0.08] dark:bg-zinc-900/60";

const ICON_CHIP =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-black/[0.04] dark:bg-white/[0.06] ring-1 ring-inset ring-black/[0.05] dark:ring-white/[0.08]";

const RING_RADIUS = 22;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

interface QuizCard {
  label: string;
  labelBn: string;
  desc: string;
  descBn: string;
  href: string;
  icon: LucideIcon;
  accent: string;
  arrow: string;
  pill: string;
  badge?: string;
  badgeBn?: string;
  badgeIcon?: LucideIcon;
}

const MUTED_PILL =
  "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400";

const CARDS: QuizCard[] = [
  {
    label: "Quiz Exam",
    labelBn: "কুইজ পরীক্ষা",
    desc: "Take weekly and biweekly timed exams on a fixed schedule.",
    descBn: "নির্ধারিত সময়ে সাপ্তাহিক ও দ্বি-সাপ্তাহিক পরীক্ষা নিন।",
    href: "/quiz/exam",
    icon: ClipboardList,
    accent:
      "bg-violet-100/80 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
    arrow: "group-hover:bg-violet-500 group-hover:text-white group-active:bg-violet-500 group-active:text-white",
    pill: "bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
    badge: "Exam",
    badgeBn: "পরীক্ষা",
    badgeIcon: Timer,
  },
  {
    label: "Quick Quiz",
    labelBn: "কুইক কুইজ",
    desc: "A rapid 20-question mixed quiz with 20 seconds per question from grammar and class topics.",
    descBn: "গ্রামার ও শ্রেণি টপিক থেকে ২০টি প্রশ্ন, প্রতিটি ২০ সেকেন্ডে দিন।",
    href: "/quiz/quick",
    icon: Zap,
    accent:
      "bg-rose-100/80 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
    arrow: "group-hover:bg-rose-500 group-hover:text-white group-active:bg-rose-500 group-active:text-white",
    pill: "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
    badge: "20 × 20s",
    badgeBn: "২০ × ২০ সে.",
    badgeIcon: Timer,
  },
  {
    label: "Vocabulary Practice",
    labelBn: "শব্দভাণ্ডার অনুশীলন",
    desc: "Pick a quiz type and test your word knowledge across all levels.",
    descBn: "কুইজের ধরন বেছে নিয়ে সব লেভেলের শব্দ পরীক্ষা করুন।",
    href: "/quiz/vocabulary",
    icon: Languages,
    accent:
      "bg-sky-100/80 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300",
    arrow: "group-hover:bg-sky-500 group-hover:text-white group-active:bg-sky-500 group-active:text-white",
    pill: MUTED_PILL,
    badge: "Practice",
    badgeBn: "অনুশীলন",
  },
  {
    label: "Grammar Topic Quizzes",
    labelBn: "গ্রামার টপিক কুইজ",
    desc: "Tenses, prepositions, articles, voice change and more.",
    descBn: "টেন্স, প্রিপজিশন, আর্টিকেল, ভয়েস চেঞ্জ ও আরও অনেক কিছু।",
    href: "/quiz/grammar",
    icon: BookMarked,
    accent:
      "bg-emerald-100/80 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
    arrow: "group-hover:bg-emerald-500 group-hover:text-white group-active:bg-emerald-500 group-active:text-white",
    pill: MUTED_PILL,
    badge: "Grammar",
    badgeBn: "গ্রামার",
  },
  {
    label: "Class Based Quizzes",
    labelBn: "শ্রেণি ভিত্তিক কুইজ",
    desc: "Primary, SSC, HSC, IELTS, TOEFL, BCS and university level quizzes.",
    descBn: "প্রাথমিক, SSC, HSC, IELTS, TOEFL, BCS ও বিশ্ববিদ্যালয় পর্যায়ের কুইজ।",
    href: "/quiz/class",
    icon: GraduationCap,
    accent:
      "bg-orange-100/80 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300",
    arrow: "group-hover:bg-orange-500 group-hover:text-white group-active:bg-orange-500 group-active:text-white",
    pill: MUTED_PILL,
    badge: "Class",
    badgeBn: "শ্রেণি",
  },
  {
    label: "Past Exam Results",
    labelBn: "পূর্বের পরীক্ষার ফলাফল",
    desc: "Review your word-level performance across all past practice quizzes.",
    descBn: "আপনার নেওয়া সব প্র্যাকটিস কুইজের শব্দভিত্তিক ফলাফল দেখুন।",
    href: "/quiz/results",
    icon: History,
    accent:
      "bg-indigo-100/80 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300",
    arrow: "group-hover:bg-indigo-500 group-hover:text-white group-active:bg-indigo-500 group-active:text-white",
    pill: MUTED_PILL,
    badge: "Results",
    badgeBn: "ফলাফল",
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
  return [...exams]
    .filter((e) => {
      const o = new Date(e.scheduledOpeningTime ?? "").getTime();
      return Number.isFinite(o) && o > now;
    })
    .sort(
      (a, b) =>
        new Date(a.scheduledOpeningTime ?? "").getTime() -
        new Date(b.scheduledOpeningTime ?? "").getTime()
    )[0] ?? null;
}

export function QuizMenu() {
  const t = useT();
  const { entries: history, loaded: historyLoaded } = useQuizHistory();
  const [exam, setExam] = useState<QuizExamPublicItem | null>(null);
  const [examReady, setExamReady] = useState(false);
  const [now, setNow] = useState(() => Date.now());

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
        if (!cancelled) {
          if (body.success && Array.isArray(body.data)) {
            setExam(pickNextExam(body.data, Date.now()));
          }
        }
      } catch {
        // ignore; countdown simply won't render
      } finally {
        if (!cancelled) setExamReady(true);
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
  const typeCount = new Set(history.map((e) => e.quizType)).size;
  const last = history.length > 0 ? history[history.length - 1] : null;

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="relative px-4 py-10 sm:px-6 lg:px-8">
        <StaggerContainer className="mx-auto max-w-6xl">
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            {/* Left rail: overview */}
            <div className="space-y-4 sm:space-y-6 lg:sticky lg:top-6 lg:self-start">
              <StaggerItem>
                <div className={cn(CARD, "overflow-hidden")}>
                  <div className="p-5 sm:p-6">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.03] dark:bg-white/[0.06] px-3 py-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      <Sparkles className="h-3.5 w-3.5 text-orange-500" />
                      {t("কুইজ", "Quizzes")}
                    </div>
                    <h1 className="mt-3 text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                      {t("আপনার কুইজ বেছে নিন", "Choose a Quiz")}
                    </h1>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      {t(
                        "শব্দভাণ্ডার, গ্রামার, শ্রেণি কিংবা নির্ধারিত পরীক্ষা — যেভাবে চান কুইজ দিয়ে অনুশীলন করুন।",
                        "Pick a mode and practice your way — vocabulary, grammar, class-based or scheduled exams."
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
                          animate={{ strokeDashoffset: RING_LENGTH * (1 - (historyLoaded ? winRate : 0) / 100) }}
                          transition={{ duration: 0.9, ease: "easeOut" }}
                          className="stroke-orange-500"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                          {historyLoaded ? `${winRate}%` : "…"}
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        {t("জয়ের হার", "Win rate")}
                      </p>
                      <p className="mt-0.5 text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                        {historyLoaded ? (
                          <>
                            {wins}
                            <span className="font-normal text-zinc-400"> / {total}</span>
                          </>
                        ) : (
                          "…"
                        )}
                      </p>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500">
                        {t("কুইজে জয়", "quizzes won")}
                      </p>
                    </div>
                  </div>

                  <StaggerContainer className="grid grid-cols-2 overflow-hidden">
                    <StaggerItem className="border-l border-t border-black/[0.06] dark:border-white/[0.08] [&:nth-child(odd)]:border-l-0 [&:nth-child(-n+2)]:border-t-0">
                      <StatRow
                        icon={Target}
                        labelEn="Quizzes taken"
                        labelBn="কুইজ নেওয়া হয়েছে"
                        value={historyLoaded ? `${total}` : "…"}
                        subEn="across all modes"
                        subBn="সব মোড মিলিয়ে"
                        tint="text-orange-500"
                      />
                    </StaggerItem>
                    <StaggerItem className="border-l border-t border-black/[0.06] dark:border-white/[0.08] [&:nth-child(odd)]:border-l-0 [&:nth-child(-n+2)]:border-t-0">
                      <StatRow
                        icon={Trophy}
                        labelEn="Wins"
                        labelBn="জয়"
                        value={historyLoaded ? `${wins}` : "…"}
                        subEn={total > 0 ? `of ${total} total` : "no quizzes yet"}
                        subBn={total > 0 ? `মোট ${total}টির মধ্যে` : "এখনো কোনো কুইজ নেই"}
                        tint="text-emerald-500"
                      />
                    </StaggerItem>
                    <StaggerItem className="border-l border-t border-black/[0.06] dark:border-white/[0.08] [&:nth-child(odd)]:border-l-0 [&:nth-child(-n+2)]:border-t-0">
                      <StatRow
                        icon={Layers}
                        labelEn="Types"
                        labelBn="ধরন"
                        value={historyLoaded ? `${typeCount}` : "…"}
                        subEn="modes you've tried"
                        subBn="যে মোডগুলোতে খেলেছেন"
                        tint="text-sky-500"
                      />
                    </StaggerItem>
                    <StaggerItem className="border-l border-t border-black/[0.06] dark:border-white/[0.08] [&:nth-child(odd)]:border-l-0 [&:nth-child(-n+2)]:border-t-0">
                      <StatRow
                        icon={Sparkles}
                        labelEn="Last result"
                        labelBn="সর্বশেষ ফলাফল"
                        value={
                          last
                            ? last.win
                              ? t("জয়", "Won")
                              : t("পরাজয়", "Lost")
                            : historyLoaded
                              ? "–"
                              : "…"
                        }
                        subEn={last ? `${last.numberOfQuestions} questions` : "no quizzes yet"}
                        subBn={last ? `${last.numberOfQuestions}টি প্রশ্ন` : "এখনো কোনো কুইজ নেই"}
                        tint="text-violet-500"
                      />
                    </StaggerItem>
                  </StaggerContainer>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className={cn(CARD, "overflow-hidden")}>
                  <div className="flex items-center gap-2.5 border-b border-black/[0.06] dark:border-white/[0.08] px-5 sm:px-6 py-4">
                    <div className={cn(ICON_CHIP, "text-violet-500")}>
                      <CalendarClock className="size-4.5" />
                    </div>
                    <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                      {t("পরবর্তী পরীক্ষা", "Next Exam")}
                    </h2>
                  </div>

                  <div className="px-5 sm:px-6 py-4">
                    {!examReady ? (
                      <div className="space-y-2">
                        <div className="h-5 w-32 rounded-full bg-zinc-200/80 dark:bg-zinc-700/60 animate-pulse" />
                        <div className="h-3 w-44 rounded-full bg-zinc-200/70 dark:bg-zinc-700/40 animate-pulse" />
                      </div>
                    ) : exam ? (
                      <div>
                        <div className="flex items-center gap-2">
                          {isOpen ? (
                            <Hourglass className="h-4 w-4 text-amber-500" />
                          ) : (
                            <Timer className="h-4 w-4 text-sky-500" />
                          )}
                          <span
                            className={cn(
                              "text-xs font-semibold",
                              isOpen
                                ? "text-amber-700 dark:text-amber-300"
                                : "text-sky-700 dark:text-sky-300"
                            )}
                          >
                            {isOpen
                              ? t("শেষ হতে বাকি:", "Closes in:")
                              : t("শুরু হতে বাকি:", "Opens in:")}
                          </span>
                          <span
                            className={cn(
                              "ml-auto text-xl font-bold tabular-nums",
                              isOpen
                                ? "text-amber-800 dark:text-amber-200"
                                : "text-sky-800 dark:text-sky-200"
                            )}
                          >
                            {formatCountdown(msLeft)}
                          </span>
                        </div>
                        <p className="mt-2 truncate text-xs font-medium text-zinc-500 dark:text-zinc-400">
                          {exam.title}
                        </p>
                        <p className="mt-0.5 text-[11px] text-zinc-400 dark:text-zinc-500 tabular-nums">
                          {t(
                            `${exam.questionCount}টি প্রশ্ন · প্রতি প্রশ্নে ${exam.timePerQuestion} সেকেন্ড`,
                            `${exam.questionCount} questions · ${exam.timePerQuestion}s each`
                          )}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-zinc-400 dark:text-zinc-500">
                        <Sparkles className="h-4 w-4" />
                        {t(
                          "বর্তমানে কোনো নির্ধারিত পরীক্ষা নেই",
                          "No exams scheduled right now"
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </StaggerItem>
            </div>

            {/* Main column: quiz modes */}
            <div className="space-y-4 sm:space-y-6">
              <StaggerItem>
                <section>
                  <div className="mb-4 px-1">
                    <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                      {t("কুইজ মোড", "Quiz Modes")}
                    </h2>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">
                      {t(
                        "একটি মোড বেছে নিয়ে অনুশীলন শুরু করুন।",
                        "Pick a mode and start practicing."
                      )}
                    </p>
                  </div>

                  <div className={cn(CARD, "overflow-hidden")}>
                    <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2">
                      {CARDS.map((card) => {
                        const Icon = card.icon;
                        const BadgeIcon = card.badgeIcon;
                        const isExamCard = card.href === "/quiz/exam";
                        return (
                          <StaggerItem
                            key={card.href}
                            className="border-l border-t border-black/[0.06] dark:border-white/[0.08] [&:nth-child(odd)]:border-l-0 [&:nth-child(-n+2)]:border-t-0"
                          >
                            <Link
                              href={card.href}
                              className={cn(
                                "group flex h-full flex-col gap-3 p-5 sm:p-6 transition-colors",
                                "hover:bg-black/[0.02] active:bg-black/[0.02] dark:hover:bg-white/[0.04] dark:active:bg-white/[0.04]"
                              )}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div
                                  className={cn(
                                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_2px_8px_-2px_rgba(16,24,40,0.15)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_8px_-2px_rgba(0,0,0,0.5)]",
                                    card.accent
                                  )}
                                >
                                  <Icon className="h-6 w-6" />
                                </div>

                              {BadgeIcon && (
                                <span
                                  className={cn(
                                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold",
                                    card.pill
                                  )}
                                >
                                  <BadgeIcon className="h-3 w-3" />
                                  {t(card.badgeBn!, card.badge!)}
                                </span>
                              )}
                              {!BadgeIcon && (
                                <span
                                  className={cn(
                                    "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold",
                                    card.pill
                                  )}
                                >
                                  {t(card.badgeBn!, card.badge!)}
                                </span>
                              )}
                            </div>

                            <div className="min-w-0">
                              <h3 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                                {t(card.labelBn, card.label)}
                              </h3>
                              <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                                {t(card.descBn, card.desc)}
                              </p>
                            </div>

                            {isExamCard && (
                              <div
                                className={cn(
                                  "flex items-center gap-1.5 rounded-xl border px-3 py-2",
                                  isOpen
                                    ? "bg-amber-50/70 dark:bg-amber-500/10 border-amber-200/70 dark:border-amber-800"
                                    : "bg-sky-50/70 dark:bg-sky-500/10 border-sky-200/70 dark:border-sky-800"
                                )}
                              >
                                {!examReady ? (
                                  <>
                                    <Timer className="h-3.5 w-3.5 text-zinc-400" />
                                    <span className="h-3 w-20 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
                                  </>
                                ) : exam ? (
                                  <>
                                    {isOpen ? (
                                      <Hourglass className="h-3.5 w-3.5 text-amber-500" />
                                    ) : (
                                      <CalendarClock className="h-3.5 w-3.5 text-sky-500" />
                                    )}
                                    <span
                                      className={cn(
                                        "text-xs font-semibold",
                                        isOpen
                                          ? "text-amber-700 dark:text-amber-300"
                                          : "text-sky-700 dark:text-sky-300"
                                      )}
                                    >
                                      {isOpen
                                        ? t("শেষ হতে:", "Closes in:")
                                        : t("শুরু হতে:", "Opens in:")}
                                    </span>
                                    <span
                                      className={cn(
                                        "ml-auto text-sm font-bold tabular-nums",
                                        isOpen
                                          ? "text-amber-800 dark:text-amber-200"
                                          : "text-sky-800 dark:text-sky-200"
                                      )}
                                    >
                                      {formatCountdown(msLeft)}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-xs font-medium text-zinc-400">
                                    {t(
                                      "শিডিউল করা পরীক্ষা নেই",
                                      "No exams scheduled"
                                    )}
                                  </span>
                                )}
                              </div>
                            )}

                            <div className="mt-auto flex items-center justify-between pt-1">
                              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                                {t("শুরু করুন", "Start")}
                              </span>
                              <span
                                className={cn(
                                  "flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 transition-colors duration-300",
                                  card.arrow
                                )}
                              >
                                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-active:translate-x-0.5" />
                              </span>
                            </div>
                          </Link>
                        </StaggerItem>
                    );
                  })}
                    </StaggerContainer>
                  </div>
                </section>
              </StaggerItem>
            </div>
          </div>
        </StaggerContainer>
      </div>
    </div>
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