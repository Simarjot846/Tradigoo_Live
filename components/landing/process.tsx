"use client";

import { motion } from "framer-motion";
import { Search, ShoppingCart, Truck, CheckCircle } from "lucide-react";

const steps = [
    {
        icon: Search,
        title: "1. Discover",
        description: "Search for high-margin products or get AI recommendations tailored to your shop.",
    },
    {
        icon: ShoppingCart,
        title: "2. Order",
        description: "Place bulk orders with flexible payment options. Money is locked safe in escrow.",
    },
    {
        icon: Truck,
        title: "3. Track",
        description: "Monitor your shipment in real-time. Verify quality via live video before dispatch.",
    },
    {
        icon: CheckCircle,
        title: "4. Sell",
        description: "Receive goods, unlock escrow, and watch your margins grow.",
    },
];

export function Process() {
    return (
        <section className="py-24 bg-[#0A0A0A] relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

            <div className="container px-6 mx-auto relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">How It Works</h2>
                    <p className="text-gray-400">Simple, transparent, and built for speed.</p>
                </div>

                <div className="relative">
                    {/* Connector Line */}
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-900 to-transparent -translate-y-1/2 z-0" />

                    <div className="grid md:grid-cols-4 gap-8">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.2 }}
                                viewport={{ once: true }}
                                className="relative z-10"
                            >
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-[#111] border border-white/10 flex items-center justify-center mb-6 shadow-xl relative group">
                                        <div className="absolute inset-0 bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <step.icon className="h-8 w-8 text-white relative z-10" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                                    <p className="text-sm text-gray-400 max-w-[200px]">
                                        {step.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
