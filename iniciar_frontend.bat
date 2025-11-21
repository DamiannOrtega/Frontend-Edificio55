@echo off
REM Script para iniciar el servidor React/Vite
REM Este script inicia el servidor de desarrollo del frontend

echo ========================================
echo   Iniciando Servidor Frontend React
echo ========================================
echo.

REM Cambiar al directorio del frontend
cd /d "%~dp0"

REM Verificar que Node.js esta instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js no esta instalado o no esta en el PATH
    pause
    exit /b 1
)

REM Verificar que npm esta instalado
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm no esta instalado o no esta en el PATH
    pause
    exit /b 1
)

REM Verificar que node_modules existe, si no, instalar dependencias
if not exist "node_modules" (
    echo node_modules no encontrado. Instalando dependencias...
    call npm install
    if errorlevel 1 (
        echo ERROR: No se pudieron instalar las dependencias
        pause
        exit /b 1
    )
)

REM Iniciar el servidor de desarrollo
echo.
echo Iniciando servidor Vite en http://localhost:5173
echo Presiona Ctrl+C para detener el servidor
echo.
call npm run dev

pause



