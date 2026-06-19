"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createDexieStorage } from "./state-storage";
import type { Word } from "@/lib/data";

export type Step = "select" | "settings" | "quiz" | "results";
export type LevelOption = "A1" | "A2" | "B1" | "B2" | "Random";

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
  selectedLevel: LevelOption | null;
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
  incorrectAnswers: IncorrectAnswer[];
  resultsRecorded: boolean;
}

const initialState: QuizState = {
  step: "select",
  selectedLevel: null,
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
  incorrectAnswers: [],
  resultsRecorded: false,
};

export const useQuizStore = create<QuizState>()(
  persist(
    () => initialState,
    {
      name: "quiz-state",
      storage: createDexieStorage<QuizState>(),
      partialize: (state) => state,
    }
  )
);

export function resetQuizState(): void {
  useQuizStore.setState(initialState);
}
