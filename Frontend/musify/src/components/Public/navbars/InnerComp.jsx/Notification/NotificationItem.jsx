// NotificationItem.jsx
import { useState } from 'react';
import axiosInstance from '../../../../../axios/authInterceptor';
import toast from 'react-hot-toast';
import NotificationIcon from './NotificationIcon';
import { NOTIFICATION_TYPES } from './NotificationTypes';
import StandalonePostDetail from '../../../Feed/InnerComponents/StandalonePostDetail';
import { usePostModal } from '../../../../../context/PostModalContext';

const NotificationItem = ({ notification, onNavigateToProfile, onCloseNotifications }) => {
  const { sender_username: senderUsername, notification_type: type, post_id: postId, sender_id: userId } = notification;
  const [followStatus, setFollowStatus] = useState('follow back');

  const { openPostModal } = usePostModal();
  
  const handleFollowBack = async () => {
    try {
      const response = await axiosInstance.post(`/friends/accept/${userId}/`, {});
      
      if (response && (response.status === 200 || response.status === 201)) {
        setFollowStatus('following');
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error accepting follow request');
    }
  };

  const handleViewPost = (postId) => {
    openPostModal(postId);
    onCloseNotifications();
  };


  const renderActionButton = () => {
    switch(type) {
      case NOTIFICATION_TYPES.FOLLOW_REQUEST:
        return followStatus === 'follow back' ? (
          <button 
            onClick={handleFollowBack}
            className="bg-gray-700 text-white px-2 py-2 rounded text-sm hover:bg-gray-900 w-24 flex-shrink-0 ml-3"
          >
            Follow Back
          </button>
        ) : (
          <button 
            className="bg-gray-500 text-white px-2 py-2 rounded text-sm w-24 flex-shrink-0 ml-3 cursor-not-allowed"
          >
            Following
          </button>
        );
      case NOTIFICATION_TYPES.POST_COMMENT:
      case NOTIFICATION_TYPES.POST_LIKE:
        return (
          <button 
            onClick={() => handleViewPost(postId)}
            className="bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-900 w-24 flex-shrink-0 ml-3"
          >
            View
          </button>
        );
      default:
        return null;
    }
  };

  const getMessage = () => {
    const messages = {
      [NOTIFICATION_TYPES.FOLLOW_REQUEST]: 'started following you',
      [NOTIFICATION_TYPES.FOLLOW_ACCEPT]: 'followed you back',
      [NOTIFICATION_TYPES.POST_COMMENT]: 'commented on your post',
      [NOTIFICATION_TYPES.POST_LIKE]: 'liked your post'
    };
    return messages[type];
  };

  return (
    <>
      <div className="flex items-start justify-between w-full">
        <div className="flex items-start">
          <NotificationIcon type={type} />
          <div className="flex-grow">
            <span className="text-gray-600 text-sm block break-words">
              <span 
                onClick={() => onNavigateToProfile(senderUsername)} 
                className="font-semibold cursor-pointer hover:underline mr-1"
              >
                {senderUsername}
              </span>
              {getMessage()}
            </span>
          </div>
        </div>
        {renderActionButton()}
      </div>


    </>
  );
};

export default NotificationItem;