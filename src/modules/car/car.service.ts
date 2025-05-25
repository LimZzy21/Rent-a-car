import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Car, Prisma } from '@prisma/client';
import { NotFoundException } from 'src/common/exceptions/business.exceptions';
import { CarErrors } from 'src/Constants/Errors/Car';
import { CreateCarDto } from './dto/create-car.dto';
import { FilterCarsDto } from './dto/filter-cars.dto';
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
        images: images.map((image) => image.url),
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

  async getAllCars(params: { page?: number; limit?: number }) {
    const { page = 1, limit = 6 } = params;

    const calculatedSkip = (page - 1) * limit;

    const totalCount = await this.prismaService.car.count();

    const cars = await this.prismaService.car.findMany({
      skip: calculatedSkip,
      take: limit,
      include: {
        carDetails: true,
      },
    });

    return {
      data: cars,
      meta: {
        total: totalCount,
        page: page,
        limit: limit,
        totalPages: Math.ceil(totalCount / limit),
      },
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

  async getSimilarCars(id: string) {
    const car = await this.prismaService.car.findUnique({
      where: { id },
      include: {
        carDetails: true,
      },
    });

    if (!car || !car.carDetails) {
      throw new NotFoundException(CarErrors.CAR_NOT_FOUND, {
        carId: id,
      });
    }

    const powerRange = 200;
    const similarCars = await this.prismaService.car.findMany({
      where: {
        AND: [
          { id: { not: id } },
          {
            carDetails: {
              enginePower: {
                gte: car.carDetails.enginePower - powerRange,
                lte: car.carDetails.enginePower + powerRange,
              },
            },
          },
        ],
      },
      include: {
        carDetails: true,
      },
      take: 3,
    });

    return similarCars;
  }

  async deleteCar(id: string) {
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

  async getFilteredCars(filters: FilterCarsDto) {
    const {
      brand,
      isCurrentlyRented,
      model,
      name,
      price,
      fuelType,
      transmission,
      page = 1,
      limit = 6,
      sortBy,
      sortOrder = 'asc',
    } = filters;

    const where: Prisma.CarWhereInput = {};

    if (brand) {
      where.brand = { contains: brand, mode: 'insensitive' };
    }

    if (isCurrentlyRented !== undefined) {
      where.isCurrentlyRented = isCurrentlyRented;
    }

    if (model) {
      where.model = { contains: model, mode: 'insensitive' };
    }

    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }

    if (price !== undefined) {
      where.price = { gte: price };
    }

    if (fuelType || transmission) {
      where.carDetails = {};
      if (fuelType) {
        where.carDetails.fuelType = fuelType;
      }
      if (transmission) {
        where.carDetails.transmission = transmission;
      }
    }

    let orderBy: Prisma.CarOrderByWithRelationInput = { createdAt: 'desc' };

    if (sortBy) {
      switch (sortBy) {
        case 'price':
          orderBy = { price: sortOrder as 'asc' | 'desc' };
          break;
        case 'name':
          orderBy = { name: sortOrder as 'asc' | 'desc' };
          break;
        case 'rating':
          orderBy = { rating: sortOrder as 'asc' | 'desc' };
          break;
        case 'createdAt':
          orderBy = { createdAt: sortOrder as 'asc' | 'desc' };
          break;
        default:
          orderBy = { createdAt: 'desc' };
      }
    }

    const totalCount = await this.prismaService.car.count({ where });

    const cars = await this.prismaService.car.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where,
      orderBy,
      include: {
        carDetails: true,
      },
    });

    return {
      data: cars,
      meta: {
        total: totalCount,
        page: page,
        limit: limit,
        totalPages: Math.ceil(totalCount / limit),
        sortBy,
        sortOrder,
      },
    };
  }
}
