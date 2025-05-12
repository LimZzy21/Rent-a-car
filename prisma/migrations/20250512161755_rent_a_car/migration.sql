/*
  Warnings:

  - Added the required column `videoKey` to the `CarReview` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CarReview" ADD COLUMN     "videoKey" TEXT NOT NULL;
