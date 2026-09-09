"use client";

import type { QuizType as ClientQuizType } from "@/lib/quiz-history-store";
import type { QuizHistoryEntry } from "@/lib/quiz-history-store";

const DB_TO_CLIENT_QUIZ_TYPE: Record<string, ClientQuizType> = {
  ENGLISH_TO_BANGLA: "english_to_bangla",
  BANGLA_TO_ENGLISH: "bangla_to_english",
  SYNONYMS: "synonym",
  ANTONYMS: "antonym",
};

export interface DbQuizResult {
  id: number;
  userId: number;
  clientId: string | null;
  title: string | null;
  mode: string;
  quizType: string;
  questionCount: number;
  levels: string[];
  timePerQuestion: number;
  timeTotalQuiz: number;
  scheduleEnabled: boolean;
  scheduledOpeningTime: string | Date | null;
  scheduledClosingTime: string | Date | null;
  correctAnswers: number;
  scoreInPercent: number;
  totalScore: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export async function fetchQuizResultsFromDb(userId?: number): Promise<DbQuizResult[]> {
  try {
    const qs = userId != null ? `?userId=${userId}` : "";
    const res = await fetch(`/api/v1/quiz/results${qs}`, { cache: "no-store" });
    if (!res.ok) return [];
    const body = (await res.json()) as {
      data?: DbQuizResult[];
      success?: boolean;
    };
    if (!body.success || !Array.isArray(body.data)) return [];
    return body.data;
  } catch {
    return [];
  }
}

export function dbResultDate(r: DbQuizResult): string {
  const v = r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt;
  return v.slice(0, 10);
}

export function dbResultToHistoryEntry(r: DbQuizResult): QuizHistoryEntry {
  const date = dbResultDate(r);
  return {
    id: `db-${r.id}`,
    quizType: DB_TO_CLIENT_QUIZ_TYPE[r.quizType] ?? "english_to_bangla",
    date,
    win: `${r.scoreInPercent}%`,
    levels: r.levels,
    numberOfQuestions: r.questionCount,
    timePerQuestion: r.timePerQuestion,
  };
}
