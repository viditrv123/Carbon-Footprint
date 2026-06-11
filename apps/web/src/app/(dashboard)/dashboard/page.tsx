'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { StatCard } from '@/components/dashboard/stat-card';
import { CarbonTrendChart } from '@/components/charts/carbon-trend-chart';
import { CategoryPieChart } from '@/components/charts/category-pie-chart';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatKg } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { PlusCircle, Flame } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.dashboard.getStats() as any,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-forest-100 rounded-xl animate-pulse w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-forest-50 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500">Failed to load dashboard. Please refresh.</p>
      </div>
    );
  }

  const isGoalExceeded = stats?.goalProgress && stats.goalProgress >= 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-forest-900">
            Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 mt-0.5">Here&apos;s your carbon footprint overview</p>
        </div>
        <Link href="/log">
          <Button variant="gradient" className="gap-2">
            <PlusCircle className="h-4 w-4" aria-hidden />
            Log Activity
          </Button>
        </Link>
      </motion.div>

      {/* Streak banner */}
      {stats?.streakDays > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 px-5 py-3.5"
        >
          <Flame className="h-5 w-5 text-orange-500 flex-shrink-0" aria-hidden />
          <div>
            <span className="font-semibold text-orange-800">{stats.streakDays}-day streak! </span>
            <span className="text-orange-600 text-sm">Keep logging to maintain your streak 🔥</span>
          </div>
        </motion.div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="This Month"
          value={formatKg(stats?.totalCarbonThisMonth ?? 0)}
          subtitle="CO₂e emitted"
          icon="📊"
          trend={stats?.percentageChange}
          index={0}
        />
        <StatCard
          title="Daily Average"
          value={formatKg(stats?.dailyAverage ?? 0)}
          subtitle="per day this month"
          icon="📅"
          index={1}
        />
        <StatCard
          title="Total Tracked"
          value={formatKg(stats?.totalCarbonKg ?? 0)}
          subtitle="all time"
          icon="🌍"
          index={2}
        />
        <StatCard
          title="Streak"
          value={`${stats?.streakDays ?? 0} days`}
          subtitle="consecutive logging"
          icon="🔥"
          index={3}
        />
      </div>

      {/* Goal progress */}
      {stats?.monthlyGoalKg && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Monthly Goal</CardTitle>
                <span className={`text-sm font-semibold ${isGoalExceeded ? 'text-red-500' : 'text-forest-600'}`}>
                  {formatKg(stats.totalCarbonThisMonth)} / {formatKg(stats.monthlyGoalKg)}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative h-3 rounded-full bg-forest-100 overflow-hidden" role="progressbar"
                aria-valuenow={stats.goalProgress} aria-valuemin={0} aria-valuemax={100}
                aria-label={`Goal progress: ${stats.goalProgress?.toFixed(0)}%`}>
                <motion.div
                  className={`absolute top-0 left-0 h-full rounded-full ${isGoalExceeded ? 'bg-red-500' : 'bg-gradient-to-r from-forest-500 to-forest-400'}`}
                  initial={{ width: '0%' }}
                  animate={{ width: `${Math.min(stats.goalProgress, 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {isGoalExceeded
                  ? `⚠️ You've exceeded your monthly goal by ${formatKg(stats.totalCarbonThisMonth - stats.monthlyGoalKg)}`
                  : `${formatKg(stats.monthlyGoalKg - stats.totalCarbonThisMonth)} remaining until goal`}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader><CardTitle>7-Day Trend</CardTitle></CardHeader>
            <CardContent>
              {stats?.weeklyTrend?.length ? (
                <CarbonTrendChart data={stats.weeklyTrend} />
              ) : (
                <div className="flex h-48 items-center justify-center text-gray-400 text-sm">
                  Log activities to see your trend
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader><CardTitle>By Category</CardTitle></CardHeader>
            <CardContent>
              <CategoryPieChart data={stats?.categoryBreakdown ?? []} />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
