import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';


const ChatRight = ({ selectedUser, chatMessages, currentUserId, wsRef, backendUrl }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState(chatMessages);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    setMessages(chatMessages);
  }, [chatMessages]);


  const handleProfileClick = () => {
    navigate(`/profile/${selectedUser.username}`);
  };


  const handleSendMessage = () => {
    if (newMessage.trim() && wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'message',
        message: newMessage  // Direct content, not nested object
      }));
      
      // Optimistic UI update
      setMessages(prevMessages => [
        ...prevMessages, 
        {
          id: Date.now(),
          content: newMessage,
          sender_id: currentUserId,
          timestamp: new Date().toISOString(),
          is_read: false
        }
      ]);
      
      setNewMessage('');
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col scrollbar-hidden">
      <div className="sticky top-0 z-10">
        <ChatHeader 
          selectedUser={selectedUser} 
          onProfileClick={handleProfileClick} 
          backendUrl={backendUrl}
        />
      </div>
      
      <div className="flex-grow overflow-y-auto scrollbar-hidden">
        <ChatMessages messages={messages} currentUserId={currentUserId} />
      </div>
      
      <div className="sticky bottom-0 z-10">
        <ChatInput 
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};


export default ChatRight;