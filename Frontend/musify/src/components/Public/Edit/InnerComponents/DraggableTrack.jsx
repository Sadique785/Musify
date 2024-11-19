// DraggableTrack.js
import React, { useState, useRef, useEffect } from 'react';
import { usePlayback } from '../../../../context/PlayBackContext';
import WaveformTrack from './WaveformTrack';

const DraggableTrack = ({ 
  trackId, 
  audioData, 
  trackWidth, 
  color, 
  name,
  onPositionChange 
}) => {
  const [position, setPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startPos, setStartPos] = useState(0);
  const trackRef = useRef(null);
  const { 
    isPlaying, 
    trackPositions, 
    setTrackPositions, 
    setStartTimes,
    setIsDragging: setContextIsDragging 
  } = usePlayback();

  const handleMouseDown = (e) => {
    if (isPlaying) return;
    setIsDragging(true);
    setContextIsDragging(true);
    setStartX(e.clientX);
    setStartPos(position);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const delta = e.clientX - startX;
    const newPosition = Math.max(0, startPos + delta);
    const containerWidth = trackRef.current?.parentElement?.clientWidth || 0;
    const maxPosition = containerWidth - trackWidth;
    const boundedPosition = Math.min(newPosition, maxPosition);

    setPosition(boundedPosition);
    const newTrackPositions = {
      ...trackPositions,
      [trackId]: boundedPosition,
    };
    
    setTrackPositions(newTrackPositions);
    
    // Recalculate start times whenever track position changes during drag
    const calculatedStartTimes = Object.entries(newTrackPositions).reduce((acc, [id, pos]) => {
      const startTimeInSeconds = pos ? pos / 50 : 0;
      acc[id] = startTimeInSeconds;
      return acc;
    }, {});
    setStartTimes(calculatedStartTimes);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setContextIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  useEffect(() => {
    if (trackPositions[trackId] !== undefined) {
      setPosition(trackPositions[trackId]);
    }
  }, [trackPositions, trackId]);

  return (
    <div
      ref={trackRef}
      className={`relative group transition-all duration-200 cursor-move ${
        isDragging ? 'opacity-75' : ''
      }`}
      style={{
        transform: `translateX(${position}px)`,
        width: `${trackWidth}px`,
        height: '96px',
        userSelect: 'none'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="h-24 rounded-lg relative">
        <div
          style={{
            backgroundColor: color,
            opacity: 0.3,
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '0.5rem',
            pointerEvents: 'none',
          }}
        />
        <div className="relative z-10 p-4">
          <WaveformTrack 
            file_url={audioData} 
            color={color} 
            position={position} 
            trackId={trackId} 
          />
          <div className="absolute left-4 top-4 text-sm text-gray-300">{name}</div>
        </div>
      </div>
    </div>
  );
};

export default DraggableTrack;