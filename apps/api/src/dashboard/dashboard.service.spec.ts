import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityCategory } from '@prisma/client';

const mockPrisma = {
  activity: { findMany: jest.fn(), count: jest.fn() },
  streak: { findUnique: jest.fn() },
  user: { findUnique: jest.fn() },
};

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<DashboardService>(DashboardService);
    jest.clearAllMocks();
  });

  describe('getStats', () => {
    it('returns zeroes when user has no activities', async () => {
      // Promise.all calls findMany 3 times (thisMonth, lastMonth, all) + streak + user
      // Then getWeeklyTrend calls findMany once more
      mockPrisma.activity.findMany
        .mockResolvedValueOnce([])  // thisMonth
        .mockResolvedValueOnce([])  // lastMonth
        .mockResolvedValueOnce([])  // all
        .mockResolvedValueOnce([]); // weeklyTrend
      mockPrisma.streak.findUnique.mockResolvedValue({ currentDays: 0 });
      mockPrisma.user.findUnique.mockResolvedValue({ monthlyGoalKg: null });

      const stats = await service.getStats('user1');

      expect(stats.totalCarbonThisMonth).toBe(0);
      expect(stats.totalCarbonLastMonth).toBe(0);
      expect(stats.percentageChange).toBe(0);
      expect(stats.streakDays).toBe(0);
    });

    it('sums carbonKg across activities correctly', async () => {
      const activities = [
        { carbonKg: 10.5, category: ActivityCategory.TRANSPORTATION },
        { carbonKg: 5.25, category: ActivityCategory.FOOD },
      ];
      mockPrisma.activity.findMany
        .mockResolvedValueOnce(activities)  // thisMonth
        .mockResolvedValueOnce([])          // lastMonth
        .mockResolvedValueOnce(activities)  // all
        .mockResolvedValueOnce([]);         // weeklyTrend
      mockPrisma.streak.findUnique.mockResolvedValue({ currentDays: 3 });
      mockPrisma.user.findUnique.mockResolvedValue({ monthlyGoalKg: 100 });

      const stats = await service.getStats('user1');

      expect(stats.totalCarbonThisMonth).toBe(15.75);
      expect(stats.streakDays).toBe(3);
    });

    it('calculates goalProgress when monthlyGoalKg is set', async () => {
      const activities = [{ carbonKg: 50, category: ActivityCategory.HOME_ENERGY }];
      mockPrisma.activity.findMany
        .mockResolvedValueOnce(activities)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(activities)
        .mockResolvedValueOnce([]);
      mockPrisma.streak.findUnique.mockResolvedValue({ currentDays: 1 });
      mockPrisma.user.findUnique.mockResolvedValue({ monthlyGoalKg: 200 });

      const stats = await service.getStats('user1');
      expect(stats.goalProgress).toBe(25);
    });

    it('caps goalProgress at 100 when over budget', async () => {
      const activities = [{ carbonKg: 300, category: ActivityCategory.HOME_ENERGY }];
      mockPrisma.activity.findMany
        .mockResolvedValueOnce(activities)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(activities)
        .mockResolvedValueOnce([]);
      mockPrisma.streak.findUnique.mockResolvedValue({ currentDays: 1 });
      mockPrisma.user.findUnique.mockResolvedValue({ monthlyGoalKg: 200 });

      const stats = await service.getStats('user1');
      expect(stats.goalProgress).toBe(100);
    });

    it('leaves goalProgress undefined when no monthlyGoalKg', async () => {
      mockPrisma.activity.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      mockPrisma.streak.findUnique.mockResolvedValue(null);
      mockPrisma.user.findUnique.mockResolvedValue({ monthlyGoalKg: null });

      const stats = await service.getStats('user1');
      expect(stats.goalProgress).toBeUndefined();
    });

    it('calculates percentageChange correctly', async () => {
      const thisMonth = [{ carbonKg: 150, category: ActivityCategory.TRANSPORTATION }];
      const lastMonth = [{ carbonKg: 100, category: ActivityCategory.TRANSPORTATION }];
      mockPrisma.activity.findMany
        .mockResolvedValueOnce(thisMonth)
        .mockResolvedValueOnce(lastMonth)
        .mockResolvedValueOnce(thisMonth)
        .mockResolvedValueOnce([]);
      mockPrisma.streak.findUnique.mockResolvedValue({ currentDays: 5 });
      mockPrisma.user.findUnique.mockResolvedValue({ monthlyGoalKg: null });

      const stats = await service.getStats('user1');
      expect(stats.percentageChange).toBe(50);
    });

    it('returns streakDays 0 when streak record is missing', async () => {
      mockPrisma.activity.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      mockPrisma.streak.findUnique.mockResolvedValue(null);
      mockPrisma.user.findUnique.mockResolvedValue({ monthlyGoalKg: null });

      const stats = await service.getStats('user1');
      expect(stats.streakDays).toBe(0);
    });

    it('builds categoryBreakdown from this-month activities', async () => {
      const activities = [
        { carbonKg: 60, category: ActivityCategory.TRANSPORTATION },
        { carbonKg: 40, category: ActivityCategory.FOOD },
      ];
      mockPrisma.activity.findMany
        .mockResolvedValueOnce(activities)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(activities)
        .mockResolvedValueOnce([]);
      mockPrisma.streak.findUnique.mockResolvedValue({ currentDays: 0 });
      mockPrisma.user.findUnique.mockResolvedValue({ monthlyGoalKg: null });

      const stats = await service.getStats('user1') as {
        categoryBreakdown: { category: ActivityCategory; carbonKg: number; percentage: number }[];
      };
      expect(stats.categoryBreakdown).toHaveLength(2);
      const transport = stats.categoryBreakdown.find(c => c.category === ActivityCategory.TRANSPORTATION);
      expect(transport?.percentage).toBe(60);
    });
  });
});
