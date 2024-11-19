// LeftPanel.jsx
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import LeftHeader from './InnerComponents/LeftHeader';
import MusicComponents from './InnerComponents/MusicComponents';

const LeftPanel = forwardRef(({ onScroll }, ref) => {
  const scrollContainerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    get scrollTop() {
      return scrollContainerRef.current?.scrollTop || 0;
    },
    set scrollTop(value) {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = value;
      }
    }
  }));

  return (
    <div className="h-full bg-[#060505] flex flex-col relative">
      <div className="sticky top-0 z-50 p-4">
        <LeftHeader />
      </div>
      <div 
        ref={scrollContainerRef}
        onScroll={onScroll}
        className="flex-1 overflow-y-scroll scrollbar-hidden py-4 relative z-20"
      >
        <MusicComponents />
      </div>
    </div>
  );
});

export default LeftPanel;