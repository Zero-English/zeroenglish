import type { Word } from "@/lib/data";

export type QuizTypeName =
  | "english_to_bangla"
  | "bangla_to_english"
  | "synonym"
  | "antonym";

export type QuizLevelOption =
  | "A1"
  | "A2"
  | "B1"
  | "B2"
  | "C1"
  | "C2"
  | "Random";

export interface QuizQuestionOption {
  text: string;
  correct: boolean;
}

export interface GeneratedQuizQuestion {
  word: Word;
  options: QuizQuestionOption[];
}

export interface QuizGenerationInput {
  quizType: QuizTypeName;
  levels: QuizLevelOption[];
  quantity: number;
  useAllQuestions: boolean;
}

export interface QuizGenerationResult {
  data: { questions: GeneratedQuizQuestion[]; maxCount: number } | null;
  message: string;
  success: boolean;
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function firstMeaning(meaning: string[]): string {
  return (meaning[0] ?? "").trim();
}

function wordDistractors(pool: Word[], correctText: string): string[] {
  const seen = new Set<string>([correctText]);
  const out: string[] = [];
  for (const w of pool) {
    if (seen.has(w.word)) continue;
    seen.add(w.word);
    out.push(w.word);
    if (out.length === 3) break;
  }
  return out;
}

/**
 * Orders the candidate distractor pool so words sharing the same level and
 * category as the target come first (harder to eliminate), topping up with the
 * wider pool when needed.
 */
function preferLevelCategoryPeers(pool: Word[], word: Word): Word[] {
  const peers = pool.filter(
    (w) =>
      w.id !== word.id &&
      w.level === word.level &&
      w.category === word.category
  );
  const rest = pool.filter(
    (w) =>
      w.id !== word.id &&
      !(w.level === word.level && w.category === word.category)
  );
  return [...shuffleArray(peers), ...shuffleArray(rest)];
}

function getPool(words: Word[], levels: QuizLevelOption[]): Word[] {
  const validWords = words.filter(
    (w) => w.meaningBn.length > 0 && w.meaningBn[0] !== "..."
  );
  const picked = levels.filter((lv) => lv !== "Random");
  if (levels.length === 0 || picked.length === 0) return validWords;
  return validWords.filter((w) =>
    (picked as readonly QuizLevelOption[]).includes(w.level)
  );
}

function getQuizPool(
  words: Word[],
  levels: QuizLevelOption[],
  type: QuizTypeName
): Word[] {
  const pool = getPool(words, levels);
  if (type === "synonym") return pool.filter((w) => w.synonyms.length > 0);
  if (type === "antonym") return pool.filter((w) => w.antonyms.length > 0);
  return pool;
}

export function generateQuestions(
  words: Word[],
  levels: QuizLevelOption[],
  qty: number,
  all: boolean,
  type: QuizTypeName
): GeneratedQuizQuestion[] {
  const pool = getQuizPool(words, levels, type);
  const shuffled = shuffleArray(pool);
  const count = all ? shuffled.length : Math.min(qty, shuffled.length);
  const selected = shuffled.slice(0, count);

  return selected.map((word) => {
    const candidates = preferLevelCategoryPeers(pool, word).slice(0, 6);
    let options: QuizQuestionOption[];

    if (type === "bangla_to_english") {
      options = shuffleArray([
        { text: word.word, correct: true },
        ...candidates.slice(0, 3).map((d) => ({
          text: d.word,
          correct: false,
        })),
      ]);
    } else if (type === "synonym") {
      const correctText =
        word.synonyms[Math.floor(Math.random() * word.synonyms.length)];
      options = shuffleArray([
        { text: correctText, correct: true },
        ...wordDistractors(candidates, correctText).map((t) => ({
          text: t,
          correct: false,
        })),
      ]);
    } else if (type === "antonym") {
      const correctText =
        word.antonyms[Math.floor(Math.random() * word.antonyms.length)];
      options = shuffleArray([
        { text: correctText, correct: true },
        ...wordDistractors(candidates, correctText).map((t) => ({
          text: t,
          correct: false,
        })),
      ]);
    } else {
      options = shuffleArray([
        { text: firstMeaning(word.meaningBn), correct: true },
        ...candidates.slice(0, 3).map((d) => ({
          text: firstMeaning(d.meaningBn),
          correct: false,
        })),
      ]);
    }

    return { word, options };
  });
}

export function getQuizPoolCount(
  words: Word[],
  levels: QuizLevelOption[],
  type: QuizTypeName
): number {
  return getQuizPool(words, levels, type).length;
}