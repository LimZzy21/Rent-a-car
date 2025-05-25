import { Controller, Get, Request } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CustomRequest } from 'src/types/entities/customRequest';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { UseGuards } from '@nestjs/common';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard-stats')
  @UseGuards(JwtAuthGuard)
  getStats(@Request() req: CustomRequest) {
    return this.adminService.getDashboardStats(req.user.role);
  }

  @Get('users')
  @UseGuards(JwtAuthGuard)
  getUsers(@Request() req: CustomRequest) {
    return this.adminService.getUsers(req.user.role);
  }
}
