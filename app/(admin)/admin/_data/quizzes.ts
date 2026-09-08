export type QuizQuestionItem = {
  id: number;
  quizType: QuizTypeValue;
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

export const quizTypeOptions: { value: QuizTypeValue; label: string }[] = [
  { value: "ENGLISH_TO_BANGLA", label: "English to Bangla" },
  { value: "BANGLA_TO_ENGLISH", label: "Bangla to English" },
  { value: "SYNONYMS", label: "Synonyms" },
  { value: "ANTONYMS", label: "Antonyms" },
  { value: "MIXED", label: "Mixed" },
  { value: "IDIOMS_AND_PHRASES", label: "Idioms & Phrases" },
  { value: "PREPOSITIONS", label: "Prepositions" },
  { value: "TRUE_FALSE", label: "True / False" },
];

export const difficultyOptions: { value: DifficultyLevelValue; label: string }[] = [
  { value: "EASY", label: "Easy" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HARD", label: "Hard" },
];

export const quizTypeLabelMap: Record<QuizTypeValue, string> = Object.fromEntries(
  quizTypeOptions.map((o) => [o.value, o.label])
) as Record<QuizTypeValue, string>;

export const difficultyLabelMap: Record<DifficultyLevelValue, string> = Object.fromEntries(
  difficultyOptions.map((o) => [o.value, o.label])
) as Record<DifficultyLevelValue, string>;
