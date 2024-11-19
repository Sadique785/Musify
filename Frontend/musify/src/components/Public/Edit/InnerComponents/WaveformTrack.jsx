// WaveformTrack.js
import React, { useState, useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { usePlayback } from '../../../../context/PlayBackContext';

function WaveformTrack({ file_url, color, trackId }) {
  const waveformRef = useRef(null);
  const wavesurferRef = useRef(null);
  const { isPlaying, currentTime, startTimes, isDragging } = usePlayback();
  const [duration, setDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isTrackCompleted, setIsTrackCompleted] = useState(false);
  const lastTimeRef = useRef(currentTime);

  useEffect(() => {
    if (!wavesurferRef.current) {
      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: color || '#BF7474',
        progressColor: '#9C5E5E',
        barWidth: 2,
        height: 80,
        normalize: true,
      });
      wavesurferRef.current.load(file_url);

      wavesurferRef.current.on('ready', () => {
        setDuration(wavesurferRef.current.getDuration());
        setIsReady(true);
      });

      wavesurferRef.current.on('finish', () => {
        setIsTrackCompleted(true);
        wavesurferRef.current.pause();
        wavesurferRef.current.seekTo(1);
      });
    }

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
      }
    };
  }, [file_url, color]);

  useEffect(() => {
    if (!wavesurferRef.current || !isReady || isDragging) return;

    const trackStartTime = startTimes[trackId] || 0;
    const trackRelativeTime = Math.max(0, currentTime - trackStartTime);
    const trackDuration = wavesurferRef.current.getDuration();

    // Handle manual time change or track position change
    if (Math.abs(currentTime - lastTimeRef.current) > 1 || isDragging) {
      if (currentTime >= trackStartTime && trackRelativeTime < trackDuration) {
        const seekPosition = trackRelativeTime / trackDuration;
        wavesurferRef.current.seekTo(seekPosition);
        setIsTrackCompleted(false);
      } else if (currentTime < trackStartTime) {
        wavesurferRef.current.seekTo(0);
        setIsTrackCompleted(false);
      } else if (trackRelativeTime >= trackDuration) {
        wavesurferRef.current.seekTo(1);
        setIsTrackCompleted(true);
      }
    }

    // Handle playback
    if (isPlaying && !isTrackCompleted) {
      if (currentTime >= trackStartTime && trackRelativeTime < trackDuration) {
        if (!wavesurferRef.current.isPlaying()) {
          wavesurferRef.current.play();
        }
      } else {
        wavesurferRef.current.pause();
      }
    } else {
      wavesurferRef.current.pause();
    }

    lastTimeRef.current = currentTime;
  }, [currentTime, isPlaying, isReady, startTimes, trackId, isTrackCompleted, isDragging]);

  return <div ref={waveformRef} style={{ width: '100%' }} />;
}

export default WaveformTrack;