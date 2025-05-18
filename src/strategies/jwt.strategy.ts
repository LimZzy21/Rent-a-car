import { Injectable, } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import * as passportJwt from 'passport-jwt';
import { JwtPayload } from 'src/dto/auth/jwt.payload';
import { UsersService } from 'src/modules/users/users.service';
import { AuthErrors } from 'src/Constants/Errors/Auth';
import { UnauthorizedException } from 'src/common/exceptions/business.exceptions';

const JwtStrategyBase = passportJwt.Strategy;

@Injectable()
export class JwtStrategy extends PassportStrategy(JwtStrategyBase) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.user({ id: payload.sub });
    if (!user) {
      throw new UnauthorizedException(AuthErrors.USER_NOT_FOUND);
    }
    return user;
  }
}
