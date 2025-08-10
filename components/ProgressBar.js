import React from 'react';
import { motion } from 'framer-motion';

const ProgressBar = ({ 
  currentTime = 0, 
  duration = 0, 
  onSeek,
  className = '' 
}) => {
  const progressRef = React.useRef(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragProgress, setDragProgress] = React.useState(0);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const displayProgress = isDragging ? dragProgress : progress;

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleClick = (e) => {
    if (!progressRef.current || !onSeek || duration === 0) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickProgress = (clickX / rect.width) * 100;
    const newTime = (clickProgress / 100) * duration;
    
    onSeek(Math.max(0, Math.min(newTime, duration)));
  };

  const handleMouseDown = (e) => {
    if (!progressRef.current || !onSeek || duration === 0) return;
    
    setIsDragging(true);
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickProgress = Math.max(0, Math.min((clickX / rect.width) * 100, 100));
    setDragProgress(clickProgress);
  };

  const handleMouseMove = React.useCallback((e) => {
    if (!isDragging || !progressRef.current) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const moveX = e.clientX - rect.left;
    const moveProgress = Math.max(0, Math.min((moveX / rect.width) * 100, 100));
    setDragProgress(moveProgress);
  }, [isDragging]);

  const handleMouseUp = React.useCallback(() => {
    if (!isDragging || !onSeek || duration === 0) return;
    
    const newTime = (dragProgress / 100) * duration;
    onSeek(Math.max(0, Math.min(newTime, duration)));
    setIsDragging(false);
  }, [isDragging, dragProgress, duration, onSeek]);

  const handleTouchStart = (e) => {
    if (!progressRef.current || !onSeek || duration === 0) return;
    
    setIsDragging(true);
    const rect = progressRef.current.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    const touchProgress = Math.max(0, Math.min((touchX / rect.width) * 100, 100));
    setDragProgress(touchProgress);
  };

  const handleTouchMove = React.useCallback((e) => {
    if (!isDragging || !progressRef.current) return;
    
    e.preventDefault();
    const rect = progressRef.current.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    const touchProgress = Math.max(0, Math.min((touchX / rect.width) * 100, 100));
    setDragProgress(touchProgress);
  }, [isDragging]);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  return (
    <div className={`w-full space-y-2 ${className}`}>
      {/* Time Display */}
      <div className="flex justify-between items-center text-sm text-gray-400">
        <span className="font-mono">
          {formatTime(isDragging ? (dragProgress / 100) * duration : currentTime)}
        </span>
        <span className="font-mono">
          {formatTime(duration)}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative group">
        <div
          ref={progressRef}
          className="relative h-2 bg-gray-700 rounded-full cursor-pointer touch-none"
          onClick={handleClick}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {/* Background Track */}
          <div className="absolute inset-0 bg-gray-700 rounded-full" />
          
          {/* Progress Fill */}
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
            style={{ width: `${displayProgress}%` }}
            animate={{ width: `${displayProgress}%` }}
            transition={{ duration: isDragging ? 0 : 0.1 }}
          />
          
          {/* Progress Thumb */}
          <motion.div
            className={`absolute top-1/2 w-4 h-4 bg-white rounded-full shadow-lg transform -translate-y-1/2 transition-opacity duration-200 ${
              isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
            style={{ left: `calc(${displayProgress}% - 8px)` }}
            animate={{ left: `calc(${displayProgress}% - 8px)` }}
            transition={{ duration: isDragging ? 0 : 0.1 }}
          />
          
          {/* Hover Effect */}
          <div className="absolute inset-0 bg-white bg-opacity-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;