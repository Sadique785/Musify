import React from 'react'
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { jwtDecode } from "jwt-decode";
import { loginSuccess, logout } from '../redux/auth/Slices/authSlice'
import  axiosInstance from '../axios/axios'
import { persistor } from '../redux/auth/userStore';
import { decodeToken, isTokenExpired, refreshAccessToken, handleLogout } from '../Utils/tokenUtils';


function userVerifier() {
  const dispatch = useDispatch();
  const accessToken = useSelector((state) => state.auth.accessToken);
  const refreshToken = useSelector((state) => state.auth.refreshToken);


  const [userInfo, setUserInfo] = useState({ name: null, isAuthenticated: false, redirectToLogin: false });
  const [loading, setLoading] = useState(true);

  const handleLogoutAndCleanup = async () => {
    try {
      await handleLogout();
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setUserInfo({ name: null, isAuthenticated: false, redirectToLogin: true });
      setLoading(false);
    }
  };




    useEffect(()=>{
        const verifyUser = async () => {
          if (!refreshToken) {
            await handleLogoutAndCleanup();
            return;
          }
    
          let decodedRefreshToken;
          
    
          try {
            decodedRefreshToken = decodeToken(refreshToken);
          } catch (error) {
            console.log("Error decoding refresh token:", error);
            await handleLogoutAndCleanup();
            return;
          }
    
          if (isTokenExpired(refreshToken)) {
            console.log("Refresh token has expired.");
            await handleLogoutAndCleanup();
            return;
          }


      if (!accessToken) {
        await handleLogoutAndCleanup();
        return;
      }
      
      let decodedAccessToken;
          

      try {
        decodedAccessToken = decodeToken(accessToken);
      } catch (error) {
        console.log("Error decoding access token:", error);
        await handleLogoutAndCleanup();
        return;
      }

      if (!isTokenExpired(accessToken)) {
        setUserInfo({ name: decodedAccessToken.username, isAuthenticated: true, redirectToLogin: false });
        setLoading(false);
        return;
      }

        


        try {
          const newAccessToken = await refreshAccessToken(refreshToken);
          if (newAccessToken) {
            const newDecodedAccessToken = decodeToken(newAccessToken);
          
          
            dispatch(
              loginSuccess({
                user: { name: newDecodedAccessToken.username },
                accessToken: newAccessToken,
                refreshToken: refreshToken, 
              })
            );

            setUserInfo({ name: newDecodedAccessToken.username, isAuthenticated: true, redirectToLogin: false });
          }
        } catch (error) {
          console.error('Error refreshing token:', error);
          
          await handleLogoutAndCleanup();

        }

        setLoading(false);
         
        };

        verifyUser();
    },[accessToken, refreshToken, dispatch])


    return { userInfo, loading };

}

export default userVerifier;