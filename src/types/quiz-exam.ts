export type ExamModeValue = "PRACTICE" | "WEEKLY" | "BIWEEKLY";
export type ExamLevelValue = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface QuizExamPublicItem {
  id: number;
  title: string;
  mode: ExamModeValue;
  questionCount: number;
  levels: ExamLevelValue[];
  timePerQuestion: number;
  scheduledOpeningTime: string | null;
  scheduledClosingTime: string | null;
}

export interface QuizExamQuestionData {
  id: number;
  questionText: string;
  options: string[];
  difficultyLevel: string;
}

export interface QuizExamTakeData {
  id: number;
  title: string;
  mode: ExamModeValue;
  questionCount: number;
  levels: ExamLevelValue[];
  timePerQuestion: number;
  scheduledOpeningTime: string | null;
  scheduledClosingTime: string | null;
  questions: QuizExamQuestionData[];
}

export interface QuizExamTakeQuestion {
  id: number;
  questionText: string;
  options: string[];
  difficultyLevel: string;
}

export type QuizExamStep = "list" | "quiz" | "results";

export interface QuizExamIncorrectAnswer {
  questionId: number;
  questionText: string;
  correctAnswer: string | null;
  userAnswer: string | null;
}

export interface QuizExamSubmitResponse {
  id: number;
  correctAnswers: number;
  scoreInPercent: number;
  totalScore: number;
  questionCount: number;
  status: "SUBMITTED" | "LATE_SUBMITTED" | "ABANDONED" | "REATTEMPTED";
  isFirstAttempt: boolean;
  review: QuizExamIncorrectAnswer[];
  message?: string;
}