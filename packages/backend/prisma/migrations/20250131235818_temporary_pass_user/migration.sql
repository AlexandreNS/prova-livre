/*
  Warnings:

  - You are about to drop the column `tempPassExpiredAt` on the `Student` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Student" DROP COLUMN "tempPassExpiredAt";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "temporaryPassword" TEXT;
