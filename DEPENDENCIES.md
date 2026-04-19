# Black Tools - Dependency Management

This document explains how Black Tools manages Python dependencies and ensures all libraries are kept up-to-date.

## 📦 Available Libraries

### Core Framework
- **Flask 3.0.0+** - Web framework
- **Flask-CORS 4.0.0+** - Cross-origin resource sharing
- **python-dotenv 1.0.0+** - Environment variable management

### Media Processing
- **yt-dlp 2025.12.25+** - YouTube and social media downloads
- **Pillow 10.0.0+** - Image processing and optimization
- **pydub 0.25.1+** - Audio format conversion
- **librosa 0.10.0+** - Audio analysis and processing
- **noisereduce 3.0.0+** - Background noise removal

### Utilities
- **numpy 1.24.0+** - Numerical computing for audio/image processing
- **FFmpeg** - External dependency for video/audio conversion

## 🚀 Automatic Dependency Setup

### On App Startup
When you run `python app.py`, the application automatically:
1. Runs `setup_dependencies.py`
2. Upgrades pip to latest version
3. Installs/upgrades all packages from `requirements.txt`
4. Verifies all dependencies are installed
5. Shows version information for each library

**Console Output Example:**
```
============================================================
BLACK TOOLS - DEPENDENCY INITIALIZATION
============================================================

Upgrading pip...
✓ pip upgraded

Installing/upgrading packages from requirements.txt...
✓ All packages installed/upgraded successfully

Package Status Check
============================================================
✓ flask                 v3.0.0
✓ flask-cors            v4.0.0
✓ yt-dlp                v2026.3.17
✓ pillow                v10.1.0
✓ pydub                 v0.25.1
✓ librosa               v0.10.0
✓ noisereduce           v3.0.0
✓ numpy                 v1.24.3
============================================================
✓ All dependencies ready!
```

## 📋 Dependency Files

### `requirements.txt`
Lists all Python packages with version constraints:
```
flask>=3.0.0
flask-cors>=4.0.0
yt-dlp>=2025.12.25
pillow>=10.0.0
pydub>=0.25.1
librosa>=0.10.0
noisereduce>=3.0.0
numpy>=1.24.0
```

**Note:** Using `>=` (flexible versions) ensures you always get the latest compatible versions.

### `backend/setup_dependencies.py`
Python script that:
- Upgrades pip to latest version
- Installs/upgrades all packages from requirements.txt
- Verifies all dependencies are installed
- Shows color-coded status for each library
- Handles installation errors gracefully

## 🔄 Manual Dependency Updates

### Option 1: Run During Build
```bash
# Windows
.\build.bat

# macOS/Linux
./build.sh
```

Both build scripts automatically run dependency setup.

### Option 2: Upgrade Anytime
Run the dedicated upgrade script:

**Windows:**
```bash
.\upgrade-dependencies.bat
```

**macOS/Linux:**
```bash
./upgrade-dependencies.sh
```

### Option 3: Manual Command
From the `backend` directory:

**Windows:**
```bash
python setup_dependencies.py
```

**macOS/Linux:**
```bash
python3 setup_dependencies.py
```

## ✅ Verification

To verify all dependencies are installed correctly:

**Method 1:** Check console output when starting the app
```bash
python app.py
```

**Method 2:** Run setup script directly
```bash
python setup_dependencies.py
```

**Method 3:** Check individual packages
```bash
pip list | grep -E "flask|pillow|pydub|librosa"
```

## 🔧 Adding New Dependencies

To add a new library:

1. Add to `requirements.txt`:
   ```
   new-package>=1.0.0
   ```

2. Run setup script:
   ```bash
   python setup_dependencies.py
   ```

3. Import in `app.py`:
   ```python
   try:
       import new_package
       print("✓ new_package imported successfully")
   except ImportError as e:
       print(f"✗ Warning: new_package not available: {e}")
   ```

## 🐛 Troubleshooting

### Package Installation Fails
1. Upgrade pip:
   ```bash
   python -m pip install --upgrade pip
   ```

2. Try installing individually:
   ```bash
   pip install pillow
   pip install pydub
   pip install librosa
   ```

### Missing FFmpeg
Some libraries (pydub, yt-dlp) need FFmpeg:

**Windows:**
```bash
choco install ffmpeg
# Or download from https://ffmpeg.org/download.html
```

**macOS:**
```bash
brew install ffmpeg
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install ffmpeg
```

### Dependency Conflicts
If you see version conflicts:

1. Update setup_dependencies.py to use specific versions
2. Or: Use virtual environment
   ```bash
   python -m venv venv
   source venv/Scripts/activate  # Windows: venv\Scripts\activate
   python setup_dependencies.py
   ```

## 📝 Version Update Policy

Currently using flexible versioning (`>=X.Y.Z`):
- ✅ Always gets latest compatible version
- ✅ Better for security updates
- ⚠️ May occasionally introduce breaking changes

**To lock specific versions:**
Replace `>=` with `==`:
```
flask==3.0.0
pillow==10.1.0
```

Then run setup script to use exact versions.

## 🎯 Summary

| Action | Command |
|--------|---------|
| Start app with auto-setup | `python app.py` |
| Manual dependency upgrade | `python setup_dependencies.py` |
| Rebuild project | `.\build.bat` (Windows) or `./build.sh` (macOS/Linux) |
| Quick upgrade | `.\upgrade-dependencies.bat` or `./upgrade-dependencies.sh` |
| Check versions | `pip list` |

All scripts handle dependency management automatically and ensure you're always running the latest compatible versions!
