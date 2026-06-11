import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityCategory } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [thisMonthActivities, lastMonthActivities, allActivities, streak, user] = await Promise.all([
      this.prisma.activity.findMany({
        where: { userId, date: { gte: startOfMonth } },
        select: { carbonKg: true, category: true },
      }),
      this.prisma.activity.findMany({
        where: { userId, date: { gte: startOfLastMonth, lte: endOfLastMonth } },
        select: { carbonKg: true },
      }),
      this.prisma.activity.findMany({
        where: { userId },
        select: { carbonKg: true },
      }),
      this.prisma.streak.findUnique({ where: { userId } }),
      this.prisma.user.findUnique({ where: { id: userId }, select: { monthlyGoalKg: true } }),
    ]);

    const totalCarbonThisMonth = thisMonthActivities.reduce((s: number, a: { carbonKg: number }) => s + a.carbonKg, 0);
    const totalCarbonLastMonth = lastMonthActivities.reduce((s: number, a: { carbonKg: number }) => s + a.carbonKg, 0);
    const totalCarbonKg = allActivities.reduce((s: number, a: { carbonKg: number }) => s + a.carbonKg, 0);

    const percentageChange = totalCarbonLastMonth > 0
      ? ((totalCarbonThisMonth - totalCarbonLastMonth) / totalCarbonLastMonth) * 100
      : 0;

    // Category breakdown this month
    const categoryMap = new Map<ActivityCategory, number>();
    for (const a of thisMonthActivities) {
      categoryMap.set(a.category, (categoryMap.get(a.category) || 0) + a.carbonKg);
    }
    const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, carbonKg]) => ({
      category,
      carbonKg: Math.round(carbonKg * 100) / 100,
      percentage: totalCarbonThisMonth > 0 ? Math.round((carbonKg / totalCarbonThisMonth) * 100) : 0,
      count: thisMonthActivities.filter(a => a.category === category).length,
    }));

    // 7-day trend
    const weeklyTrend = await this.getWeeklyTrend(userId);

    const daysInMonth = now.getDate();
    const dailyAverage = daysInMonth > 0 ? totalCarbonThisMonth / daysInMonth : 0;

    const monthlyGoalKg = user?.monthlyGoalKg;
    const goalProgress = monthlyGoalKg && monthlyGoalKg > 0
      ? Math.min((totalCarbonThisMonth / monthlyGoalKg) * 100, 100)
      : undefined;

    return {
      totalCarbonKg: Math.round(totalCarbonKg * 100) / 100,
      totalCarbonThisMonth: Math.round(totalCarbonThisMonth * 100) / 100,
      totalCarbonLastMonth: Math.round(totalCarbonLastMonth * 100) / 100,
      percentageChange: Math.round(percentageChange * 10) / 10,
      dailyAverage: Math.round(dailyAverage * 100) / 100,
      categoryBreakdown,
      weeklyTrend,
      streakDays: streak?.currentDays ?? 0,
      monthlyGoalKg,
      goalProgress: goalProgress !== undefined ? Math.round(goalProgress * 10) / 10 : undefined,
    };
  }

  private async getWeeklyTrend(userId: string) {
    const days: { date: string; carbonKg: number }[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(day.getDate() - i);
      const start = new Date(day.getFullYear(), day.getMonth(), day.getDate());
      const end = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999);

      const activities = await this.prisma.activity.findMany({
        where: { userId, date: { gte: start, lte: end } },
        select: { carbonKg: true },
      });
      const total = activities.reduce((s: number, a: { carbonKg: number }) => s + a.carbonKg, 0);
      days.push({ date: start.toISOString().split('T')[0], carbonKg: Math.round(total * 100) / 100 });
    }

    return days;
  }
}
