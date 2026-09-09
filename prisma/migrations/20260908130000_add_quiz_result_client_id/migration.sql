-- AlterTable
ALTER TABLE "QuizResults" ADD COLUMN "clientId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "QuizResults_clientId_key" ON "QuizResults"("clientId");