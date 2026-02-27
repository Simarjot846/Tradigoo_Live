import { NextResponse } from 'next/server';

const PATHWAY_API = process.env.PATHWAY_API_URL || 'http://localhost:8081';

export async function GET() {
    try {
        const res = await fetch(`${PATHWAY_API}/trending-now`, { 
            next: { revalidate: 0 },
            signal: AbortSignal.timeout(3000),
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!res.ok) {
            throw new Error("Pathway trending API not reachable");
        }

        const data = await res.json();
        return NextResponse.json(data);
        
    } catch (error) {
        console.error('Pathway trending error:', error);
        
        // Return mock data as fallback
        const mockData = {
            trending: [
                {
                    product: "Wheat",
                    total_searches: 156,
                    recent_searches: 12,
                    regions: ["Delhi", "Mumbai", "Pune"],
                    trend: "🔥 Hot"
                },
                {
                    product: "Organic Cotton",
                    total_searches: 98,
                    recent_searches: 8,
                    regions: ["Bangalore", "Chennai"],
                    trend: "📈 Rising"
                },
                {
                    product: "Rice",
                    total_searches: 87,
                    recent_searches: 6,
                    regions: ["Kolkata", "Chennai"],
                    trend: "📈 Rising"
                },
                {
                    product: "Pulses",
                    total_searches: 45,
                    recent_searches: 4,
                    regions: ["Delhi"],
                    trend: "👀 Watching"
                }
            ],
            last_update: new Date().toISOString()
        };
        
        return NextResponse.json(mockData);
    }
}

// Enable dynamic rendering for real-time data
export const dynamic = 'force-dynamic';
export const revalidate = 0;
