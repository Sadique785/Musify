import React from 'react';
import { FaBackward, FaForward } from 'react-icons/fa';

function MemoryButtons() {
  return (
    <div className="flex gap-[2px]">
      {/* Back Button */}
      <button className="bg-[#211E1E] text-gray-400 px-3 py-2 rounded-l-full hover:bg-gray-700 transition">
        <FaBackward size={16} />
      </button>
      
      {/* Forward Button */}
      <button className="bg-[#211E1E] text-gray-400 px-3 py-2 rounded-r-full hover:bg-gray-700 transition">
        <FaForward size={16} />
      </button>
    </div>
  );
}

export default MemoryButtons;
