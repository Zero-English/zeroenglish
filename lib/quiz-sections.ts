import type { LucideIcon } from "lucide-react";
import {
  MapPin,
  BookOpenText,
  School,
  UsersRound,
  GraduationCap,
  Languages,
  BookMarked,
  BookOpenCheck,
  Landmark,
  Briefcase,
  ArrowLeftRight,
  Shuffle,
  Layers,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export interface QuizSectionCardStyle {
  gradient: string;
  bg: string;
  border: string;
  text: string;
}

export interface QuizTopic extends QuizSectionCardStyle {
  name: string;
  label: string;
  labelBn: string;
  desc: string;
  descBn: string;
  icon: LucideIcon;
}

export interface QuizClassOption extends QuizSectionCardStyle {
  value: string;
  label: string;
  labelBn: string;
  icon: LucideIcon;
}

const GRAMMAR_STYLE: {
  gradient: string;
  colors: { bg: string; border: string; text: string };
}[] = [
  {
    gradient: "from-amber-500 to-orange-500",
    colors: {
      bg: "bg-amber-50 dark:bg-amber-950/40",
      border: "border-amber-200 dark:border-amber-800",
      text: "text-amber-700 dark:text-amber-300",
    },
  },
  {
    gradient: "from-sky-500 to-blue-500",
    colors: {
      bg: "bg-sky-50 dark:bg-sky-950/40",
      border: "border-sky-200 dark:border-sky-800",
      text: "text-sky-700 dark:text-sky-300",
    },
  },
  {
    gradient: "from-emerald-500 to-teal-500",
    colors: {
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      border: "border-emerald-200 dark:border-emerald-800",
      text: "text-emerald-700 dark:text-emerald-300",
    },
  },
  {
    gradient: "from-violet-500 to-purple-500",
    colors: {
      bg: "bg-violet-50 dark:bg-violet-950/40",
      border: "border-violet-200 dark:border-violet-800",
      text: "text-violet-700 dark:text-violet-300",
    },
  },
  {
    gradient: "from-rose-500 to-pink-500",
    colors: {
      bg: "bg-rose-50 dark:bg-rose-950/40",
      border: "border-rose-200 dark:border-rose-800",
      text: "text-rose-700 dark:text-rose-300",
    },
  },
  {
    gradient: "from-cyan-500 to-sky-500",
    colors: {
      bg: "bg-cyan-50 dark:bg-cyan-950/40",
      border: "border-cyan-200 dark:border-cyan-800",
      text: "text-cyan-700 dark:text-cyan-300",
    },
  },
  {
    gradient: "from-indigo-500 to-violet-500",
    colors: {
      bg: "bg-indigo-50 dark:bg-indigo-950/40",
      border: "border-indigo-200 dark:border-indigo-800",
      text: "text-indigo-700 dark:text-indigo-300",
    },
  },
  {
    gradient: "from-fuchsia-500 to-pink-500",
    colors: {
      bg: "bg-fuchsia-50 dark:bg-fuchsia-950/40",
      border: "border-fuchsia-200 dark:border-fuchsia-800",
      text: "text-fuchsia-700 dark:text-fuchsia-300",
    },
  },
];

function grammarStyle(i: number) {
  return {
    gradient: GRAMMAR_STYLE[i].gradient,
    bg: GRAMMAR_STYLE[i].colors.bg,
    border: GRAMMAR_STYLE[i].colors.border,
    text: GRAMMAR_STYLE[i].colors.text,
  };
}

const QUIZ_TOPIC_DEFS: {
  name: string;
  label: string;
  labelBn: string;
  desc: string;
  descBn: string;
  icon: LucideIcon;
  styleIndex: number;
}[] = [
  {
    name: "ENGLISH_TO_BANGLA",
    label: "English to Bangla",
    labelBn: "ইংরেজি থেকে বাংলা",
    desc: "Pick the correct Bangla meaning.",
    descBn: "সঠিক বাংলা অর্থটি বেছে নিন।",
    icon: Languages,
    styleIndex: 0,
  },
  {
    name: "BANGLA_TO_ENGLISH",
    label: "Bangla to English",
    labelBn: "বাংলা থেকে ইংরেজি",
    desc: "Pick the correct English word.",
    descBn: "সঠিক ইংরেজি শব্দটি বেছে নিন।",
    icon: ArrowLeftRight,
    styleIndex: 1,
  },
  {
    name: "SYNONYMS",
    label: "Synonyms",
    labelBn: "সমার্থক শব্দ",
    desc: "Find the word with the same meaning.",
    descBn: "একই অর্থের শব্দটি খুঁজুন।",
    icon: Shuffle,
    styleIndex: 2,
  },
  {
    name: "ANTONYMS",
    label: "Antonyms",
    labelBn: "বিপরীত শব্দ",
    desc: "Find the word with the opposite meaning.",
    descBn: "বিপরীত অর্থের শব্দটি খুঁজুন।",
    icon: Layers,
    styleIndex: 3,
  },
  {
    name: "MIXED",
    label: "Mixed",
    labelBn: "মিশ্র",
    desc: "A mix of every quiz type in one set.",
    descBn: "সব ধরনের প্রশ্ন একসাথে।",
    icon: Sparkles,
    styleIndex: 4,
  },
  {
    name: "IDIOMS_AND_PHRASES",
    label: "Idioms & Phrases",
    labelBn: "ইডিয়ম ও বাক্যাংশ",
    desc: "Common idioms and everyday phrases.",
    descBn: "প্রচলিত ইডিয়ম ও দৈনন্দিন বাক্যাংশ।",
    icon: BookOpenText,
    styleIndex: 5,
  },
  {
    name: "PREPOSITIONS",
    label: "Prepositions",
    labelBn: "পদান্বয়ী অব্যয়",
    desc: "Learn the right preposition in context.",
    descBn: "প্রসঙ্গ অনুযায়ী সঠিক পদান্বয়ী অব্যয় শিখুন।",
    icon: MapPin,
    styleIndex: 6,
  },
  {
    name: "TRUE_FALSE",
    label: "True / False",
    labelBn: "সত্য / মিথ্যা",
    desc: "Decide whether statements are true or false.",
    descBn: "বাক্যটি সত্য না মিথ্যা — তা সিদ্ধান্ত নিন।",
    icon: CheckCircle2,
    styleIndex: 7,
  },
];

export const QUIZ_TOPIC_META: Record<string, QuizTopic> = Object.fromEntries(
  QUIZ_TOPIC_DEFS.map((t) => [
    t.name,
    {
      name: t.name,
      label: t.label,
      labelBn: t.labelBn,
      desc: t.desc,
      descBn: t.descBn,
      icon: t.icon,
      ...grammarStyle(t.styleIndex),
    },
  ])
);

export const CLASS_PALETTE: QuizSectionCardStyle[] = [
  {
    gradient: "from-amber-500 to-orange-500",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-200 dark:border-amber-800",
    text: "text-amber-700 dark:text-amber-300",
  },
  {
    gradient: "from-sky-500 to-blue-500",
    bg: "bg-sky-50 dark:bg-sky-950/40",
    border: "border-sky-200 dark:border-sky-800",
    text: "text-sky-700 dark:text-sky-300",
  },
  {
    gradient: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  {
    gradient: "from-violet-500 to-purple-500",
    bg: "bg-violet-50 dark:bg-violet-950/40",
    border: "border-violet-200 dark:border-violet-800",
    text: "text-violet-700 dark:text-violet-300",
  },
  {
    gradient: "from-rose-500 to-pink-500",
    bg: "bg-rose-50 dark:bg-rose-950/40",
    border: "border-rose-200 dark:border-rose-800",
    text: "text-rose-700 dark:text-rose-300",
  },
  {
    gradient: "from-cyan-500 to-sky-500",
    bg: "bg-cyan-50 dark:bg-cyan-950/40",
    border: "border-cyan-200 dark:border-cyan-800",
    text: "text-cyan-700 dark:text-cyan-300",
  },
];

function classStyle(i: number) {
  return CLASS_PALETTE[i % CLASS_PALETTE.length];
}

const SCHOOL_CLASSES: {
  value: string;
  label: string;
  labelBn: string;
  icon: LucideIcon;
}[] = [
  { value: "PrePrimary", label: "Pre-Primary", labelBn: "প্রি-প্রাইমারি", icon: School },
  { value: "Class1", label: "Class 1", labelBn: "প্রথম শ্রেণি", icon: School },
  { value: "Class2", label: "Class 2", labelBn: "দ্বিতীয় শ্রেণি", icon: School },
  { value: "Class3", label: "Class 3", labelBn: "তৃতীয় শ্রেণি", icon: School },
  { value: "Class4", label: "Class 4", labelBn: "চতুর্থ শ্রেণি", icon: School },
  { value: "Class5", label: "Class 5", labelBn: "পঞ্চম শ্রেণি", icon: School },
  { value: "Class6", label: "Class 6", labelBn: "ষষ্ঠ শ্রেণি", icon: UsersRound },
  { value: "Class7", label: "Class 7", labelBn: "সপ্তম শ্রেণি", icon: UsersRound },
  { value: "Class8", label: "Class 8", labelBn: "অষ্টম শ্রেণি", icon: UsersRound },
  { value: "SSC", label: "SSC", labelBn: "এসএসসি", icon: GraduationCap },
  { value: "HSC", label: "HSC", labelBn: "এইচএসসি", icon: GraduationCap },
  { value: "IELTS", label: "IELTS", labelBn: "আইইএলটিএস", icon: Languages },
  { value: "TOEFL", label: "TOEFL", labelBn: "টোফেল", icon: Languages },
  { value: "University", label: "University", labelBn: "বিশ্ববিদ্যালয়", icon: BookMarked },
  { value: "Masters", label: "Masters", labelBn: "মাস্টার্স", icon: BookMarked },
  { value: "Diploma", label: "Diploma", labelBn: "ডিপ্লোমা", icon: BookOpenCheck },
  { value: "BCS", label: "BCS", labelBn: "বিসিএস", icon: Landmark },
  { value: "JOB", label: "Job", labelBn: "চাকরি", icon: Briefcase },
];

export const QUIZ_CLASS_META: Record<string, QuizClassOption> = Object.fromEntries(
  SCHOOL_CLASSES.map((c, i) => [
    c.value,
    {
      value: c.value,
      label: c.label,
      labelBn: c.labelBn,
      icon: c.icon,
      ...classStyle(i),
    },
  ])
);

function fallbackTopicStyle(): QuizSectionCardStyle {
  const knownCount = Object.keys(QUIZ_TOPIC_META).length;
  return {
    ...grammarStyle(knownCount % GRAMMAR_STYLE.length),
  };
}

/**
 * Resolves display metadata for a backend quiz type name. Falls back to a
 * generated style for types created at runtime that are not in the seeded set.
 */
export function quizTopicMeta(name: string): QuizTopic {
  const known = QUIZ_TOPIC_META[name];
  if (known) return known;
  const style = fallbackTopicStyle();
  return {
    name,
    label: humanizeTopicName(name),
    labelBn: humanizeTopicName(name),
    desc: "Practice this topic with a dedicated question set.",
    descBn: "নির্দিষ্ট প্রশ্নসেট দিয়ে এই টপিকটি অনুশীলন করুন।",
    icon: BookOpenCheck,
    ...style,
  };
}

/**
 * Resolves display metadata for a backend class value. Unknown values get a
 * sensible default so new classes still render.
 */
export function quizClassMeta(value: string): QuizClassOption {
  const known = QUIZ_CLASS_META[value];
  if (known) return known;
  const style = classStyle(Object.keys(QUIZ_CLASS_META).length);
  return {
    value,
    label: humanizeTopicName(value),
    labelBn: humanizeTopicName(value),
    icon: GraduationCap,
    ...style,
  };
}

function humanizeTopicName(name: string): string {
  return name
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}