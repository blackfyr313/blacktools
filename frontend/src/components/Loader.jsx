import React, { useState, useEffect } from 'react';
import { Toast } from './Toast';

export const Loader = ({ visible, message = 'Processing...' }) => {
  const [displayedMessage, setDisplayedMessage] = useState(message);

  useEffect(() => {
    setDisplayedMessage(message);
  }, [message]);

  if (!visible) return null;

  // Animated messages
  const messages = [
    '📥 Downloading video...',
    '🔄 Converting format...',
    '🎬 Processing media...',
    '💾 Saving file...',
    '⏳ Almost done...',
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="glass p-8 rounded-2xl flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-purple-300 rounded-full spinner"></div>
        <p className="text-gray-300">{displayedMessage}</p>
      </div>
    </div>
  );
};
