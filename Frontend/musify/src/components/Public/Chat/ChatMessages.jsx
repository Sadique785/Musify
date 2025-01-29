import React, {useRef, useEffect} from 'react';
import ChatShimmer from './ChatShimmer';


const ChatMessages = ({ messages, currentUserId, chatLoading }) => {
  // console.log('messages', messages);
const messagesEndRef = useRef(null);

useEffect(() => {
  scrollToBottom();
}, [messages]);

const scrollToBottom = () => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
};

  
return (
  <div className="flex-grow overflow-y-auto px-4 py-6 space-y-4">
  {chatLoading ? (
    <ChatShimmer/>
  ) : (
    messages.map((msg) => (
      <div 
        key={msg.id} 
        className={`flex flex-col ${
          msg.user_id === currentUserId ? 'items-end' : 'items-start'
        } w-full`}
      >
        <div 
          className={`
            max-w-[70%] 
            relative 
            ${msg.user_id !== currentUserId 
              ? 'bg-blue-500 text-white rounded-tr-2xl rounded-tl-2xl rounded-br-2xl' 
              : 'bg-gray-200 text-gray-800 rounded-tr-2xl rounded-tl-2xl rounded-bl-2xl'
            } 
            px-4 py-2 
            mb-1
          `}
        >
          {msg.message}
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
    ))
  )}
</div>
)
};

export default ChatMessages;