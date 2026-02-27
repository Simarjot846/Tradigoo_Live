#!/bin/bash

echo "============================================================"
echo "  Tradigoo Pathway Real-Time Pipeline Starter"
echo "  Hack for Green Bharat"
echo "============================================================"
echo ""

echo "[1/3] Activating virtual environment..."
source venv/bin/activate

echo ""
echo "[2/3] Checking dependencies..."
pip install -q -r requirements.txt

echo ""
echo "[3/3] Starting Pathway server..."
echo ""
echo "============================================================"
echo "  Server will start on http://localhost:8081"
echo "  Press Ctrl+C to stop"
echo "============================================================"
echo ""

python pathway_realtime.py
