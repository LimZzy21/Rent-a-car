import {
  Controller,
  Post,
  Body,
  Request,
  UseInterceptors,
  UploadedFile,
  Get,
  Param,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import { CarReviewService } from './review.service';
import { UsersService } from '../users/users.service';
import { CustomRequest } from '../../types/entities/customRequest';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthErrors } from 'src/Constants/Errors/Auth';
import { CarReview } from '@prisma/client';

@Controller('reviews')
export class CarReviewController {
  constructor(
    private readonly carReviewService: CarReviewService,
    private readonly userService: UsersService,
  ) {}

  @Post(':carId')
  @UseInterceptors(FileInterceptor('file'))
  async createReview(
    @Param('carId') carId: string,
    @Request() req: CustomRequest,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<CarReview> {
    const user = await this.userService.user({
      id: req.user.id,
    });

    if (!user) {
      throw new NotFoundException(AuthErrors.USER_NOT_FOUND);
    }

    return this.carReviewService.create(carId, user.id, file);
  }

  @Get()
  async getAllReviews() {
    return this.carReviewService.getAll();
  }

  @Get(':id')
  async getReviewById(@Param('id') id: string): Promise<CarReview> {
    return this.carReviewService.getById(id);
  }

  @Get('car/:carId')
  async getReviewsByCarId(@Param('carId') carId: string): Promise<CarReview[]> {
    return this.carReviewService.getByCarId(carId);
  }

  @Delete(':id')
  async deleteReview(@Param('id') id: string) {
    return this.carReviewService.deleteReview(id);
  }
}
