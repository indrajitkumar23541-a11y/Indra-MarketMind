"""
Indra-MarketMind Cloud Backend Runner
Spins up core internal microservices and exposes the public API Gateway on the target cloud port.
Works seamlessly on Hugging Face Spaces (Port 7860), Render (Port 10000), or any Linux/Windows server.
"""

import os
import sys
import time
import subprocess
import signal
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
PYTHON_EXE = sys.executable
PROCESSES = []

def start_service(name: str, module: str, port: int):
    print(f"  [+] Starting {name} on port {port}...")
    cmd = [PYTHON_EXE, "-m", "uvicorn", module, "--host", "127.0.0.1", "--port", str(port)]
    proc = subprocess.Popen(cmd, cwd=str(ROOT_DIR))
    PROCESSES.append((name, proc))
    return proc

def cleanup(*args):
    print("\n[!] Stopping all backend services...")
    for name, proc in PROCESSES:
        try:
            proc.terminate()
            proc.wait(timeout=3)
        except Exception:
            try:
                proc.kill()
            except Exception:
                pass
    print("  [v] All services stopped cleanly.")
    sys.exit(0)

def main():
    signal.signal(signal.SIGINT, cleanup)
    signal.signal(signal.SIGTERM, cleanup)

    print("\n" + "=" * 65)
    print("       ⚡ INDRA-MARKETMIND — CLOUD BACKEND LAUNCHER ⚡")
    print("=" * 65)

    # 1. Start core microservices on internal ports
    start_service("Data Ingestion", "services.data_ingestion.main:app", 8001)
    start_service("Sentiment Engine", "services.sentiment.main:app", 8002)
    start_service("Analytics Engine", "services.analytics.main:app", 8003)
    start_service("ML Forecaster", "services.forecasting.main:app", 8004)
    start_service("Alerts Service", "services.alerts.main:app", 8005)
    start_service("RAG Chatbot", "services.rag_chatbot.main:app", 8006)
    start_service("Auto Trading", "services.auto_trading.main:app", 8007)
    start_service("Crypto Onchain", "services.crypto_onchain.main:app", 8009)
    start_service("Alternative Data", "services.alternative_data.main:app", 8010)

    # Give microservices a moment to initialize
    time.sleep(2)

    # 2. Start Gateway on cloud PORT (7860 on HuggingFace Spaces, 10000 on Render, 8000 default)
    port = int(os.getenv("PORT", 7860))
    print(f"\n  [*] Starting Public API Gateway on port {port}...")
    gateway_cmd = [PYTHON_EXE, "-m", "uvicorn", "services.gateway.main:app", "--host", "0.0.0.0", "--port", str(port)]
    gateway_proc = subprocess.Popen(gateway_cmd, cwd=str(ROOT_DIR))
    PROCESSES.append(("API Gateway", gateway_proc))

    print("=" * 65)
    print(f"  🚀 Indra-MarketMind Backend is LIVE on port {port}")
    print("=" * 65 + "\n")

    try:
        gateway_proc.wait()
    except KeyboardInterrupt:
        cleanup()

if __name__ == "__main__":
    main()
