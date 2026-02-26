'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, TrendingUp, Package, Users, ShieldCheck, ShoppingCart, Zap, Star } from 'lucide-react';
import { mockUsers } from '@/lib/mock-data';
import { getDemandBadgeColor } from '@/lib/ai-recommendations';
import { createClient } from '@/lib/supabase-client';

export default function ProductDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [product, setProduct] = useState<any | null>(null);
  const [quantity, setQuantity] = useState(0);
  const [loadingProduct, setLoadingProduct] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function fetchProduct() {
      const id = Array.isArray(params.id) ? params.id[0] : params.id;
      if (!id) return;



      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching product:', JSON.stringify(error, null, 2));
      } else {
        setProduct(data);
        if (data) setQuantity(data.min_order_quantity);
      }
      setLoadingProduct(false);
    }

    if (user && !loading) {
      fetchProduct();
    }
  }, [params.id, user, loading]);

  if (loading || !user || loadingProduct) {
    return (
      <div className="min-h-screen dark:bg-zinc-950 bg-background dark:text-zinc-100 text-foreground relative overflow-hidden transition-colors duration-300">

        <main className="container mx-auto px-6 py-10 relative z-10">
          <div className="mb-8 p-0">
            <div className="h-4 w-48 bg-zinc-200 dark:bg-zinc-900/50 rounded animate-pulse" />
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Skeleton */}
            <div className="space-y-6">
              <div className="aspect-video rounded-3xl bg-zinc-200 dark:bg-zinc-900/50 border border-zinc-300 dark:border-white/5 animate-pulse" />
              <div className="h-48 rounded-3xl bg-zinc-200 dark:bg-zinc-900/50 border border-zinc-300 dark:border-white/5 animate-pulse" />
            </div>

            {/* Right Skeleton */}
            <div className="space-y-6">
              <div className="mb-6 space-y-4">
                <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-900/50 rounded animate-pulse" />
                <div className="h-12 w-96 bg-zinc-200 dark:bg-zinc-900/50 rounded animate-pulse" />
                <div className="h-24 w-full bg-zinc-200 dark:bg-zinc-900/50 rounded animate-pulse" />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-8">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-24 rounded-2xl bg-zinc-200 dark:bg-white/5 border border-zinc-300 dark:border-white/5 animate-pulse" />
                ))}
              </div>

              <div className="h-96 rounded-3xl bg-zinc-200 dark:bg-zinc-900/50 border border-zinc-300 dark:border-white/5 animate-pulse" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center dark:bg-zinc-950 bg-background dark:text-white text-zinc-900 gap-4 transition-colors duration-300">
        <h2 className="text-xl font-bold">Product Not Found</h2>
        <Button variant="outline" onClick={() => router.push('/marketplace')}>
          Back to Marketplace
        </Button>
      </div>
    );
  }

  const totalAmount = quantity * product.base_price;
  const expectedProfit = totalAmount * (product.expected_margin / 100);

  const handlePlaceOrder = () => {
    sessionStorage.setItem('pendingOrder', JSON.stringify({
      product_id: product.id,
      product_name: product.name,
      quantity,
      unit_price: product.base_price,
      total_amount: totalAmount,
      expected_profit: expectedProfit
    }));
    router.push('/order/confirm');
  };

  return (
    <div className="min-h-screen dark:bg-zinc-950 bg-background dark:text-zinc-100 text-foreground relative overflow-hidden selection:bg-blue-500/30 transition-colors duration-300">
      {/* Global Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none text-left">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-zinc-950 to-zinc-950 hidden dark:block" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-0 dark:opacity-20 bg-repeat mix-blend-overlay" />
        <div className="absolute top-[20%] left-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] mix-blend-screen hidden dark:block" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] mix-blend-screen hidden dark:block" />
      </div>



      <main className="container mx-auto px-6 py-10 relative z-10">
        <div
          
          
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 pl-0 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column: Image & AI Insights */}
          <div className="space-y-6">
            <div
              
              
              
            >
              <div className="aspect-video rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-800 border border-white/10 flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent opacity-20" />
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-9xl relative z-10 transform transition-transform duration-500 group-hover:scale-110 drop-shadow-2xl">
                    {getCategoryEmoji(product.category)}
                  </span>
                )}

                {/* Floating Tags */}
                <div className="absolute top-4 right-4">
                  <Badge className={`${getDemandBadgeColor(product.demand_level)} border-0 shadow-lg backdrop-blur-md`}>
                    {product.demand_level} Demand
                  </Badge>
                </div>
              </div>
            </div>

            <div
              
              
              
              className="p-6 rounded-3xl bg-white dark:bg-gradient-to-br dark:from-blue-500/10 dark:to-purple-500/5 border border-zinc-200 dark:border-blue-500/20 backdrop-blur-sm shadow-sm dark:shadow-none"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-500/20">
                  <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-white">AI Market Intelligence</h3>
              </div>
              <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed bg-zinc-50 dark:bg-black/20 p-4 rounded-xl border border-zinc-100 dark:border-white/5">
                "{product.recommendation_reason}"
              </p>
              <div className="mt-4 flex gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span>High Margin Potential</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
                  <span>Top Rated Supplier</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Order Form */}
          <div className="space-y-6">
            <div
              
              
              
            >
              <div className="mb-6">
                <div className="flex items-center gap-3 text-zinc-500 mb-2 text-sm font-medium">
                  <span>{product.category}</span>
                  <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                  <span>ID: #{product.id}</span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 dark:from-white dark:via-zinc-400 dark:to-zinc-200 mb-4">
                  {product.name}
                </h1>
                <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Stats Grid */}
              <div
                className="grid grid-cols-2 gap-3 mb-8"
                
                
                
              >
                {[
                  { label: "Expected Margin", value: `~${product.expected_margin}%`, color: "text-green-600 dark:text-green-400" },
                  { label: "Min Order", value: `${product.min_order_quantity} ${product.unit}`, sub: product.unit, color: "text-zinc-900 dark:text-white" },
                  { label: "Suppliers", value: product.supplier_count, color: "text-zinc-900 dark:text-white" },
                  { label: "Base Price", value: `₹${product.base_price}`, sub: `/${product.unit}`, color: "text-zinc-900 dark:text-white" }
                ].map((stat, i) => (
                  <div
                    key={i}
                    
                    className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:bg-white/10 transition-colors shadow-sm dark:shadow-none"
                  >
                    <div className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-1">{stat.label}</div>
                    <div className={`text-2xl font-bold ${stat.color}`}>
                      {stat.value}
                      {stat.sub && i === 3 ? <span className="text-sm text-zinc-500 font-normal">{stat.sub}</span> : null}
                      {i === 1 ? <span className="text-sm text-zinc-500 font-normal hidden"></span> : null}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Card */}
              <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 backdrop-blur-xl shadow-lg dark:shadow-2xl">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Configure Order
                </h2>

                <div className="space-y-6">
                  <div>
                    <Label className="text-zinc-500 dark:text-zinc-400 mb-2 block">Quantity ({product.unit})</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        min={product.min_order_quantity}
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                        className="bg-zinc-50 dark:bg-black/20 border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white h-12 text-lg focus:border-blue-500 focus:ring-blue-500/20"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">
                        Min: {product.min_order_quantity}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/5 space-y-3">
                    <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                      <span>Subtotal</span>
                      <span className="text-zinc-900 dark:text-white">₹{totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Est. Profit</span>
                      <span className="font-bold">+ ₹{expectedProfit.toLocaleString()}</span>
                    </div>
                    <div className="pt-3 border-t border-zinc-200 dark:border-white/10 flex justify-between items-center">
                      <span className="text-zinc-700 dark:text-zinc-300 font-medium">Total Investment</span>
                      <span className="text-2xl font-bold text-zinc-900 dark:text-white">₹{totalAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handlePlaceOrder}
                    disabled={quantity < product.min_order_quantity}
                    className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-900/20 text-white"
                  >
                    Place Secure Order
                    <ShieldCheck className="w-5 h-5 ml-2" />
                  </Button>

                  <p className="text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
                    <ShieldCheck className="w-3 h-3" />
                    Payments are held in escrow until satisfactory delivery
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
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
    'Electronics': '⌚'
  };
  return emojiMap[category] || '📦';
}
