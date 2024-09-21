import React, { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import toast from 'react-hot-toast';
import adminVerifier from "../Utils/adminVerifier"; // Your adminVerifier function
import LoadingScreen from "../components/Loader/LoadingScreen"; 
import AdminHeader from "../components/Public/navbars/AdminHeader.jsx"; // Your AdminHeader

function AdminWrapper({ includeHeader = true }) {
  const { adminInfo, loading } = adminVerifier();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (loading) return; // Wait for verification to complete

    if (adminInfo.redirectToLogin) {
      toast.error("Unauthorized access. Please log in as an admin.", {
        autoClose: 3000,
        hideProgressBar: false,
      });
      setShouldRedirect(true);
    } else if (adminInfo.isAuthenticated) {
      setShouldRedirect(false);
    }
  }, [adminInfo, loading]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (shouldRedirect) {
    return <Navigate to="/admin/login" />;
  }

  return (
    <>
   {/* Conditionally include AdminHeader */}
      <div className="admin-content-wrapper"> {/* Optional: Wrap the content for styling */}
        <Outlet /> {/* This renders the child routes */}
      </div>
    </>
  );
}

export default AdminWrapper;
