import React, { useEffect, useState } from 'react';
import ColorThief from 'colorthief';

const ImageDisplay = ({ imageUrl }) => {
  const [bgColor, setBgColor] = useState('rgb(0, 0, 0)');

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // Ensure cross-origin is set to avoid CORS issues
    img.src = imageUrl;

    img.onload = () => {
      const colorThief = new ColorThief();
      const color = colorThief.getColor(img);
      setBgColor(`rgb(${color[0]}, ${color[1]}, ${color[2]})`);
    };
  }, [imageUrl]);

  return (
    <div
      className='relative mb-4 bg-cover bg-center overflow-hidden rounded-lg h-full' 
      style={{ backgroundColor: bgColor }}
    >
      <img
        src={imageUrl}
        alt='Post'
        className='w-full h-full object-contain' // Changed from object-cover to object-contain
      />
    </div>
  );
};

export default ImageDisplay;
