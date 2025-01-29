import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ChatUserItem from './ChatUserItem';
import { resetUnreadCountForRoom } from '../../../redux/auth/Slices/chatSlice';

function ChatLeft({ 
  chatRooms, 
  selectedUser, 
  currentUserId, 
  backendUrl, 
  setSelectedUser, 
  userId, 
  setUserId, 
  setCurrentOpenChatRoom 
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const getOtherParticipant = (room) => {
    if (room.user1 === currentUserId) {
      return {
        id: room.user2,
        username: room.user2_name
      };
    }
    else if (room.user2 === currentUserId) {
      return {
        id: room.user1,
        username: room.user1_name
      };
    }
    return null;
  };

  const handleUserSelect = (user, chatRoom) => {
    const currentChatRoom = chatRooms.find(item => 
      item.room.id === chatRoom.room.id
    );

    dispatch(setSelectedUser({
      id: user?.id,
      username: user?.username,
      image_url: user?.image_url || null 
    }));
    dispatch(setUserId(user.id));
    dispatch(setCurrentOpenChatRoom(currentChatRoom ? currentChatRoom.room.id : null));
    setIsSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile Toggle Button - Only visible on sm screens */}
      <button  
          onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          className="md:hidden fixed top-20 left-4 z-50 transition-transform duration-300 ease-in-out" 
          style={{ 
            transform: isSidebarOpen ? 'translateX(calc(75vw - 48px))' : 'translateX(0)' 
          }} 
        >
          {isSidebarOpen ? (
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          ) : (
            <ChevronRight className="w-6 h-6 text-gray-600" />
          )}
        </button>

      {/* Sidebar Container - Different styles for mobile and desktop */}
      <div 
        className={`
          h-full 
          bg-[#f0f2f5] 
          border-r 
          border-gray-200 
          shadow-sm
          md:relative md:translate-x-0 md:w-full
          fixed md:static top-0 left-0 w-3/4 md:w-auto
          transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          z-40 md:z-auto
        `}
      >
        <div 
          className="
            py-5 
            px-6 
            border-b 
            border-gray-200 
            bg-[#4b4747]
            sticky 
            top-0 
            z-10
          "
        >
          <h2 className="text-2xl font-bold text-white">Chats</h2>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-80px)]">
          {chatRooms.map((chatRoom) => {
            const otherUser = getOtherParticipant(chatRoom.room);
            return (
              <ChatUserItem
                key={chatRoom.room.id}
                user={{
                  ...otherUser,
                  lastMessageTime: chatRoom.message?.timestamp || 'No timestamp',
                  lastMessage: chatRoom.message?.content || 'No messages yet'
                }}
                onSelect={(user) => handleUserSelect(user, chatRoom)}
                isSelected={selectedUser?.id === otherUser?.id}
                unreadCount={chatRoom.unread_count}
                backendUrl={backendUrl}
                chatRoom={chatRoom}
              />
            );
          })}
        </div>
      </div>

      {/* Mobile Overlay - Only visible on mobile when sidebar is open */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
}

export default ChatLeft;