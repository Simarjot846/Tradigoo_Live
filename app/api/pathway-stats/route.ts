import { NextResponse } from 'next/server';

const PATHWAY_API = process.env.PATHWAY_API_URL || 'http://localhost:8081';

export async function GET() {
    try {
        const res = await fetch(`${PATHWAY_API}/global-stats`, { 
            next: { revalidate: 0 },
            signal: AbortSignal.timeout(3000),
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!res.ok) {
            throw new Error("Pathway not reachable");
        }

        const data = await res.json();
        
        // Ensure data is in array format
        if (Array.isArray(data)) {
            return NextResponse.json(data);
        } else {
            return NextResponse.json([data]);
        }
    } catch (error) {
        console.error('Pathway stats error:', error);
        
        // Return mock data as fallback
        const mockData = [{
            total_carbon_saved: Math.floor(400 + Math.random() * 100),
            active_orders: Math.floor(50 + Math.random() * 30),
            green_score_avg: Math.floor(85 + Math.random() * 10),
            timestamp: new Date().toISOString()
        }];
        return NextResponse.json(mockData);
    }
}

// Enable dynamic rendering for real-time data
export const dynamic = 'force-dynamic';
export const revalidate = 0;
