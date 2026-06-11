'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatKg } from '@/lib/utils';
import { ActivityCategory } from '@carbon/types';
import { CATEGORY_LABELS } from '@/lib/utils';
import { Globe, Leaf } from 'lucide-react';

export default function InsightsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['insights'],
    queryFn: () => api.insights.get() as any,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-forest-100 rounded-xl animate-pulse" />
        <div className="grid gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-forest-50 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const { insights = [], comparison } = data ?? {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-forest-900">Insights</h1>
        <p className="text-gray-500 mt-1">Personalized tips to reduce your impact</p>
      </div>

      {/* Comparison card */}
      {comparison && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-gradient-to-br from-forest-700 to-forest-800 text-white border-0">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="h-5 w-5 text-forest-300" aria-hidden />
                  <span className="text-forest-200 text-sm font-medium">Global comparison</span>
                </div>
                <p className="text-3xl font-bold text-white mb-1">
                  {formatKg(comparison.userMonthlyKg)}<span className="text-forest-300 text-lg">/mo</span>
                </p>
                <p className="text-forest-300 text-sm">Your monthly carbon footprint</p>
              </div>
              <div className="text-right">
                <p className="text-forest-200 text-xs mb-1">Global avg</p>
                <p className="text-white font-semibold">{formatKg(comparison.globalAverageMonthlyKg)}/mo</p>
                <div className={`mt-2 text-sm font-semibold ${comparison.userMonthlyKg < comparison.globalAverageMonthlyKg ? 'text-green-300' : 'text-amber-300'}`}>
                  {comparison.userMonthlyKg < comparison.globalAverageMonthlyKg
                    ? `${((1 - comparison.userMonthlyKg / comparison.globalAverageMonthlyKg) * 100).toFixed(0)}% below avg`
                    : `${((comparison.userMonthlyKg / comparison.globalAverageMonthlyKg - 1) * 100).toFixed(0)}% above avg`}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-forest-600">
              <p className="text-xs text-forest-300 mb-2">Your percentile rank</p>
              <div className="relative h-2.5 rounded-full bg-forest-600" role="meter" aria-valuenow={comparison.percentileRank} aria-valuemin={0} aria-valuemax={100} aria-label="Percentile rank">
                <div
                  className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-forest-300 to-green-300"
                  style={{ width: `${comparison.percentileRank}%` }}
                />
              </div>
              <p className="text-xs text-forest-300 mt-1.5">
                You&apos;re in the top {100 - comparison.percentileRank}% of lowest emitters
              </p>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Insights list */}
      <div className="space-y-3">
        {insights.map((insight: any, i: number) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={`${getInsightStyle(insight.type)} border`}>
              <div className="flex items-start gap-4">
                <div className="text-3xl flex-shrink-0" aria-hidden>{insight.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap mb-1.5">
                    <h3 className="font-semibold text-forest-900">{insight.title}</h3>
                    <Badge variant={getInsightBadgeVariant(insight.type)} className="flex-shrink-0">
                      {insight.type}
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{insight.description}</p>
                  {insight.potentialSavingKg && (
                    <div className="flex items-center gap-1.5 mt-2.5">
                      <Leaf className="h-3.5 w-3.5 text-forest-600" aria-hidden />
                      <span className="text-xs font-medium text-forest-700">
                        Potential saving: up to {formatKg(insight.potentialSavingKg)}/month
                      </span>
                    </div>
                  )}
                  {insight.category && (
                    <p className="text-xs text-gray-400 mt-1">
                      Category: {CATEGORY_LABELS[insight.category as ActivityCategory] || insight.category}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}

        {insights.length === 0 && (
          <Card className="text-center py-12">
            <p className="text-4xl mb-3" aria-hidden>💡</p>
            <p className="text-forest-700 font-medium">Log some activities to get insights</p>
            <p className="text-gray-400 text-sm mt-1">We&apos;ll analyze your data and provide personalized tips</p>
          </Card>
        )}
      </div>
    </div>
  );
}

function getInsightStyle(type: string): string {
  switch (type) {
    case 'TIP': return 'bg-blue-50 border-blue-200';
    case 'WARNING': return 'bg-amber-50 border-amber-200';
    case 'ACHIEVEMENT': return 'bg-green-50 border-green-200';
    case 'COMPARISON': return 'bg-forest-50 border-forest-200';
    default: return 'bg-white border-forest-100';
  }
}

function getInsightBadgeVariant(type: string): 'info' | 'warning' | 'success' | 'default' {
  switch (type) {
    case 'TIP': return 'info';
    case 'WARNING': return 'warning';
    case 'ACHIEVEMENT': return 'success';
    default: return 'default';
  }
}
