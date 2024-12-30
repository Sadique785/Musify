// RightPanel.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import RightHeader from './InnerComponents/RightHeader';
import RightContent from './InnerComponents/RightContent';
import { usePlayback } from '../../../context/PlayBackContext';
import { selectTracks } from '../../../redux/auth/Slices/audioSlice';

function RightPanel() {
  const { currentTime } = usePlayback();
  const [zoomLevel, setZoomLevel] = useState(1);
  const headerScrollRef = useRef(null);
  const contentScrollRef = useRef(null);
  const dispatch = useDispatch();
  const tracks = useSelector(selectTracks);
  
  // Store zoom-adjusted viewPositions separately from Redux
  const [zoomedPositions, setZoomedPositions] = useState({});

  // Initialize zoomedPositions from Redux state
  useEffect(() => {
    const initialPositions = {};
    tracks.forEach(track => {
      if (track.segments) {
        track.segments.forEach(segment => {
          const key = `${track.id}_${segment.segmentIndex}`;
          initialPositions[key] = segment.viewPosition || segment.position || 0;
        });
      }
    });
    setZoomedPositions(initialPositions);
  }, [tracks]);

  const handleScroll = (e) => {
    const source = e.target;
    const isHeader = source === headerScrollRef.current;
    const target = isHeader ? contentScrollRef.current : headerScrollRef.current;

    if (target) {
      target.scrollLeft = source.scrollLeft;
    }
  };

  const updateZoomedPositions = (previousZoom, newZoom) => {
    const zoomRatio = newZoom / previousZoom;
    
    setZoomedPositions(prevPositions => {
      const newPositions = {};
      Object.entries(prevPositions).forEach(([key, oldViewPosition]) => {
        if (oldViewPosition !== 0) {
          newPositions[key] = Math.round(oldViewPosition * zoomRatio);
        } else {
          newPositions[key] = 0;
        }
      });
      return newPositions;
    });
  };

  const handleZoom = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoomLevel = Math.min(Math.max(zoomLevel * delta, 0.5), 5);
      
      // Update zoomed positions before changing zoom level
      updateZoomedPositions(zoomLevel, newZoomLevel);
      setZoomLevel(newZoomLevel);
    }
  };

  useEffect(() => {
    const preventBrowserZoom = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '-' || e.key === '0')) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', preventBrowserZoom);
    return () => window.removeEventListener('keydown', preventBrowserZoom);
  }, []);

  return (
    <div 
      className="bg-[#060505] h-full flex flex-col relative"
      onWheel={handleZoom}
    >
      <div className="sticky top-0 pl-6  bg-[#060505]">
        <RightHeader 
          zoomLevel={zoomLevel}
          onScroll={handleScroll}
          ref={headerScrollRef}
        />
      </div>
      <div className="flex-1 mt-6 overflow-y-scroll scrollbar-hidden">
        <RightContent 
          zoomLevel={zoomLevel}
          onScroll={handleScroll}
          ref={contentScrollRef}
          zoomedPositions={zoomedPositions}
          setZoomedPositions={setZoomedPositions}
        />
      </div>
    </div>
  );
}

export default RightPanel;