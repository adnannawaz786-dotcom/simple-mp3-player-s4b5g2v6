import React from 'react';
import { Button } from './ui/button';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';

const PlayerControls = ({ 
  isPlaying, 
  onPlayPause, 
  onPrevious, 
  onNext, 
  volume, 
  onVolumeChange, 
  isMuted, 
  onMuteToggle,
  currentTime = 0,
  duration = 0,
  onSeek,
  disabled = false
}) => {
  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e) => {
    if (!duration || disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    onSeek(newTime);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      onSeek(Math.max(0, currentTime - 10));
    } else if (e.key === 'ArrowRight') {
      onSeek(Math.min(duration, currentTime + 10));
    } else if (e.key === ' ') {
      e.preventDefault();
      onPlayPause();
    }
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div 
      className="bg-white/80 backdrop-blur-md rounded-xl p-4 shadow-lg border border-white/20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Audio player controls"
    >
      {/* Progress Bar */}
      <div className="mb-4">
        <div 
          className="w-full h-2 bg-gray-200 rounded-full cursor-pointer relative overflow-hidden"
          onClick={handleProgressClick}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={duration}
          aria-valuenow={currentTime}
          aria-label="Audio progress"
          tabIndex={0}
        >
          <motion.div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
            style={{ width: `${progressPercentage}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-center space-x-4 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrevious}
          disabled={disabled}
          className="rounded-full p-2 hover:bg-gray-100/80"
          aria-label="Previous track"
        >
          <SkipBack className="h-5 w-5" />
        </Button>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={onPlayPause}
            disabled={disabled}
            className="rounded-full p-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
            size="lg"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 ml-0.5" />
            )}
          </Button>
        </motion.div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onNext}
          disabled={disabled}
          className="rounded-full p-2 hover:bg-gray-100/80"
          aria-label="Next track"
        >
          <SkipForward className="h-5 w-5" />
        </Button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMuteToggle}
          className="p-1"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </Button>
        
        <div className="flex-1">
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange(parseInt(e.target.value))}
            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer volume-slider"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${isMuted ? 0 : volume}%, #e5e7eb ${isMuted ? 0 : volume}%, #e5e7eb 100%)`
            }}
            aria-label="Volume control"
          />
        </div>
        
        <span className="text-xs text-gray-600 w-8 text-right">
          {isMuted ? 0 : volume}
        </span>
      </div>

      <style jsx>{`
        .volume-slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .volume-slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .volume-slider:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
      `}</style>
    </motion.div>
  );
};

export default PlayerControls;