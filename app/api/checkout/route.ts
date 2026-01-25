import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch Cart Items
    const { data: cartItems, error: cartError } = await supabase
        .from('cart_items')
        .select(`
      id,
      quantity,
      product:products (
        id,
        base_price,
        seller_id
      )
    `)
        .eq('user_id', user.id)
        .returns<any[]>(); // Use generic return type to bypass strict typing on joins for now

    if (cartError || !cartItems || cartItems.length === 0) {
        return NextResponse.json({ error: 'Cart is empty or could not be fetched' }, { status: 400 });
    }

    const createdOrderIds = [];

    // 2. Create Orders (Group processing or individual?)
    // For simplicity, we create one order per cart item because the system is designed that way currently,
    // or we could group by seller. Let's do one order per different product/seller combination to match the Amazon style separate shipments loop.
    // Actually, 'orders' table in schema has 'product_id', so it seems to be 1 order = 1 product line item.
    // So we will iterate and create an order for each item.

    for (const item of cartItems) {
        // calculate total
        const unitPrice = item.product.base_price;
        const amount = unitPrice * item.quantity;

        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                buyer_id: user.id,
                seller_id: item.product.seller_id,
                product_id: item.product.id,
                quantity: item.quantity,
                unit_price: unitPrice,
                total_amount: amount,
                status: 'ORDER_CREATED', // Initial state
                otp_verified: false
            })
            .select()
            .single();

        if (orderError) {
            console.error("Error creating order for item", item.id, orderError);
            continue; // Try next item? Or fail all? Let's try to proceed.
        }

        if (order) {
            createdOrderIds.push(order.id);
        }
    }

    // 3. Clear Cart
    if (createdOrderIds.length > 0) {
        await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', user.id);
    } else {
        return NextResponse.json({ error: 'Failed to create any orders' }, { status: 500 });
    }

    return NextResponse.json({ success: true, orderIds: createdOrderIds });
}
