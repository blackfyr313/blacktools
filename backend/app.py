import os
import sys
import traceback
import tempfile
import shutil
from pathlib import Path
import subprocess
import zipfile
from PIL import Image
from pydub import AudioSegment

# ============================================================================
# DEPENDENCY SETUP - Run on startup
# ============================================================================
print("\n" + "="*70)
print("BLACK TOOLS - DEPENDENCY INITIALIZATION")
print("="*70)

# Run dependency setup
setup_script = os.path.join(os.path.dirname(__file__), 'setup_dependencies.py')
if os.path.exists(setup_script):
    try:
        result = subprocess.run([sys.executable, setup_script], capture_output=True, text=True, timeout=300)
        print(result.stdout)
        if result.returncode != 0:
            print(result.stderr)
    except Exception as e:
        print(f"Warning: Could not run setup_dependencies.py: {e}")
else:
    print("Warning: setup_dependencies.py not found")

# ============================================================================
# LIBRARY IMPORTS
# ============================================================================
from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
from yt_dlp import YoutubeDL
from yt_dlp.utils import DownloadError

# Media processing libraries
try:
    from PIL import Image
    print("[OK] PIL (Pillow) imported successfully")
except ImportError as e:
    print(f"[ERROR] Warning: PIL not available: {e}")

try:
    from pydub import AudioSegment
    print("[OK] pydub imported successfully")
except ImportError as e:
    print(f"[ERROR] Warning: pydub not available: {e}")

try:
    import librosa
    print("[OK] librosa imported successfully")
except ImportError as e:
    print(f"[ERROR] Warning: librosa not available: {e}")

try:
    import noisereduce as nr
    print("[OK] noisereduce imported successfully")
except ImportError as e:
    print(f"[ERROR] Warning: noisereduce not available: {e}")

try:
    import numpy as np
    print("[OK] numpy imported successfully")
except ImportError as e:
    print(f"[ERROR] Warning: numpy not available: {e}")

print("="*70 + "\n")

# Configure Flask with absolute path to static files
app_dir = os.path.dirname(os.path.abspath(__file__))
static_folder = os.path.join(os.path.dirname(app_dir), 'frontend', 'dist')

print(f"[DEBUG] App dir: {app_dir}")
print(f"[DEBUG] Static folder: {static_folder}")
print(f"[DEBUG] Static folder exists: {os.path.exists(static_folder)}")

app = Flask(__name__, static_folder=static_folder, static_url_path='')
CORS(app)

# Configuration
DOWNLOADS_DIR = os.path.join(os.path.dirname(__file__), 'downloads')
TEMP_DIR = os.path.join(os.path.dirname(__file__), 'temp')

# Create necessary directories
os.makedirs(DOWNLOADS_DIR, exist_ok=True)
os.makedirs(TEMP_DIR, exist_ok=True)

# Helper function to extract available formats
def extract_available_formats(info):
    """Extract available video and audio formats from yt-dlp info"""
    formats = info.get('formats', [])
    
    video_resolutions = set()
    audio_bitrates = set()
    has_audio = False
    has_video = False
    
    # Extract resolutions and bitrates
    for fmt in formats:
        # Check for video formats
        if fmt.get('vcodec') and fmt['vcodec'] != 'none':
            height = fmt.get('height')
            if height and height > 0:
                video_resolutions.add(int(height))
            has_video = True
        
        # Check for audio formats and extract bitrates
        if fmt.get('acodec') and fmt['acodec'] != 'none':
            has_audio = True
            abr = fmt.get('abr')  # audio bitrate
            if abr and abr > 0:
                audio_bitrates.add(int(abr))
    
    # Sort resolutions in descending order
    video_resolutions = sorted(list(set(video_resolutions)), reverse=True)
    
    # Sort audio bitrates in descending order
    audio_bitrates = sorted(list(set(audio_bitrates)), reverse=True)
    
    # If no bitrates found, use defaults
    if not audio_bitrates:
        audio_bitrates = [320, 256, 192, 128]
    
    # If no video resolutions found, return defaults
    if not video_resolutions:
        video_resolutions = [1080, 720, 480, 360, 240, 144]
    
    # Format the response
    available_formats = {
        'video': video_resolutions,
        'audio': audio_bitrates,
        'has_audio': has_audio,
        'has_video': has_video
    }
    
    return available_formats


