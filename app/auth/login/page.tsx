'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthLayout } from '@/components/auth/auth-layout';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await signIn(email, password);

      if (user?.role === 'wholesaler') {
        router.push('/wholesaler/dashboard');
      } else if (user?.role === 'retailer') {
        router.push('/retailer/marketplace');
      } else {
        router.push('/dashboard');
      }

    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Invalid email or password');
      setLoading(false);
    } finally {
      // Don't set loading to false if we are redirecting, to prevent flash of content
      // But since router.push is async, we might want to keep it loading.
    }
  };

  return (
    <AuthLayout>
      <div className="mb-8 text-center lg:text-left">
        <Link href="/" className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 mb-8 transition-colors">
          ← Back to home
        </Link>
        <div
          
          
          
        >
          <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center mb-6 mx-auto lg:mx-0 shadow-lg">
            <span className="text-white font-bold text-xl">T</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-2">Welcome back</h1>
          <p className="text-zinc-500">Enter your details to access your account.</p>
        </div>
      </div>

      <div
        
        
        
        className="space-y-6"
      >
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
            {error}
          </div>
        )}

        <Button
          type="button"
          onClick={() => signInWithGoogle()}
          className="w-full bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50 h-11 font-medium shadow-sm transition-all"
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

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-zinc-400">Or continue with</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-700">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="h-11 bg-zinc-50 border-zinc-200 focus:bg-white transition-colors"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-zinc-700">Password</Label>
              <Link href="/auth/forgot-password" className="text-xs text-blue-600 hover:text-blue-500 font-medium">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-11 bg-zinc-50 border-zinc-200 focus:bg-white transition-colors"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg shadow-zinc-500/20"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Sign in'}
          </Button>
        </form>

        <p className="text-center text-sm text-zinc-600">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-blue-600 hover:text-blue-500 font-medium hover:underline">
            Sign up for free
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
