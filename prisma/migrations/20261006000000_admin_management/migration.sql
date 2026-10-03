-- Category dùng chung toàn hệ thống: gộp theo lower(trim(name)), giữ bản cũ nhất.

-- Bảng tạm: old_id -> keep_id (keep = createdAt nhỏ nhất, bằng nhau thì id nhỏ nhất)
CREATE TEMP TABLE "_category_merge" AS
SELECT
  c."id" AS old_id,
  FIRST_VALUE(c."id") OVER (
    PARTITION BY lower(btrim(regexp_replace(c."name", '\s+', ' ', 'g')))
    ORDER BY c."createdAt" ASC, c."id" ASC
  ) AS keep_id
FROM "Category" c;

-- Chuyển bộ thẻ sang bản giữ lại TRƯỚC khi xoá bản trùng
UPDATE "StudySet" s
SET "categoryId" = m.keep_id
FROM "_category_merge" m
WHERE s."categoryId" = m.old_id AND m.old_id <> m.keep_id;

DELETE FROM "Category" c
USING "_category_merge" m
WHERE c."id" = m.old_id AND m.old_id <> m.keep_id;

DROP TABLE "_category_merge";

-- Chuẩn hoá tên
UPDATE "Category" SET "name" = btrim(regexp_replace("name", '\s+', ' ', 'g'));

-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_userId_fkey";

-- DropIndex
DROP INDEX "Category_userId_idx";

-- DropIndex
DROP INDEX "Category_userId_name_key";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "userId",
ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0;

-- position theo thứ tự createdAt
UPDATE "Category" c
SET "position" = r.rn
FROM (
  SELECT "id", (ROW_NUMBER() OVER (ORDER BY "createdAt" ASC, "id" ASC) - 1)::int AS rn FROM "Category"
) r
WHERE c."id" = r."id";

-- AlterTable
ALTER TABLE "StudySet" ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "disabledAt" TIMESTAMP(3),
ADD COLUMN     "disabledReason" TEXT,
ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "quotaAiPerDay" INTEGER,
ADD COLUMN     "quotaCards" INTEGER,
ADD COLUMN     "quotaSets" INTEGER;

-- CreateTable
CREATE TABLE "AdminAuditLog" (
    "id" UUID NOT NULL,
    "adminId" UUID,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "summary" TEXT NOT NULL,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdminAuditLog_createdAt_idx" ON "AdminAuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AdminAuditLog_targetType_targetId_idx" ON "AdminAuditLog"("targetType", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- Trùng tên không phân biệt hoa/thường (Prisma không biểu diễn được -> SQL thô)
CREATE UNIQUE INDEX "Category_name_lower_key" ON "Category"(lower("name"));

-- AddForeignKey
ALTER TABLE "AdminAuditLog" ADD CONSTRAINT "AdminAuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
