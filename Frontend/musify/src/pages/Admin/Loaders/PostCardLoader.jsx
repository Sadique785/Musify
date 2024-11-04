import React from 'react';

function PostCardLoader() {
  return (
    <div className="border rounded-lg p-4 mb-4 animate-pulse">
      <div className="flex items-center mb-2">
        <div className="w-8 h-8 bg-gray-300 rounded-full mr-2"></div>
        <div>
          <div className="bg-gray-300 h-4 w-24 rounded mb-1"></div>
          <div className="bg-gray-300 h-3 w-16 rounded"></div>
        </div>
      </div>

      <div className="relative mb-2 bg-gray-300 rounded-lg h-[400px]"></div>

      <div className="bg-gray-300 h-4 w-2/3 rounded mb-2"></div>

      <div className="flex justify-between items-center mt-2">
        <div className="flex items-center">
          <div className="w-6 h-6 bg-gray-300 rounded-full mr-2"></div>
          <div className="bg-gray-300 h-4 w-12 rounded"></div>
        </div>
        <div className="flex space-x-4">
          <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
          <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
        </div>
      </div>

      <div className="bg-gray-300 h-4 w-32 rounded mt-2"></div>
    </div>
  );
}

export default PostCardLoader;
