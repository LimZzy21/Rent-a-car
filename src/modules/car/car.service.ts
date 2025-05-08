import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Car, Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class CarService {
  constructor(private prismaService: PrismaService) {}

  async create(createCarDto: any): Promise<Car> {
    try {
      const { carDetails, ...carData } = createCarDto;

      return await this.prismaService.car.create({
        data: {
          ...carData,
          carDetails: {
            create: carDetails,
          },
        },
        include: {
          carDetails: true,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Car with this name already exists');
        }
      }
      throw error;
    }
  }

  getAllCars(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.CarWhereUniqueInput;
    where?: Prisma.CarWhereInput;
    orderBy?: Prisma.CarOrderByWithRelationInput;
  }) {
    try {
      const { skip, take, cursor, where, orderBy } = params;
      return this.prismaService.car.findMany({
        skip,
        take,
        cursor,
        where,
        orderBy,
        include: {
          carDetails: true,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new NotFoundException('Car not found');
      }
      throw error;
    }
  }

  async getCarById(id: string) {
    try {
      const car = await this.prismaService.car.findUnique({
        where: { id },
        include: {
          carDetails: true,
        },
      });

      if (!car) {
        throw new NotFoundException('Car not found');
      }
      return car;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Car not found');
        }
      }
      throw error;
    }
  }

  async deleteCar(id: string) {
    try {
      const car = await this.prismaService.car.findUnique({
        where: { id },
      });
      if (!car) {
        throw new NotFoundException('Car not found');
      }

      return this.prismaService.car.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new NotFoundException('Car not found');
      }
      throw error;
    }
  }

  remove(id: number) {
    return `This action removes a #${id} car`;
  }
}
