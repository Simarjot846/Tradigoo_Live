import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { buyer_id, seller_id, product_id, quantity, unit_price, total_amount } = body;

        // Validate input
        if (!buyer_id) {
            return NextResponse.json({ error: 'Missing buyer_id' }, { status: 400 });
        }

        // Use Service Role Client to bypass RLS
        const supabase = createServiceClient();

        // 1. Resolve product_id to a valid UUID
        let resolvedProductId = product_id;
        const isProductUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(product_id || '');
        if (!isProductUuid) {
            const { data: dbProduct } = await supabase.from('products').select('id, seller_id').limit(1).maybeSingle();
            if (dbProduct) {
                resolvedProductId = dbProduct.id;
            }
        }

        // 2. Resolve seller_id to a valid UUID
        let resolvedSellerId = seller_id;
        const isSellerUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(seller_id || '');
        if (!isSellerUuid) {
            const { data: dbWholesaler } = await supabase.from('profiles').select('id').eq('role', 'wholesaler').limit(1).maybeSingle();
            if (dbWholesaler) {
                resolvedSellerId = dbWholesaler.id;
            } else {
                resolvedSellerId = buyer_id;
            }
        }

        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

        const { data: order, error } = await supabase
            .from('orders')
            .insert({
                buyer_id,
                seller_id: resolvedSellerId,
                product_id: resolvedProductId,
                quantity: Number(quantity) || 1,
                unit_price: Number(unit_price) || 0,
                total_amount: Number(total_amount) || 0,
                status: 'payment_in_escrow',
                otp: generatedOtp,
                otp_verified: false,
            })
            .select()
            .single();

        if (error) {
            console.error("Server-side Order Create Error:", error);
            return NextResponse.json({ error: error.message, details: error }, { status: 500 });
        }

        return NextResponse.json(order);
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
