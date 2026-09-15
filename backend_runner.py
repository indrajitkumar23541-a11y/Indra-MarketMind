"""
Indra-MarketMind Cloud Backend Runner
High-performance single-process unified runner with mounted microservices.
Optimized for 512MB RAM constraints on Render, Koyeb, and Hugging Face.
"""

import os
import sys
import uvicorn
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT_DIR))

def main():
    port = int(os.getenv("PORT", 10000))
    print("\n" + "=" * 65)
    print("       ⚡ INDRA-MARKETMIND — CLOUD UNIFIED BACKEND ⚡")
    print(f"       Running on port {port} (Memory-Optimized Engine)")
    print("=" * 65 + "\n")
    uvicorn.run("services.gateway.main:app", host="0.0.0.0", port=port, log_level="info")

if __name__ == "__main__":
    main()
