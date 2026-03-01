import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function getWeatherDescription(code: number) {
    if (code === 0) return 'Clear';
    if (code <= 3) return 'Partly Cloudy';
    if (code <= 48) return 'Foggy';
    if (code <= 55) return 'Drizzle';
    if (code <= 65) return 'Rain';
    if (code <= 75) return 'Snow';
    if (code >= 95) return 'Thunderstorm';
    return 'Clear';
}

function getDemandMultiplier(temp: number, condition: string) {
    if (condition === 'Rain' || condition === 'Snow' || condition === 'Thunderstorm') return 1.6;
    if (temp > 35) return 1.4;
    if (temp < 15) return 1.3;
    if (condition === 'Clear' && temp >= 20 && temp <= 30) return 1.0;
    return 1.1;
}

export async function GET() {
    try {
        // Ludhiana coordinates
        const lat = '30.9010';
        const lon = '75.8573';

        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`, {
            next: { revalidate: 0 },
            signal: AbortSignal.timeout(5000)
        });

        if (!res.ok) throw new Error("Weather API failed");

        const weatherData = await res.json();
        const current = weatherData.current;
        const temp = current.temperature_2m;
        const condition = getWeatherDescription(current.weather_code);
        const demand_multiplier = getDemandMultiplier(temp, condition);

        // Product predictions logic based on Ludhiana weather
        const predictions = [];
        if (temp > 35) {
            predictions.push({ product: "Cotton Fabrics", reason: "Extreme heat drives cotton clothing demand", demand_change: "+45%", trend: "up", icon: "👕" });
            predictions.push({ product: "Cooling Matts", reason: "Heat wave increases demand for cooling products", demand_change: "+40%", trend: "up", icon: "❄️" });
            predictions.push({ product: "Cold Beverages", reason: "High temperatures boost beverage consumption in Ludhiana", demand_change: "+60%", trend: "up", icon: "🥤" });
        } else if (temp < 15) {
            predictions.push({ product: "Wheat", reason: "Cold weather increases demand for wheat-based hot foods", demand_change: "+35%", trend: "up", icon: "🌾" });
            predictions.push({ product: "Spices", reason: "Hot spices in demand for warming foods", demand_change: "+28%", trend: "up", icon: "🌶️" });
            predictions.push({ product: "Oils", reason: "Cooking oils for hot meals increase", demand_change: "+22%", trend: "up", icon: "🛢️" });
        } else if (condition === "Rain" || condition === "Thunderstorm" || condition === "Drizzle") {
            predictions.push({ product: "Pulses", reason: "Rainy weather increases demand for comfort foods", demand_change: "+38%", trend: "up", icon: "🫘" });
            predictions.push({ product: "Raincoats", reason: "Monsoon drives demand for rain gear", demand_change: "+45%", trend: "up", icon: "🧥" });
            predictions.push({ product: "Umbrellas", reason: "Increased rainfall causes umbrella shortage", demand_change: "+50%", trend: "up", icon: "☂️" });
        } else {
            predictions.push({ product: "Organic Cotton", reason: "Good weather for Ludhiana's textile industry", demand_change: "+15%", trend: "stable", icon: "👕" });
            predictions.push({ product: "Fresh Produce", reason: "Optimal conditions for fresh goods in Punjab", demand_change: "+12%", trend: "stable", icon: "🥬" });
            predictions.push({ product: "Grains", reason: "Stable weather supports Ludhiana grain trading", demand_change: "+10%", trend: "stable", icon: "🌾" });
        }

        const today = new Date();
        const upcoming_festivals = [
            {
                name: "Holi",
                days_until: Math.max(0, Math.ceil((new Date(today.getFullYear(), 2, 3).getTime() - today.getTime()) / (1000 * 3600 * 24))),
                status: "upcoming",
                products: ["Colors", "Sweets", "Beverages", "Organic Cotton"],
                demand_increase: 2.5,
                description: "Festival of Colors - High demand in Ludhiana markets"
            }
        ];

        return NextResponse.json({
            current_weather: {
                city: "Ludhiana, PB",
                temp: temp,
                condition: condition,
                demand_multiplier: demand_multiplier,
                humidity: current.relative_humidity_2m,
                wind_speed: current.wind_speed_10m,
                timestamp: new Date().toISOString()
            },
            product_predictions: predictions,
            upcoming_festivals: upcoming_festivals,
            insights_summary: `Live streaming from Ludhiana: ${condition}, ${temp}°C. ${predictions.length} products show increased regional demand.`,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Pathway weather insights error:', error);
        return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 });
    }
}
