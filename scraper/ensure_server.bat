@echo off
cd /d "%~dp0.."
netstat -ano | findstr ":5173" | findstr "LISTENING" >nul
if %errorlevel%==0 (
  exit /b 0
)
start "SicuServer" /B "C:\Program Files\nodejs\node.exe" scraper\serve.js >> scraper\serve.log 2>&1
