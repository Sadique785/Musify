import React, { useState, useEffect, useRef } from 'react';
import MainHeader from '../../components/Public/Edit/MainHeader';
import ControllerHeader from '../../components/Public/Edit/ControllerHeader';
import LeftPanel from '../../components/Public/Edit/LeftPanel';
import RightPanel from '../../components/Public/Edit/RightPanel';
import EditFooter from '../../components/Public/Edit/EditFooter';
import { PlaybackProvider } from '../../context/PlayBackContext';

function EditPage() {
  const leftPanelRef = useRef(null);
  const rightPanelRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);

  const syncScroll = (sourceRef, targetRef) => {
    if (!sourceRef?.current || !targetRef?.current || isScrolling) return;
    
    setIsScrolling(true);
    targetRef.current.scrollTop = sourceRef.current.scrollTop;
    
    setTimeout(() => setIsScrolling(false), 50);
  };

  useEffect(() => {
    const preventDefault = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '-' || e.key === '0')) {
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', preventDefault);
    document.addEventListener('wheel', (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    }, { passive: false });

    return () => {
      document.removeEventListener('keydown', preventDefault);
      document.removeEventListener('wheel', preventDefault);
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  });

  return (
    <PlaybackProvider>
      <div className="edit-page bg-[#060505] h-full overflow-hidden text-white relative">
        {/* Layer 1: Main Content */}
        <div className="relative z-10">
          <MainHeader />
          <ControllerHeader />
        </div>

        {/* Layer 2: Panels */}
        <div className="flex h-[calc(100vh-30px)] top-[100px] relative">
        <div className="w-1/5 h-full">
            <LeftPanel
              ref={leftPanelRef}
              onScroll={() => syncScroll(leftPanelRef, rightPanelRef)}
            />
          </div>

          <div className="w-4/5 h-full ">
            <RightPanel
              ref={rightPanelRef}
              leftPanelRef={leftPanelRef}
              onScroll={() => syncScroll(rightPanelRef, leftPanelRef)}
            />
          </div>
        </div>

        {/* Layer 3: Footer */}
        <div className="relative z-30">
          <EditFooter />
        </div>

        {/* Layer 4: Modal Layer - FXComponent will render here through portals */}
        <div id="modal-root" className="relative z-40" />
      </div>
    </PlaybackProvider>
  );
}

export default EditPage;