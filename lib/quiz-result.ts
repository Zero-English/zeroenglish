export type QuizResultType =
  | "english_to_bangla"
  | "bangla_to_english"
  | "synonym"
  | "antonym";

export interface QuizResult {
  id: string;
  quizType: QuizResultType;
  date: string;
  win: number;
  levels: string[];
  numberOfQuestions: number;
  timePerQuestion: number;
}

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export const quizResult: QuizResult[] = [
  {
    id: "demo-1",
    quizType: "english_to_bangla",
    date: daysAgo(0),
    win: 90,
    levels: ["A1", "A2"],
    numberOfQuestions: 10,
    timePerQuestion: 15,
  },
  {
    id: "demo-2",
    quizType: "bangla_to_english",
    date: daysAgo(2),
    win: 80,
    levels: ["A2"],
    numberOfQuestions: 10,
    timePerQuestion: 20,
  },
  {
    id: "demo-3",
    quizType: "synonym",
    date: daysAgo(5),
    win: 70,
    levels: ["B1"],
    numberOfQuestions: 10,
    timePerQuestion: 15,
  },
  {
    id: "demo-4",
    quizType: "antonym",
    date: daysAgo(8),
    win: 100,
    levels: ["A1"],
    numberOfQuestions: 5,
    timePerQuestion: 15,
  },
];

export function quizResultStats(results: QuizResult[]) {
  const total = results.length;
  const totalQuestions = results.reduce((acc, r) => acc + r.numberOfQuestions, 0);
  const avg = total > 0 ? Math.round(results.reduce((acc, r) => acc + r.win, 0) / total) : 0;
  const best = total > 0 ? Math.max(...results.map((r) => r.win)) : 0;
  return { total, totalQuestions, avg, best };
}