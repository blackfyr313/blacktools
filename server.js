import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import ffmpeg from 'fluent-ffmpeg';
import sharp from 'sharp';
import { execSync, spawn } from 'child_process';
import archiver from 'archiver';

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// Create necessary directories
const DOWNLOADS_DIR = path.join(__dirname, 'backend/downloads');
const TEMP_DIR = path.join(__dirname, 'backend/temp');

[DOWNLOADS_DIR, TEMP_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Setup multer for file uploads
const upload = multer({ dest: TEMP_DIR });

console.log('\n' + '='.repeat(70));
console.log('BLACK TOOLS - Node.js Backend');
console.log('='.repeat(70));
console.log(`[OK] Express server initialized`);
console.log(`[OK] Static folder: ${path.join(__dirname, 'frontend/dist')}`);
console.log(`[OK] Downloads folder: ${DOWNLOADS_DIR}`);
console.log(`[OK] Temp folder: ${TEMP_DIR}`);
console.log('='.repeat(70) + '\n');

// ============================================================================
// YOUTUBE ENDPOINTS (Using yt-dlp command)
// ============================================================================

app.post('/api/info', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    // Use yt-dlp command to get JSON info
    try {
      const output = execSync(
        `yt-dlp -j "${url}" --no-warnings`,
        { encoding: 'utf-8', timeout: 30000, maxBuffer: 10 * 1024 * 1024 }
      );
      const info = JSON.parse(output);

      return res.json({
        title: info.title,
        duration: info.duration,
        thumbnail: info.thumbnail,
        formats: {
          video: [1080, 720, 480, 360, 240],
          audio: [320, 256, 192, 128],
          has_audio: true,
          has_video: true,
        },
      });
    } catch (error) {
      console.error('[ERROR] yt-dlp command:', error.message);
      return res.status(500).json({
        error: `Could not extract video info. Make sure yt-dlp is installed: ${error.message}`,
      });
    }
  } catch (error) {
    console.error('[ERROR] YouTube info:', error.message);
    return res.status(500).json({ error: `Failed to fetch video info: ${error.message}` });
  }
});

app.post('/api/download', async (req, res) => {
  try {
    const { url, format, quality } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const formatType = format || 'mp4';
    const qualityLevel = quality || 'best';

    // Clean temp directory
    fs.readdirSync(TEMP_DIR).forEach(file => {
      try {
        fs.unlinkSync(path.join(TEMP_DIR, file));
      } catch (e) {
        console.log(`Could not delete temp file: ${file}`);
      }
    });

    // Use yt-dlp to download
    const title = 'video';
    const ext = formatType === 'mp3' ? 'mp3' : 'mp4';
    let outputPath = path.join(DOWNLOADS_DIR, `${title}.${ext}`);
    let counter = 1;
    while (fs.existsSync(outputPath)) {
      outputPath = path.join(DOWNLOADS_DIR, `${title}_${counter}.${ext}`);
      counter++;
    }

    return new Promise((resolve, reject) => {
      let command = `yt-dlp "${url}" `;

      if (formatType === 'mp3') {
        command += `-x --audio-format mp3 --audio-quality ${qualityLevel}`;
      } else {
        command += `-f "best[ext=mp4]"`;
      }

      command += ` -o "${outputPath}" --no-warnings`;

      const child = spawn('cmd', ['/c', command], {
        stdio: ['ignore', 'pipe', 'pipe'],
        timeout: 600000,
        maxBuffer: 10 * 1024 * 1024,
      });

      child.on('close', (code) => {
        if (code === 0 && fs.existsSync(outputPath)) {
          const fileSize = fs.statSync(outputPath).size;
          resolve(res.json({
            success: true,
            filename: path.basename(outputPath),
            folder: DOWNLOADS_DIR,
            filesize_mb: (fileSize / (1024 * 1024)).toFixed(2),
            format: formatType,
            quality: qualityLevel,
            title: 'Downloaded Media',
          }));
        } else {
          reject(new Error(`yt-dlp failed with code ${code}`));
        }
      });

      child.on('error', reject);
    });
  } catch (error) {
    console.error('[ERROR] YouTube download:', error.message);
    return res.status(500).json({ error: `Download failed: ${error.message}` });
  }
});

// ============================================================================
// IMAGE ENDPOINTS
// ============================================================================

