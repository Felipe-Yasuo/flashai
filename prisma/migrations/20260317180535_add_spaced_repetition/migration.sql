-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "interval" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "nextReview" TIMESTAMP(3);
