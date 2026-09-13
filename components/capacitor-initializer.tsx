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

        // Status Bar Configuration
        try {
          const { StatusBar, Style } = await import('@capacitor/status-bar');
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setOverlaysWebView({ overlay: false });
        } catch (sbErr) {
          console.warn('[Capacitor] StatusBar setup warning:', sbErr);
        }

        // Hide Splash Screen
        try {
          const { SplashScreen } = await import('@capacitor/splash-screen');
          await SplashScreen.hide();
        } catch (ssErr) {
          console.warn('[Capacitor] SplashScreen hide warning:', ssErr);
        }

        // Android Hardware Back Button Listener
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
      } catch (err) {
        console.warn('[Capacitor] Native plugin initialization skipped:', err);
      }
    }

    initNativePlugins();
  }, [router, pathname]);

  return null;
}
