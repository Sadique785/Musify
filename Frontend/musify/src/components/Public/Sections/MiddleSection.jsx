import React, { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import LibMid from '../Library/LibMid';
import FeedMid from '../Feed/FeedMid';
import ProfileMid from '../Profile/ProfileMid';

function MiddleSection() {
  const location = useLocation();
  const isFeedPage = location.pathname.includes('/feed');
  const isLibraryPage = location.pathname.includes('/library');
  const isProfile = location.pathname.includes('/profile');


  return (
    <div className="w-full sm:w-2/3 lg:w-2/4 p-4 mid-container bg-white">
      {isFeedPage && <FeedMid />}
      {isLibraryPage && <LibMid />}
      {isProfile && <ProfileMid  />}
    </div>
  );
}

export default MiddleSection;
