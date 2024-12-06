// NotificationComponent.jsx
import { useNavigate } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import NotificationItem from './NotificationItem';
import useNotificationSocket from './useNotificationSocket';
import { useState } from 'react';

const NotificationComponent = ({ userId, isOpen, onClose }) => {
  const navigate = useNavigate();
  const { notifications, isLoading } = useNotificationSocket(userId);



  const handleFollowBack = (senderUsername) => {;
    console.log(`Follow back triggered for ${senderUsername}`);
    // Implement follow back logic here
  };



  const handleNavigateToProfile = (username) => {
    navigate(`/profile/${username}`);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500"></div>
        </div>
      );
    }

    if (notifications.length === 0) {
      return (
        <div className="flex justify-center items-center h-full text-gray-500">
          <p>No new notifications</p>
        </div>
      );
    }

    return (
      <div className="divide-y divide-gray-200">
        {notifications.map(notification => (
          <div key={notification?.id} className="p-4 hover:bg-gray-50 transition flex">
            <NotificationItem 
              notification={notification}
              onFollowBack={handleFollowBack}
              onNavigateToProfile={handleNavigateToProfile}
              onCloseNotifications={onClose}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`
      fixed top-0 right-0 h-full w-1/4 bg-white shadow-lg 
      transform transition-transform duration-300 ease-in-out 
      ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      z-[100] overflow-y-auto
    `}>
      <div className="flex justify-between items-center p-5 border-b">
        <h2 className="text-xl font-bold">Notifications</h2>
        <button 
          onClick={onClose} 
          className="text-gray-600 hover:text-gray-900 transition"
        >
          <FaTimes className="text-xl" />
        </button>
      </div>
      {renderContent()}
    </div>
  );
};

export default NotificationComponent;
