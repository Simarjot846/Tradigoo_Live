import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { buyer_id, seller_id, product_id, quantity, unit_price, total_amount } = body;

        // Validate input
        if (!buyer_id || !seller_id || !product_id) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Use Service Role Client to bypass RLS
        const supabase = createServiceClient();

        const { data: order, error } = await supabase
            .from('orders')
            .insert({
                buyer_id,
                seller_id,
                product_id,
                quantity,
                unit_price,
                total_amount,
                status: 'payment_in_escrow',
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
