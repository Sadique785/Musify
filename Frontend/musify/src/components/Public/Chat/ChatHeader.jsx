import React from 'react';
import { User } from 'lucide-react';

const ChatHeader = ({ selectedUser, onProfileClick, backendUrl }) => (
  <div className="sticky top-0 bg-white shadow-sm border-b p-3 flex items-center justify-between z-10 h-16">
  <div className="flex items-center space-x-2">
    <div 
      className="cursor-pointer hover:opacity-80 transition-opacity duration-200"
      onClick={onProfileClick}
    >
      {selectedUser.image_url ? (
        <img
          src={`${backendUrl}${selectedUser.image_url}`}
          alt={selectedUser.username}
          className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
        />
      ) : (
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
          <User className="text-gray-600 w-6 h-6" />
        </div>
      )}
    </div>
    <div>
      <h2 
        className="text-lg font-semibold text-gray-800 cursor-pointer hover:text-blue-600 transition"
        onClick={onProfileClick}
      >
        {selectedUser.username || 'Alex Johnson'}
      </h2>
      <p className="text-xs text-gray-500">Active now</p>
    </div>
  </div>
</div>
);

export default ChatHeader;