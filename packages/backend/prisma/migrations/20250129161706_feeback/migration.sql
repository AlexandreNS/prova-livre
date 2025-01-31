-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "allowFeedback" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "StudentApplication" ADD COLUMN     "descriptionFeedback" TEXT,
ADD COLUMN     "feedback" JSONB;

-- AlterTable
ALTER TABLE "StudentApplicationQuestion" ADD COLUMN     "feedback" TEXT;
