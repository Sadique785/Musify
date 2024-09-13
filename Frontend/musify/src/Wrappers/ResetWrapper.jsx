import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { resetSelectedSettings } from '../redux/auth/Slices/settingsSlice';
import { resetSelectedContent } from '../redux/auth/Slices/contentSlice';


const ResetWrapper = ({ children }) => {
    const dispatch = useDispatch();
    const location = useLocation();
  
    useEffect(() => {
      if (!location.pathname.includes('/settings')) {
        dispatch(resetSelectedSettings());
      }

      if (!location.pathname.includes('/feed')) {
        dispatch(resetSelectedContent());
      }

    }, [location, dispatch]);   
    return <>{children}</>; 
  };
  
  export default ResetWrapper;