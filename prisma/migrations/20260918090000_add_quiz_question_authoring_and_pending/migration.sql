-- AlterEnum
ALTER TYPE "Roles" ADD VALUE 'contributor';

-- AlterTable
ALTER TABLE "QuizQuestion" ADD COLUMN "addedByUserId" INTEGER;
ALTER TABLE "QuizQuestion" ADD COLUMN "isPending" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "isPending" BOOLEAN NOT NULL DEFAULT true;

-- Backfill existing quiz questions to the designated admin user (id 2) so the
-- NOT NULL constraint below can be applied without losing a single row.
UPDATE "QuizQuestion" q
SET "addedByUserId" = COALESCE(
    (SELECT id FROM "User" WHERE id = 2),
    (SELECT id FROM "User" WHERE "role" = 'admin' ORDER BY id LIMIT 1),
    (SELECT id FROM "User" ORDER BY id LIMIT 1)
)
WHERE q."addedByUserId" IS NULL;

-- Guarantee every row has an owner before enforcing the constraint.
ALTER TABLE "QuizQuestion" ALTER COLUMN "addedByUserId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_addedByUserId_fkey" FOREIGN KEY ("addedByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;