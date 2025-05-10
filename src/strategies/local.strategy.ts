import { Injectable,  } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { User } from '@prisma/client';
import { AuthService } from 'src/modules/auth/auth.service';
import { UnauthorizedException } from 'src/common/exceptions/business.exceptions';
import { AuthErrors } from 'src/Constants/Errors/Auth';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy as any) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<User> {
    const user = await this.authService.validateUserByPassword(email, password);
    if (!user) {
      throw new UnauthorizedException(AuthErrors.INVALID_CREDENTIALS);
    }
    return user;
  }
}
