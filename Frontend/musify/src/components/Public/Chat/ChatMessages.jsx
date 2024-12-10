import React from 'react';

const ChatMessages = ({ messages, currentUserId }) => (
    <div className="flex-grow overflow-y-auto px-4 py-6 space-y-4">
      {messages.map((msg) => (
        <div 
          key={msg.id} 
          className={`flex flex-col ${
            msg.sender_id === currentUserId ? 'items-end' : 'items-start'
          } w-full`}
        >
          <div 
            className={`
              max-w-[70%] 
              relative 
              ${msg.sender_id === currentUserId 
                ? 'bg-blue-500 text-white rounded-bl-2xl rounded-tl-2xl rounded-tr-2xl' 
                : 'bg-gray-200 text-gray-800 rounded-br-2xl rounded-tr-2xl rounded-tl-2xl'
              } 
              px-4 py-2 
              mb-1
            `}
          >
            {msg.content}
          </div>
          <div 
            className={`
              text-xs 
              text-gray-500
            `}
          >
            {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </div>
        </div>
      ))}
    </div>
  );

export default ChatMessages;