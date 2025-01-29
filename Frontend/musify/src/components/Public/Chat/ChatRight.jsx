import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';


const ChatRight = ({ selectedUser, chatMessages, currentUserId,username, wsRef, backendUrl,userId, setUserId, connectionUrl, wsProtocol }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState(chatMessages);
  const [newMessage, setNewMessage] = useState('');
  const senderId = currentUserId
  const receiverId = userId
  const receiverName = selectedUser.username
  const [chatLoading, setChatLoading] = useState(true)

  const room_array = [senderId, receiverId];
  room_array.sort((a,b) => a-b);

  const roomName = `chat_${room_array[0]}-${room_array[1]}`
  // console.log(roomName)

  useEffect(() => {
    setMessages([]);
    setChatLoading(true)
  }, [selectedUser])

  useEffect(() => {
    setMessages(chatMessages);
  }, [chatMessages]);



  const connectPrivateMessageWebSocket = async (otherUserId) => {
    setChatLoading(true);

    
    // First, close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setMessages([]);
      // Wait for the connection to fully close
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (userId) {
      const wsPrivateChatUrl = `${wsProtocol}//${connectionUrl}/ws/chat/${roomName}/`;
      const ws = new WebSocket(wsPrivateChatUrl);

      ws.onopen = () => {
        console.log('Private message WebSocket connected for user:', otherUserId);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        // console.log('message', data)
        setMessages((prev) => [...prev, data]);
        setChatLoading(false);

        
      };

      ws.onclose = () => {
        // console.log('Private message WebSocket disconnected');
        setMessages([]);
        setChatLoading(true);
      };

      ws.onerror = (error) => {
        // console.error('Private message WebSocket error:', error);
        ws.close();
      };

      wsRef.current = ws;
    }
  };



  useEffect(() => {
    // console.log('Entered the Useeffect')
    connectPrivateMessageWebSocket(userId);



    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        setMessages([]);
      }
    };
  }, [userId, currentUserId]);


  const handleProfileClick = () => {
    navigate(`/profile/${selectedUser.username}`);
    
  };


  const handleSendMessage = () => {
    if (newMessage.trim() && wsRef.current) {
      const message=newMessage
      const payload = {
        message: newMessage,
        senderName: username,
        senderId: senderId,
        receiverId: receiverId,
        recieverName: receiverName,
      };
    wsRef.current.send(JSON.stringify(payload));
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
        <ChatMessages messages={messages} currentUserId={currentUserId} chatLoading={chatLoading} />
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