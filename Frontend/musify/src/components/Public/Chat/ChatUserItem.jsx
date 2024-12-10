import React from 'react';
import { User, CheckCheck  } from 'lucide-react';

// Chat User Item Component
function ChatUserItem({ user, onSelect, isSelected, lastMessage, unreadCount, backendUrl }) {

    return (
        <div
            className={`
                relative 
                flex 
                items-center 
                p-4 
                cursor-pointer 
                transition-colors 
                duration-200 
                border-b 
                border-gray-200 
                hover:bg-gray-50
                ${isSelected ? 'bg-[#f0f2f5]' : ''}
            `}
            onClick={() => onSelect(user)}
        >
            <div className="mr-4">
                {user.image_url ? (
                    <img
                        src={`${backendUrl}${user.image_url}`}
                        alt={user.username}
                        className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
                    />
                ) : (
                    <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="text-gray-600 w-8 h-8" />
                    </div>
                )}
            </div>
            <div className="flex-grow">
                <div className="flex justify-between items-center">
                    <span className="font-semibold text-base text-gray-800">{user?.username}</span>
                    <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">{user.lastMessageTime}</span>
                        {unreadCount > 0 && (
                            <span className="bg-green-500 text-white text-xs rounded-full px-2 py-0.5">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <CheckCheck 
                        className="w-4 h-4 text-gray-500 opacity-70" 
                        strokeWidth={2} 
                    />
                    <p className="text-sm text-gray-600 truncate flex-grow">
                        {lastMessage || 'No messages yet'}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ChatUserItem;
