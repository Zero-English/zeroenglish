-- CreateEnum
CREATE TYPE "IsLearned" AS ENUM ('LEARNED', 'UNLEARNED');

-- CreateTable
CREATE TABLE "UserBookmark" (
    "userId" INTEGER NOT NULL,
    "wordId" INTEGER NOT NULL,
    "bookmarkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBookmark_pkey" PRIMARY KEY ("userId","wordId")
);

-- CreateTable
CREATE TABLE "WordLearningEvent" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "wordId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WordLearningEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserWord" (
    "userId" INTEGER NOT NULL,
    "wordId" INTEGER NOT NULL,
    "isLearned" "IsLearned" NOT NULL DEFAULT 'UNLEARNED',

    CONSTRAINT "UserWord_pkey" PRIMARY KEY ("userId","wordId")
);

-- CreateIndex
CREATE INDEX "UserBookmark_userId_bookmarkedAt_idx" ON "UserBookmark"("userId", "bookmarkedAt");

-- CreateIndex
CREATE INDEX "WordLearningEvent_userId_createdAt_idx" ON "WordLearningEvent"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "UserWord_userId_isLearned_idx" ON "UserWord"("userId", "isLearned");

-- AddForeignKey
ALTER TABLE "UserBookmark" ADD CONSTRAINT "UserBookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBookmark" ADD CONSTRAINT "UserBookmark_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordLearningEvent" ADD CONSTRAINT "WordLearningEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordLearningEvent" ADD CONSTRAINT "WordLearningEvent_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWord" ADD CONSTRAINT "UserWord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWord" ADD CONSTRAINT "UserWord_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;