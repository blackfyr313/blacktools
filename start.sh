#!/bin/bash
# Youtube Black - Quick Start Script (macOS/Linux)

echo ""
echo "========================================"
echo "Youtube Black - Quick Start"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed. Please install from https://nodejs.org"
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python3 is not installed. Please install using your package manager"
    exit 1
fi

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "WARNING: FFmpeg is not installed or not in PATH"
    echo "Install using: brew install ffmpeg (macOS) or sudo apt-get install ffmpeg (Linux)"
    echo ""
fi

echo "Starting Youtube Black..."
echo ""

# Start frontend
echo "Starting Frontend (React/Vite)..."
cd frontend
npm install
npm run dev &
FRONTEND_PID=$!
sleep 3

# Start backend
echo "Starting Backend (Flask)..."
cd ../backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 app.py &
BACKEND_PID=$!

echo ""
echo "========================================"
echo "Services Starting..."
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:5000"
echo "========================================"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for both processes
wait $FRONTEND_PID $BACKEND_PID
