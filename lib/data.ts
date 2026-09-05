import { cache } from "react";
import prisma from "@/utils/prisma";
import type { Levels } from "@/generated/prisma/enums";

export type Word = {
  id: number;
  word: string;
  meaning_bn: string;
  definition_en: string;
  definition_bn: string;
  examples_en: string[];
  examples_bn: string[];
  synonyms: string[];
  antonyms: string[];
  level: "A1" | "A2" | "B1" | "B2";
  category: string;
  parts_of_speech: string;
};

const VALID_LEVELS = ["A1", "A2", "B1", "B2"] as const;

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
    meaning_bn: w.meaningBn.join("; "),
    definition_en: w.definitionEn,
    definition_bn: w.definitionBn,
    examples_en: w.examplesEn,
    examples_bn: w.examplesBn,
    synonyms: w.synonyms,
    antonyms: w.antonyms,
    level: w.level as Word["level"],
    category: w.category,
    parts_of_speech: w.wordType.join(", "),
  };
}

export const getAllWords = cache(async (): Promise<Word[]> => {
  const words = await prisma.word.findMany({ orderBy: { id: "asc" } });
  return words.map(toPublicWord);
});

export const getWordsByLevel = cache(
  async (level: string): Promise<Word[]> => {
    const upper = level.toUpperCase() as Levels;
    const words = await prisma.word.findMany({
      where: { level: upper },
      orderBy: { id: "asc" },
    });
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