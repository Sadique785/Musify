// MusicComponents.js
import React from 'react';
import { useSelector } from 'react-redux';
import { selectTracks } from '../../../../redux/auth/Slices/audioSlice';

function MusicComponents() {
  const tracks = useSelector(selectTracks);
  console.log('here are the tracks from musiccomponents', tracks);

  return (
    <div className="space-y-1">
      {tracks.map((track) => (
        <div key={track.id} className="flex items-center">
          {/* Main Track Content */}
          <div 
            className="bg-[#282c32] bg-opacity-50  hover:bg-opacity-20 transition-all duration-200 p-4 h-24 flex-1" 
          >
            <p className="text-white">{track.name}</p>
          </div>
          {/* Color Indicator */}
          <div 
          style={{ backgroundColor: track.color}}
            className={` bg-opacity-70 h-24 w-1`}  // Match the track's color and height
          />
        </div>
      ))}
    </div>
  );
}

export default MusicComponents;
