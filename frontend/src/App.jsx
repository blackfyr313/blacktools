import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Landing } from './pages/Landing';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';

// Tool Pages
import ImageOptimizer from './pages/tools/ImageOptimizer';
import AudioConverter from './pages/tools/AudioConverter';
import VideoTrimmer from './pages/tools/VideoTrimmer';
import VideoConverter from './pages/tools/VideoConverter';
import BatchResizer from './pages/tools/BatchResizer';
import FileCompressor from './pages/tools/FileCompressor';
import SocialDownloader from './pages/tools/SocialDownloader';
import NoiseRemover from './pages/tools/NoiseRemover';

import './index.css';

function App() {
  const [isDark, setIsDark] = useState(() => {
    // Load theme from localStorage or default to dark
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    // Apply theme to document
    if (isDark) {
      document.documentElement.classList.add('dark-theme');
      document.documentElement.classList.remove('light-theme');
    } else {
      document.documentElement.classList.add('light-theme');
      document.documentElement.classList.remove('dark-theme');
    }
    // Save to localStorage
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <Router>
      <Navbar isDark={isDark} toggleTheme={toggleTheme} />
      <Routes>
        <Route path="/" element={<Landing />} />
        
        {/* YouTube Black */}
        <Route path="/tools/youtube-black" element={<Home />} />
        <Route path="/tools/youtube-black/history" element={<Dashboard />} />
        
        {/* Image Tools */}
        <Route path="/tools/image-optimizer" element={<ImageOptimizer />} />
        <Route path="/tools/batch-resizer" element={<BatchResizer />} />
        
        {/* Audio Tools */}
        <Route path="/tools/audio-converter" element={<AudioConverter />} />
        <Route path="/tools/noise-remover" element={<NoiseRemover />} />
        
        {/* Video Tools */}
        <Route path="/tools/video-trimmer" element={<VideoTrimmer />} />
        <Route path="/tools/video-converter" element={<VideoConverter />} />
        
        {/* File Tools */}
        <Route path="/tools/file-compressor" element={<FileCompressor />} />
        
        {/* Social Tools */}
        <Route path="/tools/social-downloader" element={<SocialDownloader />} />
      </Routes>
    </Router>
  );
}

export default App;
