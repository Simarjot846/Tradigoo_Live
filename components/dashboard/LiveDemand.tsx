'use client'

import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function LiveDemand() {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchDemand = async () => {
            try {
                const res = await fetch('http://localhost:8000/api/demand');
                const json = await res.json();
                setData(json);
            } catch (err) { }
        }

        fetchDemand();
        const interval = setInterval(fetchDemand, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="rounded-xl border border-white/10 bg-black/40 p-6 backdrop-blur-md fade-in">
            <h3 className="mb-4 text-xl font-bold text-white">Live Regional Demand (Pathway Streams)</h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <XAxis dataKey="area" stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} />
                        <Area type="monotone" dataKey="demand" stroke="#10b981" fill="url(#colorDemand)" />
                        <defs>
                            <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
