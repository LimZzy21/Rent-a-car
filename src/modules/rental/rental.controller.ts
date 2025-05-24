import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { RentalService } from './rental.service';
import { CreateRentalDto } from './dto/create-rental.dto';
import { JwtAuthGuard } from '../../guards/jwt.guard';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { RentalStatus } from '@prisma/client';

@Controller('rentals')
export class RentalController {
  constructor(private rentalService: RentalService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  createRental(@GetUser('id') userId: string, @Body() createRentalDto: CreateRentalDto) {
    return this.rentalService.createRental(userId, createRentalDto);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  getUserRentals(@GetUser('id') userId: string) {
    return this.rentalService.getUserRentals(userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  cancelRental(@GetUser('id') userId: string, @Param('id') rentalId: string) {
    return this.rentalService.cancelRental(userId, rentalId);
  }

  @Get(':id')
  getRentalById(@Param('id') carId: string) {
    return this.rentalService.getRentalById(carId);
  }

  @Patch('/status/')
  @UseGuards(JwtAuthGuard)
  changeRentalStatus(@Body() {status, rentalId}: {status: RentalStatus, rentalId: string}) {
    return this.rentalService.changeRentalStatus(rentalId, status);
  }
} 