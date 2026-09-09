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

export interface DbQuizResult {
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
  createdAt: string | Date;
  updatedAt: string | Date;
  exam?: DbQuizExam | null;
  quizType?: DbQuizType | null;
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

const DB_TO_CLIENT_QUIZ_TYPE: Record<string, QuizType> = {
  ENGLISH_TO_BANGLA: "english_to_bangla",
  BANGLA_TO_ENGLISH: "bangla_to_english",
  SYNONYMS: "synonym",
  ANTONYMS: "antonym",
};

export function dbResultToHistoryEntry(r: DbQuizResult): QuizHistoryEntry {
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
