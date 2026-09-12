-- Connect Blog to Media via a featured image relation.

-- Drop the unused loose `media` string column.
ALTER TABLE "Blog" DROP COLUMN "media";

-- Add the nullable featured media relation column.
ALTER TABLE "Blog" ADD COLUMN "featuredMediaId" INTEGER;

-- Foreign key to Media (SetNull on delete to keep the blog).
ALTER TABLE "Blog"
    ADD CONSTRAINT "Blog_featuredMediaId_fkey"
    FOREIGN KEY ("featuredMediaId") REFERENCES "Media" ("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Indexes matching @@index([featuredMediaId]) and @@index([published, createdAt]).
CREATE INDEX "Blog_featuredMediaId_idx" ON "Blog" ("featuredMediaId");
CREATE INDEX "Blog_published_createdAt_idx" ON "Blog" ("published", "createdAt");