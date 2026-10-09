import type { DifficultyLevelValue, QuizTypeValue } from "./quizzes";

export type ExamModeValue = "PRACTICE" | "WEEKLY" | "BIWEEKLY";
export type ExamLevelValue = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export const examModeOptions: { value: ExamModeValue; label: string }[] = [
  { value: "PRACTICE", label: "Practice" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "BIWEEKLY", label: "Biweekly" },
];

export const examLevelOptions: { value: ExamLevelValue; label: string }[] = [
  { value: "A1", label: "A1" },
  { value: "A2", label: "A2" },
  { value: "B1", label: "B1" },
  { value: "B2", label: "B2" },
  { value: "C1", label: "C1" },
  { value: "C2", label: "C2" },
];

export const examModeLabelMap: Record<ExamModeValue, string> = Object.fromEntries(
  examModeOptions.map((o) => [o.value, o.label])
) as Record<ExamModeValue, string>;

export type QuizExamItem = {
  id: number;
  title: string;
  mode: ExamModeValue;
  questionCount: number;
  levels: ExamLevelValue[];
  timePerQuestion: number;
  scheduleEnabled: boolean;
  scheduledOpeningTime: string | null;
  scheduledClosingTime: string | null;
  resultsPublished: boolean;
  createdAt: string;
  updatedAt: string;
  resultCount: number;
  linkedQuestionCount: number;
};

export type ExamQuestionItem = {
  id: number;
  questionText: string;
  options: string[];
  difficultyLevel: DifficultyLevelValue;
  answer: string;
  quizType: QuizTypeValue;
};

export type ExamResultItem = {
  id: number;
  userId: number;
  clientId: string | null;
  user: {
    id: number;
    name: string | null;
    user_name: string;
    email: string;
    image: string | null;
  };
  quizType: string;
  mode: ExamModeValue;
  correctAnswers: number;
  scoreInPercent: number;
  totalScore: number;
  questionCount: number;
  levels: ExamLevelValue[];
  timePerQuestion: number;
  timeTotalQuiz: number;
  scheduleEnabled: boolean;
  scheduledOpeningTime: string | null;
  scheduledClosingTime: string | null;
  createdAt: string;
};

export type QuizExamDetail = QuizExamItem & {
  questions: ExamQuestionItem[];
  results: ExamResultItem[];
};

export type QuizExamListResponse = {
  data: QuizExamItem[] | null;
  pagination?: { total: number; page: number; limit: number; totalPages: number };
  message?: string;
  success: boolean;
};

export type QuizExamDetailResponse = {
  data: QuizExamDetail | null;
  message?: string;
  success: boolean;
};