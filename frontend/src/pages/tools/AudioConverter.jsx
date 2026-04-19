import { useState } from 'react';
import axios from 'axios';
import { Toast } from '../../components/Toast';
import { Footer } from '../../components/Footer';

export default function AudioConverter() {
  const [file, setFile] = useState(null);
  const [format, setFormat] = useState('mp3');
  const [bitrate, setBitrate] = useState('192');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState(null);

  const formats = ['mp3', 'wav', 'aac', 'flac'];
  const bitrates = ['128', '192', '256', '320'];

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

  const handleConvert = async () => {
    if (!file) {
      setToast({ message: 'Please select an audio file', type: 'error' });
      return;
    }

    setLoading(true);
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('format', format);
      formData.append('bitrate', bitrate);

      const response = await axios.post('/api/audio/convert', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 90) + 10);
        }
      });

      setProgress(100);
      setResult(response.data);
      setToast({ message: 'Audio converted successfully!', type: 'success' });
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
        <h1 className="text-5xl font-bold mb-4 glow-text">ðŸŽµ Audio Converter</h1>
        <p style={{ color: 'var(--text-secondary)' }} className="text-lg">Convert audio to MP3, WAV, AAC, or FLAC</p>
      </div>

      <div className="glass rounded-2xl p-8 mb-8 slideInFromLeft">
        <div className="mb-8">
          <label style={{ color: 'var(--text-primary)' }} className="block text-sm font-semibold mb-3">Select Audio File</label>
          <div className="border-2 border-dashed border-blue-500 rounded-lg p-8 text-center hover:border-blue-400 transition cursor-pointer bg-blue-500/5">
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileSelect}
              className="hidden"
              id="file-input"
              disabled={loading}
            />
            <label htmlFor="file-input" className="cursor-pointer">
              <div className="text-4xl mb-2">ðŸŽ§</div>
              <p style={{ color: 'var(--text-primary)' }} className="font-semibold">{file ? file.name : 'Click to select audio'}</p>
              <p style={{ color: 'var(--text-secondary)' }} className="text-sm mt-1">MP3, WAV, M4A, FLAC, OGG</p>
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
                  format === fmt ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                } disabled:opacity-50`}
              >
                {fmt.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-semibold text-slate-300 mb-3">Bitrate: {bitrate} kbps</label>
          <div className="grid grid-cols-4 gap-2">
            {bitrates.map((br) => (
              <button
                key={br}
                onClick={() => setBitrate(br)}
                disabled={loading}
                className={`py-2 px-3 rounded-lg font-semibold transition ${
                  bitrate === br ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                } disabled:opacity-50`}
              >
                {br}
              </button>
            ))}
          </div>
        </div>

        {progress > 0 && (
          <div className="mb-8">
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
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
              <p>Original: <span className="text-slate-400">{result.original_size_kb} KB</span></p>
              <p>Converted: <span className="text-slate-400">{result.converted_size_kb} KB</span></p>
              <p>Format: <span className="text-slate-400">{result.format.toUpperCase()}</span></p>
              <p>Bitrate: <span className="text-slate-400">{result.bitrate} kbps</span></p>
              <p>File: <span className="text-slate-400 break-all">{result.filename}</span></p>
            </div>
          </div>
        )}

        <button
          onClick={handleConvert}
          disabled={!file || loading}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? `Converting... ${progress}%` : 'Convert Audio'}
        </button>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
      <Footer />
      </div>
    </div>
  );
}



