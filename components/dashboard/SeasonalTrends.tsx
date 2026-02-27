'use client';
import { useEffect, useState } from 'react';
import { Leaf, Sun, Zap, TrendingUp, TentTree } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SeasonalTrend {
    region: string;
    weather: string;
    festival: string;
    trending: string;
}

export default function SeasonalTrends() {
    const [trends, setTrends] = useState<SeasonalTrend[]>([]);

    useEffect(() => {
        let isMounted = true;
        let initialTimeout: NodeJS.Timeout;
        
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/pathway-seasonal');
                if (res.ok) {
                    const json = await res.json();
                    if (isMounted) setTrends(json);
                }
            } catch (e) {
                console.error("Failed to load seasonal trends", e);
            }
        };

        // Delay initial fetch
        initialTimeout = setTimeout(fetchStats, 1200);
        
        // Reduced frequency from 3s to 10s
        const interval = setInterval(fetchStats, 10000);
        
        return () => {
            isMounted = false;
            clearTimeout(initialTimeout);
            clearInterval(interval);
        };
    }, []);

    if (trends.length === 0) return null;

    return (
        <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md rounded-2xl p-6 border border-amber-500/20 shadow-lg animate-fade-in">
            <h2 className="text-xl font-bold dark:text-white flex items-center gap-2 mb-2">
                <Sun className="w-5 h-5 text-amber-500" /> Live Seasonal & Festive Demand
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                Powered by Pathway Stream mapping live weather & geographic events
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {trends.map((item, idx) => (
                    <div key={idx} className="relative overflow-hidden p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 group">
                        <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TentTree className="w-16 h-16 text-amber-500" />
                        </div>
                        <div className="relative z-10 flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                                <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-500/30">
                                    {item.region}
                                </Badge>
                                {item.festival !== "None" && (
                                    <span className="text-[10px] font-bold uppercase text-white bg-amber-600 px-2 py-0.5 rounded shadow">
                                        {item.festival}
                                    </span>
                                )}
                            </div>
                            <div>
                                <h4 className="font-semibold text-lg text-zinc-900 dark:text-white flex items-center gap-2 mt-1">
                                    {item.trending}
                                </h4>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                                    <Zap className="w-3 h-3 text-yellow-500" /> Weather: {item.weather}
                                </p>
                            </div>
                        </div>
                        <div className="mt-3 flex items-center text-xs font-bold text-emerald-500">
                            <TrendingUp className="w-3 h-3 mr-1" /> High Demand Detected
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
