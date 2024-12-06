import React from 'react';
import { User } from 'lucide-react';

// Chat User Item Component
function ChatUserItem({ user, onSelect, isSelected }) {
    return (
        <div
            className={`flex items-center p-4 cursor-pointer rounded-lg 
                ${isSelected ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            onClick={() => onSelect(user)}
        >
            <div className="mr-4">
                {user.profileImage ? (
                    <img
                        src={user.profileImage}
                        alt={user.username}
                        className="w-12 h-12 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="text-gray-600" />
                    </div>
                )}
            </div>
            <div className="flex-grow">
                <div className="flex justify-between items-center">
                    <span className="font-bold text-base">{user.username}</span>
                    <span className="text-xs text-gray-500">{user.lastMessageTime}</span>
                </div>
                <p className="text-sm text-gray-600 truncate">{user.lastMessage}</p>
            </div>
        </div>
    );
}

export default ChatUserItem;
