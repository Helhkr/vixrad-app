/*
  Warnings:

  - You are about to drop the column `action_text` on the `ActionRule` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[source_action_id]` on the table `ActionRule` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `action_text_on_activate` to the `ActionRule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ActionRule" DROP COLUMN "action_text",
ADD COLUMN     "action_text_on_activate" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "action_text_on_deactivate" TEXT;

-- Adicionado para remover o default após a migração
ALTER TABLE "ActionRule" ALTER COLUMN "action_text_on_activate" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "ActionRule_source_action_id_key" ON "ActionRule"("source_action_id");