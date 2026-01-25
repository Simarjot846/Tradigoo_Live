'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { mockUsers } from '@/lib/mock-data';
import { createClient } from '@/lib/supabase-client';
import { useAuth } from '@/lib/auth-context';


export default function InvoicePage() {
    const params = useParams();
    const { user, loading: authLoading } = useAuth(); // Use global auth context
    const [order, setOrder] = useState<any>(null);
    const [buyer, setBuyer] = useState<any>(null);
    const [seller, setSeller] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        async function fetchInvoiceData() {
            try {
                // 1. Resolve User
                let currentUser = user;
                const supabase = createClient();

                if (!currentUser && !authLoading) {
                    // Try manual session recovery
                    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                    if (session?.user) {
                        currentUser = session.user as any;
                    }
                }

                if (!currentUser) {
                    if (isMounted && !authLoading) setLoading(false);
                    return;
                }

                // 2. Fetch Order with Abort Signal check (Manual check after await)
                const { data: orderData, error: orderError } = await supabase
                    .from('orders')
                    .select(`*, product:products(name, unit)`)
                    .eq('id', params.id)
                    .single();
                // Note: supabase-js .abortSignal() might not be available in all versions, 
                // preventing breakage by just checking isMounted/signal.aborted after await.

                if (controller.signal.aborted) return;
                if (!isMounted) return;

                if (orderError || !orderData) {
                    console.error("Error fetching invoice order:", orderError?.message || orderError);
                    setLoading(false);
                    return;
                }

                // 3. Set Data
                setOrder({
                    ...orderData,
                    product_name: orderData.product?.name || 'Product',
                    unit: orderData.product?.unit
                });

                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('*')
                    .in('id', [orderData.buyer_id, orderData.seller_id]);

                if (controller.signal.aborted) return;

                if (isMounted) {
                    if (profiles) {
                        setBuyer(profiles.find((p: any) => p.id === orderData.buyer_id) || mockUsers[0]);
                        setSeller(profiles.find((p: any) => p.id === orderData.seller_id) || mockUsers[1]);
                    }
                    setLoading(false);
                }

            } catch (err: any) {
                if (err.name === 'AbortError' || controller.signal.aborted) {
                    // Ignore abort errors
                    return;
                }
                console.error("Invoice Data Fetch Error:", err);
                if (isMounted) setLoading(false);
            }
        }

        fetchInvoiceData();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [params.id, user, authLoading]);

    if (loading) return <div className="p-10 text-center">Loading Invoice Data...</div>;

    if (!user && !loading) {
        return (
            <div className="p-10 text-center space-y-4">
                <p className="text-red-500 font-bold">Authentication Failed.</p>
                <p className="text-zinc-500">Could not verify your identity. Please make sure you are logged in.</p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
        );
    }

    if (!order) return <div className="p-10 text-center text-red-500">Invoice Information Not Available</div>;

    // Use fetched profiles or fallbacks
    const displayBuyer = buyer || { name: 'Unknown Buyer', business_name: 'Business', location: 'Unknown' };
    const displaySeller = seller || { name: 'Unknown Seller', business_name: 'Supplier', location: 'Unknown' };

    // Mock Tax Calculation
    const subtotal = order.total_amount;
    const taxRate = 0.05;
    const taxAmount = subtotal * taxRate;
    const grandTotal = subtotal + taxAmount;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-white text-zinc-900 p-8 md:p-12 font-sans">
            {/* Print Control Bar - Hidden when printing */}
            <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center print:hidden">
                <Button variant="outline" onClick={() => window.close()}>
                    Close
                </Button>
                <div className="flex gap-2">
                    <Button onClick={handlePrint} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                        <Printer className="w-4 h-4" /> Print Invoice
                    </Button>
                </div>
            </div>

            {/* Invoice Document */}
            <div className="max-w-4xl mx-auto bg-white border border-zinc-200 shadow-lg p-8 md:p-16 print:shadow-none print:border-0 print:p-0">

                {/* Header */}
                <div className="flex justify-between items-start mb-12">
                    <div>
                        <h1 className="text-3xl font-bold text-blue-600 mb-2">Tradigoo</h1>
                        <p className="text-sm text-zinc-500">Premium B2B Commodity Trading</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-4xl font-light text-zinc-300 uppercase tracking-widest mb-2">Invoice</h2>
                        <p className="font-mono text-zinc-600">#{order.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                </div>

                {/* Dates & Info */}
                <div className="flex justify-between border-b border-zinc-100 pb-8 mb-8">
                    <div className="space-y-1">
                        <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Date Issued</p>
                        <p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="space-y-1 text-right">
                        <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Payment Status</p>
                        <p className="font-medium text-green-600">PAID (Escrow)</p>
                    </div>
                </div>

                {/* Addresses */}
                <div className="grid md:grid-cols-2 gap-12 mb-12">
                    <div>
                        <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold mb-4">Billed To</p>
                        <h3 className="font-bold text-lg">{displayBuyer.business_name || displayBuyer.name}</h3>
                        <p className="text-zinc-600">{displayBuyer.name}</p>
                        <p className="text-zinc-500 text-sm whitespace-pre-line">{displayBuyer.location}</p>
                    </div>
                    <div className="md:text-right">
                        <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold mb-4">Shipped From</p>
                        <h3 className="font-bold text-lg">{displaySeller.business_name || displaySeller.name}</h3>
                        <p className="text-zinc-600">{displaySeller.name}</p>
                        <p className="text-zinc-500 text-sm whitespace-pre-line">{displaySeller.location}</p>
                        <p className="text-zinc-500 text-sm mt-2">GSTIN: 27AABCU9603R1ZN</p>
                    </div>
                </div>

                {/* Line Items */}
                <div className="mb-12">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b-2 border-zinc-100">
                                <th className="py-4 text-xs uppercase tracking-wider font-semibold text-zinc-400">Item Description</th>
                                <th className="py-4 text-xs uppercase tracking-wider font-semibold text-zinc-400 text-right">Qty</th>
                                <th className="py-4 text-xs uppercase tracking-wider font-semibold text-zinc-400 text-right">Rate</th>
                                <th className="py-4 text-xs uppercase tracking-wider font-semibold text-zinc-400 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="text-zinc-700">
                            <tr className="border-b border-zinc-50">
                                <td className="py-4 font-medium">{order.product_name}</td>
                                <td className="py-4 text-right">{order.quantity} {order.unit}</td>
                                <td className="py-4 text-right">₹{order.unit_price?.toLocaleString()}</td>
                                <td className="py-4 text-right font-medium">₹{order.total_amount?.toLocaleString()}</td>
                            </tr>
                            <tr className="h-24"><td colSpan={4}></td></tr>
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end mb-12">
                    <div className="w-64 space-y-3">
                        <div className="flex justify-between text-zinc-600">
                            <span>Subtotal</span>
                            <span>₹{subtotal?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-zinc-600">
                            <span>GST (5%)</span>
                            <span>₹{taxAmount?.toLocaleString()}</span>
                        </div>
                        <div className="border-t-2 border-zinc-100 pt-3 flex justify-between text-xl font-bold text-zinc-900">
                            <span>Total</span>
                            <span>₹{grandTotal?.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-sm text-zinc-400 pt-12 border-t border-zinc-100 print:bottom-8 print:absolute print:w-full print:left-0 print:border-none">
                    <p className="mb-2">Thank you for your business!</p>
                    <p>Tradigoo Inc. • 123 Market Street, Pune, India • support@tradigoo.com</p>
                </div>
            </div>
        </div>
    );
}
