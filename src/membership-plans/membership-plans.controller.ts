import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { MembershipPlansService } from './membership-plans.service.js';
import { CreateMembershipPlanDto } from './dto/create-membership-plan.dto.js';
import { UpdateMembershipPlanDto } from './dto/update-membership-plan.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../generated/prisma/enums.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN)
@Controller('membership-plans')
export class MembershipPlansController {
  constructor(private membershipPlansService: MembershipPlansService) {}

  @Post()
  create(@Body() dto: CreateMembershipPlanDto) {
    return this.membershipPlansService.create(dto);
  }

  @Get()
  findAll() {
    return this.membershipPlansService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.membershipPlansService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMembershipPlanDto) {
    return this.membershipPlansService.update(id, dto);
  }
}
