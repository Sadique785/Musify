import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useLocation  } from 'react-router-dom';
import ChatLeft from '../../components/Public/Chat/ChatLeft';
import ChatRight from '../../components/Public/Chat/ChatRight';
import { 
  setWebSocketConnected,
  updateRoomOrder,
  setInitialChatRooms,
  setCurrentOpenChatRoom,
  incrementUnreadCount,
  updateSingleRoom
} from '../../redux/auth/Slices/chatSlice';

function ChatPage() {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const location = useLocation();
  const { chatRooms, isWebSocketConnected } = useSelector((state) => state.chat);
  const [selectedUser, setSelectedUser] = useState(null);
  const currentUserId = useSelector((state) => state.auth.user.id);
  const chatRoomsWsRef = useRef(null);
  const privateMessageWsRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  

  // Connect to chat rooms WebSocket
  const connectChatRoomsWebSocket = () => {
    if (chatRoomsWsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(`ws://localhost:8003/ws/chat-rooms/${currentUserId}/`);
    
    ws.onopen = () => {
      console.log('Chat rooms WebSocket connected');
      dispatch(setWebSocketConnected(true));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('WebSocket data:', data);
      
      switch (data.type) {
        case 'initial_chat_rooms':
          dispatch(setInitialChatRooms(data.chat_rooms));
          break;
        case 'room_update':
        case 'new_room':
          dispatch(updateSingleRoom(data.room));
          break;
        case 'room_order_update':
          dispatch(updateRoomOrder(data));
          console.log('data before increment', data)
          dispatch(incrementUnreadCount(data));
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
    connectChatRoomsWebSocket();

    return () => {
      if (chatRoomsWsRef.current) chatRoomsWsRef.current.close();
      if (privateMessageWsRef.current) privateMessageWsRef.current.close();
    };
  }, []);

  // Handle user selection from URL params and state
  useEffect(() => {
    console.log('ChatPage - URL params changed', { userId, locationState: location.state });
    
    if (userId && location.state?.user) {
      const userFromState = location.state.user;
      console.log('ChatPage - Setting user from state:', userFromState);

      const currentChatRoom = chatRooms.find(room => 
        room.participants.some(p => p.id === parseInt(userId))
      );
      dispatch(setCurrentOpenChatRoom(currentChatRoom ? currentChatRoom.id : null));

      setSelectedUser(userFromState);
      connectPrivateMessageWebSocket(userId);
    }
  }, [userId, location.state, chatRooms, dispatch]);

  return (
    <div className="min-h-[calc(60vh-80px)] w-full bg-blue-50">
      <div className="max-w-[1920px] mx-auto px-4 py-2">
        <div className="bg-white rounded-lg shadow-md feed-container overflow-hidden">
          <div className="flex h-[calc(100vh-120px)]">
            <div className="w-1/4 border-r border-gray-200">
              <ChatLeft 
                chatRooms={chatRooms}
                selectedUser={selectedUser}
                currentUserId={currentUserId}
                backendUrl={backendUrl}
              />
            </div>
            
            <div className="w-3/4">
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
        </div>
      </div>
    </div>
  )
}

export default ChatPage;