// LeftHeader.jsx
import React, { useState, useRef, useEffect } from 'react';
import { FaPlus, FaMicrophone, FaUpload } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { addTrack } from '../../../../redux/auth/Slices/audioSlice';



function LeftHeader() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();


    const handleAddTrack = (trackName) => {
      const newTrack = {
        id: Date.now(),
        name: trackName || 'New Track', 
        duration: '0:00', 
      };
      dispatch(addTrack(newTrack));
      setDropdownOpen(false); 
    };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative"> {/* Container for button and dropdown */}
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center space-x-2 bg-[#211E1E] text-white px-4 py-2 rounded-full relative z-50"
      >
        <FaPlus className="text-white" />
        <span>Add Track</span>
      </button>

      {/* Dropdown with highest z-index */}
      {dropdownOpen && (
        <div
          ref={dropdownRef}
          className="absolute left-0 mt-2 w-64 bg-[#211E1E] shadow-lg rounded-lg p-4 z-[60]"
        >
          <h3 className="px-4 py-2 font-semibold text-gray-200">New Track</h3>
          <div
            onClick={() => handleAddTrack('Voice Track')} // Call with specific name
            className="px-4 py-2 flex items-center space-x-2 cursor-pointer rounded-lg hover:bg-gray-600 hover:bg-opacity-50"
          >
            <div className="p-2 rounded-lg bg-red-200 text-red-500">
              <FaMicrophone />
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-100">Voice Record</p>
              <p className="text-gray-300 text-xs">Record yourself</p>
            </div>
          </div>
          <div
            onClick={() => handleAddTrack('Audio Track')} // Call with specific name
            className="px-4 py-2 mt-2 flex items-center space-x-2 cursor-pointer rounded-lg hover:bg-gray-600 hover:bg-opacity-50"
          >
            <div className="p-2 rounded-lg bg-green-200 text-green-500">
              <FaUpload />
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-100">Upload Audio</p>
              <p className="text-gray-300 text-xs">Add an audio file</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeftHeader;