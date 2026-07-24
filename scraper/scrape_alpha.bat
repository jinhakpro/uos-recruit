@echo off
cd /d "%~dp0.."
set JINHAKPRO_BASE=https://www-alpha.jinhakpro.com
set JINHAKPRO_OUTPUT=postings.alpha.json
"C:\Program Files\nodejs\node.exe" scraper\scrape.js >> scraper\scrape_alpha.log 2>&1
