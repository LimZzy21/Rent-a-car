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
  Patch,
} from '@nestjs/common';
import { CarReviewService } from './review.service';
import { UsersService } from '../users/users.service';
import { CustomRequest } from '../../types/entities/customRequest';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthErrors } from 'src/Constants/Errors/Auth';
import { CarReview } from '@prisma/client';
import { Public } from 'src/common/decorators/public.decorator';

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

  @Public()
  @Get()
  async getAllReviews() {
    return this.carReviewService.getAll();
  }

  @Get('with-likes')
  async getAllReviewsWithLikeStatus(@Request() req: CustomRequest) {
    const userId = req.user?.id;
    return this.carReviewService.getAllWithLikeStatus(userId);
  }

  @Get('like/:reviewId')
  async getLikeStatus(
    @Param('reviewId') reviewId: string,
    @Request() req: CustomRequest,
  ) {
    return this.carReviewService.getLikeStatus(reviewId, req.user.id);
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

  @Patch('like/:reviewId')
  async toggleLike(
    @Param('reviewId') reviewId: string,
    @Request() req: CustomRequest,
  ) {
    const user = await this.userService.user({
      id: req.user.id,
    });

    if (!user) {
      throw new NotFoundException(AuthErrors.USER_NOT_FOUND);
    }

    return this.carReviewService.toggleLike(reviewId, user.id);
  }
}
