"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Volume2,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Circle,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  BookOpenCheck,
  Sparkles,
  Share2,
  Check,
  Languages,
  Eye,
  EyeOff,
  RotateCcw,
  Zap,
  Turtle,
  CheckCheck,
} from "lucide-react";
import { Word, AdjacentWord } from "@/lib/data";
import { useLearnedWords } from "@/lib/use-learned-words";
import { useBookmarkedWords } from "@/lib/use-bookmarked-words";
import { useT } from "@/components/language-provider";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  useGuidedTour,
  GuidedTour,
  TourReplayButton,
  WORD_DETAIL_TOUR,
} from "@/components/guided-tour";

interface WordDetailClientProps {
  word: Word;
  relatedWords?: Word[];
  prevWord?: AdjacentWord | null;
  nextWord?: AdjacentWord | null;
}

export function WordDetailClient({
  word,
  relatedWords = [],
  prevWord = null,
  nextWord = null,
}: WordDetailClientProps) {
  const t = useT();
  const router = useRouter();
  const { isLearned, toggleLearned, loaded: learnedLoaded } = useLearnedWords();
  const {
    isBookmarked,
    toggleBookmark,
    loaded: bookmarkLoaded,
  } = useBookmarkedWords();

  const {
    isOpen: isTourOpen,
    currentStepIndex: tourStepIndex,
    nextStep: tourNext,
    prevStep: tourPrev,
    closeTour,
    startTour,
  } = useGuidedTour(WORD_DETAIL_TOUR);

  const [copied, setCopied] = useState(false);
  const [activeRecallHidden, setActiveRecallHidden] = useState(true);
  const [playingSentenceIdx, setPlayingSentenceIdx] = useState<number | null>(
    null,
  );

  // Quick Self-Check State
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(
    null,
  );
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Reset to hidden state and reset quiz when navigating between words
  useEffect(() => {
    setActiveRecallHidden(true);
    setSelectedQuizOption(null);
    setQuizSubmitted(false);
  }, [word.id]);

  const learned = isLearned(word.id);
  const bookmarked = isBookmarked(word.id);
  const loaded = learnedLoaded && bookmarkLoaded;

  // Keyboard Navigation: Left Arrow -> Previous Word, Right Arrow -> Next Word
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }
      if (e.key === "ArrowLeft" && prevWord) {
        router.push(
          `/vocabulary/${encodeURIComponent(prevWord.word.toLowerCase())}`,
        );
      } else if (e.key === "ArrowRight" && nextWord) {
        router.push(
          `/vocabulary/${encodeURIComponent(nextWord.word.toLowerCase())}`,
        );
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevWord, nextWord, router]);

  // Web Speech API with rate control
  const speak = useCallback((text: string, rate = 0.9) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = rate;
    window.speechSynthesis.speak(utterance);
  }, []);

  const handleSpeakSentence = (text: string, index: number) => {
    setPlayingSentenceIdx(index);
    speak(text, 0.85);
    setTimeout(() => setPlayingSentenceIdx(null), 2500);
  };

  const handleShare = async () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${word.word} - Zero English`,
          text: `${word.word} (${word.wordType.join(", ")}) - ${word.meaningBn.join(", ")}`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success(t("লিংক কপি করা হয়েছে", "Link copied to clipboard"));
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // User cancelled or clipboard denied
    }
  };

  const primaryMeaning = word.meaningBn.filter((m) => m && m !== "...");

  // Generate 3 multiple choice options for the interactive Quick Self-Check
  const quizOptions = useMemo(() => {
    const correct =
      primaryMeaning.slice(0, 2).join(", ") || word.definitionBn || "সঠিক অর্থ";
    const distractors: string[] = [];

    for (const rw of relatedWords) {
      const rwMeanings = rw.meaningBn.filter((m) => m && m !== "...");
      if (rwMeanings.length > 0) {
        const text = rwMeanings.slice(0, 2).join(", ");
        if (text !== correct && !distractors.includes(text)) {
          distractors.push(text);
        }
      }
      if (distractors.length >= 2) break;
    }

    if (distractors.length < 1) distractors.push("বিপরীত বা অন্য দিক নির্দেশক");
    if (distractors.length < 2)
      distractors.push("পূর্বে বা অতীতে ঘটে যাওয়া কোনো ঘটনা");

    const all = [
      { text: correct, isCorrect: true },
      { text: distractors[0], isCorrect: false },
      { text: distractors[1], isCorrect: false },
    ];

    const seed = word.id % 3;
    if (seed === 1) return [all[1], all[0], all[2]];
    if (seed === 2) return [all[2], all[1], all[0]];
    return all;
  }, [word, primaryMeaning, relatedWords]);

  const handleQuizAnswer = (index: number) => {
    setSelectedQuizOption(index);
    setQuizSubmitted(true);
    if (quizOptions[index].isCorrect) {
      toast.success(t("চমৎকার! সঠিক উত্তর!", "Correct! Great job!"));
    }
  };

  const resetQuiz = () => {
    setSelectedQuizOption(null);
    setQuizSubmitted(false);
  };

  // Helper to highlight the target word inside example sentences
  const renderHighlightedSentence = (sentence: string, targetWord: string) => {
    if (!sentence || !targetWord) return sentence;
    const escaped = targetWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b(${escaped})\\b`, "gi");
    const parts = sentence.split(regex);

    return parts.map((part, i) =>
      part.toLowerCase() === targetWord.toLowerCase() ? (
        <span
          key={i}
          className="rounded-md bg-amber-500/15 px-1.5 py-0.5 font-bold text-[#242423] ring-1 ring-amber-500/30 dark:bg-amber-400/20 dark:text-amber-200 dark:ring-amber-400/30"
        >
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  // Pastel styles for related words cards
  const pastelStyles = [
    "bg-[#ecf7f1] dark:bg-[#12281d] border-emerald-500/10",
    "bg-[#f3f0fb] dark:bg-[#211a33] border-purple-500/10",
    "bg-[#faf4ee] dark:bg-[#2b2219] border-amber-500/10",
    "bg-[#f0f5f1] dark:bg-[#1c2820] border-teal-500/10",
    "bg-[#eef5fa] dark:bg-[#162432] border-blue-500/10",
    "bg-[#f9f1f5] dark:bg-[#2d1b26] border-rose-500/10",
  ];

  return (
    <div className="relative min-h-dvh bg-[#f8f8f6] px-3 py-4 transition-colors duration-200 dark:bg-[#0c0c0e] sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-4 sm:space-y-6">
        {/* Navigation & Breadcrumb Header with Quick Prev/Next Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-[12px] sm:text-[13px] text-[#242423]/60 dark:text-zinc-400">
            <Link
              href={`/vocabulary/${word.level.toLowerCase()}`}
              className="rounded-full bg-white px-2.5 py-1 font-mono font-bold text-[#242423] ring-1 ring-black/5 hover:bg-[#f1f1ef] active:scale-95 transition-all dark:bg-[#1c1c1e] dark:ring-white/[0.08] dark:text-[#f3f3f2]"
            >
              {word.level}
            </Link>
            <span className="text-[#242423]/30 dark:text-zinc-600">/</span>
            <span className="font-semibold text-[#242423] dark:text-[#f3f3f2]">
              {word.word}
            </span>
          </div>

          {/* Header Controls: Share & Compact Prev/Next Switcher */}
          <div className="flex items-center gap-2">
            {/* Quick Prev / Next Navigator Pills */}
            <div className="flex items-center gap-1 rounded-full bg-white p-0.5 ring-1 ring-black/5 dark:bg-[#1c1c1e] dark:ring-white/[0.08]">
              {prevWord ? (
                <Link
                  href={`/vocabulary/${encodeURIComponent(prevWord.word.toLowerCase())}`}
                  className="inline-flex size-7 items-center justify-center rounded-full text-[#242423] hover:bg-[#f1f1ef] active:scale-90 transition-all dark:text-[#f3f3f2] dark:hover:bg-[#252528]"
                  title={`Previous word: ${prevWord.word}`}
                >
                  <ChevronLeft className="size-4" />
                </Link>
              ) : (
                <span className="inline-flex size-7 items-center justify-center rounded-full text-[#242423]/25 dark:text-zinc-600 cursor-not-allowed">
                  <ChevronLeft className="size-4" />
                </span>
              )}

              <span className="text-[11px] font-mono text-[#242423]/40 dark:text-zinc-500 px-1">
                #{word.id}
              </span>

              {nextWord ? (
                <Link
                  href={`/vocabulary/${encodeURIComponent(nextWord.word.toLowerCase())}`}
                  className="inline-flex size-7 items-center justify-center rounded-full text-[#242423] hover:bg-[#f1f1ef] active:scale-90 transition-all dark:text-[#f3f3f2] dark:hover:bg-[#252528]"
                  title={`Next word: ${nextWord.word}`}
                >
                  <ChevronRight className="size-4" />
                </Link>
              ) : (
                <span className="inline-flex size-7 items-center justify-center rounded-full text-[#242423]/25 dark:text-zinc-600 cursor-not-allowed">
                  <ChevronRight className="size-4" />
                </span>
              )}
            </div>

            {/* Guide Replay & Share Buttons */}
            <TourReplayButton onReplay={startTour} />

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[12px] font-medium text-[#242423] ring-1 ring-black/5 hover:bg-[#f1f1ef] active:scale-95 transition-all dark:bg-[#1c1c1e] dark:ring-white/[0.08] dark:text-[#f3f3f2]"
              title="Share this word"
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-emerald-600" />
                  <span>{t("কপি হয়েছে", "Copied")}</span>
                </>
              ) : (
                <>
                  <Share2 className="size-3.5 text-[#242423]/60 dark:text-zinc-400" />
                  <span>{t("শেয়ার", "Share")}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* =========================================================================
            CARD 1: MASTER VOCABULARY FLASHCARD (Word, Sound, Meaning, Active Recall)
           ========================================================================= */}
        <div className="rounded-[28px] border border-black/[0.06] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03),0_24px_48px_-12px_rgba(0,0,0,0.06)] dark:border-white/[0.08] dark:bg-[#1c1c1e] sm:rounded-[32px] sm:p-7">
          {/* Top Pill Badges & Toggle Controls Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.05] pb-4 dark:border-white/[0.06]">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {/* CEFR Level Pill */}
              <Link
                href={`/vocabulary/${word.level.toLowerCase()}`}
                className="inline-flex items-center rounded-full bg-[#242423]/[0.06] px-3 py-1 font-mono text-[12px] font-bold tracking-tight text-[#242423] transition-all hover:bg-[#242423]/[0.1] active:scale-95 dark:bg-white/[0.08] dark:text-[#f3f3f2]"
              >
                CEFR {word.level}
              </Link>

              {/* Word Type / Part of Speech Pills */}
              {word.wordType.map((wt) => (
                <span
                  key={wt}
                  className="rounded-full bg-[#242423]/[0.04] px-3 py-1 text-[11.5px] font-medium text-[#242423]/70 dark:bg-white/[0.06] dark:text-zinc-300"
                >
                  {wt}
                </span>
              ))}

              {/* Category Pill */}
              {word.category && (
                <span className="rounded-full bg-amber-500/10 px-3 py-1 text-[11px] font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
                  {word.category.replace(/([a-z])([A-Z])/g, "$1 $2")}
                </span>
              )}
            </div>

            {/* Quick Toggle Controls (Bookmark & Learned) */}
            {loaded && (
              <div data-tour="word-actions" className="flex items-center gap-2">
                <button
                  onClick={() => toggleBookmark(word.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium transition-all active:scale-95",
                    bookmarked
                      ? "bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/30 dark:bg-amber-500/20 dark:text-amber-400"
                      : "bg-[#242423]/[0.04] text-[#242423]/70 ring-1 ring-black/5 hover:bg-[#242423]/[0.07] dark:bg-white/[0.06] dark:ring-white/10 dark:text-zinc-300",
                  )}
                  title={bookmarked ? "Bookmarked" : "Bookmark this word"}
                >
                  {bookmarked ? (
                    <BookmarkCheck className="size-3.5 fill-amber-500 text-amber-500" />
                  ) : (
                    <Bookmark className="size-3.5" />
                  )}
                  <span>
                    {bookmarked
                      ? t("বুকমার্কড", "Saved")
                      : t("সংরক্ষণ", "Save")}
                  </span>
                </button>

                <button
                  onClick={() => toggleLearned(word.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium transition-all active:scale-95",
                    learned
                      ? "bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-300"
                      : "bg-[#242423]/[0.04] text-[#242423]/70 ring-1 ring-black/5 hover:bg-[#242423]/[0.07] dark:bg-white/[0.06] dark:ring-white/10 dark:text-zinc-300",
                  )}
                  title={learned ? "Learned" : "Mark as learned"}
                >
                  {learned ? (
                    <CheckCircle2 className="size-3.5 fill-emerald-500 text-white dark:fill-emerald-400 dark:text-[#1c1c1e]" />
                  ) : (
                    <Circle className="size-3.5" />
                  )}
                  <span>
                    {learned ? t("শেখা শেষ", "Learned") : t("শিখুন", "Mark")}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Word Heading & Dual-Speed Audio Pronunciation Bar */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#242423] dark:text-[#f3f3f2] sm:text-4xl md:text-5xl">
                {word.word}
              </h1>
              <p className="mt-1 text-[13px] font-medium text-[#242423]/50 dark:text-zinc-400">
                {word.wordType.join(", ")} · {word.level} Core Vocabulary
              </p>
            </div>

            {/* Audio Buttons: Normal Speed & Slow Speed for Learners */}
            <div data-tour="word-audio" className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => speak(word.word, 0.9)}
                className="group flex cursor-pointer items-center gap-2 rounded-full bg-[#242423] px-4 py-2 text-[13px] font-semibold text-white shadow-xs transition-all duration-150 hover:bg-black active:scale-95 dark:bg-white dark:text-[#242423] dark:hover:bg-zinc-100"
                title="Normal pronunciation"
              >
                <Volume2 className="size-4 transition-transform group-hover:scale-110" />
                <span>{t("উচ্চারণ", "Pronounce")}</span>
              </button>

              <button
                type="button"
                onClick={() => speak(word.word, 0.65)}
                className="flex cursor-pointer items-center gap-1.5 rounded-full bg-[#242423]/[0.06] px-3 py-2 text-[12px] font-medium text-[#242423] transition-all duration-150 hover:bg-[#242423]/[0.1] active:scale-95 dark:bg-white/[0.08] dark:text-[#f3f3f2]"
                title="Slow pronunciation for clarity"
              >
                <Turtle className="size-3.5 text-[#242423]/60 dark:text-zinc-400" />
                <span>{t("ধীরগতি", "Slow")}</span>
              </button>
            </div>
          </div>

          {/* Bengali Meaning Module with Active Recall / Flashcard Self-Test */}
          <div
            data-tour="active-recall"
            onClick={() => {
              if (activeRecallHidden) setActiveRecallHidden(false);
            }}
            className={cn(
              "mt-6 rounded-[22px] bg-[#f1f1ef] p-4 dark:bg-[#252528] sm:p-5 transition-all duration-200",
              activeRecallHidden &&
                "cursor-pointer hover:bg-[#ecece9] dark:hover:bg-[#28282c]",
            )}
          >
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#242423]/55 dark:text-zinc-400">
                <Languages className="size-3.5" />
                <span>{t("বাংলা অর্থ", "Bengali Meaning")}</span>
              </p>

              {/* Active Recall Flip Toggle */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveRecallHidden(!activeRecallHidden);
                }}
                className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-[#242423]/60 hover:text-[#242423] dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                {activeRecallHidden ? (
                  <>
                    <Eye className="size-3.5" />
                    <span>{t("অর্থ দেখুন", "Reveal Meaning")}</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="size-3.5" />
                    <span>{t("লুকিয়ে রাখুন", "Hide Meaning")}</span>
                  </>
                )}
              </button>
            </div>

            {/* Meaning Chips / Blurred State for Active Recall */}
            <div
              className={cn(
                "relative mt-2.5 transition-all duration-200",
                activeRecallHidden && "select-none",
              )}
            >
              <div
                className={cn(
                  "flex flex-wrap items-center gap-2 transition-all duration-200",
                  activeRecallHidden && "blur-md opacity-25",
                )}
              >
                {primaryMeaning.length > 0 ? (
                  primaryMeaning.map((meaning, i) => (
                    <span
                      key={i}
                      className="rounded-[14px] bg-white px-3.5 py-1.5 text-base font-bold text-[#242423] shadow-xs dark:bg-[#1c1c1e] dark:text-[#f3f3f2] sm:text-xl"
                    >
                      {meaning}
                    </span>
                  ))
                ) : (
                  <span className="text-base font-semibold text-[#242423]/70 dark:text-zinc-300">
                    {word.definitionBn || "অর্থ উপলব্ধ নেই"}
                  </span>
                )}
              </div>

              {/* Reveal Overlay Hint */}
              {activeRecallHidden && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#242423] px-3.5 py-1 text-[12px] font-semibold text-white shadow-xs dark:bg-white dark:text-[#242423] transition-transform hover:scale-105">
                    <Eye className="size-3.5" />
                    <span>
                      {t("অর্থ দেখতে ট্যাপ করুন", "Tap to Reveal Meaning")}
                    </span>
                  </span>
                </div>
              )}
            </div>

            {/* Secondary Bengali Explanation */}
            {word.definitionBn && word.definitionBn !== word.definitionEn && (
              <p
                className={cn(
                  "mt-3 border-t border-black/[0.05] pt-2 text-[13px] leading-relaxed text-[#242423]/75 dark:border-white/[0.05] dark:text-zinc-300 transition-all",
                  activeRecallHidden && "blur-sm select-none opacity-20",
                )}
              >
                {word.definitionBn}
              </p>
            )}
          </div>

          {/* English Definition & Explanation */}
          <div className="mt-5 space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#242423]/45 dark:text-zinc-500">
              {t("সংজ্ঞা ও বিবরণ", "Definition & Explanation")}
            </p>
            <p className="text-[15px] font-medium leading-relaxed text-[#242423]/90 dark:text-zinc-200 sm:text-[17px]">
              {word.definitionEn}
            </p>
          </div>
        </div>

        {/* =========================================================================
            CARD 2: REAL-WORLD EXAMPLE SENTENCES (Auditory & Context Learning)
           ========================================================================= */}
        {((word.examplesEn && word.examplesEn.length > 0) ||
          (word.examples_bn && word.examples_bn.length > 0)) && (
          <div className="rounded-[28px] border border-black/[0.06] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03),0_24px_48px_-12px_rgba(0,0,0,0.06)] dark:border-white/[0.08] dark:bg-[#1c1c1e] sm:rounded-[32px] sm:p-7">
            <div className="flex items-center justify-between border-b border-black/[0.05] pb-3.5 dark:border-white/[0.06]">
              <div>
                <h2 className="text-[16px] font-bold tracking-tight text-[#242423] dark:text-[#f3f3f2]">
                  {t("ব্যবহারিক উদাহরণসমূহ", "Real-World Examples")}
                </h2>
                <p className="text-[12px] text-[#242423]/55 dark:text-zinc-400">
                  {t(
                    "বাক্যে ব্যবহারের ধরন শুনুন ও শিখুন",
                    "Listen to natural sentence flow & context",
                  )}
                </p>
              </div>
              <span className="rounded-full bg-[#242423]/[0.05] px-2.5 py-0.5 text-[11px] font-semibold text-[#242423]/60 dark:bg-white/[0.06] dark:text-zinc-400">
                {Math.max(
                  word.examplesEn?.length ?? 0,
                  word.examples_bn?.length ?? 0,
                )}{" "}
                {t("উদাহরণ", "Sentences")}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {Array.from({
                length: Math.max(
                  word.examplesEn?.length ?? 0,
                  word.examples_bn?.length ?? 0,
                ),
              }).map((_, i) => {
                const en = word.examplesEn?.[i];
                const bn = word.examples_bn?.[i];
                const isPlaying = playingSentenceIdx === i;

                return (
                  <div
                    key={i}
                    className="group relative rounded-[20px] bg-[#f1f1ef] p-4 transition-all duration-150 hover:bg-[#eaeae8] dark:bg-[#252528] dark:hover:bg-[#2c2c30] sm:p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        {/* English Sentence with Keyword Highlight */}
                        {en && (
                          <p className="text-[14.5px] font-medium leading-relaxed text-[#242423] dark:text-[#f3f3f2] sm:text-[16px]">
                            &ldquo;{renderHighlightedSentence(en, word.word)}
                            &rdquo;
                          </p>
                        )}

                        {/* Bengali Translation */}
                        {bn && (
                          <p className="mt-2 text-[12.5px] font-medium leading-relaxed text-[#242423]/65 dark:text-zinc-400 sm:text-[13.5px]">
                            {bn}
                          </p>
                        )}
                      </div>

                      {/* Individual Audio Button for Sentence */}
                      {en && (
                        <button
                          type="button"
                          onClick={() => handleSpeakSentence(en, i)}
                          className={cn(
                            "grid size-9 shrink-0 cursor-pointer place-items-center rounded-full transition-all duration-150 active:scale-95 sm:size-10",
                            isPlaying
                              ? "bg-emerald-500 text-white shadow-xs"
                              : "bg-white text-[#242423] shadow-xs hover:scale-105 dark:bg-[#1c1c1e] dark:text-[#f3f3f2]",
                          )}
                          title="Listen to this example sentence"
                        >
                          <Volume2 className="size-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            CARD 3: INTERACTIVE QUICK SELF-CHECK (Gamified Active Recall Widget)
           ========================================================================= */}
        <div data-tour="quick-quiz" className="rounded-[28px] border border-black/[0.06] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03),0_24px_48px_-12px_rgba(0,0,0,0.06)] dark:border-white/[0.08] dark:bg-[#1c1c1e] sm:rounded-[32px] sm:p-7">
          <div className="flex items-center justify-between border-b border-black/[0.05] pb-3.5 dark:border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-full bg-amber-500/10 text-amber-600 dark:bg-amber-400/15 dark:text-amber-400">
                <Zap className="size-4" />
              </span>
              <div>
                <h2 className="text-[15px] font-bold tracking-tight text-[#242423] dark:text-[#f3f3f2] sm:text-[16px]">
                  {t("দ্রুত যাচাই (Quick Check)", "Quick Self-Check")}
                </h2>
                <p className="text-[11.5px] text-[#242423]/55 dark:text-zinc-400">
                  {t(
                    "নিচের বিকল্পগুলো থেকে সঠিক অর্থটি চিহ্নিত করুন",
                    "Test your immediate recall of this word",
                  )}
                </p>
              </div>
            </div>

            {quizSubmitted && (
              <button
                type="button"
                onClick={resetQuiz}
                className="flex items-center gap-1 text-[11px] font-semibold text-[#242423]/60 hover:text-[#242423] dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <RotateCcw className="size-3" />
                <span>{t("আবার চেষ্টা", "Retry")}</span>
              </button>
            )}
          </div>

          <div className="mt-4">
            <p className="text-[13.5px] font-semibold text-[#242423] dark:text-[#f3f3f2]">
              {t("ইংরেজি শব্দ", "The word")}{" "}
              <span className="font-extrabold underline decoration-amber-400 decoration-2">
                &ldquo;{word.word}&rdquo;
              </span>{" "}
              {t("এর বাংলা অর্থ কোনটি?", "means which of the following?")}
            </p>

            {/* Multiple Choice Option Buttons */}
            <div className="mt-3 grid gap-2">
              {quizOptions.map((opt, idx) => {
                const isSelected = selectedQuizOption === idx;
                let optionStyle =
                  "bg-[#f1f1ef] hover:bg-[#eaeae8] text-[#242423] dark:bg-[#252528] dark:hover:bg-[#2d2d32] dark:text-[#f3f3f2]";

                if (quizSubmitted) {
                  if (opt.isCorrect) {
                    optionStyle =
                      "bg-emerald-500/15 text-emerald-800 ring-2 ring-emerald-500/50 dark:bg-emerald-500/20 dark:text-emerald-300";
                  } else if (isSelected && !opt.isCorrect) {
                    optionStyle =
                      "bg-rose-500/15 text-rose-800 ring-2 ring-rose-500/50 dark:bg-rose-500/20 dark:text-rose-300";
                  } else {
                    optionStyle = "opacity-40 bg-[#f1f1ef] dark:bg-[#252528]";
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={quizSubmitted}
                    onClick={() => handleQuizAnswer(idx)}
                    className={cn(
                      "flex items-center justify-between rounded-[16px] p-3 text-left transition-all duration-150 active:scale-[0.99] cursor-pointer sm:p-3.5",
                      optionStyle,
                    )}
                  >
                    <span className="text-[13.5px] font-medium sm:text-[14.5px]">
                      {opt.text}
                    </span>

                    {quizSubmitted && opt.isCorrect && (
                      <CheckCheck className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quiz Outcome Feedback Banner */}
            {quizSubmitted && (
              <div className="mt-3 flex items-center justify-between rounded-[16px] bg-black/[0.03] p-3 dark:bg-white/[0.04]">
                <p className="text-[12px] font-semibold text-[#242423] dark:text-[#f3f3f2]">
                  {quizOptions[selectedQuizOption ?? 0]?.isCorrect
                    ? t(
                        "সঠিক উত্তর! শব্দটি মনে রাখার জন্য ধন্যবাদ।",
                        "Correct! You've mastered this meaning.",
                      )
                    : t(
                        "ভুল হয়েছে, সঠিক অর্থটি সবুজ রঙে চিহ্নিত করা হয়েছে।",
                        "Not quite, the correct meaning is highlighted in green.",
                      )}
                </p>
                <Link
                  href="/quiz/vocabulary"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline dark:text-emerald-400"
                >
                  <span>{t("পূর্ণাঙ্গ কুইজ", "Full Quiz")}</span>
                  <ArrowUpRight className="size-3" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            CARD 4: SYNONYMS & ANTONYMS (Interactive Vocabulary Expander)
           ========================================================================= */}
        {(word.synonyms?.length > 0 || word.antonyms?.length > 0) && (
          <div className="rounded-[28px] border border-black/[0.06] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03),0_24px_48px_-12px_rgba(0,0,0,0.06)] dark:border-white/[0.08] dark:bg-[#1c1c1e] sm:rounded-[32px] sm:p-7">
            <h2 className="text-[16px] font-bold tracking-tight text-[#242423] dark:text-[#f3f3f2]">
              {t("সম্পর্কিত শব্দসমূহ", "Word Connections")}
            </h2>
            <p className="text-[12px] text-[#242423]/55 dark:text-zinc-400">
              {t(
                "সমার্থক ও বিপরীত শব্দ জেনে শব্দভাণ্ডার সমৃদ্ধ করুন",
                "Broaden your vocabulary with synonyms and antonyms",
              )}
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {/* Synonyms Column */}
              {word.synonyms?.length > 0 && (
                <div className="rounded-[20px] bg-emerald-500/[0.05] p-4 dark:bg-emerald-500/[0.08]">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    {t("সমার্থক শব্দ (Synonyms)", "Synonyms")}
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5 sm:gap-2">
                    {word.synonyms.map((syn) => (
                      <Link
                        key={syn}
                        href={`/vocabulary/${encodeURIComponent(syn.toLowerCase())}`}
                        className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[12px] font-medium text-emerald-700 shadow-2xs transition-all hover:bg-emerald-50 active:scale-95 dark:bg-[#1c1c1e] dark:text-emerald-300 dark:hover:bg-[#252528]"
                      >
                        <span>{syn}</span>
                        <ArrowUpRight className="size-2.5 opacity-60" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Antonyms Column */}
              {word.antonyms?.length > 0 && (
                <div className="rounded-[20px] bg-rose-500/[0.05] p-4 dark:bg-rose-500/[0.08]">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                    {t("বিপরীত শব্দ (Antonyms)", "Antonyms")}
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5 sm:gap-2">
                    {word.antonyms.map((ant) => (
                      <Link
                        key={ant}
                        href={`/vocabulary/${encodeURIComponent(ant.toLowerCase())}`}
                        className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[12px] font-medium text-rose-700 shadow-2xs transition-all hover:bg-rose-50 active:scale-95 dark:bg-[#1c1c1e] dark:text-rose-300 dark:hover:bg-[#252528]"
                      >
                        <span>{ant}</span>
                        <ArrowUpRight className="size-2.5 opacity-60" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            CARD 5: SEQUENTIAL DATABASE ID PAGINATION (Previous & Next Word Cards)
           ========================================================================= */}
        <div className="rounded-[28px] border border-black/[0.06] bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03),0_24px_48px_-12px_rgba(0,0,0,0.06)] dark:border-white/[0.08] dark:bg-[#1c1c1e] sm:rounded-[32px] sm:p-6">
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.05] dark:border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#242423]/45 dark:text-zinc-400">
                {t("ধারাবাহিক শব্দভাণ্ডার", "Database Sequence")}
              </span>
              <span className="rounded-full bg-[#242423]/[0.05] px-2 py-0.5 text-[11px] font-mono font-bold text-[#242423] dark:bg-white/[0.06] dark:text-[#f3f3f2]">
                Word #{word.id}
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-[#242423]/40 dark:text-zinc-500">
              <span>{t("শর্টকাট:", "Shortcuts:")}</span>
              <kbd className="rounded bg-[#242423]/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-[#242423] dark:bg-white/[0.08] dark:text-zinc-300">
                ←
              </kbd>
              <kbd className="rounded bg-[#242423]/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-[#242423] dark:bg-white/[0.08] dark:text-zinc-300">
                →
              </kbd>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {/* Previous Word Card */}
            {prevWord ? (
              <Link
                href={`/vocabulary/${encodeURIComponent(prevWord.word.toLowerCase())}`}
                className="group flex items-center justify-between rounded-[20px] bg-[#f1f1ef] p-3.5 transition-all duration-150 hover:bg-[#eaeae8] active:scale-[0.985] dark:bg-[#252528] dark:hover:bg-[#2c2c30] sm:p-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-[#242423] shadow-2xs transition-transform duration-150 group-hover:-translate-x-0.5 dark:bg-[#1c1c1e] dark:text-[#f3f3f2]">
                    <ArrowLeft className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-[11px] font-medium text-[#242423]/50 dark:text-zinc-400">
                      <span>{t("পূর্ববর্তী", "Previous")}</span>
                      <span className="font-mono text-[10px]">
                        #{prevWord.id}
                      </span>
                      <span>·</span>
                      <span className="font-mono font-bold text-[#242423]/70 dark:text-zinc-300">
                        {prevWord.level}
                      </span>
                    </p>
                    <p className="truncate text-[15px] font-bold text-[#242423] dark:text-[#f3f3f2]">
                      {prevWord.word}
                    </p>
                    <p className="truncate text-[11.5px] font-medium text-[#242423]/60 dark:text-zinc-400">
                      {prevWord.meaningBn
                        .filter((m) => m && m !== "...")
                        .join(", ") || "অর্থ দেখুন"}
                    </p>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="flex items-center gap-3 rounded-[20px] bg-[#f1f1ef]/50 p-3.5 opacity-50 dark:bg-[#252528]/50 sm:p-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/50 text-[#242423]/40 dark:bg-[#1c1c1e]/50 dark:text-zinc-600">
                  <ArrowLeft className="size-4" />
                </span>
                <div>
                  <p className="text-[11px] font-medium text-[#242423]/40 dark:text-zinc-500">
                    {t("শব্দ তালিকার শুরু", "Start of word bank")}
                  </p>
                  <p className="text-[13px] font-semibold text-[#242423]/50 dark:text-zinc-500">
                    {t("পূর্ববর্তী শব্দ নেই", "No previous word")}
                  </p>
                </div>
              </div>
            )}

            {/* Next Word Card */}
            {nextWord ? (
              <Link
                href={`/vocabulary/${encodeURIComponent(nextWord.word.toLowerCase())}`}
                className="group flex items-center justify-between rounded-[20px] bg-[#f1f1ef] p-3.5 transition-all duration-150 hover:bg-[#eaeae8] active:scale-[0.985] dark:bg-[#252528] dark:hover:bg-[#2c2c30] sm:p-4 text-right"
              >
                <div className="flex items-center justify-end gap-3 min-w-0 w-full">
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center justify-end gap-1.5 text-[11px] font-medium text-[#242423]/50 dark:text-zinc-400">
                      <span className="font-mono font-bold text-[#242423]/70 dark:text-zinc-300">
                        {nextWord.level}
                      </span>
                      <span>·</span>
                      <span className="font-mono text-[10px]">
                        #{nextWord.id}
                      </span>
                      <span>{t("পরবর্তী", "Next")}</span>
                    </p>
                    <p className="truncate text-[15px] font-bold text-[#242423] dark:text-[#f3f3f2]">
                      {nextWord.word}
                    </p>
                    <p className="truncate text-[11.5px] font-medium text-[#242423]/60 dark:text-zinc-400">
                      {nextWord.meaningBn
                        .filter((m) => m && m !== "...")
                        .join(", ") || "অর্থ দেখুন"}
                    </p>
                  </div>
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-[#242423] shadow-2xs transition-transform duration-150 group-hover:translate-x-0.5 dark:bg-[#1c1c1e] dark:text-[#f3f3f2]">
                    <ArrowRight className="size-4" />
                  </span>
                </div>
              </Link>
            ) : (
              <div className="flex items-center justify-end gap-3 rounded-[20px] bg-[#f1f1ef]/50 p-3.5 opacity-50 dark:bg-[#252528]/50 sm:p-4 text-right">
                <div>
                  <p className="text-[11px] font-medium text-[#242423]/40 dark:text-zinc-500">
                    {t("শব্দ তালিকার সমাপ্তি", "End of word bank")}
                  </p>
                  <p className="text-[13px] font-semibold text-[#242423]/50 dark:text-zinc-500">
                    {t("পরবর্তী শব্দ নেই", "No next word")}
                  </p>
                </div>
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/50 text-[#242423]/40 dark:bg-[#1c1c1e]/50 dark:text-zinc-600">
                  <ArrowRight className="size-4" />
                </span>
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            CARD 6: PRACTICE TOOLBAR & JUMP BACK IN GRID
           ========================================================================= */}
        <div className="rounded-[28px] border border-black/[0.06] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_12px_32px_-12px_rgba(0,0,0,0.06)] dark:border-white/[0.08] dark:bg-[#1c1c1e] sm:rounded-[32px] sm:p-7">
          {/* Quick Practice Toolbar */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <Link
              href="/quiz/vocabulary"
              className="group flex h-[72px] cursor-pointer flex-col justify-between rounded-[18px] bg-[#f1f1ef] p-3 text-left outline-none transition-all duration-150 hover:bg-[#eaeae8] active:scale-[0.97] dark:bg-[#252528] dark:hover:bg-[#2e2e33] sm:h-[78px]"
            >
              <div className="flex items-start justify-between">
                <BookOpenCheck className="size-4.5 text-[#242423]/70 transition-colors group-hover:text-[#242423] dark:text-zinc-400 dark:group-hover:text-zinc-100" />
                <ArrowUpRight className="size-3 text-[#242423]/40 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 dark:text-zinc-500" />
              </div>
              <span className="truncate text-[12px] font-semibold text-[#242423] dark:text-[#f3f3f2]">
                {t("কুইজ টেস্ট", "Quiz Test")}
              </span>
            </Link>

            <button
              type="button"
              onClick={() => toggleLearned(word.id)}
              className="group flex h-[72px] cursor-pointer flex-col justify-between rounded-[18px] bg-[#f1f1ef] p-3 text-left outline-none transition-all duration-150 hover:bg-[#eaeae8] active:scale-[0.97] dark:bg-[#252528] dark:hover:bg-[#2e2e33] sm:h-[78px]"
            >
              <div className="flex items-start justify-between">
                {learned ? (
                  <CheckCircle2 className="size-4.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Circle className="size-4.5 text-[#242423]/70 dark:text-zinc-400" />
                )}
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  {learned ? "✓" : "+"}
                </span>
              </div>
              <span className="truncate text-[12px] font-semibold text-[#242423] dark:text-[#f3f3f2]">
                {learned
                  ? t("শেখা শেষ", "Learned")
                  : t("শেখা মার্ক", "Mark Learned")}
              </span>
            </button>

            <Link
              href={`/vocabulary/${word.level.toLowerCase()}`}
              className="group flex h-[72px] cursor-pointer flex-col justify-between rounded-[18px] bg-[#f1f1ef] p-3 text-left outline-none transition-all duration-150 hover:bg-[#eaeae8] active:scale-[0.97] dark:bg-[#252528] dark:hover:bg-[#2e2e33] sm:h-[78px]"
            >
              <div className="flex items-start justify-between">
                <Sparkles className="size-4.5 text-[#242423]/70 transition-colors group-hover:text-[#242423] dark:text-zinc-400 dark:group-hover:text-zinc-100" />
                <ArrowUpRight className="size-3 text-[#242423]/40 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 dark:text-zinc-500" />
              </div>
              <span className="truncate text-[12px] font-semibold text-[#242423] dark:text-[#f3f3f2]">
                {t(`লেভেল ${word.level}`, `Level ${word.level}`)}
              </span>
            </Link>
          </div>

          {/* Jump Back In / Related Words Exploration Grid */}
          {relatedWords.length > 0 && (
            <div className="mt-6 border-t border-black/[0.05] pt-5 dark:border-white/[0.06]">
              <div className="flex items-center justify-between pb-3">
                <div>
                  <p className="text-[12px] font-medium text-[#242423]/45 dark:text-zinc-400">
                    {t("পরবর্তী শব্দ শিখুন", "Jump back in")}
                  </p>
                  <h2 className="text-[16px] font-bold tracking-tight text-[#242423] dark:text-[#f3f3f2]">
                    {t(
                      `আরও ${word.level} শব্দসমূহ`,
                      `More ${word.level} Vocabulary`,
                    )}
                  </h2>
                </div>
                <Link
                  href={`/vocabulary/${word.level.toLowerCase()}`}
                  className="text-[12px] font-semibold text-[#242423] hover:underline dark:text-zinc-200"
                >
                  {t("সবগুলো দেখুন →", "View all →")}
                </Link>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3">
                {relatedWords.map((rw, index) => {
                  const pastelClass = pastelStyles[index % pastelStyles.length];
                  const meaning =
                    rw.meaningBn.filter((m) => m && m !== "...").join(", ") ||
                    rw.definitionEn;

                  return (
                    <Link
                      key={rw.id}
                      href={`/vocabulary/${encodeURIComponent(rw.word.toLowerCase())}`}
                      className={cn(
                        "group relative flex min-h-[76px] flex-col justify-between rounded-[20px] border p-3.5 transition-all duration-150 hover:shadow-xs active:scale-[0.985]",
                        pastelClass,
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <span className="grid size-8 shrink-0 place-items-center rounded-[10px] bg-white font-mono text-[13px] font-bold text-[#242423] shadow-xs dark:bg-[#252528] dark:text-[#f3f3f2]">
                          {rw.word.charAt(0).toUpperCase()}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-medium text-[#242423]/50 dark:text-zinc-400">
                          <span>{rw.wordType[0] || rw.level}</span>
                          <ArrowUpRight className="size-3 text-[#242423]/40 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 dark:text-zinc-500" />
                        </span>
                      </div>

                      <div className="mt-2 min-w-0">
                        <p className="truncate text-[14px] font-bold text-[#242423] dark:text-[#f3f3f2]">
                          {rw.word}
                        </p>
                        <p className="truncate text-[11.5px] font-medium text-[#242423]/60 dark:text-zinc-400">
                          {meaning}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <GuidedTour
        config={WORD_DETAIL_TOUR}
        isOpen={isTourOpen}
        currentStepIndex={tourStepIndex}
        onNext={tourNext}
        onPrev={tourPrev}
        onClose={closeTour}
      />
    </div>
  );
}
