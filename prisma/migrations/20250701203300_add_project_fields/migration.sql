-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "client" TEXT,
ADD COLUMN     "completionDate" TIMESTAMP(3),
ADD COLUMN     "githubUrl" TEXT,
ADD COLUMN     "technologies" TEXT,
ADD COLUMN     "websiteUrl" TEXT;
