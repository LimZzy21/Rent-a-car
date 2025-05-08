import {
  Get,
  Controller,
  Param,
  NotFoundException,
  Request,
} from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import removeProperties from 'src/utils/removeProperties';
import { CustomRequest } from 'src/types/entities/customRequest';

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

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const user = await this.userService.getUserById({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const userWithoutPassword = removeProperties(user, 'password');
    return userWithoutPassword;
  }
  
  @Get('me')
  async findMe(@Request() req: CustomRequest) {
    const user = await this.userService.user({
      id: req.user.id,
    });
    return removeProperties(user, 'password' as never);
  }
}
