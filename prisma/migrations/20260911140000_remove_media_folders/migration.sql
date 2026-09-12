-- Remove folder persistence from the media library. Folders now exist only on
-- ImageKit; the DB no longer tracks a folder field or a MediaFolder table.
ALTER TABLE "Media" DROP CONSTRAINT "Media_folderId_fkey";
DROP INDEX "Media_folderId_idx";
ALTER TABLE "Media" DROP COLUMN "folderId";
DROP TABLE "MediaFolder";