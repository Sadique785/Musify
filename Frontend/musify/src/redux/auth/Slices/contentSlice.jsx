import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedContent: 'trending', 
};

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    setSelectedContent: (state, action) => {
      state.selectedContent = action.payload;
    },
    resetSelectedContent: (state) => {
      state.selectedContent = 'trending'; 
    },
  },
});

export const { setSelectedContent, resetSelectedContent } = contentSlice.actions;


export default contentSlice.reducer;
