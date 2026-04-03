'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace('/dashboard');
  }, [isAuthenticated, isLoading, router]);

  const onSubmit = async (data: LoginForm) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      toast.success('Welcome back.');
      router.push('/dashboard');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Login failed';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-ink flex-col justify-between p-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute border border-cream/30"
              style={{
                width: `${60 + i * 40}px`,
                height: `${60 + i * 40}px`,
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) rotate(${i * 9}deg)`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          <span className="font-mono text-xs text-ink-300 tracking-widest uppercase">
            Taskwell
          </span>
        </div>

        <div className="relative z-10">
          <h1 className="font-display text-5xl text-cream leading-tight mb-6">
            Your tasks,<br />
            <span className="text-clay-light italic">beautifully</span><br />
            organised.
          </h1>
          <p className="font-body text-ink-300 text-sm leading-relaxed max-w-xs">
            A refined workspace for tracking what matters most, built with clarity in mind.
          </p>
        </div>

        <div className="relative z-10 flex gap-8">
          {['Secure', 'Simple', 'Yours'].map((word) => (
            <div key={word}>
              <div className="w-6 h-px bg-clay mb-3" />
              <span className="font-mono text-xs text-ink-400 uppercase tracking-widest">
                {word}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden mb-12">
            <span className="font-mono text-xs text-ink-400 tracking-widest uppercase">
              Taskwell
            </span>
          </div>

          <div className="mb-10">
            <h2 className="font-display text-3xl text-ink mb-2">Sign in</h2>
            <p className="font-body text-sm text-ink-400">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="text-clay font-medium hover:text-clay-dark transition-colors"
              >
                Register here
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                placeholder="••••••••"
                {...register('password', { required: 'Password is required' })}
              />
              {errors.password && (
                <p className="mt-1.5 text-xs text-clay font-mono">{errors.password.message}</p>
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
                    Signing in…
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
