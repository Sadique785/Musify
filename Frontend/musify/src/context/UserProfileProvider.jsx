// src/context/UserProfileContext.js
import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../axios/authInterceptor';

const UserProfileContext = createContext();

const UserProfileProvider = ({ children, username }) => {
  const [userProfile, setUserProfile] = useState({
    username: '',
    userId:null,
    imageUrl: '',
    followersCount: 0,
    followingCount: 0,
    talents: [],
    genres: [],
    followStatus:'',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(username ? `/auth/fetch-profile/${username}/` : `/auth/fetch-profile/`);
        if (response.status === 200) {
            console.log('data from Provider 2',response.data)
          setUserProfile({
            username: response.data.username,
            userId:response.data.user_id,
            imageUrl: response.data.image_url,
            followersCount: response.data.followers_count,
            followingCount: response.data.following_count,
            talents: response.data.talents || [],
            genres: response.data.genres || [],
            followStatus:response.data.follow_status,
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
    <UserProfileContext.Provider value={{ userProfile, setUserProfile, loading }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export { UserProfileContext, UserProfileProvider };
