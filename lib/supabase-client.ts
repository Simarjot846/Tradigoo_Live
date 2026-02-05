import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';

let browserClient: SupabaseClient | undefined;

// Client-side Supabase client
export function createClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (typeof window === 'undefined') {
    // During SSG/SSR/Build, we might not have env vars but need to return a valid client structure
    // to avoid build crashes. We use a placeholder that will fail if actually used for requests.
    return createBrowserClient(
      supabaseUrl || 'https://placeholder-site-for-build.supabase.co',
      supabaseKey || 'placeholder-key'
    );
  }

  // On the client, we MUST have these variables. 
  // If they are missing, throw a clear error so the developer/user knows what's wrong 
  // instead of redirecting to a fake domain.
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing Supabase Environment Variables! Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  if (!browserClient) {
    browserClient = createBrowserClient(
      supabaseUrl,
      supabaseKey
    );
  }

  return browserClient!;
}

