import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityCategory } from '@prisma/client';

const GLOBAL_AVERAGE_MONTHLY_KG = 4500;
const COUNTRY_AVERAGES: Record<string, number> = {
  US: 5000, GB: 2917, DE: 3500, FR: 2500, IN: 583,
  CN: 1750, AU: 4167, CA: 4583, DEFAULT: 4500,
};

const TIPS: Record<ActivityCategory, { title: string; description: string; savingKg: number; icon: string }[]> = {
  [ActivityCategory.TRANSPORTATION]: [
    { title: 'Switch to electric vehicle', description: 'EV produces 75% less CO₂ per km than a petrol car.', savingKg: 50, icon: '⚡' },
    { title: 'Use public transport', description: 'Taking the bus instead of your car reduces emissions by 60%.', savingKg: 30, icon: '🚌' },
    { title: 'Try cycling for short trips', description: 'Zero emissions and great for health!', savingKg: 15, icon: '🚲' },
  ],
  [ActivityCategory.HOME_ENERGY]: [
    { title: 'Switch to renewable energy', description: 'Green energy tariffs can eliminate home energy emissions.', savingKg: 80, icon: '☀️' },
    { title: 'Improve home insulation', description: 'Better insulation can reduce heating needs by 25%.', savingKg: 40, icon: '🏠' },
    { title: 'Use LED lighting', description: 'LEDs use 75% less energy than traditional bulbs.', savingKg: 5, icon: '💡' },
  ],
  [ActivityCategory.FOOD]: [
    { title: 'Reduce beef consumption', description: 'Beef has 27kg CO₂e per kg — the highest of any food.', savingKg: 60, icon: '🥗' },
    { title: 'Try plant-based Mondays', description: 'One meat-free day per week saves ~52kg CO₂e per year.', savingKg: 52, icon: '🌱' },
    { title: 'Reduce food waste', description: 'Food waste accounts for 8% of global emissions.', savingKg: 20, icon: '♻️' },
  ],
  [ActivityCategory.SHOPPING]: [
    { title: 'Buy second-hand clothing', description: 'Second-hand fashion reduces textile emissions by 90%.', savingKg: 15, icon: '👗' },
    { title: 'Repair before replacing', description: 'Electronics manufacturing is carbon-intensive — extend their life.', savingKg: 25, icon: '🔧' },
    { title: 'Choose durable products', description: 'Quality over quantity reduces overall consumption impact.', savingKg: 10, icon: '⭐' },
  ],
  [ActivityCategory.WASTE]: [
    { title: 'Start composting', description: 'Composting food scraps saves 0.08kg CO₂e per kg diverted.', savingKg: 8, icon: '🌿' },
    { title: 'Recycle more consistently', description: 'Recycling saves energy and raw material extraction.', savingKg: 12, icon: '♻️' },
    { title: 'Go zero-waste shopping', description: 'Reduce packaging waste with bulk and reusable containers.', savingKg: 6, icon: '🛍️' },
  ],
};

@Injectable()
export class InsightsService {
  constructor(private readonly prisma: PrismaService) {}

  async getInsights(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { country: true, monthlyGoalKg: true },
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const activities = await this.prisma.activity.findMany({
      where: { userId, date: { gte: startOfMonth } },
      select: { category: true, subcategory: true, carbonKg: true },
    });

    const monthlyTotal = activities.reduce((s: number, a: { carbonKg: number }) => s + a.carbonKg, 0);

    // Find the highest carbon category
    const categoryTotals = new Map<ActivityCategory, number>();
    for (const a of activities) {
      categoryTotals.set(a.category, (categoryTotals.get(a.category) || 0) + a.carbonKg);
    }
    const sortedCategories = [...categoryTotals.entries()].sort((a, b) => b[1] - a[1]);
    const topCategory = sortedCategories[0]?.[0];

    const insights: any[] = [];

    // Comparison insight
    const countryAvg = COUNTRY_AVERAGES[user?.country ?? 'DEFAULT'] ?? COUNTRY_AVERAGES.DEFAULT;
    insights.push({
      id: 'comparison',
      type: 'COMPARISON',
      title: 'Your carbon vs. global average',
      description: `Your monthly footprint is ${Math.round(monthlyTotal)}kg CO₂e. The global average is ${GLOBAL_AVERAGE_MONTHLY_KG}kg/month.`,
      icon: '🌍',
    });

    // Tips for top category
    if (topCategory) {
      const tips = TIPS[topCategory] || [];
      for (const tip of tips.slice(0, 2)) {
        insights.push({
          id: `tip-${tip.title.toLowerCase().replace(/\s+/g, '-')}`,
          type: 'TIP',
          title: tip.title,
          description: tip.description,
          category: topCategory,
          potentialSavingKg: tip.savingKg,
          icon: tip.icon,
        });
      }
    }

    // Achievement if trending down
    if (monthlyTotal < GLOBAL_AVERAGE_MONTHLY_KG * 0.7) {
      insights.push({
        id: 'achievement-low-carbon',
        type: 'ACHIEVEMENT',
        title: 'Low Carbon Champion!',
        description: `Your footprint is 30% below the global average. Keep it up!`,
        icon: '🏆',
      });
    }

    // Goal progress warning
    if (user?.monthlyGoalKg && monthlyTotal > user.monthlyGoalKg * 0.8) {
      const daysLeft = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate();
      insights.push({
        id: 'goal-warning',
        type: 'WARNING',
        title: 'Approaching monthly goal',
        description: `You're at ${Math.round((monthlyTotal / user.monthlyGoalKg) * 100)}% of your monthly goal with ${daysLeft} days left.`,
        icon: '⚠️',
      });
    }

    return {
      insights,
      comparison: {
        userMonthlyKg: Math.round(monthlyTotal * 100) / 100,
        globalAverageMonthlyKg: GLOBAL_AVERAGE_MONTHLY_KG,
        countryAverageMonthlyKg: countryAvg,
        percentileRank: Math.round(Math.max(0, Math.min(100, (1 - monthlyTotal / (countryAvg * 2)) * 100))),
      },
    };
  }
}
