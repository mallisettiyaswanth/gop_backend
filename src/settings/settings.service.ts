import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateGymSettingsDto } from './dto/update-gym-settings.dto.js';

const GYM_SETTINGS_ID = 'default';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  get() {
    return this.prisma.gymSettings.upsert({
      where: { id: GYM_SETTINGS_ID },
      update: {},
      create: { id: GYM_SETTINGS_ID, name: 'My Gym' },
    });
  }

  update(dto: UpdateGymSettingsDto) {
    return this.prisma.gymSettings.upsert({
      where: { id: GYM_SETTINGS_ID },
      update: { ...dto },
      create: { ...dto, id: GYM_SETTINGS_ID, name: dto.name ?? 'My Gym' },
    });
  }
}
