import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { BcryptInterface } from 'src/types/entities/bcrypt';
import { JwtPayload } from 'src/dto/auth/jwt.payload';
import { UsersService } from '../users/users.service';
import { UnauthorizedException } from 'src/common/exceptions/business.exceptions';
import { AuthErrors } from 'src/Constants/Errors/Auth';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUserByPassword(
    key: string,
    pass: string,
  ): Promise<User | null> {
    const user = await this.usersService.getUserById({
      email: key,
    });
    if (!user) {
      throw new UnauthorizedException(AuthErrors.INVALID_CREDENTIALS);
    }
    const bcryptTyped = bcrypt as unknown as BcryptInterface;
    const isPasswordValid = await bcryptTyped.compare(pass, user.password);

    if (isPasswordValid) {
      return user;
    }
    return null;
  }

  async login(user: User) {
    const payload: JwtPayload = { sub: user.id };
    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
    };
  }

  async validateUserByToken(token: string): Promise<User | null> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      const user = await this.usersService.getUserById({
        id: payload.sub,
      });
      return user;
    } catch {
      return null;
    }
  }
}
