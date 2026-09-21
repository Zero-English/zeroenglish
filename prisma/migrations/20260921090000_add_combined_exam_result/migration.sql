-- CreateTable
CREATE TABLE "CombinedExamResult" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "scoreInPercent" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "levels" "Levels"[],
    "timePerQuestion" INTEGER NOT NULL,
    "quizTypeId" INTEGER NOT NULL,
    "examId" INTEGER,
    "clientId" TEXT,
    "title" TEXT NOT NULL,
    "mode" "QuizMode" NOT NULL,
    "timeTotalQuiz" INTEGER NOT NULL,
    "scheduleEnabled" BOOLEAN NOT NULL DEFAULT false,
    "scheduledOpeningTime" TIMESTAMP(3),
    "scheduledClosingTime" TIMESTAMP(3),
    "status" "QuizResultStatus" NOT NULL DEFAULT 'SUBMITTED',
    "isFirstAttempt" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CombinedExamResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CombinedExamCorrectWords" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CombinedExamCorrectWords_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CombinedExamIncorrectWords" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CombinedExamIncorrectWords_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CombinedExamCorrectQuestions" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CombinedExamCorrectQuestions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CombinedExamIncorrectQuestions" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CombinedExamIncorrectQuestions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CombinedExamCorrectWords_B_index" ON "_CombinedExamCorrectWords"("B");

-- CreateIndex
CREATE INDEX "_CombinedExamIncorrectWords_B_index" ON "_CombinedExamIncorrectWords"("B");

-- CreateIndex
CREATE INDEX "_CombinedExamCorrectQuestions_B_index" ON "_CombinedExamCorrectQuestions"("B");

-- CreateIndex
CREATE INDEX "_CombinedExamIncorrectQuestions_B_index" ON "_CombinedExamIncorrectQuestions"("B");

-- AddForeignKey
ALTER TABLE "CombinedExamResult" ADD CONSTRAINT "CombinedExamResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CombinedExamResult" ADD CONSTRAINT "CombinedExamResult_quizTypeId_fkey" FOREIGN KEY ("quizTypeId") REFERENCES "QuizType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CombinedExamCorrectWords" ADD CONSTRAINT "_CombinedExamCorrectWords_A_fkey" FOREIGN KEY ("A") REFERENCES "CombinedExamResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CombinedExamCorrectWords" ADD CONSTRAINT "_CombinedExamCorrectWords_B_fkey" FOREIGN KEY ("B") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CombinedExamIncorrectWords" ADD CONSTRAINT "_CombinedExamIncorrectWords_A_fkey" FOREIGN KEY ("A") REFERENCES "CombinedExamResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CombinedExamIncorrectWords" ADD CONSTRAINT "_CombinedExamIncorrectWords_B_fkey" FOREIGN KEY ("B") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CombinedExamCorrectQuestions" ADD CONSTRAINT "_CombinedExamCorrectQuestions_A_fkey" FOREIGN KEY ("A") REFERENCES "CombinedExamResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CombinedExamCorrectQuestions" ADD CONSTRAINT "_CombinedExamCorrectQuestions_B_fkey" FOREIGN KEY ("B") REFERENCES "QuizQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CombinedExamIncorrectQuestions" ADD CONSTRAINT "_CombinedExamIncorrectQuestions_A_fkey" FOREIGN KEY ("A") REFERENCES "CombinedExamResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CombinedExamIncorrectQuestions" ADD CONSTRAINT "_CombinedExamIncorrectQuestions_B_fkey" FOREIGN KEY ("B") REFERENCES "QuizQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;