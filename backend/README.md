# Youtube Black Backend

Python Flask server for YouTube video/audio downloading

## Setup Instructions

### Prerequisites
- Python 3.8+
- FFmpeg (required for audio conversion and video merging)

### Install FFmpeg

**Windows:**
1. Download from https://ffmpeg.org/download.html
2. Extract to a folder
3. Add to PATH or install via `choco install ffmpeg` (if using Chocolatey)

**macOS:**
```bash
brew install ffmpeg
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install ffmpeg
```

### Install Python Dependencies

```bash
pip install -r requirements.txt
```

### Run the Backend

```bash
python app.py
```

The backend will start on `http://localhost:5000`

## API Endpoints

### 1. GET /health
- Health check
- Returns: `{"status": "healthy"}`

### 2. POST /info
- Extract video information
- **Input:**
  ```json
  {
    "url": "https://www.youtube.com/watch?v=..."
  }
  ```
- **Output:**
  ```json
  {
    "title": "Video Title",
    "duration": 300,
    "thumbnail": "thumbnail_url"
  }
  ```

### 3. POST /download
- Download video or audio
- **Input:**
  ```json
  {
    "url": "https://www.youtube.com/watch?v=...",
    "format": "mp4",
    "quality": "best"
  }
  ```
- **Quality Options:** best, 1080, 720, 360, 144
- **Format Options:** mp4, mp3
- **Output:** File download

## Error Handling

- Invalid URL: 400 Bad Request
- Video not found: 404 Not Found
- Server error: 500 Internal Server Error

## Troubleshooting

1. **FFmpeg not found**: Ensure FFmpeg is installed and in PATH
2. **Video unavailable**: Check if the video is available in your region
3. **CORS error**: Backend has CORS enabled for all origins
4. **Large files**: Downloads may take time depending on file size
