'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthLayout } from '@/components/auth/auth-layout';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [oauthProcessing, setOauthProcessing] = useState(false);
  const { user, loading: authLoading, signIn, signInWithGoogle, refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/dashboard';

  useEffect(() => {
    setMounted(true);
    // Safety timer: never block user with spinner for more than 2.5 seconds
    const timer = setTimeout(() => {
      setTimeoutReached(true);
    }, 2500);

    // If OAuth code or access token is returned to login page, auto-process it
    const code = searchParams.get('code');
    const hasHash = typeof window !== 'undefined' && (window.location.hash.includes('access_token') || window.location.hash.includes('code='));
    
    if (code || hasHash) {
      setOauthProcessing(true);
      import('@/lib/oauth-handler').then(async ({ processOAuthCallback }) => {
        try {
          const res = await processOAuthCallback(searchParams);
          if (res.success) {
            await refreshUser();
            router.replace(redirectTarget);
            return;
          }
        } catch (err) {
          console.warn('[Login OAuth Error]:', err);
        } finally {
          setOauthProcessing(false);
        }
      });
    }

    return () => clearTimeout(timer);
  }, [searchParams, router, refreshUser, redirectTarget]);

  // If user is already authenticated, forward immediately
  useEffect(() => {
    if (!authLoading && user) {
      router.replace(redirectTarget);
    }
  }, [user, authLoading, router, redirectTarget]);

  // Show loader only if mounting, actively processing OAuth, or still checking auth within safety window
  if (!mounted || oauthProcessing || user || (authLoading && !timeoutReached)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-500 font-medium">
            {user
              ? 'Redirecting to dashboard...'
              : oauthProcessing
              ? 'Completing authentication...'
              : 'Loading Tradigoo...'}
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
      await signIn(email, password);
      router.push(redirectTarget);
    } catch (err: any) {
      console.error(err);
      const msg = (err?.message || '').toLowerCase();
      if (
        msg.includes('invalid login credentials') ||
        msg.includes('invalid credentials') ||
        msg.includes('email not confirmed')
      ) {
        setError(
          'Invalid email or password. If you originally registered using Google, please click "Sign in with Google" below.'
        );
      } else if (msg.includes('email') && msg.includes('not found')) {
        setError('No account found with this email. Please sign up first.');
      } else {
        setError(err?.message || 'Invalid email or password. Please check your credentials.');
      }
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-6 text-center lg:text-left">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-6 transition-colors">
          ← Back to home
        </Link>
        <div>
          <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-5 mx-auto lg:mx-0 shadow-lg shadow-blue-500/20">
            <span className="text-white font-bold text-xl">T</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-2">Welcome back</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">Enter your credentials to access your Tradigoo dashboard.</p>
        </div>
      </div>

      <div className="space-y-5">
        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-3.5 rounded-xl text-sm border border-red-200 dark:border-red-900/50 flex items-start gap-2.5">
            <span className="text-base shrink-0">⚠️</span>
            <span className="leading-snug">{error}</span>
          </div>
        )}

        <Button
          type="button"
          onClick={() => signInWithGoogle()}
          className="w-full bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 h-11 font-medium shadow-sm hover:shadow transition-all"
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
          Sign in with Google
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase font-medium">
            <span className="bg-white dark:bg-zinc-950 px-3 text-zinc-400">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-zinc-800 dark:text-zinc-200 text-xs font-semibold uppercase tracking-wider">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="h-11 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder:text-zinc-400 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all"
              required
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-zinc-800 dark:text-zinc-200 text-xs font-semibold uppercase tracking-wider">Password</Label>
              <Link href="/auth/forgot-password" className="text-xs text-blue-600 hover:text-blue-500 font-medium">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 pr-11 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder:text-zinc-400 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all"
                required
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
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-600/20 hover:shadow-lg transition-all"
            disabled={submitting}
          >
            {submitting ? 'Signing in...' : 'Sign in to Dashboard'}
          </Button>
        </form>

        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400 pt-2">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-blue-600 hover:text-blue-500 font-semibold hover:underline">
            Sign up for free
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
