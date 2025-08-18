/*
  Warnings:

  - You are about to drop the `ActionRule` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."ActionRule" DROP CONSTRAINT "ActionRule_targetElementGroupId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ActionRule" DROP CONSTRAINT "ActionRule_triggerOptionId_fkey";

-- AlterTable
ALTER TABLE "public"."InteractiveElement" ADD COLUMN     "optionId" TEXT,
ALTER COLUMN "label" DROP NOT NULL,
ALTER COLUMN "elementGroupId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Option" ALTER COLUMN "textToAdd" DROP NOT NULL;

-- DropTable
DROP TABLE "public"."ActionRule";

-- AddForeignKey
ALTER TABLE "public"."InteractiveElement" ADD CONSTRAINT "InteractiveElement_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "public"."Option"("id") ON DELETE CASCADE ON UPDATE CASCADE;
