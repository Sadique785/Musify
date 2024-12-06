import React, { useState } from 'react';
import ChatUserItem from './ChatUserItem';

// Demo data for chat users
const demoUsers = [
    {
        id: 1,
        username: 'johndoe',
        profileImage: null,
        lastMessage: 'Hey, how are you doing?',
        lastMessageTime: '2m',
    },
    {
        id: 2,
        username: 'sarasmith',
        profileImage: null,
        lastMessage: 'Sounds great!',
        lastMessageTime: '15m',
    },
    {
        id: 3,
        username: 'mikebrown',
        profileImage: null,
        lastMessage: 'See you tomorrow',
        lastMessageTime: '1h',
    },
];

// Chat Left Component
function ChatLeft() {
    const [selectedUser, setSelectedUser] = useState(null);

    const handleUserSelect = (user) => {
        setSelectedUser(user);
    };

    return (
        <div className="h-full border-r">
            <div className="py-4 px-6 border-b">
                <h2 className="text-2xl font-bold text-gray-800">Chats</h2>
            </div>
            <div className="p-4 space-y-2">
                {demoUsers.map((user) => (
                    <ChatUserItem
                        key={user.id}
                        user={user}
                        onSelect={handleUserSelect}
                        isSelected={selectedUser?.id === user.id}
                    />
                ))}
            </div>
        </div>
    );
}

export default ChatLeft;
