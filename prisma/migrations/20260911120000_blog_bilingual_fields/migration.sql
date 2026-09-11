-- Make Blog content bilingual while preserving existing data.
-- 1) Add nullable bilingual columns.
ALTER TABLE "Blog"
    ADD COLUMN "titleEn" TEXT,
    ADD COLUMN "titleBn" TEXT,
    ADD COLUMN "descriptionEn" TEXT,
    ADD COLUMN "descriptionBn" TEXT,
    ADD COLUMN "contentEn" TEXT,
    ADD COLUMN "contentBn" TEXT;

-- 2) Backfill existing rows from their single-language source columns.
--    The same text is carried into both language columns so no content is
--    lost; editors can replace the Bangla variant later.
UPDATE "Blog"
SET "titleEn"       = "title",
    "titleBn"       = "title",
    "descriptionEn" = "description",
    "descriptionBn" = "description",
    "contentEn"     = "content",
    "contentBn"     = "content";

-- 3) Enforce NOT NULL and drop the superseded single-language columns.
ALTER TABLE "Blog"
    ALTER COLUMN "titleEn" SET NOT NULL,
    ALTER COLUMN "titleBn" SET NOT NULL,
    ALTER COLUMN "descriptionEn" SET NOT NULL,
    ALTER COLUMN "descriptionBn" SET NOT NULL,
    ALTER COLUMN "contentEn" SET NOT NULL,
    ALTER COLUMN "contentBn" SET NOT NULL,
    DROP COLUMN "title",
    DROP COLUMN "description",
    DROP COLUMN "content";

-- Align QuizResults.timeTotalQuiz with schema.prisma (no default).
ALTER TABLE "QuizResults" ALTER COLUMN "timeTotalQuiz" DROP DEFAULT;

-- Remove the obsolete VocabMeta version-tracking table (not modelled and
-- unused by the application).
DROP TABLE "VocabMeta";