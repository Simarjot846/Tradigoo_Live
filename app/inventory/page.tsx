import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import InventoryContent from "@/components/inventory/inventory-content";

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

    return <InventoryContent initialProducts={products || []} />;
}
