"use client";

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import { AuroraBackground } from '@/components/landing/aurora-background';

// Lazy Load Heavy Sections
const FeaturesSection = dynamic(() => import('@/components/landing/features-section').then(mod => mod.FeaturesSection));
const CTASection = dynamic(() => import('@/components/landing/cta-section').then(mod => mod.CTASection));
const Footer = dynamic(() => import('@/components/landing/footer').then(mod => mod.Footer));

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground dark:text-white bg-grainy selection:bg-blue-500/30 selection:text-blue-200 overflow-x-hidden font-sans transition-colors duration-300">

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 dark:border-white/10 bg-white/80 dark:bg-black/40 backdrop-blur-xl transition-colors duration-300">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center font-bold text-2xl shadow-lg shadow-blue-500/20 text-white">T</div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-purple-700 to-blue-700 dark:from-white dark:via-blue-100 dark:to-white/60 tracking-tight">Tradigoo</span>
          </div>
          <div className="hidden md:flex items-center gap-10 text-sm font-medium text-muted-foreground dark:text-white/70">
            <Link href="#features" className="hover:text-primary dark:hover:text-white transition-colors relative group">
              Features
              <span className="absolute inset-x-0 -bottom-1 h-px bg-primary dark:bg-white scale-x-0 group-hover:scale-x-100 transition-transform" />
            </Link>
            <Link href="#how-it-works" className="hover:text-primary dark:hover:text-white transition-colors relative group">
              How it Works
              <span className="absolute inset-x-0 -bottom-1 h-px bg-primary dark:bg-white scale-x-0 group-hover:scale-x-100 transition-transform" />
            </Link>
            <Link href="#pricing" className="hover:text-primary dark:hover:text-white transition-colors relative group">
              Pricing
              <span className="absolute inset-x-0 -bottom-1 h-px bg-primary dark:bg-white scale-x-0 group-hover:scale-x-100 transition-transform" />
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/auth/login" className="text-sm font-medium text-muted-foreground dark:text-white/70 hover:text-primary dark:hover:text-white transition-colors hidden sm:block">Log in</Link>
            <Button asChild className="bg-primary text-primary-foreground dark:bg-white dark:text-black hover:opacity-90 rounded-full px-8 py-6 text-sm font-semibold transition-transform hover:scale-105 shadow-lg shadow-blue-500/10">
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 md:pt-48 md:pb-40 px-6 overflow-hidden">
        <AuroraBackground />

        <div className="container mx-auto max-w-7xl relative z-10 flex flex-col lg:flex-row items-center gap-16 lg:gap-24 text-center lg:text-left">

          <div className="flex-1">
            <div
              
              
              
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-md mb-10 mx-auto lg:mx-0 shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)]"
            >
              <Badge variant="secondary" className="bg-blue-500 text-white hover:bg-blue-600 border-0 px-3">New V2.0</Badge>
              <span className="text-sm text-blue-600 dark:text-blue-100 font-medium">The intelligent sourcing OS</span>
            </div>

            <h1
              
              
              
              className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 leading-[1.1]"
            >
              <span className="block text-gray-900 dark:text-white drop-shadow-sm dark:drop-shadow-2xl">Sourcing</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-500 to-blue-600 dark:from-blue-400 dark:via-purple-300 dark:to-blue-400 animate-gradient pb-4">Reimagined.</span>
            </h1>

            <p
              
              
              
              className="text-xl md:text-2xl text-muted-foreground dark:text-blue-100/60 max-w-2xl mx-auto lg:mx-0 mb-14 leading-relaxed font-light"
            >
              The first AI-powered platform that connects you directly with verified manufacturers. <span className="text-foreground dark:text-white/90 font-normal">No middlemen. Zero risk.</span>
            </p>


            <div
              
              
              
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6"
            >
              <Button asChild size="lg" className="h-16 px-10 rounded-full text-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/40 w-full sm:w-auto group transition-all hover:scale-105">
                <Link href="/auth/signup">
                  Start Sourcing
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-16 px-10 rounded-full text-lg border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-900 dark:text-white backdrop-blur-sm w-full sm:w-auto transition-all hover:scale-105">
                <Link href="#features">
                  Watch Demo
                </Link>
              </Button>
            </div>

            <div
              
              
              
              className="mt-12 flex items-center justify-center lg:justify-start gap-4 text-sm text-white/40"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-8 w-8 rounded-full border-2 border-white dark:border-black bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-400 opacity-80" />
                  </div>
                ))}
              </div>
              <p className="text-zinc-600 dark:text-white/40">Trusted by 2,000+ modern teams</p>
            </div>
          </div>

          {/* Floating Interactive Card */}
          <div className="flex-1 hidden lg:block relative h-[600px] w-full max-w-[600px] perspective-1000">
            <div
              
              
              className="absolute top-20 right-10 z-20 w-96 transform hover:rotate-y-12 hover:rotate-x-12 transition-transform duration-500 preserve-3d"
            >
              <div className="relative p-8 rounded-[2rem] bg-white dark:bg-black/60 border border-zinc-200 dark:border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden group">
                {/* Internal Glow on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10">
                  <div className="flex items-center gap-5 mb-8">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-green-400 to-blue-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                      S
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-zinc-900 dark:text-white">Supplier Verified</h4>
                      <p className="text-sm text-green-400 font-mono flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        Active now
                      </p>
                    </div>
                    <Badge className="ml-auto bg-white/10 text-white backdrop-blur-md border border-white/10">
                      Top 1%
                    </Badge>
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between items-end">
                      <span className="text-zinc-500 dark:text-white/50 text-sm font-medium">Trust Score</span>
                      <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500">98.5</span>
                    </div>

                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        
                        
                        
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-400 shadow-[0_0_20px_rgba(34,197,94,0.5)]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 hover:border-zinc-200 dark:hover:border-white/10 transition-colors text-center">
                        <div className="text-2xl font-bold text-zinc-900 dark:text-white">24h</div>
                        <div className="text-[11px] text-zinc-400 dark:text-white/40 uppercase tracking-widest font-semibold mt-1">Response Time</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 hover:border-zinc-200 dark:hover:border-white/10 transition-colors text-center">
                        <div className="text-2xl font-bold text-zinc-900 dark:text-white">$4.2M</div>
                        <div className="text-[11px] text-zinc-400 dark:text-white/40 uppercase tracking-widest font-semibold mt-1">Volume Traded</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Background Elements */}
            <div
              
              
              className="absolute top-64 left-0 z-10"
            >
              <div className="p-5 rounded-2xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 backdrop-blur-lg shadow-xl w-56 rotate-[-6deg]">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-500/20 p-3 rounded-xl text-blue-600 dark:text-blue-400">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-zinc-900 dark:text-white">Escrow Secured</div>
                    <div className="text-xs text-zinc-500 dark:text-white/40 font-mono">$12,450.00 Held</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Glow Behind */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-[100px] rounded-full -z-10" />
          </div>

        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 border-y border-zinc-200 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.01] backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <p className="text-center text-sm font-bold text-zinc-400 dark:text-white/30 mb-10 uppercase tracking-[0.2em]">Powering global trade for</p>
          <div className="flex flex-wrap justify-center gap-16 md:gap-32 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
            {/* Styled Text Logos for consistency */}
            {['Acme Corp', 'GlobalTrade', 'LogistiX', 'SecurePay', 'Source.ai'].map((brand, i) => (
              <div
                key={brand}
                
                
                
                
                className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight hover:text-zinc-600 dark:hover:text-white transition-colors cursor-default"
              >
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lazy Loaded Sections */}
      <FeaturesSection />
      <CTASection />
      <Footer />

    </div>
  );
}
