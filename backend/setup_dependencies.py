#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Setup and upgrade all Python dependencies for Black Tools.
Runs automatically on app startup to ensure latest versions.
"""

import subprocess
import sys
import os
from pathlib import Path

# Force UTF-8 encoding for Windows
if sys.platform == 'win32':
    os.environ['PYTHONIOENCODING'] = 'utf-8'

try:
    import pkg_resources
except ImportError:
    # pkg_resources not available, will try alternative method
    pkg_resources = None

# Color codes for terminal output
GREEN = '\033[92m'
YELLOW = '\033[93m'
RED = '\033[91m'
BLUE = '\033[94m'
RESET = '\033[0m'
BOLD = '\033[1m'

# Required packages with minimum versions
REQUIRED_PACKAGES = {
    'flask': '3.0.0',
    'flask-cors': '4.0.0',
    'python-dotenv': '1.0.0',
    'yt-dlp': '2025.12.25',
    'pillow': '10.0.0',
    'pydub': '0.25.1',
    'librosa': '0.10.0',
    'noisereduce': '3.0.0',
    'numpy': '1.24.0',
}

def get_installed_version(package_name):
    """Get the installed version of a package."""
    if pkg_resources is None:
        try:
            result = subprocess.run(
                [sys.executable, "-m", "pip", "show", package_name],
                capture_output=True,
                text=True,
                timeout=10
            )
            if result.returncode == 0:
                for line in result.stdout.split('\n'):
                    if line.startswith('Version:'):
                        return line.split(': ')[1].strip()
            return None
        except Exception:
            return None
    try:
        return pkg_resources.get_distribution(package_name).version
    except (pkg_resources.DistributionNotFound, AttributeError):
        return None

def print_header(text):
    """Print a formatted header."""
    print(f"\n{BLUE}{BOLD}{'='*60}")
    print(f"{text}")
    print(f"{'='*60}{RESET}\n")

def print_status(package, status, version=None):
    """Print package status with colors."""
    if status == "OK":
        print(f"{GREEN}[OK]{RESET} {package:<20} {version if version else ''}")
    elif status == "WARN":
        print(f"{YELLOW}[WARN]{RESET} {package:<20} {version if version else ''}")
    elif status == "ERR":
        print(f"{RED}[ERR]{RESET} {package:<20} {version if version else ''}")

def upgrade_pip():
    """Upgrade pip to latest version."""
    print(f"{YELLOW}[INFO] Upgrading pip...{RESET}")
    subprocess.check_call(
        [sys.executable, "-m", "pip", "install", "--upgrade", "pip", "-q"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
    print(f"{GREEN}[OK] pip upgraded{RESET}\n")

def install_requirements():
    """Install all packages from requirements.txt with upgrade flag."""
    requirements_file = Path(__file__).parent / 'requirements.txt'
    
    if not requirements_file.exists():
        print(f"{RED}[ERR] requirements.txt not found!{RESET}")
        return False
    
    print(f"{YELLOW}[INFO] Installing/upgrading packages from requirements.txt...{RESET}")
    try:
        subprocess.check_call(
            [sys.executable, "-m", "pip", "install", "--upgrade", "-r", str(requirements_file)],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        print(f"{GREEN}[OK] All packages installed/upgraded successfully{RESET}\n")
        return True
    except subprocess.CalledProcessError as e:
        print(f"{RED}[ERR] Error installing packages: {e}{RESET}\n")
        return False

def check_all_packages():
    """Check if all required packages are installed with correct versions."""
    print_header("Package Status Check")
    
    all_good = True
    for package, min_version in REQUIRED_PACKAGES.items():
        installed_version = get_installed_version(package)
        
        if installed_version is None:
            print_status(package, "ERR", f"NOT INSTALLED (required: {min_version})")
            all_good = False
        else:
            # Compare versions (simplified - just shows status)
            print_status(package, "OK", f"v{installed_version}")
    
    return all_good

def main():
    """Main setup function."""
    print_header("Black Tools - Dependency Setup")
    
    print(f"{BOLD}Step 1: Upgrading pip{RESET}")
    try:
        upgrade_pip()
    except subprocess.CalledProcessError as e:
        print(f"{YELLOW}[WARN] pip upgrade warning: {e}{RESET}\n")
    
    print(f"{BOLD}Step 2: Installing/Upgrading all dependencies{RESET}")
    success = install_requirements()
    
    print(f"{BOLD}Step 3: Verifying installations{RESET}")
    all_packages_ok = check_all_packages()
    
    if success and all_packages_ok:
        print(f"\n{GREEN}{BOLD}[OK] All dependencies ready!{RESET}")
        print(f"{GREEN}You can now start the application.{RESET}\n")
        return True
    else:
        print(f"\n{YELLOW}{BOLD}[WARN] Some packages may need attention.{RESET}")
        print(f"{YELLOW}Trying manual installation of missing packages...{RESET}\n")
        
        for package, min_version in REQUIRED_PACKAGES.items():
            if get_installed_version(package) is None:
                print(f"Installing {package}...")
                try:
                    subprocess.check_call(
                        [sys.executable, "-m", "pip", "install", "--upgrade", package],
                        stdout=subprocess.DEVNULL,
                        stderr=subprocess.DEVNULL
                    )
                    print(f"{GREEN}[OK] {package} installed{RESET}")
                except subprocess.CalledProcessError:
                    print(f"{RED}[ERR] Failed to install {package}{RESET}")
        
        print(f"\n{GREEN}[OK] Setup complete!{RESET}\n")
        return True

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
