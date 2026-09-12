-- Media library backed by ImageKit. Stores the ImageKit fileId and derived
-- metadata so admin/consumer pages can render or delete the asset later.
CREATE TABLE "Media" (
    "id"        SERIAL PRIMARY KEY,
    "fileId"    TEXT NOT NULL,
    "url"       TEXT NOT NULL,
    "name"      TEXT NOT NULL,
    "filePath"  TEXT NOT NULL,
    "mimeType"  TEXT NOT NULL,
    "size"      INTEGER NOT NULL,
    "width"     INTEGER,
    "height"    INTEGER,
    "altText"   TEXT NOT NULL DEFAULT '',
    "caption"   TEXT NOT NULL DEFAULT '',
    "folder"    TEXT NOT NULL DEFAULT '',
    "tags"      TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE UNIQUE INDEX "Media_fileId_key" ON "Media" ("fileId");
CREATE INDEX "Media_createdAt_idx" ON "Media" ("createdAt");