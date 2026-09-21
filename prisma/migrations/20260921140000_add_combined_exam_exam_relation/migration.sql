-- AddForeignKey
ALTER TABLE "CombinedExamResult" ADD CONSTRAINT "CombinedExamResult_examId_fkey" FOREIGN KEY ("examId") REFERENCES "QuizExam"("id") ON DELETE SET NULL ON UPDATE CASCADE;
