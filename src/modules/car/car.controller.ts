import { Controller, Post, Body, Get, Delete, Param } from '@nestjs/common';
import { CarService } from './car.service';
import { CreateCarDto } from './dto/create-car.dto';

@Controller('cars')
export class CarController {
  constructor(private readonly carService: CarService) {}

  @Get()
  getAllCars() {
    return this.carService.getAllCars({});
  }

  @Get('car/:id')
  getCarById(@Param('id') id: string) {
    return this.carService.getCarById(id);
  }

  @Post('create')
  create(@Body() body: CreateCarDto) {
    return this.carService.create(body);
  }


  @Delete('car/:id')
  deleteCar(@Param('id') id: string) {
    return this.carService.deleteCar(id);
  }
}
