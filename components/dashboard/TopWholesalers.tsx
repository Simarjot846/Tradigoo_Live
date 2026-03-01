'use client';
import { useEffect, useState, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Award, Box, RefreshCw } from 'lucide-react';

interface TopWholesaler {
    product: string;
    top_wholesaler: string;
    purchases: number;
}

export default function TopWholesalers() {
    const [data, setData] = useState<TopWholesaler[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchStats = useCallback(async () => {
        setIsRefreshing(true);
        try {
            const res = await fetch('/api/pathway-top-wholesalers');
            if (res.ok) {
                const json = await res.json();
                if (Array.isArray(json)) {
                    setData(json);
                }
            } else {
                console.error("Failed to load top wholesalers");
            }
        } catch (e) {
            console.error("Failed to load top wholesalers:", e);
        } finally {
            // Keep the spinner going for at least 500ms so the user feels the refresh action
            setTimeout(() => setIsRefreshing(false), 500);
        }
    }, []);

    useEffect(() => {
        fetchStats();

        // Auto refresh every 10 seconds
        const interval = setInterval(fetchStats, 10000);

        return () => {
            clearInterval(interval);
        };
    }, [fetchStats]);

    if (data.length === 0) return null;

    return (
        <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md rounded-2xl p-6 border border-blue-500/20 shadow-lg animate-fade-in relative overflow-hidden group">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h2 className="text-xl font-bold dark:text-white flex items-center gap-2 mb-2">
                        <Award className="w-5 h-5 text-blue-500" /> Best Wholesalers by Product
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Live rankings computed via Pathway Streaming based on active buyer purchases
                    </p>
                </div>
                <button
                    onClick={fetchStats}
                    disabled={isRefreshing}
                    className="p-2.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-all border border-transparent hover:border-blue-500/30 active:scale-95 disabled:opacity-50 ml-4 flex-shrink-0"
                    title="Refresh Live Data"
                >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="space-y-3 relative">
                {/* Subtle loading overlay effect */}
                <div className={`absolute inset-0 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-[1px] z-10 transition-opacity duration-300 pointer-events-none rounded-lg ${isRefreshing ? 'opacity-100' : 'opacity-0'}`}></div>

                {data.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 hover:border-blue-500/30 transition-all group/item relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/0 group-hover/item:bg-blue-500/50 transition-colors"></div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold shadow-inner group-hover/item:scale-110 group-hover/item:-rotate-6 transition-transform">
                                #{idx + 1}
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors cursor-pointer">{item.top_wholesaler}</h4>
                                <p className="text-xs text-zinc-500 flex items-center gap-1"><Box className="w-3 h-3 text-zinc-400 group-hover/item:text-zinc-500" /> {item.product}</p>
                            </div>
                        </div>
                        <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 font-bold tracking-wide shadow-sm group-hover/item:border-emerald-500/50 transition-colors">
                            <TrendingUp className="w-3 h-3 mr-1" /> {item.purchases} sales
                        </Badge>
                    </div>
                ))}
            </div>
        </div>
    );
}
