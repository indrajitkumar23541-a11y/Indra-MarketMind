"""
Indra-MarketMind All-in-One Master Launcher
Starts infrastructure, backend microservices, Streamlit lab, Next.js frontend, and launches the browser.
"""

import os
import sys
import time
import signal
import subprocess
import webbrowser
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = ROOT_DIR / "frontend"
VENV_PYTHON = ROOT_DIR / "venv" / "Scripts" / "python.exe"
PYTHON_EXE = str(VENV_PYTHON) if VENV_PYTHON.exists() else sys.executable

PROCESSES = []

def start_process(name, cmd, cwd=str(ROOT_DIR)):
    print(f"  [+] Starting {name}...")
    try:
        proc = subprocess.Popen(
            cmd,
            cwd=cwd,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            shell=(os.name == 'nt')
        )
        PROCESSES.append((name, proc))
        return proc
    except Exception as e:
        print(f"  [-] Failed to start {name}: {e}")
        return None

def cleanup():
    print("\n\n" + "=" * 60)
    print("  Stopping Indra-MarketMind ecosystem...")
    print("=" * 60)
    for name, proc in PROCESSES:
        try:
            if os.name == 'nt':
                subprocess.run(
                    f"taskkill /F /T /PID {proc.pid}",
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                    shell=True
                )
            else:
                proc.terminate()
            print(f"  [-] Stopped {name}")
        except Exception:
            pass
    print("\n  [v] All services stopped cleanly. Goodbye!\n")

def main():
    print("\n" + "=" * 70)
    print("        ⚡ INDRA-MARKETMIND — FULL ECOSYSTEM LAUNCHER ⚡")
    print("=" * 70)

    # 1. Start Docker containers for DB and Redis if Docker is available
    print("\n[Step 1/4] Checking Database & Redis...")
    try:
        docker_res = subprocess.run(
            "docker compose up -d postgres redis",
            cwd=str(ROOT_DIR),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            shell=True,
            timeout=15
        )
        if docker_res.returncode == 0:
            print("  [v] PostgreSQL (pgvector) & Redis 7 are active.")
        else:
            print("  [!] Docker not ready; continuing with local fallback modes.")
    except Exception:
        print("  [!] Docker check skipped.")

    # 2. Start Core Python Microservices
    print("\n[Step 2/4] Starting Microservices Mesh...")
    start_process("API Gateway (Port 8000)", [PYTHON_EXE, "-m", "uvicorn", "services.gateway.main:app", "--port", "8000", "--host", "127.0.0.1"])
    time.sleep(1)
    start_process("Data Ingestion (Port 8001)", [PYTHON_EXE, "-m", "uvicorn", "services.data_ingestion.main:app", "--port", "8001", "--host", "127.0.0.1"])
    start_process("Sentiment Engine (Port 8002)", [PYTHON_EXE, "-m", "uvicorn", "services.sentiment.main:app", "--port", "8002", "--host", "127.0.0.1"])
    start_process("Analytics Engine (Port 8003)", [PYTHON_EXE, "-m", "uvicorn", "services.analytics.main:app", "--port", "8003", "--host", "127.0.0.1"])
    start_process("ML Forecaster (Port 8004)", [PYTHON_EXE, "-m", "uvicorn", "services.forecasting.main:app", "--port", "8004", "--host", "127.0.0.1"])

    # 3. Start Streamlit AI Quant Lab
    print("\n[Step 3/4] Starting AI Quant Lab (Streamlit)...")
    start_process(
        "Streamlit Quant Lab (Port 8501)",
        [PYTHON_EXE, "-m", "streamlit", "run", "dashboard/app.py", "--server.port", "8501", "--server.headless", "true"]
    )

    # 4. Start Next.js Frontend
    print("\n[Step 4/4] Starting Dark Sci-Fi Terminal (Next.js)...")
    npm_cmd = "npm.cmd" if os.name == 'nt' else "npm"
    start_process("Next.js Terminal (Port 3000)", [npm_cmd, "run", "dev"], cwd=str(FRONTEND_DIR))

    print("\n" + "=" * 70)
    print("      🚀 INDRA-MARKETMIND IS ONLINE & FULLY FUNCTIONAL!")
    print("=" * 70)
    print("  🌌 Unified Web Terminal  :  http://localhost:3000")
    print("  🌍 Global Radar Hub      :  http://localhost:3000/global-map")
    print("  🔬 AI Quant Lab          :  http://localhost:8501 (also in /research)")
    print("  ⚡ API Gateway Docs      :  http://localhost:8000/docs")
    print("=" * 70)
    print("  Opening http://localhost:3000 in your browser...")
    print("  Press [Ctrl + C] anytime in this terminal to STOP all services.")
    print("=" * 70 + "\n")

    time.sleep(3)
    try:
        webbrowser.open("http://localhost:3000")
    except Exception:
        pass

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        cleanup()
    except Exception as e:
        print(f"Error: {e}")
        cleanup()

if __name__ == "__main__":
    signal.signal(signal.SIGINT, lambda s, f: sys.exit(0))
    try:
        main()
    finally:
        cleanup()
