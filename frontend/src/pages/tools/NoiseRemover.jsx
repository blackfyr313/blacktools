import { useState } from 'react';
import axios from 'axios';
import { Toast } from '../../components/Toast';
import { Footer } from '../../components/Footer';

export default function NoiseRemover() {
  const [file, setFile] = useState(null);
  const [intensity, setIntensity] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState(null);

  const getIntensityLabel = () => {
    const val = parseFloat(intensity);
    if (val < 0.3) return 'Light';
    if (val < 0.7) return 'Medium';
    return 'Heavy';
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('audio/')) {
      setFile(selectedFile);
      setResult(null);
      setProgress(0);
    } else {
      setToast({ message: 'Please select an audio file', type: 'error' });
    }
  };

  const handleDenoise = async () => {
    if (!file) {
      setToast({ message: 'Please select an audio file', type: 'error' });
      return;
    }

    setLoading(true);
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('intensity', intensity);

      const response = await axios.post('/api/audio/denoise', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 90) + 10);
        }
      });

      setProgress(100);
      setResult(response.data);
      setToast({ message: 'Audio denoised successfully!', type: 'success' });
      setTimeout(() => {
        setFile(null);
        setResult(null);
        setProgress(0);
      }, 3000);
    } catch (error) {
      setToast({ message: error.response?.data?.error || 'Denoising failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)' }} className="min-h-screen pt-24 px-4">
      <div className="max-w-2xl mx-auto">
      <div className="text-center mb-12 slideInFromTop">
        <h1 className="text-5xl font-bold mb-4 glow-text">ðŸ”‡ Noise Remover</h1>
        <p style={{ color: 'var(--text-secondary)' }} className="text-lg">Remove background noise from audio</p>
      </div>

      <div className="glass rounded-2xl p-8 mb-8 slideInFromLeft">
        <div className="mb-8">
          <label style={{ color: 'var(--text-primary)' }} className="block text-sm font-semibold mb-3">Select Audio</label>
          <div className="border-2 border-dashed border-violet-500 rounded-lg p-8 text-center hover:border-violet-400 transition cursor-pointer bg-violet-500/5">
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileSelect}
              className="hidden"
              id="file-input"
              disabled={loading}
            />
            <label htmlFor="file-input" className="cursor-pointer">
              <div className="text-4xl mb-2">ðŸŽ™ï¸</div>
              <p style={{ color: 'var(--text-primary)' }} className="font-semibold">{file ? file.name : 'Click to select audio'}</p>
              <p style={{ color: 'var(--text-secondary)' }} className="text-sm mt-1">MP3, WAV, M4A, OGG</p>
            </label>
          </div>
        </div>

        <div className="mb-8">
          <label style={{ color: 'var(--text-primary)' }} className="block text-sm font-semibold mb-3">
            Intensity: {Math.round(parseFloat(intensity) * 100)}% ({getIntensityLabel()})
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={intensity}
            onChange={(e) => setIntensity(e.target.value)}
            disabled={loading}
            className="w-full accent-violet-500"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>Light</span>
            <span>Medium</span>
            <span>Heavy</span>
          </div>
        </div>

        {progress > 0 && (
          <div className="mb-8">
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-slate-400 text-sm mt-2">{progress}% complete</p>
          </div>
        )}

        {result && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-green-400 mb-3">âœ“ Denoising Complete</h3>
            <div className="space-y-2 text-slate-300">
              <p>Original: <span className="text-slate-400">{result.original_size_kb} KB</span></p>
              <p>Processed: <span className="text-slate-400">{result.processed_size_kb} KB</span></p>
              <p>Intensity: <span className="text-slate-400">{Math.round(parseFloat(intensity) * 100)}%</span></p>
              <p>File: <span className="text-slate-400 break-all">{result.filename}</span></p>
            </div>
          </div>
        )}

        <button
          onClick={handleDenoise}
          disabled={!file || loading}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? `Denoising... ${progress}%` : 'Remove Noise'}
        </button>
      </div>

      <div className="glass rounded-2xl p-6 slideInFromRight">
        <h3 className="font-semibold text-slate-300 mb-3">â„¹ï¸ About Noise Removal</h3>
        <ul className="space-y-2 text-slate-400 text-sm">
          <li>â€¢ Light: Subtle noise reduction, preserves audio quality</li>
          <li>â€¢ Medium: Balanced noise removal and quality</li>
          <li>â€¢ Heavy: Aggressive noise removal, may affect audio</li>
          <li>â€¢ Best for background hum, fan noise, AC noise</li>
        </ul>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
      <Footer />
      </div>
    </div>
  );
}



