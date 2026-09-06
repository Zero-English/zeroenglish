-- DropForeignKey
ALTER TABLE "WordLearningEvent" DROP CONSTRAINT "WordLearningEvent_userId_fkey";

-- DropForeignKey
ALTER TABLE "WordLearningEvent" DROP CONSTRAINT "WordLearningEvent_wordId_fkey";

-- DropIndex
DROP INDEX "UserWord_userId_isLearned_idx";

-- AlterTable
ALTER TABLE "UserWord" DROP COLUMN "isLearned",
ADD COLUMN     "learnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "WordLearningEvent";

-- DropEnum
DROP TYPE "IsLearned";

-- CreateIndex
CREATE INDEX "UserWord_userId_idx" ON "UserWord"("userId");