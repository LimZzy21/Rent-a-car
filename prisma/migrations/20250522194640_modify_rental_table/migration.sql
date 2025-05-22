/*
  Warnings:

  - You are about to drop the column `isActive` on the `Rental` table. All the data in the column will be lost.
  - Added the required column `totalPrice` to the `Rental` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RentalStatus" AS ENUM ('USER_RENTED', 'RENTED', 'RETURNED');

-- AlterTable
ALTER TABLE "Rental" DROP COLUMN "isActive",
ADD COLUMN     "status" "RentalStatus" NOT NULL DEFAULT 'USER_RENTED',
ADD COLUMN     "totalPrice" INTEGER NOT NULL;
