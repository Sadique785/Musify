const NotificationShimmer = () => {
    return (
      <div className="p-4 border border-gray-200 rounded-lg animate-pulse">
        <div className="h-6 w-24 bg-gray-200 rounded mb-3"></div>
        <div className="h-4 w-32 bg-gray-200 rounded mb-3"></div>
        <div className="h-6 w-11 bg-gray-200 rounded-full"></div>
      </div>
    );
  };
  
  export default NotificationShimmer;