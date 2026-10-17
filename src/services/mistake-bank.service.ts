import prisma from "@/utils/prisma";
import logger from "@/utils/logger";

export interface MistakeQuestionData {
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

export interface MistakeWordData {
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
  questions: MistakeQuestionData[];
  words: MistakeWordData[];
}

export async function getUserMistakes(userId: number): Promise<{
  data: MistakeBankData | null;
  message: string;
  success: boolean;
}> {
  try {
    const results = await prisma.combinedExamResult.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        createdAt: true,
        incorrectQuestions: {
          select: {
            id: true,
            questionText: true,
            options: true,
            answer: true,
            difficultyLevel: true,
            class: true,
            explanation: true,
            quizType: {
              select: { id: true, name: true },
            },
          },
        },
        correctQuestions: {
          select: { id: true },
        },
        incorrectWords: {
          select: {
            id: true,
            word: true,
            meaningBn: true,
            level: true,
          },
        },
      },
    });

    const questionMap = new Map<number, MistakeQuestionData>();
    const latestAttemptStatus = new Map<number, "CORRECT" | "INCORRECT">();
    const wordMap = new Map<number, MistakeWordData>();

    // Process in descending order (most recent first) to determine latest attempt
    for (const r of results) {
      const examTitle = r.title || "Practice Quiz";
      const isoDate =
        r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt);

      // Track most recent attempt status for each question
      for (const q of r.correctQuestions) {
        if (!latestAttemptStatus.has(q.id)) {
          latestAttemptStatus.set(q.id, "CORRECT");
        }
      }

      for (const q of r.incorrectQuestions) {
        if (!latestAttemptStatus.has(q.id)) {
          latestAttemptStatus.set(q.id, "INCORRECT");
        }

        const existing = questionMap.get(q.id);
        if (existing) {
          existing.mistakeCount += 1;
        } else {
          questionMap.set(q.id, {
            id: q.id,
            questionText: q.questionText,
            options: q.options,
            answer: q.answer,
            difficultyLevel: q.difficultyLevel,
            class: q.class,
            explanation: q.explanation || "",
            quizType: q.quizType ?? { id: 0, name: "MIXED" },
            mistakeCount: 1,
            lastMistakeAt: isoDate,
            lastExamTitle: examTitle,
            isResolved: false,
          });
        }
      }

      for (const w of r.incorrectWords) {
        const existingWord = wordMap.get(w.id);
        if (existingWord) {
          existingWord.mistakeCount += 1;
        } else {
          wordMap.set(w.id, {
            id: w.id,
            word: w.word,
            meaningBn: w.meaningBn,
            level: w.level,
            mistakeCount: 1,
            lastMistakeAt: isoDate,
            lastExamTitle: examTitle,
          });
        }
      }
    }

    // Set resolution flag for each question
    for (const [qid, item] of questionMap.entries()) {
      item.isResolved = latestAttemptStatus.get(qid) === "CORRECT";
    }

    const questions = Array.from(questionMap.values());
    const words = Array.from(wordMap.values());

    const unresolvedQuestionsCount = questions.filter((q) => !q.isResolved).length;
    const masteredQuestionsCount = questions.filter((q) => q.isResolved).length;

    const data: MistakeBankData = {
      totalMistakeQuestions: questions.length,
      unresolvedQuestionsCount,
      masteredQuestionsCount,
      totalMistakeWords: words.length,
      questions,
      words,
    };

    return {
      data,
      message: "Mistake bank fetched successfully",
      success: true,
    };
  } catch (error) {
    logger.error(`Failed to fetch user mistake bank: ${error}`);
    return {
      data: null,
      message: "Failed to fetch mistake bank",
      success: false,
    };
  }
}
