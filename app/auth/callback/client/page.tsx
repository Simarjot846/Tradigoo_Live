'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { Loader2 } from 'lucide-react';

export default function ClientCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/dashboard';
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let mounted = true;

    const processCallback = async () => {
      const supabase = createClient();

      // 1. If authorization code is present in URL
      if (code) {
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);

          if (!error && data.session) {
            if (mounted) {
              router.replace(next);
            }
            return;
          }
        } catch (err) {
          console.warn('Client code exchange notice:', err);
        }
      }

      // 2. Check if detectSessionInUrl or existing session already populated storage
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          if (mounted) {
            router.replace(next);
          }
          return;
        }

        // Secondary check with getUser
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          if (mounted) {
            router.replace(next);
          }
          return;
        }
      } catch {}

      // 3. Fallback: If session could not be retrieved, show message and return to login
      if (mounted) {
        setErrorMsg('Authentication complete. Redirecting...');
        setTimeout(() => {
          if (mounted) router.replace(next);
        }, 1200);
      }
    };

    processCallback();

    return () => {
      mounted = false;
    };
  }, [code, next, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-zinc-950">
      <div className="flex flex-col items-center gap-3 p-6 text-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-sm text-zinc-500 font-medium">
          {errorMsg || 'Completing sign in...'}
        </p>
      </div>
    </div>
  );
}
