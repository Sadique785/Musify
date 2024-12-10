import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const getAxiosInstance = () => {
  return import('../../../axios/authInterceptor').then(module => module.default);
};

export const fetchChatRooms = createAsyncThunk(
  'chat/fetchChatRooms',
  async (_, { rejectWithValue }) => {
    try {
      const axiosInstance = await getAxiosInstance();
      const response = await axiosInstance.get('/connection/chat/rooms/');
      console.log('ResponseDataFirst', response)
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

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
    pagination: {
      count: 0,
      next: null,
      previous: null
    }
  },
  reducers: {
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
        state.chatRooms[index] = updatedRoom;
      } else {
        state.chatRooms.push(updatedRoom);
      }
      
      // Sort rooms after update
      state.chatRooms = sortRoomsByLastMessage(state.chatRooms);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatRooms.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChatRooms.fulfilled, (state, action) => {
        // Update pagination info
        state.pagination = {
          count: action.payload.count,
          next: action.payload.next,
          previous: action.payload.previous
        };
        
        // Sort the results array and store in chatRooms
        state.chatRooms = sortRoomsByLastMessage(action.payload.results);
        console.log('Chatrooms', state.chatRooms)
        state.loading = false;
        state.error = null;
        state.lastFetchTime = Date.now();
      })
      .addCase(fetchChatRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { updateChatRooms, setWebSocketConnected, updateSingleRoom } = chatSlice.actions;
export default chatSlice.reducer;