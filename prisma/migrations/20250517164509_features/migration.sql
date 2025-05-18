/*
  Warnings:

  - Added the required column `acceleration` to the `CarDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `topSpeed` to the `CarDetails` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Car" ADD COLUMN     "features" TEXT[];

-- AlterTable
ALTER TABLE "CarDetails" ADD COLUMN     "acceleration" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "topSpeed" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "engineSize" SET DATA TYPE DOUBLE PRECISION;

-- Update existing records with default values
UPDATE "CarDetails" SET "acceleration" = 0, "topSpeed" = 0 WHERE TRUE;

-- Remove default constraints after update (optional)
ALTER TABLE "CarDetails" ALTER COLUMN "acceleration" DROP DEFAULT,
ALTER COLUMN "topSpeed" DROP DEFAULT;
