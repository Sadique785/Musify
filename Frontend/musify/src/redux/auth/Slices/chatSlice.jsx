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
    currentOpenChatRoomId: null,
    // Use objects instead of Set for processed messages
    processedMessages: {
      byId: {},  // Store processed message IDs as object keys
      byRoomTimestamp: {}  // Store last processed timestamp per room
    }
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
        currentState: state
      });

      const { room_id, last_message, last_message_timestamp } = action.payload;
      
      // Skip if this is the current open chat room
      if (room_id === state.currentOpenChatRoomId) {
        return;
      }

      const roomIndex = state.chatRooms.findIndex(room => room.id === room_id);
      if (roomIndex === -1) return;

      let shouldIncrement = false;

      // If we have a last_message, use its ID for deduplication
      if (last_message?.id) {
        // Check if we've already processed this message
        if (!state.processedMessages.byId[last_message.id]) {
          // Mark the message as processed
          state.processedMessages.byId[last_message.id] = true;
          shouldIncrement = true;
        }
      } else if (last_message_timestamp) {
        // Use timestamp-based deduplication
        const lastProcessedTime = state.processedMessages.byRoomTimestamp[room_id];
        
        if (!lastProcessedTime || 
            new Date(lastProcessedTime).getTime() !== new Date(last_message_timestamp).getTime()) {
          // Update the last processed timestamp for this room
          state.processedMessages.byRoomTimestamp[room_id] = last_message_timestamp;
          shouldIncrement = true;
        }
      }

      // Only increment if we haven't processed this message before
      if (shouldIncrement) {
        console.log('Incrementing unread count for room:', room_id);
        const currentUnreadCount = state.chatRooms[roomIndex].unread_count || 0;
        state.chatRooms[roomIndex] = {
          ...state.chatRooms[roomIndex],
          unread_count: currentUnreadCount + 1
        };

        state.chatRooms = sortRoomsByLastMessage(state.chatRooms);
      } else {
        console.log('Skipping increment - message already processed');
      }
    },

    cleanupProcessedMessages: (state) => {
      // Get all message IDs
      const messageIds = Object.keys(state.processedMessages.byId);
      
      // Keep only the last 1000 message IDs
      if (messageIds.length > 1000) {
        const newMessageIds = messageIds.slice(-1000);
        const newById = {};
        
        newMessageIds.forEach(id => {
          newById[id] = true;
        });
        
        state.processedMessages.byId = newById;
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
  cleanupProcessedMessages,
} = chatSlice.actions;

export default chatSlice.reducer;