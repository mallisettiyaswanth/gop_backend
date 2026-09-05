import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMembershipPlanDto } from './dto/create-membership-plan.dto.js';
import { UpdateMembershipPlanDto } from './dto/update-membership-plan.dto.js';

@Injectable()
export class MembershipPlansService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMembershipPlanDto) {
    if (dto.dailyPrice == null && dto.monthlyPrice == null && dto.yearlyPrice == null) {
      throw new BadRequestException('Provide at least one price: daily, monthly, or yearly');
    }

    return this.prisma.membershipPlan.create({
      data: {
        name: dto.name,
        level: dto.level,
        description: dto.description,
        dailyPrice: dto.dailyPrice,
        monthlyPrice: dto.monthlyPrice,
        yearlyPrice: dto.yearlyPrice,
        joiningFee: dto.joiningFee ?? 0,
        taxPercent: dto.taxPercent ?? 0,
        visitLimit: dto.visitLimit,
        features: dto.features ?? [],
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  findAll() {
    return this.prisma.membershipPlan.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async findOne(id: string) {
    const plan = await this.prisma.membershipPlan.findUnique({ where: { id } });
    if (!plan) {
      throw new NotFoundException('Membership plan not found');
    }
    return plan;
  }

  async update(id: string, dto: UpdateMembershipPlanDto) {
    await this.findOne(id);
    return this.prisma.membershipPlan.update({ where: { id }, data: dto });
  }
}
