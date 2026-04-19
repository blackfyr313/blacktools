import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Footer } from '../components/Footer';

export const Landing = () => {
  const navigate = useNavigate();

  const tools = [
    {
      id: 'youtube-black',
      name: 'YouTube Black',
      icon: '▶️',
      description: 'Download videos and audio from YouTube in multiple formats and resolutions',
      formats: ['MP4', 'MP3'],
      features: ['4K support', 'Multiple bitrates', 'Batch download', 'History tracking'],
      badge: 'FEATURED',
      badgeColor: 'purple',
      path: '/tools/youtube-black',
    },
    {
      id: 'image-optimizer',
      name: 'Image Optimizer',
      icon: '🖼️',
      description: 'Compress and optimize images while maintaining quality',
      formats: ['JPG', 'PNG', 'WebP'],
      features: ['Lossless compression', 'Custom quality', 'Size reduction'],
      badge: 'LIVE',
      badgeColor: 'green',
      path: '/tools/image-optimizer',
    },
    {
      id: 'audio-converter',
      name: 'Audio Converter',
      icon: '🎵',
      description: 'Convert audio between MP3, WAV, AAC, and FLAC formats',
      formats: ['MP3', 'WAV', 'AAC', 'FLAC'],
      features: ['Multiple bitrates', 'Batch processing', 'Fast conversion'],
      badge: 'LIVE',
      badgeColor: 'blue',
      path: '/tools/audio-converter',
    },
    {
      id: 'video-trimmer',
      name: 'Video Trimmer',
      icon: '✂️',
      description: 'Trim and cut videos to exact time ranges with frame precision',
      formats: ['MP4', 'MKV', 'AVI', 'MOV'],
      features: ['Frame-accurate', 'Quick trimming', 'Multiple formats'],
      badge: 'LIVE',
      badgeColor: 'red',
      path: '/tools/video-trimmer',
    },
    {
      id: 'video-converter',
      name: 'Video Converter',
      icon: '🎥',
      description: 'Convert videos between different formats and resolutions',
      formats: ['MP4', 'MKV', 'AVI', 'WebM'],
      features: ['Quality control', 'Fast conversion', 'Format flexibility'],
      badge: 'LIVE',
      badgeColor: 'orange',
      path: '/tools/video-converter',
    },
    {
      id: 'batch-resizer',
      name: 'Batch Resizer',
      icon: '🎞️',
      description: 'Resize multiple images at once with aspect ratio control',
      formats: ['JPG', 'PNG', 'WebP'],
      features: ['Batch processing', 'Aspect ratio', 'Bulk resize'],
      badge: 'LIVE',
      badgeColor: 'indigo',
      path: '/tools/batch-resizer',
    },
    {
      id: 'file-compressor',
      name: 'File Compressor',
      icon: '📦',
      description: 'Compress multiple files into ZIP archives',
      formats: ['ZIP', 'All types'],
      features: ['Batch compression', 'ZIP creation', 'File archiving'],
      badge: 'LIVE',
      badgeColor: 'green',
      path: '/tools/file-compressor',
    },
    {
      id: 'social-downloader',
      name: 'Social Downloader',
      icon: '📲',
      description: 'Download videos from Instagram, TikTok, Facebook, and Twitter',
      formats: ['MP4', 'Multiple'],
      features: ['Multi-platform', 'Fast download', 'HD quality'],
      badge: 'LIVE',
      badgeColor: 'pink',
      path: '/tools/social-downloader',
    },
    {
      id: 'noise-remover',
      name: 'Noise Remover',
      icon: '🔊',
      description: 'Remove background noise from audio files automatically',
      formats: ['MP3', 'WAV', 'AAC'],
      features: ['AI-powered', 'Adjustable intensity', 'Voice preservation'],
      badge: 'LIVE',
      badgeColor: 'cyan',
      path: '/tools/noise-remover',
    },
  ];

  return (
    <div className="min-h-screen transition-colors duration-300 pt-20 pb-10" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 mb-20">
        <div className="text-center fade-in-up mb-16">
          <div className="inline-block mb-4">
            <img src="/black_tool.png" alt="Black Tools" className="w-20 h-20 bg-transparent object-contain" />
          </div>
          <h1 className="text-6xl sm:text-7xl font-bold mb-4 animate-text" style={{ color: 'var(--text-primary)' }}>
            <span className="glow-text">Black Tools</span>
          </h1>
          <p className="text-xl sm:text-2xl mb-6" style={{ color: 'var(--text-secondary)' }}>
            A complete suite of powerful utilities for downloading, converting, and processing media
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full float"></div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16 stagger-in">
          <div className="glass-dark rounded-xl p-6 border border-purple-500 border-opacity-30 text-center hover-lift transition-smooth animate-card">
            <div className="text-4xl mb-2">⚡</div>
            <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Active Tools</p>
            <p className="text-3xl font-bold text-purple-400">8</p>
          </div>
          <div className="glass-dark rounded-xl p-6 border border-blue-500 border-opacity-30 text-center hover-lift transition-smooth animate-card" style={{ animationDelay: '0.1s' }}>
            <div className="text-4xl mb-2">📊</div>
            <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Operations Supported</p>
            <p className="text-3xl font-bold text-blue-400">25+</p>
          </div>
          <div className="glass-dark rounded-xl p-6 border border-green-500 border-opacity-30 text-center hover-lift transition-smooth animate-card" style={{ animationDelay: '0.2s' }}>
            <div className="text-4xl mb-2">✨</div>
            <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Fast & Reliable</p>
            <p className="text-3xl font-bold text-green-400">100%</p>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12">
          <h2 className="text-4xl font-bold mb-2 text-gradient">Available Tools</h2>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Choose a tool to get started</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 stagger-in">
          {tools.map((tool, idx) => (
            <div
              key={tool.id}
              className="animate-card"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <button
                onClick={() => navigate(tool.path)}
                disabled={tool.disabled}
                className={`w-full text-left glass-dark rounded-2xl p-8 hover-lift transition-smooth border border-gray-700 group ${
                  tool.disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-purple-500 hover:border-opacity-50'
                }`}
              >
                {/* Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    tool.badgeColor === 'purple' ? 'bg-purple-500 bg-opacity-20 text-purple-300 border border-purple-500 border-opacity-30' :
                    tool.badgeColor === 'blue' ? 'bg-blue-500 bg-opacity-20 text-blue-300 border border-blue-500 border-opacity-30' :
                    tool.badgeColor === 'green' ? 'bg-green-500 bg-opacity-20 text-green-300 border border-green-500 border-opacity-30' :
                    tool.badgeColor === 'red' ? 'bg-red-500 bg-opacity-20 text-red-300 border border-red-500 border-opacity-30' :
                    tool.badgeColor === 'orange' ? 'bg-orange-500 bg-opacity-20 text-orange-300 border border-orange-500 border-opacity-30' :
                    tool.badgeColor === 'indigo' ? 'bg-indigo-500 bg-opacity-20 text-indigo-300 border border-indigo-500 border-opacity-30' :
                    tool.badgeColor === 'pink' ? 'bg-pink-500 bg-opacity-20 text-pink-300 border border-pink-500 border-opacity-30' :
                    tool.badgeColor === 'cyan' ? 'bg-cyan-500 bg-opacity-20 text-cyan-300 border border-cyan-500 border-opacity-30' :
                    'bg-yellow-500 bg-opacity-20 text-yellow-300 border border-yellow-500 border-opacity-30'
                  }`}>
                    {tool.badge}
                  </div>
                  <div className="text-4xl">{tool.icon}</div>
                </div>

                {/* Title & Description */}
                <h3 className="text-2xl font-bold mb-2 group-hover:text-purple-400 transition-colors" style={{ color: 'var(--text-primary)' }}>
                  {tool.name}
                </h3>
                <p className="mb-6 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {tool.description}
                </p>

                {/* Formats */}
                <div className="mb-6">
                  <p className="text-xs mb-2 font-semibold" style={{ color: 'var(--text-secondary)' }}>FORMATS</p>
                  <div className="flex flex-wrap gap-2">
                    {tool.formats.map((format) => (
                      <span key={format} className="bg-purple-500 bg-opacity-10 border border-purple-500 border-opacity-30 px-2 py-1 rounded text-xs font-semibold text-purple-300">
                        {format}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <p className="text-xs mb-2 font-semibold" style={{ color: 'var(--text-secondary)' }}>FEATURES</p>
                  <ul className="space-y-1">
                    {tool.features.map((feature) => (
                      <li key={feature} className="text-sm flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                        <span className="text-purple-400">✓</span> {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <button
                  disabled={tool.disabled}
                  className={`w-full py-3 rounded-lg font-bold transition-all ${
                    tool.disabled
                      ? 'bg-gray-600 bg-opacity-20 text-gray-500 cursor-not-allowed'
                      : 'btn-primary hover-lift'
                  }`}
                >
                  {tool.disabled ? 'Coming Soon' : `Launch ${tool.name}`}
                </button>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-6 mt-20">
        <div className="glass-dark rounded-2xl p-8 sm:p-12 border border-purple-500 border-opacity-30 text-center hover-lift transition-smooth shadow-glow-lg">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-400 mb-8 text-lg">
            Start with YouTube Black and download your favorite videos in seconds
          </p>
          <button
            onClick={() => navigate('/tools/youtube-black')}
            className="btn-primary hover-lift inline-block text-lg"
          >
            Launch YouTube Black →
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};
