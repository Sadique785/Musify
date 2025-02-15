import React, { useState, useRef, useEffect } from 'react';
import { Mic, MoreHorizontal, Volume2 } from 'lucide-react';
import { usePlayback } from '../../../../context/PlayBackContext';
import TrackDropdown from './TrackDropdown';
import { useDispatch } from 'react-redux';
import { removeTrack } from '../../../../redux/auth/Slices/audioSlice';
import FXComponent from './FXComponent';


const TrackItem = ({ track }) => {
  const [isFXOpen, setFXOpen] = useState(false);

  const dispatch = useDispatch();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { trackVolumes, updateTrackVolume } = usePlayback();
  const currentVolume = trackVolumes[track.id] ?? 50;

  
const openFX = () => setFXOpen(true);
const closeFX = () => setFXOpen(false);

  const handleVolumeChange = (e) => {
    const volume = parseFloat(e.target.value);
    updateTrackVolume(track.id, volume);
  };
  const handleDeleteTrack = () => {
    dispatch(removeTrack(track.id));
  };

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside the dropdown
      if (
        dropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  return (
    <div className="flex items-center group relative">
      {/* Left Mic Section */}
      <div className="relative h-24 w-5 bg-zinc-800/50 flex justify-center">
        <Mic
          size={16}
          style={{ color: track.color }}
          className="opacity-60 group-hover:opacity-100 transition-opacity mt-4 duration-200"
        />
      </div>

      {/* Main Content Section */}
      <div className="flex-1 h-24">
        {/* Upper Section */}
        <div className="h-12 bg-[#282c32] bg-opacity-50 group-hover:bg-opacity-20 transition-all duration-200 flex items-center">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <span className="text-zinc-500 text-sm font-medium ml-2 w-6">
                {track.number}
              </span>
              <span className="text-white font-medium truncate">
                {track.fileName ? track.fileName : track.name}
              </span>
            </div>
            {/* Dropdown Button */}
            <button
              onClick={toggleDropdown}
              className="mr-2 text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-200"
            >
              <MoreHorizontal size={20} />
            </button>
          </div>
        </div>

        {/* Lower Section */}
        <div className="h-12 bg-[#282c32] bg-opacity-50 group-hover:bg-opacity-20 transition-all duration-200 px-4">
          <div className="flex items-center h-full space-x-4">
          <button
              className="px-3 py-1 rounded-full bg-zinc-700/50 hover:bg-zinc-700 text-zinc-400 hover:text-white text-xs font-medium transition-all duration-200"
              onClick={openFX}
            >
              FX
            </button>

            <div className="flex items-center flex-1 space-x-2">
              <Volume2 size={16} className="text-zinc-500" />
              <input
                type="range"
                min="0"
                max="100"
                value={currentVolume}
                onChange={handleVolumeChange}
                className="flex-1 h-1 bg-zinc-700/50 rounded-full appearance-none cursor-pointer 
                  [&::-webkit-slider-thumb]:appearance-none 
                  [&::-webkit-slider-thumb]:h-4 
                  [&::-webkit-slider-thumb]:w-4 
                  [&::-webkit-slider-thumb]:bg-white 
                  [&::-webkit-slider-thumb]:rounded-full 
                  [&::-webkit-slider-thumb]:shadow-md
                  bg-zinc-700 opacity-50 group-hover:opacity-100"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Color Indicator */}
      <div
        style={{ backgroundColor: track.color }}
        className="h-24 w-1 opacity-70"
      />

      {/* Dropdown */}
      {dropdownOpen && (
        <TrackDropdown
          ref={dropdownRef}
          trackId={track.id}
          onRename={() => console.log('Rename clicked')}
          onDelete={handleDeleteTrack}
          onChangeColor={() => console.log('Change color clicked')}
        />
      )}
          
          {isFXOpen && <FXComponent track={track} onClose={closeFX} />}
    
    </div>


  );
};

export default TrackItem;
