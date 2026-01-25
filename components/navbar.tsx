'use client';

import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Search, Menu, MapPin, ShoppingCart, TrendingUp,
  ChevronDown, User, LogOut, LayoutDashboard, Package, Truck, ShoppingBag, Sparkles
} from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from 'react';

export function Navbar() {
  const { user, signOut } = useAuth();
  const { cartCount } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl) {
      setSearchQuery(decodeURIComponent(searchFromUrl));
    }
  }, [searchParams]);

  // Hydration fix: Don't render complex user-dependent logic until mounted
  if (!mounted) return (
    <div className="flex flex-col w-full z-50 sticky top-0 font-sans shadow-xl h-[106px] bg-white dark:bg-[#0a0a0a]"></div>
  );

  if (pathname === '/') return null;

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isWholesaler = user?.role === 'wholesaler';

  const quickLinks = isWholesaler ? [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Inventory', path: '/inventory', icon: Package },
    { label: 'Orders', path: '/orders-received', icon: Truck },
  ] : [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Marketplace', path: '/marketplace', icon: ShoppingBag },
    { label: 'My Orders', path: '/my-orders', icon: Package },
  ];

  return (
    <div className="flex flex-col w-full z-50 sticky top-0 font-sans shadow-xl shadow-zinc-200/50 dark:shadow-none">
      {/* Top Bar - Adaptive Theme */}
      <nav className="relative bg-white dark:bg-gradient-to-r dark:from-[#0a0a0a] dark:via-[#111111] dark:to-[#0a0a0a] text-zinc-900 dark:text-white px-4 py-3 flex items-center gap-6 border-b border-zinc-200 dark:border-white/5 h-[72px] transition-colors duration-300">
        {/* Grain Overlay (Dark Mode Only) */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-0 dark:opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

        <div className="relative z-10 flex items-center justify-between w-full max-w-[1920px] mx-auto">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => router.push('/')}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)] group-hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300 tracking-tight">
                Tradigoo
              </span>
              <span className="text-[10px] text-zinc-500 tracking-widest uppercase">Premium B2B</span>
            </div>
          </motion.div>

          {/* Location (Mock) */}
          {user && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="hidden xl:flex flex-col items-start leading-tight cursor-pointer hover:bg-zinc-100 dark:hover:bg-white/5 p-2 rounded-lg transition-colors min-w-[140px] ml-4 border border-transparent hover:border-zinc-200 dark:hover:border-white/10"
            >
              <div className="flex items-center text-xs text-zinc-500 dark:text-zinc-400 ml-5">
                Deliver to {user.name.split(' ')[0]}
              </div>
              <div className="flex items-center font-bold text-sm text-zinc-800 dark:text-zinc-200">
                <MapPin className="w-4 h-4 mr-1 text-blue-500" />
                <span>Ludhiana 141006</span>
              </div>
            </motion.div>
          )}

          {/* Search Bar - Center */}
          <div className={`flex-1 max-w-2xl hidden md:flex h-11 rounded-xl overflow-hidden transition-all duration-300 relative mx-6 ${isSearchFocused ? 'ring-2 ring-blue-500/50 shadow-[0_0_30px_rgba(37,99,235,0.15)]' : 'ring-1 ring-zinc-200 dark:ring-white/10 hover:ring-zinc-300 dark:hover:ring-white/20'}`}>
            <div className="bg-zinc-50 dark:bg-[#1a1a1a] text-xs flex items-center px-4 border-r border-zinc-200 dark:border-white/5 cursor-pointer hover:bg-zinc-100 dark:hover:bg-[#252525] text-zinc-600 dark:text-zinc-400 transition-colors">
              All <ChevronDown className="w-3 h-3 ml-2" />
            </div>
            <input
              type="text"
              placeholder="Search for grain, spices, oil..."
              className="flex-1 px-4 bg-zinc-50 dark:bg-[#0f0f0f] text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 outline-none h-full w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <motion.button
              whileHover={{ backgroundColor: '#2563eb' }}
              className="bg-blue-600 w-14 flex items-center justify-center transition-colors h-full"
              onClick={handleSearch}
            >
              <Search className="w-5 h-5 text-white" />
            </motion.button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Trust Score */}
            {user && (
              <motion.div whileHover={{ y: -2 }} className="hidden lg:flex">
                <Badge className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-200 dark:hover:bg-emerald-500/20 px-3 py-1.5 h-full rounded-lg gap-2 cursor-pointer shadow-sm dark:shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                  <TrendingUp className="w-4 h-4" />
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-emerald-600/70 dark:text-emerald-500/50 leading-none">Trust Score</span>
                    <span className="text-sm font-bold">{user.trust_score || 95}</span>
                  </div>
                </Badge>
              </motion.div>
            )}

            {/* Theme Toggle */}
            <motion.div whileHover={{ scale: 1.1 }} className="hidden sm:block">
              <ModeToggle />
            </motion.div>

            {/* Account Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="hidden md:flex items-center gap-3 cursor-pointer hover:bg-zinc-100 dark:hover:bg-white/5 p-1.5 pr-3 rounded-full border border-transparent hover:border-zinc-200 dark:hover:border-white/10 transition-all"
                >
                  <Avatar className="w-9 h-9 ring-2 ring-zinc-200 dark:ring-white/10">
                    <AvatarFallback className="bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 text-zinc-700 dark:text-white font-bold border border-zinc-200 dark:border-white/10">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col leading-none">
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Hello, {user?.name?.split(' ')[0]}</span>
                    <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center">Account <ChevronDown className="w-3 h-3 ml-1 text-zinc-400" /></span>
                  </div>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-white dark:bg-[#111] border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-zinc-200 backdrop-blur-xl">
                <DropdownMenuLabel>Your Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-100 dark:bg-white/10" />
                <DropdownMenuItem onClick={() => router.push('/profile')} className="focus:bg-blue-50 dark:focus:bg-blue-600/20 focus:text-blue-600 dark:focus:text-blue-400 cursor-pointer">
                  <User className="w-4 h-4 mr-2" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/dashboard')} className="focus:bg-blue-50 dark:focus:bg-blue-600/20 focus:text-blue-600 dark:focus:text-blue-400 cursor-pointer">
                  <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/my-orders')} className="focus:bg-blue-50 dark:focus:bg-blue-600/20 focus:text-blue-600 dark:focus:text-blue-400 cursor-pointer">
                  <Package className="w-4 h-4 mr-2" /> Orders
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-100 dark:bg-white/10" />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-500 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-500/10 focus:text-red-600 dark:focus:text-red-300 cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Cart */}
            {!isWholesaler && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative cursor-pointer p-2"
                onClick={() => router.push('/cart')}
              >
                <ShoppingCart className="w-7 h-7 text-zinc-400 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-white transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white dark:border-[#0a0a0a]">
                    {cartCount}
                  </span>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </nav>

      {/* Bottom Bar - Categories & Quick Links */}
      <div className="relative bg-zinc-50 dark:bg-[#1a1a1a] text-zinc-600 dark:text-zinc-300 px-4 py-2 flex items-center text-sm gap-6 border-b border-zinc-200 dark:border-white/5 overflow-x-auto no-scrollbar shadow-inner">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-2 font-bold cursor-pointer text-zinc-900 dark:text-white px-2 py-1 rounded-md hover:bg-zinc-200 dark:hover:bg-white/5 transition-colors"
        >
          <Menu className="w-5 h-5" /> All
        </motion.div>

        {quickLinks.map(link => (
          <motion.div
            key={link.path}
            whileHover={{ y: -1, color: '#2563eb' }}
            className="cursor-pointer font-medium whitespace-nowrap transition-colors hover:text-blue-600 dark:hover:text-blue-400"
            onClick={() => router.push(link.path)}
          >
            {link.label}
          </motion.div>
        ))}

        <div className="h-4 w-px bg-zinc-300 dark:bg-white/10 mx-2 hidden md:block" />

        {['Fresh', "Today's Deals", 'Sell', 'Gift Cards', 'Tradigoo Pay', 'Buy Again', 'Browsing History'].map(txt => (
          <motion.div
            key={txt}
            whileHover={{ scale: 1.02 }}
            className="hidden lg:block cursor-pointer whitespace-nowrap hover:text-zinc-900 dark:hover:text-white transition-colors text-[13px]"
          >
            {txt}
          </motion.div>
        ))}

        <div className="ml-auto hidden xl:flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400 cursor-pointer hover:text-blue-500 dark:hover:text-blue-300 transition-colors px-2">
          <Sparkles className="w-4 h-4" /> Join Tradigoo Prime
        </div>
      </div>
    </div>
  );
}
