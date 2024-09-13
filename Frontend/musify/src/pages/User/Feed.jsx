import React from 'react';
import { useSelector } from 'react-redux';
import UserHeader from '../../components/Public/navbars/UserHeader'; 
import LeftSection from '../../components/Public/Sections/LeftSection'
import RightSection from '../../components/Public/Sections/RightSection'
import MiddleSection from '../../components/Public/Sections/MiddleSection'

function Feed() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  return (
    <div>
      <div className="flex  ">
        <LeftSection />
        <MiddleSection />
        <RightSection />
      </div>

    </div>

    
  );
}

export default Feed;
