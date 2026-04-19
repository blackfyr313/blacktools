import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const Navbar = ({ isDark, toggleTheme }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isToolPage = location.pathname.includes('/tools/');

  return (
    <nav className="sticky top-0 z-40 glass-dark border-b border-gray-800 shadow-glow-md backdrop-blur-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-3 hover-lift transition-smooth group"
        >
          <img src="/black_tool.png" alt="Black Tools" className="w-10 h-10 bg-transparent object-contain" />
          <h1 className="glow-text text-2xl sm:text-3xl font-bold animate-text">Black Tools</h1>
        </button>

        <div className="flex items-center gap-8">
          <div className="hidden sm:flex items-center gap-4">
            <a
              href="/"
              className="text-gray-300 hover:text-purple-400 transition-smooth duration-300 font-semibold text-lg relative group"
            >
              Tools
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 group-hover:w-full transition-all duration-300"></span>
            </a>
            {isToolPage && (
              <>
                <span className="text-gray-600">|</span>
                <a
                  href="/tools/youtube-black/history"
                  className="text-gray-300 hover:text-purple-400 transition-smooth duration-300 font-semibold text-lg relative group"
                >
                  History
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 group-hover:w-full transition-all duration-300"></span>
                </a>
              </>
            )}
          </div>
          
          <button 
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full glass hover-lift transition-smooth flex items-center justify-center hover:bg-opacity-20 hover-glow text-xl"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </nav>
  );
};
