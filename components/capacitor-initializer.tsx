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

        // ── STEP 5: App State Change — refresh session on foreground ────────
        try {
          const { App } = await import('@capacitor/app');
          App.addListener('appStateChange', async ({ isActive }) => {
            if (isActive) {
              try {
                const { createClient } = await import('@/lib/supabase-client');
                const supabase = createClient();
                await supabase.auth.getSession();
              } catch {}
            }
          });
        } catch {}

        // ── STEP 6: Deep Link Handler (Google OAuth In-App Redirect) ────────
        try {
          const { App } = await import('@capacitor/app');
          const { Browser } = await import('@capacitor/browser');

          App.addListener('appUrlOpen', async (event) => {
            // Automatically close in-app browser overlay tab
            try {
              await Browser.close();
            } catch {}

            const rawUrl = event.url;
            if (!rawUrl) return;

            if (rawUrl.includes('/auth/callback') || rawUrl.includes('code=') || rawUrl.includes('access_token=')) {
              try {
                const { createClient } = await import('@/lib/supabase-client');
                const supabase = createClient();

                // 1. Handle hash parameters (#access_token=...&refresh_token=...)
                if (rawUrl.includes('#')) {
                  const hashStr = rawUrl.split('#')[1];
                  const params = new URLSearchParams(hashStr);
                  const accessToken = params.get('access_token');
                  const refreshToken = params.get('refresh_token');

                  if (accessToken && refreshToken) {
                    await supabase.auth.setSession({
                      access_token: accessToken,
                      refresh_token: refreshToken,
                    });
                    router.push('/dashboard');
                    return;
                  }
                }

                // 2. Handle PKCE authorization code (?code=...)
                const searchStr = rawUrl.includes('?') ? rawUrl.split('?')[1] : '';
                const params = new URLSearchParams(searchStr);
                const code = params.get('code');

                if (code) {
                  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
                  if (!error && data?.session) {
                    router.push('/dashboard');
                    return;
                  }
                }

                // 3. Fallback: inspect current session
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                  router.push('/dashboard');
                }
              } catch (authErr) {
                console.warn('[Capacitor] Deep link auth error:', authErr);
              }
            }
          });
        } catch (dlErr) {
          console.warn('[Capacitor] Deep link listener warning:', dlErr);
        }

      } catch (err) {
        console.warn('[Capacitor] Native plugin initialization skipped:', err);
      }
    }

    initNativePlugins();
  }, [router, pathname]);

  return null;
}
