import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('returns user profile without password', async () => {
      const user = {
        id: 'user1',
        name: 'Alice',
        email: 'alice@example.com',
        country: 'US',
        avatarUrl: null,
        monthlyGoalKg: null,
        createdAt: new Date(),
        streak: { currentDays: 3, longestDays: 10 },
      };
      mockPrisma.user.findUnique.mockResolvedValue(user);

      const result = await service.getProfile('user1');

      expect(result).toEqual(user);
      expect((result as Record<string, unknown>).password).toBeUndefined();
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user1' },
        select: expect.objectContaining({ id: true, name: true, email: true }),
      });
    });

    it('throws NotFoundException when user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProfile', () => {
    it('updates allowed fields and returns updated user', async () => {
      const updated = {
        id: 'user1',
        name: 'Bob',
        email: 'alice@example.com',
        country: 'GB',
        avatarUrl: null,
        monthlyGoalKg: 150,
        createdAt: new Date(),
      };
      mockPrisma.user.update.mockResolvedValue(updated);

      const result = await service.updateProfile('user1', { name: 'Bob', country: 'GB', monthlyGoalKg: 150 });

      expect(result).toEqual(updated);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user1' },
        data: { name: 'Bob', country: 'GB', monthlyGoalKg: 150 },
        select: expect.objectContaining({ id: true, name: true, email: true }),
      });
    });

    it('does not expose password in the response', async () => {
      const updated = {
        id: 'user1',
        name: 'Bob',
        email: 'alice@example.com',
        country: 'US',
        avatarUrl: null,
        monthlyGoalKg: null,
        createdAt: new Date(),
      };
      mockPrisma.user.update.mockResolvedValue(updated);

      const result = await service.updateProfile('user1', { name: 'Bob' });
      expect((result as Record<string, unknown>).password).toBeUndefined();
    });
  });

  describe('deleteAccount', () => {
    it('calls prisma.user.delete with the correct userId', async () => {
      mockPrisma.user.delete.mockResolvedValue({});

      await service.deleteAccount('user1');

      expect(mockPrisma.user.delete).toHaveBeenCalledWith({ where: { id: 'user1' } });
    });

    it('resolves without returning a value', async () => {
      mockPrisma.user.delete.mockResolvedValue({});

      const result = await service.deleteAccount('user1');
      expect(result).toBeUndefined();
    });
  });
});
