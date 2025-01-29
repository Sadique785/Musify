import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useLocation, useNavigate  } from 'react-router-dom';
import ChatLeft from '../../components/Public/Chat/ChatLeft';
import ChatRight from '../../components/Public/Chat/ChatRight';
import { useBeforeUnload } from 'react-router-dom';
import { 
  setWebSocketConnected,
  updateRoomOrder,
  setInitialChatRooms,
  setCurrentOpenChatRoom,
  incrementUnreadCount,
  updateSingleRoom,
  cleanupProcessedMessages,
  setSelectedUser,
  setUserId,
  updateChatRooms,
} from '../../redux/auth/Slices/chatSlice';

import { getBackendUrl } from '../../services/config';
import { getConfig } from '../../config';


function ChatPage() {
  const dispatch = useDispatch();
  // const { userId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  // const { userId, selectedUser } = useSelector(state => state.chat);
  const { userId, selectedUser } = useSelector(state => {

    return state.chat;
  });
  const { chatRooms, isWebSocketConnected } = useSelector((state) => state.chat);
  const currentUserId = useSelector((state) => state.auth.user.id);
  const username = useSelector((state) => state.auth.user.username);
  const chatRoomsWsRef = useRef(null);
  const privateMessageWsRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const backendUrl = getBackendUrl();
  const { connectionUrl } = getConfig();
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'wss:';
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newChat, setNewChat] = useState(false);




  const connectChatRoomsWebSocket = () => {
    if (chatRoomsWsRef.current?.readyState === WebSocket.OPEN) return;
    const wsChatRoomUrl = `${wsProtocol}//${connectionUrl}/ws/chat-list/${currentUserId}/`;


    const ws = new WebSocket(wsChatRoomUrl);

    
    ws.onopen = () => {
      console.log('Chat rooms WebSocket connected');
      dispatch(setWebSocketConnected(true));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('WebSocket data:', data);

      dispatch(updateChatRooms(data));
    
    };

    ws.onclose = () => {
      console.log('Chat rooms WebSocket disconnected');
      dispatch(setWebSocketConnected(false));
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      ws.close();
    };

    chatRoomsWsRef.current = ws;
  };


  useEffect(() => {
    console.log('ChatPage - Initial setup');
      connectChatRoomsWebSocket();


    
    return () => {
      if (chatRoomsWsRef.current) chatRoomsWsRef.current.close();
      if (privateMessageWsRef.current) privateMessageWsRef.current.close();
    };
  }, []);

  useEffect(() => {
    if (location.state?.user) {
      const newChatUser = location.state.user;
      setNewChat(true);
      
      // Wrap these dispatches in a setTimeout to ensure they run after any pathname changes
      setTimeout(() => {
        dispatch(setSelectedUser({
          id: newChatUser.id,
          username: newChatUser.username,
          image_url: newChatUser.profile_image  
        }));
        dispatch(setUserId(newChatUser.id));
      }, 0);
    }
  }, [location.state, dispatch]);


  useEffect(() => {
    // Only reset if we're not coming from a new chat state
    if (!location.state?.user) {
      dispatch(setUserId(null));
      dispatch(setSelectedUser(null));
    }
  }, [location.pathname]);

  // Optional: Handle page refresh
  useBeforeUnload(() => {
    dispatch(setUserId(null));
    dispatch(setSelectedUser(null));
    navigate(location.pathname, { replace: true, state: {} });
    setNewChat(false)

    
  });


  return (
    <div className="min-h-[calc(60vh-80px)] w-full bg-blue-50">
      <div className="max-w-[1920px] mx-auto px-4 py-2">
        <div className="bg-white rounded-lg shadow-md feed-container overflow-hidden">
          <div className="flex h-[calc(100vh-120px)] ">
            <div className="md:w-2/5 lg:w-1/4 w-0 border-r border-gray-200">
              <ChatLeft 
                chatRooms={chatRooms}
                selectedUser={selectedUser}
                currentUserId={currentUserId}
                backendUrl={backendUrl}
                setSelectedUser={setSelectedUser}
                userId={userId}
                setUserId={setUserId}
                setCurrentOpenChatRoom={setCurrentOpenChatRoom}

              />
            </div>
            
            <div className="md:w-3/4 w-full">
              {selectedUser ? (
                <ChatRight 
                  connectionUrl={connectionUrl}
                  wsProtocol={wsProtocol}
                  username={username}
                  selectedUser={selectedUser} 
                  isWebSocketConnected={isWebSocketConnected}
                  wsRef={privateMessageWsRef}
                  currentUserId={currentUserId}
                  chatMessages={messages}
                  backendUrl={backendUrl}
                  userId={userId}
                  setUserId={setUserId}
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