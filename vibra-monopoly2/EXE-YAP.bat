@echo off
chcp 65001 >nul
echo ===== Vibra .exe olusturuluyor =====
where node >nul 2>nul || (echo Node.js yuklu degil. https://nodejs.org adresinden LTS surumunu kur, sonra tekrar calistir. & pause & exit /b)
call npm install
call npm run dist
echo.
echo Bitti! dist klasorunde "Vibra Setup 3.5.0.exe" (kurulum) ve "Vibra 3.5.0.exe" (kurulumsuz) var.
pause
