import { PrismaClient, ActivityCategory } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Password123!', 12);

  const user = await prisma.user.upsert({
    where: { email: 'demo@carbonfootprint.app' },
    update: {},
    create: {
      email: 'demo@carbonfootprint.app',
      password: hashedPassword,
      name: 'Demo User',
      country: 'GB',
      monthlyGoalKg: 300,
    },
  });

  // Seed 30 days of activities
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    await prisma.activity.createMany({
      data: [
        {
          userId: user.id,
          category: ActivityCategory.TRANSPORTATION,
          subcategory: 'CAR_PETROL',
          value: 15 + Math.random() * 10,
          unit: 'km',
          carbonKg: (15 + Math.random() * 10) * 0.21,
          date,
        },
        {
          userId: user.id,
          category: ActivityCategory.HOME_ENERGY,
          subcategory: 'ELECTRICITY',
          value: 8 + Math.random() * 4,
          unit: 'kWh',
          carbonKg: (8 + Math.random() * 4) * 0.233,
          date,
        },
        {
          userId: user.id,
          category: ActivityCategory.FOOD,
          subcategory: 'CHICKEN',
          value: 0.2 + Math.random() * 0.1,
          unit: 'kg',
          carbonKg: (0.2 + Math.random() * 0.1) * 6.9,
          date,
        },
      ],
    });
  }

  await prisma.streak.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      currentDays: 7,
      longestDays: 14,
      lastLogDate: now,
    },
  });

  console.log('Seed completed');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
