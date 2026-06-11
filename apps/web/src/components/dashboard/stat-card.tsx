'use client';

import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Minus, HelpCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const STAT_TOOLTIPS: Record<string, string> = {
  'This Month': 'Total CO₂e emitted from all logged activities this calendar month. CO₂e = carbon dioxide equivalent, a single unit for all greenhouse gases.',
  'Daily Average': 'Your average daily emissions this month. The global average is ~15 kg CO₂e/day.',
  'Total Tracked': 'Cumulative CO₂e from all activities you\'ve ever logged in EcoTrack.',
  'Streak': 'Consecutive days you\'ve logged at least one activity. Logging daily builds self-awareness.',
};

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
  trend?: number;
  index?: number;
}

export function StatCard({ title, value, subtitle, icon, trend, index = 0 }: StatCardProps) {
  const trendPositive = trend !== undefined && trend < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-forest-50 -translate-y-8 translate-x-8 opacity-60" aria-hidden />
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <p className="text-sm font-medium text-gray-500">{title}</p>
              {STAT_TOOLTIPS[title] && (
                <Tooltip content={STAT_TOOLTIPS[title]} side="top">
                  <button className="text-gray-300 hover:text-gray-500 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-forest-400 rounded" aria-label={`Learn more about ${title}`}>
                    <HelpCircle className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </Tooltip>
              )}
            </div>
            <p className="text-2xl font-bold text-forest-800 tabular-nums">{value}</p>
            {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          </div>
          <div className="flex-shrink-0 text-2xl ml-2" aria-hidden>{icon}</div>
        </div>
        {trend !== undefined && (
          <div className={cn(
            'flex items-center gap-1 mt-3 text-xs font-medium',
            trendPositive ? 'text-green-600' : trend > 0 ? 'text-red-500' : 'text-gray-400'
          )}>
            {trendPositive ? <TrendingDown className="h-3.5 w-3.5" aria-hidden /> :
             trend > 0 ? <TrendingUp className="h-3.5 w-3.5" aria-hidden /> :
             <Minus className="h-3.5 w-3.5" aria-hidden />}
            <span>
              {Math.abs(trend).toFixed(1)}% vs last month
            </span>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
