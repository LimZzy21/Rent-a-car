import {
  Get,
  Controller,
  Param,
  Request,
  UseGuards,
  Patch,
  Body,
} from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import removeProperties from 'src/utils/removeProperties';
import { CustomRequest } from 'src/types/entities/customRequest';
import { NotFoundException } from 'src/common/exceptions/business.exceptions';
import { AuthErrors } from 'src/Constants/Errors/Auth';
import { JwtAuthGuard } from 'src/guards/jwt.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  async getUsers() {
    const users = await this.userService.getUsers({});
    const usersWithoutPassword = users.map((user) => {
      return removeProperties(user, 'password');
    });
    return usersWithoutPassword;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async findMe(@Request() req: CustomRequest) {
    const user = await this.userService.user({
      id: req.user.id,
    });
    return removeProperties(user, 'password' as never);
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const user = await this.userService.getUserById({ id });
    if (!user) {
      throw new NotFoundException(AuthErrors.USER_NOT_FOUND);
    }
    const userWithoutPassword = removeProperties(user, 'password');
    return userWithoutPassword;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateUser(@Request() req: CustomRequest, @Body() body: {avatar?: string, fullName?: string}) {

    const user = await this.userService.updateUser({
      where: {
        id: req.user.id,
      },
      data: {
        avatar: body.avatar,
        fullName: body.fullName,
      },
    });
    return removeProperties(user, 'password');
  }
}
