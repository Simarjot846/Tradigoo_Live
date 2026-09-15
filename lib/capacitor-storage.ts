/**
 * Capacitor-aware Supabase storage adapter.
 *
 * On native Android/iOS: uses @capacitor/preferences (SQLite-backed, persists across app restarts)
 * On web: falls back to localStorage (standard browser behaviour)
 *
 * This is the #1 fix for "session lost on app restart" in Capacitor apps.
 */

import type { SupportedStorage } from '@supabase/supabase-js';

// ─── Capacitor Preferences wrapper ───────────────────────────────────────────

async function capacitorGet(key: string): Promise<string | null> {
  try {
    const { Preferences } = await import('@capacitor/preferences');
    const { value } = await Preferences.get({ key });
    return value;
  } catch {
    return localStorage.getItem(key);
  }
}

async function capacitorSet(key: string, value: string): Promise<void> {
  try {
    const { Preferences } = await import('@capacitor/preferences');
    await Preferences.set({ key, value });
  } catch {
    localStorage.setItem(key, value);
  }
}

async function capacitorRemove(key: string): Promise<void> {
  try {
    const { Preferences } = await import('@capacitor/preferences');
    await Preferences.remove({ key });
  } catch {
    localStorage.removeItem(key);
  }
}

// ─── Determine if we're running inside Capacitor native ──────────────────────

function isCapacitorNative(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    // @ts-ignore
    return !!(window.Capacitor?.isNativePlatform?.());
  } catch {
    return false;
  }
}

// ─── In-memory sync cache (Supabase calls storage synchronously in some paths) ─

const memoryCache: Record<string, string> = {};

// ─── The actual SupportedStorage implementation ──────────────────────────────

export const capacitorSupabaseStorage: SupportedStorage = {
  getItem(key: string): string | null {
    // Supabase calls this synchronously on init — return from memory cache
    // The async warm-up (below) populates this before Supabase client is used
    return memoryCache[key] ?? localStorage.getItem(key) ?? null;
  },

  setItem(key: string, value: string): void {
    memoryCache[key] = value;
    // Persist asynchronously to native storage (fire-and-forget is fine)
    if (isCapacitorNative()) {
      capacitorSet(key, value).catch(() => {});
    } else {
      localStorage.setItem(key, value);
    }
  },

  removeItem(key: string): void {
    delete memoryCache[key];
    if (isCapacitorNative()) {
      capacitorRemove(key).catch(() => {});
    } else {
      localStorage.removeItem(key);
    }
  },
};

// ─── Warm-up: load all Supabase keys from native storage into memory cache ───
// Call this ONCE at app startup BEFORE creating the Supabase client.

const SUPABASE_KEY_PREFIXES = ['sb-', 'supabase'];

export async function warmUpCapacitorStorage(): Promise<void> {
  if (!isCapacitorNative()) return;

  try {
    const { Preferences } = await import('@capacitor/preferences');
    const { keys } = await Preferences.keys();

    await Promise.all(
      keys
        .filter(k => SUPABASE_KEY_PREFIXES.some(p => k.startsWith(p)))
        .map(async key => {
          const { value } = await Preferences.get({ key });
          if (value !== null) {
            memoryCache[key] = value;
          }
        })
    );
  } catch {
    // If Preferences fails, memory cache stays empty — will re-auth gracefully
  }
}
