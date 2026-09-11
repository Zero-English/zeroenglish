-- Add the VocabMeta singleton row used to track vocabulary dataset versions
-- for client-side IndexedDB caching.

CREATE TABLE "VocabMeta" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VocabMeta_pkey" PRIMARY KEY ("id")
);

INSERT INTO "VocabMeta" ("id", "version", "updatedAt")
VALUES (1, 1, NOW());