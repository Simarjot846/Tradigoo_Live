import csv
import time
import random
import os
import datetime

# Configuration
OUTPUT_FILE = "market_data.csv"
COMMODITIES = ["Rice", "Wheat", "Tomato", "Potato", "Onion"]
MANDIS = ["Azadpur", "Okhla", "Ghazipur", "Keshopur", "Narela"]

def generate_data():
    """Generates a single row of market data."""
    commodity = random.choice(COMMODITIES)
    mandi = random.choice(MANDIS)
    price = round(random.uniform(20, 100), 2)
    volume = random.randint(100, 1000)
    timestamp = datetime.datetime.now().isoformat()
    return [timestamp, commodity, mandi, price, volume]

def main():
    # Create the file with headers if it doesn't exist
    if not os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE, "w", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["timestamp", "commodity", "mandi", "price", "volume"])

    print(f"Streaming data to {OUTPUT_FILE}...")
    try:
        while True:
            data = generate_data()
            with open(OUTPUT_FILE, "a", newline="") as f:
                writer = csv.writer(f)
                writer.writerow(data)
            print(f"Written: {data}")
            time.sleep(1) # Simulate real-time data arrival
    except KeyboardInterrupt:
        print("\nStream stopped.")

if __name__ == "__main__":
    main()
