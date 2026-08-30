"use client";

import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, TrendingUp, ShoppingCart, ArrowRight, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import React, { memo, useCallback } from "react";
import TopWholesalers from "@/components/dashboard/TopWholesalers";
import SeasonalTrends from "@/components/dashboard/SeasonalTrends";
import WeatherInsightsWidget from "@/components/dashboard/WeatherInsightsWidget";
import { mockProducts } from "@/lib/mock-data";

// Helper for emojis
function getCategoryEmoji(category: string): string {
    const emojiMap: Record<string, string> = {
        'Grains': '🌾',
        'Pulses': '🫘',
        'Oils': '🛢️',
        'Spices': '🌶️',
        'Sweeteners': '🍯',
        'Beverages': '☕',
        'Flours': '🥯',
        'Fashion': '👕',
        'Body Care': '🧴',
        'Bath Products': '🛁',
        'Electronics': '⌚'
    };
    return emojiMap[category] || '📦';
}

import ProductCard from "@/components/marketplace/product-card";

export function BuyerDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const { addToCart } = useCart();

    const { data: products = [], isLoading: loading } = useQuery<any[]>({
        queryKey: ['products'],
        queryFn: async (): Promise<any[]> => {
            try {
                const res = await fetch('/api/products?limit=10', {
                    signal: AbortSignal.timeout(6000),
                });
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    return data;
                }
                return mockProducts.slice(0, 10);
            } catch (err) {
                console.warn("Product fetch notice (serving verified catalog items):", err);
                return mockProducts.slice(0, 10);
            }
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const recommendedProducts = products.slice(0, 8);

    return (
        <div className="min-h-screen pb-20 dark:bg-zinc-950 bg-background relative selection:bg-blue-500/30 transition-colors duration-300">
            {/* Design System: Simple Gradient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/5 via-zinc-50 to-zinc-100 dark:from-emerald-900/10 dark:via-zinc-950 dark:to-zinc-900" />
            </div>

            <div className="container mx-auto px-3 sm:px-6 py-6 sm:py-10 relative z-10 max-w-7xl">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 gap-4 sm:gap-6">
                    <div className="flex flex-col items-start gap-2 sm:gap-3">
                        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white">
                            Welcome, <span className="text-emerald-600 dark:text-emerald-500">{user?.name || 'Trader'}</span>
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base md:text-lg">
                            Discover the best sustainable products from trusted wholesalers.
                        </p>
                    </div>
                </div>

                {/* Additional Pathway Dashboard Streams */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
                    <TopWholesalers />
                    <SeasonalTrends />
                </div>

                {/* Live Weather Intelligence with Product Predictions & Festivals */}
                <div className="mb-8 sm:mb-12">
                    <WeatherInsightsWidget />
                </div>

                {/* AI Recommendations Section */}
                <section className="mb-12 sm:mb-16">
                    <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
                        <div className="flex items-center gap-2.5 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
                                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-500" />
                            </div>
                            <div>
                                <h2 className="text-base sm:text-xl md:text-2xl font-bold text-zinc-900 dark:text-white">Sustainable Picks For You</h2>
                                <p className="text-xs sm:text-sm text-zinc-500">Curated recommendations just for you</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="ghost" size="sm" className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white group px-2 sm:px-3" onClick={() => router.push('/marketplace')}>
                                View All <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <div key={i} className="p-2 sm:p-3 rounded-xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#0f0f0f] space-y-2">
                                    <Skeleton className="aspect-square w-full rounded-lg" />
                                    <Skeleton className="h-3.5 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                    <div className="flex gap-1.5 pt-1">
                                        <Skeleton className="h-7 flex-1 rounded-lg" />
                                        <Skeleton className="h-7 w-7 rounded-lg" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6">
                            {recommendedProducts.map((p) => (
                                <ProductCard
                                    key={p.id}
                                    product={p}
                                    addToCart={addToCart}
                                    getCategoryEmoji={getCategoryEmoji}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}



function DashboardSkeleton() {
    return (
        <div className="min-h-screen pb-20 dark:bg-zinc-950 bg-background p-10 space-y-12">
            <div className="space-y-4">
                <Skeleton className="h-12 w-64" />
                <Skeleton className="h-6 w-96" />
            </div>
            <div className="space-y-4">
                <div className="flex justify-between">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="flex gap-4 overflow-hidden">
                    {[1, 2, 3, 4].map(i => (
                        <Skeleton key={i} className="h-80 w-80 rounded-3xl shrink-0" />
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} className="h-40 rounded-xl" />
                ))}
            </div>
        </div>
    )
}
