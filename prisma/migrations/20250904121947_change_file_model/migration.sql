/*
  Warnings:

  - You are about to alter the column `size` on the `File` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - A unique constraint covering the columns `[folderId,name]` on the table `File` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."File" DROP CONSTRAINT "File_folderId_fkey";

-- DropIndex
DROP INDEX "public"."File_name_key";

-- AlterTable
ALTER TABLE "public"."File" ALTER COLUMN "name" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "size" SET DATA TYPE INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "File_folderId_name_key" ON "public"."File"("folderId", "name");

-- AddForeignKey
ALTER TABLE "public"."File" ADD CONSTRAINT "File_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "public"."Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
