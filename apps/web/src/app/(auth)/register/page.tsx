'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must include uppercase letter')
    .regex(/[0-9]/, 'Must include a number'),
  country: z.string().length(2).optional(),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { country: 'US' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setError(null);
      await registerUser(data.name, data.email, data.password, data.country);
      router.push('/dashboard');
    } catch (e: any) {
      setError(e.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md"
    >
      <div className="rounded-2xl bg-white border border-forest-100 shadow-eco-lg p-8">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3" aria-hidden>🌱</div>
          <h1 className="text-2xl font-bold text-forest-900">Start your journey</h1>
          <p className="text-gray-500 mt-1.5">Create a free account to track your carbon footprint</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            label="Full name"
            type="text"
            autoComplete="name"
            placeholder="Jane Smith"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="jane@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            hint="Min 8 chars, uppercase + number"
            error={errors.password?.message}
            {...register('password')}
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

          <Button type="submit" variant="gradient" size="lg" className="w-full mt-2" loading={isSubmitting}>
            Create free account
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-forest-700 hover:text-forest-900 transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
