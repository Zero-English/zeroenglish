"use client";

import React, { useState } from "react";
import Link from "next/link";
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
  PenTool,
  Bookmark,
  Pin,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Clock,
  FileText,
  Compass,
  ArrowUpRight,
  Check,
  X,
  Volume2,
  CheckSquare,
  Square,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/components/language-provider";
import { LatestPostsHome, type LatestPost } from "@/components/news/latest-posts-home";
import type { LeaderboardRow } from "@/components/leaderboard";
import { isLevelLive, VALID_LEVELS } from "@/lib/level-copy";
import type { LevelStatItem } from "@/components/home-or-dashboard";
import { LenisProvider } from "@/components/lenis-provider";
import {
  ScrollReveal,
  SketchHighlight,
  WashiTape,
  DoodleUnderline,
  DoodleArrow,
  DoodleStar,
  DoodlePaperClip,
  DoodleSparkle,
} from "@/components/scroll-reveal";

const LEVEL_CONFIG: Record<
  string,
  {
    bg: string;
    darkBg: string;
    border: string;
    text: string;
    highlight: "yellow" | "orange" | "emerald" | "cyan" | "rose";
    tapeColor: "amber" | "neutral" | "orange" | "rose";
    label: string;
    labelBn: string;
    sectionTag: string;
    solid: string;
    rotation: string;
    sampleWords: string[];
  }
> = {
  A1: {
    bg: "bg-[#f4fbf7]",
    darkBg: "dark:bg-emerald-950/25",
    border: "border-emerald-300/80 dark:border-emerald-700/60",
    text: "text-emerald-700 dark:text-emerald-300",
    highlight: "emerald",
    tapeColor: "neutral",
    label: "Beginner",
    labelBn: "শিক্ষানবিস",
    sectionTag: "NOTE #01",
    solid: "bg-emerald-500",
    rotation: "-rotate-[0.8deg]",
    sampleWords: ["water", "family", "simple"],
  },
  A2: {
    bg: "bg-[#f0f9ff]",
    darkBg: "dark:bg-sky-950/25",
    border: "border-sky-300/80 dark:border-sky-700/60",
    text: "text-sky-700 dark:text-sky-300",
    highlight: "cyan",
    tapeColor: "amber",
    label: "Elementary",
    labelBn: "প্রাথমিক",
    sectionTag: "NOTE #02",
    solid: "bg-sky-500",
    rotation: "rotate-[1deg]",
    sampleWords: ["journey", "decide", "nature"],
  },
  B1: {
    bg: "bg-[#fffdf0]",
    darkBg: "dark:bg-amber-950/25",
    border: "border-amber-300/80 dark:border-amber-700/60",
    text: "text-amber-800 dark:text-amber-300",
    highlight: "yellow",
    tapeColor: "amber",
    label: "Intermediate",
    labelBn: "মাঝারি",
    sectionTag: "NOTE #03",
    solid: "bg-amber-500",
    rotation: "-rotate-[1.2deg]",
    sampleWords: ["achieve", "explore", "balance"],
  },
  B2: {
    bg: "bg-[#fff1f2]",
    darkBg: "dark:bg-rose-950/25",
    border: "border-rose-300/80 dark:border-rose-700/60",
    text: "text-rose-700 dark:text-rose-300",
    highlight: "rose",
    tapeColor: "rose",
    label: "Upper Intermediate",
    labelBn: "উচ্চ-মাঝারি",
    sectionTag: "NOTE #04",
    solid: "bg-rose-500",
    rotation: "rotate-[0.9deg]",
    sampleWords: ["persevere", "resilient", "adapt"],
  },
  C1: {
    bg: "bg-[#faf5ff]",
    darkBg: "dark:bg-purple-950/25",
    border: "border-purple-300/80 dark:border-purple-700/60",
    text: "text-purple-700 dark:text-purple-300",
    highlight: "orange",
    tapeColor: "neutral",
    label: "Advanced",
    labelBn: "উন্নত",
    sectionTag: "NOTE #05",
    solid: "bg-purple-500",
    rotation: "-rotate-[0.7deg]",
    sampleWords: ["eloquent", "ambiguous", "viable"],
  },
  C2: {
    bg: "bg-[#fdf4ff]",
    darkBg: "dark:bg-fuchsia-950/25",
    border: "border-fuchsia-300/80 dark:border-fuchsia-700/60",
    text: "text-fuchsia-700 dark:text-fuchsia-300",
    highlight: "rose",
    tapeColor: "neutral",
    label: "Mastery",
    labelBn: "পারদর্শী",
    sectionTag: "NOTE #06",
    solid: "bg-fuchsia-500",
    rotation: "rotate-[1.4deg]",
    sampleWords: ["ephemeral", "ubiquitous", "paradigm"],
  },
};

const fmt = (n: number) => n.toLocaleString("en-US");

const FEATURES = [
  {
    href: "/vocabulary",
    icon: LibraryBig,
    num: "01",
    tag: "VOCABULARY",
    titleEn: "Word lists & Flashnotes",
    titleBn: "শব্দতালিকা ও ফ্ল্যাশ-নোট",
    descriptionEn: "5,000+ Oxford words, grouped by CEFR level and topic with pronunciation and examples.",
    descriptionBn: "সব শব্দ CEFR লেভেল ও বিষয় অনুযায়ী সাজানো। যা জানেন আর যা শিখছেন তা আলাদা চিহ্নিত করুন।",
    markerColor: "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-300/60",
  },
  {
    href: "/grammar",
    icon: BookMarked,
    num: "02",
    tag: "GRAMMAR",
    titleEn: "Rules & Formula Guides",
    titleBn: "গ্রামার রুলস ও নির্দেশিকা",
    descriptionEn: "Structured rules for Parts of Speech, Tenses, Articles, sentence mechanics & common mistakes.",
    descriptionBn: "পার্টস অব স্পিচ, টেন্স, আর্টিকেল ও বাক্যের নিখুঁত গঠন। বাস্তব উদাহরণ ও ভুলের সহজ ব্যাখ্যা।",
    markerColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300/60",
  },
  {
    href: "/quiz",
    icon: BookOpenCheck,
    num: "03",
    tag: "TEST LAB",
    titleEn: "Interactive Quizzes",
    titleBn: "প্রশ্নোত্তর ও কুইজ",
    descriptionEn: "Vocabulary and grammar questions with instant feedback, an explanation for every answer, and saved scores.",
    descriptionBn: "শব্দভাণ্ডার ও ব্যাকরণের প্রশ্ন, সঙ্গে সঙ্গে ফলাফল ও প্রতিটি উত্তরের বিস্তারিত ব্যাখ্যা।",
    markerColor: "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-300/60",
  },
  {
    href: "/search",
    icon: Search,
    num: "04",
    tag: "SEARCH",
    titleEn: "Smart Dictionary",
    titleBn: "স্মার্ট ডিকশনারি সার্চ",
    descriptionEn: "Look up any word and read its Bangla meaning, definition, sentence examples and synonyms.",
    descriptionBn: "যেকোনো ইংরেজি শব্দ খুঁজে বাংলা অর্থ, সংজ্ঞা, উদাহরণ ও সমার্থক শব্দ একসঙ্গে দেখুন।",
    markerColor: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300/60",
  },
];

