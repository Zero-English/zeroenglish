-- CreateEnum
CREATE TYPE "QuizMode" AS ENUM ('PRACTICE', 'WEEKLY', 'BIWEEKLY');

-- CreateEnum
CREATE TYPE "QuizType" AS ENUM ('ENGLISH_TO_BANGLA', 'BANGLA_TO_ENGLISH', 'SYNONYMS', 'ANTONYMS', 'MIXED', 'IDIOMS_AND_PHRASES', 'PREPOSITIONS', 'TRUE_FALSE');

-- CreateEnum
CREATE TYPE "DifficultyLevels" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "lastActivityAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "QuizResults" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT,
    "mode" "QuizMode" NOT NULL,
    "quizType" "QuizType" NOT NULL,
    "questionCount" INTEGER NOT NULL,
    "levels" "Levels"[],
    "timePerQuestion" INTEGER NOT NULL,
    "timeTotalQuiz" INTEGER NOT NULL,
    "scheduleEnabled" BOOLEAN NOT NULL,
    "scheduledOpeningTime" TIMESTAMP(3),
    "scheduledClosingTime" TIMESTAMP(3),
    "correctAnswers" INTEGER NOT NULL,
    "scoreInPercent" INTEGER NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizResults_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizResultQuestion" (
    "quizResultId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,

    CONSTRAINT "QuizResultQuestion_pkey" PRIMARY KEY ("quizResultId","questionId")
);

-- CreateTable
CREATE TABLE "QuizQuestion" (
    "id" SERIAL NOT NULL,
    "quizType" "QuizType" NOT NULL,
    "questionText" TEXT NOT NULL,
    "options" TEXT[],
    "difficultyLevel" "DifficultyLevels" NOT NULL,
    "answer" TEXT NOT NULL,

    CONSTRAINT "QuizQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_QuizQuestionToWord" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_QuizQuestionToWord_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "QuizResults_userId_idx" ON "QuizResults"("userId");

-- CreateIndex
CREATE INDEX "QuizResultQuestion_questionId_idx" ON "QuizResultQuestion"("questionId");

-- CreateIndex
CREATE INDEX "_QuizQuestionToWord_B_index" ON "_QuizQuestionToWord"("B");

-- AddForeignKey
ALTER TABLE "QuizResults" ADD CONSTRAINT "QuizResults_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizResultQuestion" ADD CONSTRAINT "QuizResultQuestion_quizResultId_fkey" FOREIGN KEY ("quizResultId") REFERENCES "QuizResults"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizResultQuestion" ADD CONSTRAINT "QuizResultQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuizQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QuizQuestionToWord" ADD CONSTRAINT "_QuizQuestionToWord_A_fkey" FOREIGN KEY ("A") REFERENCES "QuizQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QuizQuestionToWord" ADD CONSTRAINT "_QuizQuestionToWord_B_fkey" FOREIGN KEY ("B") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;