import React, { forwardRef } from 'react';
import { useDispatch } from 'react-redux';
import { FaEdit, FaTrash, FaPalette } from 'react-icons/fa';
import { changeTrackColor } from '../../../../redux/auth/Slices/audioSlice';
import { COLORS } from '../../../../Utils/EditUtils'; // Assuming colorUtils.js is in the same directory

const TrackDropdown = forwardRef(({ trackId, onRename, onDelete, onChangeColor }, ref) => {
  const dispatch = useDispatch();

  const handleColorChange = (color) => {
    dispatch(changeTrackColor({ trackId, color }));
  };

  return (
    <div
      ref={ref}
      className="absolute right-2 top-12 bg-[#211E1E] shadow-lg rounded-lg w-56 p-4 z-50"
    >
      {/* Dropdown Options */}
      <div className="text-white text-sm space-y-2">
        {/* Rename Option */}
        <div
          className="cursor-pointer flex items-center py-2 hover:bg-gray-600 hover:bg-opacity-50 rounded-md px-2"
          onClick={onRename}
        >
          <FaEdit className="text-gray-300 mr-3" />
          <span>Rename</span>
        </div>

        {/* Delete Option */}
        <div
          className="cursor-pointer flex items-center py-2 hover:bg-gray-600 hover:bg-opacity-50 rounded-md px-2"
          onClick={onDelete}
        >
          <FaTrash className="text-gray-300 mr-3" />
          <span>Delete Track</span>
        </div>

        {/* Change Color Option */}
        <div
          className="cursor-pointer flex items-center py-2 hover:bg-gray-600 hover:bg-opacity-50 rounded-md px-2"
          onClick={onChangeColor}
        >
          <FaPalette className="text-gray-300 mr-3" />
          <span>Change Color</span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-600 my-2"></div>

      {/* Color Circles */}
      <div className="flex flex-wrap gap-2">
        {COLORS.map((color, index) => (
          <div
            key={index}
            className="w-6 h-6 rounded-full cursor-pointer border-2 border-transparent hover:border-white"
            style={{ backgroundColor: color }}
            onClick={() => handleColorChange(color)}
          />
        ))}
      </div>
    </div>
  );
});

export default TrackDropdown;
