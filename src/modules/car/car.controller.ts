import { Controller, Post, Body, Get, Delete, Param, UseInterceptors, UploadedFiles, Query, UseGuards } from '@nestjs/common';
import { CarService } from './car.service';
import { CreateCarDto } from './dto/create-car.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Public } from 'src/common/decorators/public.decorator';
import { CarEndpoints } from 'src/Constants/Endpoints/Car';
import { JwtAuthGuard } from 'src/guards/jwt.guard';

@Controller(CarEndpoints.BASE)
export class CarController {
  constructor(private readonly carService: CarService) {}

  @Public()
  @Get()
  getAllCars(@Query('page') page: number, @Query('limit') limit: number) {
    return this.carService.getAllCars({ page, limit });
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
  @UseInterceptors(FilesInterceptor('images', 10, {
    storage: memoryStorage(),
    fileFilter: (_, file, callback) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return callback(new Error('Only image files are allowed!'), false);
      }
      callback(null, true);
    },
    limits: {
      fileSize: 20 * 1024 * 1024 
    }
  }))
  
  @UseGuards(JwtAuthGuard)
  create(@Body() createCarDto: CreateCarDto, @UploadedFiles() images: Express.Multer.File[]) {
    if (typeof createCarDto.features === 'string') {
      try {
        createCarDto.features = JSON.parse(createCarDto.features as unknown as string);
      } catch {
        createCarDto.features = createCarDto.features ? [createCarDto.features as unknown as string] : [];
      }
    }
    
    if (typeof createCarDto.carDetails === 'string') {
      try {
        createCarDto.carDetails = JSON.parse(createCarDto.carDetails as unknown as string);
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
