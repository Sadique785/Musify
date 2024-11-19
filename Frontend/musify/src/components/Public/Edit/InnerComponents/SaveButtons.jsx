import React from 'react';
import { FiSave } from 'react-icons/fi';      // Save icon
import { IoMdCloudUpload } from 'react-icons/io'; // Publish icon

function SaveButtons() {
  return (
    <div className="flex gap-4">
      {/* Save Button */}
      <button className="flex items-center gap-1 bg-[#292930] text-white px-4 py-2 rounded-full hover:bg-gray-600 transition">
        <FiSave size={16} /> {/* Save Icon */}
        <span className='text-sm font-semibold' >Save</span>
      </button>

      {/* Publish Button */}
      <button className="flex items-center gap-1 bg-[#3a3939] text-white px-4 py-2 rounded-full hover:bg-gray-700 transition">
        <IoMdCloudUpload size={16} /> {/* Publish Icon */}
        <span className='text-sm font-semibold' >Publish</span>
      </button>
    </div>
  );
}

export default SaveButtons;
 