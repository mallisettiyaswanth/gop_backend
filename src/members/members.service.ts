import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMemberDto } from './dto/create-member.dto.js';
import { UpdateMemberDto } from './dto/update-member.dto.js';
import { QueryMembersDto } from './dto/query-members.dto.js';
import { MemberStatus } from '../generated/prisma/enums.js';
import { Prisma } from '../generated/prisma/client.js';
import { computeStreak } from './streak.util.js';

@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMemberDto) {
    const existing = await this.prisma.member.findUnique({ where: { phone: dto.phone } });
    if (existing) {
      throw new ConflictException('A member with this phone number already exists');
    }

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

  async findAll(query: QueryMembersDto) {
    const { skip, limit, sortBy, sortDir, search, status, planId } = query;

    const where: Prisma.MemberWhereInput = {
      ...(status ? { status: { in: status.split(',') as MemberStatus[] } } : {}),
      ...(planId ? { memberships: { some: { planId: { in: planId.split(',') } } } } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { memberCode: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [members, total] = await Promise.all([
      this.prisma.member.findMany({
        where,
        orderBy: sortBy ? { [sortBy]: sortDir ?? 'asc' } : { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          memberships: {
            orderBy: { startDate: 'desc' },
            take: 1,
            include: { plan: true },
          },
        },
      }),
      this.prisma.member.count({ where }),
    ]);

    const attendanceByMember = await this.prisma.attendance.findMany({
      where: { memberId: { in: members.map((member) => member.id) } },
      select: { memberId: true, checkInAt: true },
    });
    const checkInsByMemberId = new Map<string, Date[]>();
    for (const { memberId, checkInAt } of attendanceByMember) {
      const dates = checkInsByMemberId.get(memberId) ?? [];
      dates.push(checkInAt);
      checkInsByMemberId.set(memberId, dates);
    }

    const data = members.map(({ memberships, ...member }) => ({
      ...member,
      membership: memberships[0] ?? null,
      streak: computeStreak(checkInsByMemberId.get(member.id) ?? []),
    }));

    return { data, total, skip, limit };
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

    if (dto.phone) {
      const existing = await this.prisma.member.findUnique({ where: { phone: dto.phone } });
      if (existing && existing.id !== id) {
        throw new ConflictException('A member with this phone number already exists');
      }
    }

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
