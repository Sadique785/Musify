import React from 'react';

const AudioDisplay = ({ audioUrl }) => {
  return (
    <audio controls className='w-full'>
      <source src={audioUrl} type="audio/mpeg" />
      Your browser does not support the audio tag.
    </audio>
  );
};

export default AudioDisplay;
