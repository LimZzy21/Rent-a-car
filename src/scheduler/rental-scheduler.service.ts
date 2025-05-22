import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { RentalStatus } from '@prisma/client';

@Injectable()
export class RentalSchedulerService {
  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkExpiredRentals() {
    const now = new Date();

    await this.prisma.$transaction(async (tx) => {
      const expiredRentals = await tx.rental.findMany({
        where: {
          status: { in: [RentalStatus.USER_RENTED, RentalStatus.PENDING] },
          rentedTo: {
            lt: now,
          },
        },
        include: {
          car: true,
        },
      });

      for (const rental of expiredRentals) {
        await tx.rental.update({
          where: { id: rental.id },
          data: { status: RentalStatus.RETURNED },
        });

        const activeRentalsCount = await tx.rental.count({
          where: {
            carId: rental.carId,
            status: { in: [RentalStatus.USER_RENTED, RentalStatus.PENDING] },
          },
        });

        if (activeRentalsCount === 0) {
          await tx.car.update({
            where: { id: rental.carId },
            data: { isCurrentlyRented: false },
          });
        }
      }
    });
  }
}
