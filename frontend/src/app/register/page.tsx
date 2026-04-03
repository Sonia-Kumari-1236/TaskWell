'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const { register: registerUser, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace('/dashboard');
  }, [isAuthenticated, isLoading, router]);

  const onSubmit = async (data: RegisterForm) => {
    setIsSubmitting(true);
    try {
      await registerUser(data.name, data.email, data.password);
      toast.success('Account created. Welcome to Taskwell.');
      router.push('/dashboard');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Registration failed';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-ink-600 flex-col justify-between p-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-clay/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-sage/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <span className="font-mono text-xs text-ink-300 tracking-widest uppercase">
            Taskwell
          </span>
        </div>

        <div className="relative z-10">
          <h1 className="font-display text-5xl text-cream leading-tight mb-6">
            Start fresh.<br />
            <span className="text-amber-task italic">Stay focused.</span>
          </h1>
          <p className="font-body text-ink-300 text-sm leading-relaxed max-w-xs">
            Join thousands who use Taskwell to bring order and beauty to their daily workflow.
          </p>
        </div>

        <div className="relative z-10">
          <div className="grid grid-cols-3 gap-4">
            {[
              { num: '∞', label: 'Tasks' },
              { num: '0', label: 'Clutter' },
              { num: '1', label: 'Focus' },
            ].map(({ num, label }) => (
              <div key={label} className="text-center">
                <div className="font-display text-2xl text-cream mb-1">{num}</div>
                <div className="font-mono text-xs text-ink-400 uppercase tracking-widest">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="lg:hidden mb-12">
            <span className="font-mono text-xs text-ink-400 tracking-widest uppercase">
              Taskwell
            </span>
          </div>

          <div className="mb-10">
            <h2 className="font-display text-3xl text-ink mb-2">Create account</h2>
            <p className="font-body text-sm text-ink-400">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-clay font-medium hover:text-clay-dark transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label">Full name</label>
              <input
                type="text"
                className={`input-field ${errors.name ? 'border-clay' : ''}`}
                placeholder="Jane Smith"
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && (
                <p className="mt-1.5 text-xs text-clay font-mono">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                className={`input-field ${errors.email ? 'border-clay' : ''}`}
                placeholder="you@example.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' },
                })}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-clay font-mono">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className={`input-field ${errors.password ? 'border-clay' : ''}`}
                placeholder="At least 6 characters"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Minimum 6 characters' },
                })}
              />
              {errors.password && (
                <p className="mt-1.5 text-xs text-clay font-mono">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="label">Confirm password</label>
              <input
                type="password"
                className={`input-field ${errors.confirmPassword ? 'border-clay' : ''}`}
                placeholder="••••••••"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (val) =>
                    val === watch('password') || 'Passwords do not match',
                })}
              />
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-clay font-mono">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                    Creating account…
                  </>
                ) : (
                  'Create account'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
