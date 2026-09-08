"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createScopedLocalStorage } from "./state-storage";
import { identityNamespace } from "./auth-store";

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
  synced?: boolean;
  dbId?: number | null;
  createdAt?: number;
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
  updateEntry: (id: string, patch: Partial<QuizHistoryEntry>) => void;
  clearHistory: () => void;
}

export const useQuizHistoryStore = create<QuizHistoryState>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (entry) =>
        set((s) => ({
          entries: [
            { ...entry, id: entry.id ?? createEntryId(), synced: entry.synced ?? false },
            ...s.entries,
          ],
        })),
      updateEntry: (id, patch) =>
        set((s) => ({
          entries: s.entries.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        })),
      clearHistory: () => set({ entries: [] }),
    }),
    {
      name: "quiz-history",
      storage: createScopedLocalStorage<Pick<QuizHistoryState, "entries">>(identityNamespace),
      skipHydration: true,
      partialize: (s) => ({ entries: s.entries }),
    }
  )
);