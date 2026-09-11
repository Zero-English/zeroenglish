import { cache } from "react";
import prisma, { withPrismaRetry } from "@/utils/prisma";
import type { Levels } from "@/generated/prisma/enums";

export type Word = {
  id: number;
  word: string;
  meaningBn: string[];
  definitionEn: string;
  definitionBn: string;
  examplesEn: string[];
  examples_bn: string[];
  synonyms: string[];
  antonyms: string[];
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  category: string;
  wordType: string[];
};

const VALID_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

interface DbWordRecord {
  id: number;
  word: string;
  meaningBn: string[];
  synonyms: string[];
  antonyms: string[];
  definitionEn: string;
  definitionBn: string;
  examplesEn: string[];
  examplesBn: string[];
  level: string;
  category: string;
  wordType: string[];
}

function toPublicWord(w: DbWordRecord): Word {
  return {
    id: w.id,
    word: w.word,
    meaningBn: w.meaningBn,
    definitionEn: w.definitionEn,
    definitionBn: w.definitionBn,
    examplesEn: w.examplesEn,
    examples_bn: w.examplesBn,
    synonyms: w.synonyms,
    antonyms: w.antonyms,
    level: w.level as Word["level"],
    category: w.category,
    wordType: w.wordType,
  };
}

export const getAllWords = cache(async (): Promise<Word[]> => {
  const words = await withPrismaRetry(() =>
    prisma.word.findMany({ orderBy: { id: "asc" } })
  );
  return words.map(toPublicWord);
});

export const getWordsByLevel = cache(
  async (level: string): Promise<Word[]> => {
    const upper = level.toUpperCase() as Levels;
    const words = await withPrismaRetry(() =>
      prisma.word.findMany({
        where: { level: upper },
        orderBy: { id: "asc" },
      })
    );
    return words.map(toPublicWord);
  }
);

export const getLevelStats = cache(async () => {
  const all = await getAllWords();
  return VALID_LEVELS.map((level) => ({
    level,
    count: all.filter((w) => w.level === level).length,
  }));
});