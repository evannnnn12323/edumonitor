@echo off
title EduMonitor Server
echo ==============================================
echo   Menjalankan EduMonitor (Vite Local Server)
echo ==============================================
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0"
start "" http://localhost:5173
npm run dev -- --host 0.0.0.0 --port 5173
pause
