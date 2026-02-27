import { NextResponse } from 'next/server';

const PATHWAY_API = process.env.PATHWAY_API_URL || 'http://localhost:8081';

export async function GET() {
    try {
        const res = await fetch(`${PATHWAY_API}/seasonal-trends`, { 
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
        return NextResponse.json(data);
        
    } catch (error) {
        console.error('Pathway seasonal trends error:', error);
        
        // Return mock data as fallback
        const mockData = [
            { product: "Wheat", demand: 1200, trend: "up", change_pct: 12.0 },
            { product: "Rice", demand: 1100, trend: "up", change_pct: 8.5 },
            { product: "Organic Cotton", demand: 1400, trend: "up", change_pct: 15.2 },
            { product: "Pulses", demand: 1050, trend: "stable", change_pct: 3.1 }
        ];
        return NextResponse.json(mockData);
    }
}

// Enable dynamic rendering for real-time data
export const dynamic = 'force-dynamic';
export const revalidate = 0;
