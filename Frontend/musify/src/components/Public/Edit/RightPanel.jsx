import React, { useEffect, useRef, useState } from 'react';
import RightHeader from './InnerComponents/RightHeader';
import RightContent from './InnerComponents/RightContent';
import { usePlayback } from '../../../context/PlayBackContext';

function RightPanel( ) {
  const { isPlaying, playAll, pauseAll, resetAll, currentTime, disablePlayButton } = usePlayback();
  const [zoomLevel, setZoomLevel] = useState(1);
  const headerRef = useRef(null);
  const contentRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);

  const handleScroll = (source) => {
    if (isScrolling) return;
    
    setIsScrolling(true);
    const scrollLeft = source.scrollLeft;
    
    if (source === headerRef.current && contentRef.current) {
      contentRef.current.scrollLeft = scrollLeft;
    } else if (source === contentRef.current && headerRef.current) {
      headerRef.current.scrollLeft = scrollLeft;
    }
    
    setTimeout(() => setIsScrolling(false), 50);
  };

  const handleZoom = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoomLevel((prev) => Math.min(Math.max(prev * delta, 0.5), 5));
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
      className="bg-[#060505] h-full  flex flex-col"
      onWheel={handleZoom}
      onKeyDown={(e) => {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
        }
      }}
    >


      <div className="sticky top-0 pl-6 z-40 bg-[#060505]">
        <RightHeader 
          zoomLevel={zoomLevel}
          onScroll={(e) => handleScroll(e.target)}
          ref={headerRef}
        />
      </div>
      <div className="flex-1 mt-6  overflow-y-scroll scrollbar-hidden">
        <RightContent 
          zoomLevel={zoomLevel}
          onScroll={(e) => handleScroll(e.target)}
          ref={contentRef}
        />
      </div>
    </div>
  );
}


export default RightPanel;
