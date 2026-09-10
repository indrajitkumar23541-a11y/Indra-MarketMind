@echo off
title Stop Indra-MarketMind
echo Stopping all Indra-MarketMind processes and Docker containers...

taskkill /F /IM uvicorn.exe >nul 2>&1
taskkill /F /IM streamlit.exe >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1
docker compose stop >nul 2>&1

echo [v] All Indra-MarketMind processes and containers stopped.
pause
