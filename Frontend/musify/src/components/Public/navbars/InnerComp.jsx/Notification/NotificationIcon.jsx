// NotificationIcon.jsx
import { FaTimes, FaUser, FaHeart, FaComment, FaUserPlus } from 'react-icons/fa';
import { NOTIFICATION_TYPES } from './NotificationTypes';

const NotificationIcon = ({ type }) => {
  const iconClassName = "w-8 h-8 text-white rounded-full p-1.5 mr-3";
  const icons = {
    [NOTIFICATION_TYPES.FOLLOW_REQUEST]: <FaUserPlus className={`${iconClassName} bg-blue-500`} />,
    [NOTIFICATION_TYPES.FOLLOW_ACCEPT]: <FaUser className={`${iconClassName} bg-green-500`} />,
    [NOTIFICATION_TYPES.POST_COMMENT]: <FaComment className={`${iconClassName} bg-purple-500`} />,
    [NOTIFICATION_TYPES.POST_LIKE]: <FaHeart className={`${iconClassName} bg-red-500`} />
  };
  
  return icons[type] || <FaUser className={`${iconClassName} bg-gray-500`} />;
};

export default NotificationIcon;
