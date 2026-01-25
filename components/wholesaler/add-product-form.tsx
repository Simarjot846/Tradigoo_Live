'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Loader2, Upload } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function AddProductForm({ onProductAdded }: { onProductAdded: () => void }) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        base_price: '',
        unit: 'kg',
        min_order_quantity: '',
        description: '',
        image_url: ''
    });

    const categories = ['Grains', 'Pulses', 'Oils', 'Spices', 'Sweeteners', 'Beverages', 'Flours'];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const supabase = createClient();

        try {
            const { error } = await supabase.from('products').insert({
                seller_id: user?.id,
                name: formData.name,
                category: formData.category,
                base_price: parseFloat(formData.base_price),
                unit: formData.unit,
                min_order_quantity: parseInt(formData.min_order_quantity),
                description: formData.description,
                is_active: true,
                // Default AI values to be updated by trigger or later analysis
                demand_score: 50,
                demand_level: 'Medium',
                expected_margin: 10,
                supplier_count: 1,
                season_factor: 1,
                region_boost: 1,
                recommendation_reason: 'New arrival'
            });

            if (error) throw error;

            setFormData({ name: '', category: '', base_price: '', unit: 'kg', min_order_quantity: '', description: '', image_url: '' });
            onProductAdded();
            alert('Product added successfully!');
        } catch (error: any) {
            alert('Error adding product: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="p-6 bg-zinc-900/50 border-orange-500/20 backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <PlusCircle className="text-orange-500" />
                List New Product
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-zinc-400">Product Name</Label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="bg-black/20 border-white/10 text-white"
                            placeholder="e.g., Premium Basmati Rice"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-zinc-400">Category</Label>
                        <Select onValueChange={(val) => setFormData({ ...formData, category: val })} required>
                            <SelectTrigger className="bg-black/20 border-white/10 text-white">
                                <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800">
                                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label className="text-zinc-400">Base Price (₹)</Label>
                        <Input
                            type="number"
                            value={formData.base_price}
                            onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                            className="bg-black/20 border-white/10 text-white"
                            placeholder="0.00"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-zinc-400">Unit</Label>
                        <Select defaultValue="kg" onValueChange={(val) => setFormData({ ...formData, unit: val })}>
                            <SelectTrigger className="bg-black/20 border-white/10 text-white">
                                <SelectValue placeholder="Unit" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800">
                                {['kg', 'ltr', 'ton', 'box'].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-zinc-400">MOQ</Label>
                        <Input
                            type="number"
                            value={formData.min_order_quantity}
                            onChange={(e) => setFormData({ ...formData, min_order_quantity: e.target.value })}
                            className="bg-black/20 border-white/10 text-white"
                            placeholder="100"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-zinc-400">Description</Label>
                    <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="bg-black/20 border-white/10 text-white"
                        placeholder="Describe quality, origin, etc."
                    />
                </div>

                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold"
                >
                    {loading ? <Loader2 className="animate-spin mr-2" /> : <Upload className="mr-2" />}
                    Publish Listing
                </Button>
            </form>
        </Card>
    );
}
