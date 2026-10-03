-- DropForeignKey
ALTER TABLE "PasswordResetToken" DROP CONSTRAINT "PasswordResetToken_userId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "passwordHash",
ADD COLUMN     "birthYear" INTEGER,
ADD COLUMN     "firebaseUid" TEXT,
ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "nativeLanguage" TEXT,
ADD COLUMN     "onboardedAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "PasswordResetToken";

-- CreateIndex
CREATE UNIQUE INDEX "User_firebaseUid_key" ON "User"("firebaseUid");

