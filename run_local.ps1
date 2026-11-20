# PowerShell script to start both Backend and Frontend locally

Write-Host "==========================================================" -ForegroundColor DarkGreen
Write-Host "  Starting DNcrypt (DNA-Inspired Secure Data Platform)   " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor DarkGreen

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Start FastAPI Backend in background job
Write-Host "`n[1/2] Starting FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Cyan
$backendProc = Start-Process -FilePath "$scriptDir\backend\venv\Scripts\python.exe" -ArgumentList "-m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload" -WorkingDirectory "$scriptDir\backend" -PassThru

# 2. Start Vite Frontend
Write-Host "[2/2] Starting Vite React Frontend on http://localhost:5173..." -ForegroundColor Cyan
Set-Location "$scriptDir\frontend"
npm run dev
