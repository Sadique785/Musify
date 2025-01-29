const LibraryShimmer = () => {
    return (
      <div className="p-2">
        <div className="flex items-center justify-between py-4 rounded-lg">
          {/* Left - Image shimmer */}
          <div className="relative w-16 h-12 mr-4">
            <div className="absolute right-0 w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
  
          {/* Middle - Content shimmer */}
          <div className="flex-1">
            <div className="h-5 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
  
          {/* Right - Action shimmer */}
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  };
  
  export default LibraryShimmer;