'use client';

import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Search, Menu, MapPin, ShoppingCart, TrendingUp,
  ChevronDown, User, LogOut, LayoutDashboard, Package, Truck, ShoppingBag, Sparkles, X
} from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from 'react';
import { PremiumModal } from '@/components/premium-modal';

export function Navbar() {
  const { user, loading, signOut } = useAuth();
  const { cartCount } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPremiumOpen, setIsPremiumOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl) {
      setSearchQuery(decodeURIComponent(searchFromUrl));
    }
  }, [searchParams]);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (!mounted) {
    return (
      <div className="flex flex-col w-full z-50 sticky top-0 font-sans shadow-xl h-[72px] md:h-[106px] bg-white dark:bg-[#0a0a0a]" />
    );
  }

  if (pathname === '/') return null;

  const handleSignOut = async () => {
    setIsMobileMenuOpen(false);
    await signOut();
    router.push('/');
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const isWholesaler = user?.role === 'wholesaler';

  const quickLinks = isWholesaler ? [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Inventory', path: '/inventory', icon: Package },
    { label: 'Orders', path: '/orders-received', icon: Truck },
  ] : [
    { label: 'Marketplace', path: '/marketplace', icon: ShoppingBag },
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Orders', path: '/my-orders', icon: Package },
  ];

  return (
    <div className="flex flex-col w-full z-50 sticky top-0 font-sans shadow-xl shadow-zinc-200/50 dark:shadow-none">
      {/* Top Bar */}
      <nav className="relative bg-white dark:bg-gradient-to-r dark:from-[#0a0a0a] dark:via-[#111111] dark:to-[#0a0a0a] text-zinc-900 dark:text-white px-3 sm:px-4 py-2 sm:py-2.5 flex flex-col justify-center border-b border-zinc-200 dark:border-white/5 transition-colors duration-300 w-full">
        <div className="relative z-10 flex items-center justify-between w-full max-w-[1920px] mx-auto gap-2 sm:gap-4">
          
          {/* Mobile Menu Button + Logo */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-300 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div
              className="flex items-center gap-2 cursor-pointer group select-none"
              onClick={() => router.push('/')}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)] group-hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all">
                <span className="text-white font-bold text-lg sm:text-xl">T</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300 tracking-tight">
                  Tradigoo
                </span>
                <span className="text-[9px] sm:text-[10px] text-zinc-500 tracking-widest uppercase">Premium B2B</span>
              </div>
            </div>
          </div>

          {/* Location (Desktop) */}
          {user && (
            <div
              className="hidden xl:flex flex-col items-start leading-tight cursor-pointer hover:bg-zinc-100 dark:hover:bg-white/5 p-2 rounded-lg transition-colors min-w-[140px] ml-2 border border-transparent hover:border-zinc-200 dark:hover:border-white/10"
            >
              <div className="flex items-center text-xs text-zinc-500 dark:text-zinc-400 ml-5">
                Deliver to {user.name?.split(' ')[0] || 'Trader'}
              </div>
              <div className="flex items-center font-bold text-sm text-zinc-800 dark:text-zinc-200">
                <MapPin className="w-4 h-4 mr-1 text-blue-500" />
                <span className="truncate max-w-[120px]">{user.location || 'India'}</span>
              </div>
            </div>
          )}

          {/* Desktop Search Bar */}
          <div className={`flex-1 max-w-2xl hidden md:flex h-11 rounded-xl overflow-hidden transition-all duration-300 relative mx-4 ${isSearchFocused ? 'ring-2 ring-blue-500/50 shadow-[0_0_30px_rgba(37,99,235,0.15)]' : 'ring-1 ring-zinc-200 dark:ring-white/10 hover:ring-zinc-300 dark:hover:ring-white/20'}`}>
            <div className="bg-zinc-50 dark:bg-[#1a1a1a] text-xs flex items-center px-4 border-r border-zinc-200 dark:border-white/5 text-zinc-600 dark:text-zinc-400 transition-colors">
              All <ChevronDown className="w-3 h-3 ml-2" />
            </div>
            <input
              type="text"
              placeholder="Search for grain, spices, oil, FMCG..."
              className="flex-1 px-4 bg-zinc-50 dark:bg-[#0f0f0f] text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 outline-none h-full w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              className="bg-blue-600 w-14 flex items-center justify-center transition-colors h-full hover:bg-blue-700"
              onClick={handleSearch}
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            {/* Trust Score (Desktop) */}
            {user && (
              <div className="hidden lg:flex">
                <Badge className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 px-3 py-1.5 h-full rounded-lg gap-2 shadow-sm dark:shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                  <TrendingUp className="w-4 h-4" />
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-emerald-600/70 dark:text-emerald-500/50 leading-none">Trust Score</span>
                    <span className="text-sm font-bold">{user.trust_score || 500}</span>
                  </div>
                </Badge>
              </div>
            )}

            {/* Theme Toggle (Desktop & Tablet) */}
            <div className="hidden sm:block">
              <ModeToggle />
            </div>

            {/* Desktop Account Dropdown */}
            {loading ? (
              <div className="w-24 sm:w-28 h-9 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-full animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="hidden md:flex items-center gap-3 cursor-pointer hover:bg-zinc-100 dark:hover:bg-white/5 p-1.5 pr-3 rounded-full border border-transparent hover:border-zinc-200 dark:hover:border-white/10 transition-all">
                    <Avatar className="w-9 h-9 ring-2 ring-zinc-200 dark:ring-white/10">
                      <AvatarFallback className="bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 text-zinc-700 dark:text-white font-bold border border-zinc-200 dark:border-white/10">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col leading-none">
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Hello, {user?.name?.split(' ')[0] || 'Trader'}</span>
                      <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center">Account <ChevronDown className="w-3 h-3 ml-1 text-zinc-400" /></span>
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-white dark:bg-[#111] border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-zinc-200 backdrop-blur-xl shadow-2xl">
                  <DropdownMenuLabel>
                    <div className="font-semibold text-zinc-900 dark:text-white">{user?.name}</div>
                    <div className="text-xs text-zinc-500 capitalize">{user?.role}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-zinc-100 dark:bg-white/10" />
                  <DropdownMenuItem onClick={() => router.push('/profile')} className="cursor-pointer">
                    <User className="w-4 h-4 mr-2" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/dashboard')} className="cursor-pointer">
                    <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(isWholesaler ? '/orders-received' : '/my-orders')} className="cursor-pointer">
                    <Package className="w-4 h-4 mr-2" /> Orders
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-zinc-100 dark:bg-white/10" />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-500 dark:text-red-400 cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => router.push('/auth/login')} className="font-semibold text-sm h-9">
                  Sign In
                </Button>
                <Button size="sm" onClick={() => router.push('/auth/signup')} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm h-9">
                  Register
                </Button>
              </div>
            )}

            {/* Cart Icon */}
            {!isWholesaler && (
              <div
                className="relative cursor-pointer p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                onClick={() => router.push('/cart')}
                aria-label="Cart"
              >
                <ShoppingCart className="w-6 h-6 sm:w-7 sm:h-7 text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-white transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white dark:border-[#0a0a0a]">
                    {cartCount}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Row (Integrated for <md) */}
        <div className="md:hidden w-full px-1 pt-2 pb-1">
          <div className="flex h-10 w-full rounded-xl overflow-hidden ring-1 ring-zinc-200 dark:ring-white/10 bg-zinc-50 dark:bg-[#0f0f0f]">
            <input
              type="text"
              placeholder="Search products, grains, spices..."
              className="flex-1 px-3 bg-transparent text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              className="bg-blue-600 px-4 flex items-center justify-center hover:bg-blue-700 transition-colors"
              onClick={handleSearch}
              aria-label="Search"
            >
              <Search className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </nav>

      {/* Bottom Bar - Categories & Quick Links (Horizontal Scroll on Mobile) */}
      <div className="relative bg-zinc-50 dark:bg-[#1a1a1a] text-zinc-600 dark:text-zinc-300 px-3 sm:px-4 py-2 flex items-center text-sm gap-4 sm:gap-6 border-b border-zinc-200 dark:border-white/5 overflow-x-auto no-scrollbar shadow-inner">
        <div
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex items-center gap-1.5 font-bold cursor-pointer text-zinc-900 dark:text-white px-2 py-1 rounded-md hover:bg-zinc-200 dark:hover:bg-white/5 transition-colors shrink-0"
        >
          <Menu className="w-4 h-4 sm:w-5 sm:h-5" /> All
        </div>

        {quickLinks.map(link => (
          <div
            key={link.path}
            className={`cursor-pointer font-medium whitespace-nowrap transition-colors hover:text-blue-600 dark:hover:text-blue-400 shrink-0 text-xs sm:text-sm ${
              pathname === link.path ? 'text-blue-600 dark:text-blue-400 font-bold' : ''
            }`}
            onClick={() => router.push(link.path)}
          >
            {link.label}
          </div>
        ))}

        <div className="h-4 w-px bg-zinc-300 dark:bg-white/10 mx-1 hidden md:block" />

        {['Fresh', "Today's Deals", 'Sell', 'Prime'].map(txt => (
          <div
            key={txt}
            className="hidden sm:block cursor-pointer whitespace-nowrap hover:text-zinc-900 dark:hover:text-white transition-colors text-xs sm:text-[13px] shrink-0"
            onClick={() => router.push(`/marketplace?search=${encodeURIComponent(txt)}`)}
          >
            {txt}
          </div>
        ))}

        <div
          onClick={() => setIsPremiumOpen(true)}
          className="ml-auto hidden xl:flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 py-1 px-3 rounded-full cursor-pointer transition-all duration-200 shrink-0 text-xs shadow-sm hover:scale-105"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>Tradigoo Premium</span>
          <span className="text-[10px] uppercase font-extrabold tracking-wider bg-amber-500 text-white dark:text-black px-1.5 py-0.5 rounded-full ml-1">Soon</span>
        </div>
      </div>

      {/* Mobile Drawer (Hamburger Menu Sheet) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="fixed top-0 bottom-0 left-0 w-[85%] max-w-[320px] bg-white dark:bg-[#111111] border-r border-zinc-200 dark:border-white/10 shadow-2xl flex flex-col p-6 overflow-y-auto animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                  T
                </div>
                <div>
                  <div className="font-bold text-zinc-900 dark:text-white leading-tight">Tradigoo</div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest">B2B Wholesale</div>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Profile Section or Auth Buttons */}
            <div className="py-6 border-b border-zinc-200 dark:border-white/10">
              {user ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 ring-2 ring-blue-500/20">
                      <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-white font-bold text-lg">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-zinc-900 dark:text-white truncate">{user.name}</div>
                      <div className="text-xs text-zinc-500 capitalize">{user.role}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-zinc-50 dark:bg-white/5 p-3 rounded-xl border border-zinc-200 dark:border-white/5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <TrendingUp className="w-4 h-4" />
                      Trust Score
                    </div>
                    <span className="font-bold text-zinc-900 dark:text-white">{user.trust_score || 500}</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  <Button
                    onClick={() => { setIsMobileMenuOpen(false); router.push('/auth/login'); }}
                    className="w-full h-11 bg-zinc-900 dark:bg-white text-white dark:text-black font-semibold text-sm"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => { setIsMobileMenuOpen(false); router.push('/auth/signup'); }}
                    variant="outline"
                    className="w-full h-11 border-zinc-300 dark:border-zinc-700 font-semibold text-sm"
                  >
                    Register Free
                  </Button>
                </div>
              )}
            </div>

            {/* Navigation Links */}
            <div className="py-4 space-y-1 flex-1">
              <div className="text-xs font-bold uppercase text-zinc-400 px-3 py-2">Navigation</div>
              {quickLinks.map(link => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.path}
                    onClick={() => { setIsMobileMenuOpen(false); router.push(link.path); }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                      pathname === link.path
                        ? 'bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 font-bold'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </button>
                );
              })}

              {user && (
                <button
                  onClick={() => { setIsMobileMenuOpen(false); router.push('/profile'); }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                    pathname === '/profile'
                      ? 'bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 font-bold'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5'
                  }`}
                >
                  <User className="w-5 h-5" />
                  Profile & Settings
                </button>
              )}

              <button
                onClick={() => { setIsMobileMenuOpen(false); setIsPremiumOpen(true); }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-all mt-2"
              >
                <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span>Tradigoo Premium</span>
                <span className="ml-auto text-[10px] font-bold bg-amber-500 text-white dark:text-black px-2 py-0.5 rounded-full uppercase">Soon</span>
              </button>
            </div>

            {/* Drawer Footer */}
            <div className="pt-4 border-t border-zinc-200 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs text-zinc-500 font-medium">Appearance</span>
                <ModeToggle />
              </div>

              {user && (
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  className="w-full justify-start text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 h-11 px-3"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tradigoo Premium Coming Soon Modal */}
      <PremiumModal
        isOpen={isPremiumOpen}
        onClose={() => setIsPremiumOpen(false)}
      />
    </div>
  );
}
