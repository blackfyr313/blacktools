@echo off
REM Black Tools - Upgrade All Dependencies (Windows)
REM Run this anytime to update all packages to latest versions

echo.
echo ========================================
echo Black Tools - Upgrade Dependencies
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed
    pause
    exit /b 1
)

cd backend

echo Running dependency setup and upgrade...
echo.

python setup_dependencies.py

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo ✓ All dependencies upgraded successfully!
    echo ========================================
    echo.
) else (
    echo.
    echo ERROR: Dependency upgrade failed
    echo.
    pause
    exit /b 1
)

pause
