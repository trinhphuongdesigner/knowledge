-- AlterTable
ALTER TABLE "StudyDay" ADD COLUMN "goal" INTEGER NOT NULL DEFAULT 20;

-- Backfill: lịch sử cũ không lưu mục tiêu theo ngày → dùng mục tiêu hiện tại của user.
UPDATE "StudyDay" sd SET "goal" = u."dailyGoal" FROM "User" u WHERE u."id" = sd."userId";
