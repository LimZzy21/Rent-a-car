import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../prisma/prisma.module';
import { RentalSchedulerService } from './rental-scheduler.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule
  ],
  providers: [RentalSchedulerService],
})
export class SchedulerModule {} 