import React, { useState, useEffect } from "react";
import toast, { Toaster } from 'react-hot-toast';
import { Navigate, Outlet } from "react-router-dom";
import userVerifier from "../Utils/userVerifier";
import LoadingScreen from "../components/Loader/LoadingScreen";
import UserHeader from "../components/Public/navbars/UserHeader"; // Import the UserHeader component

function UserWrapper({ includeHeader = true }) {
  const { userInfo, loading } = userVerifier(); 
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (loading) return; // Wait for verification to complete

    if (userInfo.redirectToLogin) {
      toast.error("Session expired. Please log in again.", {
        autoClose: 3000, 
        hideProgressBar: false,
        
      });
      setShouldRedirect(true);
    } else if (userInfo.isAuthenticated) {
      setShouldRedirect(false);
    } else if (!userInfo.isAuthenticated && !userInfo.redirectToLogin) {
      toast.warning("Please log in to access this page.", {
        autoClose: 3000,
        hideProgressBar: false,
      });
      setShouldRedirect(true); 
    }
  }, [userInfo, loading]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (shouldRedirect) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      {includeHeader && <UserHeader />} {/* Conditionally include UserHeader */}
      <div className="content-wrapper"> {/* Optional: Wrap the content for styling */}
        <Outlet /> {/* This renders the child routes */}
      </div>
    </>
  );
}

export default UserWrapper;
