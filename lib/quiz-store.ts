"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createScopedLocalStorage } from "./state-storage";
import { identityNamespace } from "./auth-store";
import type { Word } from "@/lib/data";
import type { QuizType } from "@/lib/quiz-history-store";

export type Step = "select" | "settings" | "quiz" | "results";
export type LevelOption = "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | "Random";

export interface Question {
  word: Word;
  options: { text: string; correct: boolean }[];
}

export interface IncorrectAnswer {
  word: Word;
  correctMeaning: string;
  userAnswer: string;
}

export interface QuizState {
  step: Step;
  quizType: QuizType | null;
  selectedLevels: LevelOption[];
  quantity: number;
  useAllQuestions: boolean;
  timePerQuestion: number;
  noTimeLimit: boolean;
  questions: Question[];
  currentIndex: number;
  score: number;
  selectedAnswer: string | null;
  isAnswered: boolean;
  timeLeft: number;
  deadlineAt: number | null;
  incorrectAnswers: IncorrectAnswer[];
  resultsRecorded: boolean;
}

const initialState: QuizState = {
  step: "select",
  quizType: null,
  selectedLevels: [],
  quantity: 10,
  useAllQuestions: false,
  timePerQuestion: 15,
  noTimeLimit: false,
  questions: [],
  currentIndex: 0,
  score: 0,
  selectedAnswer: null,
  isAnswered: false,
  timeLeft: 0,
  deadlineAt: null,
  incorrectAnswers: [],
  resultsRecorded: false,
};

type QuizPersistedSettings = Pick<
  QuizState,
  | "quizType"
  | "selectedLevels"
  | "quantity"
  | "useAllQuestions"
  | "timePerQuestion"
  | "noTimeLimit"
>;

export const useQuizStore = create<QuizState>()(
  persist(
    () => initialState,
    {
      name: "quiz-state",
      storage: createScopedLocalStorage<QuizPersistedSettings>(identityNamespace),
      skipHydration: true,
      // Only settings survive a reload. Transient progress (step, questions,
      // score, timers, etc.) must never be restored, otherwise a finished or
      // in-progress quiz would reappear on the quiz page.
      partialize: (state) => ({
        quizType: state.quizType,
        selectedLevels: state.selectedLevels,
        quantity: state.quantity,
        useAllQuestions: state.useAllQuestions,
        timePerQuestion: state.timePerQuestion,
        noTimeLimit: state.noTimeLimit,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<QuizPersistedSettings>;
        return {
          ...current,
          quizType: p.quizType ?? current.quizType,
          selectedLevels: p.selectedLevels ?? current.selectedLevels,
          quantity: p.quantity ?? current.quantity,
          useAllQuestions: p.useAllQuestions ?? current.useAllQuestions,
          timePerQuestion: p.timePerQuestion ?? current.timePerQuestion,
          noTimeLimit: p.noTimeLimit ?? current.noTimeLimit,
        };
      },
    }
  )
);

export function resetQuizState(): void {
  useQuizStore.setState(initialState);
}
