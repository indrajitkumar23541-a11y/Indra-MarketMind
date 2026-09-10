@echo off
title Indra-MarketMind Launcher
cd /d "%~dp0"

echo ========================================================
echo        STARTING INDRA-MARKETMIND ECOSYSTEM
echo ========================================================

if exist "venv\Scripts\python.exe" (
    "venv\Scripts\python.exe" launcher.py
) else (
    python launcher.py
)

pause
