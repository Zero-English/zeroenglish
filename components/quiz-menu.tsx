"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  type LucideIcon,
} from "lucide-react";
import { useT } from "@/components/language-provider";
import { cn } from "@/lib/utils";
import type { QuizExamPublicItem } from "@/types/quiz-exam";

interface QuizCard {
  label: string;
  labelBn: string;
  desc: string;
  descBn: string;
  href: string;
  icon: LucideIcon;
  accent: string;
  glow: string;
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
    glow: "hover:shadow-violet-500/25 active:shadow-violet-500/25",
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
    glow: "hover:shadow-rose-500/25 active:shadow-rose-500/25",
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
    glow: "hover:shadow-sky-500/25 active:shadow-sky-500/25",
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
    glow: "hover:shadow-emerald-500/25 active:shadow-emerald-500/25",
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
    glow: "hover:shadow-orange-500/25 active:shadow-orange-500/25",
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
    glow: "hover:shadow-indigo-500/25 active:shadow-indigo-500/25",
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

  return (
    <div className="relative min-h-dvh flex flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
      <div className="absolute inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTIwIDIwbDEwIDEwTTIwIDIwbC0xMCAxME0yMCAyMGwxMC0xME0yMCAyMGwtMTAtMTAiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9Ii41IiBzdHJva2Utb3BhY2l0eT0iLjA0Ii8+PC9zdmc+')] opacity-50" />

      <div className="w-full max-w-3xl">
        <div className="animate-fade-up text-center mb-12">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            {t("কুইজ", "Quiz")}
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3 bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
            {t("আপনার কুইজ বেছে নিন", "Choose a Quiz")}
          </h1>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
            {t(
              "শব্দভাণ্ডার, গ্রামার, শ্রেণি কিংবা নির্ধারিত পরীক্ষা — যেভাবে চান কুইজ দিয়ে অনুশীলন করুন।",
              "Practice with vocabulary, grammar, class-based quizzes or scheduled exams — your way."
            )}
          </p>
        </div>

        <div className="mx-auto max-w-2xl grid grid-cols-1 gap-4 sm:gap-5 animate-fade-up-1">
          {CARDS.map((card, i) => {
            const Icon = card.icon;
            const BadgeIcon = card.badgeIcon;
            const isExamCard = card.href === "/quiz/exam";
            return (
              <Link
                key={card.href}
                href={card.href}
                className={`group flex flex-col overflow-hidden rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 backdrop-blur-xl shadow-sm shadow-black/[0.03] transition-all duration-300 hover:-translate-y-1 active:-translate-y-1 hover:border-zinc-300 dark:hover:border-zinc-700 active:border-zinc-300 dark:active:border-zinc-700 hover:shadow-xl active:shadow-xl hover:shadow-black/5 active:shadow-black/5 active:scale-[0.99] ${card.glow}`}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="relative flex items-start justify-between gap-4 p-6 pb-5">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ring-black/5 dark:ring-white/10 ${card.accent}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  {BadgeIcon && (
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${card.pill}`}
                    >
                      <BadgeIcon className="h-3 w-3" />
                      {t(card.badgeBn!, card.badge!)}
                    </span>
                  )}
                  {!BadgeIcon && (
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${card.pill}`}
                    >
                      {t(card.badgeBn!, card.badge!)}
                    </span>
                  )}
                </div>

                <div className="relative flex-1 px-6 pb-6">
                  <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {t(card.labelBn, card.label)}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {t(card.descBn, card.desc)}
                  </p>

                  {isExamCard && (
                    <div
                      className={cn(
                        "relative mt-5 rounded-2xl border px-3.5 py-2.5 flex items-center gap-2",
                        isOpen
                          ? "bg-amber-50/70 dark:bg-amber-500/10 border-amber-200/70 dark:border-amber-800"
                          : "bg-sky-50/70 dark:bg-sky-500/10 border-sky-200/70 dark:border-sky-800"
                      )}
                    >
                      {!examReady ? (
                        <>
                          <Timer className="h-4 w-4 text-zinc-400" />
                          <span className="h-3 w-24 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
                        </>
                      ) : exam ? (
                        <>
                          {isOpen ? (
                            <Hourglass className="h-4 w-4 text-amber-500" />
                          ) : (
                            <CalendarClock className="h-4 w-4 text-sky-500" />
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
                            "বর্তমানে কোনো নির্ধারিত পরীক্ষা নেই",
                            "No exams scheduled right now"
                          )}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="relative flex items-center justify-between border-t border-zinc-200/70 dark:border-zinc-800 px-6 py-4">
                  <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                    {t("শুরু করুন", "Start")}
                  </span>
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 transition-all duration-300 ${card.arrow}`}
                  >
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-active:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}