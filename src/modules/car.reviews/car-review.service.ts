import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AwsService } from 'src/modules/aws/aws.service';
import { CarReview } from '@prisma/client';


@Injectable()
export class CarReviewService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly awsService: AwsService, ) {}

  async create(carId: string, userId: string, file: Express.Multer.File): Promise<CarReview> {
    try {
      const { url, key } = await this.awsService.uploadMediaFile(file);

      return this.prismaService.carReview.create({
        data: {
          carId,
          reviewerId: userId,
          videoUrl: url,
          videoKey: key,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to create car review with video', error);
    }
  }

  async getAll(): Promise<CarReview[]> {
    return this.prismaService.carReview.findMany();
  }

  async getById(id: string): Promise<CarReview> {
    const review = await this.prismaService.carReview.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async getByCarId(carId: string): Promise<CarReview[]> {
    return this.prismaService.carReview.findMany({
      where: { carId },
    });
  }

  async deleteReview(id: string): Promise<{ message: string }> {
    const review = await this.prismaService.carReview.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.videoKey) {
      await this.awsService.deleteMediaByKey(review.videoKey);
    }

    await this.prismaService.carReview.delete({
      where: { id },
    });

    return { message: 'Review and video deleted successfully' };
  }
}