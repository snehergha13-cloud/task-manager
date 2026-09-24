import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UserRole } from './entities/user.entity';
import { toUserResponse } from './users.mapper';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Any authenticated user can view only their own profile
  @Get('me')
  async getMe(@CurrentUser() currentUser: { id: string }) {
    const user = await this.usersService.findById(currentUser.id);
    return toUserResponse(user as any);
  }

  // Admin only: view all users
  @Roles(UserRole.ADMIN)
  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map(toUserResponse);
  }

  // Admin only: delete a user
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
    return { message: 'User deleted successfully' };
  }
}
