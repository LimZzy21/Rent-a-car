import { Module } from '@nestjs/common';
import { CarReviewController } from './car-review.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CarReviewService } from './car-review.service';
import { UsersModule } from '../users/users.module';
import { AwsModule } from '../aws/aws.module';

@Module({
  imports: [PrismaModule, UsersModule, AwsModule],
  controllers: [CarReviewController],
  providers: [CarReviewService],
  exports: [CarReviewService],
})
export class CarReviewModule {}