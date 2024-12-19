// DraggableTrack.jsx
import React, { useState, useRef, useEffect } from 'react';
import { usePlayback } from '../../../../context/PlayBackContext';
import { useDispatch } from 'react-redux';
import { removeSegment } from '../../../../redux/auth/Slices/audioSlice';
import WaveformTrack from './WaveformTrack';
import SegmentContextMenu from './SegmentContextMenu';

const DraggableTrack = ({ 
  trackId,
  trackData,
  audioData,
  trackWidth,
  segment,
  color,
  name,
  isCutting,
  position,
  viewPosition, 
  onPositionChange,
  handleClick,
}) => {
  const dispatch = useDispatch();
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startPos, setStartPos] = useState(0);
  const [zIndex, setZIndex] = useState(1);
  const trackRef = useRef(null);
  const { isPlaying, setIsDragging: setContextIsDragging } = usePlayback();
  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    position: { x: 0, y: 0 }
  });

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Get the track's position relative to the viewport
    const trackRect = trackRef.current.getBoundingClientRect();
    
    // Calculate position relative to the viewport, not the parent
    const menuX = e.clientX;
    const menuY = e.clientY;
    
    setContextMenu({
      isOpen: true,
      position: {
        x: menuX,
        y: menuY
      }
    });
  };

  const handleDeleteSegment = () => {
    dispatch(removeSegment({
      trackId: trackId,
      segmentIndex: segment.segmentIndex
    }));
    handleContextMenuClose();
  };

  const handleContextMenuClose = () => {
    setContextMenu({
      isOpen: false,
      position: { x: 0, y: 0 }
    });
  };

  const handleMouseDown = (e) => {
    // Prevent dragging if context menu is open or right click
    if (isPlaying || isCutting || contextMenu.isOpen || e.button === 2) return;
    e.stopPropagation();
    setIsDragging(true);
    setContextIsDragging(true);
    setStartX(e.clientX);
    setStartPos(viewPosition);
    setZIndex(999);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const delta = e.clientX - startX;
    const newPosition = Math.max(0, startPos + delta);
    const containerWidth = trackRef.current?.parentElement?.clientWidth || 0;
    const maxPosition = Math.max(0, containerWidth - trackWidth);
    const boundedPosition = Math.min(newPosition, maxPosition);

    onPositionChange(boundedPosition);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setContextIsDragging(false);
    setTimeout(() => setZIndex(1), 0);
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

  return (
    <>
      <div
        ref={trackRef}
        onClick={(e) => {
          const trackRect = trackRef.current?.getBoundingClientRect();
          const clickX = e.clientX - (trackRect?.left || 0);
          handleClick(clickX, trackWidth);
        }}
        onContextMenu={handleContextMenu}
        className={`absolute top-0 left-0 transition-all duration-200 ${
          isCutting ? 'cursor-crosshair' : 'cursor-move'
        } ${isDragging ? 'opacity-75' : ''}`}
        style={{
          transform: `translateX(${viewPosition}px)`, // Use viewPosition for visual transform
          width: `${trackWidth}px`,
          height: '96px',
          userSelect: 'none',
          zIndex,
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          overflow: 'hidden'
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="h-24 rounded-lg relative overflow-hidden">
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
          <div className="relative z-10 p-2 overflow-hidden">
            <WaveformTrack 
              file_url={audioData}
              trackData={trackData}
              color={color}
              position={position} // Keep original position for WaveformTrack
              trackId={trackId}
              isCutting={isCutting}
              segment={segment}
            />
            <div className="absolute left-4 top-4 text-sm text-gray-300">
              {`${name} - Segment ${segment.segmentIndex}`}
            </div>
          </div>
        </div>
      </div>

      <SegmentContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        onClose={handleContextMenuClose}
        onDelete={handleDeleteSegment}
        segment={segment}
      />
    </>
  );
};

export default DraggableTrack;