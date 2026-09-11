"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createScopedLocalStorage } from "./state-storage";
import { identityNamespace } from "./auth-store";
import type {
  ExamModeValue,
  ExamLevelValue,
  QuizExamStep,
  QuizExamTakeQuestion,
  QuizExamIncorrectAnswer,
  QuizExamFinalResult,
} from "@/types/quiz-exam";

interface ExamQuizState {
  step: QuizExamStep;
  examId: number | null;
  examTitle: string | null;
  examMode: ExamModeValue | null;
  levels: ExamLevelValue[];
  timePerQuestion: number;
  scheduledOpeningTime: string | null;
  scheduledClosingTime: string | null;
  questions: QuizExamTakeQuestion[];
  currentIndex: number;
  score: number;
  selectedAnswer: string | null;
  isAnswered: boolean;
  timeLeft: number;
  deadlineAt: number | null;
  answers: Record<number, string>;
  finalResult: QuizExamFinalResult | null;
  incorrectAnswers: QuizExamIncorrectAnswer[];
  resultsRecorded: boolean;
  abandonRecorded: boolean;
  startedAt: number | null;
}

const initialExamState: ExamQuizState = {
  step: "list",
  examId: null,
  examTitle: null,
  examMode: null,
  levels: [],
  timePerQuestion: 0,
  scheduledOpeningTime: null,
  scheduledClosingTime: null,
  questions: [],
  currentIndex: 0,
  score: 0,
  selectedAnswer: null,
  isAnswered: false,
  timeLeft: 0,
  deadlineAt: null,
  answers: {},
  finalResult: null,
  incorrectAnswers: [],
  resultsRecorded: false,
  abandonRecorded: false,
  startedAt: null,
};

export const useQuizExamStore = create<ExamQuizState>()(
  persist(
    () => initialExamState,
    {
      name: "quiz-exam-state",
      storage: createScopedLocalStorage<ExamQuizState>(identityNamespace),
      skipHydration: true,
      partialize: (state) => state,
    }
  )
);

export function resetQuizExamState(): void {
  useQuizExamStore.setState(initialExamState);
}
