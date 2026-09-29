"use client";

import Link from "next/link";
import type { Word } from "@/lib/data";
import { useLearnedWords } from "@/lib/use-learned-words";
import { Button } from "@/components/ui/button";
import {
  LibraryBig,
  BookOpenCheck,
  Search,
  ArrowRight,
  Sparkles,
  Layers,
  TrendingUp,
  Languages,
  BookMarked,
  GraduationCap,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/components/language-provider";
import { LatestPostsHome, type LatestPost } from "@/components/news/latest-posts-home";
import type { LeaderboardRow } from "@/components/leaderboard";
import { TopLearnersHome } from "@/components/top-learners-home";
import { isLevelLive, VALID_LEVELS } from "@/lib/level-copy";

const LEVEL_CONFIG: Record<
  string,
  { bg: string; border: string; text: string; gradient: string; label: string; labelBn: string; solid: string }
> = {
  A1: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-700 dark:text-emerald-300",
    gradient: "from-emerald-500 to-teal-500",
    label: "Beginner",
    labelBn: "শিক্ষানবিস",
    solid: "bg-emerald-500",
  },
  A2: {
    bg: "bg-sky-50 dark:bg-sky-950/40",
    border: "border-sky-200 dark:border-sky-800",
    text: "text-sky-700 dark:text-sky-300",
    gradient: "from-sky-500 to-blue-500",
    label: "Elementary",
    labelBn: "প্রাথমিক",
    solid: "bg-sky-500",
  },
  B1: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-200 dark:border-amber-800",
    text: "text-amber-700 dark:text-amber-300",
    gradient: "from-amber-500 to-orange-500",
    label: "Intermediate",
    labelBn: "মাঝারি",
    solid: "bg-amber-500",
  },
  B2: {
    bg: "bg-rose-50 dark:bg-rose-950/40",
    border: "border-rose-200 dark:border-rose-800",
    text: "text-rose-700 dark:text-rose-300",
    gradient: "from-rose-500 to-pink-500",
    label: "Upper Intermediate",
    labelBn: "উচ্চ-মাঝারি",
    solid: "bg-rose-500",
  },
  C1: {
    bg: "bg-violet-50 dark:bg-violet-950/40",
    border: "border-violet-200 dark:border-violet-800",
    text: "text-violet-700 dark:text-violet-300",
    gradient: "from-violet-500 to-purple-500",
    label: "Advanced",
    labelBn: "উন্নত",
    solid: "bg-violet-500",
  },
  C2: {
    bg: "bg-fuchsia-50 dark:bg-fuchsia-950/40",
    border: "border-fuchsia-200 dark:border-fuchsia-800",
    text: "text-fuchsia-700 dark:text-fuchsia-300",
    gradient: "from-fuchsia-500 to-pink-500",
    label: "Mastery",
    labelBn: "পারদর্শী",
    solid: "bg-fuchsia-500",
  },
};

const fmt = (n: number) => n.toLocaleString("en-US");

const FEATURES = [
  {
    href: "/vocabulary",
    icon: LibraryBig,
    titleEn: "Word lists",
    titleBn: "শব্দতালিকা",
    descriptionEn: "Every word, grouped by CEFR level and topic. Mark what you know and what you are still learning.",
    descriptionBn: "সব শব্দ CEFR লেভেল ও বিষয় অনুযায়ী সাজানো। যা জানেন আর যা শিখছেন তা আলাদা করে চিহ্নিত করুন।",
    iconClass: "text-orange-500 bg-orange-100 dark:bg-orange-950/60",
  },
  {
    href: "/quiz",
    icon: BookOpenCheck,
    titleEn: "Quizzes",
    titleBn: "কুইজ",
    descriptionEn: "Vocabulary and grammar questions with instant feedback, an explanation for every answer, and a saved score history.",
    descriptionBn: "শব্দভাণ্ডার ও ব্যাকরণের প্রশ্ন, সঙ্গে সঙ্গে ফলাফল ও প্রতিটি উত্তরের ব্যাখ্যা। ফলাফল সংরক্ষিত থাকে।",
    iconClass: "text-sky-500 bg-sky-100 dark:bg-sky-950/60",
  },
  {
    href: "/search",
    icon: Search,
    titleEn: "Search",
    titleBn: "অনুসন্ধান",
    descriptionEn: "Look up any word you meet somewhere else and read its Bangla meaning, definition, examples and synonyms.",
    descriptionBn: "যেকোনো শব্দ খুঁজে বাংলা অর্থ, সংজ্ঞা, উদাহরণ ও প্রতিশব্দ একসঙ্গে দেখুন।",
    iconClass: "text-emerald-500 bg-emerald-100 dark:bg-emerald-950/60",
  },
];

const QUIZ_MODES = [
  {
    href: "/quiz/vocabulary",
    icon: Languages,
    titleEn: "Vocabulary Practice",
    titleBn: "শব্দভাণ্ডার অনুশীলন",
    descriptionEn: "Test your word knowledge across all levels.",
    descriptionBn: "সব লেভেলের শব্দ জ্ঞান যাচাই করুন।",
    iconClass: "text-sky-500 bg-sky-100 dark:bg-sky-950/60",
  },
  {
    href: "/quiz/grammar",
    icon: BookMarked,
    titleEn: "Grammar Quizzes",
    titleBn: "গ্রামার কুইজ",
    descriptionEn: "Tenses, prepositions, articles and more.",
    descriptionBn: "টেন্স, প্রিপজিশন, আর্টিকেল ও আরও অনেক কিছু।",
    iconClass: "text-emerald-500 bg-emerald-100 dark:bg-emerald-950/60",
  },
  {
    href: "/quiz/class",
    icon: GraduationCap,
    titleEn: "Class Based Quizzes",
    titleBn: "শ্রেণি ভিত্তিক কুইজ",
    descriptionEn: "SSC, HSC, IELTS, BCS and university level.",
    descriptionBn: "SSC, HSC, IELTS, BCS ও বিশ্ববিদ্যালয় পর্যায়ে।",
    iconClass: "text-orange-500 bg-orange-100 dark:bg-orange-950/60",
  },
  {
    href: "/quiz/exam",
    icon: ClipboardList,
    titleEn: "Scheduled Exams",
    titleBn: "নির্ধারিত পরীক্ষা",
    descriptionEn: "Weekly and biweekly timed exams.",
    descriptionBn: "সাপ্তাহিক ও দ্বি-সাপ্তাহিক সময়ভিত্তিক পরীক্ষা।",
    iconClass: "text-violet-500 bg-violet-100 dark:bg-violet-950/60",
  },
];

export function HomeContent({
  words,
  posts,
  leaderboard,
}: {
  words: Word[];
  posts: LatestPost[];
  leaderboard: LeaderboardRow[];
}) {
  const { learnedIds, loaded } = useLearnedWords();
  const t = useT();

  const levelStats = VALID_LEVELS.map((level) => {
    const items = words.filter((w) => w.level === level);
    const learned = items.filter((w) => learnedIds.has(String(w.id))).length;
    return { level, label: LEVEL_CONFIG[level].label, total: items.length, learned };
  });

  const totalLearned = levelStats.reduce((sum, s) => sum + s.learned, 0);
  const overallPct = words.length > 0 ? Math.round((totalLearned / words.length) * 100) : 0;
  const liveLevelCount = levelStats.filter((s) => isLevelLive(s.total)).length;

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
      <div className="fixed inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTIwIDIwbDEwIDEwTTIwIDIwbC0xMCAxME0yMCAyMGwxMC0xME0yMCAyMGwtMTAtMTAiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9Ii41IiBzdHJva2Utb3BhY2l0eT0iLjA0Ii8+PC9zdmc+')] opacity-50" />

      <div className="relative px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <section className="relative text-center mb-14 animate-fade-up">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 -top-6 -bottom-1/2 -z-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMjAnIGhlaWdodD0nMjAnIHZpZXdCb3g9JzAgMCAyMCAyMCcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48Y2lyY2xlIGN4PScxMCcgY3k9JzEwJyByPScxLjInIGZpbGw9J2JsYWNrJyBmaWxsLW9wYWNpdHk9JzAuMicvPjwvc3ZnPg==')] dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMjAnIGhlaWdodD0nMjAnIHZpZXdCb3g9JzAgMCAyMCAyMCcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48Y2lyY2xlIGN4PScxMCcgY3k9JzEwJyByPScxLjInIGZpbGw9J3doaXRlJyBmaWxsLW9wYWNpdHk9JzAuMjYnLz48L3N2Zz4=')] [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]"
            />
            <div className="relative">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/70 px-3 py-1 text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-5">
                <Sparkles className="h-3.5 w-3.5 text-orange-500" />
                {t(
                  `${fmt(words.length)}টি ইংরেজি শব্দ, বাংলা অর্থসহ`,
                  `${fmt(words.length)} English words with Bangla meanings`
                )}
              </div>

            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-4">
              <span className="bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
                {t("ইংরেজি শব্দ ও বাংলা অর্থ,", "English words with Bangla meanings,")}
              </span>
              <br />
              <span className="bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 bg-clip-text text-transparent">
                {t("A1 থেকে C1 লেভেলে।", "graded from A1 to C1.")}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto mb-8">
              {t(
                `অক্সফোর্ড ৩০০০ ও ৫০০০ তালিকা থেকে বাছাই করা ${fmt(words.length)}টি ইংরেজি শব্দ। প্রতিটি শব্দের বাংলা অর্থ, ইংরেজি সংজ্ঞা, উদাহরণ বাক্য, প্রতিশব্দ ও বিপরীত শব্দ দেওয়া আছে। অ্যাকাউন্ট ছাড়াই শেখা শুরু করা যায়।`,
                `${fmt(words.length)} English words selected from the Oxford 3000 and 5000 lists. Every entry has a Bangla meaning, an English definition, example sentences, synonyms and antonyms. You can start without an account.`
              )}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
              <Button
                asChild
                className="h-11 gap-2.5 rounded-xl px-6 text-sm font-medium bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-500/20"
              >
                <Link href="/vocabulary">
                  {t("শেখা শুরু করুন", "Start Learning")}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 gap-2.5 rounded-xl px-6 text-sm font-medium"
              >
                <Link href="/quiz">{t("কুইজ দিন", "Take a Quiz")}</Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <div className="flex items-center gap-3 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm px-4 py-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                  <LibraryBig className="h-4 w-4" />
                </span>
                <div className="text-left">
                  <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tabular-nums leading-none">
                    {fmt(words.length)}
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">{t("ইংরেজি শব্দ", "English words")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm px-4 py-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                  <Layers className="h-4 w-4" />
                </span>
                <div className="text-left">
                  {/* Counts only the levels that are actually study-ready. A
                      "6 CEFR levels" badge would contradict the C2 card right
                      below it, which is explicitly marked as still being
                      written. */}
                  <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tabular-nums leading-none">
                    {liveLevelCount}
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    {t("খোলা CEFR লেভেল", "CEFR levels open")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm px-4 py-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-500">
                  <TrendingUp className="h-4 w-4" />
                </span>
                <div className="text-left">
                  <p className="text-xl font-bold text-orange-500 tabular-nums leading-none">
                    {loaded ? `${overallPct}%` : "· · ·"}
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">{t("আপনার অগ্রগতি", "Your progress")}</p>
                </div>
              </div>
            </div>
          </div>
          </section>

          <section className="mb-14">
            <div className="flex items-end justify-between mb-5">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                  {t("লেভেল অনুযায়ী শব্দতালিকা", "Word lists by level")}
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {t(
                    "প্রতিটি লেভেলে সেই স্তরের সাধারণ শব্দগুলো সাজানো আছে। যেটি এখনো তৈরি হচ্ছে তার নিচে লেখা আছে।",
                    "Each level holds the words common at that stage. Levels still being written say so underneath."
                  )}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {levelStats.map(({ level, total, learned }) => {
                const c = LEVEL_CONFIG[level];
                const pct = total > 0 ? Math.round((learned / total) * 100) : 0;
                // A level with almost nothing in it is not worth linking to yet.
                const inProgress = !isLevelLive(total);

                const body = (
                  <>
                    <div
                      className={cn(
                        "absolute inset-0 rounded-3xl bg-gradient-to-br opacity-0 group-hover:opacity-10 dark:group-hover:opacity-15 transition-opacity duration-300",
                        c.gradient
                      )}
                    />
                    <div className="relative flex flex-col gap-3">
                      <div className="flex items-start justify-between">
                        <span
                          className={cn(
                            "text-3xl sm:text-4xl font-black bg-gradient-to-br bg-clip-text text-transparent",
                            c.gradient
                          )}
                        >
                          {level}
                        </span>
                        <span className={cn("text-xs font-medium", c.text)}>{t(c.labelBn, c.label)}</span>
                      </div>

                      <div className="space-y-1.5">
                        {inProgress ? (
                          <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                            {t("লিস্ট তৈরি হচ্ছে", "List in progress")}
                          </p>
                        ) : (
                          <>
                            <div className="flex items-baseline justify-between text-sm">
                              <span className="text-zinc-500 dark:text-zinc-400 font-medium">
                                {t(`${fmt(total)}টি শব্দ`, `${fmt(total)} words`)}
                              </span>
                              <span className="text-zinc-400 dark:text-zinc-500 tabular-nums">
                                {loaded ? t(`${learned}টি শেখা`, `${learned} learned`) : `\u00A0`}
                              </span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-zinc-200/70 dark:bg-zinc-800 overflow-hidden">
                              {loaded ? (
                                <div
                                  className={cn("h-full rounded-full transition-all duration-500", c.solid)}
                                  style={{ width: `${pct}%` }}
                                />
                              ) : (
                                <div className="h-full w-1/3 rounded-full bg-zinc-300/70 dark:bg-zinc-700 animate-pulse" />
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                );

                const shell = cn(
                  "group relative overflow-hidden rounded-3xl border-2 p-5 sm:p-6 backdrop-blur-sm transition-all duration-300",
                  c.border,
                  c.bg
                );

                return inProgress ? (
                  <div
                    key={level}
                    className={cn(shell, "opacity-70")}
                    aria-disabled="true"
                  >
                    {body}
                  </div>
                ) : (
                  <Link
                    key={level}
                    href={`/vocabulary/${level.toLowerCase()}`}
                    className={cn(shell, "hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98]")}
                  >
                    {body}
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="mb-14">
            <div className="mb-5">
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                {t("খুঁজুন, পড়ুন, পরীক্ষা করুন", "Find it, read it, test it")}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                {t("তিনটি কাজ, তিনটি পাতা।", "Three jobs, three pages.")}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {FEATURES.map(({ href, icon: Icon, titleEn, titleBn, descriptionEn, descriptionBn, iconClass }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-center gap-4 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-5 transition-all duration-300 hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-black/30 hover:-translate-y-0.5"
                >
                  <div
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                      iconClass
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {t(titleBn, titleEn)}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {t(descriptionBn, descriptionEn)}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-zinc-300 dark:text-zinc-600 transition-all group-hover:translate-x-1 group-hover:text-orange-500" />
                </Link>
              ))}
            </div>
          </section>

          <section className="mb-14">
            <div className="flex items-end justify-between gap-4 mb-5">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                  {t("কুইজে নিজেকে যাচাই করুন", "Test yourself with quizzes")}
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {t("চার ধরনের কুইজ — যেভাবে চান অনুশীলন করুন।", "Four quiz modes — practice your way.")}
                </p>
              </div>
              <Link
                href="/quiz"
                className="hidden sm:inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 transition-colors"
              >
                {t("সব কুইজ", "All quizzes")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {QUIZ_MODES.map(({ href, icon: Icon, titleEn, titleBn, descriptionEn, descriptionBn, iconClass }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex flex-col rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-5 transition-all duration-300 hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-black/30 hover:-translate-y-0.5"
                >
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-2xl",
                      iconClass
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="mt-4 flex-1">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {t(titleBn, titleEn)}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {t(descriptionBn, descriptionEn)}
                    </p>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-orange-600 dark:text-orange-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    {t("শুরু করুন", "Start")}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <LatestPostsHome posts={posts} />

          <section className="mb-14">
            <TopLearnersHome rows={leaderboard} />
          </section>

          <section>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600 via-rose-600 to-pink-600 p-8 sm:p-12 text-center shadow-xl shadow-orange-500/20">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMjAnIGhlaWdodD0nMjAnIHZpZXdCb3g9JzAgMCAyMCAyMCcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48Y2lyY2xlIGN4PScxMCcgY3k9JzEwJyByPScxLjInIGZpbGw9J3doaXRlJyBmaWxsLW9wYWNpdHk9JzAuMTgnLz48L3N2Zz4=')]"
              />
              <div className="relative">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  {t("আপনার লেভেল দেখুন", "See your level")}
                </h2>
                <p className="mt-3 text-sm sm:text-base text-orange-50/90 max-w-xl mx-auto">
                  {t(
                    `${fmt(words.length)}টি ইংরেজি শব্দ লেভেল ও বিষয় অনুযায়ী সাজানো। অ্যাকাউন্ট ছাড়াই খোলা যায়।`,
                    `${fmt(words.length)} English words, sorted by level and topic. Open any of them without an account.`
                  )}
                </p>
                <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                  <Button
                    asChild
                    className="h-11 gap-2 rounded-xl bg-white px-6 text-sm font-medium text-rose-600 hover:bg-orange-50 shadow-lg shadow-black/10"
                  >
                    <Link href="/vocabulary">
                      {t("শব্দতালিকা দেখুন", "Browse the word lists")}
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-11 gap-2 rounded-xl border-white/40 bg-white/10 text-white px-6 text-sm font-medium backdrop-blur-sm hover:bg-white/20"
                  >
                    <Link href="/login">{t("অ্যাকাউন্ট খুলুন", "Create Account")}</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}