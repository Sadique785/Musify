import { useState, useEffect } from 'react';
import { useNotifications } from './NotificationManager';

const useNotificationSocket = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const newSocket = new WebSocket(`ws://localhost:8003/ws/notifications/${userId}/`);
    
    newSocket.onopen = () => console.log('WebSocket connection established');
    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('notification_data', data);

      // Handle existing notifications
      if (data.type === 'existing_notification') {
        setNotifications((prev) => {
          // Only add if not already in the list
          const isNotificationExists = prev.some(
            (notif) => notif.id === data.notification.id
          );
          return isNotificationExists 
            ? prev 
            : [...prev, data.notification];
        });
      }

      // Handle new notifications
      if (data.type === 'new_notification') {
        addNotification(data.notification);
        setNotifications((prev) => {
          // Only add if not already in the list
          const isNotificationExists = prev.some(
            (notif) => notif.id === data.notification.id
          );
          return isNotificationExists 
            ? prev 
            : [data.notification, ...prev];
        });
      }
    };

    newSocket.onerror = (error) => {
      console.error('WebSocket Error:', error);
      setIsLoading(false);
    };
    newSocket.onclose = () => {
      console.log('WebSocket connection closed');
      setIsLoading(false);
    };

    setSocket(newSocket);
    return () => newSocket.close();
  }, [userId, addNotification]);

  return { notifications, isLoading };
};

export default useNotificationSocket;