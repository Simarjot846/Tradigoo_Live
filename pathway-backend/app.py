import pathway as pw
from pathway.xpacks.llm.vector_store import VectorStoreServer
from pathway.xpacks.llm.embedders import GeminiEmbedder
import os
import json
from dotenv import load_dotenv

load_dotenv()
os.environ["GEMINI_API_KEY"] = os.getenv("GEMINI_API_KEY", "YOUR_GEMINI_API_KEY")

# 1. Define Schemas matches live streams
class WholesalerData(pw.Schema):
    wholesaler_id: str
    product_name: str
    price: float
    rating: float
    carbon_saved_kg: float
    waste_reduced_kg: float
    delivery_time_hrs: int
    description: str
    region: str

# 2. Ingest Live Streams (Simulated via a JSON Lines file or CSV that gets appended to)
# Pathway constantly watches this folder for real-time updates and API drops
wholesalers_table = pw.io.jsonlines.read(
    "data/",
    schema=WholesalerData,
    mode="streaming"
)

# 3. BDH Architecture: Real-time calculation of Green Metrics
augmented_table = wholesalers_table.select(
    *pw.this,
    # Algorithm: Higher carbon saved and waste reduced yields higher green score
    green_score = pw.this.carbon_saved_kg * 1.5 + pw.this.waste_reduced_kg * 2.0
)

# 4. Build Live Hybrid Vector Index for RAG (Updates automatically as data arrives)
embedder = GeminiEmbedder()

# Combine text for embedding, prioritizing green info
documents_table = augmented_table.select(
    text=(
        "Product: " + pw.this.product_name + " | " + 
        "Details: " + pw.this.description + " | " + 
        "Green Score: " + pw.cast(str, pw.this.green_score) + " | " +
        "Price: $" + pw.cast(str, pw.this.price) + " | " +
        "Rating: " + pw.cast(str, pw.this.rating)
    ),
    metadata=pw.this
)

# RAG Server
vector_server = VectorStoreServer(
    table=documents_table,
    embedder=embedder,
    host="0.0.0.0",
    port=8080
)

# 5. MCP Server / HTTP API for Next.js to pull live aggregate stats
# We will use pathway's REST connector to serve aggregate data

# Aggregate table for the Green Meter and Charts
# Sum up all carbon saved and waste reduced globally
global_stats = augmented_table.reduce(
    total_carbon_saved = pw.reducers.sum(pw.this.carbon_saved_kg),
    total_waste_reduced = pw.reducers.sum(pw.this.waste_reduced_kg),
    total_green_score = pw.reducers.sum(pw.this.green_score),
    avg_price = pw.reducers.avg(pw.this.price)
)

# Serve the aggregate stats on a REST endpoint
# Next.js will poll this for the Green Meter
pw.io.http.rest.serve(
    table=global_stats,
    host="0.0.0.0",
    port=8081,
    endpoint="/global-stats"
)

if __name__ == "__main__":
    # Start the Pathway real-time pipeline (runs both the vector search server and the REST endpoint)
    pw.run()
