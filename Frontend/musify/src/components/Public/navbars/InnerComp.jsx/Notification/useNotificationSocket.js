import { useState, useEffect } from 'react';
import { useNotifications } from './NotificationManager';
import { getConfig } from '../../../../../config';


const useNotificationSocket = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const { addNotification } = useNotifications();
  const { connectionUrl } = getConfig();
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'wss:';
  const wsUrl = `${wsProtocol}//${connectionUrl}/ws/notifications/${userId}/`;



  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const newSocket = new WebSocket(wsUrl);
    
    newSocket.onopen = () => console.log('Notification connection established');
    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);

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
      setIsLoading(false);
    };
    newSocket.onclose = () => {
      setIsLoading(false);
    };

    setSocket(newSocket);
    return () => newSocket.close();
  }, [userId, addNotification]);

  return { notifications, isLoading };
};

export default useNotificationSocket;