import { Test, TestingModule } from '@nestjs/testing';
import { InsightsService } from './insights.service';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityCategory } from '@prisma/client';

const mockPrisma = {
  user: { findUnique: jest.fn() },
  activity: { findMany: jest.fn() },
};

describe('InsightsService', () => {
  let service: InsightsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InsightsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<InsightsService>(InsightsService);
    jest.clearAllMocks();
  });

  describe('getInsights', () => {
    it('always includes a comparison insight', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ country: 'US', monthlyGoalKg: null });
      mockPrisma.activity.findMany.mockResolvedValue([]);

      const result = await service.getInsights('user1');

      expect(result.insights.some(i => i.type === 'COMPARISON')).toBe(true);
    });

    it('includes tips for the highest-emission category', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ country: 'US', monthlyGoalKg: null });
      mockPrisma.activity.findMany.mockResolvedValue([
        { category: ActivityCategory.TRANSPORTATION, subcategory: 'CAR_PETROL', carbonKg: 200 },
        { category: ActivityCategory.FOOD, subcategory: 'BEEF', carbonKg: 50 },
      ]);

      const result = await service.getInsights('user1');
      const tipInsights = result.insights.filter(i => i.type === 'TIP');
      expect(tipInsights.length).toBeGreaterThan(0);
      expect(tipInsights[0].category).toBe(ActivityCategory.TRANSPORTATION);
    });

    it('returns comparison with user and global monthly kg', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ country: 'GB', monthlyGoalKg: null });
      mockPrisma.activity.findMany.mockResolvedValue([
        { category: ActivityCategory.HOME_ENERGY, subcategory: 'ELECTRICITY', carbonKg: 100 },
      ]);

      const { comparison } = await service.getInsights('user1');
      expect(comparison.userMonthlyKg).toBe(100);
      expect(comparison.globalAverageMonthlyKg).toBe(4500);
      expect(comparison.countryAverageMonthlyKg).toBe(2917); // GB
    });

    it('adds achievement insight when footprint is 30% below global average', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ country: 'US', monthlyGoalKg: null });
      mockPrisma.activity.findMany.mockResolvedValue([
        { category: ActivityCategory.FOOD, subcategory: 'VEGETABLES', carbonKg: 500 }, // well below 4500 * 0.7 = 3150
      ]);

      const { insights } = await service.getInsights('user1');
      expect(insights.some(i => i.type === 'ACHIEVEMENT')).toBe(true);
    });

    it('does not add achievement when footprint is above 70% of global average', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ country: 'US', monthlyGoalKg: null });
      mockPrisma.activity.findMany.mockResolvedValue([
        { category: ActivityCategory.TRANSPORTATION, subcategory: 'CAR_PETROL', carbonKg: 4000 },
      ]);

      const { insights } = await service.getInsights('user1');
      expect(insights.some(i => i.type === 'ACHIEVEMENT')).toBe(false);
    });

    it('adds goal warning when close to monthly limit', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ country: 'US', monthlyGoalKg: 100 });
      mockPrisma.activity.findMany.mockResolvedValue([
        { category: ActivityCategory.TRANSPORTATION, subcategory: 'CAR_PETROL', carbonKg: 85 },
      ]);

      const { insights } = await service.getInsights('user1');
      expect(insights.some(i => i.type === 'WARNING')).toBe(true);
    });

    it('does not add goal warning when well under monthly limit', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ country: 'US', monthlyGoalKg: 200 });
      mockPrisma.activity.findMany.mockResolvedValue([
        { category: ActivityCategory.FOOD, subcategory: 'VEGETABLES', carbonKg: 10 },
      ]);

      const { insights } = await service.getInsights('user1');
      expect(insights.some(i => i.type === 'WARNING')).toBe(false);
    });

    it('uses DEFAULT country average when country is not recognised', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ country: 'ZZ', monthlyGoalKg: null });
      mockPrisma.activity.findMany.mockResolvedValue([]);

      const { comparison } = await service.getInsights('user1');
      expect(comparison.countryAverageMonthlyKg).toBe(4500); // DEFAULT
    });

    it('uses DEFAULT country average when country is null/undefined', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ country: null, monthlyGoalKg: null });
      mockPrisma.activity.findMany.mockResolvedValue([]);

      const { comparison } = await service.getInsights('user1');
      expect(comparison.countryAverageMonthlyKg).toBe(4500);
    });

    it('returns no tip insights when there are no activities', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ country: 'US', monthlyGoalKg: null });
      mockPrisma.activity.findMany.mockResolvedValue([]);

      const { insights } = await service.getInsights('user1');
      expect(insights.filter(i => i.type === 'TIP')).toHaveLength(0);
    });
  });
});
