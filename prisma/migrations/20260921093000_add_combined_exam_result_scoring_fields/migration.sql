-- AlterTable
ALTER TABLE "CombinedExamResult" ADD COLUMN     "correctAnswers" INTEGER NOT NULL,
ADD COLUMN     "questionCount" INTEGER NOT NULL,
ADD COLUMN     "totalScore" INTEGER NOT NULL;