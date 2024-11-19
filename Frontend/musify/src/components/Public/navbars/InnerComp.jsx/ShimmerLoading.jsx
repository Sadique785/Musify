import React from "react";

function ShimmerLoading() {
  return (
    <div className="animate-pulse">
      {/* Repeat shimmer blocks for three user cards */}
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className="p-2 flex items-center space-x-4 border-b border-gray-200"
        >
          {/* Shimmer for User Avatar */}
          <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
          {/* Shimmer for Username */}
          <div className="flex-1">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ShimmerLoading;
