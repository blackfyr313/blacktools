# API Reference & Developer Guide

## Base URL

**Development:** `http://localhost:5000`

**Production:** (Configure based on deployment)

## HTTP Headers

All requests should include:
```
Content-Type: application/json
```

## API Endpoints

---

### 1. Health Check

**Endpoint:** `GET /health`

**Purpose:** Verify backend is running

**Request:**
```bash
curl http://localhost:5000/health
```

**Response (200 OK):**
```json
{
  "status": "healthy",
  "message": "Backend is running"
}
```

---

### 2. Get Video Information

**Endpoint:** `POST /info`

**Purpose:** Extract metadata from YouTube URL

**Request:**
```bash
curl -X POST http://localhost:5000/info \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  }'
```

**Request Body:**
```json
{
  "url": "string (required)"  // YouTube URL
}
```

**Response (200 OK):**
```json
{
  "title": "Rick Astley - Never Gonna Give You Up (Official Video)",
  "duration": 213,
  "thumbnail": "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
}
```

**Response Errors:**

- **400 Bad Request** - Missing or empty URL
```json
{
  "error": "URL is required"
}
```

- **400 Bad Request** - Invalid URL format
```json
{
  "error": "Invalid YouTube URL"
}
```

- **404 Not Found** - Video unavailable/deleted
```json
{
  "error": "Video not found or unavailable: ..."
}
```

- **500 Internal Server Error** - Unexpected error
```json
{
  "error": "Failed to fetch video info: ..."
}
```

---

### 3. Download Video or Audio

**Endpoint:** `POST /download`

**Purpose:** Download video as MP4 or extract audio as MP3

**Request:**
```bash
curl -X POST http://localhost:5000/download \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "format": "mp4",
    "quality": "720"
  }' \
  --output video.mp4
```

**Request Body:**
```json
{
  "url": "string (required)",           // YouTube URL
  "format": "string (required)",        // "mp4" or "mp3"
  "quality": "string (required)"        // "best", "1080", "720", "360", "144"
}
```

**Response (200 OK):**
- File stream (binary data)
- Content-Type: video/mp4 or audio/mpeg
- Content-Disposition: attachment; filename="video.mp4"

**Response Errors:**

- **400 Bad Request** - Missing/invalid parameters
```json
{
  "error": "URL is required"
}
```

- **400 Bad Request** - Invalid format
```json
{
  "error": "Invalid format. Use mp4 or mp3"
}
```

- **404 Not Found** - Video unavailable
```json
{
  "error": "Video not found or unavailable: ..."
}
```

- **500 Internal Server Error** - Download failure
```json
{
  "error": "Download failed: ..."
}
```

---

## Quality Specifications

### Video Quality (MP4)

| Quality | Resolution | Details |
|---------|-----------|---------|
| best | Highest available | Maximum quality and file size |
| 1080 | 1920×1080 | Full HD, largest file |
| 720 | 1280×720 | HD, recommended |
| 360 | 640×360 | SD, smaller file |
| 144 | 256×144 | Minimal, tiny file |

**Examples:**
- **1080p:** 50-500 MB (depends on duration)
- **720p:** 30-300 MB
- **360p:** 10-100 MB
- **144p:** 1-20 MB

### Audio Quality (MP3)

- **Codec:** MP3
- **Bitrate:** 192 kbps
- **Sample Rate:** 44.1 kHz
- **File Size:** ~1 MB per minute

---

## Frontend Integration Examples

### JavaScript/Axios

**Fetch Video Info:**
```javascript
import axios from 'axios';

const fetchVideoInfo = async (url) => {
  try {
    const response = await axios.post('/api/info', { url });
    console.log(response.data);
    // { title, duration, thumbnail }
  } catch (error) {
    console.error(error.response?.data?.error || error.message);
  }
};
```

**Download Video:**
```javascript
const downloadVideo = async (url, format, quality) => {
  try {
    const response = await axios.post(
      '/api/download',
      { url, format, quality },
      { responseType: 'blob' }
    );

    // Create download link
    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `video.${format === 'mp3' ? 'mp3' : 'mp4'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(error.response?.data?.error || error.message);
  }
};
```

### Python

**Fetch Video Info:**
```python
import requests