# yt-dlp configuration
def get_ydl_opts(format_type='mp4', quality='best'):
    """Get yt-dlp options based on format and quality"""
    base_opts = {
        'quiet': False,
        'no_warnings': False,
        'default_search': 'none',
        'geo_bypass': True,
        'geo_bypass_country': 'US',
        'socket_timeout': 30,
        'skip_unavailable_fragments': True,
        # Realistic browser headers to avoid bot detection
        'http_headers': {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Referer': 'https://www.youtube.com/',
        },
        'extractor_args': {
            'youtube': {
                'lang': ['en'],
            }
        },
        # Retry on network errors
        'retries': 3,
    }

    if format_type == 'mp3':
        # For audio, use the specified bitrate or best available
        bitrate_map = {
            '320': '320',
            '256': '256',
            '192': '192',
            '128': '128',
            'best': '192',
        }
        target_bitrate = bitrate_map.get(quality, '192')
        
        opts = {
            **base_opts,
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': target_bitrate,
            }],
            'outtmpl': os.path.join(TEMP_DIR, '%(title)s.%(ext)s'),
        }
    else:  # mp4
        quality_map = {
            'best': 'bestvideo+bestaudio/best',
            '2160': 'bestvideo[height<=2160]+bestaudio/best[height<=2160]/best',
            '1440': 'bestvideo[height<=1440]+bestaudio/best[height<=1440]/best',
            '1080': 'bestvideo[height<=1080]+bestaudio/best[height<=1080]/best',
            '720': 'bestvideo[height<=720]+bestaudio/best[height<=720]/best',
            '480': 'bestvideo[height<=480]+bestaudio/best[height<=480]/best',
            '360': 'bestvideo[height<=360]+bestaudio/best[height<=360]/best',
            '240': 'bestvideo[height<=240]+bestaudio/best[height<=240]/best',
            '144': 'bestvideo[height<=144]+bestaudio/best[height<=144]/best',
        }
        opts = {
            **base_opts,
            'format': quality_map.get(quality, 'bestvideo+bestaudio/best'),
            'outtmpl': os.path.join(TEMP_DIR, '%(title)s.%(ext)s'),
        }

    return opts


@app.route('/api/info', methods=['POST'])
def get_video_info():
    """Extract video information from YouTube URL"""
    try:
        data = request.json
        url = data.get('url', '').strip()

        if not url:
            return jsonify({'error': 'URL is required'}), 400

        # Basic URL validation
        if not any(domain in url for domain in ['youtube.com', 'youtu.be']):
            return jsonify({'error': 'Invalid YouTube URL'}), 400

        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'default_search': 'none',
            'extract_flat': False,
            'geo_bypass': True,
            'geo_bypass_country': 'US',
            'retries': 3,
            # Add realistic browser headers
            'http_headers': {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Referer': 'https://www.youtube.com/',
            },
            # Additional options to bypass bot detection
            'socket_timeout': 30,
            'skip_unavailable_fragments': True,
            'extractor_args': {
                'youtube': {
                    'lang': ['en'],
                }
            },
        }

        with YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)

        # Extract available formats
        available_formats = extract_available_formats(info)

        return jsonify({
            'title': info.get('title', 'Unknown'),
            'duration': info.get('duration', 0),
            'thumbnail': info.get('thumbnail', ''),
            'formats': available_formats,
        }), 200

    except DownloadError as e:
        return jsonify({'error': f'Video not found or unavailable: {str(e)}'}), 404
    except Exception as e:
        print(f"Error fetching video info: {traceback.format_exc()}")
        return jsonify({'error': f'Failed to fetch video info: {str(e)}'}), 500


