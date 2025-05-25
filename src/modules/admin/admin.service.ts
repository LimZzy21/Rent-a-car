import { Injectable, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthErrors } from 'src/Constants/Errors/Auth';
import removeProperties from 'src/utils/removeProperties';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(role: UserRole) {
    if (role !== UserRole.ADMIN) {
      throw new ForbiddenException(AuthErrors.NO_PERMISSION);
    }

    const [activeRentals, availableCars, totalUsers] = await Promise.all([
      this.prisma.car.count({
        where: {
          isCurrentlyRented: true,
        },
      }),

      this.prisma.car.count({
        where: {
          isCurrentlyRented: false,
        },
      }),
      this.prisma.user.count({
        where: {
          role: UserRole.USER,
        },
      }),
    ]);

    return {
      totalCars: activeRentals + availableCars,
      activeRentals,
      availableCars,
      totalUsers,
    };
  }
  async getUsers(role: UserRole) {
    if (role !== UserRole.ADMIN) {
      throw new ForbiddenException(AuthErrors.NO_PERMISSION);
    }

    const users = await this.prisma.user.findMany({});
    const usersWithoutPassword = users.map((user) => {
      return removeProperties(user, 'password');
    });
    return usersWithoutPassword;
  }
}
