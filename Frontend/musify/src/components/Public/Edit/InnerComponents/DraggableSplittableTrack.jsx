import React, { useState, useRef, useEffect } from 'react';
import { usePlayback } from '../../../../context/PlayBackContext';
import WaveformTrack from './WaveformTrack';

const DraggableSplittableTrack = ({ 
  trackId, 
  audioData, 
  trackWidth, 
  color, 
  name,
  onPositionChange 
}) => {
  // Dragging state
  const [mainPosition, setMainPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startPos, setStartPos] = useState(0);

  // Splitting state
  const [segments, setSegments] = useState([{ 
    id: 'initial',
    start: 0,
    end: trackWidth,
    offset: 0 // Offset within the segment
  }]);
  const [isCuttingMode, setIsCuttingMode] = useState(false);
  const [activeSegment, setActiveSegment] = useState(null);
  const [isSegmentDragging, setIsSegmentDragging] = useState(false);

  const trackRef = useRef(null);
  const { 
    isPlaying, 
    trackPositions, 
    setTrackPositions, 
    setStartTimes,
    setIsDragging: setContextIsDragging 
  } = usePlayback();

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key.toLowerCase() === 'c') {
        setIsCuttingMode(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Main track dragging handlers
  const handleMainTrackMouseDown = (e) => {
    if (isPlaying || isCuttingMode || isSegmentDragging) return;
    setIsDragging(true);
    setContextIsDragging(true);
    setStartX(e.clientX);
    setStartPos(mainPosition);
  };

  const handleMainTrackMouseMove = (e) => {
    if (!isDragging) return;

    const delta = e.clientX - startX;
    const newPosition = Math.max(0, startPos + delta);
    const containerWidth = trackRef.current?.parentElement?.clientWidth || 0;
    const maxPosition = containerWidth - trackWidth;
    const boundedPosition = Math.min(newPosition, maxPosition);

    setMainPosition(boundedPosition);
    const newTrackPositions = {
      ...trackPositions,
      [trackId]: boundedPosition,
    };
    
    setTrackPositions(newTrackPositions);
    
    const calculatedStartTimes = Object.entries(newTrackPositions).reduce((acc, [id, pos]) => {
      const startTimeInSeconds = pos ? pos / 50 : 0;
      acc[id] = startTimeInSeconds;
      return acc;
    }, {});
    setStartTimes(calculatedStartTimes);
  };

  // Cutting functionality
  const handleTrackClick = (e) => {
    if (!isCuttingMode || isPlaying || isDragging) return;

    const trackRect = trackRef.current.getBoundingClientRect();
    const clickX = e.clientX - trackRect.left - mainPosition;

    setSegments(currentSegments => {
      const affectedSegment = currentSegments.find(seg => 
        clickX >= seg.offset && clickX <= (seg.offset + (seg.end - seg.start))
      );

      if (!affectedSegment) return currentSegments;

      const relativeClickX = clickX - affectedSegment.offset;
      
      const newSegments = [
        ...currentSegments.filter(seg => seg.id !== affectedSegment.id),
        {
          id: `${affectedSegment.id}-left-${Date.now()}`,
          start: affectedSegment.start,
          end: affectedSegment.start + relativeClickX,
          offset: affectedSegment.offset
        },
        {
          id: `${affectedSegment.id}-right-${Date.now()}`,
          start: affectedSegment.start + relativeClickX,
          end: affectedSegment.end,
          offset: affectedSegment.offset + relativeClickX
        }
      ];

      return newSegments.sort((a, b) => a.offset - b.offset);
    });

    setIsCuttingMode(false);
  };

  // Segment dragging handlers
  const handleSegmentMouseDown = (e, segment) => {
    if (isPlaying || isCuttingMode || isDragging) return;
    e.stopPropagation();
    setIsSegmentDragging(true);
    setContextIsDragging(true);
    setActiveSegment({
      ...segment,
      startX: e.clientX,
      startOffset: segment.offset
    });
  };

  const handleSegmentMouseMove = (e) => {
    if (!isSegmentDragging || !activeSegment) return;

    const delta = e.clientX - activeSegment.startX;
    const newOffset = Math.max(0, activeSegment.startOffset + delta);
    const maxOffset = trackWidth - (activeSegment.end - activeSegment.start);
    const boundedOffset = Math.min(newOffset, maxOffset);

    setSegments(currentSegments => 
      currentSegments.map(seg => 
        seg.id === activeSegment.id 
          ? { ...seg, offset: boundedOffset }
          : seg
      )
    );
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsSegmentDragging(false);
    setContextIsDragging(false);
    setActiveSegment(null);
  };

  useEffect(() => {
    if (isDragging || isSegmentDragging) {
      document.addEventListener('mousemove', 
        isDragging ? handleMainTrackMouseMove : handleSegmentMouseMove
      );
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', 
          isDragging ? handleMainTrackMouseMove : handleSegmentMouseMove
        );
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isSegmentDragging]);

  useEffect(() => {
    if (trackPositions[trackId] !== undefined) {
      setMainPosition(trackPositions[trackId]);
    }
  }, [trackPositions, trackId]);

  return (
    <div
      ref={trackRef}
      className={`relative group transition-all duration-200 ${
        isCuttingMode ? 'cursor-crosshair' : isDragging ? 'cursor-move' : 'cursor-default'
      }`}
      style={{
        transform: `translateX(${mainPosition}px)`,
        width: `${trackWidth}px`,
        height: '96px',
        userSelect: 'none'
      }}
      onMouseDown={handleMainTrackMouseDown}
      onClick={handleTrackClick}
    >
      {segments.map(segment => (
        <div
          key={segment.id}
          className={`absolute h-24 rounded-lg ${
            isSegmentDragging && activeSegment?.id === segment.id ? 'opacity-75' : ''
          }`}
          style={{
            left: `${segment.offset}px`,
            width: `${segment.end - segment.start}px`,
          }}
          onMouseDown={(e) => handleSegmentMouseDown(e, segment)}
        >
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
              position={mainPosition + segment.offset} 
              trackId={`${trackId}-${segment.id}`}
              start={segment.start / trackWidth}
              end={segment.end / trackWidth}
            />
            <div className="absolute left-4 top-4 text-sm text-gray-300">
              {name} - Segment {segment.id}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DraggableSplittableTrack;