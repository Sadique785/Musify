import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Heart, MessageSquare, UserPlus, Check } from 'lucide-react';
import { NOTIFICATION_TYPES } from './NotificationTypes';

const NotificationContext = createContext();
const NOTIFICATION_DURATION = 4000; 

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { ...notification, id }]);

    setTimeout(() => {
      removeNotification(id);
    }, NOTIFICATION_DURATION);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ addNotification, removeNotification }}>
      {children}
      <NotificationPopups notifications={notifications} onRemove={removeNotification} />
    </NotificationContext.Provider>
  );
};

const NotificationPopup = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, NOTIFICATION_DURATION - 300);

    return () => clearTimeout(timer);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.FOLLOW_REQUEST:
      case NOTIFICATION_TYPES.FOLLOW_ACCEPT:
        return <UserPlus className="h-6 w-6 text-blue-600" />;
      case NOTIFICATION_TYPES.POST_LIKE:
        return <Heart className="h-6 w-6 text-red-600" />;
      case NOTIFICATION_TYPES.POST_COMMENT:
        return <MessageSquare className="h-6 w-6 text-green-600" />;
      default:
        return <Bell className="h-6 w-6 text-blue-600" />;
    }
  };

  const getMessage = () => {
    const { sender_username, notification_type } = notification;
    const messages = {
      [NOTIFICATION_TYPES.FOLLOW_REQUEST]: `${sender_username} started following you`,
      [NOTIFICATION_TYPES.FOLLOW_ACCEPT]: `${sender_username} followed you back`,
      [NOTIFICATION_TYPES.POST_COMMENT]: `${sender_username} commented on your post`,
      [NOTIFICATION_TYPES.POST_LIKE]: `${sender_username} liked your post`
    };
    return messages[notification_type] || 'New notification';
  };

  const getBgColor = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.FOLLOW_REQUEST:
      case NOTIFICATION_TYPES.FOLLOW_ACCEPT:
        return 'bg-blue-50';
      case NOTIFICATION_TYPES.POST_LIKE:
        return 'bg-red-50';
      case NOTIFICATION_TYPES.POST_COMMENT:
        return 'bg-green-50';
      default:
        return 'bg-gray-50';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="w-[380px] bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100"
        >
          <div className="px-5 py-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className={`h-12 w-12 rounded-full ${getBgColor(notification.notification_type)} flex items-center justify-center`}>
                  {getIcon(notification.notification_type)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 leading-5">
                  {getMessage()}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Just now
                </p>
              </div>
              <button
                onClick={() => {
                  setIsVisible(false);
                  onClose();
                }}
                className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Check className="h-5 w-5" />
              </button>
            </div>
          </div>
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: NOTIFICATION_DURATION / 1000 }}
            className="h-1 bg-blue-600"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const NotificationPopups = ({ notifications, onRemove }) => {
  return (
    <div className="fixed right-4 top-4 z-50 space-y-3">
      {notifications.map((notification) => (
        <NotificationPopup
          key={notification.id}
          notification={notification}
          onClose={() => onRemove(notification.id)}
        />
      ))}
    </div>
  );
};

export default NotificationProvider;