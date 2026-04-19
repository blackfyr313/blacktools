# Architecture & Design Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER BROWSER                         │
├─────────────────────────────────────────────────────────────┤
│                    REACT FRONTEND (Vite)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Navbar     │  │   Home Page  │  │   Dashboard      │  │
│  │  Component   │  │  Component   │  │   Component      │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│         │                 │                    │             │
│         └─────────────────┼────────────────────┘             │
│                           │                                  │
│                    Axios HTTP Calls                          │
│                           │                                  │
├─────────────────────────────────────────────────────────────┤
│                         NETWORK (CORS)                       │
├─────────────────────────────────────────────────────────────┤
│                    FLASK BACKEND (Python)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Health Check │  │ Video Info   │  │    Download      │  │
│  │   /health    │  │    /info     │  │   /download      │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│         │                 │                    │             │
│         └─────────────────┼────────────────────┘             │
│                           │                                  │
│                     yt-dlp Library                           │
│           (YouTube metadata & download)                     │
│                           │                                  │
│         ┌─────────────────┴────────────────┐                │
│         │                                  │                │
│      FFmpeg                           YouTube               │
│  (Audio conversion,                  (Video source)         │
│   Video merging)                                            │
│         │                                                   │
│    ┌────┴──────────────────┐                               │
│    │  Local Storage:       │                               │
│    │  - downloads/         │                               │
│    │  - temp/              │                               │
│    └───────────────────────┘                               │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Components Hierarchy

```
App (root)
├── BrowserRouter (React Router)
│   ├── Navbar (sticky navigation)
│   └── Routes
│       ├── Home page
│       │   ├── Input section (URL, Format, Quality)
│       │   ├── VideoCard (display fetched info)
│       │   ├── Loader (while processing)
│       │   └── Toast (notifications)
│       │
│       └── Dashboard
│           ├── VideoCard[] (from localStorage)
│           ├── Delete button
│           └── Download again button
```

### State Management

**Home.jsx:**
- `url` - YouTube URL input
- `videoInfo` - Fetched video metadata
- `format` - Selected format (mp4/mp3)
- `quality` - Selected quality
- `loading` - Request in progress
- `toastMessage` - Notification message
- `showToast` - Toggle notification display

**Dashboard.jsx:**
- `history` - Downloaded videos from localStorage

### LocalStorage Schema

```javascript
// Key: 'downloadHistory'
// Value: Array of download items
[
  {
    id: 1234567890,          // Timestamp
    title: "Video Title",    // From API response
    thumbnail: "URL",        // From API response
    format: "mp4" or "mp3",  // User selection
    date: "ISO string"       // Download date
  },
  // ... more items
]
```

## Backend Architecture

### API Flow

```
Client Request
      │
      ▼
Flask Route Handler
      │
      ├─ Input Validation (URL, format, quality)
      │
      ├─ Error Check
      │  └─ Invalid URL? → Return 400/404
      │
      ▼
yt-dlp Operation
      │
      ├─ /info endpoint:
      │  ├─ Extract metadata (title, duration, thumbnail)
      │  └─ Return JSON
      │
      └─ /download endpoint:
         ├─ Clean temp directory
         ├─ Configure yt-dlp options based on format/quality
         ├─ Execute download
         ├─ Post-process (FFmpeg for audio or video merge)
         ├─ Serve file to client
         └─ Clean up temp files
```

### yt-dlp Configuration

**Video (MP4):**
```python
{
    'format': 'bestvideo+bestaudio/best',  # Best quality available
    'postprocessors': [
        {
            'key': 'FFmpegVideoConvertor',
            'preferedformat': 'mp4'
        }
    ]
}
```

**Audio (MP3):**
```python
{
    'format': 'bestaudio/best',
    'postprocessors': [
        {
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192'
        }
    ]
}
```

### Error Handling

```
Request
  │
  ├─ URL Validation
  │  └─ Not YouTube URL → 400 Bad Request
  │
  ├─ Download Process
  │  └─ Video not found/unavailable → 404 Not Found
  │
  ├─ File Processing
  │  └─ FFmpeg error → 500 Internal Server Error
  │
  └─ Success → File download begins
```

## Data Flow

### 1. Fetching Video Information

```
User enters URL
    │
    ▼
Frontend: POST /api/info { url }
    │
    ▼
Backend: Extract with yt-dlp
    │
    ├─ title
    ├─ duration (seconds)
    └─ thumbnail (URL)
    │
    ▼
Frontend: Display in VideoCard
    │
    ├─ Show thumbnail image
    ├─ Show title
    └─ Show formatted duration
```

### 2. Downloading Content

```
User selects format & quality
User clicks "Download Now"
    │
    ▼
Frontend: POST /api/download { url, format, quality }
    │
    ▼
Backend: yt-dlp determines best streams
    │
    ├─ Video: bestvideo + bestaudio + FFmpeg merge
    └─ Audio: bestaudio + FFmpeg extraction
    │
    ▼
Frontend: Receives file blob
    │
    ▼
Browser download dialog
    │
    ▼
Save to ~/Downloads
    │
    ▼
localStorage: Add to history
    │
    ▼
Show success toast notification
```

## Security Considerations

### Input Validation
- URL must contain 'youtube.com' or 'youtu.be'
- No arbitrary file paths
- Content-type checking

### CORS
- Configured to accept requests from localhost
- Can be restricted in production

### File Handling
- Temporary files cleaned automatically
- Downloads isolated in `/downloads` folder
- File size limits enforced by browser

### Error Messages
- Generic error messages (don't expose system paths)
- Logging for debugging on backend

## Performance Optimizations

### Frontend
- Code splitting with React.lazy() (if needed)
- Memoization of components
- LocalStorage for instant history load
- Smooth animations with CSS transitions

### Backend
- Temp file cleanup to prevent disk bloat
- Streaming file downloads (not loading in memory)
- Format/quality mapping for faster processing
- Error handling to prevent server crashes

### Network
- Proxy in Vite reduces CORS issues
- Direct downloads (not through frontend)
- Async operations prevent blocking

## Deployment Considerations

### Frontend
- Build optimization: `npm run build`
- Static file hosting
- CDN usage for assets
- Env variables for API endpoint

### Backend
- Gunicorn for production (multiple workers)
- Environment variables for configuration
- Docker containerization
- Reverse proxy (nginx)
- SSL/TLS encryption

### Database (Optional Future Addition)
- User authentication
- Download statistics
- Premium features
- Subscription management

## Technology Reasoning

| Technology | Reason |
|------------|--------|
| React | Component reusability, Virtual DOM |
| Vite | Fast build, fast dev server, modern tooling |
| Tailwind CSS | Utility-first, dark mode support |
| Flask | Lightweight, Python ecosystem |
| yt-dlp | Better than youtube-dl, active maintenance |
| FFmpeg | Industry standard for media processing |
| Axios | Simpler than Fetch API |
| React Router | Client-side routing, no page reloads |
| LocalStorage | No backend storage needed for history |
| CORS | Secure cross-origin requests |

## Future Enhancements

1. **User Authentication**
   - Sign up / Login
   - Save downloads to user profile
   - Download limits per user

2. **Advanced Features**
   - Playlist downloads
   - Channeldownloads
   - Video trimming
   - Batch downloads
   - Download scheduling

3. **Performance**
   - Database (PostgreSQL/MongoDB)
   - Queue system (Celery)
   - Caching (Redis)
   - CDN integration

4. **Reliability**
   - Error recovery
   - Download resuming
   - Progressive web app (PWA)
   - Offline support

5. **Analytics**
   - Usage tracking
   - Popular videos
   - User statistics
