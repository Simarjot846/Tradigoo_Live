'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase-client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Truck, CheckCircle, Clock, AlertCircle, ArrowRight, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

import dynamic from 'next/dynamic';
// Dynamically import QRScanner to avoid loading jsqr (heavy lib) on initial load
const QRScanner = dynamic(() => import('@/components/qr-scanner').then(mod => mod.QRScanner), {
    loading: () => <Button size="sm" variant="outline" disabled>Loading Scanner...</Button>,
    ssr: false
});

import { toast } from 'sonner';


export default function MyOrdersPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchOrders() {
            if (!user) return;
            const supabase = createClient();

            const { data, error } = await supabase
                .from('orders')
                .select(`
          *,
          product:products (
            name,
            image_url,
            unit
          ),
          seller:profiles!seller_id (
            business_name
          )
        `)
                .eq('buyer_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching orders:', error);
            } else {
                setOrders(data || []);
            }
            setIsLoading(false);
        }

        if (!loading) {
            if (!user) {
                router.push('/auth/login');
            } else {
                fetchOrders();
            }
        }
    }, [user, loading, router]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ORDER_CREATED': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'PAYMENT_HELD': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'SHIPPED': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'DELIVERED': return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'OTP_CONFIRMED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'INSPECTION_PENDING': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
            case 'PAYMENT_RELEASED': return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
            default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
        }
    };

    if (isLoading) {
        return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">Loading orders...</div>;
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 relative overflow-hidden transition-colors duration-300">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-white dark:via-zinc-950 to-white dark:to-zinc-950" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 dark:opacity-20 bg-repeat mix-blend-overlay" />
            </div>

            <main className="container mx-auto px-6 py-10 relative z-10 max-w-5xl">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                        <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        My Orders
                    </h1>
                </div>

                {orders.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-zinc-900/40 rounded-3xl border border-zinc-200 dark:border-white/5 backdrop-blur-md shadow-sm dark:shadow-none">
                        <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">📦</div>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">No orders found</h2>
                        <p className="text-zinc-500 text-lg mb-8">You haven't placed any orders yet.</p>
                        <Button onClick={() => router.push('/marketplace')} className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20">
                            Browse Marketplace
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order, i) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                onClick={() => router.push(`/order/${order.id}`)}
                                className="cursor-pointer"
                            >
                                <Card className="bg-white/80 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/5 p-6 backdrop-blur-md hover:border-blue-500/30 dark:hover:border-white/10 hover:shadow-lg dark:hover:bg-white/[0.02] transition-all group shadow-sm dark:shadow-none overflow-hidden">
                                    <div className="flex flex-col md:flex-row gap-6 items-center">
                                        {/* Order Icon/Image */}
                                        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-2xl shrink-0 overflow-hidden border border-zinc-200 dark:border-white/5">
                                            {order.product?.image_url ? (
                                                <img src={order.product.image_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span>📦</span>
                                            )}
                                        </div>

                                        {/* Order Info */}
                                        <div className="flex-1 space-y-1 text-center md:text-left min-w-0">
                                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                                <span className="text-xs font-mono text-zinc-500">#{order.id.slice(0, 8)}</span>
                                                <span className="text-xs text-zinc-400">•</span>
                                                <span className="text-xs text-zinc-500 dark:text-zinc-400">{new Date(order.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <h3 className="font-bold text-zinc-900 dark:text-white text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                                {order.product?.name || 'Unknown Product'}
                                            </h3>
                                            <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">
                                                Supplier: <span className="text-zinc-700 dark:text-zinc-300 font-medium">{order.seller?.business_name || 'Unknown Seller'}</span>
                                            </p>
                                        </div>

                                        {/* Status & Amount */}
                                        <div className="flex flex-col items-center md:items-end gap-2 w-full md:w-auto shrink-0">
                                            <Badge className={`${getStatusColor(order.status)} border px-3 py-1 whitespace-nowrap`}>
                                                {order.status.replace(/_/g, ' ')}
                                            </Badge>
                                            <div className="font-mono text-zinc-900 dark:text-white text-lg font-bold">
                                                ₹{order.total_amount.toLocaleString()}
                                            </div>
                                            <div className="text-xs text-zinc-500 mb-2">
                                                {order.quantity} {order.product?.unit}
                                            </div>

                                            {/* Action Buttons based on Status */}
                                            <div className="flex gap-2 w-full md:w-auto" onClick={(e) => e.stopPropagation()}>
                                                {order.status === 'shipped' && (
                                                    <QRScanner
                                                        orderId={order.id}
                                                        expectedDetails={{}}
                                                        onVerify={(success) => {
                                                            if (success) {
                                                                // Auto-update status to delivered/verified (Mock)
                                                                const updatedOrders = orders.map(o =>
                                                                    o.id === order.id ? { ...o, status: 'delivered' } : o
                                                                );
                                                                setOrders(updatedOrders);
                                                            }
                                                        }}
                                                    />
                                                )}

                                                {(order.status === 'shipped' || order.status === 'delivered') && (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            className="bg-green-600 hover:bg-green-500 whitespace-nowrap"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toast.success("Order marked as Complete! Payment released.");
                                                                setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'completed' } : o));
                                                            }}
                                                        >
                                                            All Good
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="border-red-500/20 text-red-500 hover:bg-red-500/10 whitespace-nowrap"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toast("Dispute flow opened (Mock)");
                                                            }}
                                                        >
                                                            Report
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <ArrowRight className="text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-white transition-colors hidden sm:block shrink-0" />
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
