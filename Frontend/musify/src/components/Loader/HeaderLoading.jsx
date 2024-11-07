// HeadingLoading.js
import React from 'react';

function HeadingLoading({ progress }) {
  return (
    <div className="loading-container">
      <div 
        className="heading-loading-bar" 
        style={{ width: `${progress}%`, transition: 'width 0.2s ease' }} 
      />
     
    </div>
  );
}

export default HeadingLoading;
