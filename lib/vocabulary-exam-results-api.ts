"use client";

export interface DbVocabularyWord {
  id: number;
  word: string;
  meaningBn: string[];
  synonyms: string[];
  antonyms: string[];
  definitionEn: string;
  definitionBn: string;
  examplesEn: string[];
  examplesBn: string[];
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  category: string;
  wordType: string[];
}

export interface DbVocabularyExamResult {
  id: number;
  userId: number;
  scoreInPercent: number;
  levels: string[];
  timePerWord: number;
  quizTypeId: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  correctWords: DbVocabularyWord[];
  incorrectWords: DbVocabularyWord[];
  quizType?: { id: number; name: string } | null;
}

export async function fetchVocabularyExamResults(): Promise<DbVocabularyExamResult[]> {
  try {
    const res = await fetch("/api/v1/vocabulary-exam-result", {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const body = (await res.json()) as {
      data?: DbVocabularyExamResult[];
      success?: boolean;
    };
    if (!body.success || !Array.isArray(body.data)) return [];
    return body.data;
  } catch {
    return [];
  }
}

export async function fetchVocabularyExamResultById(
  id: number
): Promise<DbVocabularyExamResult | null> {
  try {
    const res = await fetch(`/api/v1/vocabulary-exam-result/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = (await res.json()) as {
      data?: DbVocabularyExamResult | null;
      success?: boolean;
    };
    if (!body.success || !body.data) return null;
    return body.data;
  } catch {
    return null;
  }
}

export function vocabularyExamResultDate(r: DbVocabularyExamResult): string {
  const v = r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt;
  return v.slice(0, 10);
}