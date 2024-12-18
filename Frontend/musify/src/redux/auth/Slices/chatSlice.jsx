import { createSlice } from '@reduxjs/toolkit';

const sortRoomsByLastMessage = (rooms) => {
  return [...rooms].sort((a, b) => {
    const timeA = a.last_message?.timestamp ? new Date(a.last_message.timestamp) : new Date(a.created_at);
    const timeB = b.last_message?.timestamp ? new Date(b.last_message.timestamp) : new Date(b.created_at);
    return timeB - timeA;
  });
};

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    chatRooms: [],
    loading: false,
    error: null,
    lastFetchTime: null,
    isWebSocketConnected: false,
    currentOpenChatRoomId: null
  },
  reducers: {
    setInitialChatRooms: (state, action) => {
      state.chatRooms = sortRoomsByLastMessage(action.payload);
      state.loading = false;
      state.error = null;
      state.lastFetchTime = Date.now();
    },
    updateChatRooms: (state, action) => {
      state.chatRooms = sortRoomsByLastMessage(action.payload);
    },
    setWebSocketConnected: (state, action) => {
      state.isWebSocketConnected = action.payload;
    },
    updateSingleRoom: (state, action) => {
      const updatedRoom = action.payload;
      const index = state.chatRooms.findIndex(room => room.id === updatedRoom.id);
      
      if (index !== -1) {
        // Update existing room
        state.chatRooms[index] = updatedRoom;
      } else {
        // Add new room if it doesn't exist
        state.chatRooms.push(updatedRoom);
      }
      
      state.chatRooms = sortRoomsByLastMessage(state.chatRooms);
    },
    updateRoomOrder: (state, action) => {
      const { room_id, last_message_timestamp, last_message } = action.payload;
      const roomIndex = state.chatRooms.findIndex(room => room.id === room_id);
      
      if (roomIndex !== -1) {
        if (last_message) {
          state.chatRooms[roomIndex] = {
            ...state.chatRooms[roomIndex],
            last_message: {
              id: last_message.id,
              content: last_message.content,
              sender_id: last_message.sender_id,
              timestamp: last_message.timestamp
            }
          };
        } else {
          state.chatRooms[roomIndex] = {
            ...state.chatRooms[roomIndex],
            last_message: {
              ...state.chatRooms[roomIndex].last_message,
              timestamp: last_message_timestamp
            }
          };
        }
        
        state.chatRooms = sortRoomsByLastMessage(state.chatRooms);
      }
    },
    setCurrentOpenChatRoom: (state, action) => {
      state.currentOpenChatRoomId = action.payload;
    },
    
    incrementUnreadCount: (state, action) => {
      console.log('Increment Unread Count Called with:', {
        action: action.payload,
        currentOpenChatRoomId: state.currentOpenChatRoomId,
        chatRooms: state.chatRooms
      });
    
      const { room_id, last_message, last_message_timestamp } = action.payload;
      
      // First, check if this is the current open chat room
      console.log('Checking room match:', {
        room_id,
        currentOpenChatRoomId: state.currentOpenChatRoomId,
        isNotCurrentRoom: room_id !== state.currentOpenChatRoomId
      });
    
      // Only proceed if this is NOT the currently open room
      if (room_id !== state.currentOpenChatRoomId) {
        const roomIndex = state.chatRooms.findIndex(room => room.id === room_id);
        
        console.log('Room Index found:', {
          roomIndex,
          roomId: room_id
        });
    
        if (roomIndex !== -1) {
          // Log current unread count
          const currentUnreadCount = state.chatRooms[roomIndex].unread_count || 0;
          
          console.log('Current Unread Count:', {
            currentUnreadCount,
            room: state.chatRooms[roomIndex]
          });
    
          // Unconditionally increment (for testing)
          state.chatRooms[roomIndex] = {
            ...state.chatRooms[roomIndex],
            unread_count: currentUnreadCount + 1
          };
          
          console.log('After increment:', {
            newUnreadCount: state.chatRooms[roomIndex].unread_count,
            room: state.chatRooms[roomIndex]
          });
    
          state.chatRooms = sortRoomsByLastMessage(state.chatRooms);
        }
      }
    },

    resetUnreadCountForRoom: (state, action) => {
      const roomIndex = state.chatRooms.findIndex(room => room.id === action.payload);
      
      if (roomIndex !== -1) {
        state.chatRooms[roomIndex] = {
          ...state.chatRooms[roomIndex],
          unread_count: 0
        };
        
        state.chatRooms = sortRoomsByLastMessage(state.chatRooms);
      }
    }
  },
});

export const { 
  updateChatRooms, 
  setWebSocketConnected, 
  updateSingleRoom,
  updateRoomOrder,
  setInitialChatRooms, 
  resetUnreadCountForRoom,
  setCurrentOpenChatRoom,
  incrementUnreadCount,
} = chatSlice.actions;

export default chatSlice.reducer;