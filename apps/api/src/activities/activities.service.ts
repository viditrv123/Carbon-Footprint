import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CarbonCalculatorService } from './carbon-calculator.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { ActivityFiltersDto } from './dto/activity-filters.dto';

/**
 * Manages carbon activity CRUD operations and streak tracking.
 */
@Injectable()
export class ActivitiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly calculator: CarbonCalculatorService,
  ) {}

  async create(userId: string, dto: CreateActivityDto) {
    const carbonKg = this.calculator.calculate(dto.subcategory, dto.value);

    const activity = await this.prisma.activity.create({
      data: {
        userId,
        category: dto.category,
        subcategory: dto.subcategory,
        value: dto.value,
        unit: dto.unit,
        carbonKg,
        date: dto.date ? new Date(dto.date) : new Date(),
        notes: dto.notes,
      },
    });

    // Update streak
    await this.updateStreak(userId);

    return activity;
  }

  async findAll(userId: string, filters: ActivityFiltersDto) {
    const { category, startDate, endDate, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: { userId: string; category?: import('@prisma/client').ActivityCategory; date?: { gte?: Date; lte?: Date } } = { userId };
    if (category) where.category = category;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      this.prisma.activity.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.activity.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(userId: string, id: string) {
    const activity = await this.prisma.activity.findFirst({ where: { id, userId } });
    if (!activity) throw new NotFoundException('Activity not found');
    return activity;
  }

  /** Updates an activity's fields. Recalculates carbonKg if value or subcategory changes. */
  async update(userId: string, id: string, dto: import('./dto/update-activity.dto').UpdateActivityDto): Promise<import('@prisma/client').Activity> {
    await this.findOne(userId, id);

    let carbonKg: number | undefined;
    if (dto.value !== undefined || dto.subcategory !== undefined) {
      const existing = await this.prisma.activity.findUnique({ where: { id } });
      const sub = dto.subcategory ?? existing!.subcategory;
      const val = dto.value ?? existing!.value;
      carbonKg = this.calculator.calculate(sub, val);
    }

    return this.prisma.activity.update({
      where: { id },
      data: {
        ...(dto.category && { category: dto.category }),
        ...(dto.subcategory && { subcategory: dto.subcategory }),
        ...(dto.value !== undefined && { value: dto.value }),
        ...(dto.unit && { unit: dto.unit }),
        ...(dto.date && { date: new Date(dto.date) }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(carbonKg !== undefined && { carbonKg }),
      },
    });
  }

  /** Serialises all user activities to CSV format for download. */
  async exportCsv(userId: string): Promise<string> {
    const activities = await this.prisma.activity.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    const header = 'date,category,subcategory,value,unit,carbonKg,notes';
    const rows = activities.map(a =>
      [
        a.date.toISOString().split('T')[0],
        a.category,
        a.subcategory,
        a.value,
        a.unit,
        a.carbonKg.toFixed(3),
        `"${(a.notes ?? '').replace(/"/g, '""')}"`,
      ].join(','),
    );
    return [header, ...rows].join('\n');
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.activity.delete({ where: { id } });
  }

  private async updateStreak(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const streak = await this.prisma.streak.findUnique({ where: { userId } });
    if (!streak) return;

    const lastLog = streak.lastLogDate;
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let currentDays = streak.currentDays;

    if (!lastLog || lastLog < yesterday) {
      currentDays = 1;
    } else if (lastLog >= yesterday && lastLog < today) {
      currentDays += 1;
    }
    // Same day — no change

    const longestDays = Math.max(streak.longestDays, currentDays);

    await this.prisma.streak.update({
      where: { userId },
      data: { currentDays, longestDays, lastLogDate: today },
    });
  }
}
