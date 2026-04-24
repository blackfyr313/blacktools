import { useState } from 'react';
import axios from 'axios';
import { Toast } from '../../components/Toast';
import { Footer } from '../../components/Footer';

export default function SocialDownloader() {
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState('auto');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState(null);

  const platforms = ['auto', 'instagram', 'tiktok', 'facebook', 'twitter'];

  const isValidUrl = (str) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  const handleDownload = async () => {
    if (!url) {
      setToast({ message: 'Please enter a URL', type: 'error' });
      return;
    }

    if (!isValidUrl(url)) {
      setToast({ message: 'Please enter a valid URL', type: 'error' });
      return;
    }

    setLoading(true);
    setProgress(10);

    try {
      const response = await axios.post('/api/social/download', 
        { url, platform },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      setProgress(100);
      setResult(response.data);
      setToast({ message: 'Downloaded successfully!', type: 'success' });
      setTimeout(() => {
        setUrl('');
        setResult(null);
        setProgress(0);
      }, 3000);
    } catch (error) {
      setToast({ message: error.response?.data?.error || 'Download failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)' }} className="min-h-screen pt-24 px-4">
      <div className="max-w-2xl mx-auto">
      <div className="text-center mb-12 slideInFromTop">
        <h1 className="text-5xl font-bold mb-4 glow-text">📥 Social Downloader</h1>
        <p style={{ color: 'var(--text-secondary)' }} className="text-lg">Download videos from Instagram, TikTok, Facebook, Twitter</p>
      </div>

      <div className="glass rounded-2xl p-8 mb-8 slideInFromLeft">
        <div className="mb-8">
          <label style={{ color: 'var(--text-primary)' }} className="block text-sm font-semibold mb-3">Video URL</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.instagram.com/p/ABC123..."
            disabled={loading}
            className="w-full px-4 py-3 bg-slate-700 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="mb-8">
          <label style={{ color: 'var(--text-primary)' }} className="block text-sm font-semibold mb-3">Platform</label>
          <div className="grid grid-cols-3 gap-2">
            {platforms.map((plat) => (
              <button
                key={plat}
                onClick={() => setPlatform(plat)}
                disabled={loading}
                className={`py-2 px-3 rounded-lg font-semibold transition capitalize ${
                  platform === plat
                    ? 'bg-indigo-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                } disabled:opacity-50`}
              >
                {plat}
              </button>
            ))}
          </div>
        </div>

        {progress > 0 && (
          <div className="mb-8">
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-slate-400 text-sm mt-2">{progress}% complete</p>
          </div>
        )}

        {result && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-green-400 mb-3">âœ“ Download Complete</h3>
            <div className="space-y-2 text-slate-300">
              <p>Title: <span className="text-slate-400 break-all">{result.title}</span></p>
              <p>Platform: <span className="text-slate-400 capitalize">{result.platform}</span></p>
              <p>File: <span className="text-slate-400 break-all">{result.filename}</span></p>
            </div>
          </div>
        )}

        <button
          onClick={handleDownload}
          disabled={!isValidUrl(url) || loading}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? `Downloading... ${progress}%` : 'Download Video'}
        </button>
      </div>

      <div className="glass rounded-2xl p-6 slideInFromRight">
        <h3 className="font-semibold text-slate-300 mb-3">💡 Supported Platforms</h3>
        <ul className="space-y-2 text-slate-400 text-sm">
          <li>📸 Instagram: Posts, Reels, Stories</li>
          <li>🎵 TikTok: Videos and sounds</li>
          <li>👥 Facebook: Videos and content</li>
          <li>🐦 Twitter: Videos and media</li>
        </ul>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
      <Footer />
      </div>
    </div>
  );
}



