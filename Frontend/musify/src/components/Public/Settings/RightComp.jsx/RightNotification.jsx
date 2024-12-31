import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../../axios/authInterceptor';
import NotificationShimmer from './ShimmerComps/NotificationShimmer';
import toast from 'react-hot-toast';

const RightNotification = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotificationStatus = async () => {
      try {
        const response = await axiosInstance.get("/friends/notification-status/");
        setIsEnabled(response.data.enabled);
      } catch (error) {
        console.error("Error fetching notification status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotificationStatus();
  }, []);

  const handleToggle = async () => {
    const previousState = isEnabled;
    setIsEnabled(!isEnabled); // Optimistic update


    try {
      const response = await axiosInstance.post("/friends/notification-status/", {});
      if (isEnabled){
        toast.success('Turned off Notificaion successfully')
      }else{
        toast.success('Turned on Notificaion successfully')

      }
      setIsEnabled(response.data.enabled);
    } catch (error) {
      setIsEnabled(previousState); // Revert on error
      console.error("Error toggling notification:", error);
    }
  };

  if (isLoading) {
    return <NotificationShimmer />;
  }

  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <h2 className="font-bold text-lg">General</h2>
      <p className="text-gray-600 mt-2">Turn notification</p>
      
      <button
        onClick={handleToggle}
        className="relative inline-flex items-center mt-3 h-6 w-11 rounded-full transition-colors duration-200 ease-in-out"
        style={{
          backgroundColor: isEnabled ? '#1e40af' : 'white',
          border: '2px solid #e5e7eb'
        }}
      >
        <span
          className={`inline-block w-4 h-4 transform rounded-full bg-white shadow transition-transform duration-200 ease-in-out
            ${isEnabled ? 'translate-x-6 bg-white' : 'translate-x-1'}`}
          style={{
            backgroundColor: isEnabled ? 'white' : '#9ca3af'
          }}
        />
      </button>
    </div>
  );
};

export default RightNotification;