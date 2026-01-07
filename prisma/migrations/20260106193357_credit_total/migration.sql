-- AlterTable
ALTER TABLE "generation" ADD COLUMN     "aiModelId" TEXT,
ADD COLUMN     "creditsCost" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "credits" INTEGER NOT NULL DEFAULT 0;
