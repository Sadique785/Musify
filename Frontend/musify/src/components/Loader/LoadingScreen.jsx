import React from 'react';

function LoadingScreen() {
  return (
    <div className="flex justify-center items-center h-screen bg-black">
      {/* Simple Loading Spinner */}
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
    </div>
  );
}

export default LoadingScreen;
