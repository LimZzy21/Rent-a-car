import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuthService } from './modules/auth/auth.service';
import { AuthController } from './modules/auth/auth.controller';
import { CarModule } from './modules/car/car.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, CarModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AppModule {}
