'use client';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Award, Box } from 'lucide-react';

interface TopWholesaler {
    product: string;
    top_wholesaler: string;
    purchases: number;
}

export default function TopWholesalers() {
    const [data, setData] = useState<TopWholesaler[]>([]);

    useEffect(() => {
        let isMounted = true;
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/pathway-top-wholesalers');
                if (res.ok) {
                    const json = await res.json();
                    if (isMounted) setData(json);
                }
            } catch (e) {
                console.error("Failed to load top wholesalers");
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 3000);
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    if (data.length === 0) return null;

    return (
        <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md rounded-2xl p-6 border border-blue-500/20 shadow-lg animate-fade-in">
            <h2 className="text-xl font-bold dark:text-white flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-blue-500" /> Best Wholesalers by Product
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                Live rankings computed via Pathway Streaming based on active buyer purchases
            </p>
            <div className="space-y-3">
                {data.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold">
                                #{idx + 1}
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{item.top_wholesaler}</h4>
                                <p className="text-xs text-zinc-500 flex items-center gap-1"><Box className="w-3 h-3" /> {item.product}</p>
                            </div>
                        </div>
                        <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                            <TrendingUp className="w-3 h-3 mr-1" /> {item.purchases} sales
                        </Badge>
                    </div>
                ))}
            </div>
        </div>
    );
}
