import React, { forwardRef } from 'react';

const FormatDropdown = forwardRef(({ selectedFormat, onFormatChange, onExport }, ref) => {
  return (
    <div
    ref={ref}
    className="absolute right-[110%] top-0 bg-[#211E1E] shadow-xl rounded-lg w-56 p-4 z-[1000]"
    style={{ backgroundColor: 'rgba(33, 30, 30, 0.95)' }}
  >
      <h3 className="text-white text-sm font-semibold mb-3">Select Format</h3>
      
      <div className="space-y-3">
        {/* WAV Option */}
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name="format"
            value="wav"
            checked={selectedFormat === 'wav'}
            onChange={(e) => onFormatChange(e.target.value)}
            className="hidden"
          />
          <div className={`w-4 h-4 rounded-full border ${
            selectedFormat === 'wav' 
              ? 'border-white bg-white' 
              : 'border-gray-400'
          } mr-3`} />
          <span className="text-white text-sm">WAV</span>
        </label>

        {/* MP3 Option */}
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name="format"
            value="mp3"
            checked={selectedFormat === 'mp3'}
            onChange={(e) => onFormatChange(e.target.value)}
            className="hidden"
          />
          <div className={`w-4 h-4 rounded-full border ${
            selectedFormat === 'mp3' 
              ? 'border-white bg-white' 
              : 'border-gray-400'
          } mr-3`} />
          <span className="text-white text-sm">MP3</span>
        </label>
      </div>

      {/* Export Button */}
      <button
        onClick={onExport}
        className="w-full mt-4 bg-[#292930] hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
      >
        Export
      </button>
    </div>
  );
});

export default FormatDropdown;