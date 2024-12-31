import React from 'react';

export const UserGrowthChartShimmer = () => {
  return (
    <div className="bg-gray-800 rounded-lg p-4 h-96">
      <div className="flex flex-col h-full">
        {/* Title shimmer */}
        <div className="h-7 w-48 bg-gray-700 rounded animate-pulse mb-4" />
        
        {/* Chart area shimmer */}
        <div className="flex-grow flex">
          {/* Y-axis shimmer */}
          <div className="w-12 h-full flex flex-col justify-between pr-2">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className="h-4 w-8 bg-gray-700 rounded animate-pulse"
              />
            ))}
          </div>

          {/* Main chart area shimmer */}
          <div className="flex-grow flex flex-col">
            {/* Chart content shimmer */}
            <div className="flex-grow relative">
              <div className="absolute inset-0 bg-gradient-to-b from-gray-700/50 to-gray-700/20 animate-pulse rounded" />
              
              {/* Horizontal grid lines */}
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute w-full h-px bg-gray-700/30"
                  style={{ top: `${(i + 1) * 20}%` }}
                />
              ))}
            </div>

            {/* X-axis shimmer */}
            <div className="h-8 mt-2 flex justify-between">
              {[...Array(6)].map((_, i) => (
                <div 
                  key={i} 
                  className="h-4 w-12 bg-gray-700 rounded animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ContentDistributionChartShimmer = () => {
  return (
    <div className="bg-gray-800 rounded-lg p-10 h-96">
      {/* Title shimmer */}
      <div className="h-7 w-48 bg-gray-700 rounded animate-pulse mb-4" />
      
      <div className="flex h-[calc(100%-2rem)] items-center justify-center">
        {/* Circular shimmer for pie chart */}
        <div className="relative">
          {/* Main circle shimmer */}
          <div className="w-40 h-40 rounded-full bg-gray-700 animate-pulse" />
          
          {/* Legend items shimmer */}
          <div className="absolute -right-32 top-1/2 -translate-y-1/2 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-gray-700 animate-pulse" />
                <div className="w-20 h-4 bg-gray-700 rounded animate-pulse" />
              </div>
            ))}
          </div>
          
          {/* Simulated pie sections with overlays */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-gray-700/30 to-gray-700/60 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const UserEngagementChartShimmer = () => {
    return (
      <div className="bg-gray-800 rounded-lg p-6 h-96">
        {/* Title shimmer */}
        <div className="h-7 w-56 bg-gray-700 rounded animate-pulse mb-4" />
        
        <div className="h-[75%]">
          <div className="flex h-full">
            {/* Y-axis shimmer */}
            <div className="w-12 h-full flex flex-col justify-between pr-2">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i} 
                  className="h-4 w-8 bg-gray-700 rounded animate-pulse"
                />
              ))}
            </div>
  
            {/* Bars area */}
            <div className="flex-grow flex items-end justify-around pb-8 relative">
              {/* Grid lines */}
              {[...Array(4)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute w-full h-px bg-gray-700/30"
                  style={{ bottom: `${(i + 1) * 20}%` }}
                />
              ))}
              
              {/* Bar shimmers */}
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2 w-16">
                  <div 
                    className="w-12 bg-gray-700 animate-pulse rounded-t pointer-events-none"
                    style={{ height: `${Math.random() * 60 + 20}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
  
          {/* Legend shimmer */}
          <div className="flex justify-center gap-4 mt-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-700 animate-pulse" />
                <div className="w-24 h-4 bg-gray-700 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };