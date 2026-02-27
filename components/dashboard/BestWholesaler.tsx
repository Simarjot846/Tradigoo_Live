'use client'

import { useState, useEffect } from 'react';

export default function BestWholesaler() {
    const [wholesaler, setWholesaler] = useState<any>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        // Set mock data immediately as fallback
        const mockData = {
            name: "GreenHarvest Traders",
            price: "45",
            delivery: "2-3 days",
            rating: "4.8",
            green_score: 92
        };

        fetch('http://localhost:8000/api/smart-matching?product=wheat')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch');
                return res.json();
            })
            .then(data => setWholesaler(data.wholesalers[0]))
            .catch(err => {
                console.error('Smart matching API unavailable, using demo data:', err.message);
                setError(true);
                setWholesaler(mockData);
            });
    }, []);

    if (!wholesaler) return <div className="p-6 rounded-xl border border-white/10 bg-black/40 animate-pulse text-green-500">Connecting to smart matching engine...</div>;

    return (
        <div className="rounded-xl border border-green-500/30 bg-[#0a2e1f]/30 p-6 backdrop-blur-md fade-in flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
                <h3 className="text-sm text-green-400 mb-2 flex items-center font-semibold">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2" />
                    Smart Matching Engine: Top Result
                </h3>
                <p className="text-3xl font-bold text-white tracking-tight">{wholesaler.name}</p>
                <p className="text-xl text-green-300 font-medium mt-1">₹{wholesaler.price} / unit • {wholesaler.delivery}</p>
            </div>
            <div className="text-left mt-4 md:mt-0 md:text-right flex flex-col md:items-end">
                <span className="px-3 py-1 bg-green-900/40 border border-green-600 text-green-200 text-sm rounded-full mb-2">
                    ⭐ {wholesaler.rating} Verified Rating
                </span>
                <span className="text-sm text-gray-300 font-bold tracking-wide">GREEN SCORE: <span className="text-green-400 text-lg">{wholesaler.green_score}/100</span></span>
            </div>
        </div>
    );
}
