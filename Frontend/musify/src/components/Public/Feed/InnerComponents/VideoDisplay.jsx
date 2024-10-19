import React from 'react';

const VideoDisplay = ({ videoUrl }) => {
  return (
    <video controls className='w-full h-full'>
      <source src={videoUrl} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
};

export default VideoDisplay;
