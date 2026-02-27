'use client'

import { useEffect, useState } from 'react';

export default function GreenScoreMeter() {
    const [metrics, setMetrics] = useState({ carbon: 0, local: 0, waste: 0 });

    useEffect(() => {
        fetch('http://localhost:8000/api/smart-matching')
            .then(res => res.json())
            .then(data => {
                if (data.wholesalers[0].metrics) {
                    setMetrics({
                        carbon: data.wholesalers[0].metrics.carbon_saved_kg,
                        local: data.wholesalers[0].metrics.local_sourcing_pct,
                        waste: data.wholesalers[0].metrics.waste_prevented_kg
                    });
                }
            });
    }, []);

    return (
        <div className="rounded-xl border border-white/10 bg-black/40 p-6 backdrop-blur-md fade-in h-full">
            <h3 className="text-lg font-bold text-white mb-6 tracking-tight">Real-Time Green Impact</h3>

            <div className="space-y-6">
                <div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Carbon Prevented</span>
                        <span className="text-green-500 font-bold">{metrics.carbon} kg CO₂</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full transition-all duration-700" style={{ width: `${Math.min(metrics.carbon, 100)}%` }}></div>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Local Sourcing Ratio</span>
                        <span className="text-emerald-400 font-bold">{metrics.local}%</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2">
                        <div className="bg-emerald-400 h-2 rounded-full transition-all duration-700" style={{ width: `${metrics.local}%` }}></div>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Waste Reduced</span>
                        <span className="text-teal-400 font-bold">{metrics.waste} kg</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2">
                        <div className="bg-teal-400 h-2 rounded-full transition-all duration-700" style={{ width: `${Math.min(metrics.waste, 100)}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
