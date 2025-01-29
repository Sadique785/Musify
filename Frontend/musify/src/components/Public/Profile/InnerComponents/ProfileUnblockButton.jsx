// src/components/Profile/InnerComponents/ProfileUnblockButton.js

import React from 'react';
import { FaTimes } from 'react-icons/fa';
import axiosInstance from '../../../../axios/authInterceptor';
import toast from 'react-hot-toast';

function ProfileUnblockButton({ userId, onUnblock }) {
  const handleUnblock = async () => {
    try {
      const response = await axiosInstance.post(`/auth/block-user/`, {
        user_id: userId,
        action:'unblock'
     });
      if (response.status === 200) {
        toast.success("User unblocked successfully!");
        onUnblock();
        window.location.reload();  
      }
    } catch (error) {
      toast.error("Failed to unblock user.");
    }
  };

  return (
    <button
      onClick={handleUnblock}
      className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-700"
    >
      <span>Unblock</span>
    </button>
  );
  
  
}

export default ProfileUnblockButton;
