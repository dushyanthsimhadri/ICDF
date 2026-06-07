@echo off
title Launching ICDF Platform
echo =======================================================
echo   ICDF - Intelligent Continuous Delivery Operating System
echo =======================================================
echo.

echo [1/3] Starting Backend Server (FastAPI)...
start "ICDF Backend Server" /min cmd /c "cd /d c:\Users\admin\Documents\ICDF\backend && python main.py"

echo [2/3] Starting Frontend Dev Server (Vite)...
start "ICDF Frontend Server" /min cmd /c "cd /d c:\Users\admin\Documents\ICDF\frontend && npm run dev"

echo.
echo [3/3] Waiting for services to initialize...
ping 127.0.0.1 -n 4 >nul

echo Opening browser at http://localhost:5109/
start http://localhost:5109/

echo.
echo ICDF Platform launched successfully!
exit
