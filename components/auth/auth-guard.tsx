'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: Array<'retailer' | 'wholesaler' | 'admin'>;
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // If auth state is confirmed resolved (loading=false) and there is definitely no user
    if (!loading && !user) {
      // 400ms grace window to prevent false redirect on fast page transitions
      const timer = setTimeout(() => {
        if (!user) {
          setRedirecting(true);
          const redirectPath = `/auth/login?redirect=${encodeURIComponent(pathname)}`;
          router.replace(redirectPath);
        }
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [user, loading, router, pathname]);

  // Loading state or initial grace check
  if (loading || (!user && !redirecting)) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-zinc-950 bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm text-zinc-500 font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Redirecting state
  if (!user && redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-zinc-950 bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm text-zinc-500 font-medium">Redirecting to login...</p>
          <a
            href={`/auth/login?redirect=${encodeURIComponent(pathname)}`}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
          >
            Click here if not redirected automatically
          </a>
        </div>
      </div>
    );
  }

  // Role check if required
  if (user && allowedRoles && !allowedRoles.includes(user.role as any)) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-zinc-950 bg-background p-6">
        <div className="max-w-md text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-2xl shadow-sm">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Access Restricted</h2>
          <p className="text-zinc-500 text-sm mb-6">
            Your account ({user.role}) does not have permission to access this portal.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
