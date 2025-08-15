-- AlterTable
ALTER TABLE "Template" ADD COLUMN     "report_title" TEXT,
ADD COLUMN     "report_title_alignment" TEXT DEFAULT 'center',
ADD COLUMN     "report_title_bold" BOOLEAN DEFAULT true,
ADD COLUMN     "report_title_uppercase" BOOLEAN DEFAULT true;
