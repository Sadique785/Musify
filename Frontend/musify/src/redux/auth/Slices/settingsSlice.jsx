import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedSettings: 'profile', 
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSelectedSettings: (state, action) => {
      state.selectedSettings = action.payload;
    },
    resetSelectedSettings: (state) => {
        state.selectedSettings = 'profile'; 
      },
  },
});

export const { setSelectedSettings, resetSelectedSettings } = settingsSlice.actions;

export default settingsSlice.reducer;
