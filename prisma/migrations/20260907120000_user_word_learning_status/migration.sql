-- CreateEnum
CREATE TYPE "LearningStatus" AS ENUM ('LEARNED', 'STILL_LEARNING');

-- AlterTable
ALTER TABLE "UserWord" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "learningStatus" "LearningStatus" NOT NULL DEFAULT 'LEARNED',
ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- Preserve existing learned data: backfill updatedAt from learnedAt before dropping the old column
UPDATE "UserWord" SET "updatedAt" = "learnedAt" WHERE "updatedAt" IS NULL;

-- AlterTable
ALTER TABLE "UserWord" ALTER COLUMN "updatedAt" SET NOT NULL;

-- Drop the old column (timestamp data is preserved in updatedAt)
ALTER TABLE "UserWord" DROP COLUMN "learnedAt";