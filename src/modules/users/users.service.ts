import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { BcryptInterface } from 'src/types/entities/bcrypt';
import { AuthErrors } from 'src/Constants/Errors/Auth';
import {
  ForbiddenException,
  NotFoundException,
} from 'src/common/exceptions/business.exceptions';
@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async createUser(userData: {
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
  }): Promise<User> {
    try {
      const bcryptTyped = bcrypt as unknown as BcryptInterface;
      const hashedPassword: string = await bcryptTyped.hash(
        userData.password,
        10,
      );

      if (userData.password !== userData.confirmPassword) {
        throw new ForbiddenException(AuthErrors.PASSWORD_NOT_MATCH);
      }

      const user = await this.prismaService.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          fullName: userData.fullName,
        },
      });
      return user;
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          throw new ForbiddenException(AuthErrors.USER_ALREADY_EXISTS);
        }
      }
      throw err;
    }
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { where, data } = params;

    return this.prismaService.user.update({
      where,
      data,
    });
  }

  async getUsers(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;

    return this.prismaService.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async user(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: userWhereUniqueInput,
    });
  }

  async getUserById(dto: Prisma.UserWhereUniqueInput): Promise<User | null> {
    const user = await this.prismaService.user.findUnique({
      where: dto,
    });
    if (!user) {
      throw new NotFoundException(AuthErrors.USER_NOT_FOUND);
    }
    return user;
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    const user = await this.prismaService.user.delete({
      where,
    });
    return user;
  }
}
