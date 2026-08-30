"use client";

import { memo } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProductCardProps {
    product: any;
    addToCart: (id: string, qty: number) => void;
    getCategoryEmoji?: (cat: string) => string;
}

const ProductCard = memo(({ product, addToCart, getCategoryEmoji }: ProductCardProps) => {
    const router = useRouter();

    const rating = Number(product.rating) || 0;
    const reviewCount = Number(product.review_count ?? product.reviews_count) || 0;
    const originalPrice = product.original_price || Math.round(Number(product.base_price) * 1.15);

    return (
        <div
            onClick={() => router.push(`/product/${product.id}`)}
            className="group bg-white dark:bg-[#0f0f0f] border border-zinc-200 dark:border-white/10 rounded-xl sm:rounded-2xl overflow-hidden hover:border-blue-500/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between relative shadow-sm dark:shadow-none h-full"
        >
            {/* Top image area - compact square aspect ratio */}
            <div className="relative aspect-square w-full bg-zinc-50 dark:bg-[#161616] p-2 sm:p-3 flex items-center justify-center overflow-hidden border-b border-zinc-100 dark:border-white/5">
                {product.image_url ? (
                    <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        unoptimized
                        className="object-contain p-2 sm:p-3 group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        loading="lazy"
                    />
                ) : (
                    <span className="text-3xl sm:text-4xl md:text-5xl select-none">
                        {getCategoryEmoji ? getCategoryEmoji(product.category) : '📦'}
                    </span>
                )}

                {/* Demand / Best Seller Badge */}
                {product.demand_level && (
                    <div className="absolute top-1.5 left-1.5 z-10">
                        <Badge className="bg-blue-600/90 text-white border-0 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 shadow-sm uppercase tracking-wide">
                            {product.demand_level === 'High' ? '🔥 Hot' : product.demand_level}
                        </Badge>
                    </div>
                )}

                {/* MOQ Badge */}
                {product.min_order_quantity && (
                    <div className="absolute bottom-1.5 right-1.5 z-10 bg-black/60 dark:bg-black/80 text-white text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded font-mono font-medium backdrop-blur-sm">
                        Min: {product.min_order_quantity}{product.unit}
                    </div>
                )}
            </div>

            {/* Content Details */}
            <div className="p-2 sm:p-3 flex-1 flex flex-col justify-between gap-1.5 sm:gap-2">
                <div>
                    {/* Category */}
                    <div className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 font-medium truncate uppercase tracking-wider">
                        {product.category}
                    </div>

                    {/* Product Name (Max 2 lines, truncated) */}
                    <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-2 mt-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {product.name}
                    </h3>

                    {/* Rating - Compact single line only shown when reviews exist */}
                    {reviewCount > 0 && rating > 0 && (
                        <div className="flex items-center gap-1 mt-1 text-[10px] sm:text-xs">
                            <div className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 px-1 py-0.5 rounded">
                                <Star size={10} className="fill-amber-500 text-amber-500" />
                                <span>{rating.toFixed(1)}</span>
                            </div>
                            <span className="text-zinc-400 text-[10px]">({reviewCount})</span>
                        </div>
                    )}
                </div>

                {/* Price & Action Buttons */}
                <div className="pt-1.5 border-t border-zinc-100 dark:border-white/5 mt-auto">
                    <div className="flex items-baseline gap-1 flex-wrap mb-2">
                        <span className="text-xs sm:text-sm md:text-base font-black text-zinc-900 dark:text-white">
                            ₹{product.base_price}
                        </span>
                        <span className="text-[10px] sm:text-[11px] text-zinc-500 font-mono">
                            /{product.unit}
                        </span>
                        {originalPrice > product.base_price && (
                            <span className="text-[10px] text-zinc-400 line-through font-mono ml-auto sm:ml-0">
                                ₹{originalPrice}
                            </span>
                        )}
                    </div>

                    {/* Compact Actions: Buy Now + Add to Cart */}
                    <div className="flex items-center gap-1 sm:gap-1.5">
                        <Button
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                addToCart(product.id, product.min_order_quantity || 1);
                                router.push('/cart');
                            }}
                            className="flex-1 h-7 sm:h-8 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] sm:text-xs rounded-lg shadow-sm transition-transform active:scale-95 px-2"
                        >
                            Buy Now
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                                e.stopPropagation();
                                addToCart(product.id, product.min_order_quantity || 1);
                            }}
                            className="h-7 sm:h-8 px-2 sm:px-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-white/10 rounded-lg transition-transform active:scale-95 shrink-0"
                            title="Add to Cart"
                        >
                            <ShoppingCart className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
});

ProductCard.displayName = "ProductCard";
export default ProductCard;
