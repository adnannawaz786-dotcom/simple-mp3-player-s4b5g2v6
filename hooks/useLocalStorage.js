import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
  // Get value from localStorage or return initialValue
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Remove item from localStorage
  const removeValue = () => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue];
}

// Hook for managing playlist in localStorage
export function usePlaylist() {
  const [playlist, setPlaylist, removePlaylist] = useLocalStorage('mp3-player-playlist', []);
  
  const addToPlaylist = (track) => {
    setPlaylist(prev => {
      // Check if track already exists
      const exists = prev.some(item => item.name === track.name && item.size === track.size);
      if (exists) return prev;
      
      return [...prev, {
        id: Date.now(),
        name: track.name,
        url: track.url,
        size: track.size,
        duration: track.duration || null,
        addedAt: new Date().toISOString()
      }];
    });
  };

  const removeFromPlaylist = (trackId) => {
    setPlaylist(prev => prev.filter(track => track.id !== trackId));
  };

  const clearPlaylist = () => {
    removePlaylist();
  };

  const updateTrackDuration = (trackId, duration) => {
    setPlaylist(prev => 
      prev.map(track => 
        track.id === trackId 
          ? { ...track, duration } 
          : track
      )
    );
  };

  return {
    playlist,
    addToPlaylist,
    removeFromPlaylist,
    clearPlaylist,
    updateTrackDuration
  };
}

// Hook for managing player settings
export function usePlayerSettings() {
  const [settings, setSettings] = useLocalStorage('mp3-player-settings', {
    volume: 1,
    repeat: false,
    shuffle: false,
    lastPlayedTrack: null,
    lastPosition: 0
  });

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateLastPlayed = (trackId, position = 0) => {
    setSettings(prev => ({
      ...prev,
      lastPlayedTrack: trackId,
      lastPosition: position
    }));
  };

  return {
    settings,
    updateSetting,
    updateLastPlayed
  };
}