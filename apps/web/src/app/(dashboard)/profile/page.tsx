'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  country: z.string().length(2),
  monthlyGoalKg: z.coerce.number().positive().optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name ?? '',
      country: user?.country ?? 'US',
      monthlyGoalKg: user?.monthlyGoalKg ?? '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setError(null);
      const updated: any = await api.users.updateMe({
        name: data.name,
        country: data.country,
        monthlyGoalKg: data.monthlyGoalKg || undefined,
      });
      updateUser(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      setError(e.message || 'Update failed');
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-forest-900">Profile</h1>
        <p className="text-gray-500 mt-1">Manage your account settings</p>
      </div>

      {/* Avatar */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-forest-500 to-forest-700 text-white text-2xl font-bold flex-shrink-0"
            aria-hidden>
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div>
            <p className="font-semibold text-forest-900 text-lg">{user?.name}</p>
            <p className="text-gray-500 text-sm">{user?.email}</p>
          </div>
        </div>
      </Card>

      {/* Profile form */}
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent>
          {success && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 mb-4 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700"
              role="status"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              Profile updated successfully!
            </motion.div>
          )}

          {error && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              label="Full name"
              error={errors.name?.message}
              {...register('name')}
            />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="country" className="text-sm font-medium text-forest-800">Country</label>
              <select
                id="country"
                className="flex h-10 w-full rounded-xl border border-forest-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-all"
                {...register('country')}
              >
                <option value="US">United States</option>
                <option value="GB">United Kingdom</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="AU">Australia</option>
                <option value="CA">Canada</option>
                <option value="IN">India</option>
                <option value="CN">China</option>
              </select>
            </div>

            <Input
              label="Monthly carbon goal (kg CO₂e)"
              type="number"
              min="0"
              placeholder="e.g. 300"
              hint="Set a target to track progress. World-average is ~4,500kg/month."
              error={errors.monthlyGoalKg?.message}
              {...register('monthlyGoalKg')}
            />

            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full"
              loading={isSubmitting}
              disabled={!isDirty}
            >
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
