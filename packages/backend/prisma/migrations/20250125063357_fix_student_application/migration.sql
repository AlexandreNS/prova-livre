/*
  Warnings:

  - You are about to drop the column `startedAt` on the `ApplicationClass` table. All the data in the column will be lost.
  - You are about to drop the column `submittedAt` on the `ApplicationClass` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ApplicationClass" DROP COLUMN "startedAt",
DROP COLUMN "submittedAt";

-- AlterTable
ALTER TABLE "StudentApplication" ADD COLUMN     "startedAt" TIMESTAMP(3),
ADD COLUMN     "submittedAt" TIMESTAMP(3);
