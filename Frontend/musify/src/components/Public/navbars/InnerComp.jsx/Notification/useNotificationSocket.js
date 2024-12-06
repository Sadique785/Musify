// useNotificationSocket.js
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
      setNotifications((prev) => [ ...prev, data.notification]);
      
      // Show popup for new notification
      if (data.type == 'new_notification'){
        addNotification(data.notification);
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