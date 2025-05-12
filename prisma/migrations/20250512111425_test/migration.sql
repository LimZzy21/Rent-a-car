-- CreateTable
CREATE TABLE "CarReview" (
    "id" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CarReview_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CarReview" ADD CONSTRAINT "CarReview_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarReview" ADD CONSTRAINT "CarReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
