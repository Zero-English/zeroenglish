-- CreateTable
CREATE TABLE "Word" (
    "id" SERIAL NOT NULL,
    "word" TEXT NOT NULL,
    "meaningBn" TEXT[],
    "synonyms" TEXT[],
    "antonyms" TEXT[],
    "definitionEn" TEXT NOT NULL,
    "definitionBn" TEXT NOT NULL,
    "examplesEn" TEXT[],
    "examplesBn" TEXT[],
    "level" "Levels" NOT NULL,
    "category" "WordCategory" NOT NULL,
    "wordType" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Word_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Word_word_key" ON "Word"("word");

-- CreateIndex
CREATE INDEX "Word_level_idx" ON "Word"("level");

-- CreateIndex
CREATE INDEX "Word_category_idx" ON "Word"("category");
