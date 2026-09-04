import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMemberDto } from './dto/create-member.dto.js';
import { UpdateMemberDto } from './dto/update-member.dto.js';
import { MemberStatus } from '../generated/prisma/enums.js';

@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMemberDto) {
    const memberCode = await this.generateMemberCode();

    return this.prisma.member.create({
      data: {
        memberCode,
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        dob: dto.dob ? new Date(dto.dob) : undefined,
        gender: dto.gender,
        address: dto.address,
        emergencyContactName: dto.emergencyContactName,
        emergencyContactPhone: dto.emergencyContactPhone,
        notes: dto.notes,
        status: MemberStatus.PENDING,
      },
    });
  }

  findAll(status?: MemberStatus) {
    return this.prisma.member.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const member = await this.prisma.member.findUnique({
      where: { id },
      include: {
        memberships: { orderBy: { createdAt: 'desc' }, include: { plan: true } },
        payments: { orderBy: { paidAt: 'desc' } },
        attendance: { orderBy: { checkInAt: 'desc' }, take: 20 },
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return member;
  }

  async update(id: string, dto: UpdateMemberDto) {
    await this.findOne(id);

    return this.prisma.member.update({
      where: { id },
      data: {
        ...dto,
        dob: dto.dob ? new Date(dto.dob) : undefined,
      },
    });
  }

  private async generateMemberCode(): Promise<string> {
    const count = await this.prisma.member.count();
    return `MEM${String(count + 1).padStart(5, '0')}`;
  }
}
