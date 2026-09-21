-- Drop the legacy result tables. Their data was backfilled into
-- CombinedExamResult by 20260921120000_backfill_combined_exam_result.
-- This intentionally discards the legacy tables and their implicit m2m joins.

-- DropForeignKey
ALTER TABLE "QuizResults" DROP CONSTRAINT "QuizResults_examId_fkey";

-- DropForeignKey
ALTER TABLE "QuizResults" DROP CONSTRAINT "QuizResults_quizTypeId_fkey";

-- DropForeignKey
ALTER TABLE "QuizResults" DROP CONSTRAINT "QuizResults_userId_fkey";

-- DropForeignKey
ALTER TABLE "VocabularyExamResult" DROP CONSTRAINT "VocabularyExamResult_quizTypeId_fkey";

-- DropForeignKey
ALTER TABLE "VocabularyExamResult" DROP CONSTRAINT "VocabularyExamResult_userId_fkey";

-- DropForeignKey
ALTER TABLE "_CorrectQuizQuestion" DROP CONSTRAINT "_CorrectQuizQuestion_A_fkey";

-- DropForeignKey
ALTER TABLE "_CorrectQuizQuestion" DROP CONSTRAINT "_CorrectQuizQuestion_B_fkey";

-- DropForeignKey
ALTER TABLE "_CorrectWords" DROP CONSTRAINT "_CorrectWords_A_fkey";

-- DropForeignKey
ALTER TABLE "_CorrectWords" DROP CONSTRAINT "_CorrectWords_B_fkey";

-- DropForeignKey
ALTER TABLE "_InCorrectWords" DROP CONSTRAINT "_InCorrectWords_A_fkey";

-- DropForeignKey
ALTER TABLE "_InCorrectWords" DROP CONSTRAINT "_InCorrectWords_B_fkey";

-- DropForeignKey
ALTER TABLE "_IncorrectQuizQuestion" DROP CONSTRAINT "_IncorrectQuizQuestion_A_fkey";

-- DropForeignKey
ALTER TABLE "_IncorrectQuizQuestion" DROP CONSTRAINT "_IncorrectQuizQuestion_B_fkey";

-- DropTable
DROP TABLE "QuizResults";

-- DropTable
DROP TABLE "VocabularyExamResult";

-- DropTable
DROP TABLE "_CorrectQuizQuestion";

-- DropTable
DROP TABLE "_CorrectWords";

-- DropTable
DROP TABLE "_InCorrectWords";

-- DropTable
DROP TABLE "_IncorrectQuizQuestion";