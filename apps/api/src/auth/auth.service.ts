import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

/**
 * Handles user registration, login, token refresh, and logout.
 * Access tokens expire in 15 minutes; refresh tokens in 7 days.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<{ user: Record<string, unknown>; tokens: { accessToken: string; refreshToken: string } }> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashed,
        country: dto.country || 'US',
        streak: { create: {} },
      },
      select: {
        id: true,
        name: true,
        email: true,
        country: true,
        avatarUrl: true,
        monthlyGoalKg: true,
        createdAt: true,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email);
    return { user, tokens };
  }

  async login(dto: LoginDto): Promise<{ user: Record<string, unknown>; tokens: { accessToken: string; refreshToken: string } }> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) throw new UnauthorizedException('Invalid credentials');

    const { password: _, ...userWithoutPassword } = user;
    const tokens = await this.generateTokens(user.id, user.email);
    return { user: userWithoutPassword, tokens };
  }

  async refreshTokens(refreshToken: string): Promise<{ user: Record<string, unknown>; tokens: { accessToken: string; refreshToken: string } }> {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      if (stored) await this.prisma.refreshToken.delete({ where: { id: stored.id } });
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await this.prisma.refreshToken.delete({ where: { id: stored.id } });

    const { password: _, ...userWithoutPassword } = stored.user;
    const tokens = await this.generateTokens(stored.user.id, stored.user.email);
    return { user: userWithoutPassword, tokens };
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      await this.prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    } else {
      await this.prisma.refreshToken.deleteMany({ where: { userId } });
    }
  }

  private async generateTokens(userId: string, email: string): Promise<{ accessToken: string; refreshToken: string }> {
    const jwtSecret = this.config.getOrThrow<string>('JWT_SECRET');
    const jwtRefreshSecret = this.config.getOrThrow<string>('JWT_REFRESH_SECRET');
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: jwtSecret,
        expiresIn: this.config.get('JWT_EXPIRES_IN', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: jwtRefreshSecret,
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    const expiresAt = new Date();
    expiresAt.getDate();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: { token: refreshToken, userId, expiresAt },
    });

    return { accessToken, refreshToken };
  }
}
