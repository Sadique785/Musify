import React, { useState } from 'react'
import ChatLeft from '../../components/Public/Chat/ChatLeft'
import ChatRight from '../../components/Public/Chat/ChatRight'


function ChatPage() {
    const [selectedUser, setSelectedUser] = useState(null)

    return (
      <div className='flex'>
        <div className='w-1/4 p-4 sticky top-20 h-[calc(100vh-8rem)] feed-container'>
          <ChatLeft onUserSelect={setSelectedUser} />
        </div>
        <div className='w-3/4 p-4 feed-container overflow-y-auto h-[calc(100vh-8rem)]'>
          <ChatRight selectedUser={selectedUser} />
        </div>
      </div>
    );
}
  
export default ChatPage;