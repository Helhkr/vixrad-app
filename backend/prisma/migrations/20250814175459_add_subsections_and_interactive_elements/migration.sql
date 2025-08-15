/*
  Warnings:

  - You are about to drop the column `content` on the `TemplateSection` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TemplateSection" DROP COLUMN "content";

-- CreateTable
CREATE TABLE "TemplateSubsection" (
    "id" TEXT NOT NULL,
    "section_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TemplateSubsection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InteractiveElement" (
    "id" TEXT NOT NULL,
    "subsection_id" TEXT NOT NULL,
    "source_action_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "default_value" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InteractiveElement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InteractiveElement_source_action_id_key" ON "InteractiveElement"("source_action_id");

-- AddForeignKey
ALTER TABLE "TemplateSubsection" ADD CONSTRAINT "TemplateSubsection_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "TemplateSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InteractiveElement" ADD CONSTRAINT "InteractiveElement_subsection_id_fkey" FOREIGN KEY ("subsection_id") REFERENCES "TemplateSubsection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
