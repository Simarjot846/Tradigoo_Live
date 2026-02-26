"use client";

import { useAuth } from "@/lib/auth-context";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function CartPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState(false);

    useEffect(() => {
        if (user) {
            fetchCart();
        }
    }, [user]);

    const fetchCart = async () => {
        try {
            const res = await fetch('/api/cart');
            const data = await res.json();
            if (Array.isArray(data)) {
                setCartItems(data);
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (id: string, newQuantity: number) => {
        // Optimistic UI update
        const oldItems = [...cartItems];
        setCartItems(items => items.map(item =>
            item.id === id ? { ...item, quantity: newQuantity } : item
        ));

        try {
            const res = await fetch('/api/cart', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, quantity: newQuantity })
            });
            if (!res.ok) throw new Error('Update failed');
            fetchCart(); // Sync with server
        } catch (error) {
            console.error('Failed to update quantity:', error);
            setCartItems(oldItems); // Revert on error
        }
    };

    const removeItem = async (id: string) => {
        const oldItems = [...cartItems];
        setCartItems(items => items.filter(item => item.id !== id));
        try {
            await fetch(`/api/cart?id=${id}`, { method: 'DELETE' });
        } catch (error) {
            console.error('Failed to delete item:', error);
            setCartItems(oldItems);
        }
    };

    const handleCheckout = async () => {
        setCheckoutLoading(true);
        try {
            const res = await fetch('/api/checkout', { method: 'POST' });
            const data = await res.json();

            if (data.success) {
                if (data.orderIds && data.orderIds.length > 0) {
                    router.push(`/orders-received`); // Or tracking page
                } else {
                    router.push('/dashboard');
                }
            } else {
                alert('Checkout failed: ' + data.error);
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Something went wrong during checkout.');
        } finally {
            setCheckoutLoading(false);
        }
    };

    const subtotal = cartItems.reduce((acc, item) => acc + ((item.product?.base_price || 0) * item.quantity), 0);
    const tax = subtotal * 0.18;
    const total = subtotal + tax;

    if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">Loading Cart...</div>;

    return (
        <div className="min-h-screen pb-20 bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden transition-colors duration-300">
            {/* Design System: Grainy Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-white dark:via-zinc-950 to-white dark:to-zinc-950" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 dark:opacity-20 bg-repeat mix-blend-overlay" />
                <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[100px] mix-blend-screen" />
            </div>

            <div className="container mx-auto px-6 py-10 relative z-10">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        className="text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white mb-2 pl-0"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Continue Shopping
                    </Button>
                    <h1 className="text-4xl font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
                        <ShoppingCart className="w-8 h-8 text-blue-600 dark:text-blue-500" />
                        Your Cart
                    </h1>
                </div>

                {cartItems.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-zinc-900/40 rounded-3xl border border-zinc-200 dark:border-white/5 backdrop-blur-md shadow-sm dark:shadow-none">
                        <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">🛒</div>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Your cart is empty</h2>
                        <p className="text-zinc-500 text-lg mb-8">Looks like you haven't added anything yet.</p>
                        <Button onClick={() => router.push('/marketplace')} className="h-12 px-8 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20">
                            Start Shopping
                        </Button>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-12">
                        {/* Cart Items List */}
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map((item, i) => (
                                <div
                                    key={item.id}
                                    
                                    
                                    
                                >
                                    <Card className="bg-white/80 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/5 p-6 backdrop-blur-md hover:border-zinc-300 dark:hover:border-white/10 transition-colors shadow-sm dark:shadow-none">
                                        <div className="flex flex-col md:flex-row gap-6 items-center">
                                            <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-3xl shrink-0 overflow-hidden relative border border-zinc-200 dark:border-white/5">
                                                {item.product?.image_url ? (
                                                    <img src={item.product.image_url} alt={item.product.name} className="object-cover w-full h-full" />
                                                ) : (
                                                    <span>📦</span>
                                                )}
                                            </div>
                                            <div className="flex-1 text-center md:text-left">
                                                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{item.product?.name || 'Unknown Product'}</h3>
                                                <p className="text-sm text-zinc-500">Item ID: {item.product?.id?.slice(0, 8)}</p>
                                                <div className="mt-2 text-blue-600 dark:text-blue-400 font-mono">₹{item.product?.base_price}/unit</div>
                                            </div>

                                            <div className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-950/50 rounded-lg p-2 border border-zinc-200 dark:border-white/5">
                                                <Button
                                                    size="sm" variant="ghost" className="h-8 w-8 text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800"
                                                    onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                                                >-</Button>
                                                <span className="text-zinc-900 dark:text-white font-mono w-8 text-center">{item.quantity}</span>
                                                <Button
                                                    size="sm" variant="ghost" className="h-8 w-8 text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800"
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                >+</Button>
                                            </div>

                                            <div className="text-right min-w-[100px]">
                                                <div className="text-zinc-900 dark:text-white font-bold text-lg">₹{((item.product?.base_price || 0) * item.quantity).toLocaleString()}</div>
                                            </div>

                                            <Button
                                                size="icon" variant="ghost" className="text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                                                onClick={() => removeItem(item.id)}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </Card>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div
                            
                            
                            
                        >
                            <Card className="bg-white/80 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/5 p-8 backdrop-blur-md sticky top-24 shadow-sm dark:shadow-none">
                                <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Order Summary</h2>

                                <div className="space-y-4 text-sm text-zinc-500 dark:text-zinc-400">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span className="text-zinc-900 dark:text-white">₹{subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>GST (18%)</span>
                                        <span className="text-zinc-900 dark:text-white">₹{tax.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Shipping</span>
                                        <span className="text-emerald-600 dark:text-emerald-400">Free</span>
                                    </div>
                                    <Separator className="bg-zinc-200 dark:bg-white/10 my-4" />
                                    <div className="flex justify-between text-lg font-bold text-zinc-900 dark:text-white">
                                        <span>Total</span>
                                        <span>₹{total.toLocaleString()}</span>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleCheckout}
                                    disabled={checkoutLoading || cartItems.length === 0}
                                    className="w-full mt-8 h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02]"
                                >
                                    {checkoutLoading ? "Processing..." : "Secure Checkout"}
                                    {!checkoutLoading && <ArrowRight className="w-5 h-5 ml-2" />}
                                </Button>

                                <p className="text-xs text-zinc-400 text-center mt-4 flex items-center justify-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    Payments protected by Escrow
                                </p>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
