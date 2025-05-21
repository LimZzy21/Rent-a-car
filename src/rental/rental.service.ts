import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRentalDto } from './dto/create-rental.dto';
import { Rental, Prisma } from '@prisma/client';

type RentalWithCar = Prisma.RentalGetPayload<{
  include: {
    car: {
      include: {
        carDetails: true;
      };
    };
  };
}>;

@Injectable()
export class RentalService {
  constructor(private prisma: PrismaService) {}

  async createRental(
    userId: string,
    createRentalDto: CreateRentalDto,
  ): Promise<Rental> {
    const { carId, rentedFrom, rentedTo } = createRentalDto;

    const car = await this.prisma.car.findUnique({
      where: { id: carId },
    });

    if (!car) {
      throw new NotFoundException('Car not found');
    }

    const conflictingRental = await this.prisma.rental.findFirst({
      where: {
        carId,
        isActive: true,
        OR: [
          {
            rentedFrom: {
              lte: new Date(rentedTo),
            },
            rentedTo: {
              gte: new Date(rentedFrom),
            },
          },
        ],
      },
    });

    if (conflictingRental) {
      throw new BadRequestException('Auto is already reserved for this period');
    }

    const result = await this.prisma.$transaction(
      async (tx): Promise<Rental> => {
        const rental = await tx.rental.create({
          data: {
            rentedFrom: new Date(rentedFrom),
            rentedTo: new Date(rentedTo),
            car: {
              connect: { id: carId },
            },
            user: {
              connect: { id: userId },
            },
            isActive: true,
          },
        });

        await tx.car.update({
          where: { id: carId },
          data: { isCurrentlyRented: true },
        });

        return rental;
      },
    );

    return result;
  }

  async getUserRentals(userId: string): Promise<RentalWithCar[]> {
    const rentals = (await this.prisma.rental.findMany({
      where: { userId },
      include: {
        car: {
          include: {
            carDetails: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })) as RentalWithCar[];

    return rentals;
  }

  async cancelRental(
    userId: string,
    rentalId: string,
  ): Promise<{ success: boolean; message: string }> {
    const rental = await this.prisma.rental.findUnique({
      where: { id: rentalId },
    });

    if (!rental) {
      throw new NotFoundException('Rental not found');
    }

    if (rental.userId !== userId) {
      throw new BadRequestException(
        'You do not have permission to cancel this rental',
      );
    }

    const result = await this.prisma.$transaction<{
      success: boolean;
      message: string;
    }>(async (tx) => {
      await tx.rental.update({
        where: { id: rentalId },
        data: { isActive: false },
      });

      const activeRentals = await tx.rental.count({
        where: {
          carId: rental.carId,
          isActive: true,
        },
      });

      if (activeRentals === 0) {
        await tx.car.update({
          where: { id: rental.carId },
          data: { isCurrentlyRented: false },
        });
      }

      return { success: true, message: 'Rental successfully canceled' };
    });

    return result;
  }
}
