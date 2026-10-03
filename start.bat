@echo off
title Tiem Net Co Online Server 24/7
cd /d "%~dp0"
echo ========================================================
echo   🎮  TIEM NET CO ONLINE - SERVER PRIVATE 24/7
echo ========================================================
echo   Port: 8080 (http://localhost:8080/)
echo   Database: SQLite (data/netco.db)
echo.
echo   Khoi chay server...
node server.js
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [LOI] Server bi dung. Nhan phim bat ky de thu lai...
    pause >nul
)