@app.route('/api/download', methods=['POST'])
def download_video():
    """Download video or audio from YouTube"""
    try:
        data = request.json
        url = data.get('url', '').strip()
        format_type = data.get('format', 'mp4')  # 'mp4' or 'mp3'
        quality = data.get('quality', 'best')

        if not url:
            return jsonify({'error': 'URL is required'}), 400

        if format_type not in ['mp4', 'mp3']:
            return jsonify({'error': 'Invalid format. Use mp4 or mp3'}), 400

        # Clean up temp directory
        for file in os.listdir(TEMP_DIR):
            try:
                file_path = os.path.join(TEMP_DIR, file)
                if os.path.isfile(file_path):
                    os.remove(file_path)
                elif os.path.isdir(file_path):
                    shutil.rmtree(file_path)
            except Exception as e:
                print(f"Error cleaning temp: {e}")

        # Progress hook to track download
        download_progress = {'status': 'starting', 'percent': 0, 'total': 0}
        
        def progress_hook(d):
            if d['status'] == 'downloading':
                total = d.get('total_bytes', 0)
                downloaded = d.get('downloaded_bytes', 0)
                if total > 0:
                    download_progress['percent'] = int((downloaded / total) * 100)
                    download_progress['total'] = total
                    download_progress['downloaded'] = downloaded
                    download_progress['status'] = 'downloading'
                    print(f"Download progress: {download_progress['percent']}%")
            elif d['status'] == 'finished':
                download_progress['status'] = 'finished'
                print("Download finished, now converting...")

        ydl_opts = get_ydl_opts(format_type, quality)
        ydl_opts['progress_hooks'] = [progress_hook]

        with YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            temp_filename = ydl.prepare_filename(info)
            title = info.get('title', 'download')

        if not os.path.exists(temp_filename):
            return jsonify({'error': 'Download failed: file not created'}), 500

        # Move file from temp to downloads folder with proper naming
        ext = 'mp3' if format_type == 'mp3' else 'mp4'
        safe_title = "".join(c for c in title if c.isalnum() or c in (' ', '-', '_')).rstrip()
        final_filename = f"{safe_title}.{ext}"
        final_filepath = os.path.join(DOWNLOADS_DIR, final_filename)
        
        # Handle filename conflicts
        counter = 1
        while os.path.exists(final_filepath):
            name_without_ext = safe_title
            final_filename = f"{name_without_ext}_{counter}.{ext}"
            final_filepath = os.path.join(DOWNLOADS_DIR, final_filename)
            counter += 1

        shutil.move(temp_filename, final_filepath)
        
        # Get file size
        file_size = os.path.getsize(final_filepath)
        file_size_mb = round(file_size / (1024 * 1024), 2)

        # Return file information
        return jsonify({
            'success': True,
            'message': 'Download completed successfully',
            'filename': final_filename,
            'filepath': final_filepath,
            'folder': DOWNLOADS_DIR,
            'filesize': file_size,
            'filesize_mb': file_size_mb,
            'format': format_type,
            'quality': quality,
            'title': title,
            'progress': 100
        }), 200

    except DownloadError as e:
        return jsonify({'error': f'Video not found or unavailable: {str(e)}'}), 404
    except Exception as e:
        print(f"Error downloading video: {traceback.format_exc()}")
        return jsonify({'error': f'Download failed: {str(e)}'}), 500


# ============================================================================
# IMAGE PROCESSING ENDPOINTS
# ============================================================================

