import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const res = await fetch('http://localhost:8081/top-wholesalers', { 
            next: { revalidate: 0 },
            signal: AbortSignal.timeout(2000) // 2 second timeout
        });
        if (!res.ok) {
            throw new Error("Pathway not reachable");
        }
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        // Return mock data as fallback
        const mockData = [
            { product: "Organic Cotton", top_wholesaler: "EcoFabrics Ltd", purchases: 156 },
            { product: "Wheat", top_wholesaler: "GreenHarvest Traders", purchases: 142 },
            { product: "Rice", top_wholesaler: "Sustainable Grains Co", purchases: 128 },
            { product: "Pulses", top_wholesaler: "NaturePulse Suppliers", purchases: 98 }
        ];
        return NextResponse.json(mockData);
    }
}
