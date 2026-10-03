-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "useGoogleAvatar" BOOLEAN NOT NULL DEFAULT true;
