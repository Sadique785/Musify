import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom';
import ProfileCover from '../../components/Public/Profile/ProfileCover';
import LeftSection from '../../components/Public/Sections/LeftSection'
import RightSection from '../../components/Public/Sections/RightSection'
import MiddleSection from '../../components/Public/Sections/MiddleSection'
import { ProfileProvider } from '../../context/ProfileContext';
import { UserProfileProvider } from '../../context/UserProfileProvider';
import axiosInstance from '../../axios/authInterceptor';
import LoadingScreen from '../../components/Loader/LoadingScreen';

function Profile() {
  const {username} = useParams();
  const [isBlocked, setIsBlocked] = useState(false); // State to store the block status
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate()


  useEffect(() => {
    const checkBlockStatus = async () => {
      try {
        console.log('sendiing the block-check', username);
        
        const response = await axiosInstance.get(`/friends/block-status/`, {
          params: { username: username }
        });
        if (response.data.isBlocked) {
          setIsBlocked(true);
          navigate('/error'); // Redirect to an error page if blocked
        }
      } catch (error) {
        console.error("Error checking block status:", error);
        // You can also handle errors here (e.g., network issues)
      } finally {
        setLoading(false);
      }
    };

    checkBlockStatus();
  }, [username]);

  if (loading) {
    return <LoadingScreen/>// Show loading spinner or placeholder if needed
  }

  if (isBlocked) {
    return (
      <div className="error-page">
        <h2>The page you're looking for is not available.</h2>
      </div>
    ); 
  }


  return (

    <UserProfileProvider username={username} >

    <div className='flex flex-col'>
      <ProfileCover />
    <div className='flex' >

    <LeftSection  />
    <MiddleSection  />
    <RightSection />
    </div>
      
    </div>
    </UserProfileProvider>
  );
}

export default Profile