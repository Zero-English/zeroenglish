export type QuizQuestionItem = {
  id: number;
  quizType: string;
  questionText: string;
  options: string[];
  difficultyLevel: DifficultyLevelValue;
  answer: string;
};

export type QuizTypeValue =
  | "ENGLISH_TO_BANGLA"
  | "BANGLA_TO_ENGLISH"
  | "SYNONYMS"
  | "ANTONYMS"
  | "MIXED"
  | "IDIOMS_AND_PHRASES"
  | "PREPOSITIONS"
  | "TRUE_FALSE";

export type DifficultyLevelValue = "EASY" | "MEDIUM" | "HARD";

// Hardcoded fallback list of the seeded quiz types, used when the live list
// cannot be loaded (offline, API error, etc.).
export const quizTypeFallbackOptions: { value: string; label: string }[] = [
  { value: "ENGLISH_TO_BANGLA", label: "English to Bangla" },
  { value: "BANGLA_TO_ENGLISH", label: "Bangla to English" },
  { value: "SYNONYMS", label: "Synonyms" },
  { value: "ANTONYMS", label: "Antonyms" },
  { value: "MIXED", label: "Mixed" },
  { value: "IDIOMS_AND_PHRASES", label: "Idioms & Phrases" },
  { value: "PREPOSITIONS", label: "Prepositions" },
  { value: "TRUE_FALSE", label: "True / False" },
];

export const quizTypeOptions = quizTypeFallbackOptions;

export const difficultyOptions: { value: DifficultyLevelValue; label: string }[] = [
  { value: "EASY", label: "Easy" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HARD", label: "Hard" },
];

export const quizTypeLabelMap: Record<QuizTypeValue, string> = Object.fromEntries(
  quizTypeOptions.map((o) => [o.value, o.label])
) as Record<QuizTypeValue, string>;

// Returns a human-readable label for a quiz type name, falling back to the
// raw value for types created at runtime that are not in the seeded set.
export function quizTypeLabel(value: string): string {
  return quizTypeLabelMap[value as QuizTypeValue] ?? value;
}

export const difficultyLabelMap: Record<DifficultyLevelValue, string> = Object.fromEntries(
  difficultyOptions.map((o) => [o.value, o.label])
) as Record<DifficultyLevelValue, string>;
