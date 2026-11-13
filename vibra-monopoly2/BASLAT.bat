@echo off
chcp 65001 >nul
where node >nul 2>nul || (echo Node.js yuklu degil. https://nodejs.org & pause & exit /b)
start "" http://localhost:3000
node --disable-warning=ExperimentalWarning server.js
