import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMembershipPlanDto } from './dto/create-membership-plan.dto.js';
import { UpdateMembershipPlanDto } from './dto/update-membership-plan.dto.js';

@Injectable()
export class MembershipPlansService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateMembershipPlanDto) {
    return this.prisma.membershipPlan.create({
      data: {
        name: dto.name,
        category: dto.category,
        level: dto.level,
        color: dto.color,
        description: dto.description,
        priceTiers: dto.priceTiers.map((tier) => ({
          label: tier.label,
          price: tier.price,
          durationDays: tier.durationDays,
        })),
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
    return this.prisma.membershipPlan.update({
      where: { id },
      data: {
        name: dto.name,
        category: dto.category,
        level: dto.level,
        color: dto.color,
        description: dto.description,
        priceTiers: dto.priceTiers?.map((tier) => ({
          label: tier.label,
          price: tier.price,
          durationDays: tier.durationDays,
        })),
        joiningFee: dto.joiningFee,
        taxPercent: dto.taxPercent,
        visitLimit: dto.visitLimit,
        features: dto.features,
        isActive: dto.isActive,
        sortOrder: dto.sortOrder,
      },
    });
  }
}
