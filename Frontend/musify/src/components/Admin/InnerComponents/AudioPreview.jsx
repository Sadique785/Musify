import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

const AudioPreview = ({ fileUrl }) => {
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const progressCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const audio = new Audio(fileUrl);
    audioRef.current = audio;

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
      setIsLoading(false);
      visualizeAudio();
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
      updateProgressOverlay();
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [fileUrl]);

  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current && canvasRef.current && progressCanvasRef.current) {
        const containerWidth = containerRef.current.clientWidth - 56;
        canvasRef.current.width = containerWidth;
        progressCanvasRef.current.width = containerWidth;
        visualizeAudio();
      }
    };

    const resizeObserver = new ResizeObserver(updateCanvasSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  const updateProgressOverlay = () => {
    const canvas = progressCanvasRef.current;
    if (!canvas || !audioRef.current) return;

    const ctx = canvas.getContext('2d');
    const progress = (currentTime / duration) * canvas.width;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#6366f1'; // Indigo color for progress
    ctx.fillRect(0, 0, progress, canvas.height);
  };

  const visualizeAudio = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const response = await fetch(fileUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const data = audioBuffer.getChannelData(0);
      const step = Math.ceil(data.length / canvas.width);
      const amp = canvas.height / 2;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < canvas.width; i++) {
        let min = 1.0;
        let max = -1.0;
        
        for (let j = 0; j < step; j++) {
          const datum = data[(i * step) + j];
          if (datum < min) min = datum;
          if (datum > max) max = datum;
        }

        ctx.fillStyle = '#94a3b8'; // Slate-300 color for waveform
        ctx.fillRect(
          i, 
          (1 + min) * amp,
          1,
          Math.max(1, (max - min) * amp)
        );
      }
    } catch (error) {
      console.error('Error visualizing audio:', error);
    }
  };

  const handleWaveformClick = (e) => {
    if (!audioRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickPosition = x / canvas.width;
    
    audioRef.current.currentTime = clickPosition * duration;
    setCurrentTime(audioRef.current.currentTime);
    updateProgressOverlay();
  };

  const onPlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div ref={containerRef} className="w-full rounded-lg bg-transparent">
      <div className="flex flex-col gap-4">
        <div className="w-full flex items-center gap-4">
          <button
            onClick={onPlayPause}
            disabled={isLoading}
            className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            {isLoading ? (
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4 text-gray-200" />
            ) : (
              <Play className="w-4 h-4 text-gray-200" />
            )}
          </button>
          <div className="relative flex-1">
            <canvas
              ref={canvasRef}
              className="w-full h-20 bg-gray-800 rounded cursor-pointer"
              height={80}
              onClick={handleWaveformClick}
            />
            <canvas
              ref={progressCanvasRef}
              className="absolute top-0 left-0 w-full h-20 opacity-50 pointer-events-none"
              height={80}
            />
          </div>
        </div>
        <div className="w-full text-sm text-gray-400 flex justify-between px-2">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};

export default AudioPreview;