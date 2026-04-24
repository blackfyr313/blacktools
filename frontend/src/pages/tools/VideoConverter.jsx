import { useState } from 'react';
import axios from 'axios';
import { Toast } from '../../components/Toast';
import { Footer } from '../../components/Footer';

export default function VideoConverter() {
  const [file, setFile] = useState(null);
  const [format, setFormat] = useState('mp4');
  const [quality, setQuality] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState(null);

  const formats = ['mp4', 'mkv', 'avi', 'webm'];
  const qualities = [
    { value: 'low', label: 'Low (CRF 20)' },
    { value: 'medium', label: 'Medium (CRF 23)' },
    { value: 'high', label: 'High (CRF 18)' }
  ];

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('video/')) {
      setFile(selectedFile);
      setResult(null);
      setProgress(0);
    } else {
      setToast({ message: 'Please select a video file', type: 'error' });
    }
  };

  const handleConvert = async () => {
    if (!file) {
      setToast({ message: 'Please select a video file', type: 'error' });
      return;
    }

    setLoading(true);
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('format', format);
      formData.append('quality', quality);

      const response = await axios.post('/api/video/convert', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 90) + 10);
        }
      });

      setProgress(100);
      setResult(response.data);
      setToast({ message: 'Video converted successfully!', type: 'success' });
      setTimeout(() => {
        setFile(null);
        setResult(null);
        setProgress(0);
      }, 3000);
    } catch (error) {
      setToast({ message: error.response?.data?.error || 'Conversion failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)' }} className="min-h-screen pt-24 px-4">
      <div className="max-w-2xl mx-auto">
      <div className="text-center mb-12 slideInFromTop">
        <h1 className="text-5xl font-bold mb-4 glow-text">🎥 Video Converter</h1>
        <p style={{ color: 'var(--text-secondary)' }} className="text-lg">Convert videos to MP4, MKV, AVI, or WebM</p>
      </div>

      <div className="glass rounded-2xl p-8 mb-8 slideInFromLeft">
        <div className="mb-8">
          <label style={{ color: 'var(--text-primary)' }} className="block text-sm font-semibold mb-3">Select Video</label>
          <div className="border-2 border-dashed border-orange-500 rounded-lg p-8 text-center hover:border-orange-400 transition cursor-pointer bg-orange-500/5">
            <input
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
              id="file-input"
              disabled={loading}
            />
            <label htmlFor="file-input" className="cursor-pointer">
              <div className="text-4xl mb-2">📹</div>
              <p style={{ color: 'var(--text-primary)' }} className="font-semibold">{file ? file.name : 'Click to select video'}</p>
              <p style={{ color: 'var(--text-secondary)' }} className="text-sm mt-1">MP4, MKV, AVI, MOV, WebM</p>
            </label>
          </div>
        </div>

        <div className="mb-8">
          <label style={{ color: 'var(--text-primary)' }} className="block text-sm font-semibold mb-3">Output Format</label>
          <div className="grid grid-cols-4 gap-2">
            {formats.map((fmt) => (
              <button
                key={fmt}
                onClick={() => setFormat(fmt)}
                disabled={loading}
                className={`py-2 px-3 rounded-lg font-semibold transition ${
                  format === fmt ? 'bg-orange-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                } disabled:opacity-50`}
              >
                {fmt.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-semibold text-slate-300 mb-3">Quality</label>
          <select
            value={quality}
            onChange={(e) => setQuality(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-2 bg-slate-700 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {qualities.map((q) => (
              <option key={q.value} value={q.value}>{q.label}</option>
            ))}
          </select>
        </div>

        {progress > 0 && (
          <div className="mb-8">
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-slate-400 text-sm mt-2">{progress}% complete</p>
          </div>
        )}

        {result && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-green-400 mb-3">âœ“ Conversion Complete</h3>
            <div className="space-y-2 text-slate-300">
              <p>Format: <span className="text-slate-400">{result.format.toUpperCase()}</span></p>
              <p>Quality: <span className="text-slate-400">{result.quality}</span></p>
              <p>File: <span className="text-slate-400 break-all">{result.filename}</span></p>
            </div>
          </div>
        )}

        <button
          onClick={handleConvert}
          disabled={!file || loading}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? `Converting... ${progress}%` : 'Convert Video'}
        </button>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
      <Footer />
      </div>
    </div>
  );
}



