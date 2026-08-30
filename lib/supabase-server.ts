import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://skcbzqbtjdctpxtgglbv.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrY2J6cWJ0amRjdHB4dGdnbGJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwNzMzNjEsImV4cCI6MjA4MzY0OTM2MX0.qP9uYxXRD8pYYG1pLK49HHZ3BD9wEPny2v4gQAClC7Q',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Can happen in Server Components
          }
        },
      },
    }
  );
}

// Helper: create a Supabase server client that collects cookie actions for API routes
export async function createClientWithCookieCollector() {
  const cookieStore = await cookies();
  const cookieActions: Array<{ name: string; value: string; options?: CookieOptions }> = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://skcbzqbtjdctpxtgglbv.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrY2J6cWJ0amRjdHB4dGdnbGJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwNzMzNjEsImV4cCI6MjA4MzY0OTM2MX0.qP9uYxXRD8pYYG1pLK49HHZ3BD9wEPny2v4gQAClC7Q',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieActions.push({ name, value, options });
          });
        },
      },
    }
  );

  return { supabase, cookieActions } as const;
}

// Service role client for admin operations (use carefully!)
export function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://skcbzqbtjdctpxtgglbv.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrY2J6cWJ0amRjdHB4dGdnbGJ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODA3MzM2MSwiZXhwIjoyMDgzNjQ5MzYxfQ.eaAaQbU7rLXYym6krggSsWODFqC_MzkVdF8dqOy859E',
    {
      cookies: {
        get() { return undefined; },
        set() { },
        remove() { },
      },
    }
  );
}
