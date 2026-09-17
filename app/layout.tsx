import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ChatbotWrapper } from "@/components/chatbot-wrapper";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { RoleThemeProvider } from "@/lib/theme-context";
import { Navbar } from "@/components/navbar";
import { ThemePersistence } from "@/components/theme-persistence";
import { CartProvider } from "@/lib/cart-context";
import { QueryProvider } from "@/components/providers/query-provider";
import { ErrorSuppression } from "./error-suppression";
import { SessionRestorer } from "@/components/session-restorer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});


import { CapacitorInitializer } from "@/components/capacitor-initializer";
import { NativeAppHandoff } from "@/components/auth/native-app-handoff";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Tradigoo - Smart B2B Trading Platform",
  description: "AI-powered secure B2B transaction platform for Indian retailers",
  verification: {
    google: "W3BOWeDrvJp5HaWIo-ttCbwpGraJi_njzxt2SjhPtWw",
  },
};

import { Suspense } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* SessionRestorer must be FIRST — kicks off Capacitor storage warm-up
            immediately so the Supabase client finds the session on every page */}
        <SessionRestorer />
        <QueryProvider>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              <ErrorSuppression />
              <CapacitorInitializer />
              <CartProvider>
                <RoleThemeProvider>
                  <NativeAppHandoff />
                  <Suspense fallback={<div className="h-[72px] w-full bg-white dark:bg-[#0a0a0a]" />}>
                    <Navbar />
                  </Suspense>
                  <ThemePersistence />
                  {children}
                </RoleThemeProvider>
              </CartProvider>
              <ChatbotWrapper />
              <Toaster />
            </ThemeProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
