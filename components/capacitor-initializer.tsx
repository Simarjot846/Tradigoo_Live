'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function CapacitorInitializer() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function initNativePlugins() {
      if (typeof window === 'undefined') return;

      try {
        const { Capacitor } = await import('@capacitor/core');
        if (!Capacitor.isNativePlatform()) return;

        // ── STEP 1: Warm up session storage FIRST ──────────────────────────
        // This must run before the Supabase client tries to read the session,
        // otherwise the client sees an empty storage and treats the user as
        // logged out. This is the fix for "session lost on app restart".
        try {
          const { warmUpCapacitorStorage } = await import('@/lib/supabase-client');
          await warmUpCapacitorStorage();
        } catch (storageErr) {
          console.warn('[Capacitor] Storage warm-up warning:', storageErr);
        }

        // ── STEP 2: Status Bar ─────────────────────────────────────────────
        try {
          const { StatusBar, Style } = await import('@capacitor/status-bar');
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setOverlaysWebView({ overlay: false });
        } catch (sbErr) {
          console.warn('[Capacitor] StatusBar setup warning:', sbErr);
        }

        // ── STEP 3: Hide Splash Screen ─────────────────────────────────────
        try {
          const { SplashScreen } = await import('@capacitor/splash-screen');
          await SplashScreen.hide();
        } catch (ssErr) {
          console.warn('[Capacitor] SplashScreen hide warning:', ssErr);
        }

        // ── STEP 4: Android Hardware Back Button ───────────────────────────
        try {
          const { App } = await import('@capacitor/app');
          App.addListener('backButton', ({ canGoBack }) => {
            if (pathname === '/' || pathname === '/dashboard') {
              App.exitApp();
            } else if (canGoBack) {
              router.back();
            } else {
              router.push('/dashboard');
            }
          });
        } catch (appErr) {
          console.warn('[Capacitor] App listener warning:', appErr);
        }

        // ── STEP 5: App State Change — refresh session when app comes to foreground
        try {
          const { App } = await import('@capacitor/app');
          App.addListener('appStateChange', async ({ isActive }) => {
            if (isActive) {
              // Re-hydrate session when app comes back from background
              try {
                const { createClient } = await import('@/lib/supabase-client');
                const supabase = createClient();
                await supabase.auth.getSession();
              } catch {
                // Silent — user will be prompted to log in if session truly expired
              }
            }
          });
        } catch {
          // Optional enhancement — ignore if fails
        }

      } catch (err) {
        console.warn('[Capacitor] Native plugin initialization skipped:', err);
      }
    }

    initNativePlugins();
  }, [router, pathname]);

  return null;
}
