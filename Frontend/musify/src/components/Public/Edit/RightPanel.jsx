import React, { useEffect, useRef, useState } from 'react';
import RightHeader from './InnerComponents/RightHeader';
import RightContent from './InnerComponents/RightContent';
import { usePlayback } from '../../../context/PlayBackContext';

function RightPanel() {
  const { currentTime } = usePlayback();
  const [zoomLevel, setZoomLevel] = useState(1);
  const headerScrollRef = useRef(null);
  const contentScrollRef = useRef(null);

  const handleScroll = (e) => {
    const source = e.target;
    const isHeader = source === headerScrollRef.current;
    const target = isHeader ? contentScrollRef.current : headerScrollRef.current;

    if (target) {
      target.scrollLeft = source.scrollLeft;
    }
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
      className="bg-[#060505] h-full flex flex-col"
      onWheel={handleZoom}
    >
      <div className="sticky top-0 pl-6 z-40 bg-[#060505]">
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
        />
      </div>
    </div>
  );
}

export default RightPanel;