// ChatPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useLocation  } from 'react-router-dom';
import ChatLeft from '../../components/Public/Chat/ChatLeft';
import ChatRight from '../../components/Public/Chat/ChatRight';
import { 
  fetchChatRooms, 
  updateSingleRoom, 
  setWebSocketConnected 
} from '../../redux/auth/Slices/chatSlice';

function ChatPage() {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const location = useLocation();
  const { chatRooms, loading, isWebSocketConnected } = useSelector((state) => state.chat);
  const [selectedUser, setSelectedUser] = useState(null);
  const currentUserId = useSelector((state) => state.auth.user.id);
  const chatRoomsWsRef = useRef(null);
  const privateMessageWsRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;


  // Connect to chat rooms WebSocket - Keeping this as is for room updates
  const connectChatRoomsWebSocket = () => {
    if (chatRoomsWsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(`ws://localhost:8003/ws/chat-rooms/${currentUserId}/`);
    
    ws.onopen = () => {
      console.log('Chat rooms WebSocket connected');
      dispatch(setWebSocketConnected(true));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data);
      
      switch (data.type) {
        case 'room_update':
        case 'new_room':
          dispatch(updateSingleRoom(data.room));
          break;
        default:
          console.log('Unhandled message type:', data.type);
      }
    };

    ws.onclose = () => {
      console.log('Chat rooms WebSocket disconnected');
      dispatch(setWebSocketConnected(false));
      setTimeout(connectChatRoomsWebSocket, 3000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      ws.close();
    };

    chatRoomsWsRef.current = ws;
  };

  // Connect to private message WebSocket
  const connectPrivateMessageWebSocket = async (otherUserId) => {
    // First, close existing connection if any
    if (privateMessageWsRef.current) {
      privateMessageWsRef.current.close();
      privateMessageWsRef.current = null;
      // Wait for the connection to fully close
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const ws = new WebSocket(`ws://localhost:8003/ws/private-message/${currentUserId}/${otherUserId}/`);
    
    ws.onopen = () => {
      console.log('Private message WebSocket connected for user:', otherUserId);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received WebSocket message:', data);
      
      switch (data.type) {
        case 'history':
          setMessages(data.messages);
          break;
        case 'message':
          setMessages(prevMessages => [...prevMessages, data.message]);
          break;
        default:
          console.log('Unhandled message type:', data.type, 'Full data:', data);
      }
      // Handle messages in ChatRight component instead of dispatch
      // if (privateMessageWsRef.current) {
      //   privateMessageWsRef.current.latestMessage = data;
      // }
    };

    ws.onclose = () => {
      console.log('Private message WebSocket disconnected');
    };

    ws.onerror = (error) => {
      console.error('Private message WebSocket error:', error);
      ws.close();
    };

    privateMessageWsRef.current = ws;
  };

  // Initial setup effect
  useEffect(() => {
    console.log('ChatPage - Initial setup');
    if (!loading && chatRooms.length === 0) {
      dispatch(fetchChatRooms());
    }
    connectChatRoomsWebSocket();

    return () => {
      if (chatRoomsWsRef.current) chatRoomsWsRef.current.close();
      if (privateMessageWsRef.current) privateMessageWsRef.current.close();
    };
  }, [dispatch, loading]);

 // Handle user selection from URL params and state
 useEffect(() => {
  console.log('ChatPage - URL params changed', { userId, locationState: location.state });
  
  if (userId && location.state?.user) {
    const userFromState = location.state.user;
    console.log('ChatPage - Setting user from state:', userFromState);
    
    setSelectedUser(userFromState);
    connectPrivateMessageWebSocket(userId);
  }
}, [userId, location.state]);



  // Log selected user changes
  useEffect(() => {
    console.log('ChatPage - Selected user updated:', selectedUser);
  }, [selectedUser]);


  return (
    <div className='flex'>
      <div className='w-1/4 p-4 sticky top-20 h-[calc(110vh-9rem)] feed-container'>
        <ChatLeft 
          chatRooms={chatRooms}
          selectedUser={selectedUser}
          currentUserId={currentUserId}
          backendUrl={backendUrl}
        />
      </div>
      <div className='w-3/4 p-4 feed-container overflow-y-auto h-[calc(110vh-9rem)]'>
        {selectedUser ? (
          <ChatRight 
            selectedUser={selectedUser} 
            isWebSocketConnected={isWebSocketConnected}
            wsRef={privateMessageWsRef}
            currentUserId={currentUserId}
            chatMessages={messages}
            backendUrl={backendUrl}
          />
        ) : (
          <div className="flex justify-center items-center h-full text-gray-500">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatPage;