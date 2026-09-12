"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Languages,
  Layers,
  ArrowLeftRight,
  Shuffle,
  Trophy,
  XCircle,
  Volume2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StaggerContainer, StaggerItem } from "@/components/stagger";
import { useT } from "@/components/language-provider";
import { useSpeak } from "@/lib/use-speak";
import {
  fetchVocabularyExamResultById,
  vocabularyExamResultDate,
  type DbVocabularyExamResult,
  type DbVocabularyWord,
} from "@/lib/vocabulary-exam-results-api";

const QUIZ_TYPE_META: Record<
  string,
  { label: string; labelBn: string; icon: LucideIcon; iconColor: string; bg: string; gradient: string }
> = {
  ENGLISH_TO_BANGLA: {
    label: "English to Bangla",
    labelBn: "ইংরেজি থেকে বাংলা",
    icon: Languages,
    iconColor: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-100 dark:bg-sky-900/30",
    gradient: "from-sky-400 to-sky-500",
  },
  BANGLA_TO_ENGLISH: {
    label: "Bangla to English",
    labelBn: "বাংলা থেকে ইংরেজি",
    icon: ArrowLeftRight,
    iconColor: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
    gradient: "from-indigo-400 to-indigo-500",
  },
  SYNONYMS: {
    label: "Synonyms",
    labelBn: "সমার্থক শব্দ",
    icon: Shuffle,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    gradient: "from-emerald-400 to-teal-500",
  },
  ANTONYMS: {
    label: "Antonyms",
    labelBn: "বিপরীত শব্দ",
    icon: Layers,
    iconColor: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-100 dark:bg-rose-900/30",
    gradient: "from-rose-400 to-pink-500",
  },
};

const LEVEL_COLORS: Record<string, string> = {
  A1: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  A2: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  B1: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  B2: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
  C1: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
  C2: "bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-950/40 dark:text-fuchsia-300",
};

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function WordDetail({ word }: { word: DbVocabularyWord }) {
  const t = useT();
  const speak = useSpeak();
  const meaning = word.meaningBn.length > 0 ? word.meaningBn[0] : null;

  return (
    <StaggerItem className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-5 sm:p-6 transition-all duration-200 hover:shadow-lg hover:border-zinc-300/80 dark:hover:border-zinc-700/80">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => speak(word.word)}
          className="group inline-flex items-center gap-2 text-left"
          title={t("উচ্চারণ শুনুন", "Listen to pronunciation")}
        >
          <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
            {word.word}
          </h4>
          <Volume2 className="h-4 w-4 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-500 dark:group-hover:text-zinc-400" />
        </button>
        {word.wordType.length > 0 && (
          <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono bg-zinc-100 dark:bg-zinc-800/60 rounded-md px-2 py-0.5">
            {word.wordType.join(", ")}
          </span>
        )}
        <span
          className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-md",
            LEVEL_COLORS[word.level] ?? "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
          )}
        >
          {word.level}
        </span>
      </div>

      {meaning && meaning !== "..." && (
        <p className="mt-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          {word.meaningBn.join("; ")}
        </p>
      )}
      {word.definitionEn && (
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          {`${word.definitionEn} (${word.definitionBn})`}
        </p>
      )}
    </StaggerItem>
  );
}

function WordSection({
  title,
  titleBn,
  words,
  correct,
}: {
  title: string;
  titleBn: string;
  words: DbVocabularyWord[];
  correct: boolean;
}) {
  const t = useT();
  const Icon = correct ? CheckCircle2 : XCircle;
  return (
    <div>
      <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4 flex items-center gap-2">
        <Icon
          className={cn(
            "h-4 w-4",
            correct ? "text-emerald-500" : "text-rose-500"
          )}
        />
        {t(titleBn, title)}
        <span className="text-xs font-normal text-zinc-400">({words.length})</span>
      </h3>
      {words.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <StaggerContainer className="contents">
            {words.map((word) => (
              <WordDetail key={word.id} word={word} />
            ))}
          </StaggerContainer>
        </div>
      ) : (
        <p className="text-sm text-zinc-400 dark:text-zinc-500 px-1">
          {correct
            ? t("কোনো সঠিক শব্দ নেই।", "No correct words.")
            : t("কোনো ভুল শব্দ নেই।", "No incorrect words.")}
        </p>
      )}
    </div>
  );
}

export function VocabularyExamResultDetail({
  resultId,
}: {
  resultId: number;
}) {
  const [result, setResult] = useState<DbVocabularyExamResult | null>(null);
  const [loaded, setLoaded] = useState(false);
  const t = useT();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoaded(false);
      const data = await fetchVocabularyExamResultById(resultId);
      if (cancelled) return;
      setResult(data);
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [resultId]);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-24 text-zinc-400">
        <GraduationCap className="size-6 animate-pulse" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center py-20">
        <Trophy className="h-12 w-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-4" />
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-1">
          {t("ফলাফলটি পাওয়া যায়নি।", "This result could not be found.")}
        </p>
        <Link
          href="/profile"
          className="mt-3 inline-flex text-sm text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300"
        >
          {t("প্রোফাইলে ফিরে যান", "Back to profile")}
        </Link>
      </div>
    );
  }

  const dbType = result.quizType?.name ?? "";
  const meta = QUIZ_TYPE_META[dbType] ?? {
    label: "Vocabulary Quiz",
    labelBn: "শব্দ কুইজ",
    icon: GraduationCap,
    iconColor: "text-zinc-600 dark:text-zinc-400",
    bg: "bg-zinc-100 dark:bg-zinc-800",
    gradient: "from-zinc-400 to-zinc-500",
  };
  const Icon = meta.icon;
  const total = result.correctWords.length + result.incorrectWords.length;
  const correctCount = result.correctWords.length;
  const incorrectCount = result.incorrectWords.length;
  const correctPercent =
    total > 0 ? Math.round((correctCount / total) * 100) : 0;

  return (
    <StaggerContainer className="space-y-6">
      {/* Summary card */}
      <StaggerItem className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-6 sm:p-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className={cn("p-2.5 rounded-xl", meta.bg)}>
            <Icon className={cn("h-5 w-5", meta.iconColor)} />
          </div>
          <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {t(meta.labelBn, meta.label)}
          </span>
        </div>
        <div
          className={cn(
            "text-6xl sm:text-7xl font-black bg-clip-text text-transparent mb-2",
            result.scoreInPercent >= 90
              ? "bg-gradient-to-br from-emerald-500 to-teal-500"
              : result.scoreInPercent >= 70
                ? "bg-gradient-to-br from-sky-500 to-blue-500"
                : result.scoreInPercent >= 50
                  ? "bg-gradient-to-br from-amber-500 to-orange-500"
                  : "bg-gradient-to-br from-rose-500 to-pink-500"
          )}
        >
          {result.scoreInPercent}%
        </div>
        <p className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
          <CalendarDays className="h-3.5 w-3.5" />
          {formatDate(vocabularyExamResultDate(result))}
        </p>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900/50 px-3 py-3">
            <div className="text-xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
              {total}
            </div>
            <div className="text-xs text-zinc-400">{t("মোট শব্দ", "Words")}</div>
          </div>
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 px-3 py-3">
            <div className="text-xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
              {correctCount}
            </div>
            <div className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
              {t("সঠিক", "Correct")}
            </div>
          </div>
          <div className="rounded-xl bg-rose-50 dark:bg-rose-950/30 px-3 py-3">
            <div className="text-xl font-bold tabular-nums text-rose-600 dark:text-rose-400">
              {incorrectCount}
            </div>
            <div className="text-xs text-rose-600/70 dark:text-rose-400/70">
              {t("ভুল", "Incorrect")}
            </div>
          </div>
          <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900/50 px-3 py-3">
            <div className="text-xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
              {result.timePerWord}
            </div>
            <div className="text-xs text-zinc-400">
              {t("সেকেন্ড / শব্দ", "s / word")}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
          {result.levels.map((lv) => (
            <span
              key={lv}
              className={cn(
                "rounded-md px-2 py-0.5 text-[11px] font-medium",
                LEVEL_COLORS[lv]
              )}
            >
              {lv}
            </span>
          ))}
        </div>
      </StaggerItem>

      {/* Accuracy bar */}
      <StaggerItem className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-5 sm:p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-zinc-400" />
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              {t("সঠিকতার হার", "Accuracy")}
            </span>
          </div>
          <span className="text-sm font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
            {correctPercent}%
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full bg-gradient-to-r transition-all duration-700",
              correctPercent >= 70
                ? "from-emerald-500 to-teal-500"
                : correctPercent >= 50
                  ? "from-amber-500 to-orange-500"
                  : "from-rose-500 to-pink-500"
            )}
            style={{ width: `${correctPercent}%` }}
          />
        </div>
      </StaggerItem>

      {/* Correct words */}
      <StaggerItem>
        <WordSection
          title="Correct Words"
          titleBn="সঠিক শব্দ"
          words={result.correctWords}
          correct
        />
      </StaggerItem>

      {/* Incorrect words */}
      <StaggerItem>
        <WordSection
          title="Incorrect Words"
          titleBn="ভুল শব্দ"
          words={result.incorrectWords}
          correct={false}
        />
      </StaggerItem>
    </StaggerContainer>
  );
}