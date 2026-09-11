"use client";

/**
 * Shared types for practice quiz results.
 *
 * Practice quiz results are now stored identity-scoped in IndexedDB (see
 * `lib/use-quiz-history.ts`); this module only re-exports the shared types so
 * consumers (sync, quiz UI, profile panels) keep a single source of truth.
 * The old zustand/localStorage store has been removed — data was migrated to
 * the IndexedDB `quizHistory` table by the Dexie v3 upgrade.
 */

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