import prisma from "@/utils/prisma";
import logger from "@/utils/logger";
import { getAllWords, type Word } from "@/lib/data";
import type { Levels, QuizMode } from "@/generated/prisma/enums";

export const DAILY_PRACTICE_TITLE = "Personalized Daily Practice";
export const DAILY_PRACTICE_QUESTION_COUNT = 10;
export const DAILY_PRACTICE_TIME_PER_QUESTION = 20;

export interface DailyPracticeOption {
  text: string;
  correct: boolean;
}

export interface DailyPracticeQuestion {
  id: number;
  type: "VOCABULARY" | "GRAMMAR";
  category: string;
  questionText: string;
  options: DailyPracticeOption[];
  difficultyLevel: string;
  explanation?: string;
  wordId?: number;
  questionId?: number;
}

export interface DailyPracticeStatus {
  completedToday: boolean;
  streak: number;
  nextResetSeconds: number;
  todayResult?: {
    id: number;
    scoreInPercent: number;
    correctAnswers: number;
    questionCount: number;
    timeTotalQuiz: number;
    completedAt: string;
  } | null;
}

function fmtDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Calculates consecutive daily practice streak.
 * If today has a completed practice, streak starts from today.
 * If today has not been done yet, streak is active if yesterday was completed.
 */
export async function calculateDailyStreak(userId: number): Promise<number> {
  try {
    const results = await prisma.combinedExamResult.findMany({
      where: {
        userId,
        title: DAILY_PRACTICE_TITLE,
        status: { in: ["SUBMITTED", "LATE_SUBMITTED"] },
      },
      select: { createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    if (results.length === 0) return 0;

    const completedDates = new Set<string>();
    for (const r of results) {
      completedDates.add(fmtDate(new Date(r.createdAt)));
    }

    const now = new Date();
    const todayKey = fmtDate(now);

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = fmtDate(yesterday);

    let streak = 0;
    // If completed today, count backwards starting from today
    if (completedDates.has(todayKey)) {
      for (let i = 0; ; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        if (completedDates.has(fmtDate(d))) {
          streak++;
        } else {
          break;
        }
      }
    } else if (completedDates.has(yesterdayKey)) {
      // Pending today, but yesterday was completed -> streak is still active
      for (let i = 1; ; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        if (completedDates.has(fmtDate(d))) {
          streak++;
        } else {
          break;
        }
      }
    } else {
      streak = 0;
    }

    return streak;
  } catch (error) {
    logger.error(`Failed to calculate daily streak for user ${userId}: ${error}`);
    return 0;
  }
}

/**
 * Checks if the user has completed daily practice today.
 */
export async function getDailyPracticeStatus(
  userId: number,
  clientDate?: string
): Promise<DailyPracticeStatus> {
  const targetDateKey = clientDate && /^\d{4}-\d{2}-\d{2}$/.test(clientDate)
    ? clientDate
    : fmtDate(new Date());

  const streak = await calculateDailyStreak(userId);

  // Find recent daily practice submissions
  const recentPractices = await prisma.combinedExamResult.findMany({
    where: {
      userId,
      title: DAILY_PRACTICE_TITLE,
      status: { in: ["SUBMITTED", "LATE_SUBMITTED"] },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const todayPractice = recentPractices.find((p) => {
    return fmtDate(new Date(p.createdAt)) === targetDateKey;
  });

  // Calculate seconds until local or UTC midnight
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const nextResetSeconds = Math.max(0, Math.floor((tomorrow.getTime() - now.getTime()) / 1000));

  if (todayPractice) {
    return {
      completedToday: true,
      streak,
      nextResetSeconds,
      todayResult: {
        id: todayPractice.id,
        scoreInPercent: todayPractice.scoreInPercent,
        correctAnswers: todayPractice.correctAnswers,
        questionCount: todayPractice.questionCount,
        timeTotalQuiz: todayPractice.timeTotalQuiz,
        completedAt: todayPractice.createdAt.toISOString(),
      },
    };
  }

  return {
    completedToday: false,
    streak,
    nextResetSeconds,
    todayResult: null,
  };
}

/**
 * Generates 10 personalized questions: 5 Vocabulary + 5 Grammar.
 */
export async function generateDailyPracticeQuestions(
  userId: number
): Promise<{ questions: DailyPracticeQuestion[]; streak: number }> {
  const [allWords, streak, pastMistakes, stillLearningRows, userBookmarks] =
    await Promise.all([
      getAllWords(),
      calculateDailyStreak(userId),
      // User's past incorrect words and questions from CombinedExamResult
      prisma.combinedExamResult.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          incorrectWords: { select: { id: true } },
          incorrectQuestions: { select: { id: true, quizTypeId: true } },
        },
      }),
      // Still learning words
      prisma.userWord.findMany({
        where: { userId, learningStatus: "STILL_LEARNING" },
        select: { wordId: true },
        take: 20,
      }),
      // Bookmarked words
      prisma.userBookmark.findMany({
        where: { userId },
        select: { wordId: true },
        take: 20,
      }),
    ]);

  // --- 1. BUILD 5 VOCABULARY QUESTIONS ---
  const pastMistakeWordIds = new Set<number>();
  for (const p of pastMistakes) {
    for (const w of p.incorrectWords) {
      pastMistakeWordIds.add(w.id);
    }
  }

  const prioritizedWordIds = [
    ...pastMistakeWordIds,
    ...stillLearningRows.map((r) => r.wordId),
    ...userBookmarks.map((r) => r.wordId),
  ];

  const wordMap = new Map<number, Word>();
  for (const w of allWords) {
    wordMap.set(w.id, w);
  }

  const chosenWords: Word[] = [];
  const chosenWordIds = new Set<number>();

  // Prioritize up to 3 words from user's mistakes / bookmarks
  for (const wid of shuffleArray(prioritizedWordIds)) {
    if (chosenWords.length >= 3) break;
    const w = wordMap.get(wid);
    if (w && !chosenWordIds.has(w.id) && w.meaningBn.length > 0) {
      chosenWords.push(w);
      chosenWordIds.add(w.id);
    }
  }

  // Fill remaining slots up to 5 with diverse words from the pool
  const candidatePool = shuffleArray(
    allWords.filter((w) => !chosenWordIds.has(w.id) && w.meaningBn.length > 0)
  );

  for (const w of candidatePool) {
    if (chosenWords.length >= 5) break;
    chosenWords.push(w);
    chosenWordIds.add(w.id);
  }

  // Build multiple-choice questions for each chosen word
  const vocabQuestions: DailyPracticeQuestion[] = chosenWords.map((target) => {
    const correctMeaning = (target.meaningBn[0] ?? "").trim();

    // Pick 3 realistic distractors sharing the same level or category
    const peers = allWords.filter(
      (w) =>
        w.id !== target.id &&
        (w.level === target.level || w.category === target.category) &&
        w.meaningBn.length > 0
    );
    const peerMeanings = new Set<string>();
    peerMeanings.add(correctMeaning);

    const distractors: string[] = [];
    for (const p of shuffleArray(peers)) {
      const m = (p.meaningBn[0] ?? "").trim();
      if (m && !peerMeanings.has(m)) {
        peerMeanings.add(m);
        distractors.push(m);
        if (distractors.length >= 3) break;
      }
    }

    // Fallback if not enough peer distractors
    if (distractors.length < 3) {
      for (const p of shuffleArray(allWords)) {
        const m = (p.meaningBn[0] ?? "").trim();
        if (m && !peerMeanings.has(m)) {
          peerMeanings.add(m);
          distractors.push(m);
          if (distractors.length >= 3) break;
        }
      }
    }

    const options = shuffleArray([
      { text: correctMeaning, correct: true },
      ...distractors.map((d) => ({ text: d, correct: false })),
    ]);

    return {
      id: target.id,
      type: "VOCABULARY",
      category: target.category || "Vocabulary",
      questionText: `What is the Bangla meaning of "${target.word}"?`,
      options,
      difficultyLevel: target.level,
      explanation: target.definitionEn
        ? `${target.word}: ${target.definitionEn}`
        : `Meaning: ${target.meaningBn.join(", ")}`,
      wordId: target.id,
    };
  });

  // --- 2. BUILD 5 GRAMMAR QUESTIONS ---
  const pastMistakeQuestionIds = new Set<number>();
  for (const p of pastMistakes) {
    for (const q of p.incorrectQuestions) {
      pastMistakeQuestionIds.add(q.id);
    }
  }

  // Grammar types in DB: PREPOSITIONS, Parts of Speech, Right Form of Verb, Transformation, etc.
  const grammarTypes = await prisma.quizType.findMany({
    where: {
      name: {
        in: [
          "PREPOSITIONS",
          "Parts of Speech",
          "Right Form of Verb",
          "Transformation",
          "Auxiliary Verb",
          "Fill in the blanks",
          "Basic Grammar",
          "Sentence",
          "Sentence Structure",
          "Singular-Plural",
          "TRUE_FALSE",
          "IDIOMS_AND_PHRASES",
        ],
      },
    },
    select: { id: true, name: true },
  });

  const grammarTypeIds = grammarTypes.map((t) => t.id);

  // Fetch approved grammar questions
  const allGrammarQuestions = await prisma.quizQuestion.findMany({
    where: {
      isPending: false,
      quizTypeId: { in: grammarTypeIds },
    },
    include: {
      quizType: { select: { id: true, name: true } },
    },
  });

  const chosenGrammarQuestions: typeof allGrammarQuestions = [];
  const chosenGrammarIds = new Set<number>();

  // Prioritize up to 2 past grammar mistake questions
  for (const q of shuffleArray(allGrammarQuestions)) {
    if (chosenGrammarQuestions.length >= 2) break;
    if (pastMistakeQuestionIds.has(q.id) && !chosenGrammarIds.has(q.id)) {
      chosenGrammarQuestions.push(q);
      chosenGrammarIds.add(q.id);
    }
  }

  // Fill up to 5 questions with diverse grammar categories
  const categoriesSeen = new Set<string>(
    chosenGrammarQuestions.map((q) => q.quizType.name)
  );

  const candidateGrammar = shuffleArray(
    allGrammarQuestions.filter((q) => !chosenGrammarIds.has(q.id))
  );

  // First pass: pick questions from unseen categories
  for (const q of candidateGrammar) {
    if (chosenGrammarQuestions.length >= 5) break;
    if (!categoriesSeen.has(q.quizType.name)) {
      chosenGrammarQuestions.push(q);
      chosenGrammarIds.add(q.id);
      categoriesSeen.add(q.quizType.name);
    }
  }

  // Second pass: fill any remaining
  for (const q of candidateGrammar) {
    if (chosenGrammarQuestions.length >= 5) break;
    if (!chosenGrammarIds.has(q.id)) {
      chosenGrammarQuestions.push(q);
      chosenGrammarIds.add(q.id);
    }
  }

  const grammarQuestions: DailyPracticeQuestion[] = chosenGrammarQuestions.map(
    (q) => {
      const options = shuffleArray([
        { text: q.answer, correct: true },
        ...shuffleArray(q.options.filter((o) => o !== q.answer)).map((o) => ({
          text: o,
          correct: false,
        })),
      ]);

      return {
        id: q.id,
        type: "GRAMMAR",
        category: q.quizType.name,
        questionText: q.questionText,
        options,
        difficultyLevel: q.difficultyLevel,
        explanation: q.explanation || "",
        questionId: q.id,
      };
    }
  );

  // Return exactly 10 questions (5 Vocab + 5 Grammar)
  const questions: DailyPracticeQuestion[] = [
    ...vocabQuestions,
    ...grammarQuestions,
  ];

  return { questions, streak };
}

/**
 * Submits the daily practice results to CombinedExamResult and updates streak.
 */
export async function submitDailyPracticeResult(
  userId: number,
  payload: {
    clientId?: string | null;
    clientDate?: string;
    correctAnswers: number;
    scoreInPercent: number;
    totalScore: number;
    timeTotalQuiz: number;
    correctWordIds: number[];
    incorrectWordIds: number[];
    correctQuestionIds: number[];
    incorrectQuestionIds: number[];
    levels: string[];
  }
) {
  const now = new Date();
  const todayKey = fmtDate(now);
  const targetDateKey = payload.clientDate && /^\d{4}-\d{2}-\d{2}$/.test(payload.clientDate)
    ? payload.clientDate
    : todayKey;

  // Check if already completed today
  const existing = await prisma.combinedExamResult.findMany({
    where: {
      userId,
      title: DAILY_PRACTICE_TITLE,
      status: { in: ["SUBMITTED", "LATE_SUBMITTED"] },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const alreadySubmitted = existing.some((p) => {
    const createdKey = fmtDate(new Date(p.createdAt));
    return createdKey === todayKey || createdKey === targetDateKey;
  });

  if (alreadySubmitted) {
    return {
      data: null,
      message: "Daily practice already completed today",
      success: false,
      alreadyCompleted: true,
    };
  }

  // Idempotency check with clientId
  if (payload.clientId) {
    const byClient = await prisma.combinedExamResult.findFirst({
      where: { clientId: payload.clientId },
    });
    if (byClient) {
      const currentStreak = await calculateDailyStreak(userId);
      return {
        data: byClient,
        message: "Daily practice result already recorded (idempotent)",
        success: true,
        streak: currentStreak,
      };
    }
  }

  // Find or create 'MIXED' quiz type
  let quizType = await prisma.quizType.findUnique({
    where: { name: "MIXED" },
  });
  if (!quizType) {
    quizType = await prisma.quizType.findFirst();
  }
  if (!quizType) {
    throw new Error("No valid QuizType found in database");
  }

  // Filter existing word and question IDs
  const [existingWords, existingQuestions] = await Promise.all([
    prisma.word.findMany({
      where: {
        id: {
          in: [
            ...new Set([
              ...payload.correctWordIds,
              ...payload.incorrectWordIds,
            ]),
          ],
        },
      },
      select: { id: true },
    }),
    prisma.quizQuestion.findMany({
      where: {
        id: {
          in: [
            ...new Set([
              ...payload.correctQuestionIds,
              ...payload.incorrectQuestionIds,
            ]),
          ],
        },
      },
      select: { id: true },
    }),
  ]);

  const validWordIdSet = new Set(existingWords.map((w) => w.id));
  const validQuestionIdSet = new Set(existingQuestions.map((q) => q.id));

  const correctWordConnect = payload.correctWordIds
    .filter((id) => validWordIdSet.has(id))
    .map((id) => ({ id }));
  const incorrectWordConnect = payload.incorrectWordIds
    .filter((id) => validWordIdSet.has(id))
    .map((id) => ({ id }));

  const correctQuestionConnect = payload.correctQuestionIds
    .filter((id) => validQuestionIdSet.has(id))
    .map((id) => ({ id }));
  const incorrectQuestionConnect = payload.incorrectQuestionIds
    .filter((id) => validQuestionIdSet.has(id))
    .map((id) => ({ id }));

  const levels = (payload.levels.length > 0 ? payload.levels : ["A1"]) as Levels[];

  // Save to CombinedExamResult
  const result = await prisma.combinedExamResult.create({
    data: {
      userId,
      clientId: payload.clientId ?? null,
      title: DAILY_PRACTICE_TITLE,
      mode: "PRACTICE" as QuizMode,
      quizTypeId: quizType.id,
      questionCount: DAILY_PRACTICE_QUESTION_COUNT,
      timePerQuestion: DAILY_PRACTICE_TIME_PER_QUESTION,
      timeTotalQuiz: payload.timeTotalQuiz,
      correctAnswers: payload.correctAnswers,
      scoreInPercent: payload.scoreInPercent,
      totalScore: payload.totalScore,
      levels,
      scheduleEnabled: false,
      status: "SUBMITTED",
      isFirstAttempt: true,
      correctWords: { connect: correctWordConnect },
      incorrectWords: { connect: incorrectWordConnect },
      correctQuestions: { connect: correctQuestionConnect },
      incorrectQuestions: { connect: incorrectQuestionConnect },
    },
  });

  // Mark words answered correctly as LEARNED in UserWord
  try {
    for (const w of correctWordConnect) {
      await prisma.userWord.upsert({
        where: { userId_wordId: { userId, wordId: w.id } },
        create: { userId, wordId: w.id, learningStatus: "LEARNED" },
        update: { learningStatus: "LEARNED" },
      });
    }
  } catch (err) {
    logger.warn(`Failed to sync UserWord learning status: ${err}`);
  }

  // Recalculate streak now that today's practice is saved
  const newStreak = await calculateDailyStreak(userId);

  return {
    data: result,
    message: "Personalized Daily Practice completed successfully!",
    success: true,
    streak: newStreak,
  };
}
