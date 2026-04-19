import React, { useState, useEffect } from 'react';
import { VideoCard } from '../components/VideoCard';
import { Footer } from '../components/Footer';

export const Dashboard = () => {
  const [history, setHistory] = useState([]);
  const [sortBy, setSortBy] = useState('date'); // date, title, format

  useEffect(() => {
    loadHistory();
  }, [sortBy]);

  const loadHistory = () => {
    const savedHistory = JSON.parse(localStorage.getItem('downloadHistory') || '[]');
    
    // Sort history based on selection
    let sorted = [...savedHistory];
    switch(sortBy) {
      case 'title':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'format':
        sorted.sort((a, b) => a.format.localeCompare(b.format));
        break;
      case 'date':
      default:
        sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
    }
    
    setHistory(sorted);
  };

  const handleDelete = (id) => {
    const updatedHistory = history.filter((item) => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('downloadHistory', JSON.stringify(updatedHistory));
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all download history?')) {
      setHistory([]);
      localStorage.removeItem('downloadHistory');
    }
  };

  const handleDownloadAgain = (item) => {
    // This would navigate back to home with the item data
    window.location.href = '/';
  };

  // Statistics
  const totalDownloads = history.length;
  const videoDownloads = history.filter(item => item.format === 'mp4').length;
  const audioDownloads = history.filter(item => item.format === 'mp3').length;

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)' }} className="min-h-screen pt-20 pb-10">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12 fade-in-up">
          <div className="inline-block mb-4">
            <div className="px-4 py-2 bg-purple-500 bg-opacity-20 border border-purple-500 border-opacity-30 rounded-full">
              <span className="text-sm font-semibold text-purple-300">YOUTUBE BLACK</span>
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold glow-text mb-2 animate-text">
            Download History
          </h1>
          <p style={{ color: 'var(--text-secondary)' }} className="text-lg">
            Track all your downloaded videos and audio
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mt-4 float"></div>
        </div>

        {history.length > 0 ? (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 stagger-in">
              <div className="glass-dark rounded-xl p-6 border border-purple-500 border-opacity-30 hover-lift transition-smooth shadow-glow-md animate-card">
                <p style={{ color: 'var(--text-secondary)' }} className="text-sm mb-2 font-semibold">Total Downloads</p>
                <p className="text-4xl font-bold text-purple-400">{totalDownloads}</p>
              </div>
              <div className="glass-dark rounded-xl p-6 border border-blue-500 border-opacity-30 hover-lift transition-smooth shadow-glow-md animate-card" style={{ animationDelay: '0.1s' }}>
                <p style={{ color: 'var(--text-secondary)' }} className="text-sm mb-2 font-semibold">Videos (MP4)</p>
                <p className="text-4xl font-bold text-blue-400">{videoDownloads}</p>
              </div>
              <div className="glass-dark rounded-xl p-6 border border-green-500 border-opacity-30 hover-lift transition-smooth shadow-glow-md animate-card" style={{ animationDelay: '0.2s' }}>
                <p style={{ color: 'var(--text-secondary)' }} className="text-sm mb-2 font-semibold">Audio (MP3)</p>
                <p className="text-4xl font-bold text-green-400">{audioDownloads}</p>
              </div>
            </div>

            {/* Sort Controls */}
            <div className="mb-8 flex flex-wrap gap-3 items-center fade-in-up">
              <label style={{ color: 'var(--text-secondary)' }} className="text-sm font-semibold">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-purple-600 bg-opacity-20 text-white px-4 py-2 rounded-lg border border-purple-500 border-opacity-30 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-smooth hover-glow font-semibold"
              >
                <option value="date">Recent</option>
                <option value="title">Title</option>
                <option value="format">Format</option>
              </select>
              <button
                onClick={handleClearAll}
                className="ml-auto text-red-400 hover:text-red-300 text-sm px-4 py-2 border border-red-400 border-opacity-30 rounded-lg hover:bg-red-500 hover:bg-opacity-10 transition-smooth hover-lift font-semibold"
              >
                Clear All
              </button>
            </div>

            {/* History Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 stagger-in">
              {history.map((item, idx) => (
                <div
                  key={item.id}
                  className="glass-dark rounded-xl overflow-hidden hover-lift transition-smooth group shadow-glow-md animate-card"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className="relative overflow-hidden h-40 sm:h-48 bg-darker">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-20 transition-all" />
                  </div>

                  <div className="p-4 space-y-3">
                    <h3 className="font-semibold text-sm sm:text-base line-clamp-2 group-hover:text-purple-400 transition-colors text-gradient">
                      {item.title}
                    </h3>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between gap-2">
                        <span className="bg-purple-500 bg-opacity-20 px-2 py-1 rounded border border-purple-500 border-opacity-30 font-semibold">
                          {item.format.toUpperCase()}
                        </span>
                        <span className="bg-blue-500 bg-opacity-20 px-2 py-1 rounded border border-blue-500 border-opacity-30 text-gray-300 font-semibold">
                          {item.quality}
                        </span>
                      </div>
                      <p className="text-gray-500">
                        {new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString()}
                      </p>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="btn-secondary text-xs flex-1 text-red-400 hover:text-red-300 hover:bg-red-500 hover:bg-opacity-10 font-semibold"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20 fade-in-up">
            <div className="text-7xl mb-4 float">📥</div>
            <h2 className="text-3xl font-bold mb-2 glow-text">No downloads yet</h2>
            <p className="text-gray-400 mb-8 text-lg">Download videos to see them here</p>
            <a
              href="/"
              className="inline-block btn-primary hover-lift animate-card"
            >
              Start Downloading
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
