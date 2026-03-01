'use client';
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import { TrendingUp, Info, Leaf } from 'lucide-react';

// Custom tooltip with clear explanations
const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
        const value = payload[0].value as number;
        const time = payload[0].payload.time;
        
        return (
            <div className="bg-slate-900 border border-emerald-500/50 rounded-lg p-3 shadow-xl">
                <p className="text-emerald-400 font-semibold text-sm mb-1">🌱 Carbon Saved</p>
                <p className="text-white text-lg font-bold">{value} kg</p>
                <p className="text-slate-400 text-xs mt-1">{time}</p>
                <div className="mt-2 pt-2 border-t border-slate-700">
                    <p className="text-xs text-slate-300">
                        💡 This means <span className="text-emerald-400 font-semibold">{Math.round(value / 10)}</span> trees worth of CO₂ absorbed!
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

export default function LiveDemandCard({ children }: { children?: React.ReactNode }) {
    const [data, setData] = useState<{ time: string, demand: number }[]>([]);
    const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');

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
                                const lastValue = newData.length > 0 ? newData[newData.length - 1].demand : currentScore;
                                
                                // Determine trend
                                if (currentScore > lastValue + 5) {
                                    setTrend('up');
                                } else if (currentScore < lastValue - 5) {
                                    setTrend('down');
                                } else {
                                    setTrend('stable');
                                }
                                
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

    const latestValue = data.length > 0 ? data[data.length - 1].demand : 0;
    const treesEquivalent = Math.round(latestValue / 10);

    return (
        <div className="animate-fade-in flex flex-col transition-all duration-300 hover:shadow-lg dark:bg-slate-900 border border-emerald-900/40 rounded-xl p-4 w-full h-80">
            {/* Header with explanation */}
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <Leaf className="w-5 h-5 text-emerald-400" />
                        <h3 className="text-emerald-400 font-semibold">Live Carbon Impact</h3>
                        {trend === 'up' && (
                            <div className="flex items-center gap-1 text-emerald-400 text-xs">
                                <TrendingUp className="w-3 h-3" />
                                <span>Growing!</span>
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                        Real-time tracking of CO₂ saved through sustainable sourcing
                    </p>
                </div>
                
                {/* Info tooltip */}
                <div className="group relative">
                    <Info className="w-4 h-4 text-slate-500 cursor-help" />
                    <div className="absolute right-0 top-6 w-64 bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                        <p className="text-xs text-slate-300 leading-relaxed">
                            <span className="font-semibold text-emerald-400">What does this mean?</span><br/>
                            Every time you buy eco-friendly products, you save carbon emissions. This graph shows your total environmental impact in real-time!
                        </p>
                        <div className="mt-2 pt-2 border-t border-slate-700">
                            <p className="text-xs text-slate-400">
                                📊 Higher = Better for the planet<br/>
                                🌱 Updates every 5 seconds
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Current stats */}
            {latestValue > 0 && (
                <div className="flex items-center gap-4 mb-3 p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    <div>
                        <p className="text-2xl font-bold text-emerald-400">{latestValue} kg</p>
                        <p className="text-xs text-slate-400">Total CO₂ Saved</p>
                    </div>
                    <div className="h-8 w-px bg-slate-700" />
                    <div>
                        <p className="text-lg font-semibold text-emerald-400">≈ {treesEquivalent} 🌳</p>
                        <p className="text-xs text-slate-400">Trees equivalent</p>
                    </div>
                </div>
            )}

            {/* Chart */}
            <div className="flex-1 w-full min-h-0">
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis 
                                dataKey="time" 
                                stroke="#94a3b8" 
                                fontSize={11}
                                label={{ value: 'Time', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 10 }}
                            />
                            <YAxis 
                                stroke="#94a3b8" 
                                fontSize={11} 
                                tickFormatter={(v) => `${v}kg`} 
                                domain={['auto', 'auto']}
                                label={{ value: 'Carbon Saved (kg)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Line 
                                type="stepAfter" 
                                dataKey="demand" 
                                stroke="#10b981" 
                                strokeWidth={3} 
                                dot={{ r: 4, fill: '#10b981' }} 
                                activeDot={{ r: 6, fill: '#10b981' }} 
                                isAnimationActive={true}
                                name="Carbon Saved"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-sm text-slate-500 gap-2">
                        <div className="animate-pulse">
                            <Leaf className="w-8 h-8 text-emerald-500/50" />
                        </div>
                        <p>Loading live data...</p>
                        <p className="text-xs text-slate-600">Connecting to Pathway stream</p>
                    </div>
                )}
            </div>
            {children}
        </div>
    );
}
