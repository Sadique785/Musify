import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { saveTrackSettings, getAllTrackSettings } from '../indexedDb/indexedDb';


const PlaybackContext = createContext();

export const usePlayback = () => useContext(PlaybackContext);

export const PlaybackProvider = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [disablePlayButton, setDisablePlayButton] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [trackPositions, setTrackPositions] = useState({});
  const [startTimes, setStartTimes] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [trackVolumes, setTrackVolumes] = useState({});

  const playbackSpeed = 1; // Keep the actual playback speed at 1
  
  const startTimeRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastTimeRef = useRef(currentTime);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const allSettings = await getAllTrackSettings();
        const volumes = {};
        allSettings.forEach(settings => {
          if (settings) {
            volumes[settings.trackId] = settings.volume ?? 50; // Default to 50 if not set
          }
        });
        setTrackVolumes(volumes);
      } catch (error) {
        console.error('Error loading track settings:', error);
      }
    };

    loadSettings();
  }, []);

  const updateTrackVolume = async (trackId, volume) => {
    setTrackVolumes(prev => ({
      ...prev,
      [trackId]: volume
    }));

    try {
      await saveTrackSettings(trackId, {
        trackId,
        volume,
        lastModified: Date.now()
      });
    } catch (error) {
      console.error('Error saving track volume:', error);
    }
  };

  const updateStartTimes = (positions) => {
    const calculatedStartTimes = Object.entries(positions).reduce((acc, [trackId, position]) => {
      const startTimeInSeconds = position ? position / 50 : 0;
      acc[trackId] = startTimeInSeconds;
      return acc;
    }, {});
    setStartTimes(calculatedStartTimes);
  };

  const playAll = () => {
    setIsPlaying(true);
    setDisablePlayButton(true);
    updateStartTimes(trackPositions);
    startTimeRef.current = performance.now() - (lastTimeRef.current * 1000 / playbackSpeed);
  };

  const pauseAll = () => {
    setIsPlaying(false);
    setDisablePlayButton(false);
    lastTimeRef.current = currentTime;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const resetAll = () => {
    setIsPlaying(false);
    setDisablePlayButton(false);
    setCurrentTime(0);
    lastTimeRef.current = 0;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };


  const updateCurrentTime = (newTime) => {
    setCurrentTime(newTime);
    lastTimeRef.current = newTime;
    setIsPlaying(false);
    setDisablePlayButton(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const updateTime = (timestamp) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp - (lastTimeRef.current * 1000 / playbackSpeed);
    }
    const elapsed = ((timestamp - startTimeRef.current) * playbackSpeed) / 1000;
    setCurrentTime(elapsed);

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateTime);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateTime);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <PlaybackContext.Provider 
      value={{ 
        isPlaying, 
        playAll, 
        pauseAll, 
        resetAll, 
        disablePlayButton, 
        currentTime,
        setCurrentTime: updateCurrentTime,
        trackPositions,
        setTrackPositions,
        startTimes,
        setStartTimes: updateStartTimes,
        isDragging, setIsDragging,
        playbackSpeed,
        trackVolumes, updateTrackVolume,
      }}
    >
      {children}
    </PlaybackContext.Provider>
  );
};