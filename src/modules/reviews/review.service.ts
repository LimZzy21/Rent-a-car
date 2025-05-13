import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AwsService } from 'src/modules/aws/aws.service';
import { CarReview } from '@prisma/client';
import { CarErrors } from 'src/Constants/Errors/Car';
import { AWS_ERRORS } from 'src/Constants/Errors/AWS';

@Injectable()
export class CarReviewService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly awsService: AwsService,
  ) {}

  async create(
    carId: string,
    userId: string,
    file: Express.Multer.File,
  ): Promise<CarReview> {
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
    } catch {
      throw new InternalServerErrorException(
        AWS_ERRORS.FAILED_TO_UPLOAD_MEDIA_FILE,
      );
    }
  }

  async getAll(): Promise<CarReview[]> {
    return Promise.resolve(
      (await this.prismaService.carReview.findMany({})) as CarReview[],
    );
  }

  async getById(id: string): Promise<CarReview> {
    const review = await this.prismaService.carReview.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException(CarErrors.CAR_REVIEW_NOT_FOUND);
    }

    return review;
  }

  async getByCarId(carId: string): Promise<CarReview[]> {
    return Promise.resolve(
      (await this.prismaService.carReview.findMany({
        where: { carId },
      })) as CarReview[],
    );
  }

  async deleteReview(id: string): Promise<{ message: string }> {
    const review = await this.prismaService.carReview.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException(CarErrors.CAR_REVIEW_NOT_FOUND);
    }

    if (review.videoKey && typeof review.videoKey === 'string') {
      await this.awsService.deleteMediaByKey(review.videoKey as string);
    }

    await this.prismaService.carReview.delete({
      where: { id },
    });

    return { message: CarErrors.CAR_REVIEW_DELETED_SUCCESSFULLY };
  }
}
