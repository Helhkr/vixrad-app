/*
  Warnings:

  - You are about to drop the column `category_id` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `created_by` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `TemplateSection` table. All the data in the column will be lost.
  - You are about to drop the column `default_text` on the `TemplateSection` table. All the data in the column will be lost.
  - You are about to drop the column `template_id` on the `TemplateSection` table. All the data in the column will be lost.
  - You are about to drop the `TemplateCategory` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `authorId` to the `Template` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modality` to the `Template` table without a default value. This is not possible if the table is not empty.
  - Added the required column `specialty` to the `Template` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Template` table without a default value. This is not possible if the table is not empty.
  - Added the required column `templateId` to the `TemplateSection` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Template" DROP CONSTRAINT "Template_category_id_fkey";

-- DropForeignKey
ALTER TABLE "Template" DROP CONSTRAINT "Template_created_by_fkey";

-- DropForeignKey
ALTER TABLE "TemplateSection" DROP CONSTRAINT "TemplateSection_template_id_fkey";

-- AlterTable
ALTER TABLE "Template" DROP COLUMN "category_id",
DROP COLUMN "created_at",
DROP COLUMN "created_by",
DROP COLUMN "updated_at",
ADD COLUMN     "authorId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "modality" TEXT NOT NULL,
ADD COLUMN     "specialty" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "TemplateSection" DROP COLUMN "created_at",
DROP COLUMN "default_text",
DROP COLUMN "template_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "templateId" TEXT NOT NULL;

-- DropTable
DROP TABLE "TemplateCategory";

-- CreateTable
CREATE TABLE "TemplateSubsection" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL,
    "content" JSONB NOT NULL,
    "sectionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TemplateSubsection_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateSection" ADD CONSTRAINT "TemplateSection_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateSubsection" ADD CONSTRAINT "TemplateSubsection_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "TemplateSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
