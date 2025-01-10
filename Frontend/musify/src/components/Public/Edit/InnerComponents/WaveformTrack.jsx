// WaveformTrack.jsx
import React, { useState, useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { usePlayback } from '../../../../context/PlayBackContext';
import AudioSplitter from './AudioSplitter';
import AudioEffectsProcessor from './FXComponents/AudioEffectsProcessor';

function WaveformTrack({ file_url, position, segment, color, trackId, trackData, isCutting }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const waveformRef = useRef(null);
  const wavesurferRef = useRef(null);
  const { isPlaying, currentTime, isDragging, trackVolumes } = usePlayback();
  const [duration, setDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isTrackCompleted, setIsTrackCompleted] = useState(false);
  const lastTimeRef = useRef(currentTime);

  const trackVolume = (trackVolumes[trackId] ?? 50) / 100;
  const PIXELS_PER_SECOND = 50;
  const segmentStartOffset = position / PIXELS_PER_SECOND;

  const handleWaveformClick = () => {
    if (isCutting) {
      setIsModalOpen(true);
    }
  };

  const normalizeTime = (time, totalDuration) => {
    if (!isFinite(time) || isNaN(time)) return 0;
    return Math.max(0, Math.min(time, totalDuration));
  };

  const calculatePlaybackTime = (globalTime) => {
    const timeRelativeToSegmentPosition = globalTime - segmentStartOffset;
    const segmentDuration = segment.endTime - segment.startTime;
    const segmentRelativeTime = timeRelativeToSegmentPosition;
    
    // Only log when significant changes occur
    if (Math.abs(lastTimeRef.current - globalTime) > 0.1) {
      console.debug(`[Track ${trackId}] Playback Update:`, {
        timeRelativeToSegmentPosition,
        segmentDuration,
        position,
        containerWidth: waveformRef.current?.clientWidth
      });
    }
    
    return { timeRelativeToSegmentPosition, segmentRelativeTime };
  };

  const isTimeWithinSegment = (relativeTime) => {
    const segmentDuration = segment.endTime - segment.startTime;
    return relativeTime >= 0 && relativeTime < segmentDuration;
  };

  useEffect(() => {
    if (!wavesurferRef.current) {
      // Log container dimensions when creating wavesurfer instance
      console.debug(`[Track ${trackId}] Container Dimensions:`, {
        width: waveformRef.current?.clientWidth,
        scrollWidth: waveformRef.current?.scrollWidth,
        offsetWidth: waveformRef.current?.offsetWidth
      });

      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: color || '#BF7474',
        progressColor: '#9C5E5E',
        barWidth: 2,
        height: 80,
        normalize: true,
        partialRender: true,
        interact: false,
        minPxPerSec: 50,
        fillParent: true,
        duration: 46,
        responsive: true,
        scrollParent: false, // Ensure this is false to prevent scrolling
        hideScrollbar: true, // Hide the scrollbar
      });

      wavesurferRef.current.load(file_url);

      wavesurferRef.current.on('ready', () => {
        const totalDuration = wavesurferRef.current.getDuration();
        setDuration(totalDuration);
        setIsReady(true);
        wavesurferRef.current.seekTo(0);

        // Log waveform dimensions after load
        console.debug(`[Track ${trackId}] Waveform Ready:`, {
          duration: totalDuration,
          containerWidth: waveformRef.current?.clientWidth,
          waveformWidth: wavesurferRef.current.drawer.width
        });
      });
    }

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
      }
    };
  }, [file_url, color, segment.startTime, segment.endTime]);

  useEffect(() => {
    if (!wavesurferRef.current || !isReady || isDragging) return;

    const { timeRelativeToSegmentPosition } = calculatePlaybackTime(currentTime);
    const withinSegment = isTimeWithinSegment(timeRelativeToSegmentPosition);

    if (withinSegment) {
      setIsTrackCompleted(false);
    }

    if (Math.abs(currentTime - lastTimeRef.current) > 0.1 || isDragging) {
      if (withinSegment) {
        const seekPosition = timeRelativeToSegmentPosition / (segment.endTime - segment.startTime);
        wavesurferRef.current.seekTo(seekPosition);
      } else if (timeRelativeToSegmentPosition < 0) {
        wavesurferRef.current.seekTo(0);
        setIsTrackCompleted(false);
      } else {
        wavesurferRef.current.seekTo(1);
        setIsTrackCompleted(true);
      }
    }

    if (isPlaying && withinSegment && !isTrackCompleted) {
      if (!wavesurferRef.current.isPlaying()) {
        wavesurferRef.current.play();
      }
    } else {
      if (wavesurferRef.current.isPlaying()) {
        wavesurferRef.current.pause();
      }
    }

    lastTimeRef.current = currentTime;
  }, [currentTime, isPlaying, isReady, position, isDragging]);

  useEffect(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.setVolume(trackVolume);
    }
  }, [trackVolume]);

  return (
    <div className="relative w-full h-full">
      <div 
        ref={waveformRef} 
        style={{ 
          width: "100%",
          height: "80px",
          transform: "translateZ(0)",
          overflow: "hidden"
        }} 
        onClick={handleWaveformClick}
        className={`${isCutting ? "cursor-pointer" : ""}`}
      />
      
      {/* Updated AudioEffectsProcessor - removed segmentIndex prop */}
      {isReady && wavesurferRef.current && (
        <AudioEffectsProcessor
          wavesurfer={wavesurferRef.current}
          trackId={trackId}
        />
      )}
      <AudioSplitter
        fileUrl={file_url}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        trackData={trackData}
        segment={segment}
      />
    </div>
  );
}

export default WaveformTrack;