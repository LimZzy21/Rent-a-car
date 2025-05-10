import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Car, Prisma } from '@prisma/client';
import { NotFoundException } from 'src/common/exceptions/business.exceptions';
import { CarErrors } from 'src/Constants/Errors/Car';
import { CreateCarDto } from './dto/create-car.dto';

@Injectable()
export class CarService {
  constructor(private prismaService: PrismaService) {}

  async create(createCarDto: CreateCarDto): Promise<Car> {
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
  }

  async getAllCars(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.CarWhereUniqueInput;
    where?: Prisma.CarWhereInput;
    orderBy?: Prisma.CarOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    const cars = await this.prismaService.car.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        carDetails: true,
      },
    });

    if (!cars.length) {
      throw new NotFoundException(CarErrors.CAR_NOT_FOUND, {
        filters: where,
      });
    }

    return cars;
  }

  async getCarById(id: string) {
    const car = await this.prismaService.car.findUnique({
      where: { id },
      include: {
        carDetails: true,
      },
    });

    if (!car) {
      throw new NotFoundException(CarErrors.CAR_NOT_FOUND, {
        carId: id,
      });
    }
    return car;
  }

  async deleteCar(id: string) {
    const car = await this.prismaService.car.findUnique({
      where: { id },
    });

    if (!car) {
      throw new NotFoundException(CarErrors.CAR_NOT_FOUND, {
        carId: id,
      });
    }

    return await this.prismaService.car.delete({
      where: { id },
    });
  }
}
