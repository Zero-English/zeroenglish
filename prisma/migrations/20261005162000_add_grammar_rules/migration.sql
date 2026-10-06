-- CreateEnum
CREATE TYPE "grammarRuleStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "GrammarRules" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "grammarCategoryId" INTEGER NOT NULL,
    "level" "Levels" NOT NULL,
    "examples" TEXT[],
    "status" "grammarRuleStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdByUserId" INTEGER NOT NULL,
    "commonMistakes" TEXT[],

    CONSTRAINT "GrammarRules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GrammarPrerequisites" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_GrammarPrerequisites_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_GrammarPrerequisites_B_index" ON "_GrammarPrerequisites"("B");

-- AddForeignKey
ALTER TABLE "GrammarRules" ADD CONSTRAINT "GrammarRules_grammarCategoryId_fkey" FOREIGN KEY ("grammarCategoryId") REFERENCES "QuizType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrammarRules" ADD CONSTRAINT "GrammarRules_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GrammarPrerequisites" ADD CONSTRAINT "_GrammarPrerequisites_A_fkey" FOREIGN KEY ("A") REFERENCES "GrammarRules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GrammarPrerequisites" ADD CONSTRAINT "_GrammarPrerequisites_B_fkey" FOREIGN KEY ("B") REFERENCES "GrammarRules"("id") ON DELETE CASCADE ON UPDATE CASCADE;