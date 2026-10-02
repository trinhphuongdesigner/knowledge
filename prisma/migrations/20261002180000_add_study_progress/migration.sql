-- CreateTable
CREATE TABLE "StudyProgress" (
    "userId" UUID NOT NULL,
    "setId" UUID NOT NULL,
    "known" TEXT[],
    "unknown" TEXT[],
    "order" TEXT[],
    "index" INTEGER NOT NULL DEFAULT 0,
    "shuffle" BOOLEAN NOT NULL DEFAULT false,
    "swap" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyProgress_pkey" PRIMARY KEY ("userId","setId")
);

-- CreateIndex
CREATE INDEX "StudyProgress_userId_updatedAt_idx" ON "StudyProgress"("userId", "updatedAt");

-- AddForeignKey
ALTER TABLE "StudyProgress" ADD CONSTRAINT "StudyProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyProgress" ADD CONSTRAINT "StudyProgress_setId_fkey" FOREIGN KEY ("setId") REFERENCES "StudySet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
