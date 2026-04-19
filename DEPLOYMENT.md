# Deployment Guide - Single Domain

This guide explains how to deploy "Youtube Black" as a single website with one domain.

## Overview

The application is now configured to run as **one unified application**:
- React frontend is built and served by Flask
- All API endpoints are under `/api/*`
- Everything runs on a single domain (e.g., `youtubeblack.com`)

## Architecture

```
┌─────────────────────────────────────┐
│      Single Domain: youtubeblack.com   │
├─────────────────────────────────────┤
│      Flask Server (Port 5000)        │
├─────────────────────────────────────┤
│  ┌──────────────────────────────┐   │
│  │   React Static Files (dist/) │   │
│  │   Serves SPA frontend        │   │
│  └──────────────────────────────┘   │
│                                     │
│  ┌──────────────────────────────┐   │
│  │   /api/* Routes              │   │
│  │   - /api/info                │   │
│  │   - /api/download            │   │
│  │   - /api/health              │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

## Development Setup

### 1. Start Backend
```bash
cd backend
pip install -r requirements.txt
python app.py
```

Backend runs on `http://localhost:5000`

### 2. Start Frontend (in another terminal)
```bash
cd frontend
npm install
npm run dev
```

Frontend dev server runs on `http://localhost:5173` with API proxy to backend

**Note:** In development, the frontend and backend are separate for faster rebuild times.

## Production Build & Deployment

### Step 1: Build React Frontend
```bash
cd frontend
npm run build
```

This creates optimized static files in `frontend/dist/`

### Step 2: Copy dist to Backend
```bash
# From project root
cp -r frontend/dist backend/
```

Or on Windows PowerShell:
```powershell
Copy-Item -Path "frontend/dist" -Destination "backend/" -Recurse -Force
```

### Step 3: Run Single Server
```bash
cd backend
python app.py
```

Access the application at `http://localhost:5000`

All requests will be served by Flask:
- `/` → Serves `index.html` (React app)
- `/static/*` → Serves CSS, JS, etc.
- `/api/*` → API endpoints

## Deployment Platforms

### Option 1: Heroku (Recommended for beginners)

1. **Create Procfile** in project root:
```
web: cd backend && gunicorn -w 4 -b 0.0.0.0:$PORT app:app
```

2. **Create runtime.txt** in project root:
```
python-3.11.0
```

3. **Deploy**:
```bash
heroku create your-app-name
git push heroku main
```

### Option 2: Railway
```bash
railway link
railway up
```

### Option 3: Railway (using Dockerfile)

Create `Dockerfile` in project root:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y ffmpeg

COPY backend/requirements.txt requirements.txt
RUN pip install -r requirements.txt

COPY frontend/dist backend/dist
COPY backend backend

WORKDIR /app/backend

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

### Option 4: AWS EC2

1. Launch Ubuntu instance
2. Install Python, FFmpeg, Node
3. Clone repo
4. Build frontend: `npm run build`
5. Copy to backend: `cp -r frontend/dist backend/`
6. Install Python deps: `pip install -r requirements.txt`
7. Install Gunicorn: `pip install gunicorn`
8. Run: `gunicorn -w 4 -b 0.0.0.0:5000 app:app` (from backend folder)

### Option 5: DigitalOcean App Platform

1. Push code to GitHub
2. Connect DigitalOcean to GitHub
3. Create App
4. Set Build Command: `cd frontend && npm install && npm run build`
5. Set Run Command: `cd backend && pip install -r requirements.txt && gunicorn -w 4 -b 0.0.0.0:$PORT app:app`

## Environment Variables

Create `.env` in backend folder:

```
FLASK_ENV=production
DEBUG=False
MAX_CONTENT_LENGTH=1073741824  # 1GB max file size
```

For different deployment:
```
# .env.production
FLASK_ENV=production
DEBUG=False
```

## Important Notes

### FFmpeg Installation

FFmpeg is required for video/audio processing. It must be installed on your server:

**Heroku**: Add buildpack
```bash
heroku buildpacks:add https://github.com/jontewks/heroku-buildpack-ffmpeg.git
```

**AWS/DigitalOcean**: Install manually
```bash
sudo apt-get install ffmpeg
```

**Docker**: Already included in the Dockerfile above

### Disk Space

Downloaded files are stored in `backend/downloads/`. Consider:
- Using a cloud storage service (S3) instead of local storage
- Implementing file cleanup after download
- Setting disk quotas

### Cold Starts

For Heroku free tier:
- App sleeps after 30 mins of inactivity
- First request will take 10-20 seconds to wake up
- Consider paid tier for production

## Testing Single Domain Locally

To test the production setup locally:

```bash
# Build frontend
cd frontend
npm run build

# Copy to backend
cd ..
cp -r frontend/dist backend/

# Run backend with built files
cd backend
python app.py
```

Then access `http://localhost:5000`

## Troubleshooting

### Static files not loading
- Ensure `frontend/dist/` is copied to `backend/`
- Check that Flask has correct static folder path
- Verify file permissions

### API calls failing
- Ensure API routes have `/api/` prefix
- Check CORS is still enabled in production
- Verify backend is running

### FFmpeg errors
- Verify FFmpeg is installed: `ffmpeg -version`
- Check PATH environment variable
- Install on server if running remotely

## Custom Domain Setup

### Using Namecheap / GoDaddy:

1. Update DNS records to point to your server IP
2. Wait for DNS propagation (15 min - 24 hrs)
3. Configure SSL certificate (Let's Encrypt - free)

### Using CloudFlare:

1. Point nameservers to CloudFlare
2. Add DNS A record pointing to server IP
3. Enable SSL/TLS (Universal or Full)
4. CloudFlare handles certificate

## Security Checklist

- [ ] Remove `debug=True` from production
- [ ] Set strong secret key for Flask
- [ ] Use HTTPS (SSL/TLS certificate)
- [ ] Restrict CORS to specific domains
- [ ] Keep dependencies updated
- [ ] Monitor for malicious downloads
- [ ] Set download file size limits
- [ ] Implement rate limiting

## Performance Optimization

1. **Use CDN** for static files
2. **Enable Gzip compression** in Flask
3. **Cache API responses** where appropriate
4. **Use Redis** for session management
5. **Load balance** with multiple workers (Gunicorn)

## Monitoring

- Set up error logging (Sentry)
- Monitor API response times
- Track disk usage
- Monitor FFmpeg process usage
- Set up alerts for crashes

---

**Ready to deploy? Pick a platform above and follow the steps!**
