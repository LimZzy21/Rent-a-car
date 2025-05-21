import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RentalSchedulerService {
  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkExpiredRentals() {
    const now = new Date();

    const expiredRentals = await this.prisma.rental.findMany({
      where: {
        isActive: true,
        rentedTo: {
          lt: now,
        },
      },
      include: {
        car: true,
      },
    });

    for (const rental of expiredRentals) {
      await this.prisma.rental.update({
        where: { id: rental.id },
        data: { isActive: false },
      });

      const activeRentalsCount = await this.prisma.rental.count({
        where: {
          carId: rental.carId,
          isActive: true,
        },
      });

      if (activeRentalsCount === 0) {
        await this.prisma.car.update({
          where: { id: rental.carId },
          data: { isCurrentlyRented: false },
        });
      }
    }
  }
}
