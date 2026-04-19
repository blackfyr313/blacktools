import { useState } from 'react';
import axios from 'axios';
import { Toast } from '../../components/Toast';
import { Footer } from '../../components/Footer';

export default function VideoTrimmer() {
  const [file, setFile] = useState(null);
  const [startTime, setStartTime] = useState('0');
  const [endTime, setEndTime] = useState('10');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState(null);

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

  const handleTrim = async () => {
    if (!file) {
      setToast({ message: 'Please select a video file', type: 'error' });
      return;
    }

    if (parseFloat(endTime) <= parseFloat(startTime)) {
      setToast({ message: 'End time must be greater than start time', type: 'error' });
      return;
    }

    setLoading(true);
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('start_time', startTime);
      formData.append('end_time', endTime);

      const response = await axios.post('/api/video/trim', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 90) + 10);
        }
      });

      setProgress(100);
      setResult(response.data);
      setToast({ message: 'Video trimmed successfully!', type: 'success' });
      setTimeout(() => {
        setFile(null);
        setResult(null);
        setProgress(0);
      }, 3000);
    } catch (error) {
      setToast({ message: error.response?.data?.error || 'Trim failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)' }} className="min-h-screen pt-24 px-4">
      <div className="max-w-2xl mx-auto">
      <div className="text-center mb-12 slideInFromTop">
        <h1 className="text-5xl font-bold mb-4 glow-text">âœ‚ï¸ Video Trimmer</h1>
        <p style={{ color: 'var(--text-secondary)' }} className="text-lg">Cut videos to a specific time range</p>
      </div>

      <div className="glass rounded-2xl p-8 mb-8 slideInFromLeft">
        <div className="mb-8">
          <label style={{ color: 'var(--text-primary)' }} className="block text-sm font-semibold mb-3">Select Video</label>
          <div className="border-2 border-dashed border-green-500 rounded-lg p-8 text-center hover:border-green-400 transition cursor-pointer bg-green-500/5">
            <input
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
              id="file-input"
              disabled={loading}
            />
            <label htmlFor="file-input" className="cursor-pointer">
              <div className="text-4xl mb-2">ðŸŽ¬</div>
              <p style={{ color: 'var(--text-primary)' }} className="font-semibold">{file ? file.name : 'Click to select video'}</p>
              <p style={{ color: 'var(--text-secondary)' }} className="text-sm mt-1">MP4, MKV, AVI, WebM</p>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div>
            <label style={{ color: 'var(--text-primary)' }} className="block text-sm font-semibold mb-3">Start Time (seconds)</label>
            <input
              type="number"
              step="0.1"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 bg-slate-700 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">End Time (seconds)</label>
            <input
              type="number"
              step="0.1"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 bg-slate-700 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {progress > 0 && (
          <div className="mb-8">
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-slate-400 text-sm mt-2">{progress}% complete</p>
          </div>
        )}

        {result && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-green-400 mb-3">âœ“ Trim Complete</h3>
            <div className="space-y-2 text-slate-300">
              <p>Duration: <span className="text-slate-400">{result.start_time}s to {result.end_time}s</span></p>
              <p>Length: <span className="text-slate-400">{result.duration}s</span></p>
              <p>File: <span className="text-slate-400 break-all">{result.filename}</span></p>
            </div>
          </div>
        )}

        <button
          onClick={handleTrim}
          disabled={!file || loading}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? `Trimming... ${progress}%` : 'Trim Video'}
        </button>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
      <Footer />
      </div>
    </div>
  );
}



