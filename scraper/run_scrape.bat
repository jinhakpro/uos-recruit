@echo off
cd /d "%~dp0.."
"C:\Program Files\nodejs\node.exe" scraper\scrape.js >> scraper\scrape.log 2>&1
