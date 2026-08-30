"use client";

import React from 'react';
import { ShieldCheck, Zap, Globe, Lock, BarChart3, Search } from 'lucide-react';
import { SpotlightCard } from './spotlight-card';

export function FeaturesSection() {
    return (
        <section id="features" className="py-16 sm:py-24 md:py-32 relative">
            <div className="container mx-auto px-3 sm:px-6 max-w-7xl">
                <div className="mb-12 sm:mb-20 text-center">
                    <h2
                        className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-8 tracking-tight"
                    >
                        Everything you need to <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">scale without limits.</span>
                    </h2>
                    <p className="text-zinc-500 dark:text-white/50 text-sm sm:text-base md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
                        We've replaced the fragmented, manual sourcing workflow with a single, intelligent operating system designed for modern brands.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {[
                        {
                            icon: ShieldCheck,
                            title: "Bank-Grade Escrow",
                            desc: "Your funds are held securely in a licensed escrow account. Release payments only when you're satisfied with the goods.",
                            color: "text-green-400"
                        },
                        {
                            icon: Zap,
                            title: "AI Supplier Matching",
                            desc: "Our proprietary AI analyzes millions of data points to instantly connect you with manufacturers that match your exact specs.",
                            color: "text-blue-400"
                        },
                        {
                            icon: Globe,
                            title: "End-to-End Logistics",
                            desc: "From factory floor to your warehouse door. We handle customs, freight, and last-mile delivery with real-time tracking.",
                            color: "text-purple-400"
                        },
                        {
                            icon: Search,
                            title: "Supplier Verification System",
                            desc: "Making sure all partners are trustworthy through careful check.",
                            color: "text-orange-400"
                        },
                        {
                            icon: Lock,
                            title: "Dispute Management",
                            desc: "Fair and efficient resolution mechanisms for any trade disagreement.",
                            color: "text-pink-400"
                        },
                        {
                            icon: BarChart3,
                            title: "Market Intelligence",
                            desc: "Access real-time commodity pricing and manufacturing trends to negotiate better deals with data-backed confident.",
                            color: "text-cyan-400"
                        }
                    ].map((feature, i) => (
                        <div
                            key={i}
                            className="h-full"
                        >
                            <SpotlightCard className="rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 h-full">
                                <div className={`h-11 w-11 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-black/5 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10 flex items-center justify-center mb-5 sm:mb-8 ${feature.color}`}>
                                    <feature.icon className="h-5 w-5 sm:h-7 sm:w-7" />
                                </div>
                                <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-4 text-foreground dark:text-white tracking-tight">{feature.title}</h3>
                                <p className="text-muted-foreground dark:text-white/50 leading-relaxed text-xs sm:text-sm md:text-base">
                                    {feature.desc}
                                </p>
                            </SpotlightCard>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
