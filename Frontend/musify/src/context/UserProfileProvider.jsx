// src/context/UserProfileContext.js
import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../axios/authInterceptor';

const UserProfileContext = createContext();

const UserProfileProvider = ({ children, username }) => {
  const [userProfile, setUserProfile] = useState({
    username: '',
    userId: null,
    imageUrl: '',
    followersCount: 0,
    followingCount: 0,
    talents: [],
    genres: [],
    followStatus: '',
  });
  const [loading, setLoading] = useState(true);
  const [postCount, setPostCount] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);  // New state for blocked status

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(username ? `/auth/fetch-profile/${username}/` : `/auth/fetch-profile/`);
        if (response.status === 200) {
          console.log('Data from Provider', response.data);

          const blocked = response.data.is_blocked || false;
          setIsBlocked(blocked);

          setUserProfile({
            username: response.data.username,
            userId: response.data.user_id,
            imageUrl: response.data.image_url,
            followersCount: blocked ? 0 : response.data.followers_count,
            followingCount: blocked ? 0 : response.data.following_count,
            talents: blocked ? [] : response.data.talents || [],
            genres: blocked ? [] : response.data.genres || [],
            followStatus: blocked ? '' : response.data.follow_status,
          });
        }
      } catch (error) {
        console.error('Error fetching user profile details', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [username]);

  return (
    <UserProfileContext.Provider value={{ userProfile, setUserProfile, loading, isBlocked, setPostCount, postCount }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export { UserProfileContext, UserProfileProvider };
