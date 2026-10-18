-- CreateEnum
CREATE TYPE "WrittenStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "Written" (
    "id" SERIAL NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleBn" TEXT NOT NULL,
    "contentEnEasy" TEXT NOT NULL,
    "contentEnMedium" TEXT NOT NULL,
    "contentEnHard" TEXT NOT NULL,
    "contentBnEasy" TEXT NOT NULL,
    "contentBnMedium" TEXT NOT NULL,
    "contentBnHard" TEXT NOT NULL,
    "writtenTypeId" INTEGER NOT NULL,
    "writtenByUserId" INTEGER NOT NULL,
    "metaTitle" TEXT NOT NULL,
    "metaDescription" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "WrittenStatus" NOT NULL DEFAULT 'PENDING',
    "keywords" TEXT[],
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Written_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WrittenType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "WrittenType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Written_slug_key" ON "Written"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "WrittenType_name_key" ON "WrittenType"("name");

-- AddForeignKey
ALTER TABLE "Written" ADD CONSTRAINT "Written_writtenTypeId_fkey" FOREIGN KEY ("writtenTypeId") REFERENCES "WrittenType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Written" ADD CONSTRAINT "Written_writtenByUserId_fkey" FOREIGN KEY ("writtenByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Ensure GrammarRules exists if missing
CREATE TABLE IF NOT EXISTS "GrammarRules" (
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

-- Ensure _GrammarPrerequisites exists if missing
CREATE TABLE IF NOT EXISTS "_GrammarPrerequisites" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_GrammarPrerequisites_AB_pkey" PRIMARY KEY ("A","B")
);

CREATE INDEX IF NOT EXISTS "_GrammarPrerequisites_B_index" ON "_GrammarPrerequisites"("B");

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'GrammarRules_grammarCategoryId_fkey') THEN
        ALTER TABLE "GrammarRules" ADD CONSTRAINT "GrammarRules_grammarCategoryId_fkey" FOREIGN KEY ("grammarCategoryId") REFERENCES "QuizType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'GrammarRules_createdByUserId_fkey') THEN
        ALTER TABLE "GrammarRules" ADD CONSTRAINT "GrammarRules_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_GrammarPrerequisites_A_fkey') THEN
        ALTER TABLE "_GrammarPrerequisites" ADD CONSTRAINT "_GrammarPrerequisites_A_fkey" FOREIGN KEY ("A") REFERENCES "GrammarRules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_GrammarPrerequisites_B_fkey') THEN
        ALTER TABLE "_GrammarPrerequisites" ADD CONSTRAINT "_GrammarPrerequisites_B_fkey" FOREIGN KEY ("B") REFERENCES "GrammarRules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

