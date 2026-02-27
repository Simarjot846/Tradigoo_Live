'use client'

import { useState, useEffect } from 'react';

export default function AITradeBrain() {
    const [insight, setInsight] = useState<string>("");

    useEffect(() => {
        fetch('http://localhost:8000/api/trade-brain?product=wheat')
            .then(res => res.json())
            .then(data => setInsight(data.insight))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="rounded-xl border border-purple-500/30 bg-purple-900/10 p-6 backdrop-blur-md fade-in">
            <h3 className="text-lg font-bold text-purple-300 mb-2 flex items-center">
                <span className="opacity-80 mr-2 text-xl">🧠</span> AI Trade Brain (Gemini + Pathway RAG)
            </h3>
            {insight ? (
                <p className="text-gray-300 leading-relaxed text-sm">
                    {insight}
                </p>
            ) : (
                <p className="text-purple-400/50 animate-pulse text-sm">Analyzing live data vectors...</p>
            )}
        </div>
    );
}
