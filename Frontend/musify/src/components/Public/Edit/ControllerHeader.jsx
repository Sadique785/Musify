import React from 'react';
import MemoryButtons from './InnerComponents/MemoryButtons';
import GainController from './InnerComponents/GainController';
import PlayItems from './InnerComponents/PlayItems';
import { PlaybackProvider } from '../../../context/PlayBackContext';


function ControllerHeader() {
  return (

    <div className="fixed top-[50px] pb-3 left-0 w-full h-[60px] bg-[#060505] flex items-center justify-between px-4 z-5">
      {/* Left section: MemoryButtons */}
      <div className="w-1/5 flex justify-start">
        <MemoryButtons />
      </div>
      
      {/* Middle section: PlayItems */}
      <div className="w-2/5 flex  justify-center">
        <PlayItems />
      </div>
      
      {/* Right section: GainController */}
      <div className="w-1/5 flex justify-center">
        <GainController />
      </div>
    </div>
  );

}

export default ControllerHeader;
