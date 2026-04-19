import React from 'react';

export const Footer = () => {
  return (
    <footer className="max-w-6xl mx-auto px-6 mt-20 pb-10 text-center border-t border-gray-700 border-opacity-30 pt-8">
      <p className="text-gray-500 text-sm mb-2">
        © 2026 Black Tools. All rights reserved.
      </p>
      <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
        Created by <span className="text-purple-400 font-semibold">__blackfyre</span>
      </p>
      <p className="text-gray-600 text-xs mt-3">More tools coming soon...</p>
    </footer>
  );
};
