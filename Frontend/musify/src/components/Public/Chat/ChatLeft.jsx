import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatUserItem from './ChatUserItem';


function ChatLeft({ chatRooms, selectedUser, onUserSelect, currentUserId, backendUrl }) {
  const navigate = useNavigate();

  const getOtherParticipant = (participants) => {
      return participants.find(participant => participant.id !== currentUserId);
  };

  const handleUserSelect = (user) => {
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
                  bg-white 
                  sticky 
                  top-0 
                  z-10
              "
          >
              <h2 className="text-2xl  font-bold text-gray-800">Chats</h2>
          </div>
          <div className="overflow-y-auto h-[calc(100vh-80px)]">
              {chatRooms.map((chatRoom) => {
                  const otherUser = getOtherParticipant(chatRoom.participants);
                  return (
                      <ChatUserItem
                          key={chatRoom.id}
                          user={{
                              ...otherUser,
                              lastMessageTime: chatRoom.last_message_time,
                              lastMessage: chatRoom.last_message
                          }}
                          onSelect={handleUserSelect}
                          isSelected={selectedUser?.id === otherUser?.id}
                          unreadCount={chatRoom.unread_count}
                          backendUrl={backendUrl}
                      />
                  );
              })}
          </div>
      </div>
  );
}
export default ChatLeft;
