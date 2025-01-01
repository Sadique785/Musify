import React from 'react';
import { useLocation } from 'react-router-dom';
import FeedRight from '../Feed/FeedRight';
import LibRight from '../Library/LibRight';
import ProfileRight from '../Profile/ProfileRight';

function RightSection() {
  const location = useLocation();
  const isFeedPage = location.pathname.includes('/feed');
  const isLibraryPage = location.pathname.includes('/library');
  const isProfile = location.pathname.includes('/profile');

  return (
    <div className="w-1/4   p-4 feed-container ">
      {isFeedPage  && <FeedRight /> }
      {isLibraryPage && <FeedRight />}
      {isProfile && <FeedRight />}
    </div>
  );
}

export default RightSection;
