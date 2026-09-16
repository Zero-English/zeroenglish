-- DropForeignKey
ALTER TABLE "GrammarTopic" DROP CONSTRAINT "GrammarTopic_quizTypeId_fkey";

-- DropTable
DROP TABLE "GrammarTopic";

-- DropTable
DROP TABLE "QuizClass";

-- CreateTable
CREATE TABLE "_CorrectQuizQuestion" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CorrectQuizQuestion_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_IncorrectQuizQuestion" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_IncorrectQuizQuestion_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CorrectQuizQuestion_B_index" ON "_CorrectQuizQuestion"("B");

-- CreateIndex
CREATE INDEX "_IncorrectQuizQuestion_B_index" ON "_IncorrectQuizQuestion"("B");

-- AddForeignKey
ALTER TABLE "_CorrectQuizQuestion" ADD CONSTRAINT "_CorrectQuizQuestion_A_fkey" FOREIGN KEY ("A") REFERENCES "QuizQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CorrectQuizQuestion" ADD CONSTRAINT "_CorrectQuizQuestion_B_fkey" FOREIGN KEY ("B") REFERENCES "QuizResults"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IncorrectQuizQuestion" ADD CONSTRAINT "_IncorrectQuizQuestion_A_fkey" FOREIGN KEY ("A") REFERENCES "QuizQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IncorrectQuizQuestion" ADD CONSTRAINT "_IncorrectQuizQuestion_B_fkey" FOREIGN KEY ("B") REFERENCES "QuizResults"("id") ON DELETE CASCADE ON UPDATE CASCADE;