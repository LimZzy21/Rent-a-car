import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { BcryptInterface } from 'src/types/entities/bcrypt';
import { JwtPayload } from 'src/dto/auth/jwt.payload';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUserByPassword(key: string, pass: string): Promise<User | null> {
    const user = await this.usersService.getUserById({
      email: key,
    });
    if (!user) return null;
    const bcryptTyped = bcrypt as unknown as BcryptInterface;
    const isPasswordValid = await bcryptTyped.compare(pass, user.password);

    if (isPasswordValid) {
      return user;
    }
    return null;
  }

  async login(user: User) {
    const payload: JwtPayload = { sub: user.id };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

}
