import { Module } from '@nestjs/common';
import { UsersService } from '../../services/users/users.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserController } from 'src/controllers/users/user.controller';
@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
