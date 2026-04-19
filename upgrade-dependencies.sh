#!/bin/bash
# Black Tools - Upgrade All Dependencies (macOS/Linux)
# Run this anytime to update all packages to latest versions

echo ""
echo "========================================"
echo "Black Tools - Upgrade Dependencies"
echo "========================================"
echo ""

# Check if Python3 is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python3 is not installed"
    exit 1
fi

cd backend

echo "Running dependency setup and upgrade..."
echo ""

python3 setup_dependencies.py

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================"
    echo "✓ All dependencies upgraded successfully!"
    echo "========================================"
    echo ""
else
    echo ""
    echo "ERROR: Dependency upgrade failed"
    echo ""
    exit 1
fi
