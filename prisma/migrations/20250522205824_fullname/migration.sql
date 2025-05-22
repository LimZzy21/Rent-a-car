/*
  Warnings:

  - Added the required column `fullName` to the `Rental` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Rental" ADD COLUMN     "fullName" TEXT NOT NULL;
