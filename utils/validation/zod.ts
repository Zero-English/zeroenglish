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
        category: z.string().default("Oxford5000"),
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

export const quizTypeNameEnumSchema = z.enum([
  "english_to_bangla",
  "bangla_to_english",
  "synonym",
  "antonym",
]);

export const quizLevelOptionEnumSchema = z.enum([
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
  "Random",
]);

export const quizGenerateSchema = z.object({
  quizType: quizTypeNameEnumSchema,
  levels: z.array(quizLevelOptionEnumSchema).max(7).default([]),
  quantity: z.number().int().positive("quantity must be positive").max(200),
  useAllQuestions: z.boolean().default(false),
});

export const quizPoolSchema = z.object({
  quizType: quizTypeNameEnumSchema,
  levels: z.array(quizLevelOptionEnumSchema).max(7).default([]),
});

export type QuizGenerateInput = z.infer<typeof quizGenerateSchema>;
export type QuizPoolInput = z.infer<typeof quizPoolSchema>;

export const difficultyLevelEnumSchema = z.enum(["EASY", "MEDIUM", "HARD"]);

export const quizQuestionSchema = z.object({
  quizType: z.string().trim().min(1, "Quiz type is required").max(50),
  questionText: z.string().trim().min(1, "Question text is required"),
  options: z.array(z.string().min(1)).min(2, "At least 2 options are required"),
  difficultyLevel: difficultyLevelEnumSchema,
  answer: z.string().trim().min(1, "Answer is required"),
});

export type QuizQuestionInput = z.infer<typeof quizQuestionSchema>;

export const quizQuestionsArraySchema = z
  .array(quizQuestionSchema)
  .min(1, "At least one question is required")
  .max(10_000, "Too many questions in one file (max 10000)");

export const quizTypeSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(50),
});

export const quizTypeUpdateSchema = quizTypeSchema.partial();

export type QuizTypeInput = z.infer<typeof quizTypeSchema>;
export type QuizTypeUpdateInput = z.infer<typeof quizTypeUpdateSchema>;

export const quizTypesArraySchema = z
  .array(quizTypeSchema)
  .min(1, "At least one quiz type is required")
  .max(10_000, "Too many quiz types in one file (max 10000)");

export const quizModeEnumSchema = z.enum(["PRACTICE", "WEEKLY", "BIWEEKLY"]);

export const quizResultStatusEnumSchema = z.enum([
  "SUBMITTED",
  "LATE_SUBMITTED",
  "ABANDONED",
  "REATTEMPTED",
]);

export const quizResultSchema = z
  .object({
    clientId: z.string().trim().max(64).nullish(),
    examId: z.number().int().positive("examId must be positive").nullish(),
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
    status: quizResultStatusEnumSchema.nullish(),
  });

export type QuizResultInput = z.infer<typeof quizResultSchema>;

export const vocabularyExamResultSchema = z.object({
  correctWordIds: z.array(z.number().int().positive()).default([]),
  incorrectWordIds: z.array(z.number().int().positive()).default([]),
  scoreInPercent: z
    .number()
    .int()
    .min(0, "scoreInPercent must be >= 0")
    .max(100, "scoreInPercent must be <= 100"),
  levels: z.array(levelEnumSchema).min(1, "At least one level is required"),
  timePerWord: z
    .number()
    .int()
    .nonnegative("timePerWord must be non-negative"),
  quizType: quizTypeEnumSchema,
});

export type VocabularyExamResultInput = z.infer<
  typeof vocabularyExamResultSchema
>;

const quizExamBaseSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  mode: quizModeEnumSchema,
  questionCount: z
    .number()
    .int()
    .positive("questionCount must be positive")
    .optional(),
  levels: z.array(levelEnumSchema).min(1, "At least one level is required"),
  questionIds: z
    .array(z.number().int().positive())
    .min(1, "At least one question is required"),
  timePerQuestion: z
    .number()
    .int()
    .nonnegative("timePerQuestion must be non-negative"),
  scheduleEnabled: z.boolean().default(false),
  scheduledOpeningTime: z.string().datetime().nullish(),
  scheduledClosingTime: z.string().datetime().nullish(),
  resultsPublished: z.boolean().default(false),
});

const quizExamScheduleRefinement = (
  data: {
    scheduleEnabled?: boolean;
    scheduledOpeningTime?: string | null;
    scheduledClosingTime?: string | null;
  }
) => {
  if (
    data.scheduleEnabled &&
    data.scheduledOpeningTime &&
    data.scheduledClosingTime
  ) {
    return new Date(data.scheduledOpeningTime) < new Date(data.scheduledClosingTime);
  }
  return true;
};

const quizExamScheduleMessage = {
  message: "Opening time must be before closing time",
  path: ["scheduledClosingTime"],
};

export const quizExamSchema = quizExamBaseSchema.refine(
  quizExamScheduleRefinement,
  quizExamScheduleMessage
);

export const quizExamUpdateSchema =
  quizExamBaseSchema.partial().refine(quizExamScheduleRefinement, quizExamScheduleMessage);

export const quizExamPublishSchema = z.object({
  published: z.boolean(),
});

export const quizExamSubmitAnswerSchema = z.object({
  questionId: z.number().int().positive("questionId must be positive"),
  selectedOption: z.string().trim().min(1, "selectedOption is required"),
});

export const quizExamSubmitSchema = z.object({
  clientId: z.string().trim().max(64).nullish(),
  timeTotalQuiz: z.number().int().nonnegative().nullish(),
  status: quizResultStatusEnumSchema.nullish(),
  answers: z.array(quizExamSubmitAnswerSchema).default([]),
});

