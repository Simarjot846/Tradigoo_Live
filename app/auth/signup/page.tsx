'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthLayout } from '@/components/auth/auth-layout';
import Link from 'next/link';
import { UserRole } from '@/lib/supabase';
import { motion } from 'framer-motion';

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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signUp(formData.email, formData.password, formData);
      router.push('/dashboard');
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create account';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout heroContent={
      <>
        <h1 className="text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
          Grow your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">Business</span> today.
        </h1>
        <p className="text-zinc-400 text-lg leading-relaxed mb-8">
          Join Tradigoo to access wholesale prices directly from manufacturers.
          Scale your retail business with better margins.
        </p>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`w-8 h-8 rounded-full border-2 border-zinc-900 bg-gradient-to-br from-zinc-700 to-zinc-600 flex items-center justify-center text-[10px] text-white font-bold`}>
                  U{i}
                </div>
              ))}
            </div>
            <div className="text-zinc-300 text-sm">
              <span className="text-white font-bold">2,000+</span> retailers joined this week
            </div>
          </div>
        </div>
      </>
    }>
      <div className="mb-4 text-center lg:text-left">
        <Link href="/" className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 mb-6 transition-colors">
          ← Back to home
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-2">Create an account</h1>
          <p className="text-zinc-500">Choose your role to get started.</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-6"
      >
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'retailer' })}
              className={`p-4 border rounded-xl text-left transition-all ${formData.role === 'retailer'
                  ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                  : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                }`}
            >
              <div className="font-semibold text-zinc-900 mb-1">Retailer</div>
              <div className="text-xs text-zinc-500">I want to buy products</div>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'wholesaler' })}
              className={`p-4 border rounded-xl text-left transition-all ${formData.role === 'wholesaler'
                  ? 'border-green-600 bg-green-50/50 ring-1 ring-green-600'
                  : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                }`}
            >
              <div className="font-semibold text-zinc-900 mb-1">Wholesaler</div>
              <div className="text-xs text-zinc-500">I want to sell products</div>
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-zinc-700">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                className="h-10 bg-zinc-50 border-zinc-200 focus:bg-white transition-colors"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-zinc-700">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="h-10 bg-zinc-50 border-zinc-200 focus:bg-white transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="business_name" className="text-zinc-700">Business Name</Label>
            <Input
              id="business_name"
              value={formData.business_name}
              onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
              placeholder="Your Business Name"
              className="h-10 bg-zinc-50 border-zinc-200 focus:bg-white transition-colors"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-zinc-700">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="City, State"
              className="h-10 bg-zinc-50 border-zinc-200 focus:bg-white transition-colors"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-700">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="name@example.com"
              className="h-10 bg-zinc-50 border-zinc-200 focus:bg-white transition-colors"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-zinc-700">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="h-10 bg-zinc-50 border-zinc-200 focus:bg-white transition-colors"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg shadow-zinc-500/20"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-zinc-400">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => signInWithGoogle()}
            variant="outline"
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
            Sign up with Google
          </Button>

        </form>

        <p className="text-center text-sm text-zinc-600">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-blue-600 hover:text-blue-500 font-medium hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
}
