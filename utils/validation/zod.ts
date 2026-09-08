import { z } from "zod";

export const levelEnumSchema = z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]);

const normalizeWordTypos = (data: unknown) => {
    if (typeof data !== "object" || data === null || Array.isArray(data)) return data;
    const record = data as Record<string, unknown>;
    if (record.antononyms !== undefined && record.antonyms === undefined) {
        return { ...record, antonyms: record.antononyms };
    }
    return data;
};

export const wordRowSchema = z.preprocess(
    normalizeWordTypos,
    z.object({
        word: z.string().trim().min(1, "word is required"),
        meaningBn: z.array(z.string()).default([]),
        synonyms: z.array(z.string()).default([]),
        antonyms: z.array(z.string()).default([]),
        definitionEn: z.string().default(""),
        definitionBn: z.string().default(""),
        examplesEn: z.array(z.string()).default([]),
        examplesBn: z.array(z.string()).default([]),
        level: levelEnumSchema.default("A1"),
        category: z.string().default("Oxford3000"),
        wordType: z.array(z.string()).default([]),
    }),
);

export const wordsArraySchema = z.array(wordRowSchema);

export type WordRowInput = z.infer<typeof wordRowSchema>;

export const quizTypeEnumSchema = z.enum([
  "ENGLISH_TO_BANGLA",
  "BANGLA_TO_ENGLISH",
  "SYNONYMS",
  "ANTONYMS",
  "MIXED",
  "IDIOMS_AND_PHRASES",
  "PREPOSITIONS",
  "TRUE_FALSE",
]);

export const difficultyLevelEnumSchema = z.enum(["EASY", "MEDIUM", "HARD"]);

export const quizQuestionSchema = z.object({
  quizType: quizTypeEnumSchema,
  questionText: z.string().trim().min(1, "Question text is required"),
  options: z.array(z.string().min(1)).min(2, "At least 2 options are required"),
  difficultyLevel: difficultyLevelEnumSchema,
  answer: z.string().trim().min(1, "Answer is required"),
});

export type QuizQuestionInput = z.infer<typeof quizQuestionSchema>;

export const quizModeEnumSchema = z.enum(["PRACTICE", "WEEKLY", "BIWEEKLY"]);

export const quizResultSchema = z
  .object({
    clientId: z.string().trim().max(64).nullish(),
    title: z.string().trim().max(200).nullish(),
    mode: quizModeEnumSchema.default("PRACTICE"),
    quizType: quizTypeEnumSchema,
    questionCount: z.number().int().positive("questionCount must be positive"),
    levels: z.array(levelEnumSchema).min(1, "At least one level is required"),
    timePerQuestion: z.number().int().nonnegative("timePerQuestion must be non-negative"),
    timeTotalQuiz: z.number().int().nonnegative("timeTotalQuiz must be non-negative"),
    scheduleEnabled: z.boolean().default(false),
    scheduledOpeningTime: z.string().datetime().nullish(),
    scheduledClosingTime: z.string().datetime().nullish(),
    correctAnswers: z
      .number()
      .int()
      .nonnegative("correctAnswers must be non-negative"),
    scoreInPercent: z.number().int().min(0, "scoreInPercent must be >= 0").max(100, "scoreInPercent must be <= 100"),
    totalScore: z.number().int().nonnegative("totalScore must be non-negative"),
  });

export type QuizResultInput = z.infer<typeof quizResultSchema>;
