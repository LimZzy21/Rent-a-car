import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { RegisterDto } from 'src/dto/auth/register.dto';
import { UsersService } from 'src/modules/users/users.service';
import { CustomRequest } from 'src/types/entities/customRequest';
import removeProperties from 'src/utils/removeProperties';
import { Public } from 'src/common/decorators/public.decorator';
import { LocalAuthGuard } from 'src/guards/local.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() body: RegisterDto) {
    const user = await this.userService.createUser({
      fullName: body.fullName,
      email: body.email,
      password: body.password,
      confirmPassword: body.confirmPassword,
    });

    return removeProperties(user, 'password');
  }
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: CustomRequest) {
    const accessToken = await this.authService.login(req.user);
    return {
      accessToken: accessToken.access_token,
      user: removeProperties(req.user, 'password'),
    };
  }
}
