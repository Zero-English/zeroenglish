export interface MistakeQuestionItem {
  id: number;
  questionText: string;
  options: string[];
  answer: string;
  difficultyLevel: string;
  class: string[];
  explanation: string;
  quizType: { id: number; name: string };
  mistakeCount: number;
  lastMistakeAt: string;
  lastExamTitle: string;
  isResolved: boolean;
}

export interface MistakeWordItem {
  id: number;
  word: string;
  meaningBn: string[];
  level: string;
  mistakeCount: number;
  lastMistakeAt: string;
  lastExamTitle: string;
}

export interface MistakeBankData {
  totalMistakeQuestions: number;
  unresolvedQuestionsCount: number;
  masteredQuestionsCount: number;
  totalMistakeWords: number;
  questions: MistakeQuestionItem[];
  words: MistakeWordItem[];
}

export async function fetchMistakeBank(): Promise<MistakeBankData | null> {
  try {
    const res = await fetch("/api/v1/quiz/mistakes", { cache: "no-store" });
    if (!res.ok) return null;
    const body = (await res.json()) as {
      data?: MistakeBankData | null;
      success?: boolean;
    };
    if (!body.success || !body.data) return null;
    return body.data;
  } catch {
    return null;
  }
}
