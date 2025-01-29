import React from 'react';
import { User, CheckCheck } from 'lucide-react';

function ChatUserItem({ user, onSelect, isSelected,chatRoom, unreadCount, backendUrl }) {


    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const lastMessage = chatRoom.message?.content || 'No messages yet';
    const lastMessageTime = formatTimestamp(chatRoom.message?.timestamp);
    
    return (
        <div
            className={`
                relative 
                flex 
                items-center 
                p-4 
                cursor-pointer 
                transition-all 
                duration-200 
                border-b 
                border-gray-200 
                hover:bg-gray-50
                ${isSelected ? 'border-l-4 bg-white border-l-[#4b4747]' : ''}
            `}
            onClick={() => onSelect(user)}
        >
            <div className="mr-4">
                {user.image_url ? (
                    <img
                        src={`${backendUrl}${user.image_url}`}
                        alt={user.username}
                        className={`
                            w-14 
                            h-14 
                            rounded-full 
                            object-cover 
                            border-2 
                            ${isSelected ? 'border-[#4b4747]' : 'border-gray-200'}
                            transition-colors 
                            duration-200
                        `}
                    />
                ) : (
                    <div className={`
                        w-14 
                        h-14 
                        rounded-full 
                        flex 
                        items-center 
                        justify-center
                        transition-colors 
                        duration-200
                        border-2
                        ${isSelected ? 'bg-[#aca8a8] border-[#858383]' : 'bg-gray-200 border-gray-200'}
                    `}>
                        <User className={`
                            w-8 
                            h-8 
                            transition-colors 
                            duration-200
                            ${isSelected ? 'text-gray-800' : 'text-gray-600'}
                        `} />
                    </div>
                )}
            </div>
            <div className="flex-grow">
                <div className="flex justify-between items-center">
                    <span className={`
                        font-semibold 
                        text-base 
                        transition-colors 
                        duration-200
                        ${isSelected ? 'text-[#4b4747]' : 'text-gray-800'}
                    `}>
                        {user?.username}
                    </span>
                    <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">{lastMessageTime}</span>
                        {unreadCount > 0 && (
                            <span className="bg-green-500 text-white text-xs rounded-full px-2 py-0.5">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <CheckCheck 
                        className={`
                            w-4 
                            h-4 
                            transition-colors 
                            duration-200
                            ${isSelected ? 'text-[#4b4747]' : 'text-gray-500'}
                        `} 
                        strokeWidth={2} 
                    />
                    <p className={`
                        text-sm 
                        truncate 
                        flex-grow
                        transition-colors 
                        duration-200
                        ${isSelected ? 'text-[#4b4747]' : 'text-gray-600'}
                    `}>
                        {lastMessage || 'No messages yet'}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ChatUserItem;