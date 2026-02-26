import json
import os
import uvicorn
from starlette.applications import Starlette
from starlette.responses import JSONResponse
from starlette.routing import Route
import threading
import time
from starlette.middleware.cors import CORSMiddleware
from collections import Counter

DATA_FILE = "data/wholesalers_stream.jsonl"
WEATHER_FILE = "data/weather_stream.jsonl"
SEARCH_FILE = "data/searches_stream.jsonl"
PURCHASE_FILE = "data/purchases_stream.jsonl"

def read_jsonl(filepath):
    if not os.path.exists(filepath):
        # Create if doesn't exist to avoid errors
        with open(filepath, 'w') as f:
            pass
        return []
    records = []
    with open(filepath, "r") as f:
        for line in f:
            if line.strip():
                try:
                    records.append(json.loads(line))
                except:
                    pass
    return records

async def get_global_stats(request):
    records = read_jsonl(DATA_FILE)
    total_carbon = 0
    total_waste = 0
    total_green = 0
    for r in records:
        c = r.get("carbon_saved_kg", 0)
        w = r.get("waste_reduced_kg", 0)
        total_carbon += c
        total_waste += w
        total_green += (c * 1.5) + (w * 2.0)
    
    return JSONResponse([{
        "total_carbon_saved": total_carbon,
        "total_waste_reduced": total_waste,
        "total_green_score": total_green
    }])

async def get_top_wholesalers(request):
    # Returns top wholesalers per product based on purchases
    records = read_jsonl(PURCHASE_FILE)
    if not records:
        return JSONResponse([
            {"product": "Organic Wheat", "top_wholesaler": "EcoFarms Punjab", "purchases": 120},
            {"product": "Jute Bags", "top_wholesaler": "Bengal Jute Co.", "purchases": 85}
        ])
    
    counts = {}
    for r in records:
        prod = r.get("product_name", "Unknown")
        ws = r.get("wholesaler_name", "Unknown")
        key = (prod, ws)
        counts[key] = counts.get(key, 0) + r.get("quantity", 1)
    
    # Sort and format
    sorted_counts = sorted(counts.items(), key=lambda x: x[1], reverse=True)[:5]
    res = [{"product": k[0], "top_wholesaler": k[1], "purchases": v} for k, v in sorted_counts]
    return JSONResponse(res)

async def get_seasonal_trends(request):
    import urllib.request
    
    # Coordinates: Delhi, Mumbai, Punjab(Chandigarh)
    url = "https://api.open-meteo.com/v1/forecast?latitude=28.61,19.07,30.73&longitude=77.20,72.87,76.78&current_weather=true"
    
    def decode_wmo(code):
        if code == 0: return "Clear sky"
        if code in [1, 2, 3]: return "Partly cloudy"
        if code in [45, 48]: return "Fog"
        if code in [51, 53, 55, 56, 57]: return "Drizzle"
        if code in [61, 63, 65, 66, 67, 80, 81, 82]: return "Rain"
        if code in [71, 73, 75, 77, 85, 86]: return "Snow"
        if code in [95, 96, 99]: return "Thunderstorm"
        return "Clear"
        
    def get_trend_for_weather(desc, temp):
        if temp >= 32: return "Cooling Systems & Cottons"
        elif "Rain" in desc or "Drizzle" in desc or "Thunderstorm" in desc: return "Umbrellas & Waterproof Tarps"
        elif temp < 15: return "Winter Blankets & Heaters"
        return "Everyday Organics & Essentials"
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode())
            
        w_delhi = data[0]['current_weather']
        w_mumbai = data[1]['current_weather']
        w_punjab = data[2]['current_weather']
        
        weather_delhi = f"{decode_wmo(w_delhi['weathercode'])} ({w_delhi['temperature']}°C)"
        weather_mumbai = f"{decode_wmo(w_mumbai['weathercode'])} ({w_mumbai['temperature']}°C)"
        weather_punjab = f"{decode_wmo(w_punjab['weathercode'])} ({w_punjab['temperature']}°C)"
        
        trend_delhi = get_trend_for_weather(decode_wmo(w_delhi['weathercode']), w_delhi['temperature'])
        trend_mumbai = get_trend_for_weather(decode_wmo(w_mumbai['weathercode']), w_mumbai['temperature'])
        trend_punjab = get_trend_for_weather(decode_wmo(w_punjab['weathercode']), w_punjab['temperature'])
        
    except Exception as e:
        weather_delhi = "Sunny (32°C)"
        weather_mumbai = "Humid (29°C)"
        weather_punjab = "Clear (25°C)"
        trend_delhi = "Cooling Systems & Cottons"
        trend_mumbai = "Everyday Organics & Essentials"
        trend_punjab = "Everyday Organics & Essentials"
        
    return JSONResponse([
        {"region": "Delhi NCR", "weather": weather_delhi, "festival": "Upcoming: Holi", "trending": trend_delhi},
        {"region": "Mumbai", "weather": weather_mumbai, "festival": "None", "trending": trend_mumbai},
        {"region": "Punjab", "weather": weather_punjab, "festival": "Spring Prep", "trending": trend_punjab}
    ])

