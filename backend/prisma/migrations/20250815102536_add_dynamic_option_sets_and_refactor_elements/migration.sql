/*
  Warnings:

  - You are about to drop the column `subsection_id` on the `InteractiveElement` table. All the data in the column will be lost.
  - Added the required column `dynamic_option_set_id` to the `InteractiveElement` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."InteractiveElement" DROP CONSTRAINT "InteractiveElement_subsection_id_fkey";

-- AlterTable
ALTER TABLE "public"."InteractiveElement" DROP COLUMN "subsection_id",
ADD COLUMN     "dynamic_option_set_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."DynamicOptionSet" (
    "id" TEXT NOT NULL,
    "subsection_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DynamicOptionSet_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."DynamicOptionSet" ADD CONSTRAINT "DynamicOptionSet_subsection_id_fkey" FOREIGN KEY ("subsection_id") REFERENCES "public"."TemplateSubsection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InteractiveElement" ADD CONSTRAINT "InteractiveElement_dynamic_option_set_id_fkey" FOREIGN KEY ("dynamic_option_set_id") REFERENCES "public"."DynamicOptionSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ActionRule" ADD CONSTRAINT "ActionRule_source_action_id_fkey" FOREIGN KEY ("source_action_id") REFERENCES "public"."InteractiveElement"("source_action_id") ON DELETE RESTRICT ON UPDATE CASCADE;