app.post('/api/image/optimize', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const quality = parseInt(req.body.quality || 85);
    const inputPath = req.file.path;
    const outputPath = path.join(DOWNLOADS_DIR, `optimized_${req.file.originalname}`);

    const originalSize = fs.statSync(inputPath).size;

    await sharp(inputPath)
      .jpeg({ quality, progressive: true, mozjpeg: true })
      .toFile(outputPath);

    fs.unlinkSync(inputPath);

    const optimizedSize = fs.statSync(outputPath).size;
    const reduction = ((1 - optimizedSize / originalSize) * 100).toFixed(2);

    return res.json({
      success: true,
      filename: `optimized_${req.file.originalname}`,
      folder: DOWNLOADS_DIR,
      original_size_kb: (originalSize / 1024).toFixed(2),
      optimized_size_kb: (optimizedSize / 1024).toFixed(2),
      reduction_percent: reduction,
      quality,
    });
  } catch (error) {
    console.error('[ERROR] Image optimize:', error.message);
    return res.status(500).json({ error: `Image optimization failed: ${error.message}` });
  }
});

app.post('/api/image/batch-resize', upload.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const width = parseInt(req.body.width || 800);
    const height = parseInt(req.body.height || 600);
    const maintainAspect = req.body.maintain_aspect !== 'false';

    const results = [];

    for (const file of req.files) {
      try {
        const outputPath = path.join(DOWNLOADS_DIR, `resized_${file.originalname}`);

        if (maintainAspect) {
          await sharp(file.path)
            .resize(width, height, { fit: 'inside', withoutEnlargement: true })
            .toFile(outputPath);
        } else {
          await sharp(file.path)
            .resize(width, height, { fit: 'fill' })
            .toFile(outputPath);
        }

        fs.unlinkSync(file.path);

        results.push({
          original: file.originalname,
          resized: `resized_${file.originalname}`,
          size: `${width}x${height}`,
          maintain_aspect: maintainAspect,
        });
      } catch (error) {
        results.push({
          original: file.originalname,
          error: error.message,
        });
      }
    }

    return res.json({
      success: true,
      results,
      total: req.files.length,
      successful: results.filter(r => !r.error).length,
    });
  } catch (error) {
    console.error('[ERROR] Batch resize:', error.message);
    return res.status(500).json({ error: `Batch resize failed: ${error.message}` });
  }
});

// ============================================================================
// AUDIO ENDPOINTS
// ============================================================================

app.post('/api/audio/convert', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const outputFormat = (req.body.format || 'mp3').toLowerCase();
    const bitrate = req.body.bitrate || '192';
    const inputPath = req.file.path;
    const outputPath = path.join(
      DOWNLOADS_DIR,
      `${path.parse(req.file.originalname).name}.${outputFormat}`
    );

    const originalSize = fs.statSync(inputPath).size;

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .toFormat(outputFormat)
        .audioBitrate(`${bitrate}k`)
        .on('end', () => {
          fs.unlinkSync(inputPath);
          const convertedSize = fs.statSync(outputPath).size;

          resolve(res.json({
            success: true,
            filename: path.basename(outputPath),
            folder: DOWNLOADS_DIR,
            format: outputFormat,
            bitrate: `${bitrate}k`,
            original_size_kb: (originalSize / 1024).toFixed(2),
            converted_size_kb: (convertedSize / 1024).toFixed(2),
          }));
        })
        .on('error', reject)
        .save(outputPath);
    });
  } catch (error) {
    console.error('[ERROR] Audio convert:', error.message);
    return res.status(500).json({ error: `Audio conversion failed: ${error.message}` });
  }
});

app.post('/api/audio/denoise', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const inputPath = req.file.path;
    const outputPath = path.join(DOWNLOADS_DIR, `denoised_${req.file.originalname}`);

    return new Promise((resolve, reject) => {
      // Use ffmpeg's anlmdn filter for noise reduction
      ffmpeg(inputPath)
        .audioFilters('anlmdn=f=13:t=0.002:tr=1:om=o')
        .on('end', () => {
          fs.unlinkSync(inputPath);
          resolve(res.json({
            success: true,
            filename: `denoised_${req.file.originalname}`,
            folder: DOWNLOADS_DIR,
            intensity: 0.5,
          }));
        })
        .on('error', reject)
        .save(outputPath);
    });
  } catch (error) {
    console.error('[ERROR] Audio denoise:', error.message);
    return res.status(500).json({ error: `Audio denoising failed: ${error.message}` });
  }
});

// ============================================================================
// VIDEO ENDPOINTS
// ============================================================================

app.post('/api/video/trim', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const startTime = req.body.start_time || '0';
    const endTime = req.body.end_time || '10';
    const inputPath = req.file.path;
    const outputPath = path.join(DOWNLOADS_DIR, `trimmed_${req.file.originalname}`);

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .setStartTime(startTime)
        .setDuration(parseInt(endTime) - parseInt(startTime))
        .videoCodec('libx264')
        .audioCodec('aac')
        .on('end', () => {
          fs.unlinkSync(inputPath);
          const fileSize = fs.statSync(outputPath).size;
          resolve(res.json({
            success: true,
            filename: `trimmed_${req.file.originalname}`,
            folder: DOWNLOADS_DIR,
            start_time: startTime,
            end_time: endTime,
            filesize_mb: (fileSize / (1024 * 1024)).toFixed(2),
          }));
        })
        .on('error', reject)
        .save(outputPath);
    });
  } catch (error) {
    console.error('[ERROR] Video trim:', error.message);
    return res.status(500).json({ error: `Video trim failed: ${error.message}` });
  }
});

