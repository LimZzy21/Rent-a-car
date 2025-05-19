import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Car, Prisma } from '@prisma/client';
import { NotFoundException } from 'src/common/exceptions/business.exceptions';
import { CarErrors } from 'src/Constants/Errors/Car';
import { CreateCarDto } from './dto/create-car.dto';
import { AwsService } from '../aws/aws.service';

@Injectable()
export class CarService {
  constructor(
    private prismaService: PrismaService,
    private awsService: AwsService,
  ) {}

  async create(createCarDto: CreateCarDto): Promise<Car> {
    const { carDetails, ...carData } = createCarDto;

    let images: { url: string; key: string }[] = [];

    if (createCarDto.images) {
      images = await this.awsService.uploadMediaFiles(createCarDto.images);
    }

    return await this.prismaService.car.create({
      data: {
        ...carData,
        images: images.map(image => image.url),
        features: createCarDto.features,
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
    page?: number;
    limit?: number;
  }) {
    const { skip, take, cursor, where, orderBy, page = 1, limit = 6 } = params;
    
    const calculatedSkip = page ? (page - 1) * limit : skip;
    const calculatedTake = limit ?? take;
    
    const totalCount = await this.prismaService.car.count({ where });
    
    const cars = await this.prismaService.car.findMany({
      skip: calculatedSkip,
      take: calculatedTake,
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

    return {
      data: cars,
      meta: {
        total: totalCount,
        page: page,
        limit: limit,
        totalPages: Math.ceil(totalCount / limit),
      }
    };
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
      include: {
        carDetails: true
      }
    });

    if (!car) {
      throw new NotFoundException(CarErrors.CAR_NOT_FOUND, {
        carId: id,
      });
    }

    return await this.prismaService.$transaction(async (prisma) => {
      if (car.carDetails) {
        await prisma.carDetails.delete({
          where: { carId: car.id },
        });
      }

      return await prisma.car.delete({
        where: { id },
      });
    });
  }
}

