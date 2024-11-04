import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom';
import ProfileCover from '../../components/Public/Profile/ProfileCover';
import LeftSection from '../../components/Public/Sections/LeftSection'
import RightSection from '../../components/Public/Sections/RightSection'
import MiddleSection from '../../components/Public/Sections/MiddleSection'
import { ProfileProvider } from '../../context/ProfileContext';
import { UserProfileProvider } from '../../context/UserProfileProvider';


function Profile() {
  const {username} = useParams();




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