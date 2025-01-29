import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../../axios/authInterceptor';
import toast from 'react-hot-toast';

function ProfileFollowButton({ userId, followStatus, loading }) {
  const [followingStatus, setFollowingStatus] = useState(followStatus);

  // Update `followingStatus` only when `loading` is false and `followStatus` prop changes
  useEffect(() => {
    if (!loading) {
      setFollowingStatus(followStatus);
    }
  }, [loading, followStatus]);

  const handleFollowToggle = async () => {
    if (loading) return;  // Prevent action if loading is still true


    try {
      let response;

      if (followingStatus === 'following') {
        response = await axiosInstance.delete(`/friends/follow/${userId}/`);
        setFollowingStatus('follow');
      } else if (followingStatus === 'follow') {
        response = await axiosInstance.post(`/friends/follow/${userId}/`, {});
        setFollowingStatus('following');
      } else if (followingStatus === 'follow back') {
        response = await axiosInstance.post(`/friends/accept/${userId}/`, {});
        setFollowingStatus('unfollow');
      } else if (followingStatus === 'unfollow') {
        response = await axiosInstance.post(`/friends/unfollow/${userId}/`, {});
        setFollowingStatus('follow back');
      }

      if (response && (response.status === 200 || response.status === 201)) {
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
      console.error('Error following/unfollowing user:', error);
    }
  };

  const getButtonText = () => {
    if (loading) return 'Follow'; // Show "Follow" or a spinner if loading
    switch (followingStatus) {
      case 'following':
        return 'Following';
      case 'follow':
        return 'Follow';
      case 'follow back':
        return 'Follow Back';
      case 'unfollow':
            return 'Unfollow';
      default:
        return 'Follow';
    }
  };

  return (
    <button
      onClick={handleFollowToggle}
      className={`bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center space-x-2${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={loading} // Disable button if loading is true
    >
      {getButtonText()}
    </button>
  );
}

export default ProfileFollowButton;