@app.route('/api/image/optimize', methods=['POST'])
def optimize_image():
    """Optimize image file (compress without quality loss)"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        quality = int(request.form.get('quality', 85))
        
        # Save temp file
        temp_path = os.path.join(TEMP_DIR, file.filename)
        file.save(temp_path)
        
        # Open and optimize
        img = Image.open(temp_path)
        
        # Convert RGBA to RGB if needed
        if img.mode in ('RGBA', 'LA', 'P'):
            rgb_img = Image.new('RGB', img.size, (255, 255, 255))
            rgb_img.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = rgb_img
        
        # Optimize
        output_path = os.path.join(DOWNLOADS_DIR, f"optimized_{file.filename}")
        img.save(output_path, quality=quality, optimize=True)
        
        original_size = os.path.getsize(temp_path)
        optimized_size = os.path.getsize(output_path)
        reduction = round((1 - optimized_size / original_size) * 100, 2)
        
        os.remove(temp_path)
        
        return jsonify({
            'success': True,
            'filename': f"optimized_{file.filename}",
            'folder': DOWNLOADS_DIR,
            'original_size_kb': round(original_size / 1024, 2),
            'optimized_size_kb': round(optimized_size / 1024, 2),
            'reduction_percent': reduction,
            'quality': quality
        }), 200
        
    except Exception as e:
        print(f"Error optimizing image: {traceback.format_exc()}")
        return jsonify({'error': f'Image optimization failed: {str(e)}'}), 500


@app.route('/api/image/batch-resize', methods=['POST'])
def batch_resize_images():
    """Resize multiple images at once"""
    try:
        if 'files' not in request.files:
            return jsonify({'error': 'No files provided'}), 400
        
        files = request.files.getlist('files')
        width = int(request.form.get('width', 800))
        height = int(request.form.get('height', 600))
        maintain_aspect = request.form.get('maintain_aspect', 'true').lower() == 'true'
        
        results = []
        
        for file in files:
            if file.filename == '':
                continue
            
            try:
                temp_path = os.path.join(TEMP_DIR, file.filename)
                file.save(temp_path)
                
                img = Image.open(temp_path)
                
                if maintain_aspect:
                    img.thumbnail((width, height), Image.Resampling.LANCZOS)
                else:
                    img = img.resize((width, height), Image.Resampling.LANCZOS)
                
                output_filename = f"resized_{file.filename}"
                output_path = os.path.join(DOWNLOADS_DIR, output_filename)
                img.save(output_path, quality=95, optimize=True)
                
                os.remove(temp_path)
                
                results.append({
                    'original': file.filename,
                    'resized': output_filename,
                    'size': f"{width}x{height}",
                    'maintain_aspect': maintain_aspect
                })
            except Exception as e:
                results.append({
                    'original': file.filename,
                    'error': str(e)
                })
        
        return jsonify({
            'success': True,
            'results': results,
            'total': len(files),
            'successful': len([r for r in results if 'error' not in r])
        }), 200
        
    except Exception as e:
        print(f"Error batch resizing images: {traceback.format_exc()}")
        return jsonify({'error': f'Batch resize failed: {str(e)}'}), 500


# ============================================================================
# AUDIO PROCESSING ENDPOINTS
# ============================================================================

@app.route('/api/audio/convert', methods=['POST'])
def convert_audio():
    """Convert audio between formats (MP3, WAV, AAC, FLAC)"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        output_format = request.form.get('format', 'mp3').lower()
        bitrate = request.form.get('bitrate', '192')
        
        if output_format not in ['mp3', 'wav', 'aac', 'flac']:
            return jsonify({'error': 'Unsupported format'}), 400
        
        # Save temp file
        temp_path = os.path.join(TEMP_DIR, file.filename)
        file.save(temp_path)
        
        # Load audio
        audio = AudioSegment.from_file(temp_path)
        
        # Export
        output_filename = f"{os.path.splitext(file.filename)[0]}.{output_format}"
        output_path = os.path.join(DOWNLOADS_DIR, output_filename)
        
        export_params = {
            'format': output_format,
            'bitrate': f"{bitrate}k" if output_format != 'wav' else None
        }
        if output_format == 'wav':
            del export_params['bitrate']
        
        audio.export(output_path, **export_params)
        
        original_size = os.path.getsize(temp_path)
        converted_size = os.path.getsize(output_path)
        duration_seconds = len(audio) / 1000
        
        os.remove(temp_path)
        
        return jsonify({
            'success': True,
            'filename': output_filename,
            'folder': DOWNLOADS_DIR,
            'format': output_format,
            'bitrate': f"{bitrate}k",
            'duration_seconds': round(duration_seconds, 2),
            'original_size_kb': round(original_size / 1024, 2),
            'converted_size_kb': round(converted_size / 1024, 2)
        }), 200
        
    except Exception as e:
        print(f"Error converting audio: {traceback.format_exc()}")
        return jsonify({'error': f'Audio conversion failed: {str(e)}'}), 500


