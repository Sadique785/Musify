import React from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';

const ChatInput = ({ newMessage, setNewMessage, onSendMessage }) => (
  <div className="sticky bottom-0 bg-white border-t p-4 flex items-center space-x-2 z-10">
    <button className="text-gray-500 hover:text-blue-600">
      <Paperclip size={24} />
    </button>
    <button className="text-gray-500 hover:text-blue-600">
      <Smile size={24} />
    </button>
    <div className="flex-grow">
      <input 
        type="text" 
        placeholder="Type a message..." 
        className="w-full p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
      />
    </div>
    <button 
      onClick={onSendMessage}
      className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 transition"
    >
      <Send size={20} />
    </button>
  </div>
);

export default ChatInput;