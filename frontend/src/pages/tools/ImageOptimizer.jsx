import { useState } from 'react';
import axios from 'axios';
import { Toast } from '../../components/Toast';
import { Footer } from '../../components/Footer';

export default function ImageOptimizer() {
  const [file, setFile] = useState(null);
  const [quality, setQuality] = useState(85);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      setResult(null);
      setProgress(0);
    } else {
      setToast({ message: 'Please select an image file', type: 'error' });
    }
  };

  const handleOptimize = async () => {
    if (!file) {
      setToast({ message: 'Please select an image', type: 'error' });
      return;
    }

    setLoading(true);
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('quality', quality);

      const response = await axios.post('/api/image/optimize', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 90) + 10);
        }
      });

      setProgress(100);
      setResult(response.data);
      setToast({ message: 'Image optimized successfully!', type: 'success' });
      setTimeout(() => {
        setFile(null);
        setResult(null);
        setProgress(0);
      }, 3000);
    } catch (error) {
      setToast({ message: error.response?.data?.error || 'Optimization failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)' }} className="min-h-screen pt-24 px-4">
      <div className="max-w-2xl mx-auto">
      <div className="text-center mb-12 slideInFromTop">
        <h1 className="text-5xl font-bold mb-4 glow-text">🖼️ Image Optimizer</h1>
        <p style={{ color: 'var(--text-secondary)' }} className="text-lg">Compress images while maintaining quality</p>
      </div>

      <div className="glass rounded-2xl p-8 mb-8 slideInFromLeft">
        <div className="mb-8">
          <label style={{ color: 'var(--text-primary)' }} className="block text-sm font-semibold mb-3">Select Image</label>
          <div className="border-2 border-dashed border-purple-500 rounded-lg p-8 text-center hover:border-purple-400 transition cursor-pointer bg-purple-500/5">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="file-input"
              disabled={loading}
            />
            <label htmlFor="file-input" className="cursor-pointer">
              <div className="text-4xl mb-2">📁</div>
              <p style={{ color: 'var(--text-primary)' }} className="font-semibold">{file ? file.name : 'Click to select image'}</p>
              <p style={{ color: 'var(--text-secondary)' }} className="text-sm mt-1">PNG, JPG, WebP</p>
            </label>
          </div>
        </div>

        <div className="mb-8">
          <label style={{ color: 'var(--text-primary)' }} className="block text-sm font-semibold mb-3">Quality: {quality}%</label>
          <input
            type="range"
            min="10"
            max="100"
            value={quality}
            onChange={(e) => setQuality(e.target.value)}
            disabled={loading}
            className="w-full accent-purple-500"
          />
          <p style={{ color: 'var(--text-secondary)' }} className="text-xs mt-1">Lower = more compression, Higher = better quality</p>
        </div>

        {progress > 0 && (
          <div className="mb-8">
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-slate-400 text-sm mt-2">{progress}% complete</p>
          </div>
        )}

        {result && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-green-400 mb-3">âœ“ Optimization Complete</h3>
            <div className="space-y-2 text-slate-300">
              <p>Original: <span className="text-slate-400">{result.original_size_kb} KB</span></p>
              <p>Optimized: <span className="text-slate-400">{result.optimized_size_kb} KB</span></p>
              <p>Reduction: <span className="text-green-400 font-semibold">{result.reduction_percent}%</span></p>
              <p>File: <span className="text-slate-400 break-all">{result.filename}</span></p>
            </div>
          </div>
        )}

        <button
          onClick={handleOptimize}
          disabled={!file || loading}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? `Optimizing... ${progress}%` : 'Optimize Image'}
        </button>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
      <Footer />
      </div>
    </div>
  );
}



