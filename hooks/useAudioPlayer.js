import { useState, useRef, useEffect, useCallback } from 'react';

export const useAudioPlayer = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    
    const audio = audioRef.current;
    
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };
    
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      playNext();
    };
    
    const handleError = () => {
      setError('Failed to load audio file');
      setIsLoading(false);
      setIsPlaying(false);
    };
    
    const handleCanPlay = () => {
      setError(null);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);
    
    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.pause();
    };
  }, []);

  // Load playlist from localStorage on mount
  useEffect(() => {
    const savedPlaylist = localStorage.getItem('mp3-player-playlist');
    if (savedPlaylist) {
      try {
        const parsedPlaylist = JSON.parse(savedPlaylist);
        setPlaylist(parsedPlaylist);
        if (parsedPlaylist.length > 0) {
          setCurrentTrack(parsedPlaylist[0]);
        }
      } catch (err) {
        console.error('Failed to load playlist from localStorage:', err);
      }
    }
  }, []);

  // Save playlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('mp3-player-playlist', JSON.stringify(playlist));
  }, [playlist]);

  const loadTrack = useCallback((track) => {
    if (!track || !audioRef.current) return;
    
    setIsLoading(true);
    setError(null);
    audioRef.current.src = track.url;
    setCurrentTrack(track);
    audioRef.current.load();
  }, []);

  const play = useCallback(() => {
    if (!audioRef.current || !currentTrack) return;
    
    audioRef.current.play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch((err) => {
        setError('Failed to play audio');
        console.error('Play error:', err);
      });
  }, [currentTrack]);

  const pause = useCallback(() => {
    if (!audioRef.current) return;
    
    audioRef.current.pause();
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const seekTo = useCallback((time) => {
    if (!audioRef.current) return;
    
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  const changeVolume = useCallback((newVolume) => {
    if (!audioRef.current) return;
    
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    audioRef.current.volume = clampedVolume;
    setVolume(clampedVolume);
  }, []);

  const addToPlaylist = useCallback((track) => {
    setPlaylist(prev => {
      const newPlaylist = [...prev, { ...track, id: Date.now() }];
      if (newPlaylist.length === 1) {
        setCurrentTrack(newPlaylist[0]);
        setCurrentTrackIndex(0);
      }
      return newPlaylist;
    });
  }, []);

  const removeFromPlaylist = useCallback((trackId) => {
    setPlaylist(prev => {
      const newPlaylist = prev.filter(track => track.id !== trackId);
      
      // If current track was removed, play next or stop
      if (currentTrack && currentTrack.id === trackId) {
        if (newPlaylist.length > 0) {
          const newIndex = Math.min(currentTrackIndex, newPlaylist.length - 1);
          setCurrentTrackIndex(newIndex);
          setCurrentTrack(newPlaylist[newIndex]);
          loadTrack(newPlaylist[newIndex]);
        } else {
          setCurrentTrack(null);
          setCurrentTrackIndex(0);
          pause();
        }
      } else {
        // Update current track index if needed
        const newCurrentIndex = newPlaylist.findIndex(track => track.id === currentTrack?.id);
        if (newCurrentIndex !== -1) {
          setCurrentTrackIndex(newCurrentIndex);
        }
      }
      
      return newPlaylist;
    });
  }, [currentTrack, currentTrackIndex, loadTrack, pause]);

  const playTrack = useCallback((track) => {
    const trackIndex = playlist.findIndex(t => t.id === track.id);
    if (trackIndex !== -1) {
      setCurrentTrackIndex(trackIndex);
      setCurrentTrack(track);
      loadTrack(track);
    }
  }, [playlist, loadTrack]);

  const playNext = useCallback(() => {
    if (playlist.length === 0) return;
    
    const nextIndex = (currentTrackIndex + 1) % playlist.length;
    const nextTrack = playlist[nextIndex];
    
    setCurrentTrackIndex(nextIndex);
    setCurrentTrack(nextTrack);
    loadTrack(nextTrack);
  }, [playlist, currentTrackIndex, loadTrack]);

  const playPrevious = useCallback(() => {
    if (playlist.length === 0) return;
    
    const prevIndex = currentTrackIndex === 0 ? playlist.length - 1 : currentTrackIndex - 1;
    const prevTrack = playlist[prevIndex];
    
    setCurrentTrackIndex(prevIndex);
    setCurrentTrack(prevTrack);
    loadTrack(prevTrack);
  }, [playlist, currentTrackIndex, loadTrack]);

  const clearPlaylist = useCallback(() => {
    setPlaylist([]);
    setCurrentTrack(null);
    setCurrentTrackIndex(0);
    pause();
  }, [pause]);

  const formatTime = useCallback((time) => {
    if (!time || isNaN(time)) return '0:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  return {
    // State
    isPlaying,
    duration,
    currentTime,
    volume,
    currentTrack,
    playlist,
    currentTrackIndex,
    isLoading,
    error,
    
    // Controls
    play,
    pause,
    togglePlay,
    seekTo,
    changeVolume,
    
    // Playlist management
    addToPlaylist,
    removeFromPlaylist,
    playTrack,
    playNext,
    playPrevious,
    clearPlaylist,
    
    // Utilities
    formatTime,
    loadTrack
  };
};