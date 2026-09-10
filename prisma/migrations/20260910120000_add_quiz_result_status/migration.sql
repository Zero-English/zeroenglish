-- Add submission status + first-attempt tracking to quiz results.

CREATE TYPE "QuizResultStatus" AS ENUM ('SUBMITTED', 'LATE_SUBMITTED', 'ABANDONED', 'REATTEMPTED');

ALTER TABLE "QuizResults"
    ADD COLUMN "status" "QuizResultStatus" NOT NULL DEFAULT 'SUBMITTED',
    ADD COLUMN "isFirstAttempt" BOOLEAN NOT NULL DEFAULT true;

-- Backfill: existing completed exam results that were saved after the exam
-- window closed are marked LATE_SUBMITTED.
UPDATE "QuizResults"
SET "status" = 'LATE_SUBMITTED'
WHERE "examId" IS NOT NULL
  AND "scheduledClosingTime" IS NOT NULL
  AND "createdAt" > "scheduledClosingTime";

-- Backfill: the earliest completed result per (user, exam) is the official
-- first attempt; later ones are REATTEMPTED. Practice results (examId NULL)
-- keep isFirstAttempt = true and status = SUBMITTED.
UPDATE "QuizResults" qr
SET "status" = 'REATTEMPTED', "isFirstAttempt" = false
WHERE qr."examId" IS NOT NULL
  AND qr."id" NOT IN (
    SELECT DISTINCT ON (qr2."userId", qr2."examId") qr2."id"
    FROM "QuizResults" qr2
    WHERE qr2."examId" IS NOT NULL
    ORDER BY qr2."userId", qr2."examId", qr2."createdAt" ASC
  );