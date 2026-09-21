-- AlterTable
ALTER TABLE "Word" ADD COLUMN "addedByUserId" INTEGER;
ALTER TABLE "Word" ADD COLUMN "isPending" BOOLEAN NOT NULL DEFAULT true;

-- Backfill existing words to the designated admin user (id 2) so the
-- NOT NULL constraint below can be applied without losing a single row.
UPDATE "Word" w
SET "addedByUserId" = COALESCE(
    (SELECT id FROM "User" WHERE id = 2),
    (SELECT id FROM "User" WHERE "role" = 'admin' ORDER BY id LIMIT 1),
    (SELECT id FROM "User" ORDER BY id LIMIT 1)
)
WHERE w."addedByUserId" IS NULL;

-- Guarantee every row has an owner before enforcing the constraint.
ALTER TABLE "Word" ALTER COLUMN "addedByUserId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Word" ADD CONSTRAINT "Word_addedByUserId_fkey" FOREIGN KEY ("addedByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;