const QUIZ_MODES = [
  {
    href: "/quiz/vocabulary",
    icon: Languages,
    tag: "VOCAB PRACTICE",
    titleEn: "Vocabulary Practice",
    titleBn: "শব্দভাণ্ডার অনুশীলন",
    descriptionEn: "Test your word knowledge across all levels with multiple choice.",
    descriptionBn: "সব লেভেলের শব্দ জ্ঞান যাচাই করুন।",
    cardBg: "hover:border-sky-400 dark:hover:border-sky-500",
    badgeColor: "bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-300/70",
  },
  {
    href: "/quiz/grammar",
    icon: BookMarked,
    tag: "GRAMMAR DRILL",
    titleEn: "Grammar Quizzes",
    titleBn: "গ্রামার কুইজ",
    descriptionEn: "Tenses, prepositions, articles and rule-based challenges.",
    descriptionBn: "টেন্স, প্রিপজিশন, আর্টিকেল ও বাক্য গঠন।",
    cardBg: "hover:border-emerald-400 dark:hover:border-emerald-500",
    badgeColor: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300/70",
  },
  {
    href: "/quiz/class",
    icon: GraduationCap,
    tag: "ACADEMIC & JOB",
    titleEn: "Class Based Quizzes",
    titleBn: "শ্রেণি ভিত্তিক কুইজ",
    descriptionEn: "SSC, HSC, IELTS, BCS and university entrance exams.",
    descriptionBn: "SSC, HSC, IELTS, BCS ও বিশ্ববিদ্যালয় ভর্তি।",
    cardBg: "hover:border-amber-400 dark:hover:border-amber-500",
    badgeColor: "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300/70",
  },
  {
    href: "/quiz/exam",
    icon: ClipboardList,
    tag: "TIMED CHALLENGE",
    titleEn: "Scheduled Exams",
    titleBn: "নির্ধারিত পরীক্ষা",
    descriptionEn: "Weekly and biweekly timed exams with real ranking scores.",
    descriptionBn: "সাপ্তাহিক ও দ্বি-সাপ্তাহিক সময়ভিত্তিক পরীক্ষা।",
    cardBg: "hover:border-purple-400 dark:hover:border-purple-500",
    badgeColor: "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-300/70",
  },
];

// Sample vocabulary flashcards for interactive study desk
const SAMPLE_NOTES = [
  {
    word: "Persevere",
    ipa: "/ˌpɜː.sɪˈvɪər/",
    pos: "verb",
    level: "B2",
    meaningBn: "অধ্যবসায় করা / হাল না ছেড়ে চেষ্টা চালিয়ে যাওয়া",
    example: "She persevered in her studies until she achieved fluency.",
  },
  {
    word: "Resilient",
    ipa: "/rɪˈzɪl.jənt/",
    pos: "adjective",
    level: "B2",
    meaningBn: "স্থিতিস্থাপক / প্রতিকূলতা পেরিয়ে ঘুরে দাঁড়ানোর ক্ষমতা সম্পন্ন",
    example: "Children are often remarkably resilient in challenging times.",
  },
  {
    word: "Eloquent",
    ipa: "/ˈel.ə.kwənt/",
    pos: "adjective",
    level: "C1",
    meaningBn: "বাকপটু / সুন্দর ও প্রাঞ্জল ভাষায় মনের ভাব প্রকাশের দক্ষ",
    example: "His eloquent speech inspired the entire classroom.",
  },
  {
    word: "Meticulous",
    ipa: "/məˈtɪk.jə.ləs/",
    pos: "adjective",
    level: "C1",
    meaningBn: "খুঁতখুঁতে / প্রতিটি ছোট বিষয়ে অত্যন্ত সতর্ক ও নিখুঁত",
    example: "He kept meticulous notes during every grammar lecture.",
  },
];

// Sample grammar rules for interactive study desk
const SAMPLE_GRAMMAR_RULES = [
  {
    topic: "Subject-Verb Agreement",
    topicBn: "Subject-Verb মিলকরণ নিয়ম",
    tag: "RULE #01",
    ruleEn: "Singular subjects take singular verbs; plural subjects take plural verbs.",
    ruleBn: "Subject একবচন (Third Person Singular) হলে Verb-এর শেষে s/es যুক্ত হয়।",
    formula: "He / She / It + Verb(s/es)  vs  I / We / They + Base Verb",
    tokens: [
      { text: "He", role: "3rd Person Sing." },
      { text: "goes", role: "Verb + es" },
      { text: "to office", role: "Prep. Phrase" },
      { text: "daily", role: "Adverbial" },
    ],
    incorrect: "He go to office every day.",
    correct: "He goes to office every day.",
    whyBn: "He হলো Third Person Singular, তাই go এর পরিবর্তে goes হবে।",
    link: "/grammar/parts-of-speech",
  },
  {
    topic: "Present Perfect vs Past Simple",
    topicBn: "Present Perfect বনাম Past Simple",
    tag: "RULE #02",
    ruleEn: "Use Past Simple with finished past time; use Present Perfect for past actions with current impact.",
    ruleBn: "অতীতের নির্দিষ্ট সময় (yesterday, last year) উল্লেখ থাকলে Past Simple হয়।",
    formula: "Subject + have/has + V3  vs  Subject + V2 (Past)",
    tokens: [
      { text: "I", role: "Subject" },
      { text: "saw", role: "Past Simple (V2)" },
      { text: "him", role: "Object" },
      { text: "yesterday", role: "Past Time" },
    ],
    incorrect: "I have seen him yesterday.",
    correct: "I saw him yesterday.",
    whyBn: "'Yesterday' অতীত সময় নির্দেশ করে, তাই Past Indefinite (saw) বসবে।",
    link: "/grammar",
  },
  {
    topic: "Prepositions of Time: In, On, At",
    topicBn: "সময় নির্দেশক প্রিপজিশন (In, On, At)",
    tag: "RULE #03",
    ruleEn: "At for clock times; On for days and dates; In for months, years, and seasons.",
    ruleBn: "নির্দিষ্ট ঘড়ির সময়ে At; দিন ও নির্দিষ্ট তারিখে On; মাস ও বছরে In বসে।",
    formula: "At 5:00 PM • On Sunday / 15th Aug • In October / 2026",
    tokens: [
      { text: "The meeting starts", role: "Clause" },
      { text: "on Monday", role: "Day = On" },
      { text: "in the morning", role: "Period = In" },
    ],
    incorrect: "The exam starts in Monday at the morning.",
    correct: "The exam starts on Monday in the morning.",
    whyBn: "বারের নামের আগে সর্বদা On এবং 'in the morning' নির্দিষ্ট প্রিপজিশনাল ফ্রেজ।",
    link: "/grammar",
  },
];

