-- AlterTable
ALTER TABLE "User" ADD COLUMN     "uiLanguage" TEXT;

-- Backfill: ngôn ngữ giao diện = tiếng mẹ đẻ nếu được hỗ trợ, ngược lại en
UPDATE "User" SET "uiLanguage" = CASE WHEN "nativeLanguage" IN ('en','vi','zh','ja','ko','ru','fr','th') THEN "nativeLanguage" ELSE 'en' END;
