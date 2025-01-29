import React from 'react';
import { useSelector } from 'react-redux';
import UserHeader from '../../components/Public/navbars/UserHeader'; 
import LeftSection from '../../components/Public/Sections/LeftSection'
import RightSection from '../../components/Public/Sections/RightSection'
import MiddleSection from '../../components/Public/Sections/MiddleSection'
import MobileContentSelector from '../../components/Public/Feed/utils/MobileContentSelector';

function Feed() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  return (
    <div className="flex flex-col">
      {/* Mobile Content Selector with sticky positioning */}
      <div className="sticky top-[72px] z-30 md:hidden bg-white"> 
        <MobileContentSelector />
      </div>

      {/* Main content */}
      <div className="flex">
        <LeftSection />
        <MiddleSection />
        <RightSection />
      </div>
    </div>
  );
}

export default Feed;