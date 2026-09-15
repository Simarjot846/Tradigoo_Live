'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthLayout } from '@/components/auth/auth-layout';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { UserRole } from '@/lib/supabase';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    business_name: '',
    location: '',
    role: 'retailer' as UserRole
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, loading: authLoading, signUp, signInWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/dashboard';

  useEffect(() => {
    setMounted(true);
  }, []);

  // If user is already authenticated, forward immediately
  useEffect(() => {
    if (!authLoading && user) {
      router.replace(redirectTarget);
    }
  }, [user, authLoading, router, redirectTarget]);

  // If loading or already logged in, show clean loader — NEVER show signup form to an authenticated user
  if (!mounted || authLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-500 font-medium">
            {user ? 'Redirecting to dashboard...' : 'Loading Tradigoo...'}
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await signUp(formData.email, formData.password, formData);
      router.push(redirectTarget);
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create account';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout heroContent={
      <>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6">
          Direct Wholesale Marketplace
        </div>
        <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-4 tracking-tight leading-tight">
          Grow your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400">Business</span> today.
        </h1>
        <p className="text-zinc-400 text-base leading-relaxed mb-8">
          Join Tradigoo to access wholesale inventory directly from verified suppliers. Scale your business with transparent margins and automated escrow protection.
        </p>

        <div className="space-y-3.5">
          <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 text-base">
              🤝
            </div>
            <div>
              <div className="text-white text-sm font-semibold">Direct Sourcing</div>
              <div className="text-zinc-400 text-xs mt-0.5">Eliminate middleman markups and buy directly from source suppliers.</div>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <div className="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 text-base">
              🔒
            </div>
            <div>
              <div className="text-white text-sm font-semibold">Protected Escrow</div>
              <div className="text-zinc-400 text-xs mt-0.5">Zero payment risk with automated multi-tier release and dispute resolution.</div>
            </div>
          </div>
        </div>
      </>
    }>
      <div className="mb-4 text-center lg:text-left">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-6 transition-colors">
          ← Back to home
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-2">Create an account</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">Choose your business role to get started.</p>
        </div>
      </div>

      <div className="space-y-5">
        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm border border-red-200 dark:border-red-900/50 flex items-start gap-3 shadow-sm">
            <span className="text-lg shrink-0">⚠️</span>
            <div className="leading-snug">
              <span className="font-semibold block">{error}</span>
              {(error.toLowerCase().includes('already registered') || error.toLowerCase().includes('already exists')) && (
                <div className="mt-2">
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Go to Login Page →
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'retailer' })}
              className={`p-3.5 border rounded-xl text-left transition-all ${formData.role === 'retailer'
                  ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/30 ring-2 ring-blue-600'
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900'
                }`}
            >
              <div className="font-bold text-zinc-900 dark:text-white text-sm mb-0.5 flex items-center justify-between">
                Retailer
                {formData.role === 'retailer' && <span className="text-blue-600 text-xs font-bold">✓</span>}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Buy products</div>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'wholesaler' })}
              className={`p-3.5 border rounded-xl text-left transition-all ${formData.role === 'wholesaler'
                  ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/30 ring-2 ring-emerald-600'
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900'
                }`}
            >
              <div className="font-bold text-zinc-900 dark:text-white text-sm mb-0.5 flex items-center justify-between">
                Wholesaler
                {formData.role === 'wholesaler' && <span className="text-emerald-600 text-xs font-bold">✓</span>}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Sell products</div>
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-zinc-800 dark:text-zinc-200 text-xs font-semibold">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                className="h-10 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-zinc-800 dark:text-zinc-200 text-xs font-semibold">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="h-10 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="business_name" className="text-zinc-800 dark:text-zinc-200 text-xs font-semibold">Business Name</Label>
            <Input
              id="business_name"
              value={formData.business_name}
              onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
              placeholder="Your Business Name"
              className="h-10 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="location" className="text-zinc-800 dark:text-zinc-200 text-xs font-semibold">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="City, State"
              className="h-10 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-zinc-800 dark:text-zinc-200 text-xs font-semibold">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="name@example.com"
              className="h-10 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-zinc-800 dark:text-zinc-200 text-xs font-semibold">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="h-10 pr-11 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-100 text-white font-semibold shadow-md shadow-zinc-500/20"
            disabled={submitting}
          >
            {submitting ? 'Creating Account...' : 'Create Account'}
          </Button>

          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase font-medium">
              <span className="bg-white dark:bg-zinc-950 px-3 text-zinc-400">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => signInWithGoogle(formData.role)}
            variant="outline"
            className="w-full bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 h-11 font-medium shadow-sm transition-all"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign up with Google as {formData.role === 'wholesaler' ? 'Wholesaler' : 'Retailer'}
          </Button>
        </form>

        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400 pt-2">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-blue-600 hover:text-blue-500 font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