// Grammar Sections Showcase
const GRAMMAR_SHOWCASE = [
  {
    href: "/grammar/parts-of-speech",
    icon: Layers,
    titleEn: "Parts of Speech",
    titleBn: "পদ প্রকরণ (৮ প্রকার পদ)",
    tag: "CORE 01",
    badge: "৮টি ক্যাটাগরি",
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300",
    descriptionEn: "Master the 8 core word classes: Noun, Pronoun, Verb, Adjective, Adverb, Preposition, Conjunction & Interjection.",
    descriptionBn: "বাক্যের মূল উপাদান ৮ প্রকার পদ: Noun, Pronoun, Verb, Adjective ইত্যাদির বিস্তারিত নিয়ম ও বাস্তব উদাহরণ।",
    topics: ["Noun (বিশেষ্য)", "Pronoun (সর্বনাম)", "Verb (ক্রিয়া)", "Adjective (বিশেষণ)", "Preposition"],
    cardBg: "bg-[#f4fbf7] dark:bg-emerald-950/20 border-emerald-300/80 dark:border-emerald-800/60",
    tapeColor: "neutral" as const,
    rotation: "-rotate-[0.8deg]",
  },
  {
    href: "/grammar",
    icon: Clock,
    titleEn: "Tenses & Timeline",
    titleBn: "টেন্স ও সময়রেখা (১২টি টেন্স)",
    tag: "CORE 02",
    badge: "১২টি টেন্স",
    badgeColor: "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-300",
    descriptionEn: "Complete formula breakdown of all 12 tenses with visual timeline analogies and real-life Bengali translations.",
    descriptionBn: "১২টি টেন্সের সহজ ফর্মুলা, টাইমলাইন ও বাস্তব জীবনে কীভাবে নিখুঁতভাবে বাক্য তৈরি করবেন তার সহজ গাইড।",
    topics: ["Present Simple", "Past Continuous", "Present Perfect", "Future Continuous"],
    cardBg: "bg-[#f0f9ff] dark:bg-sky-950/20 border-sky-300/80 dark:border-sky-800/60",
    tapeColor: "amber" as const,
    rotation: "rotate-[0.9deg]",
  },
  {
    href: "/grammar",
    icon: BookOpenCheck,
    titleEn: "Articles & Determiners",
    titleBn: "আর্টিকেল ও ডিটারমাইনার",
    tag: "CORE 03",
    badge: "A / An / The",
    badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300",
    descriptionEn: "Master exact rules for A, An, The, along with countable/uncountable rules and common trap exceptions.",
    descriptionBn: "A, An, The ব্যবহারের অকাট্য নিয়ম, বিভিন্ন ব্যতিক্রম ও ভর্তি পরীক্ষায় আসা ট্রিকি প্রশ্ন সমাধান।",
    topics: ["Definite Article", "Indefinite Article", "Zero Article", "Quantifiers"],
    cardBg: "bg-[#fffdf0] dark:bg-amber-950/20 border-amber-300/80 dark:border-amber-800/60",
    tapeColor: "amber" as const,
    rotation: "-rotate-[1deg]",
  },
  {
    href: "/grammar",
    icon: FileText,
    titleEn: "Sentence Structure & Mistakes",
    titleBn: "বাক্যের গঠন ও সাধারণ ভুল",
    tag: "CORE 04",
    badge: "কমন মিসটেকস",
    badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300",
    descriptionEn: "Simple, Compound, Complex structures, Subject-Verb agreement, and 50+ common Bengali speaker mistakes.",
    descriptionBn: "Subject-Verb Agreement, ক্লজ ও ফ্রেজ গঠন এবং বাঙালি শিক্ষার্থীদের সচরাচর হওয়া ভুলের সমাধান।",
    topics: ["Subject-Verb Agreement", "Simple, Compound, Complex", "Common Errors"],
    cardBg: "bg-[#faf5ff] dark:bg-purple-950/20 border-purple-300/80 dark:border-purple-800/60",
    tapeColor: "rose" as const,
    rotation: "rotate-[1.1deg]",
  },
];

