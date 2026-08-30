import { Suspense } from 'react';
import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import MarketplaceContent from '@/components/marketplace/marketplace-content';
import MarketplaceLoading from './loading';
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = 'force-dynamic';

export default async function MarketplacePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth/login?redirect=/marketplace');
  }

  const ITEMS_PER_PAGE = 24;

  const { data: products } = await supabase
    .from('products')
    .select('id, name, category, base_price, unit, min_order_quantity, image_url, description, demand_level')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .range(0, ITEMS_PER_PAGE - 1);

  return (
    <Suspense fallback={<MarketplaceSkeleton />}>
      <MarketplaceContent initialProducts={products || []} />
    </Suspense>
  );
}

function MarketplaceSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex justify-center py-20 px-4">
      <div className="container mx-auto space-y-8">
        <div className="flex gap-8">
          <div className="hidden md:block w-64 space-y-8">
            <Skeleton className="h-8 w-32" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="p-2 sm:p-3 rounded-xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#0f0f0f] space-y-2">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <Skeleton className="h-3.5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex gap-1.5 pt-1">
                  <Skeleton className="h-7 flex-1 rounded-lg" />
                  <Skeleton className="h-7 w-7 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
