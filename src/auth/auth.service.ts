import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(email: string, password?: string, pin?: string) {
    if (!password && !pin) {
      throw new BadRequestException('Provide a password or a PIN');
    }
    if (password && pin) {
      throw new BadRequestException('Provide either a password or a PIN, not both');
    }

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const credentialHash = password ? user.passwordHash : pin && user.pinEnabled ? user.pinHash : null;
    const credentialValue = password ?? pin!;

    if (!credentialHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const matches = await bcrypt.compare(credentialValue, credentialHash);
    if (!matches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.jwt.signAsync({ sub: user.id });

    return {
      accessToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  }

  /**
   * Public, pre-authentication check so the login page can ask for a
   * password or PIN without the user having to pick blindly. Returns
   * pinEnabled: false for unknown/inactive emails too, so the response
   * never reveals whether an account exists.
   */
  async getLoginMethod(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return { pinEnabled: !!(user && user.isActive && user.pinEnabled && user.pinHash) };
  }
}