export type QuizExamSubmitInput = z.infer<typeof quizExamSubmitSchema>;

export type QuizExamInput = z.infer<typeof quizExamSchema>;
export type QuizExamUpdateInput = z.infer<typeof quizExamUpdateSchema>;
export type QuizExamPublishInput = z.infer<typeof quizExamPublishSchema>;

export const quizExamsArraySchema = z
  .array(quizExamSchema)
  .min(1, "At least one exam is required")
  .max(1000, "Too many exams in one file (max 1000)");

export const updateUserSchema = z
  .object({
    name: z.string().trim().max(120).nullable().optional(),
    user_name: z.string().trim().min(1, "Username is required").max(50),
    email: z.string().trim().min(1, "Email is required").email("Invalid email address"),
    role: z.enum(["user", "admin"]),
    image: z.string().trim().max(500).nullable().optional(),
  })
  .strict();

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const FOLDER_NAME_REGEX = /^[A-Za-z0-9 _-]+$/;

export const mediaUpdateSchema = z
    .object({
        altText: z.string().trim().max(500).optional(),
        caption: z.string().trim().max(2000).optional(),
        tags: z.array(z.string().trim().min(1).max(50)).max(50).optional(),
        folder: z
            .string()
            .trim()
            .max(40)
            .regex(FOLDER_NAME_REGEX, "Invalid folder name")
            .nullable()
            .optional(),
    })
    .strict();

export type MediaUpdateInput = z.infer<typeof mediaUpdateSchema>;

export const folderCreateSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Folder name is required")
        .max(40, "Folder name must be 40 characters or fewer")
        .regex(FOLDER_NAME_REGEX, "Folder name can only contain letters, numbers, spaces, hyphens and underscores"),
});

export type FolderCreateInput = z.infer<typeof folderCreateSchema>;

export const slugSchema = z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(200, "Slug must be 200 characters or fewer")
    .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug can only contain lowercase letters, numbers and hyphens",
    );

export const blogSchema = z
    .object({
        titleEn: z.string().trim().min(1, "English title is required").max(300),
        titleBn: z.string().trim().min(1, "Bangla title is required").max(300),
        descriptionEn: z.string().trim().min(1, "English description is required").max(3000),
        descriptionBn: z.string().trim().min(1, "Bangla description is required").max(3000),
        metaTitle: z.string().trim().max(300).nullish(),
        metaDescription: z.string().trim().max(1000).nullish(),
        slug: slugSchema.nullish(),
        keywords: z.array(z.string().trim().min(1).max(100)).max(50).default([]),
        contentEn: z.string().default(""),
        contentBn: z.string().default(""),
        featuredMediaId: z.number().int().positive().nullish(),
        published: z.boolean().default(false),
    })
    .strict();

export const blogUpdateSchema = blogSchema.partial();

export const blogPublishSchema = z.object({
    published: z.boolean(),
});

export type BlogInput = z.infer<typeof blogSchema>;
export type BlogUpdateInput = z.infer<typeof blogUpdateSchema>;
export type BlogPublishInput = z.infer<typeof blogPublishSchema>;

export const popupAudienceSchema = z.enum([
  "ALL",
  "LOGGED_OUT_ONLY",
  "LOGGED_IN_ONLY",
  "GUEST_ONLY",
]);

export const popupPageRuleSchema = z.enum(["ALL", "HOME", "SPECIFIC_PATHS"]);

export const popupAnimationSchema = z.enum([
  "FADE",
  "ZOOM",
  "SLIDE_UP",
  "SLIDE_DOWN",
  "NONE",
]);

export type PopupAudience = z.infer<typeof popupAudienceSchema>;
export type PopupPageRule = z.infer<typeof popupPageRuleSchema>;
export type PopupAnimation = z.infer<typeof popupAnimationSchema>;

const popupBaseSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  active: z.boolean().default(true),
  link: z.string().trim().max(2000).default(""),
  landscapeMediaId: z.number().int().positive().nullish(),
  portraitMediaId: z.number().int().positive().nullish(),
  scheduleEnabled: z.boolean().default(false),
  scheduledOpeningTime: z.string().datetime().nullish(),
  scheduledClosingTime: z.string().datetime().nullish(),
  audience: popupAudienceSchema.default("ALL"),
  pageRule: popupPageRuleSchema.default("ALL"),
  includePaths: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Path is required")
        .max(300, "Path is too long")
        .startsWith("/", "Path must start with /"),
    )
    .max(100, "Too many paths (max 100)")
    .default([]),
  animation: popupAnimationSchema.default("FADE"),
});

const popupScheduleRefinement = (
  data: {
    scheduleEnabled?: boolean;
    scheduledOpeningTime?: string | null;
    scheduledClosingTime?: string | null;
  },
) => {
  if (
    data.scheduleEnabled &&
    data.scheduledOpeningTime &&
    data.scheduledClosingTime
  ) {
    return (
      new Date(data.scheduledOpeningTime) < new Date(data.scheduledClosingTime)
    );
  }
  return true;
};

const popupScheduleMessage = {
  message: "Opening time must be before closing time",
  path: ["scheduledClosingTime"],
};

export const popupSchema = popupBaseSchema.refine(
  popupScheduleRefinement,
  popupScheduleMessage,
);

export const popupUpdateSchema = popupBaseSchema
  .partial()
  .refine(popupScheduleRefinement, popupScheduleMessage);

export type PopupInput = z.infer<typeof popupSchema>;
export type PopupUpdateInput = z.infer<typeof popupUpdateSchema>;