app.post('/api/video/convert', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const outputFormat = req.body.format || 'mp4';
    const quality = req.body.quality || 'medium';
    const inputPath = req.file.path;
    const outputPath = path.join(
      DOWNLOADS_DIR,
      `${path.parse(req.file.originalname).name}.${outputFormat}`
    );

    const qualityMap = {
      low: '28',
      medium: '23',
      high: '18',
    };
    const crf = qualityMap[quality] || '23';

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .videoCodec('libx264')
        .outputOptions('-crf', crf)
        .audioCodec('aac')
        .audioBitrate('128k')
        .on('end', () => {
          fs.unlinkSync(inputPath);
          const fileSize = fs.statSync(outputPath).size;
          resolve(res.json({
            success: true,
            filename: `${path.parse(req.file.originalname).name}.${outputFormat}`,
            folder: DOWNLOADS_DIR,
            format: outputFormat,
            quality,
            filesize_mb: (fileSize / (1024 * 1024)).toFixed(2),
          }));
        })
        .on('error', reject)
        .save(outputPath);
    });
  } catch (error) {
    console.error('[ERROR] Video convert:', error.message);
    return res.status(500).json({ error: `Video conversion failed: ${error.message}` });
  }
});

// ============================================================================
// FILE ENDPOINTS
// ============================================================================

app.post('/api/file/compress', upload.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const archiveName = req.body.archive_name || 'archive.zip';
    const outputPath = path.join(DOWNLOADS_DIR, archiveName.endsWith('.zip') ? archiveName : `${archiveName}.zip`);

    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(outputPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      archive.on('end', () => {
        const fileSize = fs.statSync(outputPath).size;
        // Clean up temp files
        req.files.forEach(file => {
          try {
            fs.unlinkSync(file.path);
          } catch (e) {
            console.log(`Could not delete: ${file.path}`);
          }
        });

        resolve(res.json({
          success: true,
          filename: path.basename(outputPath),
          folder: DOWNLOADS_DIR,
          filesize_mb: (fileSize / (1024 * 1024)).toFixed(2),
          files_compressed: req.files.length,
        }));
      });

      archive.on('error', reject);
      archive.pipe(output);

      req.files.forEach(file => {
        archive.file(file.path, { name: file.originalname });
      });

      archive.finalize();
    });
  } catch (error) {
    console.error('[ERROR] File compress:', error.message);
    return res.status(500).json({ error: `File compression failed: ${error.message}` });
  }
});

// ============================================================================
// SOCIAL MEDIA ENDPOINT
// ============================================================================

app.post('/api/social/download', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Use yt-dlp for social media download
    const title = 'social_media_download';
    let outputPath = path.join(DOWNLOADS_DIR, `${title}.mp4`);
    let counter = 1;
    while (fs.existsSync(outputPath)) {
      outputPath = path.join(DOWNLOADS_DIR, `${title}_${counter}.mp4`);
      counter++;
    }

    return new Promise((resolve, reject) => {
      const command = `yt-dlp "${url}" -f "best[ext=mp4]" -o "${outputPath}" --no-warnings`;
      
      const child = spawn('cmd', ['/c', command], {
        stdio: ['ignore', 'pipe', 'pipe'],
        timeout: 300000,
        maxBuffer: 10 * 1024 * 1024,
      });

      child.on('close', (code) => {
        if (code === 0 && fs.existsSync(outputPath)) {
          const fileSize = fs.statSync(outputPath).size;
          resolve(res.json({
            success: true,
            filename: path.basename(outputPath),
            folder: DOWNLOADS_DIR,
            filesize_mb: (fileSize / (1024 * 1024)).toFixed(2),
            title: 'Social Media Download',
          }));
        } else {
          reject(new Error(`Download failed with code ${code}`));
        }
      });

      child.on('error', reject);
    });
  } catch (error) {
    console.error('[ERROR] Social media download:', error.message);
    return res.status(500).json({ error: `Download failed: ${error.message}` });
  }
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', message: 'Backend is running' });
});

// ============================================================================
// SERVE REACT APP
// ============================================================================

app.get('/black_tool.png', (req, res) => {
  const iconPath = path.join(__dirname, 'frontend/dist/black_tool.png');
  if (fs.existsSync(iconPath)) {
    return res.sendFile(iconPath);
  }
  res.status(404).send('Icon not found');
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

app.get('/*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n[OK] Server running on http://0.0.0.0:${PORT}`);
  console.log(`[OK] Frontend: ${path.join(__dirname, 'frontend/dist')}`);
  console.log(`[OK] All 8 tools ready!\n`);
});
