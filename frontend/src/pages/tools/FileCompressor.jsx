import { useState } from 'react';
import axios from 'axios';
import { Toast } from '../../components/Toast';
import { Footer } from '../../components/Footer';

export default function FileCompressor() {
  const [files, setFiles] = useState([]);
  const [archiveName, setArchiveName] = useState('archive');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState(null);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      setFiles([...files, ...selectedFiles]);
      setResult(null);
      setProgress(0);
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleCompress = async () => {
    if (files.length === 0) {
      setToast({ message: 'Please select files', type: 'error' });
      return;
    }

    setLoading(true);
    setProgress(10);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      formData.append('archive_name', archiveName);

      const response = await axios.post('/api/file/compress', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 90) + 10);
        }
      });

      setProgress(100);
      setResult(response.data);
      setToast({ message: 'Files compressed successfully!', type: 'success' });
      setTimeout(() => {
        setFiles([]);
        setResult(null);
        setProgress(0);
        setArchiveName('archive');
      }, 3000);
    } catch (error) {
      setToast({ message: error.response?.data?.error || 'Compression failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)' }} className="min-h-screen pt-24 px-4">
      <div className="max-w-2xl mx-auto">
      <div className="text-center mb-12 slideInFromTop">
        <h1 className="text-5xl font-bold mb-4 glow-text">📦 File Compressor</h1>
        <p style={{ color: 'var(--text-secondary)' }} className="text-lg">Create ZIP archives from multiple files</p>
      </div>

      <div className="glass rounded-2xl p-8 mb-8 slideInFromLeft">
        <div className="mb-8">
          <label style={{ color: 'var(--text-primary)' }} className="block text-sm font-semibold mb-3">Select Files</label>
          <div className="border-2 border-dashed border-pink-500 rounded-lg p-8 text-center hover:border-pink-400 transition cursor-pointer bg-pink-500/5">
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="file-input"
              disabled={loading}
            />
            <label htmlFor="file-input" className="cursor-pointer">
              <div className="text-4xl mb-2">📁</div>
              <p style={{ color: 'var(--text-primary)' }} className="font-semibold">Click to select files</p>
              <p style={{ color: 'var(--text-secondary)' }} className="text-sm mt-1">Select any files to compress</p>
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

        <div className="mb-8">
          <label className="block text-sm font-semibold text-slate-300 mb-3">Archive Name</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={archiveName}
              onChange={(e) => setArchiveName(e.target.value)}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-slate-700 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <span className="px-4 py-2 bg-slate-600 text-slate-400 rounded-lg">.zip</span>
          </div>
        </div>

        {progress > 0 && (
          <div className="mb-8">
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-slate-400 text-sm mt-2">{progress}% complete</p>
          </div>
        )}

        {result && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-green-400 mb-3">âœ“ Compression Complete</h3>
            <div className="space-y-2 text-slate-300">
              <p>Files: <span className="text-slate-400">{result.file_count}</span></p>
              <p>Archive Size: <span className="text-slate-400">{result.archive_size_kb} KB</span></p>
              <p>Filename: <span className="text-slate-400">{result.filename}</span></p>
            </div>
          </div>
        )}

        <button
          onClick={handleCompress}
          disabled={files.length === 0 || loading}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? `Compressing... ${progress}%` : `Compress ${files.length} File${files.length !== 1 ? 's' : ''}`}
        </button>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
      <Footer />
      </div>
    </div>
  );
}



