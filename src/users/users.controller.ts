import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateCredentialsDto } from './dto/update-credentials.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy.js';
import { Role } from '../generated/prisma/enums.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.usersService.deactivate(id);
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Patch('me/credentials')
  updateOwnCredentials(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateCredentialsDto) {
    return this.usersService.changeOwnCredentials(user.id, dto);
  }
}
