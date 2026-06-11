'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ActivityCategory } from '@carbon/types';
import { CATEGORY_ICONS, CATEGORY_LABELS, CATEGORY_COLORS, formatKg, formatDate } from '@/lib/utils';
import { Trash2, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

export default function HistoryPage() {
  const [category, setCategory] = useState<ActivityCategory | ''>('');
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['activities', { category, page }],
    queryFn: () => api.activities.getAll({
      ...(category && { category }),
      page: String(page),
      limit: '20',
    }) as any,
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this activity?')) return;
    setDeleting(id);
    try {
      await api.activities.delete(id);
      await queryClient.invalidateQueries({ queryKey: ['activities'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-forest-900">Activity History</h1>
        <p className="text-gray-500 mt-1">All your logged carbon activities</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Filter by category">
        <Filter className="h-4 w-4 text-gray-400 flex-shrink-0" aria-hidden />
        <button
          onClick={() => { setCategory(''); setPage(1); }}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${!category ? 'bg-forest-700 text-white' : 'bg-forest-100 text-forest-700 hover:bg-forest-200'}`}
          aria-pressed={!category}
        >
          All
        </button>
        {Object.values(ActivityCategory).map(cat => (
          <button
            key={cat}
            onClick={() => { setCategory(cat); setPage(1); }}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${category === cat ? 'bg-forest-700 text-white' : 'bg-forest-100 text-forest-700 hover:bg-forest-200'}`}
            aria-pressed={category === cat}
          >
            {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-forest-50 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : !data?.data?.length ? (
        <Card className="text-center py-12">
          <p className="text-4xl mb-3" aria-hidden>📋</p>
          <p className="text-forest-700 font-medium">No activities found</p>
          <p className="text-gray-400 text-sm mt-1">Start logging to see your history</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {data.data.map((activity: any, i: number) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between gap-4 rounded-xl bg-white border border-forest-100 px-5 py-4 hover:shadow-eco transition-all group"
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div
                  className="flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ backgroundColor: `${CATEGORY_COLORS[activity.category as ActivityCategory]}20` }}
                  aria-hidden
                >
                  {CATEGORY_ICONS[activity.category as ActivityCategory]}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-forest-800 truncate">
                    {activity.subcategory.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase())}
                  </p>
                  <p className="text-xs text-gray-400">{formatDate(activity.date)} · {activity.value} {activity.unit}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="font-semibold text-forest-800 tabular-nums">
                  {formatKg(activity.carbonKg)}
                </span>
                <button
                  onClick={() => handleDelete(activity.id)}
                  disabled={deleting === activity.id}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 focus-visible:opacity-100"
                  aria-label={`Delete activity from ${formatDate(activity.date)}`}
                >
                  {deleting === activity.id
                    ? <span className="h-4 w-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin block" aria-hidden />
                    : <Trash2 className="h-4 w-4" aria-hidden />}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data?.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-gray-400">
            Page {data.page} of {data.totalPages} ({data.total} activities)
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page <= 1} aria-label="Previous page">
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= data.totalPages} aria-label="Next page">
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
