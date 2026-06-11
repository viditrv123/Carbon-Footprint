import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  refreshToken: {
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
};

const mockJwtService = {
  signAsync: jest.fn().mockResolvedValue('test-token'),
};

const mockConfigService = {
  get: jest.fn((key: string, def?: string) => def || 'test-value'),
  getOrThrow: jest.fn().mockReturnValue('test-secret'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();
    service = module.get(AuthService);
  });

  describe('register', () => {
    it('throws ConflictException if email exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: '1', email: 'test@test.com' });
      await expect(service.register({ name: 'Test', email: 'test@test.com', password: 'Pass123!' }))
        .rejects.toThrow(ConflictException);
    });

    it('creates user and returns tokens', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: '1', name: 'Test', email: 'test@test.com', country: 'US', createdAt: new Date(),
      });
      mockPrismaService.refreshToken.create.mockResolvedValue({});

      const result = await service.register({ name: 'Test', email: 'test@test.com', password: 'Pass123!' });
      expect(result).toHaveProperty('tokens');
      expect(result).toHaveProperty('user');
    });
  });

  describe('login', () => {
    it('throws UnauthorizedException for invalid email', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      await expect(service.login({ email: 'bad@test.com', password: 'Pass123!' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for wrong password', async () => {
      const hashed = await bcrypt.hash('correct', 12);
      mockPrismaService.user.findUnique.mockResolvedValue({ id: '1', email: 'test@test.com', password: hashed });
      await expect(service.login({ email: 'test@test.com', password: 'wrong' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('returns user and tokens for correct credentials', async () => {
      const hashed = await bcrypt.hash('Pass123!', 12);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: '1', name: 'Test', email: 'test@test.com', password: hashed,
        country: 'US', avatarUrl: null, monthlyGoalKg: null, createdAt: new Date(),
      });
      mockPrismaService.refreshToken.create.mockResolvedValue({});

      const result = await service.login({ email: 'test@test.com', password: 'Pass123!' });
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect((result.user as Record<string, unknown>).password).toBeUndefined();
      expect(result.tokens).toHaveProperty('accessToken');
      expect(result.tokens).toHaveProperty('refreshToken');
    });
  });

  describe('refreshTokens', () => {
    it('returns new tokens and user for a valid refresh token', async () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      mockPrismaService.refreshToken.findUnique.mockResolvedValue({
        id: 'rt-1',
        token: 'valid-token',
        expiresAt: futureDate,
        user: { id: '1', email: 'test@test.com', password: 'hashed', name: 'Test' },
      });
      mockPrismaService.refreshToken.delete.mockResolvedValue({});
      mockPrismaService.refreshToken.create.mockResolvedValue({});

      const result = await service.refreshTokens('valid-token');
      expect(result).toHaveProperty('tokens');
      expect(result).toHaveProperty('user');
      expect((result.user as Record<string, unknown>).password).toBeUndefined();
    });

    it('throws UnauthorizedException for an expired refresh token', async () => {
      const pastDate = new Date(Date.now() - 1000);
      mockPrismaService.refreshToken.findUnique.mockResolvedValue({
        id: 'rt-1',
        token: 'expired-token',
        expiresAt: pastDate,
        user: { id: '1', email: 'test@test.com', password: 'hashed' },
      });
      mockPrismaService.refreshToken.delete.mockResolvedValue({});

      await expect(service.refreshTokens('expired-token')).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when token does not exist', async () => {
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(null);

      await expect(service.refreshTokens('non-existent-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('deletes specific token when refreshToken is provided', async () => {
      mockPrismaService.refreshToken.deleteMany.mockResolvedValue({ count: 1 });

      await service.logout('user1', 'some-refresh-token');

      expect(mockPrismaService.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { token: 'some-refresh-token' },
      });
    });

    it('deletes all user tokens when no refreshToken is provided', async () => {
      mockPrismaService.refreshToken.deleteMany.mockResolvedValue({ count: 3 });

      await service.logout('user1');

      expect(mockPrismaService.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
      });
    });
  });
});
