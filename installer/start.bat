@echo off
title PulsePoint POS
color 0A

echo.
echo  ╔══════════════════════════════════╗
echo  ║       PulsePoint POS v1.0        ║
echo  ╚══════════════════════════════════╝
echo.
echo  Starting server, please wait...
echo.

:: Auto-detect directory depending on if we're running from source or from the compiled install
cd /d "%~dp0"
if exist "..\backend_rewrite\server.js" cd ..

:: Open the browser after a short delay (2 seconds for server to boot)
start "" timeout /t 2 /nobreak > nul
start "" "http://localhost:5000"

:: Start the backend (this window stays open — closing it shuts down the app)
node backend_rewrite\server.js

:: If the server crashes, pause so the user can read the error
echo.
echo  Server stopped. Press any key to close.
pause > nul
