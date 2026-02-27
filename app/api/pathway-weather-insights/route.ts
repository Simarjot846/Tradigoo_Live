import { NextResponse } from 'next/server';

const PATHWAY_API = process.env.PATHWAY_API_URL || 'http://localhost:8081';

export async function GET() {
    try {
        const res = await fetch(`${PATHWAY_API}/weather-insights`, { 
            next: { revalidate: 0 },
            signal: AbortSignal.timeout(3000),
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!res.ok) {
            throw new Error("Pathway weather insights API not reachable");
        }

        const data = await res.json();
        return NextResponse.json(data);
        
    } catch (error) {
        console.error('Pathway weather insights error:', error);
        
        // Return comprehensive mock data as fallback
        const mockData = {
            current_weather: {
                city: "Delhi",
                temp: 28.5,
                condition: "Clear",
                demand_multiplier: 1.0,
                humidity: 65,
                wind_speed: 8.5,
                timestamp: new Date().toISOString()
            },
            product_predictions: [
                {
                    product: "Organic Cotton",
                    reason: "Good weather for cotton processing and trade",
                    demand_change: "+15%",
                    trend: "stable",
                    icon: "👕"
                },
                {
                    product: "Fresh Produce",
                    reason: "Optimal conditions for fresh goods",
                    demand_change: "+12%",
                    trend: "stable",
                    icon: "🥬"
                },
                {
                    product: "Grains",
                    reason: "Stable weather supports grain trading",
                    demand_change: "+10%",
                    trend: "stable",
                    icon: "🌾"
                }
            ],
            upcoming_festivals: [
                {
                    name: "Holi",
                    days_until: 15,
                    status: "upcoming",
                    products: ["Colors", "Sweets", "Beverages", "Organic Cotton"],
                    demand_increase: 2.5,
                    description: "Festival of Colors - High demand for organic colors and sweets"
                },
                {
                    name: "Diwali",
                    days_until: 235,
                    status: "upcoming",
                    products: ["Sweets", "Oils", "Decorations", "Electronics"],
                    demand_increase: 3.0,
                    description: "Festival of Lights - Peak demand for sweets and decorative items"
                }
            ],
            insights_summary: "Based on current weather (Clear, 28.5°C), 3 products show increased demand. 2 festivals approaching.",
            timestamp: new Date().toISOString()
        };
        
        return NextResponse.json(mockData);
    }
}

// Enable dynamic rendering for real-time data
export const dynamic = 'force-dynamic';
export const revalidate = 0;
