# Black Tools - Media Processing Suite

A complete suite of 8 powerful media processing tools built with **Flask** backend and **React** frontend. Download, convert, and process videos, images, and audio files all in one place!

## 🎯 Features

### 8 Integrated Media Tools:

1. **YouTube Download** - Download videos and audio from YouTube in various formats and resolutions
2. **YouTube Info** - Get detailed information about YouTube videos (title, duration, formats, etc.)
3. **Image Optimizer** - Compress and optimize images while maintaining quality
4. **Batch Image Resize** - Resize multiple images at once with custom dimensions
5. **Audio Converter** - Convert audio files between different formats (MP3, WAV, etc.)
6. **Audio Denoiser** - Remove background noise from audio recordings
7. **Video Trimmer** - Trim and cut videos to specific time ranges
8. **Video Converter** - Convert videos between different formats (MP4, MKV, etc.)

### Additional Features:
- 🌓 **Dark/Light Theme Toggle** - Smooth theme switching
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- ⚡ **Fast Processing** - Optimized media processing with real-time feedback
- 🔒 **Secure** - Files processed locally, no data stored on servers
- 👤 **Creator Credit** - Designed and built by __blackfyre

---

## 🛠️ Tech Stack

### Backend
- **Flask 3.1.3** - Python web framework
- **Flask-CORS 6.0.2** - Cross-Origin Resource Sharing support
- **yt-dlp 2026.3.17** - YouTube video downloader
- **Pillow 12.2.0** - Image processing
- **pydub 0.25.1** - Audio processing
- **librosa 0.11.0** - Audio analysis
- **noisereduce 3.0.3** - Audio denoising
- **numpy 2.4.4** - Numerical computing

### Frontend
- **React 18.2.0** - UI framework
- **Vite 5.4.21** - Build tool
- **React Router v6** - Client-side routing
- **Tailwind CSS 3.4.1** - Styling
- **Google Fonts** - Advent Pro & Smooch Sans

### Deployment
- **Docker** - Containerization
- **Gunicorn** - Production WSGI server
- **FFmpeg** - Media processing library

---

## 📦 Installation

### Prerequisites
- Python 3.11+
- Node.js 18+
- FFmpeg (for video/audio processing)

### Local Setup

1. **Clone the repository:**
```bash
git clone https://github.com/blackfyr313/blacktools.git
cd blacktools
```

2. **Backend Setup:**
```bash
cd backend
pip install -r requirements.txt
```

3. **Frontend Setup:**
```bash
cd ../frontend
npm install
```

4. **Build Frontend:**
```bash
npm run build
```

5. **Run the Application:**
```bash
cd ../backend
python app.py
```

The app will be available at: **http://localhost:5000**

---

## 🚀 Usage

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
python app.py
```

**Terminal 2 - Frontend (optional, for live reload):**
```bash
cd frontend
npm run dev
```

### Production Mode

```bash
cd backend
python app.py
# App runs at http://0.0.0.0:5000
```

---

## 📂 Project Structure

```
blacktools/
├── backend/
│   ├── app.py              # Flask application with all 8 tools
│   ├── requirements.txt    # Python dependencies
│   ├── setup_dependencies.py
│   ├── downloads/          # Downloaded files
│   └── temp/               # Temporary processing files
├── frontend/
│   ├── src/
│   │   ├── components/     # React components for each tool
│   │   ├── App.jsx         # Main app component
│   │   └── index.css       # Styles
│   ├── dist/               # Production build (generated)
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── Dockerfile              # Docker container configuration
├── .gitignore
└── README.md
```

---

## 🎨 API Endpoints

All endpoints are prefixed with `/api/`

| Tool | Endpoint | Method | Description |
|------|----------|--------|-------------|
| YouTube Download | `/api/youtube-download` | POST | Download video/audio |
| YouTube Info | `/api/youtube-info` | POST | Get video information |
| Image Optimizer | `/api/image-optimize` | POST | Compress image |
| Batch Resize | `/api/batch-resize` | POST | Resize multiple images |
| Audio Convert | `/api/audio-convert` | POST | Convert audio format |
| Audio Denoise | `/api/audio-denoise` | POST | Remove background noise |
| Video Trim | `/api/video-trim` | POST | Trim video |
| Video Convert | `/api/video-convert` | POST | Convert video format |
| Social Media Download | `/api/social-download` | POST | Download from social media |
| File Compress | `/api/file-compress` | POST | Compress files to ZIP |

---

## 🐳 Docker Deployment

### Build Docker Image:
```bash
docker build -t blacktools .
```

### Run Docker Container:
```bash
docker run -p 5000:5000 blacktools
```

App will be available at: **http://localhost:5000**

---

## 🌐 Deployment Options

### Railway
1. Push code to GitHub
2. Create Railway project
3. Connect GitHub repository
4. Railway automatically deploys using Dockerfile
5. Get live URL

### Other Platforms
- Heroku
- AWS EC2
- Digital Ocean
- Google Cloud
- Azure

---

## 📝 Features Breakdown

### 1. YouTube Download
- Download complete videos or audio only
- Select quality/format
- Supports various video platforms

### 2. YouTube Info
- Get video title, duration, description
- Available download formats
- Thumbnail preview

### 3. Image Optimizer
- Reduce file size without quality loss
- Adjust compression level
- Supports multiple formats

### 4. Batch Image Resize
- Resize multiple images at once
- Custom dimensions
- Maintain aspect ratio option

### 5. Audio Converter
- Convert between MP3, WAV, OGG, etc.
- Adjust bitrate quality
- Batch conversion support

### 6. Audio Denoiser
- Remove background noise
- Adjustable noise reduction strength
- Preview before/after

### 7. Video Trimmer
- Trim videos to specific timeframe
- Precise time selection
- Preserve quality

### 8. Video Converter
- Convert between MP4, MKV, AVI, etc.
- Adjust resolution and bitrate
- Fast processing

---

## 🌓 Theme Toggle

The app includes a built-in **dark/light theme toggle** in the header. User preference is saved locally.

---

## 👤 Creator

**__blackfyre** - Full stack development, design, and media processing optimization

---

## 📜 License

Open source - Feel free to use and modify for personal or commercial projects.

---

## 🐛 Troubleshooting

### White Screen / Assets Not Loading
- Ensure `frontend/dist` folder exists
- Run `npm run build` in frontend directory
- Restart Flask server

### Dependencies Not Installing
- Use Python 3.11 or higher
- Install FFmpeg separately on Windows
- Run `pip install -r requirements.txt` again

### Port Already in Use
```bash
# Kill process on port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5000 | xargs kill -9
```

### Missing Media Libraries
Run the setup script to auto-install all dependencies:
```bash
cd backend
python setup_dependencies.py
```

---

## 🎓 Learning Resources

This project demonstrates:
- Full-stack development with Flask + React
- REST API design
- Media file processing with Python
- Docker containerization
- Responsive UI design with Tailwind CSS
- Component-based architecture

---

## 📞 Support

For issues, questions, or suggestions:
1. Check existing GitHub issues
2. Create a new issue with details
3. Include error messages and steps to reproduce

---

## 🙏 Acknowledgments

- **FFmpeg** - Media processing engine
- **yt-dlp** - YouTube downloading
- **Pillow** - Image processing
- **React** - UI framework
- **Tailwind CSS** - Styling framework

---

**Happy media processing! 🚀**

Visit the live app and start converting, optimizing, and processing your media files today!

Repository: https://github.com/blackfyr313/blacktools
