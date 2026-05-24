import fs from "fs";
import path from "path";

export type Word = {
  id: number;
  word: string;
  meaning_bn: string;
  definition_en: string;
  definition_bn: string;
  examples_en: string[];
  examples_bn: string[];
  synonyms: string[];
  level: "A1" | "A2" | "B1" | "B2";
  category: string;
  parts_of_speech: string;
};

const dataDir = path.join(process.cwd(), "data");

function loadAllWords(): Word[] {
  const files = fs.readdirSync(dataDir).filter((f) => f.endsWith(".json"));
  const words: Word[] = [];
  for (const file of files) {
    const content = fs.readFileSync(path.join(dataDir, file), "utf-8");
    const parsed = JSON.parse(content) as Word[];
    words.push(...parsed);
  }
  return words;
}

let cached: Word[] | null = null;

function getAllWords(): Word[] {
  if (!cached) {
    cached = loadAllWords();
  }
  return cached;
}

export function getWordsByLevel(level: string): Word[] {
  return getAllWords().filter((w) => w.level === level);
}

export function getLevelStats() {
  const levels = ["A1", "A2", "B1", "B2"];
  return levels.map((level) => ({
    level,
    count: getAllWords().filter((w) => w.level === level).length,
  }));
}
