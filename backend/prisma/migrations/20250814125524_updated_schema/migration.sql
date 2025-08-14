/*
  Warnings:

  - You are about to drop the column `authorId` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `modality` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `specialty` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `templateId` on the `TemplateSection` table. All the data in the column will be lost.
  - You are about to drop the `TemplateSubsection` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `created_by_id` to the `Template` table without a default value. This is not possible if the table is not empty.
  - Added the required column `template_id` to the `TemplateSection` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Template" DROP CONSTRAINT "Template_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TemplateSection" DROP CONSTRAINT "TemplateSection_templateId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TemplateSubsection" DROP CONSTRAINT "TemplateSubsection_sectionId_fkey";

-- DropIndex
DROP INDEX "public"."User_crm_key";

-- AlterTable
ALTER TABLE "public"."Template" DROP COLUMN "authorId",
DROP COLUMN "modality",
DROP COLUMN "specialty",
ADD COLUMN     "category_id" TEXT,
ADD COLUMN     "created_by_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."TemplateSection" DROP COLUMN "templateId",
ADD COLUMN     "default_text" TEXT,
ADD COLUMN     "template_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."TemplateSubsection";

-- CreateTable
CREATE TABLE "public"."TemplateCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TemplateCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ActionRule" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "source_action_id" TEXT NOT NULL,
    "target_section_id" TEXT NOT NULL,
    "action_text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActionRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Report" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "pdf_url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReportData" (
    "id" TEXT NOT NULL,
    "report_id" TEXT NOT NULL,
    "section_id" TEXT NOT NULL,
    "content" TEXT,

    CONSTRAINT "ReportData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Letterhead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "header_image_url" TEXT,
    "footer_image_url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Letterhead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TemplateCategory_name_key" ON "public"."TemplateCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ReportData_report_id_section_id_key" ON "public"."ReportData"("report_id", "section_id");

-- AddForeignKey
ALTER TABLE "public"."Template" ADD CONSTRAINT "Template_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Template" ADD CONSTRAINT "Template_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."TemplateCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TemplateSection" ADD CONSTRAINT "TemplateSection_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ActionRule" ADD CONSTRAINT "ActionRule_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Report" ADD CONSTRAINT "Report_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Report" ADD CONSTRAINT "Report_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."Template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReportData" ADD CONSTRAINT "ReportData_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "public"."Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReportData" ADD CONSTRAINT "ReportData_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "public"."TemplateSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
