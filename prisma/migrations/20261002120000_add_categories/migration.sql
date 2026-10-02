-- Data-preserving migration: enum "Category" (IT | ENGLISH) -> per-user "Category" table.
-- Every user gets two default categories ("IT" BLUE, "Tiếng Anh" GREEN isEnglish); existing sets
-- are mapped from the old enum value, then the old column and enum are dropped.

-- The old enum shares its name with the new table's row type, so move it out of the way first.
ALTER TYPE "Category" RENAME TO "Category_old";

-- CreateEnum
CREATE TYPE "CategoryColor" AS ENUM ('BLUE', 'GREEN', 'AMBER', 'PURPLE', 'ROSE', 'SLATE');

-- CreateTable
CREATE TABLE "Category" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "color" "CategoryColor" NOT NULL DEFAULT 'BLUE',
    "isEnglish" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Category_userId_idx" ON "Category"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_userId_name_key" ON "Category"("userId", "name");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Default categories for every existing user (even those without sets).
INSERT INTO "Category" ("id", "userId", "name", "color", "isEnglish", "updatedAt")
SELECT gen_random_uuid(), u."id", 'IT', 'BLUE'::"CategoryColor", false, CURRENT_TIMESTAMP FROM "User" u;

INSERT INTO "Category" ("id", "userId", "name", "color", "isEnglish", "updatedAt")
SELECT gen_random_uuid(), u."id", 'Tiếng Anh', 'GREEN'::"CategoryColor", true, CURRENT_TIMESTAMP FROM "User" u;

-- AlterTable: add nullable, backfill, then enforce NOT NULL.
ALTER TABLE "StudySet" ADD COLUMN "categoryId" UUID;

UPDATE "StudySet" s
SET "categoryId" = c."id"
FROM "Category" c
WHERE c."userId" = s."userId"
  AND c."name" = CASE s."category"::text WHEN 'ENGLISH' THEN 'Tiếng Anh' ELSE 'IT' END;

ALTER TABLE "StudySet" ALTER COLUMN "categoryId" SET NOT NULL;

ALTER TABLE "StudySet" DROP COLUMN "category";

-- DropEnum
DROP TYPE "Category_old";

-- AddForeignKey
ALTER TABLE "StudySet" ADD CONSTRAINT "StudySet_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

