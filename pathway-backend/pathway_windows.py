"""
Pathway Real-Time Backend - Windows Compatible Version
This version provides the same API endpoints without requiring the Pathway library
"""

import asyncio
import random
import time
from datetime import datetime, timedelta
from typing import Dict, List
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

app = FastAPI(title="Pathway Real-Time API (Windows Compatible)")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "your_openweather_api_key_here")
CITIES = ["Delhi", "Mumbai", "Chennai", "Kolkata", "Bangalore", "Pune"]

# In-memory caches
weather_cache: Dict = {}
live_stats = {
    "total_carbon_saved": 450,
    "active_orders": 45,
    "green_score_avg": 78
}
search_history: List = []
trending_products: Dict = {}
product_search_counts: Dict = {}

# Product catalog
PRODUCTS = [
    "Organic Wheat", "Organic Rice", "Organic Cotton", "Jute Bags",
    "Bamboo Toothbrushes", "Organic Pulses", "Organic Spices",
    "Recycled Paper", "Organic Tea", "Organic Coffee"
]

# Indian Festivals
FESTIVALS = [
    {"name": "Holi", "date": "2026-03-14", "demand_increase": 150, "products": ["Colors", "Sweets", "Organic Snacks"]},
    {"name": "Diwali", "date": "2026-10-19", "demand_increase": 200, "products": ["Diyas", "Sweets", "Decorations"]},
    {"name": "Eid", "date": "2026-04-03", "demand_increase": 120, "products": ["Dates", "Sweets", "Fabrics"]},
    {"name": "Raksha Bandhan", "date": "2026-08-09", "demand_increase": 100, "products": ["Rakhis", "Sweets", "Gifts"]},
    {"name": "Navratri", "date": "2026-10-10", "demand_increase": 130, "products": ["Traditional Wear", "Decorations"]},
    {"name": "Pongal", "date": "2026-01-14", "demand_increase": 110, "products": ["Rice", "Sugarcane", "Turmeric"]}
]

def fetch_live_weather(city: str) -> Dict:
    """Fetch live weather from OpenWeatherMap API"""
    try:
        url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={OPENWEATHER_API_KEY}&units=metric"
        response = requests.get(url, timeout=5)
        data = response.json()
        
        return {
            "city": city,
            "temperature": round(data["main"]["temp"], 1),
            "condition": data["weather"][0]["main"],
            "description": data["weather"][0]["description"],
            "humidity": data["main"]["humidity"],
            "wind_speed": data["wind"]["speed"]
        }
    except Exception as e:
        # Fallback mock data
        return {
            "city": city,
            "temperature": round(random.uniform(20, 35), 1),
            "condition": random.choice(["Clear", "Clouds", "Rain"]),
            "description": "mock data",
            "humidity": random.randint(40, 80),
            "wind_speed": round(random.uniform(2, 10), 1)
        }

def calculate_demand_multiplier(weather: Dict) -> float:
    """Calculate demand multiplier based on weather"""
    temp = weather["temperature"]
    condition = weather["condition"]
    
    if condition == "Rain":
        return 1.6
    elif temp > 35:
        return 1.4
    elif temp < 15:
        return 1.3
    elif condition == "Clear":
        return 1.0
    else:
        return 1.1

def get_weather_products(weather: Dict) -> List[str]:
    """Get products that will rise based on weather"""
    temp = weather["temperature"]
    condition = weather["condition"]
    
    if condition == "Rain":
        return ["Umbrellas", "Raincoats", "Waterproof Bags"]
    elif temp > 35:
        return ["Cooling Products", "Cotton Fabrics", "Cold Beverages"]
    elif temp < 15:
        return ["Warm Clothing", "Heaters", "Hot Beverages"]
    else:
        return ["Organic Wheat", "Organic Rice", "Organic Pulses"]

