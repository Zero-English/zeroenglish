"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createLocalStorage } from "./state-storage";

export type QuizType =
  | "english_to_bangla"
  | "bangla_to_english"
  | "synonym"
  | "antonym";

export interface QuizHistoryEntry {
  id: string;
  quizType: QuizType;
  date: string;
  win: string;
  levels: string[];
  numberOfQuestions: number;
  timePerQuestion: number;
}

function createEntryId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

interface QuizHistoryState {
  entries: QuizHistoryEntry[];
  addEntry: (entry: QuizHistoryEntry) => void;
  clearHistory: () => void;
}

export const useQuizHistoryStore = create<QuizHistoryState>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (entry) =>
        set((s) => ({
          entries: [{ ...entry, id: entry.id ?? createEntryId() }, ...s.entries],
        })),
      clearHistory: () => set({ entries: [] }),
    }),
    {
      name: "quiz-history",
      storage: createLocalStorage<Pick<QuizHistoryState, "entries">>(),
      partialize: (s) => ({ entries: s.entries }),
    }
  )
);