"use client";

import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Plus, Package, Search, Filter, MoreHorizontal, ArrowLeft, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { AddProductDialog } from "@/components/inventory/add-product-dialog";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function InventoryPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        if (!user) return;
        const supabase = createClient();
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('seller_id', user.id)
            .order('created_at', { ascending: false });

        if (data) setProducts(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchProducts();
    }, [user]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        const supabase = createClient();
        const { error } = await supabase.from('products').delete().eq('id', id);

        if (!error) {
            toast.success("Product deleted");
            setProducts(prev => prev.filter(p => p.id !== id));
        } else {
            toast.error("Failed to delete");
        }
    };

    return (
        <div className="min-h-screen pb-20 dark:bg-zinc-950 bg-background relative overflow-hidden transition-colors duration-300">
            {/* Design System: Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-300">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-zinc-950 to-zinc-950 hidden dark:block" />
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
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-4xl font-bold text-zinc-900 dark:text-white tracking-tight"
                        >
                            My Products
                        </motion.h1>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-2">Manage your inventory, prices, and stock levels.</p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <AddProductDialog onProductAdded={fetchProducts}>
                            <Button size="lg" className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-transform hover:scale-105">
                                <Plus className="w-5 h-5 mr-2" />
                                Add New Product
                            </Button>
                        </AddProductDialog>
                    </motion.div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-5 h-5 absolute left-3 top-3.5 text-zinc-500" />
                        <Input
                            placeholder="Search by name, SKU, or category..."
                            className="pl-10 h-12 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-600 focus:bg-white dark:focus:bg-black/60 rounded-xl transition-all shadow-sm dark:shadow-none"
                        />
                    </div>
                    <Button variant="outline" className="h-12 px-6 border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/10 rounded-xl shadow-sm dark:shadow-none">
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                    </Button>
                </div>

                {/* Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-white/[0.02] backdrop-blur-md overflow-visible shadow-lg dark:shadow-2xl"
                >
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-white/5">
                                <TableHead className="text-zinc-500 dark:text-zinc-400 font-medium h-14 pl-6">Product Details</TableHead>
                                <TableHead className="text-zinc-500 dark:text-zinc-400 font-medium">Category</TableHead>
                                <TableHead className="text-zinc-500 dark:text-zinc-400 font-medium">Stock Status</TableHead>
                                <TableHead className="text-zinc-500 dark:text-zinc-400 font-medium">Price (B2B)</TableHead>
                                <TableHead className="text-zinc-500 dark:text-zinc-400 font-medium text-right pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12 text-zinc-500">Loading products...</TableCell>
                                </TableRow>
                            ) : products.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-xl">📦</div>
                                            <div className="text-zinc-300 font-medium">No products found</div>
                                            <div className="text-zinc-500 text-sm">Start adding products to your inventory.</div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                products.map((product) => (
                                    <TableRow key={product.id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] border-zinc-100 dark:border-white/5 group transition-colors">
                                        <TableCell className="py-4 pl-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 flex items-center justify-center text-xl overflow-hidden">
                                                    {product.image_url ? (
                                                        <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        "📦"
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-zinc-900 dark:text-white font-medium">{product.name}</div>
                                                    <div className="text-xs text-zinc-500 mt-1">MOQ: {product.min_order_quantity} {product.unit}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-zinc-600 dark:text-zinc-400 capitalize">{product.category || 'General'}</TableCell>
                                        <TableCell>
                                            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 hover:bg-emerald-500/20">
                                                In Stock ({Math.floor(Math.random() * 200) + 50})
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-zinc-900 dark:text-white font-mono">₹{product.base_price?.toFixed(2)}</TableCell>
                                        <TableCell className="text-right pr-6">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-white/10 rounded-full">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-white">
                                                    <DropdownMenuItem className="text-red-400 focus:text-red-300 focus:bg-red-900/20 cursor-pointer" onClick={() => handleDelete(product.id)}>
                                                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </motion.div>
            </div>
        </div>
    );
}
