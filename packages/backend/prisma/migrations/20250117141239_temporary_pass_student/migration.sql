-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "tempPassExpiredAt" TIMESTAMP(3),
ADD COLUMN     "temporaryPassword" TEXT;