def fetch_video_info(url):
    response = requests.post(
        'http://localhost:5000/info',
        json={'url': url}
    )
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error: {response.json()['error']}")
        return None
```

**Download Video:**
```python
def download_video(url, format, quality):
    response = requests.post(
        'http://localhost:5000/download',
        json={'url': url, 'format': format, 'quality': quality}
    )
    if response.status_code == 200:
        filename = f'video.{format}'
        with open(filename, 'wb') as f:
            f.write(response.content)
        print(f"Downloaded: {filename}")
    else:
        print(f"Error: {response.json()['error']}")
```

---

## Response Time Expectations

| Operation | Time | Notes |
|-----------|------|-------|
| Health check | < 10ms | Simple response |
| Fetch info | 1-3 seconds | Varies by video |
| Download (720p) | 30s-5min | Depends on file size & internet |
| Download (1080p) | 2-10min | Larger files take longer |
| Download (MP3) | 10-30s | Usually faster than video |

---

## CORS Configuration

Current configuration accepts all origins:

```python
CORS(app)  # Allows all origins
```

For production, restrict to specific domain:

```python
CORS(app, origins=["https://yourdomain.com"])
```

---

## Rate Limiting (Future Enhancement)

Recommended limits:
- 10 requests per minute per IP
- 5 downloads per hour per IP
- 100 videos per day per user

Implementation:
```python
from flask_limiter import Limiter

limiter = Limiter(app)

@app.route('/download', methods=['POST'])
@limiter.limit("5/hour")
def download_video():
    # ...
```

---

## Logging

Backend logs all requests to console:

```
[2024-01-15 10:30:45] POST /info - 200 - 2.5s
[2024-01-15 10:31:12] POST /download - 200 - 45.2s
[2024-01-15 10:32:01] POST /info - 404 - InvalidURL
```

For production file logging:

```python
import logging

handler = logging.FileHandler('app.log')
app.logger.addHandler(handler)
```

---

## Troubleshooting API Issues

### Connection Refused

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:5000`

**Solution:**
- Start backend: `python app.py`
- Check port 5000 is available
- Verify localhost is accessible

### Invalid URL Error

**Error:** `{"error": "Invalid YouTube URL"}`

**Solution:**
- Use full URLs: `https://www.youtube.com/watch?v=...`
- Check URL contains 'youtube.com' or 'youtu.be'
- Avoid shortened/mangled URLs

### Video Not Found

**Error:** `{"error": "Video not found or unavailable"`

**Solution:**
- Verify video exists and is public
- Check video isn't region-blocked
- Try different URL format
- Use VPN if regionally restricted

### FFmpeg Error

**Error:** `Error: ffmpeg: command not found`

**Solution:**
- Install FFmpeg: https://ffmpeg.org
- Add to system PATH
- Restart terminal/application

### File Too Large

**Error:** Timeout or connection abort

**Solution:**
- Download lower quality
- Try MP3 instead of MP4
- Check available disk space
- Increase request timeout

---

## Best Practices

1. **Always validate URLs** on frontend before sending to API
2. **Show loading indicator** during /info and /download calls
3. **Handle errors gracefully** with user-friendly messages
4. **Clean up temp files** regularly on backend
5. **Log all requests** for debugging
6. **Use HTTPS** in production
7. **Implement rate limiting** to prevent abuse
8. **Cache thumbnails** on frontend with localStorage
9. **Show download progress** if possible (using chunks)
10. **Test with various video types** before deployment

---

## Webhook Support (Future)

Could add webhook notifications:

```json
{
  "event": "download_completed",
  "timestamp": "2024-01-15T10:30:00Z",
  "video_title": "...",
  "format": "mp4",
  "quality": "720",
  "file_size": 123456789
}
```

---

## Version History

**v1.0** (Current)
- Basic video/audio download
- Quality selection
- Frontend dashboard
- Local storage history

**v1.1** (Planned)
- Download queue
- Download scheduling
- Playlist support
- User authentication

**v2.0** (Planned)
- Database backend
- Cloud storage
- Advanced features
- Mobile app
