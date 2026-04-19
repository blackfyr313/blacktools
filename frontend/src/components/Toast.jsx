import React, { useState, useEffect } from 'react';

export const Toast = ({ message, type = 'success', duration = 4000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';

  // Handle multi-line messages
  const messageLines = String(message).split('\n');
  const isMultiLine = messageLines.length > 1;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm">
      <div className={`${bgColor} bg-opacity-90 text-white px-4 ${isMultiLine ? 'py-4' : 'py-3'} rounded-lg ${isMultiLine ? 'flex flex-col gap-2' : 'flex items-center gap-3'} backdrop-blur shadow-glow-lg animate-in fade-in slide-in-from-bottom-4`}>
        <div className={`flex ${isMultiLine ? 'items-start gap-3' : 'items-center gap-3'}`}>
          <span className="text-xl font-bold flex-shrink-0">{icon}</span>
          {!isMultiLine ? (
            <span>{message}</span>
          ) : (
            <div className="space-y-1">
              {messageLines.map((line, idx) => (
                <p key={idx} className="text-sm">
                  {line}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
