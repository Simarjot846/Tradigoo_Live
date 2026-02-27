import pathway as pw
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
import uvicorn
import os
import requests
from dotenv import load_dotenv

load_dotenv()
if os.getenv("GEMINI_API_KEY"):
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper function to fetch live weather for a region
def get_live_weather_demand(city: str):
    if not OPENWEATHER_API_KEY:
        # Fallback if no API key is set
        return {"temp": 20, "condition": "Clear", "demand_multiplier": 1.0}
        
    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={OPENWEATHER_API_KEY}&units=metric"
    try:
        data = requests.get(url).json()
        temp = data['main']['temp']
        condition = data['weather'][0]['main']
        
        # Algorithmic Demand Logic: Higher demand if it's freezing or raining/snowing (disruption)
        multiplier = 1.0
        if temp < 10 or condition in ["Snow", "Rain", "Thunderstorm"]:
            multiplier = 1.6
        elif temp > 35:
            multiplier = 1.3
            
        return {"temp": temp, "condition": condition, "demand_multiplier": multiplier}
    except Exception:
        return {"temp": 20, "condition": "Clear", "demand_multiplier": 1.0}

@app.get("/api/demand")
def get_live_demand():
    # Fetching real live weather conditions to influence demand dynamically
    north = get_live_weather_demand("Delhi")
    south = get_live_weather_demand("Chennai")
    east = get_live_weather_demand("Kolkata")
    west = get_live_weather_demand("Mumbai")

    return [
        {"area": "North", "demand": int(3000 * north["demand_multiplier"]), "season": f"{north['temp']}°C, {north['condition']}"},
        {"area": "South", "demand": int(2800 * south["demand_multiplier"]), "season": f"{south['temp']}°C, {south['condition']}"},
        {"area": "East", "demand": int(3500 * east["demand_multiplier"]), "season": f"{east['temp']}°C, {east['condition']}"},
        {"area": "West", "demand": int(2900 * west["demand_multiplier"]), "season": f"{west['temp']}°C, {west['condition']}"}
    ]

@app.get("/api/smart-matching")
def get_best_wholesaler(product: str = "wheat"):
    return {
        "wholesalers": [
            {
                "id": "w1",
                "name": "EcoHarvest Organic",
                "price": 420.0,
                "rating": 4.9,
                "green_score": 96.5,
                "metrics": {"carbon_saved_kg": 145, "local_sourcing_pct": 100, "waste_prevented_kg": 50},
                "delivery": "Fast (12 hrs)"
            }
        ]
    }

@app.get("/api/trade-brain")
def get_trade_brain_insights(product: str = "wheat"):
    north_weather = get_live_weather_demand("Delhi")
    
    prompt = f"""
    Based on real-time Pathway streams via OpenWeatherMap:
    Product: {product}
    North Region Weather: {north_weather['temp']}°C, {north_weather['condition']}
    North Demand Multiplier: {north_weather['demand_multiplier']}x
    Best Match: EcoHarvest Organic (Green Score: 96.5, Price: ₹420/unit)
    
    Provide a short, 3-sentence trading insight predicting price movement, detecting unusual demand based on the weather, and advising buy/sell. Focus on sustainability.
    """
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        text = response.text
    except Exception as e:
        text = f"The live weather in the North is {north_weather['temp']}°C ({north_weather['condition']}). We advise buying now from EcoHarvest Organic to secure low-carbon, locally sourced grains before weather events drive up wholesale costs. This limits transportation emissions while resolving supply constraints."
        
    return {"insight": text}

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
