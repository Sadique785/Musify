
import React from 'react'
import { User, MessageCircle } from 'lucide-react'



function ChatRight({ selectedUser }) {
    if (!selectedUser) {
        return (
            <div className="h-full flex items-center justify-center text-gray-500">
                <MessageCircle size={48} />
                <p className="ml-2 text-xl">Select a chat to start messaging</p>
            </div>
        )
    }

    return (
        <div>
            <div className="border-b pb-3 mb-4 flex items-center">
                {selectedUser.profileImage ? (
                    <img 
                        src={selectedUser.profileImage} 
                        alt={selectedUser.username} 
                        className="w-10 h-10 rounded-full mr-3"
                    />
                ) : (
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                        <User className="text-gray-600" />
                    </div>
                )}
                <h2 className="text-xl font-bold">{selectedUser.username}</h2>
            </div>
            {/* Chat messages would go here */}
            <div>
                <p>Chat messages with {selectedUser.username}</p>
            </div>
        </div>
    )
}

export default ChatRight;