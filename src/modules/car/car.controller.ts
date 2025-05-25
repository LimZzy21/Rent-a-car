import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFiles,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CarService } from './car.service';
import { CreateCarDto } from './dto/create-car.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Public } from 'src/common/decorators/public.decorator';
import { CarEndpoints } from 'src/Constants/Endpoints/Car';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { CustomRequest } from 'src/types/entities/customRequest';
import { UserRole } from '@prisma/client';
import { ForbiddenException } from '@nestjs/common';
import { AuthErrors } from 'src/Constants/Errors/Auth';
import { FilterCarsDto } from './dto/filter-cars.dto';
import { PaginationDto } from './dto/pagination.dto';

@Controller(CarEndpoints.BASE)
export class CarController {
  constructor(private readonly carService: CarService) {}

  @Public()
  @Get()
  getAllCars(@Query() pagination: PaginationDto) {
    return this.carService.getAllCars(pagination);
  }
  @Public()
  @Get('filtered')
  getFilteredCars(
    @Query('brand') brand?: string,
    @Query('isCurrentlyRented') isCurrentlyRented?: string,
    @Query('model') model?: string,
    @Query('name') name?: string,
    @Query('price') price?: string,
    @Query('fuelType') fuelType?: string,
    @Query('transmission') transmission?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    const filters: FilterCarsDto = {
      brand,
      isCurrentlyRented:
        isCurrentlyRented === 'true'
          ? true
          : isCurrentlyRented === 'false'
            ? false
            : undefined,
      model,
      name,
      price: price ? Number(price) : undefined,
      fuelType,
      transmission,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 6,
      sortBy,
      sortOrder,
    };

    return this.carService.getFilteredCars(filters);
  }

  @Public()
  @Get(CarEndpoints.GET_CAR_BY_ID)
  getCarById(@Param('id') id: string) {
    return this.carService.getCarById(id);
  }

  @Public()
  @Get(CarEndpoints.GET_SIMILAR_CARS)
  getSimilarCars(@Param('id') id: string) {
    return this.carService.getSimilarCars(id);
  }

  @Post(CarEndpoints.CREATE_CAR)
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: memoryStorage(),
      fileFilter: (_, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 20 * 1024 * 1024,
      },
    }),
  )
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createCarDto: CreateCarDto,
    @UploadedFiles() images: Express.Multer.File[],
    @Request() req: CustomRequest,
  ) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(AuthErrors.NO_PERMISSION);
    }

    if (typeof createCarDto.features === 'string') {
      try {
        createCarDto.features = JSON.parse(
          createCarDto.features as unknown as string,
        );
      } catch {
        createCarDto.features = createCarDto.features
          ? [createCarDto.features as unknown as string]
          : [];
      }
    }

    if (typeof createCarDto.carDetails === 'string') {
      try {
        createCarDto.carDetails = JSON.parse(
          createCarDto.carDetails as unknown as string,
        );
      } catch {
        // Skip setting to null as it's required by the DTO
      }
    }

    createCarDto.images = images || [];

    return this.carService.create(createCarDto);
  }

  @Delete(CarEndpoints.DELETE_CAR)
  deleteCar(@Param('id') id: string) {
    return this.carService.deleteCar(id);
  }
}
