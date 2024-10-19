import React, { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import FeedLeft from '../Feed/FeedLeft';
import LibLeft from '../Library/LibLeft';
import ProfileLeft from '../Profile/ProfileLeft';

function LeftSection({ type }) {

  const location = useLocation();
  const isFeedPage = location.pathname.includes('/feed')
  const isLibPage = location.pathname.includes('/library');
  const isProfile = location.pathname.includes('/profile');


  return (
    <div className='w-1/4  p-4 feed-container  text-black'>

      {isFeedPage && <FeedLeft />}
      {isLibPage && <LibLeft />}
      {isProfile && <ProfileLeft  />}

      
    </div>
  );
}

export default LeftSection;
