#!/bin/bash
# Youtube Black - Build and Deploy Script (macOS/Linux)

echo ""
echo "========================================"
echo "Youtube Black - Build for Production"
echo "========================================"
echo ""

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed. Please install from https://nodejs.org"
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python3 is not installed. Please install from https://python.org"
    exit 1
fi

# Check if FFmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "WARNING: FFmpeg is not installed or not in PATH"
    echo "Install using:"
    echo "  macOS: brew install ffmpeg"
    echo "  Linux: sudo apt-get install ffmpeg"
    echo ""
fi

echo "Step 1: Building React frontend..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install npm dependencies"
    exit 1
fi

npm run build
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to build React app"
    exit 1
fi

echo ""
echo "Step 2: Copying build files to backend..."
cd ..
rm -rf backend/dist
cp -r frontend/dist backend/
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to copy dist files"
    exit 1
fi

echo ""
echo "Step 3: Installing Python dependencies..."
cd backend
python3 -m pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install Python dependencies"
    exit 1
fi

echo ""
echo "Step 4: Setting up and upgrading all dependencies..."
python3 setup_dependencies.py
if [ $? -ne 0 ]; then
    echo "WARNING: Dependency setup had issues, but continuing..."
fi

echo ""
echo "========================================"
echo "Build Complete!"
echo "========================================"
echo ""
echo "To run the production server:"
echo "    python3 app.py"
echo ""
echo "Then access: http://localhost:5000"
echo ""
echo "To deploy, copy the 'backend' folder to your server"
echo ""
