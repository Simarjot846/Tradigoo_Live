'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { Button } from '@/components/ui/button';
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Filter, ShieldCheck, Star, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import MarketplaceLoading from '@/app/marketplace/loading';
import ProductCard from "@/components/marketplace/product-card";

interface MarketplaceContentProps {
    initialProducts: any[];
}

export default function MarketplaceContent({ initialProducts }: MarketplaceContentProps) {
    const { user, loading } = useAuth();
    const { addToCart } = useCart();
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialCategory = searchParams.get('category') || 'all';

    // Filters State
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState(initialCategory);
    const [priceRange, setPriceRange] = useState([0, 5000]);
    const [minRating, setMinRating] = useState(0);
    const [verifiedOnly, setVerifiedOnly] = useState(false);
    const [sortBy, setSortBy] = useState('relevance');
    const [moqFilter, setMoqFilter] = useState<string | null>(null);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // Data State
    const [products, setProducts] = useState<any[]>(initialProducts);
    const [loadingProducts, setLoadingProducts] = useState(false);

    // Update filter if URL param changes
    useEffect(() => {
        const categoryFromUrl = searchParams.get('category');
        if (categoryFromUrl) setCategoryFilter(categoryFromUrl);

        const searchFromUrl = searchParams.get('search');
        if (searchFromUrl) {
            setSearchQuery(decodeURIComponent(searchFromUrl));
        }
    }, [searchParams]);

    const [page, setPage] = useState(0);
    const ITEMS_PER_PAGE = 24;
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        if (initialProducts.length < ITEMS_PER_PAGE) {
            setHasMore(false);
        }
    }, [initialProducts]);

    const loadMore = async () => {
        setLoadingProducts(true);
        const nextPage = page + 1;
        setPage(nextPage);

        try {
            const supabase = createClient();
            const start = nextPage * ITEMS_PER_PAGE;
            const end = start + ITEMS_PER_PAGE - 1;

            const { data, error } = await supabase
                .from('products')
                .select('id, name, category, base_price, unit, min_order_quantity, image_url, description, demand_level')
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .range(start, end);

            if (error) {
                console.error("Marketplace load error:", error.message || error.details || JSON.stringify(error));
                throw error;
            }

            if (data) {
                if (data.length < ITEMS_PER_PAGE) {
                    setHasMore(false);
                }
                setProducts(prev => [...prev, ...data]);
            }
        } catch (error: any) {
            console.error("Marketplace load exception:", error?.message || error?.details || (typeof error === 'object' ? JSON.stringify(error) : String(error)));
        } finally {
            setLoadingProducts(false);
        }
    };

    // Client-side filtering & sorting
    const filteredProducts = products.filter(p => {
        const searchLower = searchQuery.toLowerCase().trim();
        const matchesSearch = !searchLower ||
            (p.name && p.name.toLowerCase().includes(searchLower)) ||
            (p.category && p.category.toLowerCase().includes(searchLower)) ||
            (p.description && p.description.toLowerCase().includes(searchLower));

        const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
        const matchesPrice = p.base_price >= priceRange[0] && p.base_price <= priceRange[1];

        const productRating = Number(p.rating) || 0;
        const matchesRating = minRating === 0 || (productRating >= minRating);

        let matchesMoq = true;
        if (moqFilter === 'low') matchesMoq = p.min_order_quantity < 50;
        if (moqFilter === 'medium') matchesMoq = p.min_order_quantity >= 50 && p.min_order_quantity <= 200;
        if (moqFilter === 'high') matchesMoq = p.min_order_quantity > 200;

        return matchesSearch && matchesCategory && matchesPrice && matchesRating && matchesMoq;
    }).sort((a, b) => {
        if (sortBy === 'price-low') return (a.base_price || 0) - (b.base_price || 0);
        if (sortBy === 'price-high') return (b.base_price || 0) - (a.base_price || 0);
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        return 0;
    });

    const categories = ['all', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

    const resetFilters = () => {
        setCategoryFilter('all');
        setSearchQuery('');
        setPriceRange([0, 5000]);
        setMinRating(0);
        setMoqFilter(null);
        setVerifiedOnly(false);
    };

    if (loading) {
        return <MarketplaceLoading />;
    }

    const FilterControls = () => (
        <div className="space-y-6">
            {/* Category Filter */}
            <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white mb-3">Categories</h3>
                <div className="flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => {
                                setCategoryFilter(cat);
                                setIsMobileFilterOpen(false);
                            }}
                            className={`text-left py-1 px-2 rounded-lg transition-colors capitalize ${
                                categoryFilter === cat
                                    ? 'bg-blue-50 dark:bg-blue-600/10 font-bold text-blue-600 dark:text-blue-400'
                                    : 'hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5'
                            }`}
                        >
                            {cat === 'all' ? 'All Categories' : cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Price Filter */}
            <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white mb-2">Price Range</h3>
                <div className="px-1">
                    <Slider
                        defaultValue={[0, 5000]}
                        max={10000}
                        step={100}
                        value={priceRange}
                        onValueChange={setPriceRange}
                        className="my-4"
                    />
                    <div className="flex justify-between text-xs font-mono text-zinc-500 dark:text-zinc-400">
                        <span>₹{priceRange[0]}</span>
                        <span>₹{priceRange[1]}+</span>
                    </div>
                </div>
            </div>

            {/* Rating Filter */}
            <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white mb-3">Customer Rating</h3>
                {[4, 3, 2, 1].map(stars => (
                    <div
                        key={stars}
                        className={`flex items-center gap-2 cursor-pointer p-1.5 rounded-lg text-sm mb-1 transition-colors ${
                            minRating === stars
                                ? 'bg-blue-50 dark:bg-blue-600/10 font-bold text-blue-600 dark:text-blue-400'
                                : 'hover:bg-zinc-100 dark:hover:bg-white/5'
                        }`}
                        onClick={() => setMinRating(minRating === stars ? 0 : stars)}
                    >
                        <div className="flex text-yellow-500">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    size={14}
                                    fill={i < stars ? "currentColor" : "none"}
                                    strokeWidth={i < stars ? 0 : 1.5}
                                    className={i < stars ? "" : "text-zinc-300 dark:text-zinc-700"}
                                />
                            ))}
                        </div>
                        <span className="text-xs text-zinc-600 dark:text-zinc-400">& Up</span>
                    </div>
                ))}
            </div>

            {/* MOQ Filter */}
            <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white mb-3">Min Order Qty</h3>
                <div className="flex flex-col gap-2.5">
                    {['low', 'medium', 'high'].map(type => (
                        <div key={type} className="flex items-center gap-3">
                            <Checkbox
                                id={`moq-${type}`}
                                checked={moqFilter === type}
                                onCheckedChange={(c) => setMoqFilter(c ? type : null)}
                                className="border-zinc-300 dark:border-white/20 data-[state=checked]:bg-blue-600"
                            />
                            <label htmlFor={`moq-${type}`} className="text-sm cursor-pointer capitalize text-zinc-600 dark:text-zinc-400">
                                {type === 'low' ? '< 50 units' : type === 'medium' ? '50 - 200 units' : '> 200 units'}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Supplier Type */}
            <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white mb-3">Supplier Verification</h3>
                <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-3">
                        <Checkbox
                            id="verified"
                            checked={verifiedOnly}
                            onCheckedChange={(c) => setVerifiedOnly(!!c)}
                            className="border-zinc-300 dark:border-white/20 data-[state=checked]:bg-emerald-600"
                        />
                        <label htmlFor="verified" className="text-sm cursor-pointer flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                            Verified Supplier <ShieldCheck size={14} className="text-emerald-500" />
                        </label>
                    </div>
                </div>
            </div>

            <Button
                variant="outline"
                onClick={resetFilters}
                className="w-full text-xs border-zinc-200 dark:border-white/10"
            >
                Reset All Filters
            </Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans relative selection:bg-blue-500/30">
            
            {/* Top Bar with Sort & Mobile Filter Trigger */}
            <div className="sticky top-[64px] md:top-[72px] z-30 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md border-b border-zinc-200 dark:border-white/5 shadow-sm">
                <div className="container mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between gap-3">
                    <div className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 truncate">
                        <span className="font-bold text-zinc-900 dark:text-white">{filteredProducts.length}</span> results {categoryFilter !== 'all' && (
                            <span>for <span className="font-bold text-blue-600 dark:text-blue-400 capitalize">&quot;{categoryFilter}&quot;</span></span>
                        )}
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Mobile Filter Button */}
                        <Button
                            onClick={() => setIsMobileFilterOpen(true)}
                            variant="outline"
                            size="sm"
                            className="md:hidden h-9 px-3 gap-1.5 text-xs font-semibold border-zinc-300 dark:border-white/10"
                        >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                            Filters
                        </Button>

                        {/* Sort Dropdown */}
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className="text-xs text-zinc-500 hidden sm:inline">Sort:</span>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-[130px] sm:w-[160px] h-9 text-xs bg-zinc-100 dark:bg-[#1a1a1a] border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-zinc-200">
                                    <SelectValue placeholder="Sort" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-[#1a1a1a] border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-zinc-200">
                                    <SelectItem value="relevance">Featured</SelectItem>
                                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                                    <SelectItem value="rating">Top Rated</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6 sm:py-8 flex flex-col md:flex-row gap-6 lg:gap-8 relative z-10">
                
                {/* Desktop Sidebar Filters */}
                <aside className="w-60 shrink-0 hidden md:block space-y-6">
                    <FilterControls />
                </aside>

                {/* Product Grid */}
                <div className="flex-1 min-w-0">
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6">
                        {filteredProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                addToCart={addToCart}
                                getCategoryEmoji={getCategoryEmoji}
                            />
                        ))}
                    </div>

                    {/* Load More Button */}
                    {hasMore && filteredProducts.length > 0 && !loadingProducts && (
                        <div className="flex justify-center mt-10">
                            <Button
                                onClick={loadMore}
                                variant="outline"
                                className="h-12 px-8 rounded-full border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-900 dark:text-white font-bold"
                            >
                                Load More Products
                            </Button>
                        </div>
                    )}

                    {loadingProducts && (
                        <div className="flex justify-center mt-8">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}

                    {filteredProducts.length === 0 && (
                        <div className="text-center py-20 bg-white dark:bg-[#0a0a0a] rounded-3xl border border-zinc-200 dark:border-white/5 shadow-sm dark:shadow-none p-6">
                            <div className="w-16 h-16 bg-zinc-50 dark:bg-[#161616] rounded-full flex items-center justify-center mx-auto mb-4">
                                <Filter className="w-7 h-7 text-zinc-400 dark:text-zinc-600" />
                            </div>
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">No products found</h3>
                            <p className="text-zinc-500 text-sm mb-6">Try adjusting your filters or search terms.</p>
                            <Button
                                variant="outline"
                                onClick={resetFilters}
                                className="border-zinc-300 dark:border-white/10 text-zinc-900 dark:text-white"
                            >
                                Clear All Filters
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Filter Sheet / Drawer */}
            {isMobileFilterOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsMobileFilterOpen(false)}
                    />
                    <div className="fixed top-0 bottom-0 right-0 w-[85%] max-w-[340px] bg-white dark:bg-[#111111] border-l border-zinc-200 dark:border-white/10 shadow-2xl flex flex-col p-6 overflow-y-auto animate-in slide-in-from-right duration-200">
                        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-white/10 mb-6">
                            <div className="flex items-center gap-2 font-bold text-base text-zinc-900 dark:text-white">
                                <SlidersHorizontal className="w-4 h-4" />
                                Filter Products
                            </div>
                            <button
                                onClick={() => setIsMobileFilterOpen(false)}
                                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1">
                            <FilterControls />
                        </div>

                        <div className="pt-6 border-t border-zinc-200 dark:border-white/10 mt-6 flex gap-3">
                            <Button
                                onClick={() => setIsMobileFilterOpen(false)}
                                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold"
                            >
                                Apply Filters ({filteredProducts.length})
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function getCategoryEmoji(category: string): string {
    const emojiMap: Record<string, string> = {
        'Grains': '🌾',
        'Pulses': '🫘',
        'Oils': '🛢️',
        'Spices': '🌶️',
        'Sweeteners': '🍯',
        'Beverages': '☕',
        'Flours': '🥯',
        'Fashion': '👕',
        'Body Care': '🧴',
        'Bath Products': '🛁',
        'Electronics': '⌚',
        'Home & Kitchen': '🏠'
    };
    return emojiMap[category] || '📦';
}
