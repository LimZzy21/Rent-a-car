import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AwsService } from 'src/modules/aws/aws.service';
import { CarReview } from '@prisma/client';
import { CarErrors } from 'src/Constants/Errors/Car';
import { AWS_ERRORS } from 'src/Constants/Errors/AWS';
import { AuthErrors } from 'src/Constants/Errors/Auth';

@Injectable()
export class CarReviewService {
  private readonly logger = new Logger(CarReviewService.name);

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
      this.logger.log(
        `🚗 Creating review for carId: ${carId}, userId: ${userId}`,
      );

      const existingCar = await this.prismaService.car.findUnique({
        where: { id: carId },
      });

      if (!existingCar) {
        this.logger.error(`❌ Car not found with ID: ${carId}`);
        throw new NotFoundException(CarErrors.CAR_NOT_FOUND);
      }

      this.logger.log(
        `✅ Car found: ${existingCar.name} (${existingCar.brand} ${existingCar.model})`,
      );

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
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        AWS_ERRORS.FAILED_TO_UPLOAD_MEDIA_FILE,
      );
    }
  }

  async toggleLike(
    reviewId: string,
    userId: string,
  ): Promise<{ liked: boolean; totalLikes: number }> {
    return await this.prismaService.$transaction(async (prisma) => {
      const review = await prisma.carReview.findUnique({
        where: { id: reviewId },
        select: { likes: true },
      });

      if (!review) {
        throw new NotFoundException(CarErrors.CAR_REVIEW_NOT_FOUND);
      }

      const existingLike = await prisma.videoLike.findUnique({
        where: {
          userId_reviewId: {
            userId,
            reviewId,
          },
        },
      });

      if (existingLike) {
        await Promise.all([
          prisma.videoLike.delete({
            where: { id: existingLike.id },
          }),
          prisma.carReview.update({
            where: { id: reviewId },
            data: { likes: { decrement: 1 } },
          }),
        ]);

        return { liked: false, totalLikes: review.likes - 1 };
      } else {
        await Promise.all([
          prisma.videoLike.create({
            data: { userId, reviewId },
          }),
          prisma.carReview.update({
            where: { id: reviewId },
            data: { likes: { increment: 1 } },
          }),
        ]);

        return { liked: true, totalLikes: review.likes + 1 };
      }
    });
  }

  async getLikeStatus(reviewId: string, userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(AuthErrors.USER_NOT_FOUND);
    }

    const like = await this.prismaService.videoLike.findUnique({
      where: {
        userId_reviewId: {
          userId,
          reviewId,
        },
      },
    });

    return { isLiked: !!like };
  }

  async getAll(): Promise<CarReview[]> {
    return this.prismaService.carReview.findMany({
      include: {
        reviewedCar: {
          include: {
            reviews: true,
            rentals: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    });
  }

  async getAllWithLikeStatus(userId?: string) {
    const reviews = await this.prismaService.carReview.findMany({
      include: {
        reviewedCar: {
          select: {
            id: true,
            name: true,
            brand: true,
            model: true,
            images: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
        videoLikes: userId
          ? {
              where: { userId },
              select: { id: true },
            }
          : false,
      },
    });

    return reviews.map((review) => ({
      ...review,
      isLiked: userId ? review.videoLikes.length > 0 : false,
      videoLikes: undefined,
    }));
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
    return this.prismaService.carReview.findMany({
      where: { carId },
    });
  }

  async deleteReview(id: string): Promise<{ message: string }> {
    const review = await this.prismaService.carReview.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException(CarErrors.CAR_REVIEW_NOT_FOUND);
    }

    if (review.videoKey && typeof review.videoKey === 'string') {
      await this.awsService.deleteMediaByKey(review.videoKey);
    }

    await this.prismaService.carReview.delete({
      where: { id },
    });

    return { message: CarErrors.CAR_REVIEW_DELETED_SUCCESSFULLY };
  }
}
