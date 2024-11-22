import React from 'react';
import { FaPlay, FaStop, FaRedo } from 'react-icons/fa';
import { usePlayback } from '../../../../context/PlayBackContext';

function PlayItems() {
  const { isPlaying, playAll, pauseAll, resetAll, currentTime } = usePlayback();

  // Format time to display as HH:MM:SS
  const formatTime = (time) => {
    const hours = String(Math.floor(time / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((time % 3600) / 60)).padStart(2, '0');
    const seconds = String(Math.floor(time % 60)).padStart(2,'0');
    const milliseconds = (time % 1).toFixed(2).slice(2);
    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
  };

  return (
    <div className="flex justify-center w-full max-w-[350px] gap-[2px]">
      {/* Play Button */}
      <div
        className={`flex-1 p-1 bg-[#211E1E] text-gray-400 flex items-center justify-center rounded-l-full ${
          isPlaying ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
        onClick={!isPlaying ? playAll : null}
      >
        <FaPlay size={14} />
      </div>

      {/* Stop Button */}
      <div
        className="flex-1 p-1 bg-[#211E1E] text-gray-400 flex items-center justify-center cursor-pointer"
        onClick={pauseAll}
      >
        <FaStop size={14} />
      </div>

      {/* Red Circle */}
      <div className="flex-1 p-1 bg-[#211E1E] text-gray-400 flex items-center justify-center">
        <div className="rounded-full bg-red-600 w-4 h-4"></div>
      </div>

      {/* Reset Button */}
      <div
        className="flex-1 p-1 bg-[#211E1E] text-gray-400 flex items-center justify-center cursor-pointer"
        onClick={resetAll}
      >
        <FaRedo size={14} />
      </div>

      {/* Timer Display */}
      <div className="flex-[3] p-1 bg-[#211E1E] text-gray-400 flex items-center justify-center rounded-r-full">
        <span className="text-lg">{formatTime(currentTime)}</span>
      </div>
    </div>
  );
}

export default PlayItems;