# Background task to update weather
async def update_weather_continuously():
    """Update weather data every 5 minutes"""
    while True:
        try:
            for city in CITIES:
                weather_cache[city] = fetch_live_weather(city)
            print(f"✓ Weather updated at {datetime.now().strftime('%H:%M:%S')}")
        except Exception as e:
            print(f"Weather update error: {e}")
        await asyncio.sleep(300)  # 5 minutes

# Background task to update statistics
async def update_live_stats():
    """Update live statistics every 2 seconds"""
    while True:
        try:
            live_stats["total_carbon_saved"] += random.randint(1, 5)
            live_stats["active_orders"] = 45 + (live_stats["total_carbon_saved"] % 20)
            live_stats["green_score_avg"] = 75 + random.randint(0, 10)
        except Exception as e:
            print(f"Stats update error: {e}")
        await asyncio.sleep(2)

# Background task to generate searches
async def generate_searches():
    """Generate realistic search patterns"""
    while True:
        try:
            # Generate 2-5 searches per second
            for _ in range(random.randint(2, 5)):
                product = random.choice(PRODUCTS)
                city = random.choice(CITIES)
                
                search_entry = {
                    "product": product,
                    "city": city,
                    "timestamp": datetime.now().isoformat()
                }
                
                search_history.append(search_entry)
                if len(search_history) > 100:
                    search_history.pop(0)
                
                # Update trending
                product_search_counts[product] = product_search_counts.get(product, 0) + 1
                
            await asyncio.sleep(1)
        except Exception as e:
            print(f"Search generation error: {e}")

# Background task for hot products rotation
async def rotate_hot_products():
    """Rotate hot products every 30 seconds"""
    while True:
        try:
            # Pick 2-3 products to be "hot"
            hot_count = random.randint(2, 3)
            hot_products = random.sample(PRODUCTS, hot_count)
            
            # Boost their counts
            for product in hot_products:
                product_search_counts[product] = product_search_counts.get(product, 0) + random.randint(10, 20)
            
            print(f"🔥 Hot products: {', '.join(hot_products)}")
            await asyncio.sleep(30)
        except Exception as e:
            print(f"Hot products rotation error: {e}")

# Background task for trending decay
async def decay_trending():
    """Reduce trending counts every 2 minutes"""
    while True:
        try:
            await asyncio.sleep(120)
            for product in list(product_search_counts.keys()):
                product_search_counts[product] = int(product_search_counts[product] * 0.5)
                if product_search_counts[product] < 1:
                    del product_search_counts[product]
            print("📉 Trending counts decayed")
        except Exception as e:
            print(f"Decay error: {e}")

@app.on_event("startup")
async def startup_event():
    """Initialize data and start background tasks"""
    print("\n" + "="*60)
    print("🚀 Pathway Real-Time Pipeline Started (Windows Compatible)")
    print("="*60)
    
    # Initialize weather cache
    for city in CITIES:
        weather_cache[city] = fetch_live_weather(city)
    
    # Start background tasks
    asyncio.create_task(update_weather_continuously())
    asyncio.create_task(update_live_stats())
    asyncio.create_task(generate_searches())
    asyncio.create_task(rotate_hot_products())
    asyncio.create_task(decay_trending())
    
    print("✓ Weather streaming active")
    print("✓ Live statistics active")
    print("✓ Search trends streaming active")
    print("✓ Product search tracking active")
    print("✓ Dynamic trending rotation active")
    print("="*60 + "\n")

@app.get("/")
def root():
    return {
        "message": "Pathway Real-Time API (Windows Compatible)",
        "status": "running",
        "endpoints": [
            "/live-weather",
            "/weather-insights",
            "/global-stats",
            "/live-searches",
            "/trending-now",
            "/seasonal-trends",
            "/top-wholesalers"
        ]
    }

@app.get("/live-weather")
def get_live_weather():
    """Get current weather for all major cities"""
    return {
        "cities": list(weather_cache.values()),
        "last_updated": datetime.now().isoformat()
    }

