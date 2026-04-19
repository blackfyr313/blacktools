@echo off
REM Youtube Black - Quick Start Script (Windows)

echo.
echo ========================================
echo Youtube Black - Quick Start
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed. Please install from https://nodejs.org
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed. Please install from https://python.org
    pause
    exit /b 1
)

REM Check if ffmpeg is installed
ffmpeg -version >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: FFmpeg is not installed or not in PATH
    echo Install from: https://ffmpeg.org/download.html
    echo.
)

echo Starting Youtube Black...
echo.

REM Setup frontend in a new window
echo Starting Frontend (React/Vite)...
start "Youtube Black - Frontend" cmd /k "cd frontend && npm install && npm run dev"

timeout /t 3 /nobreak

REM Setup backend in a new window
echo Starting Backend (Flask)...
start "Youtube Black - Backend" cmd /k "cd backend && python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt && python app.py"

echo.
echo ========================================
echo Services Starting...
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5000
echo ========================================
echo.
pause
