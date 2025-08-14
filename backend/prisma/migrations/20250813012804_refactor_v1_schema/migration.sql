/*
  Warnings:

  - You are about to drop the `ActionRule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Report` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReportData` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `status` on the `Subscription` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED', 'PAST_DUE', 'TRIALING');

-- DropForeignKey
ALTER TABLE "ActionRule" DROP CONSTRAINT "ActionRule_target_section_id_fkey";

-- DropForeignKey
ALTER TABLE "ActionRule" DROP CONSTRAINT "ActionRule_template_id_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_template_id_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_user_id_fkey";

-- DropForeignKey
ALTER TABLE "ReportData" DROP CONSTRAINT "ReportData_report_id_fkey";

-- DropForeignKey
ALTER TABLE "ReportData" DROP CONSTRAINT "ReportData_section_id_fkey";

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "status",
ADD COLUMN     "status" "SubscriptionStatus" NOT NULL;

-- DropTable
DROP TABLE "ActionRule";

-- DropTable
DROP TABLE "Report";

-- DropTable
DROP TABLE "ReportData";
