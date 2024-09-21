import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { decodeToken, isTokenExpired, refreshAccessToken, handleLogout } from './tokenUtils';
import { loginSuccess, logout } from '../redux/auth/Slices/authSlice';

function adminVerifier() {
  const dispatch = useDispatch();
  const accessToken = useSelector((state) => state.auth.accessToken);
  const refreshToken = useSelector((state) => state.auth.refreshToken);
  const isSuperuser = useSelector((state) => state.auth.isSuperuser); // Check if user is superuser

  const [adminInfo, setAdminInfo] = useState({ name: null, isAuthenticated: false, redirectToLogin: false });
  const [loading, setLoading] = useState(true);

  const handleLogoutAndCleanup = async () => {
    try {
      await handleLogout();
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setAdminInfo({ name: null, isAuthenticated: false, redirectToLogin: true });
      setLoading(false);
    }
  };

  useEffect(() => {
    const verifyAdmin = async () => {
      console.log(accessToken);
      console.log(refreshToken);
      console.log(isSuperuser);
      
      if (!refreshToken || !isSuperuser) {
          console.log('here is the issue');
          
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
        setAdminInfo({ name: decodedAccessToken.username, isAuthenticated: true, redirectToLogin: false });
        setLoading(false);
        return;
      }

      try {
        const newAccessToken = await refreshAccessToken(refreshToken);
        if (newAccessToken) {
          const newDecodedAccessToken = decodeToken(newAccessToken);
          dispatch(
            loginSuccess({
              user: { name: newDecodedAccessToken.username, isSuperuser: true }, // Ensure superuser
              accessToken: newAccessToken,
              refreshToken: refreshToken,
            })
          );
          setAdminInfo({ name: newDecodedAccessToken.username, isAuthenticated: true, redirectToLogin: false });
        }
      } catch (error) {
        console.error('Error refreshing token:', error);
        await handleLogoutAndCleanup();
      }

      setLoading(false);
    };

    verifyAdmin();
  }, [accessToken, refreshToken, isSuperuser, dispatch]);

  return { adminInfo, loading };
}

export default adminVerifier;
