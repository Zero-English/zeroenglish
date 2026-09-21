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