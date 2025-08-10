import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Plus, Music, Trash2, Upload, X } from 'lucide-react';
import { getPlaylist, savePlaylist, formatTime } from '../lib/utils';

const PlaylistManager = ({ onSelectTrack, currentTrack, onPlaylistChange }) => {
  const [playlist, setPlaylist] = useState([]);
  const [isAddingTrack, setIsAddingTrack] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    const savedPlaylist = getPlaylist();
    setPlaylist(savedPlaylist);
    if (onPlaylistChange) {
      onPlaylistChange(savedPlaylist);
    }
  }, [onPlaylistChange]);

  const handleFileUpload = (files) => {
    const audioFiles = Array.from(files).filter(file => 
      file.type.startsWith('audio/') || file.name.toLowerCase().endsWith('.mp3')
    );

    audioFiles.forEach(file => {
      const audio = new Audio();
      const url = URL.createObjectURL(file);
      
      audio.addEventListener('loadedmetadata', () => {
        const newTrack = {
          id: Date.now() + Math.random(),
          name: file.name.replace(/\.[^/.]+$/, ''),
          artist: 'Unknown Artist',
          duration: audio.duration,
          file: file,
          url: url
        };

        const updatedPlaylist = [...playlist, newTrack];
        setPlaylist(updatedPlaylist);
        savePlaylist(updatedPlaylist);
        if (onPlaylistChange) {
          onPlaylistChange(updatedPlaylist);
        }
      });

      audio.src = url;
    });

    setIsAddingTrack(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeTrack = (trackId) => {
    const updatedPlaylist = playlist.filter(track => track.id !== trackId);
    setPlaylist(updatedPlaylist);
    savePlaylist(updatedPlaylist);
    if (onPlaylistChange) {
      onPlaylistChange(updatedPlaylist);
    }
  };

  const clearPlaylist = () => {
    setPlaylist([]);
    savePlaylist([]);
    if (onPlaylistChange) {
      onPlaylistChange([]);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          Playlist
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingTrack(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add
          </Button>
          {playlist.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearPlaylist}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isAddingTrack && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <Card 
              className={`border-2 border-dashed transition-colors ${
                dragOver 
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <CardContent className="p-6 text-center">
                <div className="flex flex-col items-center gap-4">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Drag & drop MP3 files here, or click to select
                    </p>
                    <input
                      type="file"
                      accept="audio/*,.mp3"
                      multiple
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      Choose Files
                    </label>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAddingTrack(false)}
                    className="absolute top-2 right-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {playlist.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <Music className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Your playlist is empty
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Add some MP3 files to get started
              </p>
            </CardContent>
          </Card>
        ) : (
          <AnimatePresence>
            {playlist.map((track, index) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    currentTrack?.id === track.id 
                      ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => onSelectTrack(track)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            currentTrack?.id === track.id 
                              ? 'bg-blue-500 animate-pulse' 
                              : 'bg-gray-300'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                              {track.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {track.artist}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {track.duration && (
                          <Badge variant="secondary" className="text-xs">
                            {formatTime(track.duration)}
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeTrack(track.id);
                          }}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {playlist.length > 0 && (
        <div className="mt-4 pt-4">
          <Separator />
          <div className="flex justify-between items-center mt-4 text-sm text-gray-500 dark:text-gray-400">
            <span>{playlist.length} track{playlist.length !== 1 ? 's' : ''}</span>
            <span>
              {formatTime(playlist.reduce((total, track) => total + (track.duration || 0), 0))} total
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistManager;