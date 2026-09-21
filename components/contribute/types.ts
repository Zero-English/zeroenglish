export type DifficultyLevelValue = "EASY" | "MEDIUM" | "HARD";

export type WordLevelValue = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type DraftWord = {
  id: string;
  word: string;
  meaningBn: string[];
  definitionEn: string;
  definitionBn: string;
  examplesEn: string[];
  examplesBn: string[];
  synonyms: string[];
  antonyms: string[];
  level: WordLevelValue;
  category: string;
  wordType: string[];
};

export type DraftQuestion = {
  id: string;
  quizType: string;
  questionText: string;
  options: string[];
  difficultyLevel: DifficultyLevelValue;
  answer: string;
  explanation: string;
  class: string[];
};

export const QUIZ_TYPE_FALLBACKS: { value: string; label: string }[] = [
  { value: "ENGLISH_TO_BANGLA", label: "English to Bangla" },
  { value: "BANGLA_TO_ENGLISH", label: "Bangla to English" },
  { value: "SYNONYMS", label: "Synonyms" },
  { value: "ANTONYMS", label: "Antonyms" },
  { value: "MIXED", label: "Mixed" },
  { value: "IDIOMS_AND_PHRASES", label: "Idioms & Phrases" },
  { value: "PREPOSITIONS", label: "Prepositions" },
  { value: "TRUE_FALSE", label: "True / False" },
];

export const DIFFICULTY_OPTIONS: {
  value: DifficultyLevelValue;
  label: string;
}[] = [
  { value: "EASY", label: "Easy" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HARD", label: "Hard" },
];

export const CLASS_OPTIONS = [
  "PrePrimary",
  "Class1",
  "Class2",
  "Class3",
  "Class4",
  "Class5",
  "Class6",
  "Class7",
  "Class8",
  "SSC",
  "HSC",
  "IELTS",
  "TOEFL",
  "University",
  "Masters",
  "Diploma",
  "BCS",
  "JOB",
];

export function quizTypeLabel(value: string): string {
  return (
    QUIZ_TYPE_FALLBACKS.find((o) => o.value === value)?.label ?? value
  );
}

export const QUIZ_TYPE_I18N: Record<string, [string, string]> = {
  ENGLISH_TO_BANGLA: ["ইংরেজি থেকে বাংলা", "English to Bangla"],
  BANGLA_TO_ENGLISH: ["বাংলা থেকে ইংরেজি", "Bangla to English"],
  SYNONYMS: ["সমার্থক শব্দ", "Synonyms"],
  ANTONYMS: ["বিপরীত শব্দ", "Antonyms"],
  MIXED: ["মিশ্র", "Mixed"],
  IDIOMS_AND_PHRASES: ["বাগধারা ও বাক্যাংশ", "Idioms & Phrases"],
  PREPOSITIONS: ["প্রিপজিশন", "Prepositions"],
  TRUE_FALSE: ["সত্য / মিথ্যা", "True / False"],
};

export function quizTypeI18n(value: string): [string, string] {
  return QUIZ_TYPE_I18N[value] ?? (value ? [value, value] : ["", ""]);
}

export const DIFFICULTY_I18N: Record<DifficultyLevelValue, [string, string]> = {
  EASY: ["সহজ", "Easy"],
  MEDIUM: ["মাঝারি", "Medium"],
  HARD: ["কঠিন", "Hard"],
};

export function difficultyI18n(value: string): [string, string] {
  return DIFFICULTY_I18N[value as DifficultyLevelValue] ??
    (value ? [value, value] : ["", ""]);
}

export const LEVEL_I18N: Record<WordLevelValue, [string, string]> = {
  A1: ["A1 (শিক্ষানবিশ)", "A1 (Beginner)"],
  A2: ["A2 (প্রাথমিক)", "A2 (Elementary)"],
  B1: ["B1 (মধ্যম)", "B1 (Intermediate)"],
  B2: ["B2 (উচ্চ-মধ্যম)", "B2 (Upper-intermediate)"],
  C1: ["C1 (উন্নত)", "C1 (Advanced)"],
  C2: ["C2 (দক্ষতা)", "C2 (Proficiency)"],
};

export function levelI18n(value: string): [string, string] {
  return LEVEL_I18N[value as WordLevelValue] ?? (value ? [value, value] : ["", ""]);
}

export const POS_I18N: Record<string, [string, string]> = {
  noun: ["বিশেষ্য", "noun"],
  verb: ["ক্রিয়া", "verb"],
  adjective: ["বিশেষণ", "adjective"],
  adverb: ["ক্রিয়াবিশেষণ", "adverb"],
  pronoun: ["সর্বনাম", "pronoun"],
  preposition: ["অব্যয়", "preposition"],
  conjunction: ["সংযোজক", "conjunction"],
  interjection: ["আবেগসূচক", "interjection"],
  article: ["আর্টিকেল", "article"],
  determiner: ["নির্ধারক", "determiner"],
  number: ["সংখ্যা", "number"],
};

export function posI18n(value: string): [string, string] {
  return POS_I18N[value] ?? (value ? [value, value] : ["", ""]);
}

export function difficultyLabel(value: string): string {
  return DIFFICULTY_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export const LEVEL_OPTIONS: { value: WordLevelValue; label: string }[] = [
  { value: "A1", label: "A1 (Beginner)" },
  { value: "A2", label: "A2 (Elementary)" },
  { value: "B1", label: "B1 (Intermediate)" },
  { value: "B2", label: "B2 (Upper-intermediate)" },
  { value: "C1", label: "C1 (Advanced)" },
  { value: "C2", label: "C2 (Proficiency)" },
];

export const CATEGORY_OPTIONS = [
  "Oxford3000",
  "Oxford5000",
  "IELTS",
  "TOEFL",
  "Academic",
  "Business",
  "Random",
];

export const POS_OPTIONS = [
  "noun",
  "verb",
  "adjective",
  "adverb",
  "pronoun",
  "preposition",
  "conjunction",
  "interjection",
  "article",
  "determiner",
  "number",
];

export function levelLabel(value: string): string {
  return LEVEL_OPTIONS.find((o) => o.value === value)?.label ?? value;
}