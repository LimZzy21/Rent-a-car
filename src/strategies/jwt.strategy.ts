import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import * as passportJwt from 'passport-jwt';
import { JwtPayload } from 'src/dto/auth/jwt.payload';
import { UsersService } from 'src/modules/users/users.service';

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
    const user = await this.usersService.getUserById({ id: payload.sub });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
