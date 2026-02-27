'use client';
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function LiveDemandCard({ children }: { children?: React.ReactNode }) {
    const [data, setData] = useState<{ time: string, demand: number }[]>([]);

    useEffect(() => {
        let isMounted = true;
        let initialTimeout: NodeJS.Timeout;
        
        const fetchPathwayStats = async () => {
            try {
                const res = await fetch('/api/pathway-stats');
                if (res.ok) {
                    const stats = await res.json();
                    if (stats && Array.isArray(stats) && stats.length > 0) {
                        const currentScore = stats[0].total_carbon_saved || 400;
                        if (isMounted) {
                            setData(prev => {
                                const newData = [...prev];
                                newData.push({
                                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                                    demand: currentScore
                                });
                                if (newData.length > 8) newData.shift();
                                return newData;
                            });
                        }
                    }
                } else {
                    console.error("Failed to fetch pathway stats");
                }
            } catch (e) {
                console.error("Error fetching pathway stats:", e);
            }
        };

        // Delay initial fetch
        initialTimeout = setTimeout(fetchPathwayStats, 500);
        
        // Fetch every 5 seconds (reduced from 3 for better performance)
        const interval = setInterval(fetchPathwayStats, 5000);

        return () => {
            isMounted = false;
            clearTimeout(initialTimeout);
            clearInterval(interval);
        };
    }, []);

    return (
        <div className="animate-fade-in flex flex-col transition-all duration-300 hover:shadow-lg dark:bg-slate-900 border border-emerald-900/40 rounded-xl p-4 w-full h-80">
            <h3 className="text-emerald-400 font-semibold">Live ESG Carbon Tracking</h3>
            <p className="text-xs text-slate-400 mb-4">Total Carbon Saved (kg) flowing through the supply chain (Live via Pathway)</p>
            <div className="flex-1 w-full min-h-0">
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `${v}kg`} domain={['auto', 'auto']} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #059669', color: '#fff' }} />
                            <Line type="stepAfter" dataKey="demand" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} isAnimationActive={true} />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-sm text-slate-500">
                        Waiting for Pathway Stream...
                    </div>
                )}
            </div>
            {children}
        </div>
    );
}
