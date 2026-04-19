# Installation & Setup Guide

## Complete Step-by-Step Setup Instructions

### System Requirements

- **Windows, macOS, or Linux**
- **Node.js 16+** with npm
- **Python 3.8+**
- **FFmpeg** (for video/audio processing)
- **4GB+ RAM** recommended
- **2GB+ free disk space**

---

## Step 1: Install FFmpeg

### Windows

#### Option A: Using Chocolatey (Recommended)
```bash
choco install ffmpeg
ffmpeg -version  # Verify installation
```

#### Option B: Manual Installation
1. Download from https://ffmpeg.org/download.html
2. Extract to `C:\ffmpeg`
3. Add `C:\ffmpeg\bin` to system PATH
4. Verify: Open Command Prompt and run `ffmpeg -version`

### macOS

```bash
# Using Homebrew
brew install ffmpeg

# Verify
ffmpeg -version
```

### Linux (Ubuntu/Debian)

```bash
sudo apt-get update
sudo apt-get install ffmpeg

# Verify
ffmpeg -version
```

---

## Step 2: Install Node.js & npm

### Windows/macOS
1. Download from https://nodejs.org (LTS version recommended)
2. Run installer and follow steps
3. Verify:
```bash
node --version
npm --version
```

### Linux

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

## Step 3: Setup Frontend

### Navigate to Frontend Directory

```bash
cd Youtube-Black/frontend
```

### Install Dependencies

```bash
npm install
```

This will install:
- React 18
- Vite
- Tailwind CSS
- React Router
- Axios
- And other dependencies

### Start Development Server

```bash
npm run dev
```

**Output:**
```
  VITE v5.0.8  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

✅ Frontend is now running at `http://localhost:5173`

### Build for Production (Optional)

```bash
npm run build
```

This creates a `dist/` folder with optimized production build.

---

## Step 4: Setup Backend

### Navigate to Backend Directory

```bash
cd ../backend
# or
cd Youtube-Black/backend
```

### Create Virtual Environment (Recommended)

#### Windows
```bash
python -m venv venv
venv\Scripts\activate
```

#### macOS/Linux
```bash
python3 -m venv venv
source venv/bin/activate
```

### Install Python Dependencies

```bash
pip install -r requirements.txt
```

This installs:
- Flask
- Flask-CORS
- yt-dlp
- python-dotenv

### Run Backend Server

```bash
python app.py
```

**Output:**
```
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
```

✅ Backend is now running at `http://localhost:5000`

---

## Step 5: Verify Installation

### Test Frontend

1. Open browser: `http://localhost:5173`
2. You should see the "Youtube Black" homepage
3. Dark theme with purple accents
4. Test navigation to Dashboard

### Test Backend API

1. Open Command Prompt/Terminal
2. Test health check:
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{"status": "healthy", "message": "Backend is running"}
```

3. Test with a video info request:
```bash
curl -X POST http://localhost:5000/info -H "Content-Type: application/json" -d "{\"url\":\"https://www.youtube.com/watch?v=dQw4w9WgXcQ\"}"
```

---

## Running Both Servers

### Option 1: Separate Terminals

**Terminal 1 (Frontend):**
```bash
cd frontend
npm run dev
```

**Terminal 2 (Backend):**
```bash
cd backend
python app.py
```

### Option 2: Using npm-run-all (Windows Only)

From project root:
```bash
npm run dev:all
```

---

## Common Issues & Solutions

### Issue: "ffmpeg: command not found"

**Solution:**
- Ensure FFmpeg is installed
- Add FFmpeg to system PATH
- Restart terminal after installation

### Issue: "ECONNREFUSED 127.0.0.1:5000"

**Solution:**
- Backend is not running
- Start backend: `python app.py`
- Verify it's running on port 5000

### Issue: "ModuleNotFoundError: No module named 'flask'"

**Solution:**
```bash
# Make sure virtual environment is activated
pip install -r requirements.txt
```

### Issue: "Port 5173 or 5000 already in use"

**Solution:**
```bash
# Windows - Find process using port 5173
netstat -ano | findstr :5173

# macOS/Linux
lsof -i :5173

# Kill the process or change port in config files
```

### Issue: Video download fails

**Solutions:**
- Verify URL is a valid YouTube link
- Check if video is available in your region
- Try a different quality setting
- Check internet connection
- Look at backend console for error messages

---

## Environment Variables (Optional)

Create backend `.env` file:

```bash
# backend/.env
FLASK_ENV=development
DEBUG=True
MAX_CONTENT_LENGTH=1073741824  # 1GB max file size
```

---

## Production Deployment

### Frontend Production Build

```bash
cd frontend
npm run build
```

Deploy `dist/` folder to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages
- Any static hosting

### Backend Production Deployment

#### Using Gunicorn

```bash
cd backend
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

#### Using Docker (Optional)

Create `Dockerfile`:

```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY app.py .
RUN apt-get update && apt-get install -y ffmpeg
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

Build and run:
```bash
docker build -t youtube-black .
docker run -p 5000:5000 youtube-black
```

---

## File Structure After Setup

```
Youtube-Black/
├── frontend/
│   ├── node_modules/
│   ├── src/
│   ├── dist/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── venv/
│   ├── downloads/
│   ├── temp/
│   ├── app.py
│   └── ...
│
└── README.md
```

---

## Next Steps

1. ✅ Both servers running
2. ✅ Open `http://localhost:5173` in browser
3. ✅ Test with a YouTube URL
4. ✅ Check Dashboard for history
5. 🚀 Start downloading!

---

## Additional Resources

- **React Docs**: https://react.dev
- **Vite Docs**: https://vitejs.dev
- **Flask Docs**: https://flask.palletsprojects.com
- **yt-dlp Docs**: https://github.com/yt-dlp/yt-dlp/wiki
- **Tailwind CSS**: https://tailwindcss.com

---

## Support

For issues:
1. Check console errors (F12)
2. Review backend terminal output
3. Verify all services are running
4. Try restarting both servers
5. Check system PATH for FFmpeg

**Happy downloading! 🎬**
