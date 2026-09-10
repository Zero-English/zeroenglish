"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createScopedLocalStorage } from "./state-storage";
import { identityNamespace } from "./auth-store";
import type { ExamModeValue } from "@/types/quiz-exam";

export interface QuizExamHistoryEntry {
  id: string;
  examId: number;
  title: string;
  mode: ExamModeValue;
  date: string;
  win: string;
  levels: string[];
  numberOfQuestions: number;
  timePerQuestion: number;
  synced?: boolean;
  dbId?: number | null;
  createdAt?: number;
  status?: "SUBMITTED" | "LATE_SUBMITTED" | "ABANDONED" | "REATTEMPTED";
  isFirstAttempt?: boolean;
}

function createEntryId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

interface QuizExamHistoryState {
  entries: QuizExamHistoryEntry[];
  addEntry: (entry: QuizExamHistoryEntry) => void;
  updateEntry: (id: string, patch: Partial<QuizExamHistoryEntry>) => void;
  clearHistory: () => void;
}

export const useQuizExamHistoryStore = create<QuizExamHistoryState>()(
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
      name: "quiz-exam-history",
      storage: createScopedLocalStorage<Pick<QuizExamHistoryState, "entries">>(identityNamespace),
      skipHydration: true,
      partialize: (s) => ({ entries: s.entries }),
    }
  )
);