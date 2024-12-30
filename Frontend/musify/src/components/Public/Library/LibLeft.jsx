import React from 'react';
import { FaFolder } from 'react-icons/fa'; // Using folder icon for projects

function LibLeft() {
  const buttonClass = "flex items-center space-x-3 p-2 mb-2 rounded-lg transition";

  return (
    <div className='ml-[90px] fixed left-0'>
      <button
        className={`${buttonClass} bg-gray-200 w-56 font-semibold`} // Always selected state
      >
        <div className="bg-gray-300 p-2 rounded-lg">
          <FaFolder className="text-gray-700" />
        </div>
        <span>My Projects</span>
      </button>
    </div>
  );
}

export default LibLeft;