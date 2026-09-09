-- CreateTable: Blog
CREATE TABLE "Blog" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metaTitle" TEXT NOT NULL,
    "metaDescription" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "keywords" TEXT[],
    "content" TEXT NOT NULL,
    "media" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Blog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Blog_slug_key" ON "Blog"("slug");

-- CreateTable: QuizExam (quiz configuration extracted from the denormalized QuizResults)
CREATE TABLE "QuizExam" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "mode" "QuizMode" NOT NULL,
    "questionCount" INTEGER NOT NULL,
    "levels" "Levels"[],
    "timePerQuestion" INTEGER NOT NULL,
    "scheduleEnabled" BOOLEAN NOT NULL DEFAULT false,
    "scheduledOpeningTime" TIMESTAMP(3),
    "scheduledClosingTime" TIMESTAMP(3),
    "resultsPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizExam_pkey" PRIMARY KEY ("id")
);

-- Preserve existing data: reconstruct one QuizExam per distinct quiz configuration
-- (existing QuizResults rows with a NULL title are given a generated title).
INSERT INTO "QuizExam" (
    "title",
    "mode",
    "questionCount",
    "levels",
    "timePerQuestion",
    "scheduleEnabled",
    "scheduledOpeningTime",
    "scheduledClosingTime",
    "resultsPublished",
    "createdAt",
    "updatedAt"
)
SELECT
    COALESCE(qr."title", 'Practice Quiz'),
    qr."mode",
    qr."questionCount",
    qr."levels",
    qr."timePerQuestion",
    qr."scheduleEnabled",
    qr."scheduledOpeningTime",
    qr."scheduledClosingTime",
    FALSE,
    MIN(qr."createdAt"),
    MAX(qr."updatedAt")
FROM "QuizResults" qr
GROUP BY
    COALESCE(qr."title", 'Practice Quiz'),
    qr."mode",
    qr."questionCount",
    qr."levels",
    qr."timePerQuestion",
    qr."scheduleEnabled",
    qr."scheduledOpeningTime",
    qr."scheduledClosingTime";

-- Preserve existing data: link each QuizResults row to its reconstructed QuizExam
ALTER TABLE "QuizResults" ADD COLUMN "examId" INTEGER;

UPDATE "QuizResults" qr
SET "examId" = qe."id"
FROM "QuizExam" qe
WHERE
    qe."title" = COALESCE(qr."title", 'Practice Quiz')
    AND qe."mode" = qr."mode"
    AND qe."questionCount" = qr."questionCount"
    AND qe."levels" = qr."levels"
    AND qe."timePerQuestion" = qr."timePerQuestion"
    AND qe."scheduleEnabled" = qr."scheduleEnabled"
    AND qe."scheduledOpeningTime" IS NOT DISTINCT FROM qr."scheduledOpeningTime"
    AND qe."scheduledClosingTime" IS NOT DISTINCT FROM qr."scheduledClosingTime";

ALTER TABLE "QuizResults" ALTER COLUMN "examId" SET NOT NULL;

-- CreateTable: QuizExamQuestion (replaces QuizResultQuestion)
CREATE TABLE "QuizExamQuestion" (
    "quizExamId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,

    CONSTRAINT "QuizExamQuestion_pkey" PRIMARY KEY ("quizExamId","questionId")
);

-- Preserve existing data: carry over result <-> question links into the new join table
INSERT INTO "QuizExamQuestion" ("quizExamId", "questionId")
SELECT DISTINCT z."examId", qrq."questionId"
FROM "QuizResultQuestion" qrq
JOIN "QuizResults" z ON z."id" = qrq."quizResultId"
ON CONFLICT DO NOTHING;

-- CreateIndex
CREATE INDEX "QuizExamQuestion_questionId_idx" ON "QuizExamQuestion"("questionId");

-- Drop the obsolete QuizResultQuestion table (link data preserved in QuizExamQuestion)
ALTER TABLE "QuizResultQuestion" DROP CONSTRAINT "QuizResultQuestion_questionId_fkey";
ALTER TABLE "QuizResultQuestion" DROP CONSTRAINT "QuizResultQuestion_quizResultId_fkey";
DROP TABLE "QuizResultQuestion";

-- Convert QuizQuestion.quizType (enum) to a FK on the new QuizType table.
-- PostgreSQL does not allow an enum type and a table to share the name "QuizType"
-- in the same schema, so the enum is dropped before the table is created.
ALTER TABLE "QuizQuestion" ADD COLUMN "quizTypeText" TEXT;

UPDATE "QuizQuestion"
SET "quizTypeText" = "quizType"::text;

-- Drop the enum-typed columns once their values have been captured
ALTER TABLE "QuizQuestion" DROP COLUMN "quizType";
ALTER TABLE "QuizResults" DROP COLUMN "quizType";

-- DropEnum
DROP TYPE "QuizType";

-- CreateTable: QuizType (becomes rows, values preserved from the old enum)
CREATE TABLE "QuizType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "QuizType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuizType_name_key" ON "QuizType"("name");

INSERT INTO "QuizType" ("name") VALUES
    ('ENGLISH_TO_BANGLA'),
    ('BANGLA_TO_ENGLISH'),
    ('SYNONYMS'),
    ('ANTONYMS'),
    ('MIXED'),
    ('IDIOMS_AND_PHRASES'),
    ('PREPOSITIONS'),
    ('TRUE_FALSE');

-- Preserve existing data: point QuizQuestion rows at their original quiz type
ALTER TABLE "QuizQuestion" ADD COLUMN "quizTypeId" INTEGER;

UPDATE "QuizQuestion" q
SET "quizTypeId" = t."id"
FROM "QuizType" t
WHERE t."name" = q."quizTypeText";

ALTER TABLE "QuizQuestion" ALTER COLUMN "quizTypeId" SET NOT NULL;
ALTER TABLE "QuizQuestion" DROP COLUMN "quizTypeText";

-- Drop the denormalized QuizResults columns (quiz configuration preserved in QuizExam)
ALTER TABLE "QuizResults"
    DROP COLUMN "title",
    DROP COLUMN "mode",
    DROP COLUMN "questionCount",
    DROP COLUMN "levels",
    DROP COLUMN "timePerQuestion",
    DROP COLUMN "timeTotalQuiz",
    DROP COLUMN "scheduleEnabled",
    DROP COLUMN "scheduledOpeningTime",
    DROP COLUMN "scheduledClosingTime",
    DROP COLUMN "totalScore";

-- Adjust QuizResults indexes for the new model
DROP INDEX "QuizResults_clientId_key";
DROP INDEX "QuizResults_userId_idx";
CREATE INDEX "QuizResults_userId_examId_idx" ON "QuizResults"("userId", "examId");

-- AddForeignKey
ALTER TABLE "QuizResults" ADD CONSTRAINT "QuizResults_examId_fkey" FOREIGN KEY ("examId") REFERENCES "QuizExam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizExamQuestion" ADD CONSTRAINT "QuizExamQuestion_quizExamId_fkey" FOREIGN KEY ("quizExamId") REFERENCES "QuizExam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizExamQuestion" ADD CONSTRAINT "QuizExamQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuizQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_quizTypeId_fkey" FOREIGN KEY ("quizTypeId") REFERENCES "QuizType"("id") ON DELETE CASCADE ON UPDATE CASCADE;