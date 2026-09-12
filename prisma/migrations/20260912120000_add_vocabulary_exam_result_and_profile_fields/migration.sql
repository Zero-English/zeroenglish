-- CreateEnum
CREATE TYPE "Class" AS ENUM ('PrePrimary', 'Class1', 'Class2', 'Class3', 'Class4', 'Class5', 'Class6', 'Class7', 'Class8', 'SSC', 'HSC', 'IELTS', 'TOEFL', 'University', 'Masters', 'Diploma', 'BCS', 'JOB');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'NOT_SET');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "class" "Class",
ADD COLUMN     "gender" "Gender" NOT NULL DEFAULT 'NOT_SET',
ADD COLUMN     "institutionName" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "socialLinks" TEXT[];

-- CreateTable
CREATE TABLE "VocabularyExamResult" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "scoreInPercent" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "levels" "Levels"[],
    "timePerWord" INTEGER NOT NULL,
    "quizTypeId" INTEGER NOT NULL,

    CONSTRAINT "VocabularyExamResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CorrectWords" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CorrectWords_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_InCorrectWords" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_InCorrectWords_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CorrectWords_B_index" ON "_CorrectWords"("B");

-- CreateIndex
CREATE INDEX "_InCorrectWords_B_index" ON "_InCorrectWords"("B");

-- AddForeignKey
ALTER TABLE "VocabularyExamResult" ADD CONSTRAINT "VocabularyExamResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VocabularyExamResult" ADD CONSTRAINT "VocabularyExamResult_quizTypeId_fkey" FOREIGN KEY ("quizTypeId") REFERENCES "QuizType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CorrectWords" ADD CONSTRAINT "_CorrectWords_A_fkey" FOREIGN KEY ("A") REFERENCES "VocabularyExamResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CorrectWords" ADD CONSTRAINT "_CorrectWords_B_fkey" FOREIGN KEY ("B") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InCorrectWords" ADD CONSTRAINT "_InCorrectWords_A_fkey" FOREIGN KEY ("A") REFERENCES "VocabularyExamResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InCorrectWords" ADD CONSTRAINT "_InCorrectWords_B_fkey" FOREIGN KEY ("B") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;