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
