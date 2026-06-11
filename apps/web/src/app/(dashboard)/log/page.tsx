'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ActivityCategory, EMISSION_FACTORS } from '@carbon/types';
import { CATEGORY_ICONS, CATEGORY_LABELS, SUBCATEGORIES } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

const schema = z.object({
  subcategory: z.string().min(1, 'Please select an activity'),
  value: z.coerce.number().positive('Value must be positive'),
  date: z.string().optional(),
  notes: z.string().max(500).optional(),
});

type FormData = z.infer<typeof schema>;

const categories = Object.values(ActivityCategory);

export default function LogPage() {
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const subcategoryValue = watch('subcategory');
  const quantityValue = watch('value');

  const currentSubcategories = selectedCategory ? SUBCATEGORIES[selectedCategory] : [];
  const selectedSubcat = currentSubcategories.find(s => s.value === subcategoryValue);
  const factor = EMISSION_FACTORS[subcategoryValue] ?? 0;
  const estimatedCarbon = quantityValue && factor ? quantityValue * factor : null;

  const onSubmit = async (data: FormData) => {
    if (!selectedCategory) return;
    try {
      setError(null);
      const unit = selectedSubcat?.unit ?? 'unit';
      await api.activities.create({
        category: selectedCategory,
        subcategory: data.subcategory,
        value: data.value,
        unit,
        date: data.date || undefined,
        notes: data.notes || undefined,
      });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      await queryClient.invalidateQueries({ queryKey: ['activities'] });
      setSuccess(true);
      reset();
      setSelectedCategory(null);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      setError(e.message || 'Failed to log activity');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-forest-900">Log Activity</h1>
        <p className="text-gray-500 mt-1">Track your carbon-emitting activities</p>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 rounded-2xl bg-green-50 border border-green-200 px-5 py-4"
            role="status"
          >
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" aria-hidden />
            <div>
              <p className="font-semibold text-green-800">Activity logged!</p>
              <p className="text-sm text-green-600">Your dashboard has been updated.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Selection */}
      <Card>
        <h2 className="text-base font-semibold text-forest-800 mb-4">1. Choose a category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" role="group" aria-label="Activity categories">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); reset({ subcategory: '', value: undefined as any }); }}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 ${
                selectedCategory === cat
                  ? 'border-forest-600 bg-forest-50 shadow-eco'
                  : 'border-forest-100 hover:border-forest-300 hover:bg-forest-50'
              }`}
              aria-pressed={selectedCategory === cat}
            >
              <span className="text-2xl" aria-hidden>{CATEGORY_ICONS[cat]}</span>
              <span className="text-xs font-medium text-forest-800">{CATEGORY_LABELS[cat]}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Activity Form */}
      <AnimatePresence>
        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Card>
              <h2 className="text-base font-semibold text-forest-800 mb-4">
                2. Enter details for {CATEGORY_LABELS[selectedCategory]}
              </h2>

              {error && (
                <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="subcategory" className="text-sm font-medium text-forest-800">
                    Activity type
                  </label>
                  <select
                    id="subcategory"
                    className="flex h-10 w-full rounded-xl border border-forest-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-all"
                    aria-invalid={!!errors.subcategory}
                    {...register('subcategory')}
                  >
                    <option value="">Select activity...</option>
                    {currentSubcategories.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  {errors.subcategory && (
                    <p className="text-xs text-red-500" role="alert">{errors.subcategory.message}</p>
                  )}
                </div>

                <Input
                  label={`Quantity ${selectedSubcat ? `(${selectedSubcat.unit})` : ''}`}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.0"
                  error={errors.value?.message}
                  {...register('value')}
                />

                {estimatedCarbon !== null && estimatedCarbon >= 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-xl bg-forest-50 border border-forest-200 px-4 py-3"
                  >
                    <p className="text-sm text-forest-700">
                      Estimated emissions:{' '}
                      <span className="font-bold text-forest-800 text-base">
                        {estimatedCarbon.toFixed(2)} kg CO₂e
                      </span>
                    </p>
                  </motion.div>
                )}

                <Input
                  label="Date (optional)"
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  {...register('date')}
                />

                <Input
                  label="Notes (optional)"
                  placeholder="Any additional context..."
                  {...register('notes')}
                />

                <Button type="submit" variant="gradient" size="lg" className="w-full" loading={isSubmitting}>
                  Log Activity
                </Button>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
