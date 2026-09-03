-- AlterTable: convert category from WordCategory enum to TEXT
ALTER TABLE "Word" ALTER COLUMN "category" TYPE TEXT USING "category"::text;

-- DropEnum
DROP TYPE "WordCategory";
