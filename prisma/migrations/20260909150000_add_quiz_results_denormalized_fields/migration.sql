-- Make QuizResults self-contained: store the quiz configuration directly on each
-- result instead of only relying on the linked QuizExam.

-- examId becomes optional (a result may now be stored without an exam)
ALTER TABLE "QuizResults" ALTER COLUMN "examId" DROP NOT NULL;

-- Add denormalized quiz configuration columns
ALTER TABLE "QuizResults"
    ADD COLUMN "title" TEXT,
    ADD COLUMN "mode" "QuizMode",
    ADD COLUMN "quizTypeId" INTEGER,
    ADD COLUMN "questionCount" INTEGER,
    ADD COLUMN "levels" "Levels"[],
    ADD COLUMN "timePerQuestion" INTEGER,
    ADD COLUMN "timeTotalQuiz" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN "scheduleEnabled" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN "scheduledOpeningTime" TIMESTAMP(3),
    ADD COLUMN "scheduledClosingTime" TIMESTAMP(3),
    ADD COLUMN "totalScore" INTEGER;

-- Backfill existing rows from their linked exam
UPDATE "QuizResults" qr
SET
    "title" = qe."title",
    "mode" = qe."mode",
    "quizTypeId" = (
        SELECT q."quizTypeId"
        FROM "QuizExamQuestion" qeq
        JOIN "QuizQuestion" q ON q."id" = qeq."questionId"
        WHERE qeq."quizExamId" = qr."examId"
        LIMIT 1
    ),
    "questionCount" = qe."questionCount",
    "levels" = qe."levels",
    "timePerQuestion" = qe."timePerQuestion",
    "totalScore" = qr."correctAnswers"
FROM "QuizExam" qe
WHERE qe."id" = qr."examId";

-- Fallback for any remaining rows without a resolvable quiz type
UPDATE "QuizResults"
SET "quizTypeId" = (SELECT "id" FROM "QuizType" WHERE "name" = 'ENGLISH_TO_BANGLA' LIMIT 1)
WHERE "quizTypeId" IS NULL;

-- Enforce NOT NULL on the backfilled columns
ALTER TABLE "QuizResults"
    ALTER COLUMN "title" SET NOT NULL,
    ALTER COLUMN "mode" SET NOT NULL,
    ALTER COLUMN "quizTypeId" SET NOT NULL,
    ALTER COLUMN "questionCount" SET NOT NULL,
    ALTER COLUMN "levels" SET NOT NULL,
    ALTER COLUMN "timePerQuestion" SET NOT NULL,
    ALTER COLUMN "totalScore" SET NOT NULL;

-- Re-point examId FK to SET NULL (results can now exist without an exam)
ALTER TABLE "QuizResults" DROP CONSTRAINT "QuizResults_examId_fkey";
ALTER TABLE "QuizResults" ADD CONSTRAINT "QuizResults_examId_fkey" FOREIGN KEY ("examId") REFERENCES "QuizExam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Link QuizResults to QuizType
ALTER TABLE "QuizResults" ADD CONSTRAINT "QuizResults_quizTypeId_fkey" FOREIGN KEY ("quizTypeId") REFERENCES "QuizType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "QuizResults_quizTypeId_idx" ON "QuizResults"("quizTypeId");
