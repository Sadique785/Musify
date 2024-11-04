import { createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie'


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
      state.csrfToken =  Cookies.get('csrftoken') || state.csrfToken;
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
    updateUsername: (state, action) => {
      if(state.user){
        state.user.username = action.payload.username
      }
    }
  },
});

export const { loginSuccess, logout, setAdminStatus, updateUsername } = authSlice.actions;
export default authSlice.reducer;
