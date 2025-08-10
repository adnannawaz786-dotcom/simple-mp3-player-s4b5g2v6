import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Volume2, Upload, Trash2, Music } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import Layout from '../components/Layout';

export default function Home() {
  const [playlist, setPlaylist] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load playlist from localStorage on mount
  useEffect(() => {
    const savedPlaylist = localStorage.getItem('mp3-playlist');
    if (savedPlaylist) {
      setPlaylist(JSON.parse(savedPlaylist));
    }
  }, []);

  // Save playlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('mp3-playlist', JSON.stringify(playlist));
  }, [playlist]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      playNext();
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack]);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const mp3Files = files.filter(file => file.type === 'audio/mpeg' || file.name.endsWith('.mp3'));
    
    mp3Files.forEach(file => {
      const url = URL.createObjectURL(file);
      const newTrack = {
        id: Date.now() + Math.random(),
        name: file.name.replace('.mp3', ''),
        url: url,
        file: file
      };
      
      setPlaylist(prev => [...prev, newTrack]);
    });
    
    // Reset file input
    event.target.value = '';
  };

  const playTrack = (track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play();
      }
    }, 100);
  };

  const togglePlayPause = () => {
    if (!currentTrack) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const playNext = () => {
    if (!currentTrack || playlist.length === 0) return;
    
    const currentIndex = playlist.findIndex(track => track.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    playTrack(playlist[nextIndex]);
  };

  const playPrevious = () => {
    if (!currentTrack || playlist.length === 0) return;
    
    const currentIndex = playlist.findIndex(track => track.id === currentTrack.id);
    const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    playTrack(playlist[prevIndex]);
  };

  const removeTrack = (trackId) => {
    setPlaylist(prev => prev.filter(track => track.id !== trackId));
    
    if (currentTrack && currentTrack.id === trackId) {
      setCurrentTrack(null);
      setIsPlaying(false);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e) => {
    if (!audioRef.current || !duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl font-bold text-white mb-2">MP3 Player</h1>
            <p className="text-purple-200">Simple & Clean</p>
          </motion.div>

          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                  size="lg"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Add MP3 Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/mp3,audio/mpeg"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Current Track Player */}
          <AnimatePresence>
            {currentTrack && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Music className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-1">
                        {currentTrack.name}
                      </h3>
                      <Badge variant="secondary" className="bg-white/20 text-white">
                        Now Playing
                      </Badge>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div
                        className="w-full h-2 bg-white/20 rounded-full cursor-pointer"
                        onClick={handleProgressClick}
                      >
                        <div
                          className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-100"
                          style={{
                            width: duration ? `${(currentTime / duration) * 100}%` : '0%'
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-sm text-purple-200 mt-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-center space-x-4">
                      <Button
                        onClick={playPrevious}
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-white/20"
                      >
                        <SkipBack className="w-5 h-5" />
                      </Button>
                      
                      <Button
                        onClick={togglePlayPause}
                        size="lg"
                        className="bg-white text-purple-600 hover:bg-white/90 w-14 h-14 rounded-full"
                      >
                        {isPlaying ? (
                          <Pause className="w-6 h-6" />
                        ) : (
                          <Play className="w-6 h-6 ml-1" />
                        )}
                      </Button>
                      
                      <Button
                        onClick={playNext}
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-white/20"
                      >
                        <SkipForward className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Playlist */}
          {playlist.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white text-lg">
                    Playlist ({playlist.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-64 overflow-y-auto">
                    {playlist.map((track, index) => (
                      <motion.div
                        key={track.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center justify-between p-4 border-b border-white/10 hover:bg-white/5 cursor-pointer transition-colors ${
                          currentTrack?.id === track.id ? 'bg-white/10' : ''
                        }`}
                        onClick={() => playTrack(track)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                            <Music className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">
                              {track.name}
                            </p>
                            {currentTrack?.id === track.id && (
                              <Badge variant="secondary" className="bg-purple-500/20 text-purple-200 text-xs">
                                Playing
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeTrack(track.id);
                          }}
                          size="sm"
                          variant="ghost"
                          className="text-red-300 hover:text-red-200 hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Empty State */}
          {playlist.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center py-12"
            >
              <Music className="w-16 h-16 text-purple-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No music yet
              </h3>
              <p className="text-purple-200">
                Upload some MP3 files to get started
              </p>
            </motion.div>
          )}

          {/* Hidden Audio Element */}
          {currentTrack && (
            <audio
              ref={audioRef}
              src={currentTrack.url}
              volume={volume}
              preload="metadata"
            />
          )}
        </div>
      </div>
    </Layout>
  );
}