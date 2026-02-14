import pathway as pw
import pandas as pd
import json
import os

# Configuration
INPUT_FILE = "market_data.csv"
OUTPUT_JSON = "../public/live_market.json"

def run_processing():
    # 1. Input: Read from CSV in real-time
    # mode="streaming" treats the file as a stream (tail -f)
    t = pw.io.csv.read(
        INPUT_FILE,
        schema=pw.schema_from_csv(INPUT_FILE),
        mode="streaming"
    )

    # 2. Processing:
    # Filter out bad data if any
    filtered = t.filter(t.price > 0)

    # Windowing: Calculate 10-second moving average per commodity/mandi
    # In a real app, this might be 1-minute or 1-hour
    windowed = filtered.window(
        pw.temporal.sliding(length=pw.temporal.duration("10s"), hop=pw.temporal.duration("2s")),
        behavior=pw.temporal.exactly_once_behavior(),
    ).groupby(
        t.commodity, t.mandi
    ).reduce(
        avg_price=pw.reducers.avg(t.price),
        max_price=pw.reducers.max(t.price),
        total_volume=pw.reducers.sum(t.volume),
        last_update=pw.reducers.max(t.timestamp)
    )
    
    # 3. Output: Write to a JSON file that the frontend can poll
    # We use a custom output to write the latest state to a JSON file
    # Pathway's `pw.io.json.write` writes a stream of updates (append-only),
    # but for a simple frontend poller, we often want the "current state" of the window.
    # For simplicity in this hackathon, we'll use a simple CSV output for the processed data
    # and a separate small adapter to convert it to JSON, OR just let Pathway write CSV 
    # and have the frontend read CSV. 
    # Let's try writing to JSON lines with Pathway and see if frontend handles it.
    # A better hackathon approach: Write to a static JSON file using a python output connector.

    class JSONFileWriter(pw.io.python.ConnectorSubject):
        def next(self, row, time, is_added):
             # This is a simplification. In a real generic connector, we'd handle updates.
             # For this sliding window, we essentially get a stream of window results.
             # We will just write the latest batch to the file.
             pass

    # Simplified Approach for Hackathon:
    # Use `pw.io.csv.write` to a file, and frontend reads that.
    # Or to ensure "up-to-dateness", we can use a simpler reduction.
    
    # Let's just output the stream to a file.
    # Note: Pathway outputs are streams. 
    
    pw.io.json.write(windowed, filename=OUTPUT_JSON, mode="overwrite")

    print("Pathway processing started. Writing to", OUTPUT_JSON)
    pw.run()

if __name__ == "__main__":
    # Ensure input file exists
    if not os.path.exists(INPUT_FILE):
        with open(INPUT_FILE, "w") as f:
            f.write("timestamp,commodity,mandi,price,volume\n")
            
    run_processing()
