import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  csrfToken: null,
  isAuthenticated: false,
  isSuperuser: false,  
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.csrfToken = action.payload.csrfToken || state.csrfToken;
      state.isAuthenticated = true;
      state.isSuperuser = action.payload.user.isSuperuser || false;  
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.csrfToken = null;
      state.isAuthenticated = false;
      state.isSuperuser = false; 
    },
    setAdminStatus: (state, action) => {
      state.isSuperuser = action.payload.isSuperuser;  // Dispatch to change admin status manually
    },
  },
});

export const { loginSuccess, logout, setAdminStatus } = authSlice.actions;
export default authSlice.reducer;
