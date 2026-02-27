'use client';

import { useEffect, useState } from 'react';
import { Cloud, CloudRain, CloudSnow, Sun, Wind, Droplets, ThermometerSun, TrendingUp, Calendar, Sparkles, ArrowUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface WeatherData {
    city: string;
    temp: number;
    condition: string;
    demand_multiplier: number;
    humidity?: number;
    wind_speed?: number;
    timestamp: string;
    product_predictions?: ProductPrediction[];
}

interface ProductPrediction {
    product: string;
    reason: string;
    demand_change: string;
    trend: string;
    icon: string;
}

interface Festival {
    name: string;
    days_until: number;
    status: string;
    products: string[];
    demand_increase: number;
    description: string;
}

interface WeatherInsights {
    current_weather: WeatherData;
    product_predictions: ProductPrediction[];
    upcoming_festivals: Festival[];
    insights_summary: string;
    timestamp: string;
}

export default function WeatherInsightsWidget() {
    const [insights, setInsights] = useState<WeatherInsights | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<string>('');

    useEffect(() => {
        let isMounted = true;
        let initialTimeout: NodeJS.Timeout;

        const fetchInsights = async () => {
            try {
                const res = await fetch('/api/pathway-weather-insights');
                if (res.ok) {
                    const data = await res.json();
                    if (isMounted) {
                        setInsights(data);
                        setLastUpdate(new Date().toLocaleTimeString());
                        setLoading(false);
                    }
                }
            } catch (e) {
                console.error('Failed to fetch weather insights:', e);
                setLoading(false);
            }
        };

        // Delay initial fetch to not block render
        initialTimeout = setTimeout(fetchInsights, 300);
        
        // Update every 2 minutes (reduced from 1 minute for better performance)
        const interval = setInterval(fetchInsights, 120000);

        return () => {
            isMounted = false;
            clearTimeout(initialTimeout);
            clearInterval(interval);
        };
    }, []);

    const getWeatherIcon = (condition: string) => {
        switch (condition) {
            case 'Rain':
            case 'Drizzle':
            case 'Thunderstorm':
                return <CloudRain className="w-8 h-8 text-blue-400" />;
            case 'Snow':
                return <CloudSnow className="w-8 h-8 text-blue-200" />;
            case 'Clear':
                return <Sun className="w-8 h-8 text-yellow-400" />;
            case 'Clouds':
                return <Cloud className="w-8 h-8 text-gray-400" />;
            default:
                return <Wind className="w-8 h-8 text-gray-400" />;
        }
    };

    const getDemandColor = (multiplier: number) => {
        if (multiplier >= 1.5) return 'text-red-500 dark:text-red-400';
        if (multiplier >= 1.2) return 'text-orange-500 dark:text-orange-400';
        if (multiplier >= 1.0) return 'text-yellow-500 dark:text-yellow-400';
        return 'text-green-500 dark:text-green-400';
    };

    const getDemandBadge = (multiplier: number) => {
        if (multiplier >= 1.5) return { label: 'High Demand', color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' };
        if (multiplier >= 1.2) return { label: 'Elevated', color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20' };
        if (multiplier >= 1.0) return { label: 'Normal', color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20' };
        return { label: 'Low', color: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' };
    };

    if (loading) {
        return (
            <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md rounded-2xl p-6 border border-emerald-500/20 shadow-lg animate-pulse">
                <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-64 mb-4"></div>
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (!insights) return null;

    const weather = insights.current_weather;
    const badge = getDemandBadge(weather.demand_multiplier);

    return (
        <div className="space-y-6">
            {/* Main Weather Card */}
            <div className="bg-gradient-to-br from-blue-500/10 via-emerald-500/10 to-purple-500/10 dark:from-blue-900/20 dark:via-emerald-900/20 dark:to-purple-900/20 backdrop-blur-md rounded-2xl p-6 border border-emerald-500/20 shadow-lg animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-emerald-500" />
                        <h2 className="text-2xl font-bold dark:text-white">Live Weather Intelligence</h2>
                    </div>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 animate-pulse">
                        <Droplets className="w-3 h-3 mr-1" /> Live via Pathway
                    </Badge>
                </div>
                
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                    Real-time weather analysis showing which products will rise in demand • Updates every minute
                </p>

                {/* Current Weather Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white/50 dark:bg-zinc-900/50 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Current Weather</p>
                                <h3 className="text-3xl font-bold text-zinc-900 dark:text-white">{weather.city}</h3>
                            </div>
                            {getWeatherIcon(weather.condition)}
                        </div>
                        
                        <div className="flex items-end gap-2 mb-4">
                            <span className="text-5xl font-bold text-zinc-900 dark:text-white">{weather.temp}°</span>
                            <span className="text-2xl text-zinc-500 dark:text-zinc-400 mb-2">C</span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                            <div className="flex items-center gap-1">
                                <Droplets className="w-4 h-4" />
                                {weather.humidity || 60}%
                            </div>
                            <div className="flex items-center gap-1">
                                <Wind className="w-4 h-4" />
                                {weather.wind_speed || 5} km/h
                            </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                            <Badge variant="outline" className={badge.color}>
                                {badge.label}
                            </Badge>
                            <p className={`text-sm font-bold mt-2 ${getDemandColor(weather.demand_multiplier)}`}>
                                {weather.demand_multiplier}x Demand Multiplier
                            </p>
                        </div>
                    </div>

                    {/* Product Predictions */}
                    <div className="bg-white/50 dark:bg-zinc-900/50 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                            <h4 className="font-bold text-zinc-900 dark:text-white">Products Rising in Demand</h4>
                        </div>
                        
                        <div className="space-y-3">
                            {insights.product_predictions.slice(0, 4).map((pred, idx) => (
                                <div 
                                    key={idx}
                                    className="flex items-start gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 hover:border-emerald-500/30 transition-colors"
                                >
                                    <span className="text-2xl">{pred.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h5 className="font-semibold text-sm text-zinc-900 dark:text-white">
                                                {pred.product}
                                            </h5>
                                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs">
                                                <ArrowUp className="w-3 h-3 mr-1" />
                                                {pred.demand_change}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                                            {pred.reason}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Upcoming Festivals */}
                {insights.upcoming_festivals.length > 0 && (
                    <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-500/20">
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar className="w-5 h-5 text-purple-500" />
                            <h4 className="font-bold text-zinc-900 dark:text-white">Upcoming Festivals Impact</h4>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {insights.upcoming_festivals.map((festival, idx) => (
                                <div 
                                    key={idx}
                                    className="bg-white/50 dark:bg-zinc-900/50 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h5 className="font-bold text-zinc-900 dark:text-white">{festival.name}</h5>
                                        <Badge variant="outline" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 text-xs">
                                            {festival.status === 'ongoing' ? 'Now' : `${festival.days_until}d`}
                                        </Badge>
                                    </div>
                                    
                                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-3">
                                        {festival.description}
                                    </p>
                                    
                                    <div className="flex flex-wrap gap-1 mb-2">
                                        {festival.products.slice(0, 3).map((product, pidx) => (
                                            <Badge key={pidx} variant="outline" className="text-xs bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                                                {product}
                                            </Badge>
                                        ))}
                                    </div>
                                    
                                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                        +{Math.round((festival.demand_increase - 1) * 100)}% demand increase
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Last Update */}
                <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {insights.insights_summary}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Last updated: {lastUpdate}
                    </p>
                </div>
            </div>
        </div>
    );
}
