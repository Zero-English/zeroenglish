export type DifficultyLevelValue = "EASY" | "MEDIUM" | "HARD";

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