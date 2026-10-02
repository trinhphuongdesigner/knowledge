-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PRIVATE', 'LINK', 'PUBLIC');

-- CreateEnum
CREATE TYPE "ReviewMode" AS ENUM ('FLASHCARD', 'QUIZ', 'TYPING', 'MATCHING', 'LISTEN', 'CLOZE', 'REVIEW');

-- AlterTable
ALTER TABLE "StudySet" ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "shareToken" TEXT,
ADD COLUMN     "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dailyGoal" INTEGER NOT NULL DEFAULT 20,
ADD COLUMN     "emailReminders" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastReminderAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "SetSubscription" (
    "userId" UUID NOT NULL,
    "setId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SetSubscription_pkey" PRIMARY KEY ("userId","setId")
);

-- CreateTable
CREATE TABLE "CardReview" (
    "userId" UUID NOT NULL,
    "cardId" UUID NOT NULL,
    "setId" UUID NOT NULL,
    "ease" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "interval" INTEGER NOT NULL DEFAULT 0,
    "reps" INTEGER NOT NULL DEFAULT 0,
    "lapses" INTEGER NOT NULL DEFAULT 0,
    "due" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReviewedAt" TIMESTAMP(3),
    "starred" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CardReview_pkey" PRIMARY KEY ("userId","cardId")
);

-- CreateTable
CREATE TABLE "StudyDay" (
    "userId" UUID NOT NULL,
    "day" DATE NOT NULL,
    "reviewed" INTEGER NOT NULL DEFAULT 0,
    "correct" INTEGER NOT NULL DEFAULT 0,
    "newCards" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "StudyDay_pkey" PRIMARY KEY ("userId","day")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiUsage" (
    "userId" UUID NOT NULL,
    "day" DATE NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AiUsage_pkey" PRIMARY KEY ("userId","day")
);

-- CreateTable
CREATE TABLE "JobRun" (
    "name" TEXT NOT NULL,
    "lastRunAt" TIMESTAMP(3) NOT NULL,
    "ok" BOOLEAN NOT NULL,
    "result" JSONB,

    CONSTRAINT "JobRun_pkey" PRIMARY KEY ("name")
);

-- CreateIndex
CREATE INDEX "SetSubscription_setId_idx" ON "SetSubscription"("setId");

-- CreateIndex
CREATE INDEX "CardReview_userId_due_idx" ON "CardReview"("userId", "due");

-- CreateIndex
CREATE INDEX "CardReview_userId_setId_idx" ON "CardReview"("userId", "setId");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StudySet_shareToken_key" ON "StudySet"("shareToken");

-- CreateIndex
CREATE INDEX "StudySet_visibility_approved_publishedAt_idx" ON "StudySet"("visibility", "approved", "publishedAt");

-- AddForeignKey
ALTER TABLE "SetSubscription" ADD CONSTRAINT "SetSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SetSubscription" ADD CONSTRAINT "SetSubscription_setId_fkey" FOREIGN KEY ("setId") REFERENCES "StudySet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardReview" ADD CONSTRAINT "CardReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardReview" ADD CONSTRAINT "CardReview_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardReview" ADD CONSTRAINT "CardReview_setId_fkey" FOREIGN KEY ("setId") REFERENCES "StudySet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyDay" ADD CONSTRAINT "StudyDay_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiUsage" ADD CONSTRAINT "AiUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

