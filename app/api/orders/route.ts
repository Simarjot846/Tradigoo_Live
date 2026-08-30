import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role'); // 'buyer' | 'wholesaler'
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const supabase = createServiceClient();
    let query = supabase
      .from('orders')
      .select('*, product:products!product_id(name, image_url, unit), seller:profiles!seller_id(business_name), buyer:profiles!buyer_id(business_name)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (userId) {
      if (role === 'wholesaler') {
        query = query.eq('seller_id', userId);
      } else if (role === 'buyer') {
        query = query.eq('buyer_id', userId);
      }
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('Orders API error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