@app.route('/api/audio/denoise', methods=['POST'])
def denoise_audio():
    """Remove background noise from audio"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        intensity = float(request.form.get('intensity', 0.5))
        
        # Save temp file
        temp_path = os.path.join(TEMP_DIR, file.filename)
        file.save(temp_path)
        
        # Load audio with librosa
        y, sr = librosa.load(temp_path)
        
        # Apply noise reduction
        reduced = nr.reduce_noise(y=y, sr=sr)
        
        # Export
        output_filename = f"denoised_{file.filename}"
        output_path = os.path.join(DOWNLOADS_DIR, output_filename)
        
        # Save using pydub
        audio = AudioSegment.from_file(temp_path)
        audio.export(output_path)
        
        os.remove(temp_path)
        
        return jsonify({
            'success': True,
            'filename': output_filename,
            'folder': DOWNLOADS_DIR,
            'intensity': intensity,
            'original_size_kb': round(os.path.getsize(temp_path) / 1024, 2) if os.path.exists(temp_path) else 0
        }), 200
        
    except Exception as e:
        print(f"Error denoising audio: {traceback.format_exc()}")
        return jsonify({'error': f'Audio denoising failed: {str(e)}'}), 500


# ============================================================================
# VIDEO PROCESSING ENDPOINTS
# ============================================================================

@app.route('/api/video/trim', methods=['POST'])
def trim_video():
    """Trim video to specified time range"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        start_time = request.form.get('start_time', '0')  # seconds
        end_time = request.form.get('end_time', '10')      # seconds
        
        temp_path = os.path.join(TEMP_DIR, file.filename)
        file.save(temp_path)
        
        output_filename = f"trimmed_{file.filename}"
        output_path = os.path.join(DOWNLOADS_DIR, output_filename)
        
        # Use FFmpeg via subprocess
        cmd = [
            'ffmpeg', '-i', temp_path,
            '-ss', str(start_time),
            '-to', str(end_time),
            '-c:v', 'libx264',
            '-c:a', 'aac',
            '-y', output_path
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        
        if result.returncode != 0:
            raise Exception(f"FFmpeg error: {result.stderr}")
        
        os.remove(temp_path)
        
        file_size = os.path.getsize(output_path)
        
        return jsonify({
            'success': True,
            'filename': output_filename,
            'folder': DOWNLOADS_DIR,
            'start_time': start_time,
            'end_time': end_time,
            'filesize_mb': round(file_size / (1024 * 1024), 2)
        }), 200
        
    except Exception as e:
        print(f"Error trimming video: {traceback.format_exc()}")
        return jsonify({'error': f'Video trim failed: {str(e)}'}), 500


@app.route('/api/video/convert', methods=['POST'])
def convert_video():
    """Convert video to different format"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        output_format = request.form.get('format', 'mp4').lower()
        quality = request.form.get('quality', 'medium')  # low, medium, high
        
        quality_map = {
            'low': '20',
            'medium': '23',
            'high': '18'
        }
        crf = quality_map.get(quality, '23')
        
        temp_path = os.path.join(TEMP_DIR, file.filename)
        file.save(temp_path)
        
        output_filename = f"{os.path.splitext(file.filename)[0]}.{output_format}"
        output_path = os.path.join(DOWNLOADS_DIR, output_filename)
        
        # FFmpeg conversion
        cmd = [
            'ffmpeg', '-i', temp_path,
            '-c:v', 'libx264',
            '-crf', crf,
            '-c:a', 'aac',
            '-q:a', '5',
            '-y', output_path
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
        
        if result.returncode != 0:
            raise Exception(f"FFmpeg error: {result.stderr}")
        
        os.remove(temp_path)
        
        original_size = os.path.getsize(temp_path) if os.path.exists(temp_path) else 0
        converted_size = os.path.getsize(output_path)
        
        return jsonify({
            'success': True,
            'filename': output_filename,
            'folder': DOWNLOADS_DIR,
            'format': output_format,
            'quality': quality,
            'filesize_mb': round(converted_size / (1024 * 1024), 2)
        }), 200
        
    except Exception as e:
        print(f"Error converting video: {traceback.format_exc()}")
        return jsonify({'error': f'Video conversion failed: {str(e)}'}), 500


# ============================================================================
# FILE PROCESSING ENDPOINTS
# ============================================================================

@app.route('/api/file/compress', methods=['POST'])
def compress_files():
    """Compress files into ZIP archive"""
    try:
        if 'files' not in request.files:
            return jsonify({'error': 'No files provided'}), 400
        
        files = request.files.getlist('files')
        archive_name = request.form.get('archive_name', 'archive.zip')
        
        if not archive_name.endswith('.zip'):
            archive_name += '.zip'
        
        archive_path = os.path.join(DOWNLOADS_DIR, archive_name)
        
        import zipfile
        with zipfile.ZipFile(archive_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for file in files:
                if file.filename != '':
                    temp_path = os.path.join(TEMP_DIR, file.filename)
                    file.save(temp_path)
                    zipf.write(temp_path, arcname=file.filename)
                    os.remove(temp_path)
        
        archive_size = os.path.getsize(archive_path)
        
        return jsonify({
            'success': True,
            'filename': archive_name,
            'folder': DOWNLOADS_DIR,
            'filesize_mb': round(archive_size / (1024 * 1024), 2),
            'files_compressed': len(files)
        }), 200
        
    except Exception as e:
        print(f"Error compressing files: {traceback.format_exc()}")
        return jsonify({'error': f'File compression failed: {str(e)}'}), 500


# ============================================================================
# SOCIAL MEDIA DOWNLOAD ENDPOINTS
# ============================================================================

@app.route('/api/social/download', methods=['POST'])
def download_social_media():
    """Download videos from Instagram, TikTok, Facebook, Twitter"""
    try:
        data = request.json
        url = data.get('url', '').strip()
        platform = data.get('platform', 'auto').lower()
        
        if not url:
            return jsonify({'error': 'URL is required'}), 400
        
        # Clean temp directory
        for file in os.listdir(TEMP_DIR):
            try:
                file_path = os.path.join(TEMP_DIR, file)
                if os.path.isfile(file_path):
                    os.remove(file_path)
            except:
                pass
        
        def progress_hook(d):
            if d['status'] == 'downloading':
                print(f"Download progress: {d.get('_percent_str', 'N/A')}")
            elif d['status'] == 'finished':
                print("Download finished, processing...")
        
        ydl_opts = {
            'quiet': False,
            'no_warnings': False,
            'default_search': 'none',
            'outtmpl': os.path.join(TEMP_DIR, '%(title)s.%(ext)s'),
            'progress_hooks': [progress_hook],
            'socket_timeout': 30,
            'skip_unavailable_fragments': True,
            # Realistic browser headers
            'http_headers': {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Referer': 'https://www.youtube.com/',
            },
        }
        
        with YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            temp_filename = ydl.prepare_filename(info)
            title = info.get('title', 'download')
            ext = info.get('ext', 'mp4')
        
        if not os.path.exists(temp_filename):
            return jsonify({'error': 'Download failed: file not created'}), 500
        
        # Move to downloads
        safe_title = "".join(c for c in title if c.isalnum() or c in (' ', '-', '_')).rstrip()
        final_filename = f"{safe_title}.{ext}"
        final_filepath = os.path.join(DOWNLOADS_DIR, final_filename)
        
        counter = 1
        while os.path.exists(final_filepath):
            final_filename = f"{safe_title}_{counter}.{ext}"
            final_filepath = os.path.join(DOWNLOADS_DIR, final_filename)
            counter += 1
        
        shutil.move(temp_filename, final_filepath)
        
        file_size = os.path.getsize(final_filepath)
        file_size_mb = round(file_size / (1024 * 1024), 2)
        
        return jsonify({
            'success': True,
            'filename': final_filename,
            'folder': DOWNLOADS_DIR,
            'filesize_mb': file_size_mb,
            'title': title,
            'platform': platform
        }), 200
        
    except Exception as e:
        print(f"Error downloading social media: {traceback.format_exc()}")
        return jsonify({'error': f'Download failed: {str(e)}'}), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Backend is running'}), 200


# Serve favicon/icon directly
@app.route('/black_tool.png')
def serve_icon():
    """Serve the favicon"""
    try:
        icon_path = os.path.join(app.static_folder, 'black_tool.png')
        if os.path.exists(icon_path):
            return send_file(icon_path, mimetype='image/png')
        else:
            print(f"[ERROR] Icon not found at {icon_path}")
            print(f"[DEBUG] Static folder: {app.static_folder}")
            print(f"[DEBUG] Static folder exists: {os.path.exists(app.static_folder)}")
            print(f"[DEBUG] Contents: {os.listdir(app.static_folder) if os.path.exists(app.static_folder) else 'N/A'}")
            return 'Icon not found', 404
    except Exception as e:
        print(f"[ERROR] Error serving icon: {e}")
        return f'Error: {str(e)}', 500


# Serve React app
@app.route('/')
def serve_index():
    """Serve the React app index.html"""
    return send_from_directory(app.static_folder, 'index.html')


@app.route('/<path:filename>')
def serve_static(filename):
    """Serve static files"""
    return send_from_directory(app.static_folder, filename)


@app.errorhandler(404)
def not_found(e):
    """Fallback to React app for client-side routing"""
    if request.path.startswith('/api'):
        return jsonify({'error': 'API endpoint not found'}), 404
    return send_from_directory(app.static_folder, 'index.html')


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))  # ✅ This line matters!
    app.run(debug=True, host='0.0.0.0', port=port)
