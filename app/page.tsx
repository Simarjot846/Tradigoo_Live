"use client";

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, ShieldCheck, Zap, Globe, Lock, BarChart3, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';

// --- Components ---

function SpotlightCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // 3D Tilt Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();

    // Spotlight
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);

    // Tilt
    const posX = clientX - left;
    const posY = clientY - top;

    const w = width;
    const h = height;

    const pctX = (posX / w) - 0.5;
    const pctY = (posY / h) - 0.5;

    x.set(pctX);
    y.set(pctY);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      className={`group relative border border-black/5 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden transform-gpu perspective-1000 ${className} shadow-xl dark:shadow-none`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100 z-30"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(0, 0, 0, 0.05),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative h-full transform-style-3d group-hover:translate-z-10 transition-transform duration-200">
        {children}
      </div>
    </motion.div>
  );
}

function AuroraBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div
        className="absolute -inset-[10px] opacity-50 blur-[80px] invert dark:invert-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(100deg, #3b82f6 0%, #a855f7 7%, #6366f1 10%, transparent 20%, #3b82f6 40%, #a855f7 47%, #6366f1 50%, transparent 60%)',
          backgroundSize: '200% 100%',
        }}
      >
        <div className="absolute inset-0 mix-blend-overlay animate-aurora opacity-70" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
    </div>
  );
}

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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-md mb-10 mx-auto lg:mx-0 shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)]"
            >
              <Badge variant="secondary" className="bg-blue-500 text-white hover:bg-blue-600 border-0 px-3">New V2.0</Badge>
              <span className="text-sm text-blue-600 dark:text-blue-100 font-medium">The intelligent sourcing OS</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 leading-[1.1]"
            >
              <span className="block text-gray-900 dark:text-white drop-shadow-sm dark:drop-shadow-2xl">Sourcing</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-500 to-blue-600 dark:from-blue-400 dark:via-purple-300 dark:to-blue-400 animate-gradient pb-4">Reimagined.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl md:text-2xl text-muted-foreground dark:text-blue-100/60 max-w-2xl mx-auto lg:mx-0 mb-14 leading-relaxed font-light"
            >
              The first AI-powered platform that connects you directly with verified manufacturers. <span className="text-foreground dark:text-white/90 font-normal">No middlemen. Zero risk.</span>
            </motion.p>


            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 1 }}
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
            </motion.div>
          </div>

          {/* Floating Interactive Card */}
          <div className="flex-1 hidden lg:block relative h-[600px] w-full max-w-[600px] perspective-1000">
            <motion.div
              animate={{ y: [-15, 15, -15] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
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
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "98.5%" }}
                        transition={{ delay: 1, duration: 1.5, ease: "circOut" }}
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
            </motion.div>

            {/* Background Elements */}
            <motion.div
              animate={{ y: [10, -20, 10], rotate: [-2, 4, -2] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
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
            </motion.div>

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
              <motion.div
                key={brand}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight hover:text-zinc-600 dark:hover:text-white transition-colors cursor-default"
              >
                {brand}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid with Spotlight */}
      <section id="features" className="py-32 relative">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="mb-24 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-bold mb-8 tracking-tight"
            >
              Everything you need to <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">scale without limits.</span>
            </motion.h2>
            <p className="text-white/50 text-xl max-w-2xl mx-auto font-light leading-relaxed">
              We've replaced the fragmented, manual sourcing workflow with a single, intelligent operating system designed for modern brands.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                title: "Deep Vetting",
                desc: "We physically inspect factories and verify business licenses. Only the top 1% of manufacturers make it onto Tradigoo.",
                color: "text-orange-400"
              },
              {
                icon: Lock,
                title: "Smart Contracts",
                desc: "Automatically generate legally binding contracts that protect your IP and enforce quality standards.",
                color: "text-pink-400"
              },
              {
                icon: BarChart3,
                title: "Market Intelligence",
                desc: "Access real-time commodity pricing and manufacturing trends to negotiate better deals with data-backed confident.",
                color: "text-cyan-400"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="h-full"
              >
                <SpotlightCard className="rounded-3xl p-10 h-full">
                  <div className={`h-14 w-14 rounded-2xl bg-black/5 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10 flex items-center justify-center mb-8 ${feature.color}`}>
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-foreground dark:text-white tracking-tight">{feature.title}</h3>
                  <p className="text-muted-foreground dark:text-white/50 leading-relaxed text-lg">
                    {feature.desc}
                  </p>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            whileHover={{ scale: 1.02 }}
            className="relative rounded-[3rem] overflow-hidden bg-zinc-900 dark:bg-black border border-zinc-800 dark:border-white/10 p-12 md:p-32 text-center group shadow-2xl transition-all duration-500"
          >
            {/* Animated Elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-20 mask-image-gradient-to-b" />

            {/* Animated Blobs */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2],
                x: [0, 50, 0],
                y: [0, -50, 0]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/30 blur-[120px] rounded-full pointer-events-none"
            />
            <motion.div
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.1, 0.3, 0.1],
                x: [0, -30, 0],
                y: [0, 30, 0]
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-500/20 blur-[100px] rounded-full pointer-events-none"
            />

            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 opacity-50" />

            <div className="relative z-10">
              <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tighter text-white drop-shadow-xl">
                Ready to revolutionize <br /> your supply chain?
              </h2>
              <p className="text-xl md:text-2xl text-zinc-300 mb-14 max-w-2xl mx-auto font-light leading-relaxed">
                Join thousands of businesses using Tradigoo to source faster, safer, and smarter.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Button asChild size="lg" className="h-16 px-12 rounded-full text-lg font-bold bg-white text-black hover:bg-blue-50 w-full sm:w-auto shadow-[0_0_40px_-5px_rgba(255,255,255,0.4)] hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.6)] transition-all hover:scale-105 border-0">
                  <Link href="/auth/signup">
                    Get Started Free
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-16 px-12 rounded-full text-lg border-white/20 bg-white/5 hover:bg-white/10 text-white w-full sm:w-auto transition-all hover:scale-105 hover:border-white/40 shadow-lg">
                  <Link href="mailto:contact@tradigoo.com">
                    Talk to Sales
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/5 dark:border-white/10 py-20 bg-gray-50 dark:bg-black">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg text-white">T</div>
                <span className="text-xl font-bold text-foreground dark:text-white">Tradigoo</span>
              </div>
              <p className="text-muted-foreground dark:text-white/40 text-sm leading-relaxed">
                The modern operating system for global B2B sourcing. built for brands that move fast.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-foreground dark:text-white mb-6">Platform</h4>
              <ul className="space-y-4 text-sm text-muted-foreground dark:text-white/50">
                <li className="hover:text-primary dark:hover:text-white transition-colors cursor-pointer">Supplier Discovery</li>
                <li className="hover:text-primary dark:hover:text-white transition-colors cursor-pointer">Escrow Payments</li>
                <li className="hover:text-primary dark:hover:text-white transition-colors cursor-pointer">Logistics</li>
                <li className="hover:text-primary dark:hover:text-white transition-colors cursor-pointer">Pricing</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-foreground dark:text-white mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-muted-foreground dark:text-white/50">
                <li className="hover:text-primary dark:hover:text-white transition-colors cursor-pointer">About</li>
                <li className="hover:text-primary dark:hover:text-white transition-colors cursor-pointer">Blog</li>
                <li className="hover:text-primary dark:hover:text-white transition-colors cursor-pointer">Careers</li>
                <li className="hover:text-primary dark:hover:text-white transition-colors cursor-pointer">Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-foreground dark:text-white mb-6">Legal</h4>
              <ul className="space-y-4 text-sm text-muted-foreground dark:text-white/50">
                <li className="hover:text-primary dark:hover:text-white transition-colors cursor-pointer">Privacy Policy</li>
                <li className="hover:text-primary dark:hover:text-white transition-colors cursor-pointer">Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-black/5 dark:border-white/5">
            <p className="text-sm text-muted-foreground dark:text-white/30">© 2026 Tradigoo Inc. All rights reserved.</p>
            <div className="flex items-center gap-6 text-muted-foreground dark:text-white/40">
              {/* Social Icons Placeholder */}
              <div className="w-5 h-5 bg-black/5 dark:bg-white/10 rounded-full hover:bg-black/10 dark:hover:bg-white/20 cursor-pointer" />
              <div className="w-5 h-5 bg-black/5 dark:bg-white/10 rounded-full hover:bg-black/10 dark:hover:bg-white/20 cursor-pointer" />
              <div className="w-5 h-5 bg-black/5 dark:bg-white/10 rounded-full hover:bg-black/10 dark:hover:bg-white/20 cursor-pointer" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
