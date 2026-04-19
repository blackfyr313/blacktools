import { useState } from 'react';
import axios from 'axios';
import { Toast } from '../../components/Toast';
import { Footer } from '../../components/Footer';

export default function BatchResizer() {
  const [files, setFiles] = useState([]);
  const [width, setWidth] = useState('800');
  const [height, setHeight] = useState('600');
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState(null);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files).filter((f) => f.type.startsWith('image/'));
    if (selectedFiles.length > 0) {
      setFiles([...files, ...selectedFiles]);
      setResult(null);
      setProgress(0);
    } else {
      setToast({ message: 'Please select image files', type: 'error' });
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleResize = async () => {
    if (files.length === 0) {
      setToast({ message: 'Please select image files', type: 'error' });
      return;
    }

    setLoading(true);
    setProgress(10);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      formData.append('width', width);
      formData.append('height', height);
      formData.append('maintain_aspect', maintainAspect);

      const response = await axios.post('/api/image/batch-resize', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 90) + 10);
        }
      });

      setProgress(100);
      setResult(response.data);
      setToast({ message: 'Images resized successfully!', type: 'success' });
      setTimeout(() => {
        setFiles([]);
        setResult(null);
        setProgress(0);
      }, 3000);
    } catch (error) {
      setToast({ message: error.response?.data?.error || 'Resize failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)' }} className="min-h-screen pt-24 px-4">
      <div className="max-w-2xl mx-auto">
      <div className="text-center mb-12 slideInFromTop">
        <h1 className="text-5xl font-bold mb-4 glow-text">ðŸ“ Batch Resizer</h1>
        <p style={{ color: 'var(--text-secondary)' }} className="text-lg">Resize multiple images at once</p>
      </div>

      <div className="glass rounded-2xl p-8 mb-8 slideInFromLeft">
        <div className="mb-8">
          <label style={{ color: 'var(--text-primary)' }} className="block text-sm font-semibold mb-3">Select Images</label>
          <div className="border-2 border-dashed border-cyan-500 rounded-lg p-8 text-center hover:border-cyan-400 transition cursor-pointer bg-cyan-500/5">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="file-input"
              disabled={loading}
            />
            <label htmlFor="file-input" className="cursor-pointer">
              <div className="text-4xl mb-2">ðŸ–¼ï¸</div>
              <p style={{ color: 'var(--text-primary)' }} className="font-semibold">Click to select images</p>
              <p style={{ color: 'var(--text-secondary)' }} className="text-sm mt-1">Select multiple images to resize</p>
            </label>
          </div>
        </div>

        {files.length > 0 && (
          <div style={{ backgroundColor: 'var(--glass-bg)' }} className="mb-8 rounded-lg p-4">
            <h3 style={{ color: 'var(--text-primary)' }} className="font-semibold mb-3">Selected Files ({files.length})</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {files.map((file, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-600 p-2 rounded">
                  <span className="text-slate-300 text-sm truncate">{file.name}</span>
                  <button
                    onClick={() => removeFile(idx)}
                    className="text-red-400 hover:text-red-300"
                  >
                    âœ•
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">Width (px)</label>
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 bg-slate-700 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">Height (px)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 bg-slate-700 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        <div className="mb-8 flex items-center">
          <input
            type="checkbox"
            id="aspect"
            checked={maintainAspect}
            onChange={(e) => setMaintainAspect(e.target.checked)}
            disabled={loading}
            className="mr-3"
          />
          <label htmlFor="aspect" className="text-slate-300">Maintain aspect ratio</label>
        </div>

        {progress > 0 && (
          <div className="mb-8">
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-slate-400 text-sm mt-2">{progress}% complete</p>
          </div>
        )}

        {result && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-green-400 mb-3">âœ“ Resize Complete</h3>
            <div className="space-y-2 text-slate-300">
              <p>Files Processed: <span className="text-slate-400">{result.processed}</span></p>
              <p>New Size: <span className="text-slate-400">{result.width}x{result.height}</span></p>
            </div>
          </div>
        )}

        <button
          onClick={handleResize}
          disabled={files.length === 0 || loading}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? `Resizing... ${progress}%` : `Resize ${files.length} Image${files.length !== 1 ? 's' : ''}`}
        </button>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
      <Footer />
      </div>
    </div>
  );
}



