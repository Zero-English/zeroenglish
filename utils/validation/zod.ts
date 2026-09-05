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
