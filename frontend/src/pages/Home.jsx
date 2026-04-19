import React, { useState } from 'react';
import axios from 'axios';
import { Loader } from '../components/Loader';
import { Toast } from '../components/Toast';
import { VideoCard } from '../components/VideoCard';
import { Footer } from '../components/Footer';

const isValidYoutubeUrl = (url) => {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=[\w-]+/,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/[\w-]+/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/playlist\?list=[\w-]+/,
  ];
  return patterns.some((pattern) => pattern.test(url));
};

const getQualityLabel = (quality, isAudio = false) => {
  if (isAudio) {
    return `${quality} kbps`;
  }
  const labels = {
    'best': 'Best Available',
    '2160': '4K (2160p)',
    '1440': '2K (1440p)',
    '1080': 'Full HD (1080p)',
    '720': 'HD (720p)',
    '480': 'SD (480p)',
    '360': 'Low (360p)',
    '240': 'Very Low (240p)',
    '144': 'Minimal (144p)',
  };
  return labels[String(quality)] || `${quality}p`;
};

export const Home = () => {
  const [url, setUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [format, setFormat] = useState('mp4');
  const [quality, setQuality] = useState('best');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [showToast, setShowToast] = useState(false);
  const [videoQualities, setVideoQualities] = useState([]);
  const [audioQualities, setAudioQualities] = useState([]);
  const [hasAudio, setHasAudio] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadInfo, setDownloadInfo] = useState(null);

  const showNotification = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const handleFetchInfo = async () => {
    if (!url.trim()) {
      showNotification('Please enter a YouTube URL', 'error');
      return;
    }

    if (!isValidYoutubeUrl(url)) {
      showNotification('Please enter a valid YouTube URL', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/info', { url });
      setVideoInfo(response.data);

      // Set available formats
      if (response.data.formats) {
        const vQualities = response.data.formats.video || [1080, 720, 480, 360, 240];
        const aQualities = response.data.formats.audio || [320, 256, 192, 128];
        
        // Create quality options: best + all available video resolutions
        setVideoQualities(['best', ...vQualities.map(q => String(q))]);
        // Audio qualities as-is (already in kbps)
        setAudioQualities(aQualities.map(q => String(q)));
        
        setQuality('best');
        setHasAudio(response.data.formats.has_audio);
      }

      showNotification('Video info loaded successfully!');
    } catch (error) {
      showNotification(
        error.response?.data?.error || 'Failed to fetch video info',
        'error'
      );
      setVideoInfo(null);
      setVideoQualities([]);
      setAudioQualities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!videoInfo) {
      showNotification('Please fetch video info first', 'error');
      return;
    }

    setDownloadProgress(0);
    setDownloadInfo(null);
    
    try {
      // Simulate progress (but don't show full screen loader during download)
      const progressInterval = setInterval(() => {
        setDownloadProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 20;
        });
      }, 500);

      const response = await axios.post(
        '/api/download',
        {
          url,
          format,
          quality: quality === 'best' ? 'best' : quality,
        }
      );

      clearInterval(progressInterval);
      setDownloadProgress(100);

      // Use the JSON response with download info
      if (response.data.success) {
        setDownloadInfo(response.data);
        
        // Save to history with enhanced info
        const history = JSON.parse(localStorage.getItem('downloadHistory') || '[]');
        const qualityLabel = format === 'mp3' ? `${quality}kbps` : (quality === 'best' ? 'Best' : `${quality}p`);
        history.unshift({
          id: Date.now(),
          title: response.data.title || videoInfo.title,
          thumbnail: videoInfo.thumbnail,
          format,
          quality: qualityLabel,
          date: new Date().toISOString(),
          downloadedAt: new Date().toLocaleString(),
          filesize: response.data.filesize_mb,
          filename: response.data.filename,
        });
        localStorage.setItem('downloadHistory', JSON.stringify(history.slice(0, 50)));

        showNotification(
          `✅ Download completed!\n📁 Saved: ${response.data.filename}\n💾 Size: ${response.data.filesize_mb} MB`,
          'success'
        );
      }
    } catch (error) {
      setDownloadProgress(0);
      showNotification(
        error.response?.data?.error || 'Download failed',
        'error'
      );
    } finally {
      // Reset progress after 3 seconds
      setTimeout(() => setDownloadProgress(0), 3000);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-10" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Loader visible={loading} />
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}

      <div className="max-w-4xl mx-auto px-6">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-in fade-in stagger-in">
          <div className="inline-block mb-4">
            <div className="px-4 py-2 bg-purple-500 bg-opacity-20 border border-purple-500 border-opacity-30 rounded-full">
              <span className="text-sm font-semibold text-purple-300">TOOL</span>
            </div>
          </div>
          <h1 className="text-5xl sm:text-7xl font-bold mb-4 glow-text animate-text">
            YouTube Black
          </h1>
          <p className="text-xl sm:text-2xl mb-8 fade-in-up" style={{ color: 'var(--text-secondary)', animationDelay: '0.2s' }}>
            Download videos & audio in the highest quality
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full float"></div>
        </div>

        {/* Input Section */}
        <div className="space-y-6 mb-8 fade-in-up">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFetchInfo()}
              placeholder="Paste YouTube URL here..."
              className="input-glass flex-1 text-lg transition-smooth hover-glow" style={{ color: 'var(--text-primary)' }}
            />
            <button
              onClick={handleFetchInfo}
              disabled={loading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed hover-lift"
            >
              Fetch Info
            </button>
          </div>
        </div>

        {/* Video Info Section */}
        {videoInfo && (
          <div className="glass-dark rounded-2xl p-6 sm:p-8 space-y-6 animate-card hover-lift">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 stagger-in">
              {/* Thumbnail */}
              <div className="sm:col-span-1">
                <img
                  src={videoInfo.thumbnail}
                  alt={videoInfo.title}
                  className="w-full rounded-xl object-cover h-40 sm:h-48 hover-lift transition-smooth shadow-glow-md"
                />
              </div>

              {/* Info */}
              <div className="sm:col-span-2 space-y-4">
                <div className="fade-in-up">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-gradient">{videoInfo.title}</h2>
                  <p className="text-gray-400" style={{ color: 'var(--text-secondary)' }}>
                    Duration:{' '}
                    <span className="text-white font-semibold glow-text" style={{ color: 'var(--text-primary)' }}>
                      {Math.floor(videoInfo.duration / 60)}:
                      {String(videoInfo.duration % 60).padStart(2, '0')}
                    </span>
                  </p>
                </div>

                {/* Format & Quality */}
                <div className="grid grid-cols-2 gap-4 fade-in-up" style={{ animationDelay: '0.1s' }}>
                  <div>
                    <label className="text-sm mb-2 block font-semibold" style={{ color: 'var(--text-secondary)' }}>
                      Format
                    </label>
                    <select
                      value={format}
                      onChange={(e) => {
                        setFormat(e.target.value);
                        // Reset quality when format changes
                        if (e.target.value === 'mp3' && audioQualities.length > 0) {
                          setQuality(audioQualities[0]);
                        } else if (e.target.value === 'mp4' && videoQualities.length > 0) {
                          setQuality('best');
                        }
                      }}
                      className="input-glass w-full text-lg"
                    >
                      <option value="mp4">MP4 (Video)</option>
                      {hasAudio && <option value="mp3">MP3 (Audio)</option>}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block font-semibold">
                      Quality ({format === 'mp4' ? videoQualities.length : audioQualities.length})
                    </label>
                    <select
                      value={quality}
                      onChange={(e) => setQuality(e.target.value)}
                      className="input-glass w-full text-lg"
                    >
                      {format === 'mp4' ? (
                        videoQualities.map((q) => (
                          <option key={q} value={q}>
                            {getQualityLabel(q, false)}
                          </option>
                        ))
                      ) : (
                        audioQualities.map((q) => (
                          <option key={q} value={q}>
                            {getQualityLabel(q, true)}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                {/* Available Resolutions Info */}
                <div className="bg-purple-500 bg-opacity-10 p-4 rounded-lg border border-purple-500 border-opacity-30 fade-in-up transition-smooth hover-glow" style={{ animationDelay: '0.2s' }}>
                  <p className="text-sm text-gray-300 font-medium">
                    {format === 'mp4' ? (
                      <>📽️ Available Video: {videoQualities.filter(q => q !== 'best').join('p, ')}p</>
                    ) : (
                      <>🎵 Available Audio: {audioQualities.join(' kbps, ')} kbps</>
                    )}
                  </p>
                </div>

                {/* Download Button */}
                <button
                  onClick={handleDownload}
                  disabled={loading}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed hover-lift text-lg font-bold"
                >
                  ⬇ Download Now
                </button>

                {/* Progress Bar */}
                {downloadProgress > 0 && (
                  <div className="space-y-2 fade-in-up">
                    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden shadow-glow-md">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-full transition-all duration-300"
                        style={{ width: `${downloadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-400 text-center font-semibold animate-text">
                      {downloadProgress < 100 ? (
                        <>
                          📥 Downloading: {Math.round(downloadProgress)}%
                        </>
                      ) : (
                        <>✅ Download Complete!</>
                      )}
                    </p>
                  </div>
                )}

                {/* Download Info - File Location */}
                {downloadInfo && (
                  <div className="bg-green-500 bg-opacity-10 p-4 rounded-lg border border-green-500 border-opacity-30 space-y-3 fade-in-up animate-card transition-smooth">
                    <h3 className="font-semibold text-green-400 flex items-center gap-2 text-lg">
                      ✅ Download Complete!
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-start hover-lift transition-smooth p-2 rounded">
                        <span className="text-gray-400 font-semibold">📄 File:</span>
                        <span className="text-white font-mono break-all text-right ml-2">{downloadInfo.filename}</span>
                      </div>
                      <div className="flex justify-between items-start hover-lift transition-smooth p-2 rounded">
                        <span className="text-gray-400 font-semibold">💾 Size:</span>
                        <span className="text-white font-mono">{downloadInfo.filesize_mb} MB</span>
                      </div>
                      <div className="flex justify-between items-start hover-lift transition-smooth p-2 rounded">
                        <span className="text-gray-400 font-semibold">📁 Location:</span>
                        <span className="text-white font-mono break-all text-right ml-2">{downloadInfo.folder}</span>
                      </div>
                      <div className="flex justify-between items-start hover-lift transition-smooth p-2 rounded">
                        <span className="text-gray-400 font-semibold">📝 Quality:</span>
                        <span className="text-white font-mono">
                          {format === 'mp3' ? `${downloadInfo.quality} kbps` : `${downloadInfo.quality}p`}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!videoInfo && !loading && (
          <div className="text-center text-gray-500 py-12 fade-in-up">
            <p className="text-lg">Enter a YouTube URL and click "Fetch Info" to get started</p>
          </div>
        )}
        <Footer />
      </div>
    </div>
  );
};
