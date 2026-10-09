"use client";

import type { QuizHistoryEntry, QuizType } from "@/lib/quiz-history-store";

export interface DbQuizExam {
  id: number;
  title: string;
  mode: string;
  questionCount: number;
  levels: string[];
  timePerQuestion: number;
  scheduleEnabled: boolean;
  scheduledOpeningTime: string | Date | null;
  scheduledClosingTime: string | Date | null;
  resultsPublished: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface DbQuizType {
  id: number;
  name: string;
}

export interface DbQuizQuestion {
  id: number;
  questionText: string;
  options: string[];
  answer: string;
  difficultyLevel: string;
  class?: string[];
  explanation?: string;
}

export interface DbCombinedExamResult {
  id: number;
  userId: number;
  examId: number | null;
  clientId: string | null;
  title: string;
  mode: string;
  quizTypeId: number;
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
  status:
    | "SUBMITTED"
    | "LATE_SUBMITTED"
    | "ABANDONED"
    | "REATTEMPTED";
  isFirstAttempt: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  exam?: DbQuizExam | null;
  quizType?: DbQuizType | null;
  correctQuestions?: DbQuizQuestion[];
  incorrectQuestions?: DbQuizQuestion[];
}

export async function fetchCombinedExamResultsFromDb(userId?: number): Promise<DbCombinedExamResult[]> {
  try {
    const qs = userId != null ? `?userId=${userId}` : "";
    const res = await fetch(`/api/v1/quiz/results${qs}`, { cache: "no-store" });
    if (!res.ok) return [];
    const body = (await res.json()) as {
      data?: DbCombinedExamResult[];
      success?: boolean;
    };
    if (!body.success || !Array.isArray(body.data)) return [];
    return body.data;
  } catch {
    return [];
  }
}

export function dbResultDate(r: DbCombinedExamResult): string {
  const v = r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt;
  return v.slice(0, 10);
}

export async function fetchCombinedExamResultById(id: number): Promise<DbCombinedExamResult | null> {
  try {
    const res = await fetch(`/api/v1/quiz/results/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = (await res.json()) as {
      data?: DbCombinedExamResult | null;
      success?: boolean;
    };
    if (!body.success || !body.data) return null;
    return body.data;
  } catch {
    return null;
  }
}

const DB_TO_CLIENT_QUIZ_TYPE: Record<string, QuizType> = {
  ENGLISH_TO_BANGLA: "english_to_bangla",
  BANGLA_TO_ENGLISH: "bangla_to_english",
  SYNONYMS: "synonym",
  ANTONYMS: "antonym",
};

export function dbResultToHistoryEntry(r: DbCombinedExamResult): QuizHistoryEntry {
  const date = dbResultDate(r);
  const dbType = r.quizType?.name ?? "";
  const quizType = DB_TO_CLIENT_QUIZ_TYPE[dbType] ?? "english_to_bangla";
  return {
    id: `db-${r.id}`,
    quizType,
    date,
    win: `${r.scoreInPercent}%`,
    levels: r.levels,
    numberOfQuestions: r.questionCount,
    timePerQuestion: r.timePerQuestion,
  };
}
