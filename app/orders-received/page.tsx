"use client";

import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Search, Filter, ChevronRight, Truck, CheckCircle, AlertCircle, Package, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import QRCode from "qrcode";

export default function OrdersReceivedPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All Orders');

    useEffect(() => {
        async function loadData() {
            if (!user) return;
            const supabase = createClient();

            let query = supabase
                .from('orders')
                .select('*, product:products!product_id(name, image_url, unit), buyer:profiles!buyer_id(business_name)')
                .order('created_at', { ascending: false });

            // Apply simplistic status filter if needed
            // For MVP "All Orders" usually shows everything

            const { data, error } = await query;
            if (error) {
                console.error(error);
                toast.error("Failed to load orders");
            } else {
                setOrders(data || []);
            }
            setLoading(false);
        }
        loadData();
    }, [user]);

    const filteredOrders = filter === 'All Orders'
        ? orders
        : orders.filter(o => o.status.replace(/_/g, ' ').toLowerCase().includes(filter.toLowerCase()));

    return (
        <div className="min-h-screen pb-20 dark:bg-zinc-950 bg-background relative overflow-hidden transition-colors duration-300">
            {/* Design System: Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-zinc-950 to-zinc-950 hidden dark:block" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-0 dark:opacity-20 bg-repeat mix-blend-overlay" />
            </div>

            <div className="container mx-auto px-6 py-10 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
                    <div>
                        <Button
                            variant="ghost"
                            className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white mb-2 pl-0"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back
                        </Button>
                        <h1
                            
                            
                            className="text-4xl font-bold text-zinc-900 dark:text-white tracking-tight"
                        >
                            Orders Received
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-2">Manage incoming orders and track shipment status.</p>
                    </div>
                </div>

                {/* Tabs / Filters */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
                    {['All Orders', 'Pending', 'Shipped', 'Delivered', 'Cancelled'].map((status, i) => (
                        <Button
                            key={status}
                            onClick={() => setFilter(status)}
                            variant={filter === status ? "default" : "outline"}
                            className={`rounded-full px-6 ${filter === status ? "bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200" : "bg-transparent border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5"}`}
                        >
                            {status}
                        </Button>
                    ))}
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-20 text-zinc-500">Loading orders...</div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/40 rounded-3xl border border-zinc-200 dark:border-white/5">
                            <h3 className="text-zinc-900 dark:text-zinc-300 font-bold mb-2">No orders found</h3>
                            <p className="text-zinc-500">You don't have any orders in this category yet.</p>
                        </div>
                    ) : (
                        filteredOrders.map((order, i) => (
                            <OrderCard key={order.id} order={order} index={i} onUpdate={() => window.location.reload()} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function OrderCard({ order, index, onUpdate }: { order: any, index: number, onUpdate: () => void }) {
    const statusColor = (status: string) => {
        if (status === 'shipped') return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
        if (status === 'delivered') return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
        if (status === 'cancelled') return 'text-red-400 bg-red-400/10 border-red-400/20';
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    };

    return (
        <div
            
            
            
        >
            <Card className="bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 backdrop-blur-md p-6 hover:border-zinc-300 dark:hover:border-white/10 transition-colors group shadow-sm dark:shadow-none">
                <div className="flex flex-col md:flex-row gap-6 justify-between items-center">

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="w-12 h-12 bg-zinc-100 dark:bg-white/5 rounded-full flex items-center justify-center border border-zinc-200 dark:border-white/5">
                            <Truck className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-zinc-900 dark:text-white font-semibold text-lg">Order #{order.id.slice(0, 8)}</h3>
                                <Badge className={`${statusColor(order.status)} border capitalize`}>
                                    {order.status.replace(/_/g, ' ')}
                                </Badge>
                            </div>
                            <p className="text-zinc-500 text-sm">
                                {new Date(order.created_at).toLocaleDateString()} • {order.buyer?.business_name || order.buyer?.full_name || 'Retailer'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                        <div className="text-right">
                            <div className="text-xs text-zinc-500 uppercase font-semibold">Total Amount</div>
                            <div className="text-xl font-bold text-zinc-900 dark:text-white">₹{order.total_amount?.toLocaleString()}</div>
                        </div>

                        <ManageOrderDialog order={order} onUpdate={onUpdate} />
                    </div>
                </div>
            </Card>
        </div>
    )
}

function ManageOrderDialog({ order, onUpdate }: { order: any, onUpdate: () => void }) {
    const [open, setOpen] = useState(false);
    const [showLabel, setShowLabel] = useState(false);
    const [qrImageUrl, setQrImageUrl] = useState<string>('');

    // Generate Online Verification QR on mount
    useEffect(() => {
        const generateQR = async () => {
            try {
                // 1. Construct Verification URL
                // Use env var or fallback to current origin for local dev
                const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
                const verifyUrl = `${baseUrl}/verify/${order.id}`;

                // 2. Generate QR Data URL
                const url = await QRCode.toDataURL(verifyUrl, { width: 300, margin: 2, color: { dark: '#000000', light: '#ffffff' } });
                setQrImageUrl(url);
            } catch (e) {
                console.error("QR Gen Error", e);
            }
        };
        generateQR();
    }, [order]);

    const handlePickup = async () => {
        const supabase = createClient();
        const toastId = toast.loading("Verifying Pickup...");

        try {
            await new Promise(r => setTimeout(r, 1000)); // Mock delay

            const { error } = await supabase.from('orders').update({
                status: 'shipped',
                pickup_verified: true,
                courier_proof: { pickup_time: new Date().toISOString(), method: 'manual_verification' }
            }).eq('id', order.id);

            if (error) throw error;

            toast.success("Pickup Verified!", { id: toastId });
            setOpen(false);
            onUpdate();
        } catch (e: any) {
            toast.error("Failed: " + e.message, { id: toastId });
        }
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank', 'width=600,height=600');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Print Label - ${order.id}</title>
                        <style>
                            body { font-family: 'Courier New', monospace; text-align: center; padding: 40px; }
                            .label-box { border: 4px solid black; padding: 25px; display: inline-block; max-width: 350px; text-align: center; }
                            .qr-container { margin: 20px 0; }
                            h2 { margin: 0; text-transform: uppercase; letter-spacing: 2px; border-bottom: 2px solid black; padding-bottom: 15px; margin-bottom: 15px; }
                            .product-name { font-weight: 900; font-size: 22px; margin: 10px 0; }
                            .meta { font-size: 14px; color: #333; margin-top: 15px; border-top: 1px dashed #999; padding-top: 10px; }
                        </style>
                    </head>
                    <body>
                        <div class="label-box">
                            <h2>TRADIGOO VERIFIED</h2>
                            <div class="product-name">${order.product?.name}</div>
                            <div>QTY: <strong>${order.quantity}</strong> | ${order.product?.unit || 'UNITS'}</div>
                            
                            <div class="qr-container">
                                <img src="${qrImageUrl}" width="220" height="220" />
                            </div>
                            
                            <div style="font-weight: bold; font-size: 12px;">INTERNAL PARCEL CODE</div>
                            <div style="font-size: 10px;">Scan to Verify Authenticity</div>
                            
                            <div class="meta">
                                Order: #${order.id.slice(0, 8)}<br/>
                                Buyer: ${order.buyer?.business_name || 'Retailer'}
                            </div>
                        </div>
                        <script>
                            // Auto-print when ready
                            setTimeout(() => { window.print(); window.close(); }, 800);
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
        toast.success("Secure Label sent to printer");
    };

    return (
        <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) setShowLabel(false); }}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg shadow-blue-900/20">
                    Manage Order
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Manage Order #{order.id.slice(0, 6)}</DialogTitle>
                    <DialogDescription>
                        Product: <span className="text-zinc-900 dark:text-white font-medium">{order.product?.name}</span> • Qty: {order.quantity}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 space-y-4">
                    {!showLabel ? (
                        <>
                            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5">
                                    <div className="text-zinc-500 mb-1">Status</div>
                                    <div className="font-mono text-zinc-900 dark:text-white capitalize">{order.status.replace(/_/g, ' ')}</div>
                                </div>
                                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5">
                                    <div className="text-zinc-500 mb-1">Buyer</div>
                                    <div className="text-zinc-900 dark:text-white">{order.buyer?.business_name || 'N/A'}</div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Actions</h4>

                                {/* Action List */}
                                {order.status !== 'shipped' && order.status !== 'delivered' && order.status !== 'cancelled' && (
                                    <div className="grid grid-cols-1 gap-3">
                                        <Button onClick={() => setShowLabel(true)} variant="outline" className="justify-start h-12 border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 gap-3">
                                            <div className="bg-blue-100 dark:bg-blue-500/10 p-1.5 rounded text-blue-600 dark:text-blue-400"><Package className="w-4 h-4" /></div>
                                            <div className="text-left">
                                                <div className="font-semibold text-zinc-900 dark:text-white">Generate Packing Label</div>
                                                <div className="text-xs text-zinc-500">View & Print QR for Parcel</div>
                                            </div>
                                        </Button>
                                        <Button onClick={handlePickup} variant="outline" className="justify-start h-12 border-purple-500/20 hover:bg-purple-500/5 gap-3 group">
                                            <div className="bg-purple-100 dark:bg-purple-500/10 p-1.5 rounded text-purple-600 dark:text-purple-400"><Truck className="w-4 h-4" /></div>
                                            <div className="text-left">
                                                <div className="font-semibold text-purple-700 dark:text-purple-200 group-hover:text-purple-900 dark:group-hover:text-purple-100">Simulate Courier Pickup</div>
                                                <div className="text-xs text-zinc-500">Marks as Shipped</div>
                                            </div>
                                        </Button>
                                    </div>
                                )}

                                {order.status === 'shipped' && (
                                    <div className="p-4 rounded-lg bg-green-100 dark:bg-green-900/10 border border-green-200 dark:border-green-500/20 flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500" />
                                        <span className="text-green-700 dark:text-green-200 text-sm">Order is with courier. Waiting for delivery.</span>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                            <div className="bg-white p-6 rounded-xl w-full max-w-sm text-black shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-2 bg-blue-600" />
                                <div className="flex justify-between items-center mb-6">
                                    <div className="font-bold text-lg tracking-tight">TRADIGOO</div>
                                    <div className="text-xs font-mono bg-zinc-100 px-2 py-1 rounded">#{order.id.slice(0, 6)}</div>
                                </div>

                                <div className="flex justify-center mb-6">
                                    <div className="p-2 border-2 border-black rounded-lg">
                                        {/* Using public API for QR generation for MVP */}
                                        <img src={qrImageUrl} alt="QR Code" className="w-32 h-32 object-contain mix-blend-multiply" />
                                    </div>
                                </div>

                                <div className="space-y-2 mb-6 text-center">
                                    <p className="font-bold text-sm">Authentic Tradigoo Parcel</p>
                                    <div className="flex gap-4 mt-2 justify-center">
                                        <div>
                                            <div className="text-[10px] uppercase text-zinc-500 font-bold">Verification</div>
                                            <div className="font-mono text-sm">ONLINE_URL</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4 text-center">
                                    <div className="text-[10px] text-zinc-500">
                                        Scan this QR code to visit the secure verification page.
                                    </div>
                                </div>

                                <div className="bg-zinc-100 p-3 rounded-lg text-center">
                                    <p className="text-xs text-zinc-600 font-medium">
                                        {process.env.NEXT_PUBLIC_SITE_URL ? "Production Mode" : "Local Development Mode"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6 w-full">
                                <Button variant="outline" className="flex-1" onClick={() => setShowLabel(false)}>Cancel</Button>
                                <Button className="flex-1 bg-white text-black hover:bg-zinc-200 font-bold" onClick={handlePrint}>
                                    <Package className="w-4 h-4 mr-2" /> Print Label
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
