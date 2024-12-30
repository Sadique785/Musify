import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause } from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';

const AudioPlayer = ({ audioUrl, title }) => {
  const waveformRef = useRef(null);
  const wavesurferRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let wavesurfer = null;

    if (waveformRef.current && !wavesurferRef.current) {
      wavesurfer = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#FFFFFF',
        progressColor: '#6b7280',
        barWidth: 2,
        barHeight: 1,
        responsive: true,
        normalize: true,
        fillParent: true,
        height: 80,
      });

      wavesurferRef.current = wavesurfer;

      wavesurfer.on('ready', () => {
        setIsLoading(false);
        setDuration(wavesurfer.getDuration());
      });

      wavesurfer.on('finish', () => {
        setIsPlaying(false);
      });

      wavesurfer.load(audioUrl);
    }

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
      }
    };
  }, [audioUrl]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex flex-col space-y-4 w-full">
      <div className="flex items-center space-x-4">
        <button
          onClick={handlePlayPause}
          className="w-12 h-12 flex items-center justify-center bg-gray-800 hover:bg-gray-900 text-white rounded-full transition-colors"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
          ) : isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-1" />
          )}
        </button>
        <div className="text-sm text-gray-300">
          {formatTime(duration)}
        </div>
      </div>
      <div ref={waveformRef} className="w-full" />
    </div>
  );
};

export default AudioPlayer;
