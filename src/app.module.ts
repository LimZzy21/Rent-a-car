import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuthService } from './modules/auth/auth.service';
import { AuthController } from './modules/auth/auth.controller';
import { CarModule } from './modules/car/car.module';
import { CarReviewModule } from './modules/reviews/review.module';
import { AwsModule } from './modules/aws/aws.module';
import { RentalModule } from './modules/rental/rental.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    PrismaModule, 
    UsersModule, 
    AuthModule, 
    CarModule, 
    CarReviewModule, 
    AwsModule, 
    RentalModule,
    SchedulerModule,
    AdminModule,
    ConfigModule.forRoot(),
  ],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AppModule {}
