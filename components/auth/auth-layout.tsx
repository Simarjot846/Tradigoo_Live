'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AuthLayoutProps {
    children: ReactNode;
    heroContent?: ReactNode;
}

export function AuthLayout({ children, heroContent }: AuthLayoutProps) {
    return (
        <div className="min-h-screen w-full flex">
            {/* Left Panel - Hero Section */}
            <div className="hidden lg:flex w-1/2 bg-black relative overflow-hidden items-center justify-center p-12">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900 via-zinc-950 to-zinc-950 opacity-80" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />

                {/* Floating Blobs */}
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />

                {/* Hero Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative z-10 max-w-lg"
                >
                    {heroContent || (
                        <>
                            <h1 className="text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
                                Trading made <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Simple</span>.
                            </h1>
                            <p className="text-zinc-400 text-lg leading-relaxed mb-8">
                                Join thousands of retailers and wholesalers connecting directly on Tradigoo.
                                Seamless transactions, trusted partners.
                            </p>

                            {/* Testimonial Card */}
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                                <blockquote className="text-zinc-300 text-sm mb-4">
                                    "Tradigoo completely transformed how we source our inventory. The direct connection with wholesalers saved us 20% in the first month."
                                </blockquote>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                                        RK
                                    </div>
                                    <div>
                                        <div className="text-white text-sm font-medium">Rajesh Kumar</div>
                                        <div className="text-zinc-500 text-xs">Retail Store Owner, Mumbai</div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </motion.div>
            </div>

            {/* Right Panel - Form Section */}
            <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8 lg:p-12 relative">
                <div className="w-full max-w-md space-y-8">
                    {children}
                </div>

                {/* Mobile background branding (subtle) */}
                <div className="lg:hidden absolute inset-0 -z-10 bg-gradient-to-b from-blue-50/50 to-white pointer-events-none" />
            </div>
        </div>
    );
}
