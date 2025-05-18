import { Controller, Post, Body, Get, Delete, Param, UseInterceptors, UploadedFiles, Query } from '@nestjs/common';
import { CarService } from './car.service';
import { CreateCarDto } from './dto/create-car.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('cars')
export class CarController {
  constructor(private readonly carService: CarService) {}

  @Public()
  @Get()
  getAllCars(@Query('page') page: number, @Query('limit') limit: number) {
    return this.carService.getAllCars({ page, limit });
  }

  @Public()
  @Get('car/:id')
  getCarById(@Param('id') id: string) {
    return this.carService.getCarById(id);
  }

  @Post('create')
  @UseInterceptors(FilesInterceptor('images', 10, {
    storage: memoryStorage(),
    fileFilter: (req, file, callback) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return callback(new Error('Only image files are allowed!'), false);
      }
      callback(null, true);
    },
    limits: {
      fileSize: 20 * 1024 * 1024 
    }
  }))
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

  @Delete('car/:id')
  deleteCar(@Param('id') id: string) {
    return this.carService.deleteCar(id);
  }
}
