import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { Role } from '../generated/prisma/enums.js';

const SALT_ROUNDS = 12;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    if (dto.role !== Role.ADMIN) {
      throw new BadRequestException('Only ADMIN accounts can be created through this endpoint');
    }

    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const pinHash = dto.pin ? await bcrypt.hash(dto.pin, SALT_ROUNDS) : undefined;

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        passwordHash,
        pinHash,
        role: dto.role,
      },
    });

    return this.toSafeUser(user);
  }

  async findAll() {
    const users = await this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    return users.map((u) => this.toSafeUser(u));
  }

  async deactivate(id: string) {
    const user = await this.prisma.user.update({ where: { id }, data: { isActive: false } });
    return this.toSafeUser(user);
  }

  private toSafeUser(user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: Role;
    isActive: boolean;
    createdAt: Date;
  }) {
    const { id, name, email, phone, role, isActive, createdAt } = user;
    return { id, name, email, phone, role, isActive, createdAt };
  }
}
