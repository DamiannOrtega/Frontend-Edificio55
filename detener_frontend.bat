@echo off
REM Script para detener el servidor React/Vite
REM Mata todos los procesos de Node.js relacionados con Vite

echo ========================================
echo   Deteniendo Servidor Frontend
echo ========================================
echo.

REM Buscar y matar procesos de Node.js
for /f "tokens=2" %%a in ('tasklist /FI "IMAGENAME eq node.exe" /FO LIST ^| findstr /C:"PID:"') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo Servidor Frontend detenido.
echo.
pause







