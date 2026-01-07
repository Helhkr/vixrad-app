-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'TRIAL', 'BLUE');

-- CreateEnum
CREATE TYPE "AiPurpose" AS ENUM ('REPORT_GENERATION', 'INDICATION_FROM_TEXT', 'INDICATION_FROM_FILE');

-- CreateEnum
CREATE TYPE "AiRequestStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'TRIAL',
ADD COLUMN     "subscriptionEndsAt" TIMESTAMP(3),
ADD COLUMN     "subscriptionStartedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "AiRequestUsage" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "purpose" "AiPurpose" NOT NULL,
    "status" "AiRequestStatus" NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "windowEnd" TIMESTAMP(3) NOT NULL,
    "requestedModel" TEXT NOT NULL,
    "usedModel" TEXT,
    "expiresAt" TIMESTAMP(3),
    "promptTokens" INTEGER,
    "outputTokens" INTEGER,
    "totalTokens" INTEGER,
    "usageSource" TEXT,
    "failSafeUsed" BOOLEAN NOT NULL DEFAULT false,
    "errorMessage" TEXT,

    CONSTRAINT "AiRequestUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiRequestUsage_userId_createdAt_idx" ON "AiRequestUsage"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AiRequestUsage_userId_requestedModel_status_idx" ON "AiRequestUsage"("userId", "requestedModel", "status");

-- CreateIndex
CREATE INDEX "AiRequestUsage_userId_requestedModel_windowStart_windowEnd__idx" ON "AiRequestUsage"("userId", "requestedModel", "windowStart", "windowEnd", "status");

-- AddForeignKey
ALTER TABLE "AiRequestUsage" ADD CONSTRAINT "AiRequestUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
