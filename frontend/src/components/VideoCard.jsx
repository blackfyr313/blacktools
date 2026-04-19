import React from 'react';

export const VideoCard = ({
  thumbnail,
  title,
  duration,
  format,
  date,
  onDownloadAgain,
  onDelete,
  isDashboard = false,
}) => {
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hours > 0
      ? `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
      : `${minutes}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="glass rounded-xl overflow-hidden hover:bg-opacity-10 transition-all duration-300 group">
      <div className="relative overflow-hidden h-40 sm:h-48 bg-darker">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {duration && !isDashboard && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 px-2 py-1 rounded text-xs font-semibold">
            {formatDuration(duration)}
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-sm sm:text-base line-clamp-2 group-hover:text-purple-400 transition-colors">
          {title}
        </h3>

        {isDashboard && date && (
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="bg-purple-500 bg-opacity-20 px-2 py-1 rounded">
              {format.toUpperCase()}
            </span>
            <span>{new Date(date).toLocaleDateString()}</span>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {isDashboard && (
            <>
              <button
                onClick={onDownloadAgain}
                className="btn-secondary text-xs flex-1"
              >
                ↓ Download
              </button>
              <button
                onClick={onDelete}
                className="btn-secondary text-xs flex-1 text-red-400 hover:text-red-300"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
