"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";

export function AddProductDialog({ children, onProductAdded }: { children: React.ReactNode, onProductAdded?: () => void }) {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        base_price: "",
        min_order_quantity: "",
        unit: "piece",
        description: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        const supabase = createClient();

        try {
            const price = parseFloat(formData.base_price) || 0;
            const moq = parseInt(formData.min_order_quantity) || 1;

            const { error } = await supabase.from('products').insert([{
                name: formData.name,
                category: formData.category,
                base_price: price,
                min_order_quantity: moq,
                unit: formData.unit,
                description: formData.description,
                image_url: null, // Placeholder for now
                is_active: true,
                demand_score: Math.floor(Math.random() * 100), // Mock score
                seller_id: user.id
            }]);

            if (error) throw error;

            setOpen(false);
            setFormData({ name: "", category: "", base_price: "", min_order_quantity: "", unit: "piece", description: "" });
            if (onProductAdded) onProductAdded();
            toast.success("Product added successfully!");

        } catch (error: any) {
            console.error(error);
            toast.error("Failed to add product: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs text-zinc-400 font-medium ml-1">Product Name</label>
                            <Input
                                placeholder="e.g. Cotton Shirt"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="bg-zinc-900 border-zinc-800 focus:border-blue-500/50 transition-colors"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-zinc-400 font-medium ml-1">Price (₹)</label>
                            <Input
                                placeholder="0.00"
                                type="number"
                                value={formData.base_price}
                                onChange={e => setFormData({ ...formData, base_price: e.target.value })}
                                className="bg-zinc-900 border-zinc-800 focus:border-blue-500/50 transition-colors"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs text-zinc-400 font-medium ml-1">Category</label>
                            <Input
                                placeholder="e.g. Apparel"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                className="bg-zinc-900 border-zinc-800 focus:border-blue-500/50 transition-colors"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-zinc-400 font-medium ml-1">Min Qty</label>
                            <Input
                                placeholder="1"
                                type="number"
                                value={formData.min_order_quantity}
                                onChange={e => setFormData({ ...formData, min_order_quantity: e.target.value })}
                                className="bg-zinc-900 border-zinc-800 focus:border-blue-500/50 transition-colors"
                                required
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 mt-2" disabled={loading}>
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {loading ? "Saving..." : "Save Product"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
