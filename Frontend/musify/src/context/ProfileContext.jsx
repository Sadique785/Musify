// src/context/ProfileContext.js
import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../axios/authInterceptor';

const ProfileContext = createContext();

const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState({
    userId:null,
    username: '',
    imageUrl: '',
    email:'',
  });
  

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get('/auth/fetch-profile/');
        if (response.status === 200) {
          setProfile({
            userId: response.data.user_id,
            username: response.data.username,
            imageUrl: response.data.image_url,
            email:response.data.email,
          });
        }
      } catch (error) {
        console.error('Error fetching profile details', error);
      }
    };

    fetchProfile();
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export { ProfileContext, ProfileProvider };
