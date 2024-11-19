import React, { useState } from 'react';
import { FaVolumeUp } from 'react-icons/fa';
import Slider from 'react-slider';

function GainController() {
  const [gain, setGain] = useState(0); // Initial gain value in dB

  // Handle slider change
  const handleChange = (value) => {
    setGain(value);
  };

  // Reset gain to 0 on double-tap
  const handleDoubleClick = () => {
    setGain(0);
  };

  // Format gain as a positive or negative dB value
  const formattedGain = gain >= 0 ? `+${gain.toFixed(2)} dB` : `${gain.toFixed(2)} dB`;

  return (
    <div className="flex ml-20 mt-4 items-center space-x-6">
      {/* Left div with slider */}
      <div className="flex items-center space-x-2" onDoubleClick={handleDoubleClick}>
        {/* Sound Icon */}
        <FaVolumeUp size={20} className="text-gray-400" />

        {/* Container for the slider and lines */}
        <div className="relative flex-1 h-1 w-[100px] bg-gray-300">
          {/* Horizontal line for the slider */}
          <Slider
            className="absolute top-3 transform -translate-y-1/2 w-full"
            min={-100}
            max={100}
            value={gain}
            onChange={handleChange}
            renderTrack={(props, state) => (
              <div {...props} className="h-1 top-2 bg-gray-300 rounded-full" />
            )}
            renderThumb={(props, state) => (
              <div
                {...props}
                className="w-6 h-6 bg-gray-600 rounded-full" // Increase size of the knob
                style={{
                  marginTop: '-10px',
                  // Adjusting transform to move the knob based on slider value
                  transform: `translateX(${(gain + 100) * (100 / 50)}%)`, // This moves the knob correctly
                }}
              />
            )}
          />
        </div>
      </div>

      {/* Right div with the gain value text */}
      <div className="ml-5 mb-1 text-gray-400" style={{ minWidth: '100px' }}>
        {formattedGain}
      </div>
    </div>
  );
}

export default GainController;