export function HomeContent({
  levelStats,
  posts,
  leaderboard,
}: {
  levelStats: LevelStatItem[];
  posts: LatestPost[];
  leaderboard: LeaderboardRow[];
}) {
  const { learnedIds, loaded } = useLearnedWords();
  const t = useT();
  const [activeWordIdx, setActiveWordIdx] = useState(0);
  const [activeRuleIdx, setActiveRuleIdx] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [dailyGoals, setDailyGoals] = useState({
    vocab: true,
    grammar: true,
    quiz: false,
  });

  const countMap = new Map(levelStats.map((s) => [s.level.toUpperCase(), s.count]));
  const totalWords = levelStats.reduce((sum, s) => sum + s.count, 0);

  const displayStats = VALID_LEVELS.map((level) => {
    const total = countMap.get(level) ?? 0;
    return { level, label: LEVEL_CONFIG[level].label, total, learned: 0 };
  });

  const totalLearned = learnedIds.size;
  const overallPct = totalWords > 0 ? Math.round((totalLearned / totalWords) * 100) : 0;
  const liveLevelCount = displayStats.filter((s) => isLevelLive(s.total)).length;

  const currentSample = SAMPLE_NOTES[activeWordIdx];
  const currentRule = SAMPLE_GRAMMAR_RULES[activeRuleIdx];

  const handleNextSample = () => {
    setActiveWordIdx((prev) => (prev + 1) % SAMPLE_NOTES.length);
  };

  const handleNextRule = () => {
    setActiveRuleIdx((prev) => (prev + 1) % SAMPLE_GRAMMAR_RULES.length);
  };

  const playWordAudio = (word: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = "en-US";
        utterance.rate = 0.88;
        setIsPlayingAudio(true);
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
      } catch {
        setIsPlayingAudio(false);
      }
    }
  };

  const toggleDailyGoal = (key: "vocab" | "grammar" | "quiz") => {
    setDailyGoals((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <LenisProvider>
      <div className="relative min-h-dvh overflow-x-hidden sketch-grid-paper selection:bg-amber-300 selection:text-zinc-950">
        {/* Tactile notebook paper texture overlays */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10 bg-radial from-amber-50/40 via-transparent to-zinc-200/20 dark:from-zinc-900/50 dark:via-zinc-950/80 dark:to-black"
        />

        <div className="relative px-3 sm:px-6 lg:px-8 pt-8 pb-20 max-w-6xl xl:max-w-7xl mx-auto">
          {/* Main Content Container */}
          <div className="relative">
            {/* HERO SECTION */}
            <section className="relative pt-6 sm:pt-10 pb-12">
              {/* Header Badges: Stamp & Edition style */}
              <ScrollReveal direction="down" duration={0.5} className="mb-6">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm border border-dashed border-amber-600/60 dark:border-amber-400/60 bg-amber-50/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-mono text-xs uppercase tracking-wider stamp-badge shadow-xs">
                    <PenTool className="size-3.5 text-orange-600 dark:text-orange-400" />
                    <span>ZERO ENGLISH // NOTEBOOK ED.</span>
                  </div>

                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-mono text-zinc-600 dark:text-zinc-400">
                    <DoodleStar className="text-amber-500" />
                    <span>
                      {t(
                        `${fmt(totalWords)}টি শব্দ + ব্যাকরণ নিয়ম`,
                        `${fmt(totalWords)} Words & Grammar Rules`
                      )}
                    </span>
                  </div>

                  <div className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-sm bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-mono text-emerald-700 dark:text-emerald-300">
                    <DoodleSparkle className="text-emerald-500" />
                    <span>100% FREE • NO LOGIN REQUIRED</span>
                  </div>
                </div>
              </ScrollReveal>

              {/* Main Headline with Sketch Highlights */}
              <ScrollReveal direction="up" delay={0.1} duration={0.6}>
                <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-[50px] xl:text-[56px] font-black tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.2] sm:leading-[1.18] mb-4">
                  <span>
                    {t("ইংরেজি শব্দ ও গ্রামার শিখুন,", "Learn English words & grammar,")}
                  </span>
                  <br />
                  <SketchHighlight color="yellow" className="inline-block mt-1 sm:mt-2">
                    {t("সহজ বাংলা ব্যাখ্যায়।", "with clear Bangla explanations.")}
                  </SketchHighlight>
                </h1>

                <DoodleUnderline className="text-orange-500 dark:text-orange-400 max-w-xs sm:max-w-sm md:max-w-md -mt-1 mb-6 opacity-80" />
              </ScrollReveal>

              {/* Subtitle / Notebook Memo */}
              <ScrollReveal direction="up" delay={0.2} duration={0.6}>
                <div className="relative max-w-2xl bg-white/85 dark:bg-zinc-900/85 backdrop-blur-sm border border-zinc-200/90 dark:border-zinc-800 p-4 sm:p-5 rounded-2xl paper-shadow mb-8 sketch-border-sm">
                  <p className="text-base sm:text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {t(
                      `অক্সফোর্ড ৩০০০ ও ৫০০০ তালিকা থেকে বাছাই করা ${fmt(totalWords)}টি ইংরেজি শব্দ এবং পার্টস অব স্পিচ, টেন্স ও সেন্টেন্স স্ট্রাকচারের সম্পূর্ণ ব্যাকরণ নিয়মাবলী। প্রতিটি এন্ট্রিতে বাংলা অর্থ, খাঁটি উদাহরণ ও সাধারণ ভুলের সমাধান।`,
                      `${fmt(totalWords)} graded Oxford words plus comprehensive English grammar lessons (Parts of Speech, Tenses, Sentence Mechanics). Every lesson includes Bangla meanings, real-world examples, and common error corrections.`
                    )}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs font-mono text-zinc-400 border-t border-dashed border-zinc-200 dark:border-zinc-800 pt-2.5">
                    <span className="flex items-center gap-1.5">
                      <Bookmark className="size-3.5 text-amber-500" />
                      <span>{t("বিনামূল্যে শিখুন — সাইনআপ অপশনাল", "Free to learn — account optional")}</span>
                    </span>
                    <span className="text-zinc-400">VOCAB A1-C1 • GRAMMAR • QUIZZES</span>
                  </div>
                </div>
              </ScrollReveal>

              {/* CTA Action Buttons */}
              <ScrollReveal direction="up" delay={0.25} duration={0.6}>
                <div className="mb-10">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-3.5">
                    {/* Primary Button: Vocabulary Explorer */}
                    <Link
                      href="/vocabulary"
                      className="group relative inline-flex items-center justify-between sm:justify-center gap-3 h-12 px-6 rounded-xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 text-white font-semibold text-sm shadow-[0_8px_20px_-4px_rgba(234,88,12,0.38)] hover:shadow-[0_12px_24px_-4px_rgba(234,88,12,0.48)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 border border-orange-400/40 overflow-hidden"
                    >
                      {/* Subtle top specular sheen */}
                      <div className="absolute inset-x-0 top-0 h-[1px] bg-white/35 pointer-events-none" />

                      <div className="flex items-center gap-2.5">
                        <span className="flex size-6 items-center justify-center rounded-md bg-white/20 text-white shrink-0">
                          <LibraryBig className="size-3.5" />
                        </span>
                        <span>{t("শব্দতালিকা দেখুন", "Explore Word Lists")}</span>
                      </div>

                      <span className="flex size-6 items-center justify-center rounded-full bg-white/15 text-white/90 group-hover:bg-white group-hover:text-orange-600 transition-colors">
                        <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </Link>

                    {/* Secondary Button: Grammar Lessons */}
                    <Link
                      href="/grammar"
                      className="group relative inline-flex items-center justify-between sm:justify-center gap-3 h-12 px-6 rounded-xl bg-white/90 dark:bg-zinc-900/90 hover:bg-white dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold text-sm border-2 border-zinc-200/90 dark:border-zinc-800 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="flex size-6 items-center justify-center rounded-md bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 shrink-0">
                          <BookMarked className="size-3.5" />
                        </span>
                        <span>{t("গ্রামার রুলস পড়ুন", "Grammar Lessons")}</span>
                      </div>

                      <span className="flex size-6 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                        <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </Link>

                    {/* Tertiary Button: Practice Quizzes */}
                    <Link
                      href="/quiz"
                      className="group inline-flex items-center justify-center gap-2 h-12 px-4 rounded-xl text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white font-medium text-sm hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-all duration-200"
                    >
                      <BookOpenCheck className="size-4 text-orange-600 dark:text-orange-400" />
                      <span>{t("অনুশীলনী কুইজ", "Practice Quiz")}</span>
                      <ArrowRight className="size-3.5 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  </div>

                  {/* Micro-trust indicator line */}
                  <div className="mt-3.5 flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="size-3.5 text-emerald-500" />
                      <span>{t("অ্যাকাউন্ট ছাড়াই শেখা যায়", "No sign-up required to start")}</span>
                    </span>
                    <span className="text-zinc-300 dark:text-zinc-700">•</span>
                    <span>{t("১০০% ফ্রি ও উন্মুক্ত", "100% Free & Open")}</span>
                  </div>
                </div>
              </ScrollReveal>

              {/* REDESIGNED HERO BOTTOM AREA: THE STUDY DESK */}
              <div className="space-y-4">
                {/* 1. Quick Technical Stationery Index Bar */}
                <ScrollReveal direction="up" delay={0.3}>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 rounded-xl bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 paper-shadow flex items-center gap-2.5">
                      <div className="size-8 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center shrink-0">
                        <LibraryBig className="size-4" />
                      </div>
                      <div>
                        <div className="text-base font-black text-zinc-900 dark:text-zinc-100 leading-none">
                          {fmt(totalWords)}
                        </div>
                        <div className="text-[11px] font-mono text-zinc-500 mt-0.5">
                          {t("ইংরেজি শব্দ", "Oxford Words")}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 paper-shadow flex items-center gap-2.5">
                      <div className="size-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
                        <BookMarked className="size-4" />
                      </div>
                      <div>
                        <div className="text-base font-black text-zinc-900 dark:text-zinc-100 leading-none">
                          <span>৮ পদ • ১২ টেন্স</span>
                        </div>
                        <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                          {t("গ্রামার রুলস", "Grammar Rules")}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 paper-shadow flex items-center gap-2.5">
                      <div className="size-8 rounded-lg bg-sky-100 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center shrink-0">
                        <Layers className="size-4" />
                      </div>
                      <div>
                        <div className="text-base font-black text-zinc-900 dark:text-zinc-100 leading-none">
                          {liveLevelCount} লেভেলস
                        </div>
                        <div className="text-[11px] font-mono text-zinc-500 mt-0.5">
                          {t("CEFR A1 থেকে C1", "CEFR A1 to C1")}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 paper-shadow flex items-center gap-2.5">
                      <div className="size-8 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center shrink-0">
                        <TrendingUp className="size-4" />
                      </div>
                      <div>
                        <div className="text-base font-black text-purple-600 dark:text-purple-400 leading-none">
                          {loaded ? `${overallPct}%` : "· · ·"}
                        </div>
                        <div className="text-[11px] font-mono text-zinc-500 mt-0.5">
                          {t("আপনার অগ্রগতি", "Study Progress")}
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>

                {/* 2. DUAL INTERACTIVE STUDY DESK: Vocabulary Flashnote + Grammar Formula Note */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch pt-2">
                  {/* Left Note: Vocabulary Flashcard with Native Pronunciation Audio */}
                  <ScrollReveal
                    direction="up"
                    delay={0.35}
                    className="relative bg-[#fffdf0] dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-700/60 p-5 rounded-2xl sticky-shadow paper-dogear rotate-[-0.6deg] hover:rotate-0 transition-transform duration-300 group flex flex-col justify-between"
                  >
                    <WashiTape color="amber" />
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-dashed border-amber-300/70 dark:border-amber-700/60 text-xs font-mono text-amber-800 dark:text-amber-300">
                        <span className="flex items-center gap-1.5 font-bold">
                          <Pin className="size-3.5 text-amber-600" />
                          <span>{t("ভোকাবুলারি নোট", "VOCABULARY FLASHNOTE")}</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-sm bg-amber-200 dark:bg-amber-900 font-bold text-amber-900 dark:text-amber-100">
                          {currentSample.level}
                        </span>
                      </div>

                      <div className="mt-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                              {currentSample.word}
                            </h4>
                            {/* Interactive Audio Pronunciation Button */}
                            <button
                              onClick={() => playWordAudio(currentSample.word)}
                              type="button"
                              title="উচ্চারণ শুনুন (Listen to pronunciation)"
                              className={cn(
                                "size-7 rounded-full flex items-center justify-center transition-all cursor-pointer border",
                                isPlayingAudio
                                  ? "bg-orange-500 text-white border-orange-600 scale-110 animate-pulse shadow-sm"
                                  : "bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 border-amber-300/80 hover:bg-orange-500 hover:text-white hover:border-orange-500"
                              )}
                            >
                              <Volume2 className="size-3.5" />
                            </button>
                          </div>
                          <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 uppercase">
                            {currentSample.pos}
                          </span>
                        </div>

                        <div className="text-xs font-mono text-amber-700 dark:text-amber-400 mt-0.5">
                          {currentSample.ipa}
                        </div>

                        <p className="mt-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                          {currentSample.meaningBn}
                        </p>

                        <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400 italic">
                          "{currentSample.example}"
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-dashed border-amber-300/60 dark:border-amber-700/50 flex items-center justify-between">
                      <button
                        onClick={handleNextSample}
                        className="text-xs font-mono font-semibold text-amber-900 dark:text-amber-200 hover:text-orange-600 dark:hover:text-orange-400 flex items-center gap-1 cursor-pointer transition-colors"
                        type="button"
                      >
                        <span>{t("অন্য শব্দ দেখুন ↻", "Next sample note ↻")}</span>
                      </button>

                      <Link
                        href="/vocabulary"
                        className="text-xs font-mono font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-0.5"
                      >
                        <span>{t("শব্দতালিকা খুলুন", "Explore Words")}</span>
                        <ArrowRight className="size-3" />
                      </Link>
                    </div>
                  </ScrollReveal>

                  {/* Right Note: Grammar Rule Formula & Sentence Anatomy */}
                  <ScrollReveal
                    direction="up"
                    delay={0.4}
                    className="relative bg-[#f4fbf7] dark:bg-emerald-950/30 border-2 border-emerald-300 dark:border-emerald-700/60 p-5 rounded-2xl sticky-shadow paper-dogear rotate-[0.7deg] hover:rotate-0 transition-transform duration-300 group flex flex-col justify-between"
                  >
                    <WashiTape color="neutral" />
                    <DoodlePaperClip className="absolute -top-3.5 left-5 text-zinc-400/80 dark:text-zinc-500 z-30 drop-shadow-xs rotate-[6deg]" />

                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-dashed border-emerald-300/70 dark:border-emerald-700/60 text-xs font-mono text-emerald-800 dark:text-emerald-300 pl-4 sm:pl-0">
                        <span className="flex items-center gap-1.5 font-bold">
                          <Lightbulb className="size-3.5 text-emerald-600" />
                          <span>{t("গ্রামার গোল্ডেন রুল", "GRAMMAR GOLDEN RULE")}</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-sm bg-emerald-200 dark:bg-emerald-900 font-bold text-emerald-900 dark:text-emerald-100">
                          {currentRule.tag}
                        </span>
                      </div>

                      <div className="mt-3">
                        <div className="flex items-baseline justify-between">
                          <h4 className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                            {t(currentRule.topicBn, currentRule.topic)}
                          </h4>
                          <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                            FORMULA
                          </span>
                        </div>

                        {/* Formula strip */}
                        <div className="mt-1 px-2.5 py-1 rounded-sm bg-emerald-100/70 dark:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 text-xs font-mono font-semibold text-emerald-900 dark:text-emerald-200">
                          {currentRule.formula}
                        </div>

                        {/* Interactive Sentence Anatomy Chips */}
                        <div className="mt-2.5">
                          <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
                            <span>SENTENCE ANATOMY:</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {currentRule.tokens.map((token, tIdx) => (
                              <div
                                key={tIdx}
                                className="group/tok relative px-2 py-0.5 rounded-sm bg-white dark:bg-zinc-800/90 border border-emerald-300/80 dark:border-emerald-800 text-xs font-mono text-zinc-800 dark:text-zinc-200 hover:border-emerald-500 transition-colors cursor-default"
                              >
                                <span className="font-semibold text-emerald-800 dark:text-emerald-300">{token.text}</span>
                                <span className="text-[9px] text-zinc-400 dark:text-zinc-500 block leading-none mt-0.5">
                                  {token.role}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Common Mistake Comparison */}
                        <div className="mt-2.5 space-y-1 text-xs">
                          <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-mono">
                            <X className="size-3.5 shrink-0 stroke-[2.5]" />
                            <span className="line-through">{currentRule.incorrect}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-mono font-bold">
                            <Check className="size-3.5 shrink-0 stroke-[2.5]" />
                            <span>{currentRule.correct}</span>
                          </div>
                        </div>

                        <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400 leading-tight">
                          💡 <span className="font-medium text-zinc-800 dark:text-zinc-200">{currentRule.whyBn}</span>
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-dashed border-emerald-300/60 dark:border-emerald-700/50 flex items-center justify-between">
                      <button
                        onClick={handleNextRule}
                        className="text-xs font-mono font-semibold text-emerald-900 dark:text-emerald-200 hover:text-emerald-600 flex items-center gap-1 cursor-pointer transition-colors"
                        type="button"
                      >
                        <span>{t("অন্য রুল দেখুন ↻", "Next grammar tip ↻")}</span>
                      </button>

                      <Link
                        href={currentRule.link}
                        className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                      >
                        <span>{t("সব গ্রামার রুলস", "All Grammar Rules")}</span>
                        <ArrowRight className="size-3" />
                      </Link>
                    </div>
                  </ScrollReveal>
                </div>

                {/* 3. MINI STUDY HABIT MEMO (Interactive Daily Checklist Widget) */}
                <ScrollReveal direction="up" delay={0.45}>
                  <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-dashed border-zinc-300 dark:border-zinc-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                    <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                      <span className="flex size-6 items-center justify-center rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                        <Bookmark className="size-3.5" />
                      </span>
                      <span className="font-bold">{t("আজকের স্টাডি রুটিন:", "DAILY STUDY ROUTINE:")}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <button
                        onClick={() => toggleDailyGoal("vocab")}
                        type="button"
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer",
                          dailyGoals.vocab
                            ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 text-emerald-800 dark:text-emerald-300 font-semibold"
                            : "bg-white/80 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500"
                        )}
                      >
                        {dailyGoals.vocab ? (
                          <CheckSquare className="size-3.5 text-emerald-600" />
                        ) : (
                          <Square className="size-3.5 text-zinc-400" />
                        )}
                        <span>{t("১০টি নতুন শব্দ", "10 New Words")}</span>
                      </button>

                      <button
                        onClick={() => toggleDailyGoal("grammar")}
                        type="button"
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer",
                          dailyGoals.grammar
                            ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 text-emerald-800 dark:text-emerald-300 font-semibold"
                            : "bg-white/80 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500"
                        )}
                      >
                        {dailyGoals.grammar ? (
                          <CheckSquare className="size-3.5 text-emerald-600" />
                        ) : (
                          <Square className="size-3.5 text-zinc-400" />
                        )}
                        <span>{t("১টি গ্রামার রুল", "1 Grammar Rule")}</span>
                      </button>

                      <button
                        onClick={() => toggleDailyGoal("quiz")}
                        type="button"
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer",
                          dailyGoals.quiz
                            ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 text-emerald-800 dark:text-emerald-300 font-semibold"
                            : "bg-white/80 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500"
                        )}
                      >
                        {dailyGoals.quiz ? (
                          <CheckSquare className="size-3.5 text-emerald-600" />
                        ) : (
                          <Square className="size-3.5 text-zinc-400" />
                        )}
                        <span>{t("৫ মিনিটের কুইজ", "5-Min Quiz")}</span>
                      </button>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </section>

            {/* CEFR LEVEL CARDS SECTION - "STICKY NOTES" DESIGN WITH SAMPLE WORDS */}
            <section className="py-12 border-t border-dashed border-zinc-200 dark:border-zinc-800 relative">
              <ScrollReveal direction="up" className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-mono text-orange-600 dark:text-orange-400 mb-2">
                      <Bookmark className="size-3.5" />
                      <span>{t("লেভেল অনুযায়ী খাতা", "LEVEL-BY-LEVEL NOTEBOOK")}</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                      {t("CEFR লেভেল অনুযায়ী শব্দতালিকা", "Word Lists by CEFR Level")}
                    </h2>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-xl">
                      {t(
                        "প্রাইমারি A1 থেকে অ্যাডভান্সড C1 পর্যন্ত প্রতিটি লেভেলের শব্দ আলাদা নোটবুকে সাজানো। যা শিখেছেন তা রঙিন করে চিহ্নিত করুন।",
                        "Study progressively from A1 Beginner to C1 Advanced. Open any sticky note to start drilling words."
                      )}
                    </p>
                  </div>

                  <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-zinc-400">
                    <DoodleArrow className="text-amber-500 -scale-y-100" />
                    <span>{t("যেকোনো লেভেলে ক্লিক করুন", "Click card to start")}</span>
                  </div>
                </div>
              </ScrollReveal>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {displayStats.map(({ level, total, learned }, idx) => {
                  const c = LEVEL_CONFIG[level];
                  const inProgress = !isLevelLive(total);
                  const pct = total > 0 ? Math.round((learned / total) * 100) : 0;

                  const cardInner = (
                    <div
                      className={cn(
                        "relative p-5 sm:p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col justify-between min-h-[220px] paper-dogear",
                        c.bg,
                        c.darkBg,
                        c.border,
                        c.rotation,
                        "hover:rotate-0 hover:scale-[1.02] sticky-shadow group"
                      )}
                    >
                      {/* Washi tape topper */}
                      <WashiTape color={c.tapeColor} />

                      {/* Header row: Stamp tag & CEFR code */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-[11px] font-bold tracking-widest text-zinc-400 dark:text-zinc-500">
                            {c.sectionTag}
                          </span>
                          <span
                            className={cn(
                              "text-xs font-bold px-2 py-0.5 rounded-sm border border-dashed",
                              c.text,
                              c.border
                            )}
                          >
                            {t(c.labelBn, c.label)}
                          </span>
                        </div>

                        <div className="flex items-baseline justify-between mt-1">
                          <span className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                            {level}
                          </span>
                          <span className="text-xs font-mono font-medium text-zinc-500 dark:text-zinc-400">
                            {inProgress ? (
                              <span className="text-rose-500 font-bold">
                                {t("খসড়া চলছে", "Drafting")}
                              </span>
                            ) : (
                              `${fmt(total)} words`
                            )}
                          </span>
                        </div>

                        {/* Creative Sample Words Pill Preview */}
                        <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                            {t("নমুনা:", "Ex:")}
                          </span>
                          {c.sampleWords.map((word) => (
                            <span
                              key={word}
                              className="text-[11px] font-mono px-1.5 py-0.5 rounded-xs bg-white/75 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-600 dark:text-zinc-300"
                            >
                              {word}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Progress / Status Bottom Section */}
                      <div className="mt-5 pt-3 border-t border-dashed border-zinc-300/70 dark:border-zinc-700/60">
                        {inProgress ? (
                          <div className="flex items-center justify-between text-xs text-zinc-400">
                            <span className="italic">{t("শীঘ্রই উন্মুক্ত হবে", "Coming soon")}</span>
                            <span className="font-mono text-[10px]">COMING_SOON</span>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center justify-between text-xs font-mono mb-2">
                              <span className="text-zinc-500 dark:text-zinc-400">
                                {loaded
                                  ? t(`${learned}টি মুখস্থ`, `${learned} mastered`)
                                  : t(`${fmt(total)}টি শব্দ`, `${fmt(total)} total`)}
                              </span>
                              <span className={cn("font-bold", c.text)}>
                                {loaded ? `${pct}%` : "0%"}
                              </span>
                            </div>

                            {/* Hand-drawn style progress bar */}
                            <div className="h-2 w-full rounded-full bg-zinc-200/80 dark:bg-zinc-800 overflow-hidden p-0.5 border border-zinc-300/50 dark:border-zinc-700">
                              <div
                                className={cn("h-full rounded-full transition-all duration-700", c.solid)}
                                style={{ width: loaded && pct > 0 ? `${pct}%` : "6%" }}
                              />
                            </div>
                          </>
                        )}
                      </div>

                      {/* Hover Arrow Icon */}
                      {!inProgress && (
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowUpRight className={cn("size-4", c.text)} />
                        </div>
                      )}
                    </div>
                  );

                  return (
                    <ScrollReveal key={level} direction="up" delay={0.06 * idx}>
                      {inProgress ? (
                        <div className="opacity-75 cursor-not-allowed" aria-disabled="true">
                          {cardInner}
                        </div>
                      ) : (
                        <Link href={`/vocabulary/${level.toLowerCase()}`} className="block">
                          {cardInner}
                        </Link>
                      )}
                    </ScrollReveal>
                  );
                })}
              </div>
            </section>

            {/* DEDICATED GRAMMAR WORKBOOK SECTION */}
            <section className="py-12 border-t border-dashed border-zinc-200 dark:border-zinc-800">
              <ScrollReveal direction="up" className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-600 dark:text-emerald-400 mb-2">
                      <BookMarked className="size-3.5" />
                      <span>{t("গ্রামার ওয়ার্কবুক", "GRAMMAR WORKBOOK & LESSONS")}</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                      {t("সহজ বাংলা ব্যাখ্যায় ইংরেজি ব্যাকরণ", "Structured English Grammar Rules")}
                    </h2>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-xl">
                      {t(
                        "পার্টস অব স্পিচ, ১২টি টেন্স, আর্টিকেল ও বাক্যের গঠন—প্রতিটি নিয়মের বাংলা অর্থ, ফর্মুলা ও সাধারণ ভুলের সমাধান।",
                        "Master grammar foundations with rule breakdowns, real sentences, and common mistake explanations."
                      )}
                    </p>
                  </div>

                  <Link
                    href="/grammar"
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    <span>{t("সব গ্রামার লেসন খুলুন", "Explore All Grammar")}</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </ScrollReveal>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {GRAMMAR_SHOWCASE.map(({ href, icon: Icon, titleEn, titleBn, tag, badge, badgeColor, descriptionEn, descriptionBn, topics, cardBg, tapeColor, rotation }, i) => (
                  <ScrollReveal key={titleEn} direction="up" delay={i * 0.08}>
                    <Link
                      href={href}
                      className={cn(
                        "relative block p-5 rounded-2xl border-2 sticky-shadow hover:scale-[1.02] hover:rotate-0 transition-all duration-300 flex flex-col justify-between min-h-[260px] group paper-dogear",
                        cardBg,
                        rotation
                      )}
                    >
                      <WashiTape color={tapeColor} />

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-mono text-[10px] text-zinc-400 font-bold tracking-wider">
                            {tag}
                          </span>
                          <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded-sm border border-dashed", badgeColor)}>
                            {badge}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <div className="size-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                            <Icon className="size-4" />
                          </div>
                          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {t(titleBn, titleEn)}
                          </h3>
                        </div>

                        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                          {t(descriptionBn, descriptionEn)}
                        </p>
                      </div>

                      {/* Topic chips inside the note */}
                      <div className="mt-4 pt-3 border-t border-dashed border-zinc-300/60 dark:border-zinc-700/60">
                        <div className="flex flex-wrap gap-1 mb-2">
                          {topics.slice(0, 3).map((topic) => (
                            <span
                              key={topic}
                              className="text-[10px] font-mono px-1.5 py-0.5 rounded-xs bg-white/80 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                          <span>{t("রুলস পড়ুন", "Read Rules")}</span>
                          <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            </section>

            {/* THREE ESSENTIAL TOOLS / LEDGER SECTION */}
            <section className="py-12 border-t border-dashed border-zinc-200 dark:border-zinc-800">
              <ScrollReveal direction="up" className="mb-6">
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-sky-600 dark:text-sky-400 mb-2">
                  <Compass className="size-3.5" />
                  <span>{t("স্টাডি টুলকিট", "STUDY TOOLKIT")}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                  {t("খুঁজুন, শিখুন ও পরীক্ষা দিন", "Four Core Learning Pillars")}
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  {t("ভোকাবুলারি ও গ্রামার শেখার প্রয়োজনীয় সব টুল এক প্ল্যাটফর্মে।", "Everything needed to master English words and sentence rules.")}
                </p>
              </ScrollReveal>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {FEATURES.map(({ href, icon: Icon, num, tag, titleEn, titleBn, descriptionEn, descriptionBn, markerColor }, i) => (
                  <ScrollReveal key={href} direction="up" delay={i * 0.08}>
                    <Link
                      href={href}
                      className="group relative block p-5 rounded-2xl bg-white/90 dark:bg-zinc-900/90 border-2 border-zinc-200/90 dark:border-zinc-800 paper-shadow hover:border-orange-400 dark:hover:border-orange-500 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[190px]"
                    >
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <div
                            className={cn(
                              "size-10 rounded-xl flex items-center justify-center border",
                              markerColor
                            )}
                          >
                            <Icon className="size-5" />
                          </div>
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-sm bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500">
                            {num} // {tag}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors flex items-center gap-1.5">
                          <span>{t(titleBn, titleEn)}</span>
                        </h3>

                        <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                          {t(descriptionBn, descriptionEn)}
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs font-mono font-semibold text-orange-600 dark:text-orange-400">
                        <span>{t("ব্রাউজ করুন", "Open Tool")}</span>
                        <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            </section>

            {/* QUIZ WORKBOOK SECTION */}
            <section className="py-12 border-t border-dashed border-zinc-200 dark:border-zinc-800">
              <ScrollReveal direction="up" className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-mono text-purple-600 dark:text-purple-400 mb-2">
                    <BookOpenCheck className="size-3.5" />
                    <span>{t("অনুশীলনী ও পরীক্ষা", "TEST YOUR MEMORY")}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                    {t("কুইজে নিজেকে যাচাই করুন", "Four Interactive Quiz Modes")}
                  </h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                    {t("ভোকাবুলারি, ব্যাকরণ, অ্যাকাডেমিক ও নির্ধারিত টাইমড পরীক্ষা।", "Practice with instant feedback and explanations.")}
                  </p>
                </div>

                <Link
                  href="/quiz"
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-orange-600 dark:text-orange-400 hover:underline"
                >
                  <span>{t("সব কুইজ দেখুন", "View All Quizzes")}</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </ScrollReveal>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {QUIZ_MODES.map(({ href, icon: Icon, tag, titleEn, titleBn, descriptionEn, descriptionBn, cardBg, badgeColor }, i) => (
                  <ScrollReveal key={href} direction="up" delay={i * 0.08}>
                    <Link
                      href={href}
                      className={cn(
                        "group block p-5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border-2 border-zinc-200/80 dark:border-zinc-800 paper-shadow hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[200px]"
                        , cardBg
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className={cn("size-10 rounded-xl flex items-center justify-center border", badgeColor)}>
                            <Icon className="size-5" />
                          </div>
                          <span className="font-mono text-[10px] text-zinc-400 tracking-wider">
                            {tag}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                          {t(titleBn, titleEn)}
                        </h3>

                        <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                          {t(descriptionBn, descriptionEn)}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs font-mono font-semibold text-orange-600 dark:text-orange-400">
                        <span>{t("শুরু করুন", "Start Drill")}</span>
                        <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            </section>

            {/* LATEST POSTS / STUDY GAZETTE */}
            <div className="pt-8 pb-4 border-t border-dashed border-zinc-200 dark:border-zinc-800">
              <ScrollReveal direction="up">
                <LatestPostsHome posts={posts} />
              </ScrollReveal>
            </div>
          </div>
        </div>
      </div>
    </LenisProvider>
  );
}