import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service.js';
import { UpdateGymSettingsDto } from './dto/update-gym-settings.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../generated/prisma/enums.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN)
@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  get() {
    return this.settingsService.get();
  }

  @Roles(Role.SUPER_ADMIN)
  @Patch()
  update(@Body() dto: UpdateGymSettingsDto) {
    return this.settingsService.update(dto);
  }
}
