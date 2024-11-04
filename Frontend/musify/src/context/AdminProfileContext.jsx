// src/context/AdminProfileContext.js
import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../axios/adminInterceptor';

const AdminProfileContext = createContext();

const AdminProfileProvider = ({ children }) => {
  const [adminProfile, setAdminProfile] = useState({
    imageUrl: '',
  });

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const response = await axiosInstance.get('/admin-side/fetch-profile-image/');
        if (response.status === 200) {
          setAdminProfile({
            imageUrl: response.data.profileImage,
          });
        } else {
          setAdminProfile({
            imageUrl: null,
          });
        }
      } catch (error) {
        console.error('Error fetching admin profile image', error);
      }
    };

    fetchAdminProfile();
  }, []);

  return (
    <AdminProfileContext.Provider value={{ adminProfile, setAdminProfile }}>
      {children}
    </AdminProfileContext.Provider>
  );
};

export { AdminProfileContext, AdminProfileProvider };
