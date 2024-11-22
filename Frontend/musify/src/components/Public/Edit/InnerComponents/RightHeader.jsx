import React, { useRef, forwardRef, useEffect, useState } from 'react';
import { usePlayback } from '../../../../context/PlayBackContext';

const RightHeader = forwardRef(({ zoomLevel, onScroll }, ref) => {
  const { currentTime, setCurrentTime, isPlaying, playbackSpeed } = usePlayback();
  const progressBarRef = useRef(null);
  const progressIndicatorRef = useRef(null);
  const playedAreaRef = useRef(null);
  const pixelsPerSecond = 50;
  const [animationStartTime, setAnimationStartTime] = useState(null);
  const visualPositionRef = useRef(0);




useEffect(() => {
  const position = currentTime * pixelsPerSecond * zoomLevel;
  
  // Update visual position ref
  visualPositionRef.current = position;

  // Update progress indicator and played area
  if (progressIndicatorRef.current) {
    progressIndicatorRef.current.style.transform = `translateX(${position}px)`;
  }
  if (playedAreaRef.current) {
    playedAreaRef.current.style.width = `${position}px`;
  }
}, [currentTime, zoomLevel]);



  const handleTimelineClick = (e) => {
    if (!progressBarRef.current) return;
  
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left + progressBarRef.current.scrollLeft;
    const newTime = clickX / (pixelsPerSecond * zoomLevel);
  
    if (newTime >= 0 && newTime <= 300) {
      // Calculate exact position based on time
      const exactPosition = newTime * pixelsPerSecond * zoomLevel;
  
      // Update context time
      setCurrentTime(newTime);
      
      // Directly update refs with exact position
      if (progressIndicatorRef.current) {
        progressIndicatorRef.current.style.transform = `translateX(${exactPosition}px)`;
      }
      if (playedAreaRef.current) {
        playedAreaRef.current.style.width = `${exactPosition}px`;
      }
      
      // Ensure visual position ref is updated
      visualPositionRef.current = exactPosition;
    }
  };
  

  const generateTimeMarkers = () => {
    const markers = [];
    const totalSeconds = 300;
    const markerSpacing = pixelsPerSecond * zoomLevel;
    
    let step = 1;
    if (zoomLevel < 0.7) step = 5;
    if (zoomLevel < 0.4) step = 10;
    
    for (let i = 0; i <= totalSeconds; i += step) {
      markers.push({
        time: i,
        major: true,
        position: (i * pixelsPerSecond * zoomLevel)
      });
      
      if (zoomLevel > 0.7 && i < totalSeconds) {
        for (let j = 1; j < step; j++) {
          markers.push({
            time: i + j,
            major: false,
            position: ((i + j) * pixelsPerSecond * zoomLevel)
          });
        }
      }
    }
    
    return markers.sort((a, b) => a.position - b.position);
  };

  return (
    <div 
      ref={ref}
      className="w-full overflow-x-scroll scrollbar-hidden relative"
      onScroll={(e) => onScroll(e)}
    >
      <div 
        ref={progressBarRef}
        className="h-12 border-b border-gray-700 relative cursor-pointer"
        style={{ width: `${300 * zoomLevel}%` }}
        onClick={handleTimelineClick}
      >
        {/* Playback Progress Indicator */}
        <div 
          ref={progressIndicatorRef}
          className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-10"
          style={{ left: 0, transition: isPlaying ? 'none' : 'transform 0.1s ease-out' }}
        >
          <div className="w-3 h-3 bg-blue-500 rounded-full absolute -left-[5px] -top-1" />
        </div>

        {/* Time Markers */}
        <div className="flex h-full items-end">
          {generateTimeMarkers().map((marker, i) => (
            <div
              key={i}
              className="absolute flex flex-col items-center"
              style={{
                height: marker.major ? '100%' : '50%',
                left: `${marker.position}px`,
                width: '1px'
              }}
            >
              <div 
                className={`w-px ${marker.major ? 'bg-gray-500' : 'bg-gray-700'} h-full relative`}
              >
                {marker.major && (
                  <span className="absolute bottom-0 left-2 text-xs text-gray-400 whitespace-nowrap">
                    {marker.time}s
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Played Time Indicator */}
        <div 
          ref={playedAreaRef}
          className="absolute top-0 left-0 h-full bg-blue-500/10"
          style={{ transition: isPlaying ? 'none' : 'width 0.1s ease-out' }}
        />
      </div>
    </div>
  );
});

export default RightHeader;