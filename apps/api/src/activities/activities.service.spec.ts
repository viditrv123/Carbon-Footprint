import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { PrismaService } from '../prisma/prisma.service';
import { CarbonCalculatorService } from './carbon-calculator.service';
import { ActivityCategory } from '@prisma/client';

const mockPrisma = {
  activity: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  streak: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

const mockCalculator = {
  calculate: jest.fn().mockReturnValue(5.0),
};

describe('ActivitiesService', () => {
  let service: ActivitiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivitiesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CarbonCalculatorService, useValue: mockCalculator },
      ],
    }).compile();
    service = module.get<ActivitiesService>(ActivitiesService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('calculates carbonKg and creates activity', async () => {
      const activity = { id: '1', carbonKg: 5.0, category: ActivityCategory.TRANSPORTATION };
      mockCalculator.calculate.mockReturnValue(5.0);
      mockPrisma.activity.create.mockResolvedValue(activity);
      mockPrisma.streak.findUnique.mockResolvedValue(null);

      const result = await service.create('user1', {
        category: ActivityCategory.TRANSPORTATION,
        subcategory: 'CAR_PETROL',
        value: 50,
        unit: 'km',
      });

      expect(mockCalculator.calculate).toHaveBeenCalledWith('CAR_PETROL', 50);
      expect(mockPrisma.activity.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ carbonKg: 5.0 }) }),
      );
      expect(result).toEqual(activity);
    });

    it('updates streak after creating activity', async () => {
      mockCalculator.calculate.mockReturnValue(10.0);
      mockPrisma.activity.create.mockResolvedValue({ id: '2', carbonKg: 10.0 });
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      mockPrisma.streak.findUnique.mockResolvedValue({
        userId: 'user1',
        currentDays: 3,
        longestDays: 5,
        lastLogDate: yesterday,
      });
      mockPrisma.streak.update.mockResolvedValue({});

      await service.create('user1', {
        category: ActivityCategory.FOOD,
        subcategory: 'BEEF',
        value: 1,
        unit: 'kg',
      });

      expect(mockPrisma.streak.update).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('returns paginated activities', async () => {
      mockPrisma.activity.findMany.mockResolvedValue([]);
      mockPrisma.activity.count.mockResolvedValue(0);

      const result = await service.findAll('user1', { page: 1, limit: 20 });

      expect(result).toEqual({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 });
    });

    it('applies category filter', async () => {
      mockPrisma.activity.findMany.mockResolvedValue([]);
      mockPrisma.activity.count.mockResolvedValue(0);

      await service.findAll('user1', { category: ActivityCategory.FOOD, page: 1, limit: 20 });

      expect(mockPrisma.activity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ category: ActivityCategory.FOOD }) }),
      );
    });

    it('calculates correct totalPages', async () => {
      mockPrisma.activity.findMany.mockResolvedValue([]);
      mockPrisma.activity.count.mockResolvedValue(45);

      const result = await service.findAll('user1', { page: 1, limit: 20 });

      expect(result.totalPages).toBe(3);
    });

    it('uses default page=1 and limit=20 when not provided', async () => {
      mockPrisma.activity.findMany.mockResolvedValue([]);
      mockPrisma.activity.count.mockResolvedValue(0);

      const result = await service.findAll('user1', {});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });
  });

  describe('findOne', () => {
    it('returns activity when found', async () => {
      const activity = { id: '1', userId: 'user1' };
      mockPrisma.activity.findFirst.mockResolvedValue(activity);

      const result = await service.findOne('user1', '1');
      expect(result).toEqual(activity);
    });

    it('throws NotFoundException when not found', async () => {
      mockPrisma.activity.findFirst.mockResolvedValue(null);
      await expect(service.findOne('user1', 'bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('recalculates carbonKg when value changes', async () => {
      const existing = { id: '1', userId: 'user1', subcategory: 'CAR_PETROL', value: 50 };
      mockPrisma.activity.findFirst.mockResolvedValue(existing);
      mockPrisma.activity.findUnique.mockResolvedValue(existing);
      mockCalculator.calculate.mockReturnValue(21.0);
      mockPrisma.activity.update.mockResolvedValue({ ...existing, value: 100, carbonKg: 21.0 });

      const result = await service.update('user1', '1', { value: 100 });

      expect(mockCalculator.calculate).toHaveBeenCalled();
      expect(mockPrisma.activity.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ carbonKg: 21.0 }) }),
      );
      expect(result.carbonKg).toBe(21.0);
    });

    it('throws NotFoundException when activity not found', async () => {
      mockPrisma.activity.findFirst.mockResolvedValue(null);
      await expect(service.update('user1', 'bad-id', { value: 10 })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deletes activity that belongs to user', async () => {
      const activity = { id: '1', userId: 'user1' };
      mockPrisma.activity.findFirst.mockResolvedValue(activity);
      mockPrisma.activity.delete.mockResolvedValue(activity);

      await service.remove('user1', '1');
      expect(mockPrisma.activity.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('throws when activity does not belong to user', async () => {
      mockPrisma.activity.findFirst.mockResolvedValue(null);
      await expect(service.remove('user1', 'other-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('exportCsv', () => {
    it('returns csv string with header and rows', async () => {
      mockPrisma.activity.findMany.mockResolvedValue([
        {
          date: new Date('2024-01-15'),
          category: ActivityCategory.TRANSPORTATION,
          subcategory: 'CAR_PETROL',
          value: 50,
          unit: 'km',
          carbonKg: 5.5,
          notes: null,
        },
      ]);

      const csv = await service.exportCsv('user1');
      expect(csv).toContain('date,category,subcategory,value,unit,carbonKg,notes');
      expect(csv).toContain('2024-01-15');
      expect(csv).toContain('TRANSPORTATION');
    });

    it('escapes double quotes in notes', async () => {
      mockPrisma.activity.findMany.mockResolvedValue([
        {
          date: new Date('2024-01-15'),
          category: ActivityCategory.FOOD,
          subcategory: 'BEEF',
          value: 1,
          unit: 'kg',
          carbonKg: 27,
          notes: 'She said "hello"',
        },
      ]);

      const csv = await service.exportCsv('user1');
      expect(csv).toContain('""hello""');
    });

    it('returns only header when there are no activities', async () => {
      mockPrisma.activity.findMany.mockResolvedValue([]);

      const csv = await service.exportCsv('user1');
      expect(csv).toBe('date,category,subcategory,value,unit,carbonKg,notes');
    });
  });
});