async def get_search_trends(request):
    records = read_jsonl(SEARCH_FILE)
    if not records:
        return JSONResponse([
            {"query": "organic cotton", "searches": 450, "trend": "+12%"},
            {"quantity": "bamboo toothbrushes", "searches": 320, "trend": "+8%"}
        ])
        
    counts = Counter()
    for r in records:
        counts[r.get("query", "Unknown")] += 1
        
    res = [{"query": k, "searches": v * 10, "trend": "+15%"} for k, v in counts.most_common(5)]
    return JSONResponse(res)

async def retrieve(request):
    try:
        body = await request.json()
        query = body.get("query", "")
    except:
        query = ""
    
    records = read_jsonl(DATA_FILE)
    
    # Very basic TF-IDF mock logic for local python fallback
    query_words = set(query.lower().split()) if query else set()
    
    def score_record(r):
        text_content = f"{r.get('product_name', '')} {r.get('description', '')}".lower()
        match_score = sum(1 for w in query_words if w in text_content)
        green_score = (r.get("carbon_saved_kg", 0) * 1.5) + (r.get("waste_reduced_kg", 0) * 2.0)
        return (match_score, green_score) # Sort by exact text match first, then by green score
        
    records.sort(key=score_record, reverse=True)
    
    results = []
    for r in records[:5]: # Return top 5 matches
        gs = (r.get("carbon_saved_kg", 0) * 1.5) + (r.get("waste_reduced_kg", 0) * 2.0)
        text = f"Product: {r.get('product_name')} | Details: {r.get('description')} | Green Score: {gs} | Price: ${r.get('price')} | Rating: {r.get('rating')} | Wholesaler ID: {r.get('wholesaler_id')} | Region: {r.get('region')}"
        results.append({"text": text, "metadata": r})
    
    return JSONResponse(results)

app8081 = Starlette(routes=[
    Route("/global-stats", get_global_stats),
    Route("/top-wholesalers", get_top_wholesalers),
    Route("/trending-seasonal", get_seasonal_trends),
    Route("/search-trends", get_search_trends)
])
app8081.add_middleware(CORSMiddleware, allow_origins=["*"])

app8080 = Starlette(routes=[Route("/v1/retrieve", retrieve, methods=["POST"])])
app8080.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

def run_8080():
    uvicorn.run(app8080, host="0.0.0.0", port=8080, log_level="warning")

def run_8081():
    uvicorn.run(app8081, host="0.0.0.0", port=8081, log_level="warning")

if __name__ == "__main__":
    t1 = threading.Thread(target=run_8080, daemon=True)
    t2 = threading.Thread(target=run_8081, daemon=True)
    t1.start()
    t2.start()
    
    print("=========================================================")
    print(">>> PATHWAY SIMULATION ENGINE RUNNING (Hackathon Mode)")
    print("   - Vector RAG Embeddings Server running on port 8080")
    print("   - Live Market Intelligence Server running on port 8081")
    print("=========================================================")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        pass
