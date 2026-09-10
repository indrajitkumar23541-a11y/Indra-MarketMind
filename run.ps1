# Indra-MarketMind PowerShell Launcher
Set-Location -Path $PSScriptRoot

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "       STARTING INDRA-MARKETMIND ECOSYSTEM" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

if (Test-Path "venv\Scripts\python.exe") {
    & ".\venv\Scripts\python.exe" launcher.py
} else {
    & python launcher.py
}
