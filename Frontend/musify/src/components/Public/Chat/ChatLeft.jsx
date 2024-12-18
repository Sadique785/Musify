import React from 'react';
import { useNavigate } from 'react-router-dom';
import ChatUserItem from './ChatUserItem';
import { useDispatch } from 'react-redux';
import { resetUnreadCountForRoom } from '../../../redux/auth/Slices/chatSlice';

function ChatLeft({ chatRooms, selectedUser, currentUserId, backendUrl }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const getOtherParticipant = (participants) => {
    return participants.find(participant => participant.id !== currentUserId);
  };

  const handleUserSelect = (user, chatRoom) => {
    dispatch(resetUnreadCountForRoom(chatRoom.id));

    navigate(`/chat/${user.id}`, {
      state: {
        user: {
          id: user.id,
          username: user.username,
          image_url: user.image_url
        }
      },
      replace: true
    });
  };

  return (
    <div 
      className="
        h-full 
        bg-[#f0f2f5] 
        border-r 
        border-gray-200 
        shadow-sm
      "
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
          const otherUser = getOtherParticipant(chatRoom.participants);
          return (
            <ChatUserItem
              key={chatRoom.id}
              user={{
                ...otherUser,
                lastMessageTime: chatRoom.last_message?.timestamp || 'No timestamp',
                lastMessage: chatRoom.last_message?.content || 'No messages yet'
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
  );
}

export default ChatLeft;