@app.get("/live-weather/{city}")
def get_city_weather(city: str):
    """Get weather for specific city"""
    weather = weather_cache.get(city, {})
    if not weather:
        return {"error": "City not found"}
    
    return {
        **weather,
        "demand_multiplier": calculate_demand_multiplier(weather),
        "rising_products": get_weather_products(weather)
    }

@app.get("/weather-insights")
def get_weather_insights():
    """Get comprehensive weather insights"""
    insights = []
    
    for city, weather in weather_cache.items():
        insights.append({
            "city": city,
            "temperature": weather["temperature"],
            "condition": weather["condition"],
            "demand_multiplier": calculate_demand_multiplier(weather),
            "rising_products": get_weather_products(weather)
        })
    
    # Add upcoming festivals
    upcoming_festivals = []
    today = datetime.now()
    
    for festival in FESTIVALS:
        festival_date = datetime.strptime(festival["date"], "%Y-%m-%d")
        days_until = (festival_date - today).days
        
        if 0 <= days_until <= 60:
            upcoming_festivals.append({
                **festival,
                "days_until": days_until
            })
    
    return {
        "weather": insights,
        "festivals": upcoming_festivals,
        "last_updated": datetime.now().isoformat()
    }

@app.get("/global-stats")
def get_global_stats():
    """Get live global statistics"""
    return [{
        "total_carbon_saved": live_stats["total_carbon_saved"],
        "active_orders": live_stats["active_orders"],
        "green_score_avg": live_stats["green_score_avg"],
        "timestamp": datetime.now().isoformat()
    }]

@app.get("/live-searches")
def get_live_searches():
    """Get real-time search stream"""
    return {
        "searches": search_history[-20:],  # Last 20 searches
        "total_searches": len(search_history),
        "timestamp": datetime.now().isoformat()
    }

@app.get("/trending-now")
def get_trending_now():
    """Get what's trending right now"""
    sorted_products = sorted(
        product_search_counts.items(),
        key=lambda x: x[1],
        reverse=True
    )[:5]
    
    trending = []
    for product, count in sorted_products:
        trending.append({
            "product": product,
            "searches": count,
            "velocity": f"+{random.randint(5, 25)}%"
        })
    
    return {
        "trending": trending,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/seasonal-trends")
def get_seasonal_trends():
    """Get seasonal demand trends"""
    trends = []
    
    for product in PRODUCTS[:5]:
        # Get weather influence
        avg_temp = sum(w.get("temperature", 25) for w in weather_cache.values()) / len(weather_cache)
        
        if "Cotton" in product and avg_temp > 30:
            trend = "up"
            change = random.randint(15, 30)
        elif "Wheat" in product or "Rice" in product:
            trend = "stable"
            change = random.randint(-5, 10)
        else:
            trend = random.choice(["up", "down", "stable"])
            change = random.randint(-10, 20)
        
        trends.append({
            "product": product,
            "trend": trend,
            "change_percent": change,
            "demand_level": random.randint(60, 95)
        })
    
    return trends

@app.get("/top-wholesalers")
def get_top_wholesalers():
    """Get top wholesalers by product"""
    return [
        {"product": "Organic Wheat", "top_wholesaler": "EcoFarms Punjab", "purchases": 120 + random.randint(0, 20)},
        {"product": "Organic Cotton", "top_wholesaler": "Green Cotton Co.", "purchases": 95 + random.randint(0, 15)},
        {"product": "Jute Bags", "top_wholesaler": "Bengal Jute Co.", "purchases": 85 + random.randint(0, 10)},
        {"product": "Bamboo Products", "top_wholesaler": "Bamboo Innovations", "purchases": 70 + random.randint(0, 10)},
        {"product": "Organic Spices", "top_wholesaler": "Kerala Spice Hub", "purchases": 65 + random.randint(0, 8)}
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8081)
