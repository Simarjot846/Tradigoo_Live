import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';
import { capacitorSupabaseStorage } from './capacitor-storage';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://skcbzqbtjdctpxtgglbv.supabase.co';

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrY2J6cWJ0amRjdHB4dGdnbGJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwNzMzNjEsImV4cCI6MjA4MzY0OTM2MX0.qP9uYxXRD8pYYG1pLK49HHZ3BD9wEPny2v4gQAClC7Q';

let browserClient: SupabaseClient | undefined;

/**
 * Returns a singleton Supabase browser client.
 *
 * On Capacitor native: uses capacitorSupabaseStorage (backed by @capacitor/preferences)
 * so the session survives app restarts and process kills.
 *
 * On web: uses the default localStorage-based storage.
 */
export function createClient(): SupabaseClient {
  if (typeof window === 'undefined') {
    // SSR context — create a fresh client without custom storage
    return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  if (!browserClient) {
    browserClient = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        // Use our Capacitor-aware storage adapter
        storage: capacitorSupabaseStorage,
        // Automatically refresh the token before it expires
        autoRefreshToken: true,
        // Persist session across page reloads / app restarts
        persistSession: true,
        // Detect session in URL hash (needed for OAuth + magic link callbacks)
        detectSessionInUrl: true,
      },
    });
  }

  return browserClient;
}

/**
 * Call this once at app start (in CapacitorInitializer) to warm up the
 * native storage cache before the Supabase client reads session data.
 */
export { warmUpCapacitorStorage } from './capacitor-storage';
