import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { RegisterDto } from 'src/dto/auth/register.dto';
import { UsersService } from 'src/services/users/users.service';
import { CustomRequest } from 'src/types/entities/customRequest';
import { AuthService } from 'src/services/auth/auth.service';
import removeProperties from 'src/utils/removeProperties';
import { Public } from 'src/common/decorators/public.decorator';
import { LocalAuthGuard } from 'src/guards/local.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly userService: UsersService, private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() body: RegisterDto) {
    const user = await this.userService.createUser({
      email: body.email,
      password: body.password,
    });
    return user;
  }
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: CustomRequest) {
    const accessToken = await this.authService.login(req.user);
    return {
      accessToken,
      user: removeProperties(req.user, 'password'),
    };
  }
}
