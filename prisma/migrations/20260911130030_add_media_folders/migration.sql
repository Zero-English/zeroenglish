-- Media folders for organizing the ImageKit media library. Each folder maps
-- 1:1 to a real ImageKit folder under the IMAGEKIT_UPLOAD_FOLDER path.
CREATE TABLE "MediaFolder" (
    "id"        SERIAL PRIMARY KEY,
    "name"      TEXT NOT NULL,
    "path"      TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "MediaFolder_name_key" ON "MediaFolder" ("name");
CREATE UNIQUE INDEX "MediaFolder_path_key" ON "MediaFolder" ("path");
CREATE INDEX "MediaFolder_name_idx" ON "MediaFolder" ("name");

-- Attach a folderId to existing media, removing the raw "folder" path column.
-- Files uploaded to the ImageKit root ("/zeroenglish") become folderId NULL.
INSERT INTO "MediaFolder" ("name", "path", "createdAt")
SELECT DISTINCT
    SUBSTRING("folder" FROM '([^/]+)$') AS "name",
    "folder" AS "path",
    CURRENT_TIMESTAMP
FROM "Media"
WHERE "folder" <> ''
  AND "folder" <> '/zeroenglish';

ALTER TABLE "Media" ADD COLUMN "folderId" INTEGER;

UPDATE "Media" AS m
SET "folderId" = f."id"
FROM "MediaFolder" AS f
WHERE f."path" = m."folder";

ALTER TABLE "Media"
    ADD CONSTRAINT "Media_folderId_fkey" FOREIGN KEY ("folderId")
        REFERENCES "MediaFolder" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "Media_folderId_idx" ON "Media" ("folderId");

ALTER TABLE "Media" DROP COLUMN "folder";