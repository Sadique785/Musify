import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import ProfileCover from '../../components/Public/Profile/ProfileCover';
import LeftSection from '../../components/Public/Sections/LeftSection'
import RightSection from '../../components/Public/Sections/RightSection'
import MiddleSection from '../../components/Public/Sections/MiddleSection'
import { ProfileProvider } from '../../context/ProfileContext';


function Profile() {




  return (

    <ProfileProvider>

    <div className='flex flex-col'>
      <ProfileCover />
    <div className='flex' >

    <LeftSection  />
    <MiddleSection  />
    <RightSection />
    </div>
      
    </div>
    </ProfileProvider>
  );
}

export default Profile