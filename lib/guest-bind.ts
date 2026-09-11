"use client";

import { getWordsByType } from "@/lib/db";
import { pushLearnedBulk, pushBookmarkBulk } from "@/lib/sync";
import { useQuizHistoryStore } from "@/lib/quiz-history-store";

const QUIZ_TYPE_ENUM: Record<string, string> = {
  english_to_bangla: "ENGLISH_TO_BANGLA",
  bangla_to_english: "BANGLA_TO_ENGLISH",
  synonym: "SYNONYMS",
  antonym: "ANTONYMS",
};

const VALID_LEVELS = new Set(["A1", "A2", "B1", "B2", "C1", "C2"]);

export interface GuestSyncResult {
  quiz: number;
  learned: number;
  bookmarked: number;
  stillLearning: number;
  failed: number;
}

async function postQuizResult(entry: {
  id: string;
  quizType: string;
  win: string;
  levels: string[];
  numberOfQuestions: number;
  timePerQuestion: number;
}): Promise<boolean> {
  const levels = entry.levels.filter((l) => VALID_LEVELS.has(l));
  if (!levels.length) return false;
  const score = parseFloat(entry.win);
  const win = Number.isFinite(score) ? score : 0;
  const correct = Math.round((win / 100) * entry.numberOfQuestions);
  try {
    const res = await fetch("/api/v1/quiz/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: entry.id,
        quizType: QUIZ_TYPE_ENUM[entry.quizType] ?? "ENGLISH_TO_BANGLA",
        questionCount: entry.numberOfQuestions,
        levels,
        timePerQuestion: entry.timePerQuestion,
        timeTotalQuiz: entry.numberOfQuestions * entry.timePerQuestion,
        scheduleEnabled: false,
        correctAnswers: correct,
        scoreInPercent: win,
        totalScore: correct,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function postStillLearningSync(wordIds: number[]): Promise<boolean> {
  if (wordIds.length === 0) return true;
  try {
    const res = await fetch("/api/v1/words/still-learning", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wordIds }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Pushes the currently active guest identity's localStorage data (quiz
 * results, learned words, bookmarked words, still-learning words) to the
 * database for the user that is currently signed in via NextAuth. Must be
 * called BEFORE the auth store identity is switched away from the guest, so
 * the in-memory guest entries are still the ones the quiz-history store
 * serves.
 */
export async function syncGuestDataToServer(
  scope: string
): Promise<GuestSyncResult> {
  const result: GuestSyncResult = { quiz: 0, learned: 0, bookmarked: 0, stillLearning: 0, failed: 0 };

  const entries = useQuizHistoryStore.getState().entries;
  for (const e of entries) {
    if (await postQuizResult(e)) {
      result.quiz += 1;
    } else {
      result.failed += 1;
    }
  }

  const learned = await getWordsByType("learned", scope);
  if (learned.length > 0) {
    if (
      await pushLearnedBulk(
        learned.map((w) => Number(w.id)).filter((n) => Number.isFinite(n))
      )
    ) {
      result.learned += learned.length;
    } else {
      result.failed += learned.length;
    }
  }

  const bookmarked = await getWordsByType("bookmarked", scope);
  if (bookmarked.length > 0) {
    if (
      await pushBookmarkBulk(
        bookmarked.map((w) => Number(w.id)).filter((n) => Number.isFinite(n))
      )
    ) {
      result.bookmarked += bookmarked.length;
    } else {
      result.failed += bookmarked.length;
    }
  }

  const stillLearning = await getWordsByType("still-learning", scope);
  if (stillLearning.length > 0) {
    if (
      await postStillLearningSync(
        stillLearning.map((w) => Number(w.id)).filter((n) => Number.isFinite(n))
      )
    ) {
      result.stillLearning += stillLearning.length;
    } else {
      result.failed += stillLearning.length;
    }
  }

  return result;
}