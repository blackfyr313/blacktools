@echo off
REM Youtube Black - Build and Deploy Script (Windows)

echo.
echo ========================================
echo Youtube Black - Build for Production
echo ========================================
echo.

REM Check if Node is installed
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

REM Check if FFmpeg is installed
ffmpeg -version >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: FFmpeg is not installed or not in PATH
    echo Install from: https://ffmpeg.org/download.html
    echo Or use: choco install ffmpeg
    echo.
)

echo Step 1: Building React frontend...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install npm dependencies
    pause
    exit /b 1
)

call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Failed to build React app
    pause
    exit /b 1
)

echo.
echo Step 2: Copying build files to backend...
cd ..
if exist backend\dist (
    rmdir /s /q backend\dist
)
xcopy /E /I /Y frontend\dist backend\dist
if %errorlevel% neq 0 (
    echo ERROR: Failed to copy dist files
    pause
    exit /b 1
)

echo.
echo Step 3: Installing Python dependencies...
cd backend
python -m pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Python dependencies
    pause
    exit /b 1
)

echo.
echo Step 4: Setting up and upgrading all dependencies...
python setup_dependencies.py
if %errorlevel% neq 0 (
    echo WARNING: Dependency setup had issues, but continuing...
)

echo.
echo ========================================
echo Build Complete!
echo ========================================
echo.
echo To run the production server:
echo     python app.py
echo.
echo Then access: http://localhost:5000
echo.
echo To deploy, copy the 'backend' folder to your server
echo.
pause
